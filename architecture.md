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
