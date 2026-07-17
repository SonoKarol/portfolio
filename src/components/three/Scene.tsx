"use client";

import { useEffect, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";
import { InteractionTracker } from "./InteractionTracker";

type SceneProps = {
  /**
   * Sezione hero (già montata: Hero.tsx la risolve via callback ref e monta
   * Scene solo quando esiste): sorgente degli eventi puntatore (così il
   * parallasse non si congela sull'hover della CTA, che è fuori dalla canvas)
   * e target dell'IntersectionObserver per la pausa del frameloop.
   */
  eventSource: HTMLElement;
};

/**
 * Canvas R3F della scena hero.
 *
 * Scelte di performance (architecture.md §4):
 * - dpr={[1, 2]}: cap del device pixel ratio, i display 3x/4x renderizzano a 2x.
 * - frameloop "always" finché l'hero è nel viewport (scena animata di
 *   continuo, "demand" non risparmierebbe nulla), "never" quando l'hero esce
 *   completamente dal viewport (IntersectionObserver): mentre si leggono le
 *   sezioni sotto la GPU non lavora. Il rAF è comunque sospeso dal browser
 *   con tab in background.
 * - antialias: false: il post-processing rende inutile l'MSAA del canvas;
 *   si risparmia fill-rate su mobile.
 * - eventPrefix="client": con eventSource diverso dalla canvas le coordinate
 *   offset sarebbero relative al target dell'evento (es. la CTA), non alla
 *   sezione; le coordinate client sono corrette perché l'hero occupa l'intero
 *   viewport in cima alla pagina.
 * - nessun touch-action sulla canvas/sezione: lo scroll touch resta libero.
 *
 * Accessibilità: la scena è puramente decorativa → aria-hidden sul wrapper;
 * la canvas non riceve focus (nessun tabIndex) e non intrappola la tastiera.
 */
export default function Scene({ eventSource }: SceneProps) {
  // Pausa del frameloop quando l'hero è completamente fuori viewport.
  const [inView, setInView] = useState(true);
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      // Ultimo record del batch: entries[0] è il più VECCHIO e con un doppio
      // attraversamento rapido del bordo applicherebbe uno stato stantio.
      const entry = entries[entries.length - 1];
      if (entry) setInView(entry.isIntersecting);
    });
    observer.observe(eventSource);
    return () => observer.disconnect();
  }, [eventSource]);

  return (
    <div className="absolute inset-0" aria-hidden="true">
      {/* Listener scroll/tap/coarse condivisi con la scena; riceve la sezione
          per normalizzare lo scroll sulla sua altezza reale (svh ≠ innerHeight
          su mobile con barra URL collassata). */}
      <InteractionTracker heroEl={eventSource} />
      <Canvas
        dpr={[1, 2]}
        frameloop={inView ? "always" : "never"}
        camera={{ position: [0, 0, 4.2], fov: 45, near: 0.1, far: 30 }}
        gl={{
          antialias: false,
          // Il framebuffer di default riceve solo la copia finale del
          // composer (quad screen-space): depth e stencil del canvas non
          // servono a nulla — il depth test avviene nei render target del
          // composer. Disattivarli risparmia memoria GPU e banda su mobile.
          // INVARIANTE: vale solo finché il composer renderizza davvero la
          // scena. Si rompe non solo rimuovendo <Effects/>, ma anche con
          // EffectComposer enabled={false} o con <Effects/> smontata/senza
          // effect: in quei casi R3F/RenderPass disegnano la scena
          // direttamente sul canvas SENZA depth buffer → blob corrotto
          // (facce che si compenetrano). Se mai si disabilita il composer,
          // ripristinare depth: true (e valutare stencil).
          stencil: false,
          depth: false,
          powerPreference: "high-performance",
        }}
        eventSource={eventSource}
        eventPrefix="client"
      >
        <Experience />
      </Canvas>
    </div>
  );
}
