---
title: Enemy AI State Machine
description: Handles the actions of the enemies and transitions between behaviours.
lastUpdated: 2025-04-10
author: Bastiaan
---

## Description
The enemy state machine makes use of a variety of classes all linking together from a base enemy state. The base enemy state stores a bunch of widely used variables and the base of the functions.

## Features
The enemy state machine handles the response of the enemies to player behaviour. The current implementation has a basic idle, chase, attack setup.

### Implementation

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