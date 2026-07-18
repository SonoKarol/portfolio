import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import {
  GITHUB_PROFILE_URL,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_URL,
  THEME_COLOR_DARK,
  THEME_COLOR_LIGHT,
} from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // PLACEHOLDER finché l'alias Vercel reale non è noto — vedi src/lib/site.ts.
  metadataBase: new URL(SITE_URL),
  // `default` = titolo della home (già completo, contiene il nome);
  // `template` = suffisso di brand per le pagine figlie che definiscono un
  // titolo proprio (es. case study → "Portfolio 3D — Case study — Karol").
  // Il template NON si applica a `default`, quindi la home resta
  // "Karol — Portfolio" senza ripetizioni.
  title: {
    default: SITE_NAME,
    template: "%s — Karol",
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "Karol",
    "portfolio",
    "creative developer",
    "Three.js",
    "React",
    "Next.js",
    "3D",
    "web developer",
  ],
  authors: [{ name: "Karol", url: GITHUB_PROFILE_URL }],
  creator: "Karol",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: SITE_NAME,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    // L'immagine è generata da src/app/opengraph-image.tsx (convenzione App Router).
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    // Riusa automaticamente opengraph-image.tsx (nessun twitter-image dedicato).
  },
  robots: {
    index: true,
    follow: true,
  },
};

/*
 * Anti-FOUC del tema: riapplica la scelta salvata PRIMA che il contenuto
 * venga dipinto. Lo script è inline e parser-blocking come primo figlio del
 * body (stesso pattern di next-themes): quando il parser lo esegue non è
 * ancora stato dipinto nulla del contenuto → nessun flash del tema sbagliato.
 * Dark = default: senza chiave salvata (o con storage negato) resta dark.
 * Deve restare in sync con STORAGE_KEY in src/components/ui/ThemeToggle.tsx.
 *
 * Lo stesso script crea anche `<meta name="theme-color">` (colore della barra
 * del browser su mobile) coerente col tema già al primo paint. Il meta NON è
 * dichiarato nei metadata/viewport di Next di proposito: sarebbe un nodo
 * gestito da React nel <head>, che a ogni render potrebbe sovrascrivere il
 * valore mutato a mano dal toggle. Creandolo qui il nodo è fuori dall'albero
 * React: un solo proprietario (questo script + ThemeToggle), nessun conflitto
 * e nessun impatto sull'idratazione.
 * La lettura di localStorage ha un try/catch proprio: se lo storage è negato
 * il tema resta dark ma il meta viene comunque creato.
 *
 * I valori interpolati passano da `jsString` (difesa in profondità): oggi sono
 * costanti hex fidate in src/lib/site.ts, ma così anche un valore con apici,
 * backslash o `</script>` resterebbe una stringa JS valida, senza poter uscire
 * dal literal né chiudere il tag.
 */
/** Serializza un valore come string literal JS sicuro dentro `<script>`. */
function jsString(value: string): string {
  return JSON.stringify(value).replace(/</g, "\\u003c");
}

const themeInitScript = `(function(){var t="dark";try{if(localStorage.getItem("theme")==="light")t="light"}catch(e){}if(t==="light")document.documentElement.dataset.theme="light";var m=document.createElement("meta");m.setAttribute("name","theme-color");m.setAttribute("content",t==="light"?${jsString(THEME_COLOR_LIGHT)}:${jsString(THEME_COLOR_DARK)});document.head.appendChild(m)})()`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: lo script inline può aggiungere `data-theme`
    // a <html> prima dell'idratazione — differenza attesa rispetto all'HTML
    // server (che è sempre dark), non un bug.
    // data-scroll-behavior="smooth": lo smooth scroll è dichiarato in CSS
    // (globals.css). Next 16 non lo rileva da solo e, senza questo attributo,
    // non lo disattiva durante le transizioni di route: navigando da una
    // pagina scrollata a /progetti/[slug] si vedrebbe una risalita animata
    // invece del salto istantaneo (+ warning in dev). La navigazione a solo
    // hash della one-page non è toccata (il router fa early-return).
    <html
      lang="it"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {children}
      </body>
    </html>
  );
}
