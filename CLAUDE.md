# CLAUDE.md — Portfolio 3D

Contesto di progetto per Claude Code e i subagent. Leggi questo file per intero prima di lavorare.

## Cos'è

Portfolio personale di **Karol** (GitHub: `SonoKarol`): un sito web "figo", moderno e interattivo, con **animazioni 3D realizzate con Three.js**. Deve fare colpo a livello visivo pur restando veloce, accessibile e usabile su mobile. Il codice vive su GitHub e viene deployato (Vercel o GitHub Pages).

## Obiettivi

- Landing immersiva con una scena 3D Three.js come elemento centrale (hero).
- Sezioni: Hero, Chi sono, Progetti, Competenze, Contatti.
- Interazioni 3D fluide (mouse/scroll/touch) senza sacrificare le performance.
- Deploy continuo: push su GitHub → deploy automatico.

## Stack (decisione di partenza — vedi architecture.md)

- **Framework**: Next.js (App Router) + React + TypeScript.
- **3D**: Three.js tramite **react-three-fiber** + **@react-three/drei** (helper) e **@react-three/postprocessing** (effetti).
- **Styling**: Tailwind CSS.
- **Animazioni 2D/transizioni**: Framer Motion + (opzionale) GSAP/Lenis per scroll.
- **Deploy**: Vercel (preferito) collegato al repo GitHub.
- **Hosting repo**: GitHub, account `SonoKarol`.

Se un subagent vuole cambiare una scelta di stack, deve prima aggiornare `architecture.md` motivando la decisione.

## Principi di lavoro

- **Mobile-first e performance-first**: il 3D deve degradare con grazia su dispositivi deboli (riduci draw call, usa `dpr` limitato, lazy-load della scena, fallback statico se WebGL non è disponibile o se `prefers-reduced-motion` è attivo).
- **TypeScript strict**, nessun `any` gratuito.
- **Commit piccoli e frequenti**, messaggi chiari.
- **Accessibilità**: contrasto, focus visibili, navigazione da tastiera, `prefers-reduced-motion`.
- Non committare segreti. `.env*` va in `.gitignore`.

## Come lavorano i subagent

Il lavoro è suddiviso tra subagent specializzati definiti in `.claude/agents/`. Ognuno ha un ruolo:

- **threejs-specialist** — scene, materiali, shader, ottimizzazione 3D.
- **frontend-developer** — struttura Next.js, componenti UI, layout, contenuti.
- **design-director** — direzione artistica, palette, tipografia, UX, motion.
- **github-deploy** — git, repo GitHub, CI e deploy su Vercel.
- **code-reviewer** — review di qualità, performance e sicurezza prima del merge.

Regole di coordinamento:
1. Consulta sempre `architecture.md` (decisioni tecniche) e `todo.md` (stato lavori) prima di iniziare.
2. Aggiorna `todo.md` quando prendi/completi un task.
3. Decisioni architetturali → registrale in `architecture.md`.
4. Prima di un merge/deploy, fai passare **code-reviewer**.

## File di riferimento

- `architecture.md` — decisioni tecniche, struttura, stack, trade-off.
- `todo.md` — roadmap e stato dei task.
- `.claude/settings.json` — permessi/tool consentiti per le sessioni e i subagent.
- `.claude/agents/*.md` — definizioni dei subagent.

## Stato attuale

Progetto appena inizializzato: presenti solo scaffold e documentazione. Nessun codice applicativo ancora scritto. Prossimi passi in `todo.md`.
