"use client";

import { useSyncExternalStore } from "react";
import { THEME_COLOR_DARK, THEME_COLOR_LIGHT } from "@/lib/site";

/**
 * Toggle tema chiaro/scuro (unico client component della navbar).
 *
 * La navbar resta Server Component: questa è una foglia client isolata di
 * pochi KB — coerente con la filosofia zero-JS-inutile del progetto (il
 * toggle richiede per forza JS: localStorage + mutazione di `data-theme`).
 *
 * Stato: due temi, default = dark (nessun auto-switch su
 * `prefers-color-scheme`, vedi globals.css/architecture.md). La fonte di
 * verità a runtime è l'attributo `data-theme` su <html>, impostato prima del
 * paint dallo script inline in layout.tsx e letto qui via
 * useSyncExternalStore: il server snapshot è `false` (dark), quindi l'HTML
 * SSR coincide col primo render client e non c'è mismatch di idratazione;
 * subito dopo l'idratazione lo snapshot reale aggiorna `aria-pressed`.
 * L'icona invece è scelta da CSS su `data-theme` (globals.css), quindi è
 * corretta già al primo paint, prima dell'idratazione.
 */

const STORAGE_KEY = "theme";
const CHANGE_EVENT = "portfolio:theme-change";

type Theme = "dark" | "light";

/**
 * Barra del browser su mobile: il `<meta name="theme-color">` è creato dallo
 * script anti-FOUC in layout.tsx (fuori dall'albero React, così React non lo
 * sovrascrive mai) e qui viene solo aggiornato. Il `createElement` di riserva
 * copre il caso limite in cui lo script non fosse girato.
 */
function applyThemeColor(theme: Theme): void {
  let meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (!meta) {
    meta = document.createElement("meta");
    meta.setAttribute("name", "theme-color");
    document.head.appendChild(meta);
  }
  meta.setAttribute(
    "content",
    theme === "light" ? THEME_COLOR_LIGHT : THEME_COLOR_DARK,
  );
}

function applyTheme(theme: Theme): void {
  if (theme === "light") {
    document.documentElement.dataset.theme = "light";
  } else {
    // Dark = default: nessun attributo (stesso stato dell'HTML server).
    delete document.documentElement.dataset.theme;
  }
  applyThemeColor(theme);
}

function subscribe(onStoreChange: () => void): () => void {
  // Sync fra tab: l'evento `storage` arriva dalle ALTRE tab, che non hanno
  // ancora l'attributo aggiornato — lo si applica prima di notificare React.
  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return;
    applyTheme(event.newValue === "light" ? "light" : "dark");
    onStoreChange();
  };
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): boolean {
  return document.documentElement.dataset.theme === "light";
}

function getServerSnapshot(): boolean {
  return false;
}

export function ThemeToggle() {
  const isLight = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggle = (): void => {
    const next: Theme = getSnapshot() ? "dark" : "light";
    applyTheme(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Storage negato (es. Safari private mode): il tema vale comunque
      // per la sessione corrente, semplicemente non persiste.
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={isLight}
      aria-label="Tema chiaro"
      className="tap-target inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-white/20 hover:text-zinc-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-400"
    >
      {/* Icone mostrate/nascoste da CSS su data-theme (globals.css). */}
      <svg
        data-theme-icon="sun"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        className="h-4 w-4"
      >
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2.5v2.2m0 14.6v2.2M4.6 4.6l1.6 1.6m11.6 11.6 1.6 1.6M2.5 12h2.2m14.6 0h2.2M4.6 19.4l1.6-1.6M17.8 6.2l1.6-1.6" />
      </svg>
      <svg
        data-theme-icon="moon"
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
      </svg>
    </button>
  );
}
