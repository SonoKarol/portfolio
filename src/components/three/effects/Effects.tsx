"use client";

import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";

/**
 * Post-processing leggero, pensato per reggere su GPU mobile:
 * - Bloom con mipmapBlur (molto più economico del blur gaussiano classico)
 *   e soglia di luminanza alta: si accende solo sul rim fresnel dell'hero.
 * - Vignette per chiudere la composizione sullo sfondo scuro.
 * - multisampling={0}: niente MSAA sul framebuffer del composer; l'aliasing
 *   residuo è mascherato dal bloom e dallo sfondo scuro, e si risparmia
 *   parecchia banda su mobile.
 */
export function Effects() {
  return (
    <EffectComposer multisampling={0}>
      {/* Soglia alta (0.65): sotto restano sia la base diffusa del blob sia
          le particelle; superano la soglia solo i picchi del rim fresnel
          (fino a ~1.4 additivo) → bloom rim-only, come da direzione. */}
      <Bloom
        mipmapBlur
        intensity={0.7}
        luminanceThreshold={0.65}
        luminanceSmoothing={0.35}
      />
      <Vignette eskil={false} offset={0.2} darkness={0.72} />
    </EffectComposer>
  );
}
