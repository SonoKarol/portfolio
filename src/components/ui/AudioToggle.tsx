"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";

/**
 * Toggle degli effetti audio (seconda isola client della navbar, accanto a
 * ThemeToggle e con lo stesso pattern di stile/focus/tap-target).
 *
 * Opt-in esplicito: default SEMPRE off; l'attivazione è una scelta
 * dell'utente, persistita in localStorage("audio") con whitelist "on"/"off"
 * (stesso pattern del tema, try/catch su storage negato). Stato letto via
 * useSyncExternalStore da uno store a scope di modulo (stesso pattern di
 * ThemeToggle: server snapshot `false` = HTML SSR → zero mismatch di
 * idratazione e zero setState sincroni in effect; per chi aveva salvato "on"
 * `aria-pressed` e icona si aggiornano subito dopo l'idratazione).
 *
 * Differenze deliberate rispetto a ThemeToggle:
 * - niente script anti-FOUC né sync fra tab: l'audio non ha resa visiva da
 *   proteggere dal flash, e accendere l'audio in un'altra tab da remoto
 *   sarebbe una sorpresa sgradita, non un servizio;
 * - lazy totale: `src/lib/audio.ts` (WebAudio, zero asset e zero dipendenze)
 *   è importato dinamicamente SOLO ad audio attivo → chi non lo attiva non
 *   paga né download né esecuzione.
 *
 * Policy autoplay: mai audio senza gesto utente. Al click sul toggle il
 * gesto c'è (l'import dinamico risolve in ms, l'attivazione utente resta
 * valida); con preferenza "on" ripristinata da localStorage l'AudioContext
 * NON nasce al mount ma al primo pointerup/keydown sulla pagina (listener
 * one-shot armati dall'effect). Si usa pointerup e NON pointerdown perché
 * per la spec HTML "user activation" pointerdown conta solo con
 * pointerType mouse: su touch valgono pointerup/touchend/click — con
 * pointerdown un utente mobile resterebbe con il context suspended per
 * sempre. Escape è escluso dai keydown attivanti (sempre da spec). Come
 * difesa in profondità, ping()/chime() in audio.ts ritentano resume() se
 * il context non è running (auto-riparazione al gesto successivo).
 *
 * prefers-reduced-motion: nessun legame — l'audio non è motion ed è già un
 * opt-in esplicito e indipendente; con reduced-motion la scena 3D non monta,
 * quindi il ping del blob semplicemente non ha occasioni di suonare (resta
 * il solo chime di conferma del toggle). Motivazione in architecture.md.
 */

const STORAGE_KEY = "audio";

type AudioModule = typeof import("@/lib/audio");
type AudioEngine = AudioModule["audioEngine"];

// ─── Store della preferenza (scope di modulo, un solo toggle per pagina) ────

let audioOn: boolean | null = null; // null = localStorage non ancora letto
const listeners = new Set<() => void>();

function subscribe(onStoreChange: () => void): () => void {
  listeners.add(onStoreChange);
  return () => {
    listeners.delete(onStoreChange);
  };
}

function getSnapshot(): boolean {
  if (audioOn === null) {
    // Lettura pigra e cacheata: whitelist, solo "on" riattiva.
    try {
      audioOn = window.localStorage.getItem(STORAGE_KEY) === "on";
    } catch {
      audioOn = false; // storage negato → default (off)
    }
  }
  return audioOn;
}

function getServerSnapshot(): boolean {
  return false; // default off: coincide con l'HTML SSR
}

function setAudioOn(next: boolean): void {
  audioOn = next;
  try {
    // Si salva anche l'"off" esplicito (stesso razionale del tema).
    window.localStorage.setItem(STORAGE_KEY, next ? "on" : "off");
  } catch {
    // La scelta vale comunque per la sessione corrente.
  }
  listeners.forEach((notify) => notify());
}

// ─── Componente ─────────────────────────────────────────────────────────────

export function AudioToggle() {
  const enabled = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const engineRef = useRef<AudioEngine | null>(null);
  const mountedRef = useRef(false);

  // Ad audio attivo ma motore non ancora creato (preferenza ripristinata da
  // localStorage), arma listener one-shot sul primo gesto (policy autoplay).
  useEffect(() => {
    if (!enabled || engineRef.current) return;
    let cancelled = false;
    const disarm = () => {
      window.removeEventListener("pointerup", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
    };
    const onFirstGesture = (e: Event) => {
      // La spec esclude Esc dai tasti che concedono l'attivazione utente:
      // ignora SENZA disarmare, il prossimo gesto valido riproverà.
      if (e instanceof KeyboardEvent && e.key === "Escape") return;
      disarm();
      void import("@/lib/audio").then(({ audioEngine }) => {
        // Smontati, o disattivato mentre l'import era in volo.
        if (cancelled || !getSnapshot()) return;
        engineRef.current = audioEngine;
        audioEngine.enable(); // senza chime: non è un'attivazione esplicita
      });
    };
    // pointerup (non pointerdown!) perché su touch solo pointerup/click
    // concedono l'attivazione utente — vedi commento in testa al file.
    window.addEventListener("pointerup", onFirstGesture, { passive: true });
    window.addEventListener("keydown", onFirstGesture);
    return () => {
      cancelled = true;
      disarm();
    };
  }, [enabled]);

  // Cleanup allo smontaggio: chiude l'AudioContext se era stato creato.
  // mountedRef copre anche la race import-in-volo + smontaggio nel toggle
  // qui sotto (senza flag l'enable ritardato creerebbe un context orfano).
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      engineRef.current?.disable();
      engineRef.current = null;
    };
  }, []);

  const toggle = (): void => {
    const next = !getSnapshot();
    setAudioOn(next);
    if (next) {
      void import("@/lib/audio").then(({ audioEngine }) => {
        // Smontati, o disattivato prima dell'arrivo dell'import.
        if (!mountedRef.current || !getSnapshot()) return;
        engineRef.current = audioEngine;
        // Gesto utente appena avvenuto → il context può partire; il chime
        // di conferma è anche il feedback sonoro del toggle stesso.
        audioEngine.enable({ chime: true });
      });
    } else {
      engineRef.current?.disable();
      engineRef.current = null;
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={enabled}
      aria-label="Effetti audio"
      className="tap-target inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
    >
      {/* Altoparlante; con audio attivo mostra le onde, spento la croce. */}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M11 5.5 7 9H4v6h3l4 3.5v-13Z" />
        {enabled ? (
          <path d="M14.5 9.3a4 4 0 0 1 0 5.4M17 6.8a7.5 7.5 0 0 1 0 10.4" />
        ) : (
          <path d="M15 9.5l5 5m0-5-5 5" />
        )}
      </svg>
    </button>
  );
}
