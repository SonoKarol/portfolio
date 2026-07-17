"use client";

import { useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { interaction } from "./InteractionTracker";

/**
 * Campo di particelle procedurale attorno all'oggetto hero.
 * Un solo draw call (THREE.Points), deriva + twinkle calcolati interamente
 * in shader: la CPU non tocca mai i buffer dopo la creazione.
 */

const COUNT = 700;
const INNER_RADIUS = 2.2;
const OUTER_RADIUS = 6.5;

/**
 * PRNG deterministico (mulberry32): funzione pura, quindi sicura dentro
 * useMemo (regola react-hooks/purity) e layout particelle stabile tra render.
 */
function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPixelRatio;

  attribute float aScale;
  attribute float aSeed;

  varying float vAlpha;

  void main() {
    vec3 pos = position;
    // Deriva lenta pseudo-casuale per particella.
    pos.y += sin(uTime * 0.15 + aSeed * 6.2831) * 0.2;
    pos.x += cos(uTime * 0.11 + aSeed * 12.566) * 0.15;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_Position = projectionMatrix * mvPosition;
    gl_PointSize = aScale * uPixelRatio * 36.0 / -mvPosition.z;

    // Twinkle: frequenza e fase diverse per seme.
    vAlpha = 0.5 + 0.5 * sin(uTime * (0.5 + aSeed) + aSeed * 40.0);

    // Fade per distanza (sostituisce la scene fog, no-op sugli shader
    // custom): le particelle lontane sfumano verso lo sfondo.
    vAlpha *= 1.0 - smoothstep(6.0, 11.0, -mvPosition.z);
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColor;

  varying float vAlpha;

  void main() {
    float d = length(gl_PointCoord - 0.5);
    float alpha = smoothstep(0.5, 0.05, d);
    alpha *= alpha;
    gl_FragColor = vec4(uColor, alpha * vAlpha * 0.7);
  }
`;

type ParticlesUniforms = {
  uTime: THREE.IUniform<number>;
  uPixelRatio: THREE.IUniform<number>;
  uColor: THREE.IUniform<THREE.Color>;
};

// Uniforms a scope di modulo: componente singleton, ShaderMaterial non clona
// l'oggetto passato via prop → mutazione diretta in useFrame senza ref né
// cast, e senza violare react-hooks/immutability (che vieta di mutare valori
// creati durante il render, come un risultato di useMemo).
const uniforms: ParticlesUniforms = {
  uTime: { value: 0 },
  uPixelRatio: { value: 1 },
  uColor: { value: new THREE.Color("#c4b5fd") },
};

export function Particles() {
  const pointsRef = useRef<THREE.Points>(null);
  const dpr = useThree((state) => state.viewport.dpr);

  const { positions, scales, seeds } = useMemo(() => {
    const random = mulberry32(1337);
    const positions = new Float32Array(COUNT * 3);
    const scales = new Float32Array(COUNT);
    const seeds = new Float32Array(COUNT);
    for (let i = 0; i < COUNT; i += 1) {
      // Distribuzione in guscio sferico: mai dentro l'oggetto hero.
      const radius = INNER_RADIUS + random() * (OUTER_RADIUS - INNER_RADIUS);
      const theta = random() * Math.PI * 2;
      const phi = Math.acos(2 * random() - 1);
      positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = radius * Math.cos(phi);
      scales[i] = 0.4 + random() * 0.9;
      seeds[i] = random();
    }
    return { positions, scales, seeds };
  }, []);

  useFrame((_, delta) => {
    // Clamp del delta (vedi HeroObject): niente salti dopo pause del frameloop.
    uniforms.uTime.value += Math.min(delta, 0.1);
    uniforms.uPixelRatio.value = dpr;

    // Parallasse di scroll: il campo sale più lentamente della pagina mentre
    // l'hero esce dal viewport (scrub diretto sul progresso, già smorzato
    // dallo scroll nativo; nessuna lettura layout qui — vedi InteractionTracker).
    const points = pointsRef.current;
    if (points) {
      points.position.y = interaction.scroll * 1.6;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-aScale" args={[scales, 1]} />
        <bufferAttribute attach="attributes-aSeed" args={[seeds, 1]} />
      </bufferGeometry>
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}
