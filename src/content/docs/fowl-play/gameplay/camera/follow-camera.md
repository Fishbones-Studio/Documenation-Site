---
title: Follow Camera
description: Camera system that follows a target entity with smoothness and collision avoidance.
lastUpdated: 2025-05-14
author: Sly
---

The `FollowCamera` is a camera system designed to follow a target entity in a 3D environment. It provides smooth camera movement and collision avoidance, ensuring that the camera maintains a set distance from the target while avoiding obstacles in the environment.

## Properties
### Camera Configuration

| Type	| Name	| Description |
|-------|-------|-------------|
| Camera3D	| camera_reference | Reference to the Camera3D node that will follow the target |
| float	| camera_spring_length | The default distance the camera maintains from the target |
| float	| camera_margin | Additional margin for collision detection with environment |
| float	| camera_smoothness | Interpolation factor for camera movement smoothness |

### Target Entity

| Type	| Name	| Description |
|-------|-------|-------------|
| CharacterBody3D	| entity_to_follow | The target entity that the camera will follow |
| float	| entity_follow_horizontal_offset | Horizontal offset from the target entity on the x-axis |
| float	| entity_follow_height | Height offset from the target entity on the y-axis |
| float	| entity_follow_distance | Distance offset from the target entity on the z-axis |

### Screen Shake

| Type	| Name	| Description |
|-------|-------|-------------|
| float	| shake_intensity | Current shake intensity |
| float	| shake_intensity_limit | Maximum shake intensity |

### Camera Control

| Type	| Name	| Description |
|-------|-------|-------------|
| float	| horizontal_sensitivity | Mouse horizontal sensitivity |
| float	| vertical_sensitivity | Mouse vertical sensitivity |
| float	| controller_sensitivity | Controller stick sensitivity |
| float	| max_degrees | Maximum upward tilt angle |
| float	| min_degrees | Maximum downward tilt angle |
| bool	| invert_x_axis | Whether to invert X-axis controls |
| bool	| invert_y_axis | Whether to invert Y-axis controls |

### Node References

| Type	| Name	| Description |
|-------|-------|-------------|
| SpringArm3D	| spring_arm_3d | Spring arm for collision handling |
| RemoteTransform3D	| follow_camera_transformer | Handles camera positioning |

## Implementation

### Hierarchy
```
FollowCamera (Node3D)
│ SpringArm3D (SpringArm3D)
│   │ CameraPosition (Node3D)
│ FollowCameraTransformer (RemoteTransform3D) 

```
### Code

`_ready()` initializes the camera settings and connects to the `controls_settings_changed` signal to update camera properties when controls settings change. It also sets the spring arm length, margin, and smoothness based on the property value. The camera's position is adjusted to follow the target entity with specified offsets.
```gdscript
func _ready() -> void:
	_load_camera_settings()

	if !camera_reference:
		push_error("No Camera3D set")

	spring_arm_3d.spring_length = camera_spring_length
	spring_arm_3d.margin = camera_margin

	follow_camera_transformer.remote_path = camera_reference.get_path()
	follow_camera_transformer.lerp_weight = camera_smoothness

	# Change the parent of the follow camera and set it's position
	call_deferred("reparent", entity_to_follow)
	position = Vector3(entity_follow_horizontal_offset, entity_follow_height, entity_follow_distance)

	SignalManager.controls_settings_changed.connect(_load_camera_settings)
```

`_input()` handles mouse and controller input for camera rotation. It applies inversion based on the `invert_x_axis` and `invert_y_axis` properties. The camera's rotation is adjusted based on the input values, and the `_apply_camera_clamp()` function is called to limit the camera's tilt angles.
```gdscript
func _input(event) -> void:
	if UIManager.game_input_blocked: return
	if event is InputEventMouseMotion:
	 	# Apply inversion to mouse input
		var x_input: float = event.relative.x * (-1 if invert_x_axis else 1)
		var y_input: float = event.relative.y * (-1 if invert_y_axis else 1)

		# Mouse sensitivity control
		entity_to_follow.rotate_y(deg_to_rad(-x_input) * horizontal_sensitivity)
		rotate_x(deg_to_rad(-y_input) * vertical_sensitivity)
		_apply_camera_clamp()
```

`_process()` handles the camera's position and rotation based on the target entity's movement. It applies controller input for camera rotation and adjusts the camera's position to follow the target entity. The `_apply_camera_clamp()` function is called to limit the camera's tilt angles. If the shake intensity is greater than 0, it applies a random offset to create a shake effect.
```gdscript
func _process(delta) -> void:
	if UIManager.game_input_blocked: return
	# Calculate controller input
	var x_axis: float = Input.get_action_strength("right_stick_right") - Input.get_action_strength("right_stick_left") \
		if invert_x_axis else Input.get_action_strength("right_stick_left") - Input.get_action_strength("right_stick_right")
	var y_axis: float = Input.get_action_strength("right_stick_down") - Input.get_action_strength("right_stick_up") \
		if invert_y_axis else Input.get_action_strength("right_stick_up") - Input.get_action_strength("right_stick_down")

	# Apply controller input with sensitivity
	entity_to_follow.rotation.y += x_axis * horizontal_sensitivity * delta * controller_sensitivity
	rotation.x += y_axis * vertical_sensitivity * delta * controller_sensitivity

	_apply_camera_clamp()

	## If shake intensity is more than 0, we are shaking the screen
	if shake_intensity > 0:
		## Decrease the shake intensity by lerping between the current intensity and 0.0
		shake_intensity = lerp(shake_intensity, 0.0, shake_fade_speed * delta)
		## The offset gets applied to the camera
		camera_reference.h_offset = _get_random_offset().x
		camera_reference.v_offset = _get_random_offset().y
```

`apply_shake()` sets the shake intensity to the specified trauma value, clamping it to the maximum shake intensity limit. The `_get_random_offset()` function generates a random offset for
```gdscript
## Set the shake intensity to the intensity limit at the start of the screen shake
func apply_shake(trauma: float) -> void:
	shake_intensity = min(trauma, shake_intensity_limit)
```

`_get_random_offset()` generates a random offset for the camera shake effect. It uses the `rng` variable to create a random value between the negative and positive shake intensity on both the x and y axes.
```gdscript
## This calculates a random offset between -current_shake_intensity and +current_shake_intensity
## on both the x and y axis
## Use rng to make the offset more 'random'
func _get_random_offset() -> Vector2:
	return Vector2(
		rng.randf_range(-shake_intensity, shake_intensity),
		rng.randf_range(-shake_intensity, shake_intensity)
	)
```

`_apply_camera_clamp()` clamps the camera's rotation to prevent flipping and limits the tilt angles based on the `min_degrees` and `max_degrees` properties. It ensures that the camera's rotation on the z-axis is set to 0.
```gdscript
func _apply_camera_clamp() -> void:
	# Clamp the rotation to prevent flipping
	rotation.z = 0
	rotation.x = clamp(rotation.x, deg_to_rad(min_degrees), deg_to_rad(max_degrees))
```

`_load_camera_settings()` loads the camera settings from a configuration file. It uses the `ConfigFile` class to read the settings and updates the camera properties accordingly. The settings include horizontal and vertical sensitivity, controller sensitivity, tilt angles, and axis inversion.
```gdscript
func _load_camera_settings() -> void:
	var config: ConfigFile = ConfigFile.new()
	var cfg_path: String = "user://settings.cfg"
	var cfg_name: String = "controls"
	var camera_settings: Array[Dictionary] = []
	var default_settings_resource: ControlsSetting = preload("uid://b7ndswiwixuqa")

	camera_settings = default_settings_resource.default_settings

	# Attempt to load config file - return if failed
	if config.load(cfg_path) == OK and config.has_section(cfg_name):
		for control_setting in config.get_section_keys(cfg_name):
			var value = config.get_value(cfg_name, control_setting)
			match control_setting:
				"horizontal_sensitivity": horizontal_sensitivity = value["value"]
				"vertical_sensitivity": vertical_sensitivity = value["value"]
				"controller_sensitivity": controller_sensitivity = value["value"]
				"controller_sensitivity": controller_sensitivity = value["value"]
				"camera_up_tilt": max_degrees = value["value"]
				"camera_down_tilt": min_degrees = value["value"]
				"invert_x_axis": invert_x_axis = value["value"]
				"invert_y_axis": invert_y_axis = value["value"]
```

## Dependencies
- `controls_settings`: The `FollowCamera` class relies on the `ControlsSetting` resource to provide default or custom values for camera settings such as sensitivity, tilt angles, and axis inversion.
- `SignalManager`: The `FollowCamera` class uses the `SignalManager` to connect to the `controls_settings_changed` signal for updating camera properties when controls settings change.

## Usage

To use the `FollowCamera` class, usually, you make it a child of the main scene and set the `camera_reference` to the desired `Camera3D` node. Assign the target entity to `entity_to_follow`, and adjust the camera properties as needed. The camera will automatically follow the target entity with smooth movement and collision avoidance.