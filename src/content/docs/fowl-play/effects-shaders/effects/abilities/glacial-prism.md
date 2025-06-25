---
title: Glacial Prism Effect
description: The effects for the Glacial Prism ability
lastUpdated: 2025-06-25
author: All
---

![Glacial Prism](/src/assets/fowl-play/effects-shaders/effects/abilities/glacial-prism.png)

The glacial prism effect combines a custom mesh, modelled in Blender to resemble an ice crystal, with a custom shader that simulates the reflective and refractive properties of ice. This mesh, together with the shader, is emitted through a `GPUParticle3D` node to create a burst of crystals spawning.

## Crystal Mesh

The first step was to establish the overall shape of the mesh. We chose a classic ice crystal form, featuring icicles of varying length and angles to create a more natural and realistic appearance.

## Ice Shader

This shader is applied on top of the crystal mesh, creating a radiant ice texture. It simulates light refraction and subtle glowing edges, capturing the sharp and cold qualities of a natural ice crystal. Through effects like fresnel edge highlights and dynamic texture distortion, the shader adds more depth and a realistic reflection to the mesh.

- **Fresnel Edge Glow**
  The shader calculates a fresnel factor based on the angle between the surface normal and the camera view direction. This produces a glowing highlight around the edges, simulating the light scattering effect of ice or glass surfaces.

- **Texture Tiling and Offset**
  The ice texture is tiled and offset dynamically on the UV coordinates, allowing control over how the ice pattern repeats and moves across the surface.

- **Normal Mapping**
  It reads from a normal map from the ice texture to simulate small bumps and surface irregularities, enhancing realism. It reconstructs the normals with tangent and binormal vectors for accurate lightning and refraction.

- **Refraction Effect**
  This effect distorts the background visible through the ice by sampling the screen texture with an offset. The offset is calculated based on the normal map and refraction amount, simulating light bending as it passes through the prism.

- **Base Color Mixing**
  The final surface color is a mix between the ice texture color and the refracted screen color, tinted by a base color. It creates a natural icy look that combines both texture detail and environmental distortion.

- **Metallic**
  This adds a subtle metallic shine to the ice surface.

- **Smoothness**
  Controls the specular sharpness and glossiness, making the ice more polished on the surface.

## Composition

The glacial prism effect blends a custom crystal mesh with a `GPUParticle3D` node to emit the particle. The combination of randomized rotation, scale, and motion adds natural variation, while smooth fading and color shifts enhances the realism.

### Particle Emission

The `GPUParticle3D` node emits a single instance of the custom crystal mesh, allowing for a shard to spawn dynamically at the target location. This creates a visually impactful and immersive explosion of ice.

- **Emission Shape**
  It uses a box-shaped emission to spawn particles with variation across a defined area.

- **Randomization and Rotation**
  The particle is assigned random rotation along the Y-axis and variable scale, adding diversity and preventing repetition.

- **Lifetime and Fade**
  The particle lifetime randomness and alpha curves control the visibility over time, enabling smooth fade-in and out transitions that make the effect feel more fluid.

- **Physics**
  The particles have slight linear acceleration, which gives subtle motion, simulating shards scattering from the point of impact without heavy gravity influence.

- **Color and Transparency**
  A gradient texture is applied to manage color changes and transparency over the particle’s lifetime.
