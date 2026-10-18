import type { AstroGlobal } from "astro";

export function skipSharedCache(
  astro: Pick<AstroGlobal, "cache" | "response">
): void {
  if (astro.cache?.enabled) astro.cache.set(false);
  astro.response.headers.set("Cache-Control", "no-store");
}
