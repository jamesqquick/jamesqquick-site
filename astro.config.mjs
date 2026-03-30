import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import cloudflare from "@astrojs/cloudflare";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  image: {
    layout: "constrained",
    responsiveStyles: true,
    remotePatterns: [
      { protocol: "https", hostname: "i.ytimg.com" },
    ],
  },
  env: {
    schema: {
      // Secret server variables used in endpoints/components.
      // Marked optional to keep local builds from failing when env vars are absent.
      RESEND_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
    },
  },
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
          "theme-light-dark",
          "account",
          "laptop",
          "star-outline",
          "download",
          "chart-bar",
          "monitor",
        ],
      },
    }),
  ],
  output: "server",
  adapter: cloudflare(),
  experimental: {
    contentIntellisense: true,
  },
});
