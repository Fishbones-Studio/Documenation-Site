---
title: Night Sky Shader
description: Shader used for the Night Sky, visible from the arena.
lastUpdated: 2025-05-15
author: Tjorn
---

The Night Sky, visible from the arena and intermission area, uses a custom sky shader to create a dynamic night sky with animated stars and drifting clouds. It is based on the [Godot Sky Shader tutorial](https://docs.godotengine.org/en/stable/tutorials/shaders/shader_reference/sky_shader.html#doc-sky-shader)

- **Sky Gradient**: Blends between two dark blue colors from horizon to zenith for a deep night effect.
- **Stars**: Procedurally generated, twinkling stars with adjustable density, brightness, and scale.
- **Clouds**: Animated, semi-transparent clouds using a noise texture, moving slowly across the sky.
- **Performance**: Clouds are rendered at half resolution for efficiency, then composited over the sky.

## Shader Code

```gdshader
shader_type sky;
render_mode use_half_res_pass;

// Night sky colors
uniform vec3 sky_color_a : source_color = vec3(0.01, 0.01, 0.05); // Dark blue/black near horizon
uniform vec3 sky_color_b : source_color = vec3(0.05, 0.05, 0.15); // Slightly lighter dark blue zenith
// Darker clouds for night
uniform vec3 cloud_color : source_color = vec3(0.1, 0.1, 0.15);
uniform float cloud_min = 0.3;
uniform float cloud_max = 0.8;
uniform float cloud_speed = 0.01;
uniform sampler2D cloud_noise;

// Star parameters
uniform float star_density : hint_range(0.9, 0.999) = 0.98;
uniform float star_brightness : hint_range(0.5, 2.0) = 1.0;
uniform float twinkle_speed : hint_range(0.0, 5.0) = 2.0;
uniform float star_scale : hint_range(10.0, 200.0) = 80.0;

// Pseudo-random number generator
float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
}

// Function to generate stars
vec3 generate_stars(vec3 eyedir) {
    // Normalize eyedir to treat it as a direction on a sphere
    vec3 dir = normalize(eyedir);
    // Use a projection to map direction to a 2D plane for hashing
    // Adjust scale factor to change apparent star density/size
    vec2 uv = dir.xz / (dir.y + 1.0) * star_scale;

    // Use floor to create grid cells, hash the cell coordinate
    float star_noise = hash(floor(uv));

    // Threshold for star existence (higher value = fewer stars)
    float stars = smoothstep(star_density, star_density + 0.005, star_noise);

    if (stars > 0.0) {
        // Add twinkling effect based on time and star position
        float twinkle = 0.6 + 0.4 * sin(TIME * twinkle_speed + star_noise * 100.0);
        // Add variation in base brightness using another hash
        float brightness_variation = hash(floor(uv) + vec2(0.1, 0.2));
        // Combine effects and apply overall brightness uniform
        return vec3(1.0) * stars * twinkle * (0.5 + 0.5 * brightness_variation) * star_brightness;
    } else {
        return vec3(0.0);
    }
}

// Modified sky gradient function including stars
vec3 generate_sky(vec3 eyedir) {
    // Create gradient
    float horizon = smoothstep(-0.1, 0.5, eyedir.y);
    vec3 base_sky = mix(
        sky_color_a,
        sky_color_b,
        horizon
    );

    // Generate stars
    vec3 stars = generate_stars(eyedir);

    // Add stars to the base sky color
    return base_sky + stars;
}

// Generate clouds based on noise texture (using darker color)
vec4 generate_clouds(vec3 eyedir) {
	// Create UV coordinates based on eyedir, dividing to get a curved effect
    vec2 uv = eyedir.xz / (eyedir.y + 1.0);

    // time-based movement
    uv.y -= TIME * cloud_speed;

    uv = fract(uv); // Combat the tiling effect

    // Sample noise texture
    float noise = texture(cloud_noise, uv).r;

    // generate clouds
    float clouds = smoothstep(cloud_min, cloud_max, noise);

    // Use the darker cloud_color and keep semi-transparency
    return vec4(cloud_color, clouds * 0.7);
}

void sky() {
    // Render clouds at half resolution for performance
    if (AT_HALF_RES_PASS) {
        vec4 color = generate_clouds(EYEDIR);
        COLOR = color.rgb;
        ALPHA = color.a;
    }
    // Render the base sky (now with stars) and composite the half-resolution clouds on top
    else {
        vec3 color = generate_sky(EYEDIR);
        COLOR = mix(color, HALF_RES_COLOR.rgb, HALF_RES_COLOR.a);
        ALPHA = 1.0;
    }
}
```

## Shader Parameters

- `sky_color_a`, `sky_color_b`: Colors for the horizon and zenith of the night sky gradient.
- `cloud_color`: Color of the night clouds.
- `cloud_min`, `cloud_max`: Thresholds for cloud density from the noise texture.
- `cloud_speed`: Speed at which clouds move across the sky.
- `cloud_noise`: Noise texture used to generate cloud shapes.
- `star_density`: Controls how many stars appear in the sky.
- `star_brightness`: Controls the overall brightness of the stars.
- `twinkle_speed`: Speed of the star twinkling animation.
- `star_scale`: Controls the apparent size and spacing of stars.

## Shader Logic

- **Sky Gradient**:
  - Blends between two colors based on the vertical direction, simulating the transition from horizon to zenith.
- **Stars**:
  - Uses a hash function to procedurally generate star positions and brightness.
  - Stars twinkle over time and have slight brightness variation for realism.
- **Clouds**:
  - Uses a noise texture to create soft, semi-transparent clouds.
  - Clouds drift slowly by animating the UV coordinates over time.
  - Rendered at half resolution for performance, then composited over the sky.
- **Compositing**:
  - The shader first renders clouds at half resolution, then blends them over the base sky and stars for the final effect.
