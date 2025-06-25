---
title: Sanctuary of Firebloom Effect
description: The effects for the Sanctuary of Firebloom ability
lastUpdated: 2025-06-25
author: All
---

# Sanctuary of Firebloom

A complex lightning strike effect using custom meshes, shaders, and noise textures.

## Wave Shaders

- **Billboarding:** Mesh always faces camera.
- **UV Distortion:** Time-based vertical scrolling of wave texture.
- **Gradient Transparency:** Gradient texture masks alpha for soft edges.

## Mark Shaders

- **Color Blending:** Texture RGB multiplied by vertex/fragment color.
- **Alpha Masking:** Texture alpha × color’s red channel.
- **Decal Rendering:** Blend_mix mode, depth draw for correct layering.

## Strike Shaders

- **Billboard Orientation:** Always faces camera.
- **Scrolling Texture:** Time-driven UV offset.
- **Gradient Color Mapping:** 1D gradient for animated color and alpha.
