---
title: Vignette Shader
description: The vignette shader used in Fowl Play
lastUpdated: 2025-06-25
author: All
---

![Vignette Shader](/src/assets/fowl-play/effects-shaders/shaders/vignette/vignette.png)

The inspiration for using this shader came from the "hurt effect" in Call of Duty, where the screen gradually gets redder the more damage you take. This gives the player better visual feedback when getting hit. So we used a very simple shader for this.

The vignette shader adds a subtle, radial fade around the edges of the screen, amplifying the sense of damage or danger. By blending a colored gradient from the center outward, it creates a natural darkening effect that can be tuned for intensity and coverage.

## Shader Parameters

- `alpha`: Controls the overall opacity of the vignette effect.
- `inner_radius`: Defines the radius of the inner circle where the effect is fully opaque.
- `outer_radius`: Sets the radius of the outer circle where the effect fades out.
