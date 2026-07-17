# architecture.md — Portfolio 3D

Registro delle decisioni tecniche (ADR leggero) e della struttura del progetto. Ogni scelta importante va annotata qui con data e motivazione. Convertire sempre le date in assolute.

## 1. Stack tecnologico

| Ambito | Scelta | Motivazione |
|---|---|---|
| Framework | Next.js (App Router) + React + TypeScript | SSR/SSG, routing, ottimo supporto Vercel, ecosistema React 3D |
| 3D | Three.js via react-three-fiber (R3F) | Approccio dichiarativo React al posto dell'imperativo; più manutenibile |
| Helper 3D | @react-three/drei | Camera controls, loader, `<Environment>`, `<Html>`, ecc. |
| Post-processing | @react-three/postprocessing | Bloom, DOF, vignette per l'effetto "figo" |
| Styling | Tailwind CSS | Velocità di sviluppo, design system coerente |
| Motion 2D | Framer Motion (+ Lenis per smooth scroll, opzionale) | Transizioni sezioni e scroll-driven animation |
| Deploy | Vercel collegato a GitHub | Deploy automatico ad ogni push, preview per branch |
| Repo | GitHub `SonoKarol` | Versionamento e sorgente per il deploy |

Alternative considerate: Astro (ottimo per siti statici ma meno naturale per scene 3D interattive persistenti); Vanilla Three.js (più controllo ma più boilerplate). Rivalutare se le performance con R3F risultassero un collo di bottiglia.

## 2. Struttura di progetto (target)

```
portfolio/
├── CLAUDE.md
├── architecture.md
├── todo.md
├── .claude/
│   ├── settings.json          # permessi/tool
│   └── agents/                # definizioni subagent
├── .gitignore
├── package.json
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
├── public/
│   ├── models/                # asset .glb/.gltf (compressi Draco)
│   ├── textures/
│   └── favicon / og-image
└── src/
    ├── app/
    │   ├── layout.tsx
    │   ├── page.tsx           # one-page con sezioni
    │   └── globals.css
    ├── components/
    │   ├── three/             # Scene, oggetti, materiali, shader
    │   │   ├── Scene.tsx
    │   │   ├── Experience.tsx
    │   │   └── effects/
    │   ├── sections/          # Hero, About, Projects, Skills, Contact
    │   ├── ui/                # bottoni, nav, cursore custom
    │   └── layout/            # Navbar, Footer
    ├── hooks/
    ├── lib/                   # util, dati progetti, costanti
    └── styles/
```

## 3. Decisioni chiave (log)

- **[da inizializzare]** Bootstrap del progetto con `create-next-app` (TypeScript, Tailwind, App Router).
- **[da decidere]** Vercel vs GitHub Pages. Preferenza: Vercel (preview per branch, zero-config Next.js). GitHub Pages richiederebbe `output: 'export'` e rinuncia alle feature server.
- **[da decidere]** Sorgente contenuti progetti: file locale `src/lib/projects.ts` vs GitHub API (mostrare repo reali). Partire dal file locale; valutare in seguito il fetch dai repo di `SonoKarol`.
- **[2026-07-17] Dipendenze 3D installate**: `three@0.185.1`, `@react-three/fiber@9.6.1`, `@react-three/drei@10.7.7`, `@react-three/postprocessing@3.0.4`, `@types/three@0.185` (dev). Tutte compatibili con React 19 / Next 16 (peer deps verificate). Nota: drei porta con sé maath/three-stdlib/troika ma solo il codice importato finisce nel bundle (tree-shaking); al momento da drei non importiamo nulla.
- **[2026-07-17] Hero 3D procedurale, niente .glb**: icosaedro (detail 20, ~8k tris) deformato da simplex noise 3D nel vertex shader, normali perturbate via gradiente numerico, fresnel + gradiente violet/cyan nel fragment. Campo di 700 particelle in un singolo `THREE.Points` con drift/twinkle interamente in shader. Totale 2 draw call di scena. Zero asset esterni.
- **[2026-07-17] frameloop default ("always"), non "demand"**: la scena è animata di continuo (noise time-based), `demand` imporrebbe un `invalidate()` per frame senza risparmio. Il rAF si sospende da solo con tab in background. Da rivalutare in Fase 3: pausa del loop quando l'hero esce dal viewport (IntersectionObserver).
- **[2026-07-17] Niente OrbitControls sull'hero**: su una hero full-screen catturerebbero scroll/pinch (pessimo su mobile). "Controlli" = camera rig con parallasse smorzata sul puntatore (`state.pointer` di R3F, zero listener manuali). 
- **[2026-07-17] Post-processing budget mobile**: `EffectComposer multisampling={0}` (niente MSAA, canvas con `antialias:false`), Bloom `mipmapBlur` con soglia di luminanza alta (si accende solo sul rim fresnel), Vignette. Aliasing residuo mascherato da bloom + sfondo scuro.
- **[2026-07-17] Fix da review Fase 1**: (a) rimosso `<fog>` dalla scena — era un no-op perché entrambi i materiali sono ShaderMaterial custom senza fog chunks; al suo posto un fade per distanza nel vertex shader delle particelle (smoothstep su -mvPosition.z, range 6→11), stesso effetto di profondità a costo zero; (b) soglia bloom alzata a 0.65 così da superare la soglia solo con i picchi del rim fresnel (~1.4 additivo): bloom rim-only come da direzione artistica; (c) sito dark-first: sfondo `#08060f` fisso sul body anche in light scheme (evita flash bianco in overscroll iOS) finché non esisterà il tema chiaro; (d) `lang="it"` e font Geist effettivamente applicati al body; (e) uniforms degli shader spostati a scope di modulo (componenti singleton): elimina cast e ref check come chiesto in review, ma senza violare `react-hooks/immutability`, che vieta di mutare in useFrame un oggetto creato nel render (useMemo).
- **[2026-07-17] Fase 2 — one-page senza JS extra**: Navbar e Footer sono Server Component puri (zero JS client): la navigazione è fatta di soli link àncora e lo smooth scroll è CSS (`scroll-behavior: smooth` dentro `@media (prefers-reduced-motion: no-preference)`); offset della navbar fissa gestito con `scroll-mt-20` sulle sezioni. Wrapper riutilizzabile `src/components/ui/Section.tsx` (àncora + `aria-labelledby` + heading con accento gradiente violet→cyan). Skip link "Vai al contenuto" come primo elemento focusabile.
- **[2026-07-17] Contenuti come dati tipizzati**: progetti in `src/lib/projects.ts` (interfaccia `Project` con `repoUrl`/`demoUrl` opzionali e flag `placeholder` → badge "In arrivo"), competenze in `src/lib/skills.ts` (`SkillGroup`), contatti/link condivisi in `src/lib/site.ts`. Il passaggio futuro alla GitHub API toccherà solo `projects.ts`.
- **[2026-07-17] CTA nell'hero**: il blocco testuale resta `pointer-events-none` per non bloccare il parallasse; la sola CTA "Scopri i progetti" riabilita `pointer-events-auto` (chiusura del finding noto della review Fase 1). Il file `Hero.tsx` è dei frontend; `src/components/three/` resta di proprietà di threejs-specialist e non è stato toccato in Fase 2.
- **[2026-07-17] Gating client-side della scena**: dynamic import `ssr:false` in `Hero.tsx`; check WebGL e `prefers-reduced-motion` con `useSyncExternalStore` (server snapshot conservativo → l'HTML SSR mostra sempre il fallback statico, nessun mismatch di idratazione). Fallback: gradiente CSS `.hero-fallback` coerente con la palette della scena.

## 4. Requisiti di performance

- Budget iniziale: **First Load JS** ragionevole, scena 3D **lazy-loaded** (dynamic import, `ssr: false`).
- `dpr={[1, 2]}` con cap; `frameloop="demand"` dove possibile.
- Modelli `.glb` compressi (Draco/meshopt); texture in formati moderni (KTX2/WebP).
- Fallback: se WebGL assente o `prefers-reduced-motion`, mostrare hero statico (immagine/gradiente) senza canvas.
- Test su mobile di fascia media prima di ogni release.

## 5. Sicurezza e segreti

- Nessun segreto nel repo; variabili in `.env.local` (git-ignored).
- Se si userà la GitHub API per i progetti, usare token a sola lettura lato build, mai esposto al client.

## 6. Deploy / CI

- Push su `main` → deploy di produzione su Vercel.
- Branch feature → deploy preview automatico.
- (Opzionale) GitHub Actions per lint/typecheck/build su ogni PR.
