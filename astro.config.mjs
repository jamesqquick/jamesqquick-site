import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import netlify from "@astrojs/netlify/functions";
import tailwind from "@astrojs/tailwind";
import image from "@astrojs/image";

import partytown from "@astrojs/partytown";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  integrations: [
    mdx(),
    sitemap({
      customPages: [],
    }),
    tailwind(),
    image(),
    partytown(),
  ],
  output: "server",
  adapter: netlify(),
});
