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
├── postcss.config.mjs         # Tailwind v4: niente tailwind.config, token in globals.css (@theme)
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
- **[2026-07-17] frameloop default ("always"), non "demand"**: la scena è animata di continuo (noise time-based), `demand` imporrebbe un `invalidate()` per frame senza risparmio. Il rAF si sospende da solo con tab in background. Da rivalutare in Fase 3: pausa del loop quando l'hero esce dal viewport (IntersectionObserver) — *fatto in Fase 3, vedi entry dedicata più sotto*.
- **[2026-07-17] Niente OrbitControls sull'hero**: su una hero full-screen catturerebbero scroll/pinch (pessimo su mobile). "Controlli" = camera rig con parallasse smorzata sul puntatore (`state.pointer` di R3F, zero listener manuali). 
- **[2026-07-17] Post-processing budget mobile**: `EffectComposer multisampling={0}` (niente MSAA, canvas con `antialias:false`), Bloom `mipmapBlur` con soglia di luminanza alta (si accende solo sul rim fresnel), Vignette. Aliasing residuo mascherato da bloom + sfondo scuro.
- **[2026-07-17] Fix da review Fase 1**: (a) rimosso `<fog>` dalla scena — era un no-op perché entrambi i materiali sono ShaderMaterial custom senza fog chunks; al suo posto un fade per distanza nel vertex shader delle particelle (smoothstep su -mvPosition.z, range 6→11), stesso effetto di profondità a costo zero; (b) soglia bloom alzata a 0.65 così da superare la soglia solo con i picchi del rim fresnel (~1.4 additivo): bloom rim-only come da direzione artistica; (c) sito dark-first: sfondo `#08060f` fisso sul body anche in light scheme (evita flash bianco in overscroll iOS) finché non esisterà il tema chiaro; (d) `lang="it"` e font Geist effettivamente applicati al body; (e) uniforms degli shader spostati a scope di modulo (componenti singleton): elimina cast e ref check come chiesto in review, ma senza violare `react-hooks/immutability`, che vieta di mutare in useFrame un oggetto creato nel render (useMemo).
- **[2026-07-17] Fase 2 — one-page senza JS extra**: Navbar e Footer sono Server Component puri (zero JS client): la navigazione è fatta di soli link àncora e lo smooth scroll è CSS (`scroll-behavior: smooth` dentro `@media (prefers-reduced-motion: no-preference)`); offset della navbar fissa gestito con `scroll-mt-20` sulle sezioni. Wrapper riutilizzabile `src/components/ui/Section.tsx` (àncora + `aria-labelledby` + heading con accento gradiente violet→cyan). Skip link "Vai al contenuto" come primo elemento focusabile.
- **[2026-07-17] Contenuti come dati tipizzati**: progetti in `src/lib/projects.ts` (interfaccia `Project` con `repoUrl`/`demoUrl` opzionali e flag `placeholder` → badge "In arrivo"), competenze in `src/lib/skills.ts` (`SkillGroup`), contatti/link condivisi in `src/lib/site.ts`. Il passaggio futuro alla GitHub API toccherà solo `projects.ts`.
- **[2026-07-17] CTA nell'hero**: il blocco testuale resta `pointer-events-none` per non bloccare il parallasse; la sola CTA "Scopri i progetti" riabilita `pointer-events-auto` (chiusura del finding noto della review Fase 1). Il file `Hero.tsx` è dei frontend; `src/components/three/` resta di proprietà di threejs-specialist e non è stato toccato in Fase 2.
- **[2026-07-17] Gating client-side della scena**: dynamic import `ssr:false` in `Hero.tsx`; check WebGL e `prefers-reduced-motion` con `useSyncExternalStore` (server snapshot conservativo → l'HTML SSR mostra sempre il fallback statico, nessun mismatch di idratazione). Fallback: gradiente CSS `.hero-fallback` coerente con la palette della scena.
- **[2026-07-17] Design token in `@theme` (Tailwind v4, niente tailwind.config)**: tutti i token vivono in `src/app/globals.css`. Palette: neutri = scala `zinc` stock (testi `zinc-50/200/300/400` su sfondo scuro, mai sotto `zinc-400` per rispettare AA su `#08060f`); accenti = scale stock `violet` (300–500) e `cyan` (300–400). Token custom: `--color-surface` (sfondo sito = sfondo scena 3D, sostituisce i `bg-[#08060f]` hardcoded), `--color-brand-violet: #8b5cf6` e `--color-brand-cyan: #22d3ee` (gli stessi valori degli shader dell'hero: qualunque cambio palette 3D va riflesso qui — coordinare con threejs-specialist), `--spacing-nav: 5rem` (offset navbar fissa, chiude il follow-up Fase 2: usato come `scroll-mt-nav` in `Section.tsx`, commento incrociato in `Navbar.tsx`), `--radius-card` (card Projects/Skills → `rounded-card`). Tipografia: Geist Sans/Mono (già in layout); gerarchia: h1 hero `tracking-tighter`, h2 sezione `text-3xl→4xl tracking-tight text-balance`, intro `leading-relaxed text-pretty`, label gruppi skills `text-xs uppercase tracking-widest`.
- **[2026-07-17] Reveal sezioni: CSS scroll-driven animations, non Framer Motion/IO**: classe `.reveal` (fade + rise 1.5rem) con `animation-timeline: view()` e `animation-range: entry 0% → 45%`, applicata al contenitore interno di `Section.tsx`. Motivazione: zero JS client (le sezioni restano Server Component), scrubbing legato allo scroll (niente timer), doppio gate `@media (prefers-reduced-motion: no-preference)` + `@supports (animation-timeline: view())` → browser senza supporto (Firefox stabile, Safari < 26) o con reduced-motion vedono il contenuto subito, senza animazione; contenuto sempre visibile anche senza JS. Framer Motion avrebbe richiesto client component + ~30 kB per un effetto che qui è puro CSS; riconsiderarlo solo per motion più orchestrato (page transition, layout animation). Nota tecnica: i keyframes animano `transform` (non `translate`) così il fill-mode `both` non entra in conflitto con le utility hover di Tailwind v4, che usano la proprietà `translate` (le due si compongono).
- **[2026-07-17] Smooth scroll: nativo CSS, niente Lenis**: `scroll-behavior: smooth` (già gated su reduced-motion) copre l'unico caso d'uso della one-page, i link àncora. Lenis farebbe scroll-hijacking su wheel/touch con lavoro per frame sul main thread in competizione con il rAF di R3F, più edge case di accessibilità (tastiera, find-in-page), per un beneficio nullo senza storytelling scroll-sincronizzato. Rivalutare solo se threejs-specialist introdurrà animazioni 3D legate alla posizione di scroll che richiedano interpolazione (per ora bastano scroll nativo + `scrollY`).
- **[2026-07-17] Niente cursore custom; micro-interazioni sì**: un cursore custom richiede JS su ogni `pointermove` (main thread condiviso con la scena 3D), va nascosto/gestito su touch, pointer coarse, reduced-motion, iframe e testo selezionabile, e su questo sito non comunica nulla che gli hover state non comunichino già. Costo/rischio > beneficio → scelta: cursore nativo sempre visibile. Al suo posto micro-interazioni pure CSS: `.link-underline` (sottolineatura gradiente violet→cyan su hover/focus-visible per navbar/footer, transizione solo motion-safe), lift `motion-safe:hover:-translate-y-*` + glow `shadow-violet-500/10-20` su card progetti e CTA contatti, freccia della CTA hero che scende su hover (`motion-safe`), `::selection` brand. Tutte le traslazioni sono dietro `motion-safe:`; le sole transizioni di colore restano sempre attive (non sono "movimento").

- **[2026-07-17] Fase 3 — Interazioni 3D con scroll (threejs-specialist)**: stato condiviso mutabile a scope di modulo `interaction` (`scroll` 0→1, `pulse`, `coarse`) in `src/components/three/InteractionTracker.tsx`: i listener DOM scrivono, i `useFrame` leggono → zero setState per frame, zero re-render durante lo scroll. Listener tutti `passive: true`; nel handler di scroll si legge solo `window.scrollY` (nessun layout forzato) e il progresso è normalizzato sull'altezza reale della sezione hero (`offsetHeight`, cacheata e riletta solo su resize — fix review Fase 3: `innerHeight` divergerebbe dall'hero alto `svh` su mobile con barra URL collassata) → niente layout thrashing. Reazione allo scroll ("commiato" dell'hero, scrub sullo scroll nativo — coerente con la decisione no-Lenis): dolly-out della camera (z 4.2→6.6, smorzato), parallasse/sway attenuati ×(1−s), blob che ruota più veloce, si inclina (tilt assoluto, reversibile), scala −28% e dissolve verso il colore di sfondo via uniform `uScroll` nel fragment (spegne anche il rim → il bloom scende sotto soglia e svanisce con il resto; il target è l'uniform `uBackground` come `THREE.Color` — fix review Fase 3: un vec3 hardcoded in sRGB salterebbe la conversione sRGB→linear del ColorManagement e non convergerebbe allo sfondo dopo la ricodifica in output del composer); particelle con parallasse verticale (+1.6 unità world a fine hero). Niente ScrollControls di drei (presuppone scroll interno alla canvas; qui lo scroll è della pagina).
- **[2026-07-17] Fase 3 — Interazioni touch**: su `pointer: coarse` il parallasse da mouse non esiste → sostituito da (a) sway autonomo lento della camera (sin/cos a bassa frequenza, si attenua con lo scroll; fase su tempo accumulato proprio, non su `clock.elapsedTime` che R3F azzera a ogni toggle del frameloop — fix review Fase 3), (b) la reazione allo scroll di cui sopra (è l'interazione touch primaria), (c) tap vicino al centro → impulso di distorsione del blob (`pulse` con attack rapido λ=6 e decay esponenziale; funziona anche come click su desktop). Il tap è rilevato con listener `click` su window + distanza in NDC: niente raycast (un handler R3F sulla mesh attiverebbe il raycasting su ~8k triangoli a ogni pointermove) e niente falsi trigger durante lo scroll (il `click` nativo non scatta dopo un drag). Su coarse si ignorano `state.pointer` per hover-boost e tilt (resterebbe congelato all'ultimo tap). Nessun `touch-action` impostato su canvas/sezione: lo scroll touch non è mai bloccato.
- **[2026-07-17] Fase 3 — `eventSource` sulla sezione hero (chiude follow-up review Fase 2)**: `<Canvas eventSource={sectionEl} eventPrefix="client">` → gli eventi puntatore arrivano dalla `<section>` antenata, quindi il rig non si congela più sull'hover della CTA (che è fuori dalla canvas). Pattern per il vincolo "l'elemento deve esistere al mount": in `Hero.tsx` la `<section>` usa una callback ref che salva l'elemento in state (`ref={setSectionEl}`) e `Scene` (con l'elemento come prop `HTMLElement`, non ref) viene montata solo quando l'elemento esiste — niente setState sincrono in effect (vietato da `react-hooks/set-state-in-effect`), e nel frattempo resta visibile il fallback statico (invariante già esistente). `eventPrefix="client"` è necessario perché con eventSource ≠ canvas le coordinate `offset` sarebbero relative al target dell'evento; le `client` sono corrette perché l'hero occupa l'intero viewport in cima alla pagina.
- **[2026-07-17] Fase 3 — Pausa frameloop fuori viewport**: IntersectionObserver sulla sezione hero → `frameloop` passa da `"always"` a `"never"` quando l'hero è completamente fuori dal viewport (GPU e rAF fermi mentre si leggono le sezioni sotto; guadagno di batteria su mobile). Al rientro il loop riparte dal cambio di prop; tutti i `useFrame` clampano `delta` a ≤0.1 s per evitare salti di animazione al primo frame dopo la pausa (vale anche per il ritorno da tab in background).

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
