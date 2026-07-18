/**
 * Repo pubblici di SonoKarol via GitHub API, mappati sull'interfaccia
 * `Project` della sezione Progetti.
 *
 * SOLO SERVER: questo modulo va importato esclusivamente da Server Component
 * o codice server (legge `process.env.GITHUB_TOKEN`). Non installiamo il
 * pacchetto `server-only` per una singola guardia; se in futuro entrasse come
 * dipendenza, aggiungere `import "server-only"` qui in testa.
 *
 * Strategia (vedi architecture.md, entry [2026-07-18]):
 * - fetch lato server con `next: { revalidate: 3600 }` → il dato è raccolto a
 *   build time e rinfrescato via ISR al massimo una volta l'ora; il client non
 *   parla mai con GitHub.
 * - senza token (endpoint pubblico, 60 req/h per IP bastano con ISR). In
 *   produzione è consigliato `GITHUB_TOKEN` read-only nelle env Vercel (IP
 *   egress condivisi → rate limit condiviso); viene letto qui, solo lato
 *   build/server, mai esposto al client (architecture.md §5).
 * - fallback differenziato build/runtime:
 *   - a BUILD time (o in dev) qualunque errore (rete, rate limit, payload
 *     inatteso) → `getProjects()` restituisce i dati locali di
 *     `src/lib/projects.ts`. Nessun throw: la build non può fallire per
 *     colpa di GitHub.
 *   - a RUNTIME (revalidation ISR) l'errore viene rilanciato: Next scarta la
 *     rigenerazione fallita e continua a servire la pagina stale coi dati
 *     reali, invece di sostituirli col fallback per un'ora.
 */

import { projects as localProjects, type Project } from "@/lib/projects";
import { GITHUB_USERNAME } from "@/lib/site";

/** Interfaccia minima della risposta GitHub: solo i campi che usiamo. */
interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  fork: boolean;
  archived: boolean;
  language: string | null;
  topics?: string[];
}

/** Sotto questa soglia di card reali si integrano i segnaposto locali. */
const MIN_PROJECTS = 3;
/** Cap alle card provenienti dall'API (griglia max 2 righe da 3). */
const MAX_API_PROJECTS = 5;
/** Cap ai chip tecnologia per card (coerente con le card curate). */
const MAX_STACK_CHIPS = 4;

/** Type guard sui soli campi usati: scarta elementi malformati senza `any`. */
function isGitHubRepo(value: unknown): value is GitHubRepo {
  if (typeof value !== "object" || value === null) return false;
  const repo = value as Record<string, unknown>;
  return (
    typeof repo.name === "string" &&
    typeof repo.html_url === "string" &&
    typeof repo.fork === "boolean" &&
    typeof repo.archived === "boolean" &&
    (repo.description === null || typeof repo.description === "string") &&
    (repo.homepage === null || typeof repo.homepage === "string") &&
    (repo.language === null || typeof repo.language === "string") &&
    (repo.topics === undefined ||
      (Array.isArray(repo.topics) &&
        repo.topics.every((t) => typeof t === "string")))
  );
}

/** "il-mio-progetto" → "Il mio progetto" (titolo sobrio dal nome repo). */
function titleFromRepoName(name: string): string {
  const spaced = name.replace(/[-_]+/g, " ").trim();
  return spaced.charAt(0).toUpperCase() + spaced.slice(1);
}

/** True se `value` è un URL http(s) valido secondo il parser `URL`. */
function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

/**
 * `homepage` dei repo è testo libero: valida come URL http(s) reale.
 * Senza schema si ritenta con prefisso `https://` (caso comune
 * "example.com"); se comunque invalido → `undefined` (niente link).
 */
function normalizeDemoUrl(homepage: string | null): string | undefined {
  const trimmed = homepage?.trim();
  if (!trimmed) return undefined;
  if (isHttpUrl(trimmed)) return trimmed;
  if (!trimmed.includes("://")) {
    const withScheme = `https://${trimmed}`;
    if (isHttpUrl(withScheme)) return withScheme;
  }
  return undefined;
}

/**
 * Nome repo (lowercase) da un URL GitHub `https://github.com/{owner}/{repo}`,
 * o `null` se l'URL non è in quella forma.
 */
function repoNameFromUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    if (parsed.hostname !== "github.com") return null;
    const [, repo] = parsed.pathname.split("/").filter(Boolean);
    return repo ? repo.toLowerCase() : null;
  } catch {
    return null;
  }
}

function toProject(repo: GitHubRepo): Project {
  const topics = (repo.topics ?? []).slice(0, MAX_STACK_CHIPS);
  const stack =
    topics.length > 0 ? topics : repo.language ? [repo.language] : [];
  return {
    slug: `gh-${repo.name.toLowerCase()}`,
    title: titleFromRepoName(repo.name),
    // I filtri a monte garantiscono description non nulla; il `?? ""` è solo
    // per completezza di tipo.
    description: repo.description ?? "",
    stack,
    repoUrl: repo.html_url,
    demoUrl: normalizeDemoUrl(repo.homepage),
    placeholder: false,
  };
}

/**
 * Fetch dei repo. Al contrario del resto del modulo, qui si LANCIA su
 * qualunque fallimento (rete, `!res.ok`, payload non-array): è `getProjects()`
 * a decidere se assorbire l'errore (build/dev) o propagarlo (revalidation).
 */
async function fetchRepos(): Promise<GitHubRepo[]> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  // Opzionale, solo lato server (mai NEXT_PUBLIC_): alza il rate limit.
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `https://api.github.com/users/${GITHUB_USERNAME}/repos?per_page=100&sort=pushed`,
    { headers, next: { revalidate: 3600 } },
  );
  if (!res.ok) {
    throw new Error(`GitHub API: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error("GitHub API: payload inatteso (non è un array)");
  }
  return data.filter(isGitHubRepo);
}

/**
 * True quando un errore GitHub va assorbito col fallback locale invece di
 * essere propagato: durante la build di produzione (la build non deve mai
 * fallire per GitHub) e in dev (niente pagina d'errore in locale offline).
 * A runtime (revalidation ISR) si propaga: la pagina è stata comunque
 * prerenderizzata a build time, quindi Next ha SEMPRE una copia stale da
 * servire e scarta solo la rigenerazione fallita.
 */
function shouldFallBackOnError(): boolean {
  return (
    process.env.NEXT_PHASE === "phase-production-build" ||
    process.env.NODE_ENV !== "production"
  );
}

/**
 * Lista finale per la sezione Progetti:
 * - card curate locali (il portfolio stesso) sempre per prime — i repo già
 *   coperti da una card curata (nomi derivati dai loro `repoUrl`) sono
 *   esclusi dai risultati API per evitare duplicati;
 * - poi i repo reali (no fork, no archiviati, no senza descrizione),
 *   già ordinati per ultimo push dall'API;
 * - segnaposto "In arrivo" solo se le card reali sono meno di MIN_PROJECTS.
 * - se l'API non risponde: fallback locale a build/dev, throw a runtime
 *   (vedi `shouldFallBackOnError`).
 */
export async function getProjects(): Promise<Project[]> {
  let repos: GitHubRepo[];
  try {
    repos = await fetchRepos();
  } catch (error) {
    if (shouldFallBackOnError()) return localProjects;
    // Revalidation ISR: rilancia → Next serve la pagina stale coi dati reali.
    throw error;
  }

  const curated = localProjects.filter((p) => !p.placeholder);
  const placeholders = localProjects.filter((p) => p.placeholder);

  // Repo già rappresentati da una card curata (es. `portfolio`): esclusi.
  const curatedRepoNames = new Set(
    curated.flatMap((p) => {
      const name = p.repoUrl ? repoNameFromUrl(p.repoUrl) : null;
      return name ? [name] : [];
    }),
  );

  const fromApi = repos
    .filter(
      (repo) =>
        !repo.fork &&
        !repo.archived &&
        repo.description !== null &&
        repo.description.trim() !== "" &&
        !curatedRepoNames.has(repo.name.toLowerCase()),
    )
    .slice(0, MAX_API_PROJECTS)
    .map(toProject);

  const merged = [...curated, ...fromApi];
  if (merged.length >= MIN_PROJECTS) return merged;
  return [...merged, ...placeholders.slice(0, MIN_PROJECTS - merged.length)];
}
