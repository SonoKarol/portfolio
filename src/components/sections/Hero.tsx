"use client";

import dynamic from "next/dynamic";
import { usePrefersReducedMotion } from "@/hooks/usePrefersReducedMotion";
import { useWebGLAvailable } from "@/hooks/useWebGLAvailable";

// Scena 3D lazy: fuori dal bundle iniziale, mai renderizzata lato server.
// Nessuna opzione `loading`: durante il caricamento resta visibile il
// fallback statico sottostante.
const Scene = dynamic(() => import("@/components/three/Scene"), {
  ssr: false,
});

/**
 * Hero a schermo intero. La scena 3D viene montata solo se:
 * - il client ha WebGL disponibile,
 * - l'utente NON ha `prefers-reduced-motion: reduce`.
 * In tutti gli altri casi (incluso il primo paint e il caricamento del chunk
 * 3D) si vede il fallback statico: gradiente CSS coerente con la scena.
 */
export function Hero() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const webglOk = useWebGLAvailable();

  const show3D = webglOk && !prefersReducedMotion;

  return (
    <section className="relative flex min-h-svh w-full items-center justify-center overflow-hidden">
      {/* Fallback statico: visibile durante il load, senza WebGL, con reduced motion */}
      <div aria-hidden="true" className="hero-fallback absolute inset-0" />

      {show3D ? <Scene /> : null}

      {/* Il contenuto testuale resta sopra la canvas e non blocca il parallasse */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <h1 className="text-6xl font-semibold tracking-tight text-zinc-50 sm:text-8xl">
          Karol
        </h1>
        <p className="text-lg text-zinc-400 sm:text-xl">
          Creative developer — portfolio in costruzione
        </p>
      </div>
    </section>
  );
}
