// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import sitemap from "@astrojs/sitemap";

import mdx from "@astrojs/mdx";

import { loadEnv } from "vite";

const { SITE_URL, BASE_PATH } = loadEnv(
  process.env.NODE_ENV || "",
  process.cwd(),
  ""
);

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      title: "Fishbones Studio",
      social: {
        github: "https://github.com/Fishbones-Studio",
      },
      sidebar: [
        {
          label: "Guides",
          items: [
            // Each item here is one entry in the navigation menu.
            { label: "Godot Setup", slug: "guides/godot_setup" },
          ],
        },
        {
          label: "Game Ideas",
          autogenerate: { directory: "ideas" },
        },
        {
          label: "Prototype",
          autogenerate: { directory: "prototype"},
        },        
      ],
    }),
    sitemap(),
    mdx(),
  ],
  site: SITE_URL || "http://localhost:4321/",
  base: BASE_PATH,
});
