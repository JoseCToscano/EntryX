import { type MetadataRoute } from "next";
import { headers } from "next/headers";

export default function robots(): MetadataRoute.Robots {
  const headersList = headers();
  const domain = headersList.get("host")!;

  return {
    rules: {
      userAgent: "*",
      disallow: "/api/",
      allow: "/api/og/",
    },
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
