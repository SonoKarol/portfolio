import { Section } from "@/components/ui/Section";

export function About() {
  return (
    <Section id="chi-sono" title="Chi sono">
      <div className="max-w-2xl space-y-5 text-base leading-relaxed text-pretty text-zinc-300 sm:text-lg">
        <p>
          Ciao, sono Karol: un creative developer. Costruisco esperienze web
          che uniscono codice, design e 3D in tempo reale — siti che non si
          limitano a mostrare contenuti, ma reagiscono a chi li esplora.
        </p>
        <p>
          Il mio terreno preferito è l&apos;incrocio tra{" "}
          <span className="text-violet-300">React e TypeScript</span> da una
          parte e <span className="text-cyan-300">Three.js e gli shader</span>{" "}
          dall&apos;altra: interfacce solide e accessibili con dentro qualcosa
          di vivo. Mi piace curare i dettagli che si sentono più di quanto si
          vedano: performance, micro-interazioni, rispetto delle preferenze di
          chi naviga.
        </p>
        <p>
          Questo portfolio è esso stesso un progetto in evoluzione: lo sto
          costruendo in pubblico, un commit alla volta.
        </p>
      </div>
    </Section>
  );
}
