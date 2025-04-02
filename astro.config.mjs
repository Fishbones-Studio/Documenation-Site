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
            { label: "Godot Setup", slug: "guides/godot_setup" },
            {
              label: "Creating melee weapons",
              slug: "guides/create_melee_weapon",
            },
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
              label: "Production",
              items: [
                {
                  label: "Pitches",
                  autogenerate: { directory: "fowl_play/production/pitches" },
                },
                {
                  label: "Planning",
                  autogenerate: {
                    directory: "fowl_play/production/planning",
                  },
                },
                {
                  label: "Marketing",
                  autogenerate: { directory: "fowl_play/production/marketing" },
                },
              ],
            },
            {
              label: "Design",
              autogenerate: { directory: "fowl_play/design" }, // Currently empty
            },
            {
              label: "Art",
              items: [
                {
                  label: "3D",
                  autogenerate: { directory: "fowl_play/art/3d" },
                },
                {
                  label: "Music",
                  autogenerate: { directory: "fowl_play/art/music" },
                },
              ],
            },
            {
              label: "Gameplay",
              items: [
                {
                  label: "Important Code",
                  autogenerate: {
                    directory: "fowl_play/gameplay/important-code",
                  },
                },
                {
                  label: "Camera",
                  autogenerate: { directory: "fowl_play/gameplay/camera" },
                },
                {
                  label: "Game Progression",
                  autogenerate: {
                    directory: "fowl_play/gameplay/game-progression",
                  },
                },
                  {
                    label: "User Interface",
                    autogenerate: {
                      directory: "fowl_play/gameplay/user-interface",
                    },
                  },
                {
                  label: "Combat",
                  items: [
                    {
                      label: "Melee",
                      autogenerate: {
                        directory: "fowl_play/gameplay/combat/melee-combat",
                      },
                    },
                  ],
                },
                {
                  label: "Entities",
                  items: [
                    {
                      label: "Enemies",
                      autogenerate: {
                        directory: "fowl_play/gameplay/entities/enemies",
                      },
                    },
                    {
                      label: "Player Chicken",
                      autogenerate: {
                        directory:
                          "fowl_play/gameplay/entities/player/player-chicken",
                      },
                    },
                    {
                      label: "Stats",
                      autogenerate: {
                        directory: "fowl_play/gameplay/entities/stats",
                      },
                    },
                  ],
                },
              ],
            },
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
