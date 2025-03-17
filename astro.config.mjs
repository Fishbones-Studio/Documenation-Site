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
      title: "Studio Fishbones",
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
          label: "Fowl Play",
          items: [
            {
              label: "Pitches",
              autogenerate: { directory: "fowl_play/pitches" },
            },
            {
              label: "Project Plan",
              autogenerate: { directory: "fowl_play/project-plan" },
            },
            {
              label: "Important Code",
              autogenerate: { directory: "fowl_play/important-code" },
            },
            {
              label: "Player Chicken",
              autogenerate: { directory: "fowl_play/player-chicken" },
            },
            {
              label: "Camera System",
              autogenerate: { directory: "fowl_play/camera" },
            }
            // Future sections to add as content is developed:
            // - Combat System
            // - Enemies
            // - Arena
            // - Mutations & Upgrades
            // - Poultry Man & UI
            
          ],
        },
      ],
    }),
    sitemap(),
    mdx(),
  ],
  site: SITE_URL || "http://localhost:4321/",
  base: BASE_PATH,
});
