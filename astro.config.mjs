import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import tailwind from "@astrojs/tailwind";
import partytown from "@astrojs/partytown";

import image from "@astrojs/image";

// https://astro.build/config
export default defineConfig({
  site: "https://jamesqquick.com/",
  integrations: [mdx(), sitemap({}), tailwind(), partytown(), image()],
  output: "static"
});