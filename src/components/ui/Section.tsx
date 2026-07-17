import type { ReactNode } from "react";

interface SectionProps {
  /** id dell'àncora (es. "progetti" → #progetti). */
  id: string;
  title: string;
  /** Sottotitolo opzionale sotto il titolo. */
  intro?: string;
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper di sezione della one-page: àncora con offset per la navbar fissa
 * (`scroll-mt-nav`, token `--spacing-nav` in globals.css), landmark
 * accessibile via `aria-labelledby`, heading con accento gradiente
 * brand-violet→brand-cyan coerente con l'hero.
 *
 * La classe `reveal` (globals.css) applica il fade+rise scroll-driven al
 * contenuto: puro CSS, nessun effetto senza supporto o con reduced-motion.
 */
export function Section({ id, title, intro, children, className }: SectionProps) {
  const headingId = `${id}-titolo`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-nav px-4 py-20 sm:px-6 sm:py-28 ${className ?? ""}`}
    >
      <div className="reveal mx-auto w-full max-w-5xl">
        <span
          aria-hidden="true"
          className="mb-4 block h-px w-12 bg-gradient-to-r from-brand-violet to-brand-cyan"
        />
        <h2
          id={headingId}
          className="text-3xl font-semibold tracking-tight text-balance text-zinc-50 sm:text-4xl"
        >
          {title}
        </h2>
        {intro ? (
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-pretty text-zinc-400">
            {intro}
          </p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
