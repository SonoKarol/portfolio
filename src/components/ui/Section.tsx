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
 * (`scroll-mt`), landmark accessibile via `aria-labelledby`, heading con
 * accento gradiente violet→cyan coerente con l'hero.
 *
 * NOTA: `scroll-mt-20` (5rem) è accoppiato all'altezza della navbar fissa in
 * `src/components/layout/Navbar.tsx` (py-3 + contenuto ≈ 3rem, con margine di
 * sicurezza). Se cambi l'altezza della navbar, aggiorna anche questo offset.
 */
export function Section({ id, title, intro, children, className }: SectionProps) {
  const headingId = `${id}-titolo`;

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className={`scroll-mt-20 px-4 py-20 sm:px-6 sm:py-28 ${className ?? ""}`}
    >
      <div className="mx-auto w-full max-w-5xl">
        <span
          aria-hidden="true"
          className="mb-4 block h-px w-12 bg-gradient-to-r from-violet-500 to-cyan-400"
        />
        <h2
          id={headingId}
          className="text-3xl font-semibold tracking-tight text-zinc-50 sm:text-4xl"
        >
          {title}
        </h2>
        {intro ? (
          <p className="mt-3 max-w-2xl text-base text-zinc-400">{intro}</p>
        ) : null}
        <div className="mt-10">{children}</div>
      </div>
    </section>
  );
}
