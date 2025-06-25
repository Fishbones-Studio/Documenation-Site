---
title: Glacial Prism Effect
description: The effects for the Glacial Prism ability
lastUpdated: 2025-06-25
author: All
---

# Glacial Prism

Combines a custom ice crystal mesh with a shader simulating ice’s reflective and refractive properties.

## Crystal Mesh

- Classic ice crystal form, icicles of varying length and angle.

## Ice Shader

- **Fresnel Edge Glow:** Angle-based edge highlights.
- **Texture Tiling/Offset:** Dynamic UV tiling and movement.
- **Normal Mapping:** Simulates bumps and irregularities.
- **Refraction Effect:** Distorts background using screen texture and normal map.
- **Base Color Mixing:** Blends ice texture and refracted color.
- **Metallic & Smoothness:** Adds shine and gloss.

## Composition

- **GPUParticle3D:** Emits crystal mesh with randomized rotation, scale, and motion.
- **Emission Shape:** Box-shaped for area variation.
- **Randomization:** Y-axis rotation and scale.
- **Lifetime & Fade:** Randomized lifetime, alpha curves for smooth transitions.
- **Physics:** Slight linear acceleration, minimal gravity.
- **Color & Transparency:** Gradient texture for color and alpha over lifetime.
