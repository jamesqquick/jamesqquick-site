import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify/functions";
import svelte from "@astrojs/svelte";

import sentry from "@sentry/astro";
import spotlightjs from "@spotlightjs/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  integrations: [
    mdx(),
    sitemap({}),
    tailwind(),
    svelte(),
    sentry({
      dsn: process.env.SENTRY_DSN,
      //   sourceMapsUploadOptions: {
      //     project: "james-q-quick-website",
      //     authToken: process.env.SENTRY_AUTH_TOKEN,
      //   },
    }),
    spotlightjs(),
  ],
  output: "server",
  adapter: netlify(),
});
