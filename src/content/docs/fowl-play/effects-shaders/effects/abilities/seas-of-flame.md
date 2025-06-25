---
title: Seas of Flame Effect
description: The effects for the Seas of Flame ability
lastUpdated: 2025-06-25
author: All
---

For this ability, we wanted to create some sort of ring that gets emitted around the player, acting as a damaging AoE that burns enemies who enter its radius. The ring visually represents spreading embers erupting from the ground outward. We used animated UVs, noise-driven distortion, and gradient-based coloring to make the embers appear more dynamic, with glowing embers traveling across the surface to simulate the motion of heat. This all gets emitted by a `GPUParticle3D` node.

## Ember Shaders

This shader simulates the flickering embers by animating the UVs of a custom texture with scrolling noise-based distortion. Additionally, this shader is unshaded, ensuring the ember maintains consistent brightness regardless of the lighting.

- **Billboarding**
  The vertex shader reconstructs the model-view matrix to align ember quads facing the camera by overriding rotation while preserving scale, ensuring consistent orientation from all angles.

- **UV Animation**
  UV coordinates scroll over time using a speed parameter, moving the ember texture continuously to create a drifting motion.

- **Noise Distortion**
  A noise texture modulates UV offsets dynamically, combined with a gradient mask to control distortion intensity, adding flicker to the embers.

- **Texture Sampling**
  The distorted UVs sample the ember texture, which has its colors multiplied by the vertex color input to allow external tinting or fading.

- **Alpha and Blending**
  It uses premultiplied alpha blending. Fragment alpha is sourced from the ember texture’s red channel, enabling smooth, natural transparency.

## Ember Particles

![Seas of Flame Embers](/src/assets/fowl-play/effects-shaders/effects/abilities/seas-of-flame-embers.png)

The shader is applied on top of a `QuadMesh` to create ember-like particles. Various configurations of the `GPUParticle3D` node are adjusted to make the embers float upwards. The emission amount is tweaked with explosiveness to create a mass eruption of flames.
