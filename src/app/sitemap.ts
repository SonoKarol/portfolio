import type { MetadataRoute } from "next";
import { caseStudyProjects } from "@/lib/projects";
import { SITE_URL } from "@/lib/site";

/**
 * Sitemap: la root (sito one-page, le sezioni sono àncore e non pagine) più
 * una entry per ogni case study prerenderizzato — la stessa lista che alimenta
 * `generateStaticParams` in `src/app/progetti/[slug]/page.tsx`, così sitemap e
 * route non possono divergere.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: SITE_URL,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    ...caseStudyProjects.map((project) => ({
      url: `${SITE_URL}/progetti/${project.slug}`,
      lastModified,
      // Contenuto redazionale: cambia meno spesso della home, che segue anche
      // i repo GitHub. Priorità sotto la root ma alta: sono pagine di merito.
      changeFrequency: "yearly" as const,
      priority: 0.8,
    })),
  ];
}
