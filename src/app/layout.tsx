import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { GITHUB_PROFILE_URL, SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
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
  title: SITE_NAME,
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="it"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
