import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify/functions";
import svelte from "@astrojs/svelte";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  integrations: [mdx(), sitemap({}), tailwind(), svelte()],
  output: "server",
  adapter: netlify(),
});
