---
title: Explosion Effects
description: The effects for Explosion visuals
lastUpdated: 2025-06-25
author: All
---

![Explosion](/src/assets/fowl-play/effects-shaders/effects/explosion.png)

This shader is primarily used for the egg bomb hazard. When the egg bomb explodes, a GPU particle with this shader applied is emitted. This creates an explosion effect, which serves as a visual cue.

- **Vertex Displacement**
  Vertices are offset along their normals using a noise texture that scrolls over time, creating dynamic, shifting surface details.

- **Noise-Based Transparency and Color**
  The fragment color and transparency are modulated by the noise texture combined with a gradient falloff, resulting in a fading, glowing effect.

- **Emission Control**
  The emission intensity is dynamically adjusted by the noise value and the gradient falloff, scaled by the `emission_power` parameter and shaped with the `emission_alpha_power` parameter. This causes the particle to glow and pulse, giving it a vibrant look that fluctuates naturally over time.

- **Alpha Clipping**
  An alpha cutoff threshold is applied to discard fully transparent fragments, optimizing rendering quality at the edges.

- **Backlighting**
  A constant backlight color is applied to improve the particle’s visibility and depth under lighting.
