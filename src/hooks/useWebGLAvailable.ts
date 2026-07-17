"use client";

import { useSyncExternalStore } from "react";
import { isWebGLAvailable } from "@/lib/webgl";

// Il supporto WebGL non cambia a runtime: subscribe è un no-op.
function subscribe(): () => void {
  return () => {};
}

// Cache module-level: getSnapshot deve restituire un valore stabile e il
// probe del contesto WebGL non è gratis, lo eseguiamo una volta sola.
let cached: boolean | null = null;

function getSnapshot(): boolean {
  if (cached === null) {
    cached = isWebGLAvailable();
  }
  return cached;
}

// Lato server: assumiamo assenza di WebGL → l'HTML iniziale mostra il
// fallback statico; il client rivaluta subito dopo l'idratazione.
function getServerSnapshot(): boolean {
  return false;
}

/**
 * true se il browser supporta WebGL. Client-only, senza setState in effect
 * e senza mismatch di idratazione (pattern useSyncExternalStore).
 */
export function useWebGLAvailable(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
