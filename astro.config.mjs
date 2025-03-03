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
        "x.com": "https://x.com/StudioFishbones",
        blueSky: "https://bsky.app/profile/studiofishbones.com",
        youtube: "https://www.youtube.com/@studiofishbones",
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
          autogenerate: { directory: "prototype" },
        },
        {
          label: "Pitches",
          autogenerate: { directory: "pitches" },
        },
        {
          label: "Marketing",
          autogenerate: { directory: "marketing" },
        },
      ],
    }),
    sitemap(),
    mdx(),
  ],
  site: SITE_URL || "http://localhost:4321/",
  base: BASE_PATH,
});
