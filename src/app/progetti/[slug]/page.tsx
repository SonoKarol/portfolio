import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { caseStudyProjects, type Project } from "@/lib/projects";
import { SITE_NAME } from "@/lib/site";

/**
 * Pagina case study di un progetto curato (`/progetti/[slug]`).
 *
 * Le pagine esistono SOLO per le card curate locali con campo `caseStudy`
 * (src/lib/projects.ts): i repo mappati dalla GitHub API non hanno contenuto
 * redazionale, quindi niente pagina (e nessun link dalla loro card).
 * `dynamicParams = false` + `generateStaticParams` → tutte le pagine sono
 * prerenderizzate a build time e ogni slug sconosciuto è un 404 immediato,
 * senza render a runtime.
 *
 * Layout: pagina "piatta" senza scena 3D né isola dark — usa i design token
 * (bg-surface, scala zinc/violet/cyan), quindi segue il tema chiaro/scuro
 * senza codice dedicato. La navigazione di ritorno è garantita dalla navbar
 * (i cui link sono `/#sezione`, validi anche da qui) e dal link
 * "Tutti i progetti" in testa e in coda all'articolo.
 */

interface CaseStudyPageProps {
  params: Promise<{ slug: string }>;
}

export const dynamicParams = false;

export function generateStaticParams(): { slug: string }[] {
  return caseStudyProjects.map((project) => ({ slug: project.slug }));
}

function findProject(slug: string): Project | undefined {
  return caseStudyProjects.find((project) => project.slug === slug);
}

export async function generateMetadata({
  params,
}: CaseStudyPageProps): Promise<Metadata> {
  const { slug } = await params;
  const project = findProject(slug);
  if (!project) return {};

  const path = `/progetti/${project.slug}`;
  const title = `${project.title} — Case study`;

  return {
    // URL relativi risolti da `metadataBase` (layout.tsx).
    title,
    description: project.description,
    alternates: { canonical: path },
    openGraph: {
      // Ridefinito per intero: il merge dei metadata è per campo, non deep,
      // quindi l'openGraph del layout non verrebbe fuso con questo.
      type: "article",
      locale: "it_IT",
      url: path,
      siteName: SITE_NAME,
      title,
      description: project.description,
      // L'immagine resta opengraph-image.tsx della root (convenzione App
      // Router: vale anche per i segmenti annidati senza immagine propria).
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: project.description,
    },
  };
}

function BackLink({ className }: { className?: string }) {
  return (
    <Link
      href="/#progetti"
      className={`tap-target inline-flex items-center gap-1.5 rounded-sm text-sm font-medium text-zinc-400 transition-colors hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 ${className ?? ""}`}
    >
      <span aria-hidden="true">←</span> Tutti i progetti
    </Link>
  );
}

export default async function CaseStudyPage({ params }: CaseStudyPageProps) {
  const { slug } = await params;
  const project = findProject(slug);
  // Con `dynamicParams = false` gli slug fuori lista sono già 404 a livello di
  // routing; il guard resta come type narrowing e difesa in profondità.
  if (!project?.caseStudy) notFound();
  const { caseStudy } = project;

  return (
    <>
      {/* Skip link: primo elemento focusabile, visibile solo da tastiera */}
      <a
        href="#contenuto"
        className="sr-only z-[60] rounded-md bg-zinc-50 text-sm font-medium text-zinc-900 focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:px-4 focus:py-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-400"
      >
        Vai al contenuto
      </a>
      <Navbar />
      <main
        id="contenuto"
        className="flex min-h-svh flex-col bg-surface px-4 pt-nav sm:px-6"
      >
        <article className="mx-auto w-full max-w-3xl flex-1 py-12 sm:py-16">
          <BackLink />

          <header className="mt-8">
            <span
              aria-hidden="true"
              className="mb-4 block h-px w-12 bg-gradient-to-r from-brand-violet to-brand-cyan"
            />
            <p className="text-xs font-medium uppercase tracking-widest text-zinc-400">
              Case study
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tighter text-balance text-zinc-50 sm:text-4xl">
              {project.title}
            </h1>
            <p className="mt-4 text-base leading-relaxed text-pretty text-zinc-400">
              {caseStudy.intro}
            </p>

            {project.stack.length > 0 ? (
              <ul
                className="mt-6 flex flex-wrap gap-2"
                aria-label={`Tecnologie di ${project.title}`}
              >
                {project.stack.map((tech) => (
                  <li
                    key={tech}
                    className="rounded-full bg-violet-500/10 px-2.5 py-1 text-[11px] font-medium text-violet-200"
                  >
                    {tech}
                  </li>
                ))}
              </ul>
            ) : null}

            {project.repoUrl || project.demoUrl ? (
              <p className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {project.repoUrl ? (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target link-underline rounded-sm font-medium text-zinc-300 transition-colors hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                  >
                    Repository
                    <span className="sr-only">
                      {" "}
                      di {project.title} (GitHub, si apre in una nuova scheda)
                    </span>
                  </a>
                ) : null}
                {project.demoUrl ? (
                  <a
                    href={project.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tap-target link-underline rounded-sm font-medium text-zinc-300 transition-colors hover:text-cyan-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
                  >
                    Demo live
                    <span className="sr-only">
                      {" "}
                      di {project.title} (si apre in una nuova scheda)
                    </span>
                  </a>
                ) : null}
              </p>
            ) : null}
          </header>

          <div className="mt-12 space-y-12">
            <section aria-labelledby="sfida-titolo">
              <h2
                id="sfida-titolo"
                className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl"
              >
                La sfida
              </h2>
              <p className="mt-4 leading-relaxed text-pretty text-zinc-300">
                {caseStudy.sfida}
              </p>
            </section>

            <section aria-labelledby="soluzione-titolo">
              <h2
                id="soluzione-titolo"
                className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl"
              >
                La soluzione
              </h2>
              <div className="mt-4 space-y-4">
                {/* key posizionale: la lista è statica e ordinata (contenuto
                    redazionale in projects.ts), quindi l'indice è stabile e
                    non dipende dalla lunghezza del testo. */}
                {caseStudy.soluzione.map((paragraph, i) => (
                  <p
                    key={`${slug}-soluzione-${i}`}
                    className="leading-relaxed text-pretty text-zinc-300"
                  >
                    {paragraph}
                  </p>
                ))}
              </div>
            </section>

            {caseStudy.risultati && caseStudy.risultati.length > 0 ? (
              <section aria-labelledby="risultati-titolo">
                <h2
                  id="risultati-titolo"
                  className="text-xl font-semibold tracking-tight text-zinc-50 sm:text-2xl"
                >
                  Risultati
                </h2>
                <ul className="mt-4 space-y-3">
                  {caseStudy.risultati.map((item, i) => (
                    <li
                      key={`${slug}-risultato-${i}`}
                      className="flex gap-3 leading-relaxed text-pretty text-zinc-300"
                    >
                      <span
                        aria-hidden="true"
                        className="mt-2.5 h-px w-4 shrink-0 bg-gradient-to-r from-brand-violet to-brand-cyan"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}
          </div>

          <div className="mt-14 border-t border-white/5 pt-8">
            <BackLink />
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
