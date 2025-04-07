---
title: Minigun
description: Detailing the minigun mechanics
lastUpdated: 2025-04-07
author: Tjorn
---

## Weapon Description

The minigun is a powerful ranged weapon that fires a high volume of bullets in quick succession. Each bullet deals a small amount of damage, but the sheer number of rounds fired can quickly deplete their health. The minigun has a relatively long cooldown time to make up for it's range and damage output.

## Attack State Mechanics

The attack state is the core mechanic of the minigun weapon system, handling both the visual representation and damage dealing functionality. When activated, the minigun enters this state and begins rapidly firing projectiles in a controlled spiral pattern, simulating the characteristic "spray" of a multi-barreled machine gun. The state manages bullet generation, trajectory visualization, collision detection, and timing control to ensure the weapon feels powerful while maintaining game balance. Unlike simpler weapons, the minigun's attack state employs sophisticated mathematics to create its distinctive firing pattern while efficiently handling the high volume of projectiles.

### Spiral Firing Pattern

The minigun doesn't fire every bullet from the same location. Instead, it uses a spiral pattern that:

- Creates a more chaotic and unpredictable firing pattern
  - This balances the weapon's high fire rate with a degree of unpredictability
- Visually communicates the weapon's power

The spiral pattern is achieved by calculating bullet origins based on a rotating offset around a central point (`barrel_radius`). This simulates the multiple rotating barrels of a real minigun, where each barrel fires at a different position in the rotation cycle.

### Bullet Visualization

The weapon creates real-time tracer effects for each bullet using:

- `ImmediateMesh` for efficient, programmatic mesh generation
- Cylindrical geometry to represent bullet trajectories
- Timed self-destruction of these visual elements to prevent memory leaks
  - Also makes sure the visual effects don't linger indefinitely in the scene, obscuring gameplay
- Raycasts to check for collisions with enemies and the environment
  - Collision masks to filter out unwanted collisions

These visualizations serve multiple purposes:

- Provide immediate visual feedback to players
- Help players understand the weapon's effective range and firing pattern
- Enhance the game feel through visual effects

### Splitting visual and physics processing

The minigun's firing system splits the visual and technical processing into two distinct phases:

1. **Visual Phase (immediate)**: Creates immediate visual feedback when firing

   - Happens in the main process loop for responsive player feedback
   - Generates trajectory visualizations instantly
   - Uses a queue system to synchronize visuals and physics

2. **Physics Phase (fixed interval)**: Handles actual collision detection
   - In order for raycasts to accurately detect collisions, they need to be updated in the physics process
     - The raycasts are created in the main process loop, but the actual collision checks are done in the physics process

This separation ensures that:

- Players experience no visual lag when firing. This improves the game's feel.
- Physics calculations remain accurate and consistent, by using Godot's built-in physics processing.

### Automatic Timing Control

The minigun uses a timer system to enforce attack duration limits. This is done to prevent infinite firing and balance the weapon's power within the gameplay. When the attack duration expires, the weapon automatically transitions to a cooldown state. This cooldown state is relatively long, to ensure players don't just hide in a corner and spam the minigun.

## Attack state code

The idle, windup and cooldown states are not shown here, since they are not that interesting and relatively simple.

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

### Code Features

#### State Management

- Built on top of a base ranged combat class to reuse common weapon features
- Uses timers to control how long the attack lasts
- Properly sets up when entering the state and cleans up when exiting

#### Performance Optimization

- Uses a queue system to separate visual effects from hit detection
- Creates bullet trails directly in code instead of loading pre-made models
- Automatically removes visual effects after they're no longer needed
- Generates bullet geometry on the fly to save memory

#### Mathematics

- Creates spiral bullet patterns using circular math
- Uses vector math to properly position and orient bullet trails
- Builds 3D bullet trail shapes dynamically
- Uses angle limits and direction changes to create a back-and-forth spray pattern

#### Godot Engine Features

- Uses Godot's built-in collision system with RayCast3D
- Filters which objects can be hit using collision masks
- Creates and removes objects in the game world as needed
- Uses Godot's timer system for both gameplay and cleanup tasks
