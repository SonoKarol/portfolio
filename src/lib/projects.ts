/**
 * Dati locali della sezione Progetti. La fonte primaria sono i repo reali
 * di SonoKarol via GitHub API (`src/lib/github.ts`, `getProjects()`);
 * questa lista è il fallback completo se il fetch fallisce e la fonte
 * della card curata del portfolio e dei segnaposto "In arrivo".
 *
 * Nota: i `repoUrl` delle card curate determinano anche i repo esclusi dai
 * risultati API in `github.ts` (niente duplicati card curata / card API).
 */

/**
 * Contenuto redazionale della pagina case study (`/progetti/[slug]`).
 * Presente SOLO sulle card curate locali: i repo mappati dalla GitHub API
 * non hanno contenuto redazionale, quindi non generano pagine dedicate.
 */
export interface CaseStudy {
  /** Sommario mostrato sotto il titolo della pagina. */
  intro: string;
  /** Contesto e obiettivi ("La sfida"), un solo paragrafo. */
  sfida: string;
  /** Approccio e scelte tecniche ("La soluzione"), un paragrafo per voce. */
  soluzione: string[];
  /** Punti chiave ("Risultati"), resi come elenco puntato. Opzionale. */
  risultati?: string[];
}

export interface Project {
  slug: string;
  title: string;
  description: string;
  /** Tecnologie principali, mostrate come chip sulla card. */
  stack: string[];
  repoUrl?: string;
  demoUrl?: string;
  /** True per i segnaposto: la card mostra il badge "In arrivo". */
  placeholder: boolean;
  /** Se presente, la card linka la pagina dedicata `/progetti/[slug]`. */
  caseStudy?: CaseStudy;
}

export const projects: Project[] = [
  {
    slug: "portfolio-3d",
    title: "Portfolio 3D",
    description:
      "Questo sito: one-page con scena Three.js procedurale nell'hero — shader custom, particelle e post-processing — con fallback statico e rispetto di prefers-reduced-motion.",
    stack: ["Next.js", "TypeScript", "React Three Fiber", "Tailwind CSS"],
    repoUrl: "https://github.com/SonoKarol/portfolio",
    placeholder: false,
    caseStudy: {
      intro:
        "Il sito che stai guardando: una one-page immersiva con una scena 3D procedurale come hero, costruita per essere veloce, accessibile e usabile anche su mobile.",
      sfida:
        "Un portfolio deve colpire in pochi secondi, ma un hero 3D pesante rischia di rovinare proprio la prima impressione: caricamento lento, batteria consumata, animazioni che ignorano le preferenze di accessibilità. L'obiettivo era una scena d'impatto senza pagare questi costi.",
      soluzione: [
        "La scena è interamente procedurale, senza modelli o texture da scaricare: un icosaedro deformato da rumore simplex nel vertex shader, con fresnel e gradiente violet–cyan, più un campo di particelle animato anch'esso in shader. Tutto si risolve in due draw call, con bloom e vignette in post-processing.",
        "Il codice 3D (Three.js e React Three Fiber) è caricato in lazy con dynamic import e non pesa sul caricamento iniziale della pagina; se WebGL non è disponibile, o se l'utente preferisce ridurre il movimento, al suo posto compare un fallback statico coerente con la palette. Quando l'hero esce dal viewport, il render loop si ferma del tutto per risparmiare GPU e batteria.",
        "L'interfaccia è quasi interamente Server Component: smooth scroll e reveal delle sezioni sono CSS puro, il tema chiaro/scuro è un override di design token con script anti-flash, e la sezione progetti legge i repository reali da GitHub con rigenerazione incrementale lato server. Contrasti verificati in entrambi i temi, focus ring visibili e target touch da 44px.",
      ],
      risultati: [
        "JavaScript iniziale ridotto al solo framework: il chunk della scena 3D arriva dopo, in lazy, senza toccare il primo render.",
        "Due draw call di scena e zero asset 3D esterni da scaricare.",
        "Fallback statico con WebGL assente o prefers-reduced-motion attivo; contrasti del testo sempre almeno AA.",
        "Lista progetti aggiornata automaticamente dai repository GitHub, con rigenerazione al massimo una volta l'ora.",
      ],
    },
  },
  {
    slug: "progetto-in-arrivo-1",
    title: "Esperimento WebGL",
    description:
      "Segnaposto: qui arriverà un esperimento interattivo con shader e generazione procedurale. In lavorazione.",
    stack: ["Three.js", "GLSL", "TypeScript"],
    placeholder: true,
  },
  {
    slug: "progetto-in-arrivo-2",
    title: "App web full-stack",
    description:
      "Segnaposto: qui arriverà un progetto applicativo con frontend React e API Node. In lavorazione.",
    stack: ["React", "Node.js", "TypeScript"],
    placeholder: true,
  },
];

/**
 * Progetti con pagina case study dedicata (`/progetti/[slug]`).
 * Per costruzione solo card curate locali non-segnaposto: è la fonte di
 * `generateStaticParams` e delle entry extra della sitemap.
 */
export const caseStudyProjects: Project[] = projects.filter(
  (project) => !project.placeholder && project.caseStudy !== undefined,
);
