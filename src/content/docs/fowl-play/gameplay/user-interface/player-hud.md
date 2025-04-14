---
title: Player Hud
description: The player hud
lastUpdated: 2025-04-14
author: Tjorn
---

## Health and Stamina bar

Shows the player's current health and stamina.

```gdscript
extends VBoxContainer

@onready var health_bar: HealthBar = %HealthBar
@onready var stamina_bar: StaminaBar = %StaminaBar


func _ready() -> void:
	Input.mouse_mode = Input.MOUSE_MODE_CAPTURED

	# Initializing the health and stamina bars
	SignalManager.init_health.connect(health_bar.init_health)
	SignalManager.init_stamina.connect(stamina_bar.init)

	SignalManager.player_stats_changed.connect(_on_stats_changed)


func _on_stats_changed(stats: LivingEntityStats) -> void:
	# updating the max values
	health_bar.max_value = stats.max_health
	stamina_bar.max_value = stats.max_stamina

	health_bar.health = stats.current_health
	stamina_bar.stamina = stats.current_stamina
```

## Player icon

Created using subviewport. Subviewport camera only looks at layer 2.
Gives feedback to the player, when taking damage and healing. Since it used a subviewport, animations also show up.

```gdscript
extends CenterContainer

@export_group("Shaders")
@export var hurt_time : float = 0.15
@export var heal_time : float = 0.25
@export var hurt_shader : ShaderMaterial
@export var heal_shader : ShaderMaterial

@export_group("Fov")
@export var normal_fov : float = 65.0
@export var effect_fov : float = 75.0
@export var fov_tween_duration : float = 0.1 ## How fast the FOV changes

@export_group("Border")
@export var border_starting_colour : Color
@export var border_heal_colour : Color
@export var border_hurt_colour : Color


@onready var duration_timer : Timer = $DurationTimer
@onready var overlay_shader : ColorRect = $OverlayShader
@onready var border : ColorRect = $Border
@onready var camera : Camera3D = %ViewportCamera

var fov_tween : Tween ## Keeping track of the FOV tween


func _ready() -> void:
	# Hide by default
	overlay_shader.hide()

	# set border colour
	border.color = border_starting_colour

	if camera:
		camera.fov = normal_fov
	else:
		printerr("ViewportCamera node not found!")

	# Connect signals
	SignalManager.player_hurt.connect(
		func():
			print("hurt shader")
			_on_player_health(hurt_time, hurt_shader, border_hurt_colour)
	)
	SignalManager.player_heal.connect(
		func():
			print("heal shader")
			_on_player_health(heal_time, heal_shader, border_heal_colour)
	)


func _on_player_health(time : float, shader_material : ShaderMaterial, colour: Color) -> void:
	if not camera:
		printerr("Cannot apply effect: ViewportCamera not found!")
		return

	# Setting the border colour
	border.color = colour

	# Kill previous FOV tween if it's still running
	if fov_tween and fov_tween.is_valid():
		fov_tween.kill()

	# Create a new tween owned by this node
	fov_tween = create_tween()
	# Animate the camera's fov property to the effect_fov
	fov_tween.tween_property(
			camera, "fov", effect_fov, fov_tween_duration
		).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_OUT)

	# Apply the appropriate shader
	overlay_shader.material = shader_material

	# Reset shader visibility timer if already playing
	if overlay_shader.visible:
		duration_timer.stop()

	overlay_shader.show()
	duration_timer.start(time) # Start timer for shader visibility


func _on_duration_timer_timeout():
	if not camera:
		return

	# resetting border colour
	border.color = border_starting_colour

	# Kill previous FOV tween if it's still running (unlikely here, but safe)
	if fov_tween and fov_tween.is_valid():
		fov_tween.kill()

	# Create a new tween to return FOV to normal
	fov_tween = create_tween()
	# Animate the camera's fov property back to the normal_fov
	fov_tween.tween_property(
			camera, "fov", normal_fov, fov_tween_duration
		).set_trans(Tween.TRANS_SINE).set_ease(Tween.EASE_IN)

	# Hide the shader effect
	overlay_shader.hide()
```

```gdshader
extends SubViewport

@export var offset : Vector3 = Vector3(0.0, 1.5, -1.8)
@onready var camera : Camera3D = %ViewportCamera


func _process(_delta: float) -> void:
	if GameManager.chicken_player:
		var player = GameManager.chicken_player

		# Position camera behind the player
		var rotated_offset = player.transform.basis * offset
		camera.global_position = player.global_position + rotated_offset

		# Calculate a target point in front of the player
		var target_position = player.global_position + player.transform.basis.z * 5.0
		target_position.y = camera.global_position.y  # Match camera's height

		# Look at the forward point
		camera.look_at(target_position)
```

### Shaders

#### Hurt Shader

```gdshader
shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, filter_linear_mipmap, repeat_enable;
uniform vec3 hurt_color = vec3(0.8, 0.0, 0.0);
uniform float overlay_alpha : hint_range(0.0, 1.0) = 0.5;
uniform float aberration_strength : hint_range(0.0, 1.0) = 0.015;
uniform float displacement_strength : hint_range(0.0, 0.05) = 0.01;
uniform vec2 abberation_offset = vec2(0.5);
uniform float time;

void fragment() {
    vec2 uv = SCREEN_UV;

    // Add a subtle displacement. Higer weight for uv, but make it slightly different
    uv += vec2(
        sin(uv.y * 50.0 + time * 5.0),
        cos(uv.x * 50.0 + time * 5.0)
    ) * displacement_strength;

    // Chromatic aberration offsets
    vec2 offset = (uv - abberation_offset) * aberration_strength;

    // Sample each channel with a slight offset
    float r = texture(screen_texture, uv + offset).r;
    float g = texture(screen_texture, uv).g;
    float b = texture(screen_texture, uv - offset).b;

    vec3 aberrated_color = vec3(r, g, b);

    // Compute difference between channels
    float diff = abs(r - b);
    // Blending the chromattic effect with the hurt color
    float blend_factor = clamp(1.0 - diff * 10.0, 0.0, 1.0);
    vec3 final_color = mix(aberrated_color, hurt_color, blend_factor);

    COLOR = vec4(final_color, overlay_alpha);
}
```

#### Heal Shader

Based on the [gaussian blur shader]("TODO ADD LINK") by ADD NAME.

```gdshader
shader_type canvas_item;

uniform sampler2D screen_texture : hint_screen_texture, repeat_disable, filter_nearest;
uniform float blur_strength : hint_range(0.1, 5.0) = 2.3;
uniform float glow_intensity : hint_range(0.0, 5.0) = 1.8;
uniform vec3 heal_color : source_color = vec3(0.0, 1.0, 0.4);
uniform float overlay_alpha : hint_range(0.0, 1.0) = 0.5;

// Formula stolen from the internet
float gaussianDistribution(float x, float STD) {
    return exp(-(x*x)/(2.0*STD*STD))/(sqrt(2.0*PI)*STD);
}

vec4 gaussianGlow(sampler2D sampler, vec2 pos, vec2 pixel_size, float sigmaUsed, int radius) {
    vec4 blurredPixel = vec4(0.0);
    float total_weight = 0.0;

    // Increased radius multiplier for more pronounced blur
    int actualRadius = int(round(4.0 * blur_strength));

    for(int i = -actualRadius; i <= actualRadius; i++) {
        for(int j = -actualRadius; j <= actualRadius; j++) {
            vec2 offset = vec2(float(i), float(j)) * pixel_size;
            vec2 samplePos = pos + offset;

            // Calculate 2D Gaussian weight
            float weight = gaussianDistribution(float(i), sigmaUsed) *
                          gaussianDistribution(float(j), sigmaUsed);

            blurredPixel += texture(sampler, samplePos) * weight;
            total_weight += weight;
        }
    }

    blurredPixel /= total_weight;
    return blurredPixel;
}

void fragment() {
    // Get the blurred result
    vec4 blurred = gaussianGlow(screen_texture, SCREEN_UV, SCREEN_PIXEL_SIZE, blur_strength, int(round(4.0 * blur_strength)));

    // Apply glow color and intensity
    vec3 glow = blurred.rgb * heal_color * glow_intensity;

    // Maintain alpha from original blur
    float alpha = max(blurred.a, overlay_alpha);

    COLOR = vec4(glow, alpha);
}
```
