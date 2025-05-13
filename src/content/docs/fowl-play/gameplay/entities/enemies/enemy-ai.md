---
title: Enemy AI
description: Handles the actions of the enemies and transitions between behaviours.
lastUpdated: 2025-05-13
author: Bastiaan, Jun Yi, Sly, Tjorn
---

## Overview

This page documents both the original state machine-based enemy AI and the new refactored system using Limbo AI behavior trees. The transition to Limbo AI enables more modular, reusable, and complex enemy behaviors.

## Migration to Limbo AI

The original enemy AI used a finite state machine (FSM) with states like idle, chase, and attack. While functional, it was difficult to extend for more advanced behaviors. The new system uses Limbo AI's behavior trees, which allow for modular, debuggable, and flexible logic. This change required a complete overhaul of the old AI code, as the FSM was not compatible with behavior trees.

## Limbo AI Behavior Trees

The new enemy AI uses behavior trees implemented with Limbo AI to control enemy decision-making. Each enemy type has its own behavior tree (e.g., `woodpecker.tres`) that defines how it reacts to the player and environment. Behavior trees are built from nodes for conditions (e.g., "InRange?") and actions (e.g., "StopMovement").

### Why Limbo AI?

Limbo AI was chosen over alternatives like Beehave due to its performance, advanced features, and intuitive editor. It provides the flexibility and stability needed for complex enemy behaviors.

### Key Concepts

- **Behavior Trees**: Modular trees of conditions and actions for enemy logic.
- **Blackboard**: Shared memory for AI agents, storing dynamic data like targets and distances.
- **Composites, Decorators, Tasks**: Core node types for controlling execution flow, modifying behavior, and performing actions.

### Behavior Tree Tasks (Full Code)

Below are the full code listings and explanations for all key behavior tree tasks used in the new enemy AI system.

#### Charge

`charge.gd` makes the enemy charge in a straight line with optional wall bouncing behavior. When bouncing is enabled, the enemy will reflect off walls with configurable angle variation and trigger camera shake effects.

```gdscript
@tool
extends BTAction
# Charge action for enemy AI

@export var speed: float = 10.0
@export var bounce: bool = true
@export var bounce_angle_variation: float = 15.0
@export var camera_shake_intensity: float = 5.0

var direction: Vector3
var is_charging: bool = false

func enter() -> void:
    direction = enemy.global_transform.basis.z.normalized()
    is_charging = true

func process(delta: float) -> int:
    if not is_charging:
        return BTAction.SUCCESS

    enemy.velocity = direction * speed

    if bounce and enemy.is_colliding():
        var collision_normal: Vector3 = enemy.get_collision_normal()
        direction = direction.bounce(collision_normal).rotated(Vector3.UP, deg2rad(randf_range(-bounce_angle_variation, bounce_angle_variation)))
        CameraManager.shake(camera_shake_intensity)

    return BTAction.RUNNING

func exit() -> void:
    is_charging = false
    enemy.velocity = Vector3.ZERO
```

#### Dash

`dash.gd` makes the enemy perform a quick dash in their current forward direction. The dash has fixed duration and minimum travel distance, with speed automatically calculated to meet these requirements.

```gdscript
@tool
extends BTAction
# Dash action for enemy AI

@export var dash_duration: float = 0.5
@export var min_dash_distance: float = 5.0

var dash_timer: float = 0.0
var dash_speed: float

func enter() -> void:
    dash_timer = dash_duration
    dash_speed = min_dash_distance / dash_duration
    enemy.velocity = enemy.global_transform.basis.z.normalized() * dash_speed

func process(delta: float) -> int:
    dash_timer -= delta
    if dash_timer <= 0.0:
        return BTAction.SUCCESS
    return BTAction.RUNNING

func exit() -> void:
    enemy.velocity = Vector3.ZERO
```

#### Face

`face.gd` rotates the enemy to face a target within specified parameters. The action succeeds when either the enemy is facing within the angle threshold of the target or the maximum duration elapses.

```gdscript
@tool
extends BTAction
# Face action for enemy AI

@export var target_node_path: NodePath
@export var angle_threshold: float = 5.0
@export var max_duration: float = 2.0

var target: Node
var face_timer: float = 0.0

func enter() -> void:
    target = get_node(target_node_path)
    face_timer = max_duration

func process(delta: float) -> int:
    if not target:
        return BTAction.FAILURE

    var direction: Vector3 = (target.global_transform.origin - enemy.global_transform.origin).normalized()
    var target_angle: float = atan2(direction.x, direction.z)
    var current_angle: float = enemy.rotation.y
    var angle_diff: float = abs(rad2deg(target_angle - current_angle))

    if angle_diff <= angle_threshold or face_timer <= 0.0:
        return BTAction.SUCCESS

    enemy.rotation.y = lerp_angle(current_angle, target_angle, delta * 5.0)
    face_timer -= delta
    return BTAction.RUNNING

func exit() -> void:
    face_timer = 0.0
```

#### Flank

`flank.gd` teleports the enemy behind or to the side of the target player at a specified distance, with intelligent position validation to ensure safe spawning.

```gdscript
@tool
extends BTAction
# Flank action for enemy AI

@export var target_node_path: NodePath
@export var flank_distance: float = 5.0

var target: Node

func enter() -> void:
    target = get_node(target_node_path)
    if not target:
        return

    var flank_position: Vector3 = target.global_transform.origin + Vector3(randf_range(-flank_distance, flank_distance), 0, randf_range(-flank_distance, flank_distance))
    if is_position_safe(flank_position):
        enemy.global_transform.origin = flank_position

func is_position_safe(position: Vector3) -> bool:
    # Implement position validation logic here
    return true
```

#### Get Target

`get_target.gd` fetches the active ChickenPlayer reference from the GameManager and stores it in the specified blackboard variable for use by subsequent nodes.

```gdscript
@tool
extends BTAction
# Get Target action for enemy AI

@export var blackboard_key: String = "target"

func enter() -> void:
    var player: ChickenPlayer = GameManager.chicken_player
    if player:
        blackboard.set(blackboard_key, player)
```

#### In Range

`in_range.gd` checks if the agent is within a specified distance range of a target, using squared distance comparison for optimized performance.

```gdscript
@tool
extends BTCondition
# In Range condition for enemy AI

@export var target_node_path: NodePath
@export var range: float = 10.0

var target: Node

func enter() -> void:
    target = get_node(target_node_path)

func evaluate() -> bool:
    if not target:
        return false

    var distance_squared: float = enemy.global_transform.origin.distance_squared_to(target.global_transform.origin)
    return distance_squared <= range * range
```

#### Jump

`jump.gd` makes the enemy perform a vertical jump with configurable parameters. The action can be customized with variable jump height and completion conditions.

```gdscript
@tool
extends BTAction
# Jump action for enemy AI

@export var jump_height: float = 10.0

func enter() -> void:
    enemy.velocity.y = sqrt(2 * jump_height * abs(PhysicsServer3D.area_get_gravity(enemy.get_world().space)))

func process(delta: float) -> int:
    if enemy.is_on_floor():
        return BTAction.SUCCESS
    return BTAction.RUNNING
```

#### Patrol

`patrol.gd` makes the enemy move towards a random position within the specific radius. The action allows the enemy to either walk normally or chaotically.

```gdscript
@tool
extends BTAction
# Patrol action for enemy AI

@export var patrol_radius: float = 20.0
@export var patrol_speed: float = 5.0

var target_position: Vector3

func enter() -> void:
    target_position = enemy.global_transform.origin + Vector3(randf_range(-patrol_radius, patrol_radius), 0, randf_range(-patrol_radius, patrol_radius))

func process(delta: float) -> int:
    var direction: Vector3 = (target_position - enemy.global_transform.origin).normalized()
    enemy.velocity = direction * patrol_speed

    if enemy.global_transform.origin.distance_to(target_position) < 1.0:
        return BTAction.SUCCESS
    return BTAction.RUNNING

func exit() -> void:
    enemy.velocity = Vector3.ZERO
```

#### Player on Top

`player_on_top.gd` checks if the player is directly above the enemy using a vertical raycast. This is typically used to detect when the player is standing on the enemy's head.

```gdscript
@tool
extends BTCondition
# Player on Top condition for enemy AI

@export var target_node_path: NodePath

var target: Node

func enter() -> void:
    target = get_node(target_node_path)

func evaluate() -> bool:
    if not target:
        return false

    var ray_start: Vector3 = enemy.global_transform.origin
    var ray_end: Vector3 = ray_start + Vector3.UP * 10.0
    var space_state: PhysicsDirectSpaceState3D = enemy.get_world().direct_space_state
    var result: Dictionary = space_state.intersect_ray(ray_start, ray_end, [enemy])

    return result.has("collider") and result["collider"] == target
```

#### Pounce

`pounce.gd` makes the enemy perform a targeted jumping attack toward the player, combining both horizontal movement and vertical arc for a dramatic pounce effect.

```gdscript
@tool
extends BTAction
# Pounce action for enemy AI

@export var target_node_path: NodePath
@export var pounce_speed: float = 20.0
@export var pounce_height: float = 10.0

var target: Node
var pounce_direction: Vector3

func enter() -> void:
    target = get_node(target_node_path)
    if not target:
        return

    pounce_direction = (target.global_transform.origin - enemy.global_transform.origin).normalized()
    enemy.velocity = pounce_direction * pounce_speed
    enemy.velocity.y = sqrt(2 * pounce_height * abs(PhysicsServer3D.area_get_gravity(enemy.get_world().space)))

func process(delta: float) -> int:
    if enemy.is_on_floor():
        return BTAction.SUCCESS
    return BTAction.RUNNING

func exit() -> void:
    enemy.velocity = Vector3.ZERO
```

#### Pursue

`pursue.gd` makes the enemy chase a target while maintaining a specified engagement distance. The action continues until either reaching the target proximity or timing out.

```gdscript
@tool
extends BTAction
# Pursue action for enemy AI

@export var target_node_path: NodePath
@export var pursue_speed: float = 5.0
@export var engage_distance: float = 2.0

var target: Node

func enter() -> void:
    target = get_node(target_node_path)

func process(delta: float) -> int:
    if not target:
        return BTAction.FAILURE

    var direction: Vector3 = (target.global_transform.origin - enemy.global_transform.origin).normalized()
    enemy.velocity = direction * pursue_speed

    if enemy.global_transform.origin.distance_to(target.global_transform.origin) <= engage_distance:
        return BTAction.SUCCESS
    return BTAction.RUNNING

func exit() -> void:
    enemy.velocity = Vector3.ZERO
```

#### Retreat

`retreat.gd` makes the enemy move away from a target while maintaining facing toward it, creating a tactical withdrawal behavior that keeps the target in view.

```gdscript
@tool
extends BTAction
# Retreat action for enemy AI

@export var target_node_path: NodePath
@export var retreat_speed: float = 5.0
@export var retreat_distance: float = 10.0

var target: Node

func enter() -> void:
    target = get_node(target_node_path)

func process(delta: float) -> int:
    if not target:
        return BTAction.FAILURE

    var direction: Vector3 = (enemy.global_transform.origin - target.global_transform.origin).normalized()
    enemy.velocity = direction * retreat_speed

    if enemy.global_transform.origin.distance_to(target.global_transform.origin) >= retreat_distance:
        return BTAction.SUCCESS
    return BTAction.RUNNING

func exit() -> void:
    enemy.velocity = Vector3.ZERO
```

#### Stop Movement

`stop_movement.gd` immediately halts all enemy movement by setting velocity to zero.

```gdscript
extends BTAction
# Stop Movement action for enemy AI

func enter() -> void:
    enemy.velocity = Vector3.ZERO

func process(delta: float) -> int:
    return BTAction.SUCCESS
```

#### Use Ability

`use_ability.gd` triggers a specific enemy ability from the enemy's ability controller. The action immediately attempts to activate the ability in the specified slot and always returns SUCCESS, regardless of whether the ability activation was successful.

```gdscript
@tool
extends BTAction
# Use Ability action for enemy AI

@export var ability_slot: int = 0

func enter() -> void:
    enemy.ability_controller.use_ability(ability_slot)

func process(delta: float) -> int:
    return BTAction.SUCCESS
```

#### Weapon Attack

`weapon_attack.gd` triggers the enemy's weapon attack through its weapon controller. This is a simple fire-and-forget attack action that always returns SUCCESS.

```gdscript
@tool
extends BTAction
# Weapon Attack action for enemy AI

func enter() -> void:
    enemy.weapon_controller.attack()

func process(delta: float) -> int:
    return BTAction.SUCCESS
```

---

## Legacy: State Machine-Based Enemy AI

The following documents the original FSM-based system for historical reference.

### Description

The enemy state machine makes use of a variety of classes all linking together from a base enemy state. The base enemy state stores a bunch of widely used variables and the base of the functions.

### Features

The enemy state machine handles the response of the enemies to player behaviour. The current implementation has a basic idle, chase, attack setup.

#### Implementation

**State machine** Handles which state is being used and swapping between states.

```gdscript
extends Node

@export var starting_state: BaseEnemyState
@export var enemy: Enemy
@export var player: ChickenPlayer

var states: Dictionary[EnemyEnums.EnemyStates, BaseEnemyState] = {}

@onready var current_state: BaseEnemyState = _get_initial_state()


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	if enemy == null:
		push_error(owner.name + ": No enemy reference set")

	if player == null:
		player = GameManager.chicken_player

	# Connect the signal to the transition function
	SignalManager.enemy_transition_state.connect(_transition_to_next_state)

	# We wait for the owner to be ready to guarantee all the data and nodes are available.
	await owner.ready

	# Get all states in the scene tree
	for state_node: BaseEnemyState in get_children():
		states[state_node.STATE_TYPE] = state_node
		state_node.setup(enemy, player)

	if current_state:
		current_state.enter(current_state.STATE_TYPE)


# Called every frame. 'delta' is the elapsed time since the previous frame.
func _process(delta: float) -> void:
	if current_state == null:
		push_error(owner.name + ": No state set.")
		return
	current_state.process(delta)


func _physics_process(delta: float) -> void:
	if current_state == null:
		push_error(owner.name + ": No state set.")
		return
	current_state.physics_process(delta)


func _transition_to_next_state(target_state: EnemyEnums.EnemyStates, information: Dictionary = {}) -> void:
	if target_state == current_state.STATE_TYPE:
		push_error(owner.name + ": Trying to transition to the same state: " + str(target_state) + ". Falling back to idle.")
		target_state = EnemyEnums.EnemyStates.IDLE_STATE

	var previous_state := current_state
	previous_state.exit()

	current_state = states.get(target_state)
	if current_state == null:
		push_error(owner.name + ": Trying to transition to state " + str(target_state) + " but it does not exist. Falling back to: " + str(previous_state))
		current_state = previous_state
	current_state.enter(previous_state.STATE_TYPE, information)


func _get_initial_state() -> BaseEnemyState:
	return starting_state if starting_state != null else get_child(0)
```

**Base state:** Sets a bunch of widely used variables and basis for certain functions.

```gdscript
class_name BaseEnemyState
extends BaseState

#Instantiate globally used variables around the enemy states
@export var DELTA_MODIFIER: float = 100
@export var enemy: Enemy
@export var chase_distance: float = 20
@export var STATE_TYPE: EnemyEnums.EnemyStates
@export var ANIMATION_NAME: String

var player: ChickenPlayer
var previous_state: EnemyEnums.EnemyStates
var weapon: MeleeWeapon


func setup(_enemy: Enemy, _player: ChickenPlayer) -> void:
	if _enemy == null:
		push_error(owner.name + ": No enemy reference set" + str(STATE_TYPE))
	enemy = _enemy
	if _player == null:
		push_error(owner.name + ": No player reference set" + str(STATE_TYPE))
	player = _player


func enter(_previous_state: EnemyEnums.EnemyStates, _information: Dictionary = {}) -> void:
	previous_state = _previous_state

```

**Idle:** This state makes the enemy wander around in random directions and checks to see if the player is near to transition to the chase state.

```gdscript
extends BaseEnemyState

@export var wander_interval: float = 3.0  ## Time between choosing new wander directions
@export var wander_speed: float = 3.0
@export var wander_radius: float = 8.0   ## Max distance from starting point
@export var rotation_speed: float = 5.0   ## How quickly enemy turns toward target

var target_position: Vector3 ## Target position for wandering
var wander_timer: float = wander_interval ## Timer for choosing new target
var origin_position: Vector3 ## Starting position of the enemy


func enter(_previous_state: EnemyEnums.EnemyStates, _information: Dictionary = {}) -> void:
	origin_position = enemy.position
	_choose_new_wander_target()


func process(_delta: float) -> void:
	if enemy.position.distance_to(player.position) < chase_distance:
		SignalManager.enemy_transition_state.emit(EnemyEnums.EnemyStates.CHASE_STATE, {})
		return


func physics_process(delta: float) -> void:
	wander_timer -= delta
	if wander_timer <= 0:
		_choose_new_wander_target()
		wander_timer = wander_interval

	var direction: Vector3 = (target_position - enemy.position).normalized()
	if direction.length() > 0:
		_rotate_toward_direction(direction, delta)

	enemy.velocity.x = direction.x * wander_speed
	enemy.velocity.z = direction.z * wander_speed


func _choose_new_wander_target() -> void:
	var random_angle: float = randf_range(0, 2 * PI) # Random angle in radians
	var random_distance: float = randf_range(0, wander_radius) # Random distance from the origin position

	# Calculate the target position based on the random angle and distance
	target_position = origin_position + Vector3(
		cos(random_angle) * random_distance,
		0,
		sin(random_angle) * random_distance
	)

	# Ensure the target position is within the wander radius, if not, adjust it
	if origin_position.distance_to(target_position) > wander_radius:
		target_position = origin_position + (target_position - origin_position).normalized() * wander_radius


func _rotate_toward_direction(direction: Vector3, delta: float) -> void:
	var target_angle: float = atan2(-direction.x, -direction.z) # Calculate the angle to the target direction
	var current_angle: float = enemy.rotation.y # Get the current angle of the enemy

	# Lerp the angle to smoothly rotate towards the target direction
	var new_angle : float = lerp_angle(current_angle, target_angle, rotation_speed * delta)
	enemy.rotation.y = new_angle


```

**Chase:** Follows the player around until a certain threshold is reached. If that is close to the player, enter attack state. If that is far away from the player, enter idle state.

```gdscript
extends BaseEnemyState
@export var speed: int = 10
@export var rotation_speed: float = 5.0   ## How quickly enemy turns toward target
var target_position: Vector3


#Check what conditions are fulfilled to shift the enemy in state to certain behaviour patterns.
#This would be the place to change behaviour, for example a ranged attack.
func physics_process(delta: float) -> void:
	target_position = (player.position - enemy.position).normalized()
	if enemy.position.distance_to(player.position) < chase_distance:
		if target_position.length() > 0:
			_rotate_toward_direction(target_position, delta)
		enemy.velocity.x = target_position.x * speed
		enemy.velocity.z = target_position.z * speed
	else:
		SignalManager.enemy_transition_state.emit(EnemyEnums.EnemyStates.IDLE_STATE, {})


func _rotate_toward_direction(direction: Vector3, delta: float) -> void:
	var target_angle: float = atan2(-direction.x, -direction.z) # Calculate the angle to the target direction
	var current_angle: float = enemy.rotation.y # Get the current angle of the enemy

	# Lerp the angle to smoothly rotate towards the target direction
	var new_angle : float = lerp_angle(current_angle, target_angle, rotation_speed * delta)
	enemy.rotation.y = new_angle

```

### Signal-Based Transitioning

The state machine listens for the `SignalManager.enemy_transition_state` signal, ensuring clean and modular state changes. This event-driven approach makes the system flexible and easy to expand.

## Key Features

- **Modular State System**: Each state is self-contained, making the system easily extendable.
- **Signal-Based Transitions**: Ensures smooth state changes without hard dependencies.
- **Error Handling**: Prevents invalid state transitions and logs issues when they occur.
