"use client";

import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { HeroObject } from "./HeroObject";
import { Particles } from "./Particles";
import { Effects } from "./effects/Effects";
import { interaction } from "./InteractionTracker";

/**
 * "Controlli" della scena: niente OrbitControls (su un hero a piena pagina
 * catturerebbero scroll/pinch, pessimo su mobile). Al loro posto un camera
 * rig con:
 * - parallasse smorzata sul puntatore (state.pointer di R3F, che con
 *   eventSource sulla sezione hero resta vivo anche sull'hover della CTA);
 * - su touch (pointer coarse) il puntatore non esiste → sway autonomo lento
 *   della camera, così la scena non è mai statica;
 * - dolly-out legato allo scroll: mentre l'hero esce dal viewport la camera
 *   arretra (z 4.2 → ~6.6) e la parallasse/sway si attenua (×(1−s)).
 */
// Tempo accumulato dello sway a scope di modulo (CameraRig è singleton, come
// gli uTime di HeroObject/Particles): NON si usa clock.elapsedTime perché R3F
// lo azzera a ogni cambio di frameloop (pausa/ripresa fuori viewport) e la
// fase dello sway salterebbe.
const swayState = { t: 0 };

function CameraRig() {
  useFrame((state, delta) => {
    // Clamp del delta: dopo la pausa del frameloop (hero fuori viewport) il
    // primo frame arriva con un delta enorme; senza clamp l'animazione salta.
    const dt = Math.min(delta, 0.1);
    const { camera, pointer } = state;
    const s = interaction.scroll;
    const settle = 1 - s;

    let targetX: number;
    let targetY: number;
    if (interaction.coarse) {
      swayState.t += dt;
      const t = swayState.t;
      targetX = Math.sin(t * 0.4) * 0.18 * settle;
      targetY = Math.cos(t * 0.31) * 0.12 * settle;
    } else {
      targetX = pointer.x * 0.4 * settle;
      targetY = pointer.y * 0.3 * settle;
    }

    camera.position.x = THREE.MathUtils.damp(camera.position.x, targetX, 2.5, dt);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, targetY, 2.5, dt);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, 4.2 + s * 2.4, 4, dt);
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

      {/* InteractionTracker è montato in Scene (fuori dalla Canvas): gli
          serve l'elemento della sezione hero per normalizzare lo scroll. */}
      <CameraRig />
      <HeroObject />
      <Particles />
      <Effects />
    </>
  );
}
