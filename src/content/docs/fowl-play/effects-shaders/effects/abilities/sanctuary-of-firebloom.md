---
title: Sanctuary of Firebloom Effect
description: The effects for the Sanctuary of Firebloom ability
lastUpdated: 2025-06-25
author: All
---

![Sanctuary of Firebloom](/src/assets/fowl-play/effects-shaders/effects/abilities/sanctuary-of-firebloom.png)

This ability uses a complex array of visual techniques to create a stunning lightning strike effect. At its core is a custom mesh modeled in Blender, enhanced with shaders and a noise texture that shape its energetic appearance. The final effect is emitted through a `GPUParticle3D` node, allowing it to scatter lightning-shaped fragments. This gives the impression of a quick, but destructive strike effect we aimed for.

## Wave Shaders

The wave shader is applied to a custom plane mesh, which has been heavily modified in Blender to fit the vertical edge of a lightning beam shape. It creates a dynamic lightning effect by animating the UV coordinates of a wave texture.

- **Billboarding**
  Uses a billboard matrix to rotate the mesh every frame, so it always faces the camera. This is achieved by replacing the model-view matrix in the vertex shaders with a computed billboard matrix that maintains the mesh’s scale but aligns its orientation to the camera’s view direction.

- **UV Distortion**
  UV coordinates are dynamically offset in the fragment shader by multiplying the original UV by a Vector and adding a time-dependent offset, effectively scrolling the wave texture vertically. It uses a UV function node to manipulate the UVs for smooth, continuous movement.

- **Gradient-Based Transparency**
  A gradient texture is sampled alongside the wave texture to control the alpha transparency. This gradient acts as an alpha mask, fading the beam edges softly to zero transparency for smooth blending with the environment. The alpha channel in the fragment shader is computed by multiplying the wave texture intensity by the gradient texture’s value at the same UV coordinate.

## Mark Shaders

This shader is applied to a plane mesh, which renders decal-like visual effects on the surface, creating an impact effect where the ability struck. It blends a colored texture or vertex fragment color to create a customizable, semi-transparent mark on 3D geometry.

- **Color Blending**
  Samples a 2D texture and multiplies its RGB channels with vertex or fragment color inputs, allowing dynamic tint adjustments of the decal.

- **Alpha Masking**
  Computes the output alpha as the product of the texture’s alpha channel and the vertex and/or fragment color’s red channel, controlling transparency pixels for smooth fade-outs.

- **Decal Rendering**
  Uses a `blend_mix` mode and depth draw setting to overlay the decal onto surfaces without depth artifacts, preserving correct layering and blending in 3D scenes.

## Strike Shaders

The strike shader is designed for a billboarding plane mesh to create a dynamic, animated strike effect. It uses a scrolling texture to simulate motion and a gradient color lookup to add vibrant coloring, resulting in a glowing, fading strike that always faces the camera. The effect is bound by the particle lifetime, creating a natural fade-out effect for it.

- **Billboard Orientation**
  The mesh always faces the camera, maintaining visibility and consistent appearance from all angles.

- **Scrolling Texture Animation**
  UVs are offset using a time-driven `vec2` multiplied by a direction vector, simulating movement across the texture surface to mimic motion.

- **Gradient Color Mapping**
  A red channel remap feeds into a smoothstep, which defines mask strength. This value is used to sample a 1D gradient texture, allowing for animated color transitions and soft alpha blending.
