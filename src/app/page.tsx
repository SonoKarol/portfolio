import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { Projects } from "@/components/sections/Projects";
import { Skills } from "@/components/sections/Skills";

export default function Home() {
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
      <main id="contenuto" className="flex min-h-svh flex-col bg-surface">
        <Hero />
        <About />
        <Projects />
        <Skills />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
