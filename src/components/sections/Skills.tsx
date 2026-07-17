import { Section } from "@/components/ui/Section";
import { skillGroups } from "@/lib/skills";

export function Skills() {
  return (
    <Section
      id="competenze"
      title="Competenze"
      intro="Gli strumenti con cui lavoro ogni giorno, dal frontend al 3D in tempo reale."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {skillGroups.map((group) => (
          <div
            key={group.title}
            className="rounded-card border border-white/10 bg-white/[0.03] p-5 transition-colors duration-300 ease-out hover:border-white/20"
          >
            <h3 className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
              {group.title}
            </h3>
            <ul className="mt-4 flex flex-wrap gap-2">
              {group.skills.map((skill) => (
                <li
                  key={skill}
                  className="rounded-full border border-white/10 px-3 py-1 text-xs text-zinc-200"
                >
                  {skill}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}
