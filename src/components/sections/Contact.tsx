import { Section } from "@/components/ui/Section";
import { CONTACT_EMAIL, GITHUB_PROFILE_URL } from "@/lib/site";

export function Contact() {
  return (
    <Section
      id="contatti"
      title="Contatti"
      intro="Hai un progetto in mente o vuoi semplicemente fare due chiacchiere? Scrivimi."
    >
      <div className="flex flex-col items-start gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <a
            href={`mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(
              "Contatto dal portfolio",
            )}`}
            className="inline-flex items-center justify-center rounded-full bg-zinc-50 px-6 py-3 text-sm font-semibold text-zinc-900 transition-[color,background-color,box-shadow,translate] duration-200 ease-out hover:bg-white hover:shadow-lg hover:shadow-violet-500/20 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 motion-safe:hover:-translate-y-0.5"
          >
            Scrivimi una mail
          </a>
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 px-6 py-3 text-sm font-semibold text-violet-200 transition-[color,background-color,border-color,box-shadow,translate] duration-200 ease-out hover:border-violet-300/60 hover:bg-violet-500/20 hover:shadow-lg hover:shadow-violet-500/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 motion-safe:hover:-translate-y-0.5"
          >
            GitHub — SonoKarol
            <span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
        </div>
        <p className="text-sm text-zinc-400">
          Oppure copia l&apos;indirizzo:{" "}
          <a
            href={`mailto:${CONTACT_EMAIL}`}
            className="tap-target rounded-sm font-mono text-zinc-300 underline-offset-4 transition-colors hover:text-cyan-300 hover:underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
          >
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </Section>
  );
}
