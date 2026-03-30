import type { CollectionEntry } from "astro:content";
import { getCollection } from "astro:content";

/**
 * Static paths for a content collection where each entry maps to `params.slug === entry.id`.
 */
export async function getEntryStaticPaths<C extends "blog" | "talk">(
  name: C
): Promise<
  { params: { slug: string }; props: { entry: CollectionEntry<C> } }[]
> {
  const entries = await getCollection(name);
  return entries.map((entry) => ({
    params: { slug: entry.id },
    props: { entry },
  }));
}
