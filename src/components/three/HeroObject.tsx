"use client";

import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

/**
 * Icosaedro ad alta tassellazione deformato da simplex noise nel vertex
 * shader ("blob" organico), con fresnel rim-light e gradiente di colore nel
 * fragment shader. Un solo draw call, geometria procedurale (nessun asset).
 *
 * La normale viene perturbata via gradiente numerico del campo di noise
 * (3 sample extra per vertice): costo trascurabile in vertex stage anche su
 * GPU mobile, e permette uno shading liscio senza ricalcolo CPU-side.
 */

const simplexNoise = /* glsl */ `
  // Simplex 3D noise — Ian McEwan / Stefan Gustavson (Ashima Arts, licenza MIT)
  vec4 permute(vec4 x) { return mod(((x * 34.0) + 1.0) * x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0 / 6.0, 1.0 / 3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

    vec3 i = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);

    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);

    vec3 x1 = x0 - i1 + 1.0 * C.xxx;
    vec3 x2 = x0 - i2 + 2.0 * C.xxx;
    vec3 x3 = x0 - 1.0 + 3.0 * C.xxx;

    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
        i.z + vec4(0.0, i1.z, i2.z, 1.0))
      + i.y + vec4(0.0, i1.y, i2.y, 1.0))
      + i.x + vec4(0.0, i1.x, i2.x, 1.0));

    float n_ = 1.0 / 7.0;
    vec3 ns = n_ * D.wyz - D.xzx;

    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);

    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);

    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);

    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);

    vec4 s0 = floor(b0) * 2.0 + 1.0;
    vec4 s1 = floor(b1) * 2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));

    vec4 a0 = b0.xzyw + s0.xzyw * sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw * sh.zzww;

    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);

    vec4 norm = taylorInvSqrt(vec4(dot(p0, p0), dot(p1, p1), dot(p2, p2), dot(p3, p3)));
    p0 *= norm.x;
    p1 *= norm.y;
    p2 *= norm.z;
    p3 *= norm.w;

    vec4 m = max(0.6 - vec4(dot(x0, x0), dot(x1, x1), dot(x2, x2), dot(x3, x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m * m, vec4(dot(p0, x0), dot(p1, x1), dot(p2, x2), dot(p3, x3)));
  }
`;

const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uIntensity;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vNoise;

  ${simplexNoise}

  // Campo di deformazione: due ottave di simplex noise animate nel tempo.
  float field(vec3 p, float t) {
    vec3 q = p * 1.35 + vec3(0.0, -t * 0.5, t * 0.85);
    float n = snoise(q);
    n += 0.35 * snoise(q * 2.4 + vec3(t * 0.6));
    return n / 1.35;
  }

  void main() {
    float t = uTime * 0.35;
    float n = field(position, t);
    vec3 displaced = position + normal * (n * uIntensity);

    // Gradiente numerico del campo per perturbare la normale (shading liscio).
    float e = 0.12;
    vec3 grad = vec3(
      field(position + vec3(e, 0.0, 0.0), t) - n,
      field(position + vec3(0.0, e, 0.0), t) - n,
      field(position + vec3(0.0, 0.0, e), t) - n
    ) / e;
    vec3 gradTangent = grad - dot(grad, normal) * normal;
    vec3 perturbed = normalize(normal - uIntensity * gradTangent);

    vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);

    vNormal = normalize(normalMatrix * perturbed);
    vViewDir = -mvPosition.xyz;
    vNoise = n;

    gl_Position = projectionMatrix * mvPosition;
  }
`;

const fragmentShader = /* glsl */ `
  uniform vec3 uColorA;
  uniform vec3 uColorB;
  uniform vec3 uColorRim;

  varying vec3 vNormal;
  varying vec3 vViewDir;
  varying float vNoise;

  void main() {
    vec3 N = normalize(vNormal);
    vec3 V = normalize(vViewDir);

    // Luce direzionale fissa in view-space (coerente con la dir. artistica scura).
    vec3 L = normalize(vec3(0.45, 0.75, 0.6));
    float diffuse = max(dot(N, L), 0.0);

    float fresnel = pow(1.0 - max(dot(N, V), 0.0), 2.6);

    vec3 base = mix(uColorA, uColorB, smoothstep(-0.55, 0.75, vNoise));
    vec3 color = base * (0.22 + 0.78 * diffuse);
    // Il rim supera la soglia di luminanza del bloom: alone morbido sul bordo.
    color += uColorRim * fresnel * 1.4;

    gl_FragColor = vec4(color, 1.0);
  }
`;

type HeroUniforms = {
  uTime: THREE.IUniform<number>;
  uIntensity: THREE.IUniform<number>;
  uColorA: THREE.IUniform<THREE.Color>;
  uColorB: THREE.IUniform<THREE.Color>;
  uColorRim: THREE.IUniform<THREE.Color>;
};

const BASE_INTENSITY = 0.32;
const HOVER_INTENSITY = 0.5;

// Uniforms a scope di modulo: il componente è un singleton nella scena e
// ShaderMaterial non clona l'oggetto passato via prop, quindi possiamo
// mutarlo direttamente in useFrame senza ref né cast. Un oggetto creato nel
// render (useMemo) non sarebbe mutabile per la regola react-hooks/immutability.
const uniforms: HeroUniforms = {
  uTime: { value: 0 },
  uIntensity: { value: BASE_INTENSITY },
  uColorA: { value: new THREE.Color("#3b1d8f") },
  uColorB: { value: new THREE.Color("#22d3ee") },
  uColorRim: { value: new THREE.Color("#a78bfa") },
};

export function HeroObject() {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    uniforms.uTime.value += delta;

    // Boost di distorsione quando il puntatore è vicino al centro dello
    // schermo: niente raycast (costoso su mesh dense), solo distanza in NDC.
    const pointerDist = Math.hypot(state.pointer.x, state.pointer.y);
    const target = pointerDist < 0.4 ? HOVER_INTENSITY : BASE_INTENSITY;
    uniforms.uIntensity.value = THREE.MathUtils.damp(
      uniforms.uIntensity.value,
      target,
      2.5,
      delta,
    );

    // Rotazione lenta continua + inclinazione smorzata verso il puntatore.
    mesh.rotation.y += delta * 0.12;
    mesh.rotation.x = THREE.MathUtils.damp(
      mesh.rotation.x,
      state.pointer.y * -0.25,
      2,
      delta,
    );
  });

  return (
    <mesh ref={meshRef}>
      {/* detail 20 → ~8k triangoli: abbastanza per un blob liscio, leggero per GPU mobile */}
      <icosahedronGeometry args={[1.15, 20]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}
