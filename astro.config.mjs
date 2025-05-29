// @ts-check
import { defineConfig } from "astro/config";
import starlight from "@astrojs/starlight";

import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import starlightLinksValidator from "starlight-links-validator";
import starlightAutoSidebar from "starlight-auto-sidebar";
import starlightUtils from "@lorenzo_lewis/starlight-utils";

import { loadEnv } from "vite";

const { SITE_URL, BASE_PATH } = loadEnv(
  process.env.NODE_ENV || "",
  process.cwd(),
  "",
);

// https://astro.build/config
export default defineConfig({
  integrations: [
    starlight({
      plugins: [
        starlightLinksValidator(),
        starlightAutoSidebar(),
        starlightUtils({
          multiSidebar: {
            switcherStyle: "dropdown",
          },
        }),
      ],
      title: "Studio Fishbones",
      social: [
        {
          icon: "github",
          label: "GitHub",
          href: "https://github.com/Fishbones-Studio",
        },
        {
          icon: "twitter",
          label: "X(Twitter)",
          href: "https://x.com/StudioFishbones",
        },
        {
          icon: "blueSky",
          label: "BlueSky",
          href: "https://bsky.app/profile/studiofishbones.com",
        },
        {
          icon: "youtube",
          label: "YouTube",
          href: "https://www.youtube.com/channel/UCHuoUuX4QLNywVWbs_sDbJQ",
        },
      ],
      sidebar: [
        {
          label: "Guides",
          autogenerate: { directory: "guides" },
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
          autogenerate: { directory: "fowl-play" },
        },
      ],
    }),
    sitemap(),
    mdx(),
  ],
  site: SITE_URL || "http://localhost:4321/",
  base: BASE_PATH,
});
