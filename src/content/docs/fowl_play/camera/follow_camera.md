---
title: Camera System
description: Follow camera system.
lastUpdated: 2025-03-13
author: Sly
---

## Description
The camera system uses a follow camera implementation that makes the camera follow a target entity with smoothness and collission avoidance capabilities. It uses a [SpringArm3D][1] to maintain a set distance from the target while handling collisions with the environment.

Using this camera system we separate camera logic from the player character and everything else. Therefore we can easily attach it to different entities with minimal configuration.

### Hierarchy
```
FollowCamera (Node3D)
│ SpringArm3D (SpringArm3D)
│   │ CameraPosition (Node3D)
│ FollowCameraTransformer (RemoteTransform3D) 

```
The `FollowCamera` node manages the relationship between the camera and the target entity. It handles input processing for camera rotation and maintains the camera's position relative to the target.

The `SpringArm3D` node handles collision detection and maintains the desired distance from the target. When a collision occurs, it automatically adjusts the camera position to prevent clipping through objects.

The `CameraPosition` node handles the target destination for the Camera3D node.

The `FollowCameraTransformer` node handles the smooth interpolation of the camera's position towards the target position, in this case the position of the `CameraPosition` node.


## 
### FollowCamera
#### Properties
|||||
|--------------------------|------------------------------------|-------------------|-|
| [Camera3D][2]              | camera_reference                 |                   |Reference to the Camera3D node<br>that will follow the target|
| [float][3]                 | camera_spring_length             |`4.8`              |The default distance the camera<br> maintains from the target|
| [float][3]                 | camera_margin                    |`0.5`              |Additional margin for collision<br>detection with environment|
| [float][3]                 | camera_smoothness                |`6.0`              |Interpolation factor for camera<br>movement smoothness|
| [float][3]                 | horizontal_sensitivity           |`0.5`              |Sensitivity factor for horizontal<br>camera rotation|
| [float][3]                 | vertical_sensitivity             |`0.5`              |Sensitivity factor for vertical<br>camera rotation|
| [float][3]                 | min_degrees                      |`-90.0`            |Minimum vertical angle (in<br>degrees) for camera rotation|
| [float][3]                 | max_degrees                      |`45.0`             |Maximum vertical angle (in<br>degrees) for camera rotation|
| [CharacterBody3D][4]       | entity_to_follow                 |                   |The target entity that the<br>camera will follow|
| [float][3]                 | entity_follow_horizontal_offset  |`3.0`              |Horizontal offset from the target<br>entity on the x-axis|
| [float][3]                 | entity_follow_height             |`4.3`              |Height offset from the target<br>entity on the y-axis|
| [float][3]                 | entity_follow_distance           |`0.0`              |Distance offset from the target<br>entity on the z-axis|

#### Methods

```gdscript
func _ready():
	if (!camera_reference):
		push_error("No Camera3D set")

	spring_arm_3d.spring_length = camera_spring_length
	spring_arm_3d.margin = camera_margin

	follow_camera_transformer.remote_path = camera_reference.get_path()
	follow_camera_transformer.lerp_weight = camera_smoothness

	# Change the parent of the follow camera and set it's position
	call_deferred("reparent", entity_to_follow)
	position = Vector3(entity_follow_horizontal_offset, entity_follow_height, entity_follow_distance)
```
The `_ready()` method intializes the carema system by setting up the properties for both the spring arm and the remote transformer. Then it reparents the follow camera to the target entity and sets the position of the camera relative to the target.

```gdscript
func _input(event):
	if event is InputEventMouseMotion:
		# Mouse sensitivity control
		entity_to_follow.rotate_y(deg_to_rad(-event.relative.x) * horizontal_sensitivity)
		rotate_x(deg_to_rad(-event.relative.y) * vertical_sensitivity)
		_apply_camera_clamp()
```
The `_input()` method processes mouse input events for camera rotation. The horizontal movement rotates the target entity in the y-axis (left and right), while vertical movement rotates the camera in the x-axis (up and down). We then call the `_apply_camera_clamp()` method to limit the rotation of the camera.

```gdscript
func _process(delta):
	# Calculate controller input
	var x_axis: float = Input.get_action_strength("right_stick_right") - Input.get_action_strength("right_stick_left")
	var y_axis: float = Input.get_action_strength("right_stick_up") - Input.get_action_strength("right_stick_down")

	# Apply controller input with sensitivity
	entity_to_follow.rotation.y += -x_axis * horizontal_sensitivity * delta
	rotation.x += y_axis * vertical_sensitivity * delta

	_apply_camera_clamp()
```
The `_process()` method processes gamepad input for camera rotation using the right analog stick. Applies the same rotation logic as mouse input but scaled by delta time.

```gdscript
func _apply_camera_clamp():
	# Clamp the rotation to prevent flipping
	rotation.z = 0
	rotation.x = clamp(rotation.x, deg_to_rad(min_degrees), deg_to_rad(max_degrees))
```
The `_apply_camera_clamp()` method applies rotation constraints to prevent the camera from flipping and keeping the vertical rotation within the specified min/max range. 

### FollowCameraTransformer
#### Properties
||||
|---------------|---------------|-|
| [float][3]    | lerp_weight   |Interpolation factor for position smoothing|
| [Node3D][5]   | camera        |Reference to the CameraPosition node|

#### Methods
```gdscript
func _process(delta: float) -> void:
	position = lerp(position, camera.position, delta * lerp_weight)
```
The `_process()` method performs smooth interpolation of the camera's position to the target position (`CameraPosition` node's position), based on the specified lerp_weight (camera_smoothness in the `FollowCamera` node) and delta time. 

## Implementation Notes 
- Ensure the `FollowCamera` has been assigned an `entity_to_follow` and a `camera_reference`.  
- Adjust properties to fine-tune camera behavior, such as `camera_spring_length` for distance, `camera_margin` for collision handling, `camera_smoothness` for interpolation, etc.

[1]: https://docs.godotengine.org/en/stable/classes/class_springarm3d.html
[2]: https://docs.godotengine.org/en/stable/classes/class_camera3d.html
[3]: https://docs.godotengine.org/en/stable/classes/class_float.html#class-float
[4]: https://docs.godotengine.org/en/stable/classes/class_characterbody3d.html
[5]: https://docs.godotengine.org/en/stable/classes/class_node3d.html#class-node3d