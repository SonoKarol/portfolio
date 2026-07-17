# todo.md — Portfolio 3D

Roadmap e stato dei task. I subagent aggiornano questo file quando prendono o completano un lavoro.
Legenda: `[ ]` da fare · `[~]` in corso · `[x]` fatto · `(owner)` subagent responsabile.

## Fase 0 — Setup (scaffolding)
- [x] Creare cartella progetto `C:\portfolio`
- [x] Documentazione base: CLAUDE.md, architecture.md, todo.md
- [x] Definizioni subagent in `.claude/agents/`
- [x] Permessi in `.claude/settings.json`
- [x] Bootstrap Next.js + TypeScript + Tailwind (`create-next-app`) (frontend-developer)
- [x] Aggiungere `.gitignore` e configurare TypeScript strict (frontend-developer)
- [~] `git init`, primo commit, creare repo GitHub `portfolio` e push (github-deploy)
- [ ] Collegare il repo a Vercel per deploy automatico (github-deploy)

## Fase 1 — Fondamenta 3D
- [ ] Installare three, @react-three/fiber, drei, postprocessing (threejs-specialist)
- [ ] Componente `<Scene>` con canvas R3F, luci, camera, controlli (threejs-specialist)
- [ ] Oggetto/hero 3D d'impatto (es. mesh animata / particellare / distorsione shader) (threejs-specialist)
- [ ] Lazy-load della scena + fallback statico e `prefers-reduced-motion` (threejs-specialist)

## Fase 2 — Struttura sito e contenuti
- [ ] Layout one-page con navbar e sezioni ancora (frontend-developer)
- [ ] Sezione Hero (con la scena 3D integrata) (frontend-developer + threejs-specialist)
- [ ] Sezione Chi sono (frontend-developer)
- [ ] Sezione Progetti (dati da `src/lib/projects.ts`) (frontend-developer)
- [ ] Sezione Competenze (frontend-developer)
- [ ] Sezione Contatti (form/mailto + link social) (frontend-developer)

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
