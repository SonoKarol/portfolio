/**
 * Dati della sezione Progetti. Fonte locale per ora; in backlog c'è
 * l'idea di popolare la lista via GitHub API (repo reali di SonoKarol).
 */

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
