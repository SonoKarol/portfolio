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
    <section
      id="hero"
      aria-labelledby="hero-titolo"
      className="relative flex min-h-svh w-full items-center justify-center overflow-hidden"
    >
      {/* Fallback statico: visibile durante il load, senza WebGL, con reduced motion */}
      <div aria-hidden="true" className="hero-fallback absolute inset-0" />

      {show3D ? <Scene /> : null}

      {/* Il contenuto testuale resta sopra la canvas e non blocca il parallasse;
          i soli elementi interattivi (CTA) riabilitano i pointer-events. */}
      <div className="pointer-events-none relative z-10 flex flex-col items-center gap-4 px-6 text-center">
        <h1
          id="hero-titolo"
          className="text-6xl font-semibold tracking-tight text-zinc-50 sm:text-8xl"
        >
          Karol
        </h1>
        <p className="text-lg text-zinc-400 sm:text-xl">
          Creative developer — web, 3D e interazioni
        </p>
        <a
          href="#progetti"
          className="pointer-events-auto mt-4 inline-flex items-center gap-2 rounded-full border border-violet-400/40 bg-violet-500/10 px-6 py-3 text-sm font-medium text-violet-200 backdrop-blur-sm transition-colors hover:border-violet-300/60 hover:bg-violet-500/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
        >
          Scopri i progetti
          <span aria-hidden="true">↓</span>
        </a>
      </div>
    </section>
  );
}
