# todo.md — Portfolio 3D

Roadmap e stato dei task. I subagent aggiornano questo file quando prendono o completano un lavoro.
Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto · `(owner)` subagent responsabile.

## Fase 0 — Setup (scaffolding)
- [x] Creare cartella progetto `C:\portfolio`
- [x] Documentazione base: CLAUDE.md, architecture.md, todo.md
- [x] Definizioni subagent in `.claude/agents/`
- [x] Permessi in `.claude/settings.json`
- [x] Bootstrap Next.js + TypeScript + Tailwind (`create-next-app`) (frontend-developer) — verificato: build ok
- [x] Aggiungere `.gitignore` e configurare TypeScript strict (frontend-developer) — verificato: `strict: true`, ignore completi
- [x] `git init`, primo commit, creare repo GitHub `portfolio` e push (github-deploy) — verificato: main allineato a origin/main
- [x] Collegare il repo a Vercel per deploy automatico (github-deploy) — verificato: repo GitHub `SonoKarol/portfolio` connesso al progetto Vercel `karol1/portfolio` (nessun deploy ancora: partirà al prossimo push su main)

## Fase 1 — Fondamenta 3D
- [x] Installare three, @react-three/fiber, drei, postprocessing (threejs-specialist) — three 0.185.1, fiber 9.6.1, drei 10.7.7, postprocessing 3.0.4, @types/three 0.185
- [x] Componente `<Scene>` con canvas R3F, luci, camera, controlli (threejs-specialist) — `src/components/three/Scene.tsx` + `Experience.tsx` (camera rig parallasse al posto di OrbitControls); review passata
- [x] Oggetto/hero 3D d'impatto (es. mesh animata / particellare / distorsione shader) (threejs-specialist) — icosaedro con distorsione simplex-noise in vertex shader + fresnel, particelle (1 draw call), bloom mipmap + vignette; review passata
- [x] Lazy-load della scena + fallback statico e `prefers-reduced-motion` (threejs-specialist) — `Hero.tsx` con dynamic import `ssr:false`, fallback gradiente CSS, check WebGL e reduced-motion via useSyncExternalStore; lazy-load verificato sui chunk (Three.js fuori dal bundle iniziale)
- Nota: review code-reviewer completata in 2 pass (7 finding, tutti risolti e ri-verificati); resta consigliata una verifica visiva del tuning bloom/particelle con `npm run dev`

## Fase 2 — Struttura sito e contenuti
- [x] Layout one-page con navbar e sezioni ancora (frontend-developer) — Navbar fissa + Footer in `src/components/layout/`, smooth scroll CSS con rispetto reduced-motion, skip link, wrapper `Section` riutilizzabile in `src/components/ui/`; review passata
- [x] Sezione Hero (con la scena 3D integrata) (frontend-developer + threejs-specialist) — id àncora, CTA "Scopri i progetti" con `pointer-events-auto` (fix del finding Fase 1); scena 3D non toccata; review passata
- [x] Sezione Chi sono (frontend-developer) — `About.tsx`, bio placeholder senza fatti inventati; review passata
- [x] Sezione Progetti (dati da `src/lib/projects.ts`) (frontend-developer) — interfaccia `Project` tipizzata, 3 card (portfolio reale + 2 segnaposto "In arrivo") con hover state; review passata
- [x] Sezione Competenze (frontend-developer) — dati tipizzati in `src/lib/skills.ts`, griglia 4 gruppi; review passata
- [x] Sezione Contatti (form/mailto + link social) (frontend-developer) — mailto verso bonfiglio.karol.p@gmail.com + link GitHub SonoKarol (costanti in `src/lib/site.ts`), niente form/backend; review passata
- Nota: review code-reviewer completata in 2 pass (2 finding importanti + 3 minori, risolti e ri-verificati); resta aperto solo il follow-up parallasse/`eventSource` per threejs-specialist (Fase 3)

## Fase 3 — Direzione artistica e motion
- [ ] Palette, tipografia, design tokens in Tailwind (design-director)
- [ ] Smooth scroll + animazioni scroll-driven per le sezioni (design-director)
- [ ] Interazioni 3D con mouse/scroll/touch (threejs-specialist)
- [ ] Cursore custom / micro-interazioni (design-director)

## Fase 4 — Rifinitura, qualità, deploy
- [ ] SEO: metadata, Open Graph, `og-image`, sitemap (frontend-developer)
- [ ] Accessibilità: contrasto, focus, tastiera, reduced-motion (design-director + code-reviewer)
- [ ] Ottimizzazione performance (Lighthouse, bundle, asset 3D) (threejs-specialist + code-reviewer)
- [ ] Code review completa pre-release (code-reviewer)
- [ ] Deploy di produzione + verifica live (github-deploy)

## Idee / backlog
- [ ] Mostrare i repo reali di `SonoKarol` via GitHub API nella sezione Progetti
- [ ] Tema chiaro/scuro
- [ ] Effetti audio opzionali sulle interazioni
- [ ] Pagina dedicata per singolo progetto (case study)

## Follow-up review Fase 1 (code-reviewer, 2026-07-17)
Review completata: nessun problema bloccante; build e lint passano; lazy-load del chunk Three.js verificato (fuori dall'HTML iniziale). Da sistemare:
- [x] `src/app/layout.tsx`: `lang="en"` ma i contenuti sono in italiano → `lang="it"` (frontend-developer)
- [x] `src/app/globals.css`: `font-family: Arial` residuo dello scaffold annulla i font Geist caricati (e preloadati) in layout — usarli o rimuoverli (frontend-developer + design-director)
- [x] `src/app/globals.css`: `--background: #ffffff` in light scheme dietro pagina scura → possibile flash bianco in overscroll; allineare alla palette scura (design-director)
- [x] `src/components/three/Experience.tsx`: `<fog>` non ha effetto sui ShaderMaterial custom (fog: false, niente fog chunks) — rimuovere o implementare il fade distanza nello shader delle particelle (threejs-specialist)
- [x] `src/components/three/effects/Effects.tsx`: `luminanceThreshold={0.25}` non è "soglia alta": il bloom si accende anche sulla faccia illuminata del blob, non solo sul rim; alzare (~0.6) o correggere commento/architecture.md (threejs-specialist)
- [x] `HeroObject.tsx` / `Particles.tsx`: in `useFrame` usare l'oggetto `uniforms` memoizzato invece del cast `material.uniforms as ...` (threejs-specialist)
- [ ] npm audit: 2 moderate transitive (postcss <8.5.10 dentro next) — non azionabile ora, aggiornare Next alla prossima patch (github-deploy)

## Follow-up review Fase 2 (code-reviewer, 2026-07-17)
Review completata: nessun problema bloccante; build e lint passano; sezioni tutte Server Component (nessun "use client" oltre all'hero), zero JS client aggiunto, nessuna nuova dipendenza. Da sistemare:
- [x] Contrasto `text-zinc-500` (#71717b) su #08060f = 4.17:1, sotto il minimo AA 4.5:1 per testo normale → passare a `text-zinc-400` (7.7:1): `src/components/layout/Footer.tsx:6` e `src/components/sections/Contact.tsx:30` (frontend-developer) — fatto in entrambi i file
- [x] Skip link in `src/app/page.tsx`: al focus `focus:not-sr-only` azzera il padding (specificità maggiore di `px-4 py-2`, verificato nel CSS compilato) → usare `focus:px-4 focus:py-2` (frontend-developer) — fatto
- [ ] Parallasse hero: il puntatore R3F si congela sull'hover della CTA (eventi solo sulla canvas). Accettabile ora; in Fase 3 valutare `eventSource` sulla sezione hero per continuità del rig (threejs-specialist)
- [x] `scroll-mt-20` in `Section.tsx` accoppiato all'altezza della navbar fissa (~45px, ~69px con wrap): margine ok oggi, ma aggiungere commento incrociato Navbar↔Section o estrarre una variabile CSS condivisa (frontend-developer) — aggiunto commento incrociato in entrambi i file (variabile CSS condivisa rimandata a Fase 3 se la navbar cambierà)
- [x] Anno "© 2026" hardcoded in `Footer.tsx:7` → `new Date().getFullYear()` a build time o nota di manutenzione (frontend-developer) — ora `new Date().getFullYear()`, valutato a build time (pagina statica)
