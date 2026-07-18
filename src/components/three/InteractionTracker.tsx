"use client";

import { useEffect } from "react";

/**
 * Stato di interazione condiviso tra DOM e scena 3D.
 *
 * Oggetto mutabile a scope di modulo (stesso pattern degli uniforms dei
 * componenti singleton): i listener DOM scrivono, i callback `useFrame`
 * leggono. Zero setState per frame, zero re-render React durante lo scroll.
 */
export const interaction = {
  /** Progresso di uscita dell'hero: 0 = pienamente visibile, 1 = fuori viewport. */
  scroll: 0,
  /**
   * Impulso di distorsione innescato da tap/click vicino al centro; decade
   * esponenzialmente (unico writer del decay: HeroObject in useFrame).
   */
  pulse: 0,
  /** true su dispositivi con puntatore "coarse" (touch): niente parallasse da mouse. */
  coarse: false,
  /**
   * Hook audio opzionale (src/lib/audio.ts): impostato SOLO ad audio attivo
   * (opt-in via AudioToggle), invocato quando un tap/click valido innesca il
   * pulse — evento discreto, mai chiamato in useFrame. null = audio spento,
   * zero costo (il modulo audio non è nemmeno caricato).
   */
  onPulse: null as (() => void) | null,
};

type InteractionTrackerProps = {
  /**
   * Sezione hero già montata (Scene la riceve da Hero.tsx): il progresso di
   * scroll è normalizzato sulla sua altezza reale, non su window.innerHeight
   * — su mobile l'hero è alto `svh` mentre innerHeight cresce con la barra
   * URL collassata, e il commiato si completerebbe in ritardo.
   */
  heroEl: HTMLElement;
};

/**
 * Registra i listener che alimentano `interaction`. Da montare una volta
 * accanto alla Canvas (nessun output visivo).
 *
 * Performance (architecture.md §4):
 * - tutti i listener sono `passive: true` → lo scroll/touch nativo non è mai
 *   bloccato dalla scena;
 * - nel listener di scroll si legge solo `window.scrollY` (già calcolato dal
 *   browser, nessun layout forzato); l'altezza dell'hero è cacheata e
 *   aggiornata solo su resize → niente layout thrashing né in evento né in
 *   useFrame;
 * - il tap usa l'evento `click` nativo (non scatta dopo un drag di scroll,
 *   quindi lo scroll touch non innesca impulsi) e una distanza in NDC:
 *   niente raycast sulla mesh da ~8k triangoli.
 */
export function InteractionTracker({ heroEl }: InteractionTrackerProps) {
  useEffect(() => {
    let heroHeight = heroEl.offsetHeight || window.innerHeight;

    const readScroll = () => {
      interaction.scroll = Math.min(
        Math.max(window.scrollY / heroHeight, 0),
        1,
      );
    };

    const onResize = () => {
      // Lettura layout solo su resize (mai per scroll/frame).
      heroHeight = heroEl.offsetHeight || window.innerHeight;
      readScroll();
    };

    const onClick = (event: MouseEvent) => {
      // Con l'hero quasi fuori viewport il tap appartiene alle sezioni sotto.
      if (interaction.scroll > 0.6) return;
      const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
      const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;
      if (Math.hypot(ndcX, ndcY) < 0.5) {
        interaction.pulse = Math.min(interaction.pulse + 1, 1.5);
        interaction.onPulse?.();
      }
    };

    const coarseQuery = window.matchMedia("(pointer: coarse)");
    const onCoarseChange = () => {
      interaction.coarse = coarseQuery.matches;
    };

    onCoarseChange();
    readScroll(); // stato corretto anche con reload a pagina già scrollata

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    window.addEventListener("click", onClick, { passive: true });
    coarseQuery.addEventListener("change", onCoarseChange);

    return () => {
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClick);
      coarseQuery.removeEventListener("change", onCoarseChange);
    };
  }, [heroEl]);

  return null;
}
