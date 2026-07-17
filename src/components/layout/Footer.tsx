import { GITHUB_PROFILE_URL } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-white/5 px-4 py-8 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col items-center justify-between gap-3 text-center text-xs text-zinc-400 sm:flex-row sm:text-left">
        <p>© {new Date().getFullYear()} Karol · Creative developer</p>
        <p className="flex items-center gap-4">
          <a
            href={GITHUB_PROFILE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="link-underline tap-target rounded-sm text-zinc-400 transition-colors hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
          >
            GitHub
            <span className="sr-only"> (si apre in una nuova scheda)</span>
          </a>
          <span aria-hidden="true">·</span>
          <span>Fatto con Next.js, Three.js e Tailwind CSS</span>
        </p>
      </div>
    </footer>
  );
}
