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
      RESEND_AUDIENCE_ID: envField.string({
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
          "robot-outline",
          "code-braces",
          "trending-up",
        ],
        teenyicons: [
          "youtube-outline",
          "twitter-outline",
          "tiktok-outline",
          "discord-outline",
          "github-outline",
        ],
      },
    }),
  ],
  output: "server",
  adapter: cloudflare(),
  experimental: {
    contentIntellisense: true,
  },
  vite: {
    // Workaround for withastro/astro#16248: in dev the Cloudflare (workerd) SSR
    // environment discovers these entry modules at request time, triggering a
    // "program reload" cascade that crashes the runner with "module is not
    // defined". Pre-bundling them up front eliminates the runtime discovery.
    ssr: {
      optimizeDeps: {
        include: [
          "@astrojs/cloudflare/entrypoints/server",
          "astro/actions/runtime/entrypoints/server.js",
          "astro-icon/components",
          // Pre-bundle @iconify/utils so esbuild converts its transitive CJS dep
          // `debug` (top-level `module.exports = require(...)`), which otherwise
          // breaks in the workerd runtime. Requires @iconify/utils to be a direct
          // (resolvable) dependency.
          "@iconify/utils",
          "svelte",
          // Also discovered at request time (actions / newsletter path); including
          // them up front avoids a cold-start re-optimization + chunk race.
          "resend",
          "astro/zod",
          "astro/env/runtime",
        ],
      },
    },
  },
});
