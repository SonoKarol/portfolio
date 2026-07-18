const links = [
  { href: "/#chi-sono", label: "Chi sono" },
  { href: "/#progetti", label: "Progetti" },
  { href: "/#competenze", label: "Competenze" },
  { href: "/#contatti", label: "Contatti" },
] as const;

import Link from "next/link";
import { AudioToggle } from "@/components/ui/AudioToggle";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

/**
 * Navbar fissa in alto, senza JavaScript proprio: solo link àncora alle
 * sezioni. Gli href sono `/#sezione` (non `#sezione`) via `next/link`, così
 * la navbar funziona anche dalle route interne (`/progetti/[slug]`): sulla
 * home il router riconosce lo stesso path e fa solo lo scroll all'àncora
 * (scrollIntoView, che rispetta lo smooth scroll CSS — nessun reload, la
 * one-page resta tale); dalle altre route è una navigazione client verso la
 * home con scroll alla sezione. Le uniche isole client sono `<AudioToggle>` e `<ThemeToggle>`
 * (pochi KB ciascuna, motivazioni nei componenti; il motore audio vero e
 * proprio è un dynamic import caricato solo se l'utente attiva l'audio). Lo smooth scroll è delegato al CSS (`scroll-behavior: smooth`
 * in globals.css, attivo solo senza prefers-reduced-motion).
 *
 * `light:bg-surface/90`: nel tema chiaro la velatura sale da 70% a 90% —
 * quando la navbar chiara sta sopra l'hero (che resta scuro anche in light)
 * il testo scuro dei link manterrebbe solo ~3.5:1 al 70%; al 90% i contrasti
 * tornano AA (link 5.7:1, focus ring 4.4:1 — calcoli in architecture.md
 * [2026-07-18]).
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
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/5 bg-surface/70 backdrop-blur-md light:bg-surface/90">
      <nav
        aria-label="Navigazione principale"
        className="mx-auto flex w-full max-w-5xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 py-3 sm:px-6"
      >
        <Link
          href="/#hero"
          className="link-underline tap-target rounded-sm text-sm font-semibold tracking-tight text-zinc-50 transition-colors hover:text-violet-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
        >
          Karol
        </Link>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
          <ul className="flex flex-wrap items-center gap-x-4 gap-y-2 sm:gap-x-6">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="link-underline tap-target rounded-sm text-xs text-zinc-400 transition-colors hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400 sm:text-sm"
                >
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
          <AudioToggle />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
