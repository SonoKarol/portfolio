const links = [
  { href: "#chi-sono", label: "Chi sono" },
  { href: "#progetti", label: "Progetti" },
  { href: "#competenze", label: "Competenze" },
  { href: "#contatti", label: "Contatti" },
] as const;

/**
 * Navbar fissa in alto, senza JavaScript: solo link àncora alle sezioni.
 * Lo smooth scroll è delegato al CSS (`scroll-behavior: smooth` in
 * globals.css, attivo solo senza prefers-reduced-motion).
 *
 * NOTA: l'altezza di questa navbar è compensata dal token `--spacing-nav`
 * (globals.css), usato come `scroll-mt-nav` in `src/components/ui/Section.tsx`.
 * Se ne cambi altezza/padding, aggiorna quel token.
 *
 * ECCEZIONE NOTA (review Fase 4, accettata): sotto ~330px la <ul> va a capo
 * (`flex-wrap`) e le aree tap 44px di `.tap-target` (attive solo su
 * `pointer: coarse`) delle due righe si sovrappongono di qualche px
 * nonostante `gap-y-2`. Eliminare l'overlap richiederebbe un gap ~28px,
 * sproporzionato per un edge case sotto i 330px; i target restano comunque
 * ben sopra il minimo AA 24px di WCAG 2.5.8 e centrati sul proprio link.
 */
export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-surface/70 backdrop-blur-md">
      <nav
        aria-label="Navigazione principale"
        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6"
      >
        <a
          href="#hero"
          className="link-underline tap-target rounded-sm text-sm font-semibold tracking-tight text-zinc-50 transition-colors hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
        >
          Karol
        </a>
        <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="link-underline tap-target rounded-sm text-xs text-zinc-400 transition-colors hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:text-sm"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
