import { defineConfig, envField } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import netlify from "@astrojs/netlify";
import svelte from "@astrojs/svelte";
import icon from "astro-icon";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  env: {
    schema: {
      // Secret server variables used in endpoints/components.
      // Marked optional to keep local builds from failing when env vars are absent.
      YOUTUBE_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      XATA_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      SUPER_SECRET_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      SENDGRID_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      CLOUDINARY_API_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      CLOUDINARY_API_SECRET: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_ACCESS_KEY_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_SECRET_ACCESS_KEY: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_ACCOUNT_ID: envField.string({
        context: "server",
        access: "secret",
        optional: true,
      }),
      R2_BUCKET_NAME: envField.string({
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
  adapter: netlify(),
  experimental: {
    contentIntellisense: true,
  },
});
