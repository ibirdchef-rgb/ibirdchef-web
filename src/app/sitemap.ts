import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/site";
import { paths } from "@/lib/paths";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = getSiteUrl();

  return [
    { url: siteUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}${paths.menu}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}${paths.services}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}${paths.contact}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
    { url: `${siteUrl}${paths.seattle}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}${paths.bellevue}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}${paths.bayArea}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.85 },
    { url: `${siteUrl}${paths.privateEvents}`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}${paths.privacy}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.3 },
    { url: `${siteUrl}${paths.terms}`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.4 },
  ];
}
