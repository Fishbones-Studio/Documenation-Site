---
title: Splash & Splatter Effects
description: The effects for splash and splatter visuals
lastUpdated: 2025-06-25
author: All
---

# Splash & Splatter

Simulates blood splashes and stains for combat feedback.

## Splash Shader

- **Billboarding:** Always faces camera.
- **Noise Distortion:** Per-instance noise for unique, organic outlines.
- **Gradient Mask:** Fades from dense center to transparent edges.
- **Alpha Scissor:** Discards low-alpha pixels for sharp cutouts.

**Parameters:**

- `main_color`, `noise_texture`, `distortion_amount`, `noise_power`, `base_alpha`, `angle_influence`, `gradient_strength`

## Splatter Shader

- **Diffuse & Specular Lighting:** Integrates with Godot’s lighting for wet/matte look.
- **Noise & Distortion:** Per-instance variation for unique stains.
- **Edge Variation:** Animated edge fading for natural decay.
- **Alpha Scissor:** Sharp, non-uniform cutouts.

**Parameters:**

- `main_color`, `noise_texture`, `splatter_scale`, `distortion_amount`, `edge_variation`, `noise_power`
