import { Section } from "@/components/ui/Section";
import { projects, type Project } from "@/lib/projects";

function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="group flex h-full flex-col rounded-card border border-white/10 bg-white/[0.03] p-6 transition-[color,background-color,border-color,box-shadow,translate] duration-300 ease-out hover:border-violet-400/40 hover:bg-white/[0.05] hover:shadow-lg hover:shadow-violet-500/10 focus-within:border-violet-400/40 motion-safe:hover:-translate-y-1">
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-lg font-semibold tracking-tight text-zinc-50">
          {project.title}
        </h3>
        {project.placeholder ? (
          <span className="shrink-0 rounded-full border border-cyan-400/30 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
            In arrivo
          </span>
        ) : null}
      </div>

      <p className="mt-3 flex-1 text-sm leading-relaxed text-zinc-400">
        {project.description}
      </p>

      {/* Label unica per card: più liste "Tecnologie" identiche confonderebbero
          l'elenco landmark/liste degli screen reader. */}
      <ul
        className="mt-5 flex flex-wrap gap-2"
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

      {project.repoUrl || project.demoUrl ? (
        <div className="mt-5 flex flex-wrap gap-4 border-t border-white/5 pt-4 text-sm">
          {project.repoUrl ? (
            <a
              href={project.repoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="tap-target rounded-sm font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-violet-300 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
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
              className="tap-target rounded-sm font-medium text-zinc-300 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
            >
              Demo live
              <span className="sr-only">
                {" "}
                di {project.title} (si apre in una nuova scheda)
              </span>
            </a>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export function Projects() {
  return (
    <Section
      id="progetti"
      title="Progetti"
      intro="Una selezione in costruzione: i segnaposto verranno sostituiti man mano da progetti reali."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <ProjectCard key={project.slug} project={project} />
        ))}
      </div>
    </Section>
  );
}
