"use client";

import { useSyncExternalStore } from "react";

const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onStoreChange: () => void): () => void {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onStoreChange);
  return () => mql.removeEventListener("change", onStoreChange);
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches;
}

// Lato server assumiamo "reduce": così l'HTML iniziale mostra il fallback
// statico e la scena 3D viene montata solo dopo la verifica client-side.
function getServerSnapshot(): boolean {
  return true;
}

/**
 * true se l'utente ha attivato "riduci movimento" a livello di sistema.
 * Reattivo: si aggiorna se la preferenza cambia a runtime.
 */
export function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
