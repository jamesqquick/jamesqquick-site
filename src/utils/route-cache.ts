import type { AstroGlobal } from "astro";

/**
 * Keep a response out of every cache. `cache.set(false)` drops the route
 * rule's Workers Cache headers; `no-store` also stops browsers from reusing it.
 */
export function skipSharedCache(
  astro: Pick<AstroGlobal, "cache" | "response">
): void {
  if (astro.cache?.enabled) astro.cache.set(false);
  astro.response.headers.set("Cache-Control", "no-store");
}
