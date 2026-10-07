import type { APIRoute } from "astro";
import { getSiteSettings } from "emdash";

const DEFAULT_ROBOTS = [
  "User-agent: *",
  "Allow: /",
  "",
  "# Disallow admin and API routes",
  "Disallow: /_emdash/",
].join("\n");

export const GET: APIRoute = async ({ site, url }) => {
  let robotsTxt: string | undefined;
  let baseUrl: string | URL = site ?? url;

  try {
    const settings = await getSiteSettings();
    robotsTxt = settings.seo?.robotsTxt;
    baseUrl = settings.url ?? baseUrl;
  } catch {
    // Keep robots.txt available when EmDash settings are unavailable.
  }

  const sitemapUrl = new URL("/sitemap-index.xml", baseUrl).href;
  const content = robotsTxt?.trimEnd() || DEFAULT_ROBOTS;
  const hasSitemapIndex = content.split(/\r?\n/).some((line) => {
    const directive = line.match(/^\s*sitemap:\s*(\S+)\s*$/i);
    return directive?.[1] === sitemapUrl;
  });

  return new Response(
    hasSitemapIndex ? `${content}\n` : `${content}\n\nSitemap: ${sitemapUrl}\n`,
    {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=86400",
      },
    }
  );
};
