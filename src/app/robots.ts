import { MetadataRoute } from "next";
import { getSeoSettings } from "@/lib/services/karmaxService";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const seo = await getSeoSettings();
  const baseUrl = (seo.siteUrl || "https://karmax.mx").replace(/\/$/, "");

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/api/", "/mis-cotizaciones"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
