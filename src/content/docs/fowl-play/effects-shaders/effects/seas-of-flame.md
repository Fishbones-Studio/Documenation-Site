---
title: Seas of Flame Effect
description: The effects for the Seas of Flame ability
lastUpdated: 2025-06-25
author: All
---

# Seas of Flame

A ring of embers emitted around the player, simulating a burning AoE.

## Ember Shaders

- **Billboarding:** Ember quads always face the camera.
- **UV Animation:** Scrolls over time for drifting motion.
- **Noise Distortion:** Noise texture modulates UVs for flicker.
- **Texture Sampling:** Distorted UVs sample ember texture, multiplied by vertex color.
- **Alpha & Blending:** Premultiplied alpha, red channel for transparency.

## Ember Particles

- **GPUParticle3D:** QuadMesh embers float upwards, mass eruption via explosiveness.
