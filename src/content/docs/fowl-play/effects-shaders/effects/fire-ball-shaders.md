---
title: Fire Ball Visual Shaders
description: Visual shaders for the Fire Ball effect
lastUpdated: 2025-06-25
author: All
---

# Fire Ball Visual Shaders

## Head Shaders

- **Texture Animation:** UVs offset with TIME and speed vector for scrolling.
- **Texture Blending:** Base noise and gradient textures are subtracted and clamped.
- **Alpha:** Blending value used as alpha for flickering edges.
- **Albedo:** Solid color base with alpha overlay.

## Ball Shaders

- **Fresnel Transparency:** Dynamic glow and transparency based on view angle.
- **Inversion:** Flip fresnel behavior for edge or center glow.
- **Power:** Controls sharpness of the fresnel curve.

## Trail Shaders

- **Animated UVs:** Two textures with scrolling UVs for motion.
- **Transparency:** Color values multiplied for fading.
- **Additive Blending:** Trail glows and blends with the environment.

## Spark Particles

- **GPUParticles3D:** Spherical emission, negative X-axis, variable speed, strong radial velocity.
