import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Private gifts, the editor and account pages have nothing for search.
      disallow: ["/for/", "/g/", "/studio", "/preview/", "/make", "/my-gifts", "/profile", "/sign-in", "/sent/", "/api/"],
    },
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
