"use client";

import { Canvas } from "@react-three/fiber";
import { Experience } from "./Experience";

/**
 * Canvas R3F della scena hero.
 *
 * Scelte di performance (architecture.md §4):
 * - dpr={[1, 2]}: cap del device pixel ratio, i display 3x/4x renderizzano a 2x.
 * - frameloop default ("always") e NON "demand": la scena è animata di
 *   continuo (noise time-based su hero e particelle), quindi "demand"
 *   richiederebbe comunque un invalidate() per frame senza alcun risparmio.
 *   Il rAF viene sospeso automaticamente dal browser quando il tab è nascosto.
 * - antialias: false: il post-processing rende inutile l'MSAA del canvas;
 *   si risparmia fill-rate su mobile.
 *
 * Accessibilità: la scena è puramente decorativa → aria-hidden sul wrapper;
 * la canvas non riceve focus (nessun tabIndex) e non intrappola la tastiera.
 */
export default function Scene() {
  return (
    <div className="absolute inset-0" aria-hidden="true">
      <Canvas
        dpr={[1, 2]}
        camera={{ position: [0, 0, 4.2], fov: 45, near: 0.1, far: 30 }}
        gl={{
          antialias: false,
          powerPreference: "high-performance",
        }}
      >
        <Experience />
      </Canvas>
    </div>
  );
}
