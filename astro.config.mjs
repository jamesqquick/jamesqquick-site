import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify/functions";
import svelte from "@astrojs/svelte";
import spotlightjs from "@spotlightjs/astro";

import sentry from "@sentry/astro";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  integrations: [
    mdx(),
    sitemap({}),
    tailwind(),
    svelte(),
    sentry({
      dsn: "https://ab69a01d3403b79bf1b71fdce18be5a7@o4506232146034688.ingest.us.sentry.io/4506384553869312",
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
