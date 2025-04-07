---
title: Minigun
description: Detailing the minigun mechanics
lastUpdated: 2025-04-07
author: Tjorn
---

## Weapon Description

The minigun is a powerful ranged weapon that fires a high volume of bullets in quick succession. Each bullet deals a small amount of damage, but the sheer number of rounds fired can overwhelm enemies and quickly deplete their health.

## Attack State Mechanics

The minigun uses a specialized attack state implementation, which creates a distinctive firing pattern.

### Spiral Firing Pattern

The minigun doesn't fire every bullet from the same location. Instead, it uses a spiral pattern that:

- Creates a more realistic representation of rotary barrel weapons
- Produces a distinctive "spray" effect that feels powerful to players
- Balances the weapon's high fire rate with a degree of unpredictability
- Visually communicates the weapon's power through spread patterns

The spiral pattern is achieved by calculating bullet origins based on a rotating offset around a central point (`barrel_radius`). This simulates the multiple rotating barrels of a real minigun, where each barrel fires at a different position in the rotation cycle.

### Advanced Bullet Visualization

The weapon creates real-time tracer effects for each bullet using:

- `ImmediateMesh` for efficient, programmatic mesh generation
- Cylindrical geometry to represent bullet trajectories
- Timed self-destruction of visual elements to prevent memory leaks
  - Also makes sure the visual effects don't linger indefinitely in the scene, obscuring gameplay
    - This ensures a smoother gameplay experience without visual clutter
- Raycasts to check for collisions with enemies and the environment
  - Collision masks to filter out unwanted collisions
    - The bullet only affects enemies and players.

These visualizations serve multiple purposes:

- Provide immediate visual feedback to players
- Help players understand the weapon's effective range
- Enhance the game feel through visual effects

### Two-Phase Bullet Processing

The minigun's firing system operates in two distinct phases for technical and gameplay reasons:

1. **Visual Phase (process)**: Creates immediate visual feedback when firing

   - Happens in the main process loop for responsive player feedback
   - Generates trajectory visualizations instantly

2. **Physics Phase (physics_process)**: Handles actual collision detection
   - Deferred to the physics step for accurate collision detection
   - Uses a queue system to synchronize visuals with physics

This separation ensures that:

- Players experience no visual lag when firing
- Physics calculations remain accurate and consistent
- The game maintains performance even during rapid fire

### Automatic Timing Control

The minigun uses a timer system to:

- Enforce attack duration limits
- Prevent indefinite firing
- Balance the weapon's power within gameplay

When the attack duration expires, the weapon automatically transitions to a cooldown state, ensuring players can't exploit the weapon's high damage output indefinitely.

## Attack state code

```gdscript
extends BaseRangedCombatState

@export var attack_origin: Node3D
@export var barrel_radius: float = 0.2  # Radius of minigun barrel arrangement
@export var spiral_spread: float = 25.0  # Degrees between each bullet's angle
@export var max_spread_angle: float = 45.0  # Max spray angle

var _fire_timer: float = 0.0
var _current_angle: float = 0.0
var _angle_direction: int = 1
var _ray_queue: Array[RayRequest] = []

@onready var attack_duration_timer : Timer = $AttackDurationTimer


func enter(_previous_state, _info: Dictionary = {}) -> void:
	_fire_timer = 0.0
	_current_angle = 0.0
	_angle_direction = 1
	attack_duration_timer.start(weapon.current_weapon.attack_duration)


func process(delta: float) -> void:
	_fire_timer += delta

	var fire_interval: float = weapon.current_weapon.fire_rate_per_second

	while _fire_timer >= fire_interval:
		_fire_timer -= fire_interval
		_fire_bullet()


func physics_process(_delta: float) -> void:
	# loop through raycast queue, create raycasts and check for collisions
	for ray_param in _ray_queue:
		var origin: Vector3 = ray_param.origin
		var direction: Vector3 = ray_param.direction
		var max_range: float = ray_param.max_range

		var raycast: RayCast3D = _create_raycast(origin, direction, max_range)
		raycast.force_raycast_update()
		process_hit(raycast)
	_ray_queue.clear()


func exit() -> void:
	# Reset the angle to the initial position
	_current_angle = 0.0
	_angle_direction = 1

	attack_duration_timer.stop()

	# Clear ray cast queue, allows existing raycasts to still be processed
	_ray_queue.clear()


# The visualization should start immediatly for game feel, but Raycasts need to be processed in physics_process to work
func _fire_bullet() -> void:
	# Calculate spawn position with rotating offset
	var angle_rad : float = deg_to_rad(_current_angle)
	var offset := Vector3(
		cos(angle_rad) * barrel_radius,
		sin(angle_rad) * barrel_radius,
		0
	)

	var fire_direction: Vector3 = attack_origin.global_basis.z.normalized()
	var max_range: float = weapon.current_weapon.max_range
	var origin: Vector3 = attack_origin.global_position + attack_origin.global_transform.basis * offset

	# Store raycast parameters for physics processing
	_ray_queue.append(RayRequest.new(origin, fire_direction, max_range))

	# Visualize the trajectory
	_create_trajectory_visualization(origin, fire_direction, max_range)
	_update_spiral_angle()


func _create_raycast(origin: Vector3, direction: Vector3, max_range: float) -> RayCast3D:
	var raycast := RayCast3D.new()
	raycast.enabled = true
	raycast.target_position = direction * max_range
	raycast.collision_mask = 0b0110 # check for collisions on layer 2 (player) and layer 3 (enemy)

	# Add to physics space first
	get_tree().root.add_child(raycast)
	raycast.global_position = origin

	# Creating a timer to automatically remove the raycast
	var timer := Timer.new()
	raycast.add_child(timer)
	timer.wait_time = 0.1
	timer.one_shot = true
	timer.timeout.connect(func():
		if is_instance_valid(raycast) and raycast.is_inside_tree():
			raycast.queue_free()
	)
	timer.start()

	return raycast


func _create_trajectory_visualization(origin: Vector3, direction: Vector3, max_range: float) -> void:
	var trajectory_mesh := ImmediateMesh.new()
	var mesh_instance := MeshInstance3D.new()
	mesh_instance.mesh = trajectory_mesh
	mesh_instance.cast_shadow = GeometryInstance3D.SHADOW_CASTING_SETTING_OFF

	# Add to scene root but position in world space
	get_tree().current_scene.add_child(mesh_instance)
	mesh_instance.global_position = origin

	trajectory_mesh.surface_begin(Mesh.PRIMITIVE_TRIANGLES)
	trajectory_mesh.surface_set_color(Color(1.0, 0.5, 0.0, 0.3))  # Tracers

	var radius := 0.1  # Tracer thickness
	var segments := 6
	var start_verts: Array[Vector3] = []
	var end_verts: Array[Vector3] = []
	var ortho := _find_orthogonal_vector(direction)

	for i in segments:
		var angle := float(i) / segments * TAU
		var circle_vec := ortho.rotated(direction, angle) * radius
		start_verts.append(circle_vec)
		end_verts.append(direction * max_range + circle_vec)

	_generate_cylinder_geometry(trajectory_mesh, start_verts, end_verts, segments)
	trajectory_mesh.surface_end()

	# Creating a timer to automatically remove the mesh
	var timer := Timer.new()
	mesh_instance.add_child(timer)
	timer.wait_time = 0.15
	timer.one_shot = true
	timer.timeout.connect(func():
		mesh_instance.queue_free()
		timer.queue_free()
	)
	timer.start()


func _find_orthogonal_vector(direction: Vector3) -> Vector3:
	return (
		Vector3.RIGHT
		if abs(direction.dot(Vector3.UP)) < 0.9
		else Vector3.FORWARD
	).cross(direction).normalized()


func _generate_cylinder_geometry(
	mesh: ImmediateMesh,
	start_verts: Array[Vector3],
	end_verts: Array[Vector3],
	segments: int
) -> void:
	for i in segments:
		var next_i := (i + 1) % segments

		# Side triangles
		mesh.surface_add_vertex(start_verts[i])
		mesh.surface_add_vertex(end_verts[i])
		mesh.surface_add_vertex(start_verts[next_i])

		mesh.surface_add_vertex(start_verts[next_i])
		mesh.surface_add_vertex(end_verts[i])
		mesh.surface_add_vertex(end_verts[next_i])


func _update_spiral_angle() -> void:
	_current_angle += spiral_spread * _angle_direction
	_current_angle = clamp(_current_angle, -max_spread_angle, max_spread_angle)
	_angle_direction *= -1 if abs(_current_angle) >= max_spread_angle else 1


func _on_attack_duration_timer_timeout() -> void:
	transition_signal.emit(WeaponEnums.WeaponState.COOLDOWN, {})

```
