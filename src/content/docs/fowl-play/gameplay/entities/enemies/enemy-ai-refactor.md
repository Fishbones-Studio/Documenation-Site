---
title: Enemy AI Refactor
description: Handles the actions of the enemies and transitions between behaviours.
lastUpdated: 2025-05-01
author: Sly and Jun Yi
---

The Enemy AI uses behavior trees implemented with Limbo AI to control enemy decision-making. Behavior trees were chosen over traditional finite state machines because they allow for more modular, reusable, and debuggable logic. This structure enables enemies to perform complex actions like dynamic chasing, combat tactics, and environmental awareness.

After evaluating alternatives like Beehave, we chose Limbo AI due to its performance efficiency, and a more intuitive editor interface. Unlike Beehave, which had slower updates and fewer advanced features, Limbo AI provided the flexibility and stability needed for our project.

## Impact on existing enemy AI

We previously had already implemented a working enemy AI. This was done with a very basic finite state machine, which did the job, altough it wasn't that intelligent and it was hard to perform more complex tasks.

Since we wanted to make use of LimboAI's behaviour, it meant we had to completely overhaul the enemy AI. Unfortunately, this meant removing all the code from our old enemy AI, as it wasn't compatible to use with the behaviour trees of Limbo AI.


## Design
### Behavior Trees

Each enemy type has its own behavior tree (e.g., woodpecker.tres) that defines how it reacts to the player and environment. These trees are built using nodes for conditions (e.g., "InRange?") and actions (e.g., "StopMovement"). The tree structure allows for clear prioritization, such as attacking when in range, shaking of the player or teleporting behind the player when they are on top of the enemy.

### Blackboard

The Blackboard acts as shared memory for AI agents, storing dynamic data like the enemy's target (player node) or the aggro distance. This allows different parts of the behavior tree to access and modify shared information without direct dependencies.

### Composites, Decorators % Tasks

At the core of our behavior trees are three types of composite nodes that control execution flow. Sequence nodes run child nodes in order until one fails, perfect for attack sequences that require multiple steps. Selector nodes prioritize behaviors by running children until one succeeds, allowing enemies to choose between attacking, and/or chasing. Parallel nodes execute multiple behaviors simultaneously.

We enhance these composites with decorator nodes that modify behavior without requiring custom logic. Cooldown decorators prevent ability spamming by limiting how often nodes can run. Repeat decorators force multiple executions for rapid attacks.

The leaf nodes consist of focused task components. Condition tasks perform targeted checks like verifying if the player is standing on the enemy. Action tasks handle concrete behaviors such as executing teleport moves, triggering abilities, or using weapon attacks.

## Tasks

### Charge

`charge.gd` makes the enemy charge in a straight line with optional wall bouncing behavior. When bouncing is enabled, the enemy will reflect off walls with configurable angle variation and trigger camera shake effects.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target.
@export var target_var: StringName = &"target"
@export var speed_factor: float = 0.0
## How long to perform this task (in seconds).
@export var duration: float = 0.1
## If the enemy should bounce on walls.
@export var bounce: bool = false
## Angle variation when bouncing (in degrees).
@export_range(0.0, 180.0) var bounce_angle_variation: float = 45.0
## Camera shake for bounce
@export_range(0.0, 30.0) var bounce_camera_shake: float = 5.0

var _current_direction: Vector3
var _timed_out: bool


# Display a customized name (requires @tool).
func _generate_name() -> String:
	var name: String = "Charge ➜ "

	if speed_factor > 0.0:
		name += "speed_factor: %.1f  " % speed_factor

	if duration != 0.1:
		name += "duration: %.1f  " % duration

	if bounce:
		name += "bounce: %s  " % bounce

	if bounce_angle_variation != 45.0:
		name += "bounce_angle_variation: %.1f  " % bounce_angle_variation

	if bounce_camera_shake != 5.0:
		name += "bounce_camera_shake: %.1f" % bounce_camera_shake

	return name if name != "Charge ➜ " else "Charge"


func _enter() -> void:
	_timed_out = false
	_current_direction = -agent.global_transform.basis.z.normalized()


# Called each time this task is ticked (aka executed).
func _tick(_delta: float) -> Status:
	if _timed_out and agent.is_on_floor():
		return SUCCESS

	if elapsed_time > duration:
		_timed_out = true

	if agent.is_on_wall():
		if bounce:
			_bounce()
			return RUNNING
		else:
			return SUCCESS

	if not _timed_out:
		agent.velocity = _current_direction * _get_current_speed()

	return RUNNING


func _get_current_speed() -> float:
	var base_speed: float = agent.stats.speed

	if speed_factor > 0.0:
		return speed_factor * base_speed
	else:
		return agent.movement_component.sprint_speed_factor * base_speed


func _bounce() -> void:
	# Get normal of the wall we hit
	var wall_normal: Vector3 = agent.get_wall_normal()

	# Calculate reflection direction
	var new_direction: Vector3 = _current_direction.bounce(wall_normal)
	new_direction.y = 0 # Keep movement horizontal

	# Add some randomness to the bounce
	var random_angle: float = deg_to_rad(randf_range(-bounce_angle_variation, bounce_angle_variation))
	var rotation: Basis = Basis(Vector3.UP, random_angle) # Rotate around Y axis only

	_current_direction = (rotation * new_direction).normalized()

	_bounce_camera_shake()


func _bounce_camera_shake() -> void:
	var camera: FollowCamera = agent.get_tree().get_first_node_in_group("FollowCamera")
	camera.apply_shake(bounce_camera_shake)

```

### Dash

`dash.gd` makes the enemy perform a quick dash in their current forward direction. The dash has fixed duration and minimum travel distance, with speed automatically calculated to meet these requirements.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target.
@export var target_var: StringName = &"target"
## Duration of the dash.
@export var dash_duration: float = 0.2
## Minimun travel distance of the dash.
@export var dash_distance: float = 30.0

var _dash_timer: float = 0.0
var _dash_speed: float = 0.0
var _dash_direction: Vector3 = Vector3.ZERO


func _generate_name() -> String:
	return "Dash ➜ %s" % [LimboUtility.decorate_var(target_var)]


func _enter() -> void:
	var target: ChickenPlayer = blackboard.get_var(target_var, null)
	if not is_instance_valid(target):
		return

	_dash_timer = dash_duration
	_dash_direction = -agent.global_basis.z.normalized()
	_dash_speed = (dash_distance / dash_duration) + agent.stats.calculate_speed(agent.movement_component.dash_speed_factor)


func _tick(delta: float) -> Status:
	_dash_timer -= delta

	agent.velocity = _dash_direction * _dash_speed

	if _dash_timer <= 0:
		return SUCCESS

	return RUNNING
```

### Face

`face.gd` rotates the enemy to face a target within specified parameters. The action succeeds when either the enemy is facing within the angle threshold of the target or the maximum duration elapses.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target.
@export var target_var: StringName = &"target"
## The enemy rotation speed.
@export var rotation_speed: float = 6.0
## Angle threshold to return SUCCESS in degrees.
@export var angle_threshold: float = 25.0
## How long to perform this task (in seconds).
@export var duration: float


func _generate_name() -> String:
	return "Face ➜ %s" % [LimboUtility.decorate_var(target_var)]


func _tick(delta: float) -> Status:
	var target: ChickenPlayer = blackboard.get_var(target_var, null)
	if not is_instance_valid(target):
		return FAILURE

	var desired_direction: Vector3 = agent.global_position.direction_to(target.global_position)

	if _is_at_direction(desired_direction):
		return SUCCESS

	if duration and elapsed_time > duration:
		return SUCCESS

	_rotate_toward_direction(desired_direction, delta)
	return RUNNING


func _is_at_direction(direction: Vector3) -> bool:
	var forwad_direction: Vector3 = -agent.global_basis.z.normalized()
	var angle: float = rad_to_deg(forwad_direction.angle_to(direction))

	return angle <= angle_threshold


func _rotate_toward_direction(direction: Vector3, delta: float) -> void:
	var target_angle: float = atan2(-direction.x, -direction.z) # Calculate the angle to the target direction

	# Lerp the angle to smoothly rotate towards the target direction
	agent.rotation.y = lerp_angle(agent.rotation.y, target_angle, rotation_speed * delta)
```

### Flank

`flank.gd` teleports the enemy behind or to the side of the target player at a specified distance, with intelligent position validation to ensure safe spawning.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target
@export var target_var: StringName = &"target"
## Distance behind target to teleport
@export var flank_distance: float = 2.0
## Vertical offset to prevent ground clipping
@export var vertical_offset: float = 0.0
## Radius to check for clear space
@export_range(0.1, 5.0, 0.1) var clearance_radius: float = 0.5


# Display a customized name (requires @tool).
func _generate_name() -> String:
	var name: String = "Flank ➜ "

	if target_var:
		name += LimboUtility.decorate_var(target_var) + "  "

	if flank_distance != 2.0:
		name += "flank_distance: %.1f  " % flank_distance

	if vertical_offset > 0:
		name += "vertical_offset: %.1f  " % vertical_offset

	if clearance_radius != 0.5:
		name += "clearance_radius: %.1f" % clearance_radius

	return name if name != "Flank ➜ " else "Flank"


func _tick(_delta: float) -> Status:
	var target: ChickenPlayer = blackboard.get_var(target_var, null)
	if not is_instance_valid(target):
		return FAILURE

	var flank_position: Vector3 = _get_safe_flank_position(target)
	if flank_position == Vector3.INF:
		return FAILURE

	# Omae wa mou shindeiru
	agent.global_position = flank_position
	agent.velocity = Vector3.ZERO
	agent.look_at(target.global_position)
	return SUCCESS


func _get_safe_flank_position(target: ChickenPlayer) -> Vector3:
	var base_dir: Vector3 = -target.global_transform.basis.z.normalized()
	var test_angles: Array[float] = [180, 90, -90, 45, -45, 0]  # Test multiple approach angles

	for angle in test_angles:
		var rotated_dir: Vector3 = base_dir.rotated(Vector3.UP, deg_to_rad(angle))
		var test_pos: Vector3 = target.global_position + (rotated_dir * flank_distance)
		test_pos.y += vertical_offset

		if _is_position_clear(test_pos):
			return test_pos
	
	return Vector3.INF


func _is_position_clear(position: Vector3) -> bool:
	# Create temporary shape for testing
	var shape: SphereShape3D = SphereShape3D.new()
	shape.radius = clearance_radius

	# Configure query parameters
	var params: PhysicsShapeQueryParameters3D = PhysicsShapeQueryParameters3D.new()
	params.transform = Transform3D(Basis(), position)
	params.shape = shape
	params.collision_mask = agent.collision_mask

	# Perform query
	var space_state: PhysicsDirectSpaceState3D = agent.get_world_3d().direct_space_state
	var results: Array[Dictionary] = space_state.intersect_shape(params, 1)
	return results.is_empty()
```

### Get Target

`get_target.gd` fetches the active ChickenPlayer reference from the GameManager and stores it 
in the specified blackboard variable for use by subsequent nodes.

```gdscript
@tool
extends BTAction

## Blackboard variable in which the task will store the acquired node.
@export var target_var: StringName = &"target"


func _generate_name() -> String:
	return "Get ChickenPlayer ➜ %s" % [
		LimboUtility.decorate_var(target_var)
		]


func _tick(_delta: float) -> Status:
	var target: ChickenPlayer = GameManager.chicken_player
	if is_instance_valid(target):
		blackboard.set_var(target_var, target)
		return SUCCESS
	return FAILURE

``` 

### In Range

`in_range.gd` checks if the agent is within a specified distance range of a target, using squared distance comparison for optimized performance.

```gdscript
@tool
extends BTCondition

## Minimum distance to target.
@export var distance_min: float

## Maximum distance to target.
@export var distance_max: float

## Blackboard variable that holds the target.
@export var target_var: StringName = &"target"

var _min_distance_squared: float
var _max_distance_squared: float


# Called to generate a display name for the task.
func _generate_name() -> String:
	return "InRange (%d, %d) of %s" % [distance_min, distance_max,
		LimboUtility.decorate_var(target_var)]


# Called to initialize the task.
func _setup() -> void:
	## Small performance optimization
	_min_distance_squared = distance_min * distance_min
	_max_distance_squared = distance_max * distance_max


# Called when the task is executed.
func _tick(_delta: float) -> Status:
	var target: ChickenPlayer = blackboard.get_var(target_var, null)
	if not is_instance_valid(target):
		return FAILURE

	var dist_sq: float = agent.global_position.distance_squared_to(target.global_position)
	if dist_sq >= _min_distance_squared and dist_sq <= _max_distance_squared:
		return SUCCESS
	else:
		return FAILURE
```

### Jump

`jump.gd` makes the enemy perform a vertical jump with configurable parameters. The action can be customized with variable jump height and completion conditions.

```gdscript
@tool
extends BTAction

@export_range(1.0, 500.0, 0.1) var jump_factor: float = 1.0
## Duration of the jump.
@export var duration: float
## Oly return SUCCESS if enemy is on floor.
@export var grounded: bool = false

var _initial_jump_height: float
var movement_component: EnemyMovementComponent


func _generate_name() -> String:
	var name: String = "Jump ➜ "

	if not is_equal_approx(jump_factor, 1.0):
		name += "factor: %.1f  " % jump_factor

	if duration > 0:
		name += "duration: %.1fs  " % duration

	if grounded:
		name += "grounded: %s" % grounded

	return name if name != "Jump ➜ " else "Jump"


func _enter() -> void:
	movement_component = agent.movement_component

	if jump_factor > 1.0:
		_initial_jump_height = movement_component.jump_height
		movement_component.jump_height *= jump_factor

	agent.velocity.y = agent.movement_component.get_jump_velocity()


func _tick(delta: float) -> Status:
	if agent.velocity.y < 0 and not bool(duration) and not grounded:
		movement_component.jump_height = _initial_jump_height
		return SUCCESS

	if agent.is_on_floor() and grounded:
		movement_component.jump_height = _initial_jump_height
		return SUCCESS

	if bool(duration) and elapsed_time > duration:
		movement_component.jump_height = _initial_jump_height
		return SUCCESS

	return RUNNING
```

### Patrol
`patrol.gd` makes the enemy move towards a random position within the specific radius. The action allows the enemy to either walk normally or chaotically.

```gdscript
@tool
extends BTAction

## Radius in which the enemy patrols.
@export var patrol_radius: float = 8.0
## Time between destination changes.
@export var patrol_interval: float = 2.0
## The minimun distance which we consider target reached to return SUCCESS.
@export var min_distance: float = 0.5
## If we want to have chaotic movement patterns.
@export var chaotic: bool = false
## The frequency of the enemy changing direction during chaotic movement.
@export var wave_frequency: float = 2.0
## The intensity of how far the enemy deviates during chaotic movement.
@export var wave_amplitude: float = 15.0

var speed: float:
	get:
		return agent.stats.calculate_speed(agent.movement_component.walk_speed_factor)

var _target_position: Vector3
var _origin_position: Vector3
var _current_timer: float = 0.0
var _wave_timer: float = 0.0


func _generate_name() -> String:
	return "Patrol ➜ %.1fm %s" % [patrol_radius, "(Chaotic)" if chaotic else ""]


func _enter() -> void:
	_origin_position = agent.global_position
	_current_timer = 0.0
	_wave_timer = 0.0
	_choose_new_patrol_target()


func _tick(delta: float) -> Status:
	_current_timer += delta
	_wave_timer += delta

	if agent.global_position.distance_to(_target_position) < min_distance:
		return SUCCESS

	if _current_timer >= patrol_interval:
		_choose_new_patrol_target()
		_current_timer = 0.0

	_update_rotation(delta)
	_move_to_position(delta)

	return RUNNING


func _choose_new_patrol_target() -> void:
	var random_angle: float = randf_range(0, TAU)
	var random_distance: float= randf_range(0.5 * patrol_radius, patrol_radius)

	_target_position = _origin_position + Vector3(
		cos(random_angle) * random_distance,
		0,
		sin(random_angle) * random_distance
	)


func _move_to_position(delta: float) -> void:
	var base_direction: Vector3 = agent.global_position.direction_to(_target_position)
	var movement: Vector3 = base_direction * speed

	if chaotic:
		var perpendicular: Vector3 = Vector3(base_direction.z, 0, -base_direction.x)
		movement += perpendicular * sin(_wave_timer * wave_frequency * TAU) * wave_amplitude

	agent.velocity = movement


func _update_rotation(delta: float) -> void:
	var direction: Vector3 = (_target_position - agent.global_position).normalized()
	var target_angle: float = atan2(-direction.x, -direction.z)

	agent.rotation.y = lerp_angle(agent.rotation.y, target_angle, min(speed * delta, 1.0))
```

### Player on Top

`player_on_top.gd` checks if the player is directly above the enemy using a vertical raycast.  This is typically used to detect when the player is standing on the enemy's head.

```gdscript
@tool
extends BTCondition

## distance to look up (including entity height)
@export var check_distance: float = 4.0
@export_flags_3d_physics var player_layer: int = 2


func _generate_name() -> String:
	return "PlayerOnTop ➜ check_distance: %.1f" % check_distance


func _tick(_delta: float) -> Status:
	var result: bool = _is_player_on_top()
	return SUCCESS if result else FAILURE 


func _is_player_on_top() -> bool:
	var space_state: PhysicsDirectSpaceState3D = agent.get_world_3d().direct_space_state
	var params: PhysicsRayQueryParameters3D = PhysicsRayQueryParameters3D.new()

	params.from = agent.global_position
	params.to = agent.global_position + Vector3.UP * check_distance
	params.collision_mask = player_layer

	var hit: Dictionary = space_state.intersect_ray(params)
	return hit and hit["collider"] is ChickenPlayer
```

### Pounce

`pounce.gd` makes the enemy perform a targeted jumping attack toward the player, combining both horizontal movement and vertical arc for a dramatic pounce effect.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target.
@export var target_var: StringName = &"target"
## Controls the height of the pounce.
@export_range(1.0, 100.0, 0.1) var jump_factor: float = 1.0
## Movement speed during the pound sequence.
@export var horizontal_speed: float = 40.0
## Minimum distance to target before returning SUCCESS.
@export var min_distance: float = 10.0

var _is_jumping: bool = false
var _target_position: Vector3
var _initial_jump_velocity: Vector3


func _generate_name() -> String:
	return "Pounce ➜ %s" % [LimboUtility.decorate_var(target_var)]


func _enter() -> void:
	var target: ChickenPlayer = blackboard.get_var(target_var, null)
	if not is_instance_valid(target):
		push_warning("Pounce: Target is not a valid ChickenPlayer (%s: %s)" % [
			LimboUtility.decorate_var(target_var), blackboard.get_var(target_var)])
		return

	_is_jumping = true
	_target_position = target.global_position

	var jump_height: float = agent.movement_component.get_jump_velocity()
	var direction: Vector3 = (_target_position - agent.global_position).normalized()

	_initial_jump_velocity = Vector3(
		direction.x * horizontal_speed,
		jump_height * jump_factor,
		direction.z * horizontal_speed
	)

	agent.velocity = _initial_jump_velocity


func _tick(delta: float) -> Status:
	if not _is_jumping:
		return FAILURE

	var to_target: Vector3 = (_target_position - agent.global_position)
	var horizontal_dir: Vector3 = Vector3(to_target.x, 0, to_target.z).normalized()

	agent.velocity.x += (horizontal_dir.x * horizontal_speed - agent.velocity.x) * delta
	agent.velocity.z += (horizontal_dir.z * horizontal_speed - agent.velocity.z) * delta

	if agent.is_on_floor() and agent.velocity.y < 0:
		_is_jumping = false
		return SUCCESS

	if agent.global_position.distance_to(_target_position) < min_distance:
		return SUCCESS

	return RUNNING
```

### Pursue

`pursue.gd` makes the enemy chase a target while maintaining a specified engagement distance. The action continues until either reaching the target proximity or timing out.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target.
@export var target_var: StringName = &"target"
## How close should the agent be to the desired position to return SUCCESS.
@export var tolerance: float = 2.0
## Desired distance from target.
@export var aggro_distance: float = 20.0
## Pursuit speed factor.
@export var speed_factor: float = 0.0
## Duration the enemy will pursue the target.
@export var duration: float
## Time interval to check if enemy is stuck.
@export var stuck_interval: float = 1.0
## Minimum distance considered not stuck between last check.
@export var stuck_threshold: float = 2.5

var _last_position: Vector3
var _last_check_time: float = 0.0


func _generate_name() -> String:
	return "Pursue ➜ %s" % [LimboUtility.decorate_var(target_var)]


func _enter() -> void:
	_last_position = agent.global_position
	_last_check_time = 0.0


func _tick(delta: float) -> Status:
	var target: ChickenPlayer = blackboard.get_var(target_var, null)
	if not is_instance_valid(target):
		return FAILURE

	_last_check_time += delta

	var desired_pos: Vector3 = target.global_position

	if _is_at_position(desired_pos):
		return SUCCESS

	if bool(duration) and elapsed_time > duration:
		return SUCCESS

	if _is_stuck():
		return FAILURE

	_move_towards_position(desired_pos, delta)
	return RUNNING


func _is_at_position(position: Vector3) -> bool:
	return agent.global_position.distance_to(position) < tolerance


func _move_towards_position(position: Vector3, delta: float) -> void:
	var speed: float = speed_factor if speed_factor > 0.0 else agent.stats.calculate_speed(agent.movement_component.sprint_speed_factor)
	var desired_velocity: Vector3 = agent.global_position.direction_to(position) * speed

	agent.velocity.x = desired_velocity.x
	agent.velocity.z = desired_velocity.z


func _is_stuck() -> bool:
	if _last_check_time < stuck_interval:
		return false

	var current_position: Vector3 = agent.global_position
	var moved_distance: float = current_position.distance_to(_last_position)

	_last_position = current_position
	_last_check_time = 0.0

	return moved_distance < stuck_threshold
```

### Retreat

`retreat.gd` makes the enemy move away from a target while maintaining facing toward it, creating a tactical withdrawal behavior that keeps the target in view.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target
@export var target_var: StringName = &"target"
## Desired distance from target to maintain
@export var retreat_distance: float = 20.0
## Retreat speed factor
@export var speed_factor: float = 0.0
## Rotation speed
@export var rotation_speed: float = 6.0
## Duration the enemy will retreat
@export var duration: float = 0.0


func _generate_name() -> String:
	var name: String = "Retreat ➜ "

	if retreat_distance != 20.0:
		name += "retreat_distance: %.1f  " % retreat_distance

	if not is_equal_approx(speed_factor, 1.0):
		name += "speed_factor: %.1f  " % speed_factor

	if rotation_speed != 6.0:
		name += "rotation_speed: %.1f" % rotation_speed

	if bool(duration):
		name += "duration: %.1f" % duration

	return name if name != "Retreat ➜ " else "Retreat"


func _tick(delta: float) -> Status:
	var target = blackboard.get_var(target_var, null)
	if not is_instance_valid(target):
		return FAILURE

	var retreat_direction: Vector3 = target.global_position.direction_to(agent.global_position)
	var current_distance: float = target.global_position.distance_to(agent.global_position)

	if current_distance > retreat_distance:
		return SUCCESS

	if bool(duration) and elapsed_time > duration:
		return SUCCESS

	_retreat(retreat_direction, delta)
	return RUNNING


func _retreat(direction: Vector3, delta: float) -> void:
	if direction.length() > 0:
		var target_rotation = Basis.looking_at(direction, Vector3.UP)
		agent.transform.basis = agent.transform.basis.slerp(target_rotation, rotation_speed * delta)

	var speed: float = speed_factor if speed_factor > 0.0 else agent.stats.calculate_speed(agent.movement_component.sprint_speed_factor)

	agent.velocity.x = direction.x * speed
	agent.velocity.z = direction.z * speed
```

### Stop Movement

`stop_movement.gd` immediately halts all enemy movement by setting velocity to zero.

```gdscript
extends BTAction


func _tick(delta: float) -> Status:
	agent.velocity = Vector3.ZERO
	if agent.velocity == Vector3.ZERO:
		return SUCCESS
	return RUNNING
```

### Use Ability

`use_ability.gd` triggers a specific enemy ability from the enemy's ability controller. The action immediately attempts to activate the ability in the specified slot and always returns SUCCESS, regardless of whether the ability activation was successful.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target.
@export var target_var: StringName = &"target"
## Ability slot
@export_range(0, 1) var slot: int = 0


func _generate_name() -> String:
	return "Use ability ➜ slot %d" % slot


func _tick(delta: float) -> Status:
	var ability_slot: AbilitySlot = agent.enemy_ability_controller.abilities.keys()[slot]
	agent.enemy_ability_controller.try_activate_ability(ability_slot)

	return SUCCESS
```

### Weapon Attack

`weapon_attack.gd` triggers the enemy's weapon attack through its weapon controller. This is a simple fire-and-forget attack action that always returns SUCCESS.

```gdscript
@tool
extends BTAction

## Blackboard variable that stores our target.
@export var target_var: StringName = &"target"


func _generate_name() -> String:
	return "Attack %s with weapon" % [LimboUtility.decorate_var(target_var)]


func _tick(_delta: float) -> Status:
	agent.enemy_weapon_controller.use_weapon()
	return SUCCESS
```
