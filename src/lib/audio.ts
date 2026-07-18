import { interaction } from "@/components/three/InteractionTracker";

/**
 * Motore audio delle interazioni (opt-in, vedi AudioToggle).
 *
 * Modulo SOLO client, caricato lazy: viene importato dinamicamente da
 * `src/components/ui/AudioToggle.tsx` esclusivamente quando l'utente attiva
 * l'audio — chi non lo attiva non scarica né esegue un byte di questo codice.
 *
 * Design del suono (architecture.md [2026-07-18]):
 * - ZERO asset e ZERO dipendenze: tutto sintetizzato con la WebAudio API
 *   nativa (oscillatori sinusoidali + envelope di gain + lowpass condiviso).
 *   Tone.js sarebbe ~30 KB gzip per due blip: sproporzionato.
 * - Estetica coerente con la scena: suoni soft/eterei (ping con quinta e
 *   shimmer in battimento lento), volumi bassi (picchi ≤ 0.06 pre-master).
 * - Nessun suono continuo né legato allo scroll: solo eventi discreti
 *   (pulse del blob via `interaction.onPulse`, chime di conferma del toggle).
 *   Niente lavoro per frame: nessun collegamento coi useFrame della scena.
 * - Policy autoplay: l'AudioContext è creato/ripreso SOLO dentro `enable()`,
 *   che il toggle chiama a valle di un gesto utente (click sul toggle, o
 *   primo pointerup/click/keydown — Esc escluso — quando la preferenza è
 *   ripristinata da localStorage). Difesa in profondità: `ping()` e
 *   `chime()` girano dentro handler di gesto, quindi se il context non è
 *   "running" (suspended, o "interrupted" non-standard di iOS) ritentano
 *   `resume()` prima di suonare → auto-riparazione al gesto successivo.
 * - Cleanup: `disable()` stacca il hook dal tracker e CHIUDE il context
 *   (rilascio del thread audio dell'OS); una riattivazione ne crea uno nuovo.
 */

type EnableOptions = {
  /** Suona il chime di conferma (solo per l'attivazione esplicita dal toggle). */
  chime?: boolean;
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private out: GainNode | null = null;
  private lastPing = 0;

  /**
   * Crea (o riprende) l'AudioContext e aggancia il ping al pulse del blob.
   * DEVE essere chiamata a valle di un gesto utente (policy autoplay).
   * Idempotente: chiamate ripetute non creano context duplicati.
   */
  enable({ chime = false }: EnableOptions = {}): void {
    if (typeof window === "undefined" || typeof AudioContext === "undefined") {
      return;
    }
    if (!this.ctx) {
      const ctx = new AudioContext();
      // Bus master: gain complessivo basso + lowpass dolce condiviso che
      // ammorbidisce ogni voce (niente transienti aspri).
      const out = ctx.createGain();
      out.gain.value = 0.5;
      const softener = ctx.createBiquadFilter();
      softener.type = "lowpass";
      softener.frequency.value = 2400;
      softener.Q.value = 0.4;
      out.connect(softener);
      softener.connect(ctx.destination);
      this.ctx = ctx;
      this.out = out;
    }
    if (this.ctx.state === "suspended") {
      void this.ctx.resume();
    }
    // Hook evento-discreto: il tracker lo invoca solo al tap/click valido
    // (mai in useFrame). Con audio spento resta null → zero costo.
    interaction.onPulse = () => this.ping();
    if (chime) this.chime();
  }

  /**
   * Sgancia il hook e chiude il context. Sicura anche se mai abilitato.
   * La disattivazione è silenziosa by design (il context sta chiudendo).
   */
  disable(): void {
    interaction.onPulse = null;
    const ctx = this.ctx;
    this.ctx = null;
    this.out = null;
    this.lastPing = 0;
    if (ctx && ctx.state !== "closed") {
      void ctx.close();
    }
  }

  /**
   * Difesa in profondità autoplay: ping/chime girano dentro handler di
   * gesto utente, quindi se il context non sta girando (suspended, o
   * "interrupted" non-standard di iOS — per questo il confronto è sullo
   * stato "running" e non su "suspended") un retry di resume() qui è
   * legittimo e auto-ripara il caso in cui l'enable() iniziale non bastò.
   */
  private resumeIfNeeded(ctx: AudioContext): void {
    if ((ctx.state as string) !== "running") {
      void ctx.resume();
    }
  }

  /** Ping morbido ed etereo in risposta al pulse del blob. */
  private ping(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.resumeIfNeeded(ctx);
    // Piccolo throttle anti-spam su click ripetuti: le voci sono economiche,
    // ma sovrapporne decine alza il volume percepito oltre il previsto.
    // Clock: performance.now() e NON ctx.currentTime — da suspended il clock
    // audio non avanza e il throttle soffocherebbe anche il retry di resume.
    const wall = performance.now();
    if (wall - this.lastPing < 90) return;
    this.lastPing = wall;
    const now = ctx.currentTime;
    this.tone(523.25, now, 1.3, 0.055); // C5, fondamentale
    this.tone(526.5, now, 1.3, 0.028); // battimento lento ~3 Hz → shimmer
    this.tone(784.0, now + 0.04, 0.95, 0.02); // G5, quinta in coda
  }

  /** Chime di conferma all'attivazione del toggle (due note brevi). */
  private chime(): void {
    const ctx = this.ctx;
    if (!ctx) return;
    this.resumeIfNeeded(ctx);
    const now = ctx.currentTime;
    this.tone(659.25, now, 0.4, 0.04); // E5
    this.tone(987.77, now + 0.09, 0.55, 0.032); // B5
  }

  /** Voce elementare: sinusoide con attack 20 ms e decay esponenziale. */
  private tone(freq: number, at: number, dur: number, peak: number): void {
    const ctx = this.ctx;
    const out = this.out;
    if (!ctx || !out) return;
    const osc = ctx.createOscillator();
    osc.type = "sine";
    osc.frequency.value = freq;
    const env = ctx.createGain();
    env.gain.setValueAtTime(0, at);
    env.gain.linearRampToValueAtTime(peak, at + 0.02);
    env.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    osc.connect(env).connect(out);
    osc.start(at);
    osc.stop(at + dur + 0.05);
    // Cleanup dei nodi a fine nota (il GC non raccoglie nodi connessi).
    osc.onended = () => {
      osc.disconnect();
      env.disconnect();
    };
  }
}

/** Singleton: un solo AudioContext per pagina. */
export const audioEngine = new AudioEngine();
