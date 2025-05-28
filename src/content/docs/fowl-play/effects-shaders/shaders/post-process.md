---
title: Post Processing Shader
description: Post Processing Shader for pixelation, dithering and color reduction
lastUpdated: 2025-05-28
author: Tjorn
---
![Post Processing Shader in action](../../../../../assets/fowl-play/effects-shaders/shaders/post-process/post_process_shader.gif)

This Godot `canvas_item` shader applies a retro visual filter to the rendered scene, simulating the look of old horror games. It combines pixelation, color reduction, and dithering. The shader is used in Fowl Play to create a stylized, imperfect, and slightly unsettling visual atmosphere, while keeping the UI crisp and clear by excluding it from the effect.

- **Pixelation:** Samples the screen texture at a lower resolution, creating a blocky, pixelated look.
- **Color Reduction:** Quantizes each color channel to a limited number of discrete steps, reducing the color palette.
- **Ordered Dithering:** Uses a 4x4 Bayer matrix to distribute quantization errors, simulating intermediate colors and reducing banding.
- **Scaling & Border Mask:** Optional scaling and a subtle border mask can be used for additional stylization or vignette effects.

## Shader Code

```gdshader
// This shader is a post-processing effect, which pixelates, dithers and reduces the color depth of the screen texture.
// It is designed to be used in a Godot 4.4 project.
shader_type canvas_item;

uniform sampler2D SCREEN_TEXTURE : hint_screen_texture, filter_nearest_mipmap;
// NOTE: Set the actual viewport resolution by code and update it every time the viewport changes
uniform vec2 screen_size = vec2(1920.0, 1080.0);

// Color and dithering controls
uniform int colors : hint_range(1, 16) = 12;
uniform int dither_size : hint_range(1, 8) = 1;
// Color shift for dithering
uniform float dither_shift : hint_range(-0.5, 0.5) = 0.1;
uniform float dither_strength : hint_range(0.0, 1.0) = 0.5;
uniform float dither_hue_shift : hint_range(-3.1416, 3.1416) = 0.0;

// Visual controls
uniform float alpha : hint_range(0.0, 1.0) = 1.0;
uniform float scale : hint_range(1.0, 2.0) = 1.0;
uniform float border_mask : hint_range(0.0, 5.0) = 2.0;

// Pixelation: size of each pixel block in screen pixels
uniform int pixel_size : hint_range(1, 64) = 2;

// 4x4 Bayer matrix for dithering
float dithering_pattern(ivec2 fragcoord) {
    const float pattern[] = {
        0.00, 0.50, 0.10, 0.65,
        0.75, 0.25, 0.90, 0.35,
        0.20, 0.70, 0.05, 0.50,
        0.95, 0.40, 0.80, 0.30
    };
    int x = fragcoord.x % 4;
    int y = fragcoord.y % 4;
    return pattern[y * 4 + x] * dither_strength;
}

// Manual hue rotation for a vec3 color
// This is a simple rotation in the YIQ color space
// YIQ is a color space that separates luminance (Y) from chrominance (I and Q)
// The hue rotation is done by rotating the I and Q components
// Even if angle is 0, some slight color variation will occur due to the conversion and float precision.
vec3 hue_shift(vec3 color, float angle) {
    // Convert RGB to YIQ
    float Y = dot(color, vec3(0.299, 0.587, 0.114));
    float I = dot(color, vec3(0.596, -0.274, -0.322));
    float Q = dot(color, vec3(0.211, -0.523, 0.312));
    // Rotate I and Q
    float cosA = cos(angle);
    float sinA = sin(angle);
    float I2 = I * cosA - Q * sinA;
    float Q2 = I * sinA + Q * cosA;
    // Convert back to RGB
    return vec3(
        Y + 0.956 * I2 + 0.621 * Q2,
        Y - 0.272 * I2 - 0.647 * Q2,
        Y - 1.106 * I2 + 1.703 * Q2
    );
}

// Reduces a color channel to a limited palette, with dithering
// raw: the raw color value (0.0 to 1.0)
// dither: the dither value (0.0 to 1.0)
// depth: the number of colors in the palette (1 to 16)
float reduce_color(float raw, float dither, int depth) {
    float div = 1.0 / float(depth);
    float val = 0.0;
    int i = 0;
    while (i <= depth) {
        if (raw > div * float(i + 1)) {
            i = i + 1;
            continue;
        }
        if (raw * float(depth) - float(i) <= dither * 0.999) {
            val = div * float(i);
        } else {
            val = div * float(i + 1);
        }
        return val;
        i = i + 1;
    }
    return val;
}

void fragment() {
    // Pixelate: snap FRAGCOORD to pixel grid
    ivec2 pixelated_coord = ivec2(FRAGCOORD.xy) / pixel_size * pixel_size + pixel_size / 2;
    vec2 pixel_uv = vec2(pixelated_coord) / screen_size;

    // Border mask and scaling
    float scale_reverse = 2.0 - scale;
    vec2 uvs = pixel_uv * scale_reverse + vec2(1.0 - scale_reverse) / 2.0;
    vec2 mask = pow(2.0 * abs(UV - 0.5), vec2(border_mask));

    // Sample color channels with border mask and scaling
    float r = texture(SCREEN_TEXTURE, uvs + vec2(SCREEN_PIXEL_SIZE) * mask, 0.0).r;
    float g = texture(SCREEN_TEXTURE, uvs + vec2(SCREEN_PIXEL_SIZE) * mask, 0.0).g;
    float b = texture(SCREEN_TEXTURE, uvs + vec2(SCREEN_PIXEL_SIZE) * mask, 0.0).b;
    vec4 raw = vec4(r, g, b, 1.0);

    // Use pixelated_coord for dithering as well
    ivec2 dither_uv = pixelated_coord / dither_size;
    float dither_base = dithering_pattern(dither_uv);

    // Compose dither as a vector, apply shift
    vec3 dither_vec = vec3(
        dither_base + dither_shift,
        dither_base - dither_shift,
        dither_base
    );
    // Apply hue shift to the dither vector
    dither_vec = hue_shift(dither_vec, dither_hue_shift);

    COLOR.r = reduce_color(raw.r, dither_vec.r, colors - 1);
    COLOR.g = reduce_color(raw.g, dither_vec.g, colors - 1);
    COLOR.b = reduce_color(raw.b, dither_vec.b, colors - 1);
    COLOR.a = alpha;
}
```

## Shader Parameters

- `SCREEN_TEXTURE`: The screen texture to which the effect is applied.
- `screen_size`: The resolution of the viewport (should be set by code).
- `colors`: Number of color steps per channel (palette size).
- `dither_size`: Scale of the dithering pattern.
- `dither_shift`, `dither_hue_shift`: Artistic controls for shifting the dithering pattern and rotating its hue.
- `dither_strength`: Strength of the dithering effect.
- `alpha`: Final alpha of the effect.
- `scale`: Zooms the sampled screen content in or out.
- `border_mask`: Strength of the border mask effect.
- `pixel_size`: Size of each pixel block for pixelation.

## Shader Logic

- **Pixelation**:
  - Snaps the sampling coordinates to a grid defined by `pixel_size`, so each block of pixels samples the same color from the screen texture.
- **Color Reduction**:
  - The `reduce_color` function quantizes each color channel to a limited number of steps, set by `colors`.
- **Hue Shifting**:
  - The `hue_shift` function rotates the hue of the dithering pattern, allowing for creative color variations.
    - This is done by converting RGB to YIQ, rotating the I and Q components, and converting back to RGB. YIQ is a way of representing colors that separates how bright a color is (luminance) from the actual color information (chrominance). The “Y” stands for brightness, while “I” and “Q” describe the color’s tint and shade. This makes it easier to adjust things like hue or brightness separately, which is useful for effects like hue shifting in shaders.
- **Dithering**:
  - The `dithering_pattern` function generates a threshold from a 4x4 Bayer matrix, varying across the screen.
  - The dither value is used in `reduce_color` to decide whether to round a color channel up or down, creating a dot pattern that simulates more colors.
  - `dither_shift` and `dither_hue_shift` allow for creative control over the dithering pattern and its color.
- **Scaling & Border Mask**:
  - The `scale` uniform zooms the sampled screen content.
  - The `border_mask` uniform applies a mask that is stronger near the edges, subtly pulling the sampled UVs outward for a vignette-like effect.
