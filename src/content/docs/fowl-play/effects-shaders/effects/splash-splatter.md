---
title: Splash & Splatter Effects
description: The effects for splash and splatter visuals
lastUpdated: 2025-06-25
author: All
---

To enhance the visual feedback of combat interactions, we created a splash and splatter effect. In the game, we want to simulate blood splashing out of an entity when it gets hurt. The splashing blood should splatter on the ground and slowly fade over time. We wanted this effect to fit the game’s dark and gritty theme. We also wanted to give the player a clear indication of successful hits and make them immersed in combat.

To achieve this, we created two shaders: a ‘splash’ shader for airborne blood particles and a ‘splatter’ shader for bloodstains left on surfaces. Both shaders are designed to work in combination with `GPUParticles3D` nodes and Meshes—either quad or plane meshes.

## Splash Shader

![Splash](/src/assets/fowl-play/effects-shaders/effects/splash-and-splatter-splash.png)

The splash shader combined with a `GPUParticles3D` node creates a dynamic, camera-facing splash effect. It uses a combination of billboarding, noise-based distortion, and gradient masking to simulate airborne splash impacts.

- **Billboarding**
  Ensures that each splash particle always faces the camera, no matter how the parent object moves or rotates.

- **Noise Distortion**
  To avoid repetitive or artificial-looking splashes, the shader uses a noise texture combined with per-instance distortion. This means every splash is subtly unique, with organic, irregular outlines.

- **Gradient Mask**
  The splash fades smoothly from a dense center to softer, more transparent edges. By blending a radial gradient with angle-based variation, the shader produces splashes with jagged, unpredictable borders.

- **Alpha Scissor**
  The shader discards pixels below a certain transparency threshold. This creates sharp, non-uniform cutouts along the splash’s edge.

### Shader Parameters

- `main_color`: Sets the base color of the splash. This can be randomized or varied per particle for extra visual diversity.
- `noise_texture`: Supplies the random pattern that shapes each splash. Using a seamless, grayscale noise texture works best.
- `distortion_amount`: Controls how much the splash shape is warped by the noise, affecting its overall irregularity.
- `noise_power`: Adjusts the contrast and intensity of the noise, letting you go from subtle to dramatic effects.
- `base_alpha`: Sets the overall transparency of the splash, making it more or less pronounced.
- `angle_influence`: Determines how much the splash’s angle relative to the center affects its fade, adding further variation to the edges.
- `gradient_strength`: Controls how quickly the splash fades from the center outward, letting you create tight bursts or wide, diffuse splashes.

## Splatter Shader

![Splatter](/src/assets/fowl-play/effects-shaders/effects/splash-and-splatter-splatter.png)

The splatter shader simulates bloodstains on surfaces, such as floors. It uses lighting models for realistic interaction with the environment and edge fading for natural decay.

- **Diffuse & Specular Lighting**
  This shader leverages Godot’s lighting system, so splatters can look wet or matte depending on the environment. The use of both diffuse and specular lighting means stains can catch highlights or appear dull, helping them blend seamlessly with the underlying surface.

- **Noise & Distortion**
  To keep stains looking natural, the shader uses a noise texture and per-instance variation to distort each splatter’s shape. This makes every splatter unique, with irregular edges and subtle differences in opacity. Uses `distortion_amount` to control the warping and `noise_power` for the sharpness of the effect.

- **Edge Variation**
  Edge fading is handled by the `edge_variation` parameter, which can be animated over time to make stains gradually disappear or change shape.

- **Alpha Scissor**
  Like the splash shader, this shader also discards pixels below a certain transparency threshold to create sharp, non-uniform cutouts along the splatter’s edge.

### Shader Parameters

- `main_color`: Sets the primary color of the splatter, which can be tweaked for different entities.
- `noise_texture`: For random patterns that shape each splatter.
- `splatter_scale`: Adjusts the overall size of the splatter, letting you create anything from small drops to large stains.
- `distortion_amount`: Controls how much the splatter’s shape is warped by the noise, adding to the organic feel.
- `edge_variation`: Determines how strongly the edges fade out.
- `noise_power`: Changes the intensity and contrast of the noise, letting you go from soft, diffuse stains to sharp, dramatic splatters.
