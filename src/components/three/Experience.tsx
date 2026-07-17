"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HeroObject } from "./HeroObject";
import { Particles } from "./Particles";
import { Effects } from "./effects/Effects";

/**
 * "Controlli" della scena: niente OrbitControls (su un hero a piena pagina
 * catturerebbero scroll/pinch, pessimo su mobile). Al loro posto un camera
 * rig con parallasse smorzata sul puntatore: usa state.pointer di R3F,
 * quindi zero event listener manuali e zero cleanup da gestire.
 */
function CameraRig() {
  useFrame((state, delta) => {
    const { camera, pointer } = state;
    camera.position.x = THREE.MathUtils.damp(
      camera.position.x,
      pointer.x * 0.4,
      2.5,
      delta,
    );
    camera.position.y = THREE.MathUtils.damp(
      camera.position.y,
      pointer.y * 0.3,
      2.5,
      delta,
    );
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/**
 * Contenuto della scena hero: sfondo, luci, oggetto principale, particelle,
 * post-processing. Totale: 2 draw call di scena + pass del composer.
 *
 * Nota luci: l'hero usa uno shader custom con lighting baked (diffusa +
 * fresnel), quindi le luci qui sotto servono agli oggetti con materiali
 * standard che arriveranno nelle fasi successive; costano nulla finché
 * nessun materiale lit è in scena.
 */
export function Experience() {
  return (
    <>
      <color attach="background" args={["#08060f"]} />
      {/* Niente <fog>: i materiali in scena sono ShaderMaterial custom senza
          fog chunks, sarebbe un no-op. Il fade per distanza delle particelle
          è implementato nel loro vertex shader. */}

      <ambientLight intensity={0.3} />
      <directionalLight position={[3, 4, 5]} intensity={1.1} color="#a78bfa" />

      <CameraRig />
      <HeroObject />
      <Particles />
      <Effects />
    </>
  );
}
