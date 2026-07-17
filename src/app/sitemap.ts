import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/** Sitemap del sito one-page: una sola entry, la root. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
  ];
}
