/** Costanti condivise del sito (contatti, link esterni, SEO). */

export const CONTACT_EMAIL = "bonfiglio.karol.p@gmail.com";
export const GITHUB_USERNAME = "SonoKarol";
export const GITHUB_PROFILE_URL = `https://github.com/${GITHUB_USERNAME}`;

/**
 * URL di produzione: dominio Vercel del progetto (alias stabile
 * `<progetto>-<scope>.vercel.app`). Usato per metadataBase, sitemap e robots.
 */
export const SITE_URL = "https://portfolio-karol1.vercel.app";

/**
 * Colori della barra del browser (`<meta name="theme-color">`), gestita
 * imperativamente: script anti-FOUC in layout.tsx al primo paint, poi
 * ThemeToggle a ogni cambio tema. Devono restare in sync con i token di
 * `src/app/globals.css`: `--background` (dark) e `--surface-light` (light).
 */
export const THEME_COLOR_DARK = "#08060f";
export const THEME_COLOR_LIGHT = "#f6f5fb";

export const SITE_NAME = "Karol — Portfolio";
export const SITE_DESCRIPTION =
  "Portfolio di Karol: creative developer. Siti web moderni e interattivi con animazioni 3D in Three.js, React e Next.js.";
