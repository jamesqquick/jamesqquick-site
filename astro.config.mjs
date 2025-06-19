import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";

import tailwindConfigViewer from "astro-tailwind-config-viewer";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  integrations: [
    mdx(),
    sitemap({}),
    tailwind(),
    svelte(),
    icon({
      include: {
        // Include only three `mdi` icons in the bundle
        mdi: [
          "close",
          "account-plus",
          "arrow-left",
          "arrow-right",
          "menu",
          "account",
          "laptop",
          "star-outline",
          "download",
        ],
      },
    }),
    tailwindConfigViewer(),
  ],
  output: "server",
  adapter: netlify(),
  experimental: {
    contentLayer: true,
    contentIntellisense: true,
  },
});
