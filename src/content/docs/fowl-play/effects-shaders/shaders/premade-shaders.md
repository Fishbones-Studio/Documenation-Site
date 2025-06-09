---
title: Premade Shaders
description: Overview of shaders used in Fowl Play, that are (slightly modified and) used as is.
lastUpdated: 2025-06-06
author: Tjorn
---

## Used as is

- [Crescent Slash](https://godotshaders.com/shader/procedural-cyclic-slash/)
  ![Crescent Slash in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/cresent_slash_shader.gif)
- [Pause Menu Blur](https://godotshaders.com/shader/simple-blur-godot-4-1/)
  ![Pause Menu Blur in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/pause_menu_blur_shader.gif)

## Modified

- [Earthquake](https://godotshaders.com/shader/distortion-bubble/): Reworked to use a 3D noise texture for both vertex and fragment distortion, added fresnel view effects, and enabled double-sided rendering.
  ![Earthquake in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/earthquake_shader.gif)
- [Fire Ball](https://godotshaders.com/shader/energy-shield-with-impact-effect/): This shader has been modified to allow for gradient colors.
  ![Fire Ball in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/fire_ball_shader.gif)
- [Enemy Health Bar Icon](https://godotshaders.com/shader/corner-radius/): Simplified the shader to use normalized UV coordinates and a single corner_scale uniform for rounded corners, removing border and color features for a more minimal effect.
  ![Enemy Health Bar Icon in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/enemy_health_bar_icon_shader.png)
- [Butter Knife Shine](https://godotshaders.com/shader/3d-item-highlighter-with-angle-adjustment/): Simplified the shine effect to use a time-based, cycling highlight along the Z-axis in view space, removed the enable/progress controls, and adjusted parameters for continuous animation and easier control over shine width and speed.
  ![Butter Knife Shine in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/butter_knife_shine_shader.gif)
- [Player Hud Heal](https://godotshaders.com/shader/web-safe-darkened-gaussian-blur/): Added a customizable glow color and intensity, added an overlay alpha control, and switched to a more pronounced blur radius for a healing-glow effect instead of a simple darkened blur.
  ![Player Hud Heal in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/player_hud_heal_shader.gif)
- [Training Glass](https://godotshaders.com/shader/frosted-glass-3/): Introduced a `transparency` uniform for explicit alpha control and changed ALBEDO to directly use the blurred screen color, making the shader a standalone frosted glass effect rather than a tint.
  ![Training Glass in action](../../../../../assets/fowl-play/effects-shaders/shaders/premade-shaders/training_glass_shader.gif)
