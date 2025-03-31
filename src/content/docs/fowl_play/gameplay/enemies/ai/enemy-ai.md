---
title: Enemy AI State Machine
description: Handles the actions of the enemies and transitions between behaviours.
lastUpdated: 2025-03-31
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
@onready var weapon: MeleeWeapon = $"../CurrentWeapon".current_weapon


# Called when the node enters the scene tree for the first time.
func _ready() -> void:
	print(current_state)
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
		state_node.setup(enemy, weapon, player)

	print(states)

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

	# TODO: start animation of the state
	if(current_state.ANIMATION_NAME != null && !current_state.ANIMATION_NAME.is_empty() && weapon):
		# Play the animation for the new state
		weapon.animation_player.play(current_state.ANIMATION_NAME)

	current_state.enter(previous_state.STATE_TYPE, information)


func _get_initial_state() -> BaseEnemyState:
	return starting_state if starting_state != null else get_child(0)
```
**Base state:** Sets a bunch of widely used variables and basis for certain functions.
```gdscript
## Base class for all state implementations in a state machine pattern.
##
## **Note:** This class should not be used directly. Always create child classes.
class_name BaseState
extends Node

## Handles input events for state-specific behavior.
##
## **Must be overridden** in child classes that need input handling.
##
## Parameters:
##  _event: Input event to process.
func input(_event: InputEvent) -> void:
	pass


## Called every frame with delta time.
##
## **Must be overridden** in child classes that need frame-based updates.
##
## Parameters:
##  _delta: Time elapsed since previous frame in seconds.
func process(_delta: float) -> void:
	pass


## Called every physics frame with delta time.
##
## **Must be overridden** in child classes that need physics updates.
##
## Parameters:
##  _delta: Time elapsed since previous physics frame in seconds.
func physics_process(_delta: float) -> void:
	pass


## Called when leaving this state.
##
## Use this to clean up any state-specific resources or reset temporary state.
## **Must be overridden** in child classes if needed.
func exit() -> void:
	pass
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
	var new_angle := lerp_angle(current_angle, target_angle, rotation_speed * delta)
	enemy.rotation.y = new_angle

```
**Chase:** Follows the player around until a certain threshold is reached. If that is close to the player, enter attack state. If that is far away from the player, enter idle state.
```gdscript
extends BaseEnemyState
@export var speed: int = 10

var target_position: Vector3


func enter(_previous_state: EnemyEnums.EnemyStates, _information: Dictionary = {}) -> void:
	# Connect body entered signal
	SignalManager.weapon_hit_area_body_entered.connect(_on_attack_area_body_entered)


func exit() -> void:
	# Disconnect body entered signal
	SignalManager.weapon_hit_area_body_entered.disconnect(_on_attack_area_body_entered)


#Check what conditions are fulfilled to shift the enemy in state to certain behaviour patterns.
#This would be the place to change behaviour, for example a ranged attack.
func physics_process(_delta: float) -> void:
	target_position = (player.position - enemy.position).normalized()
	if enemy.position.distance_to(player.position) < chase_distance:
		enemy.look_at(player.position)
		enemy.velocity.x = target_position.x * speed
		enemy.velocity.z = target_position.z * speed
	else:
		SignalManager.enemy_transition_state.emit(EnemyEnums.EnemyStates.IDLE_STATE, {})


func _on_attack_area_body_entered(body: PhysicsBody3D) -> void:
	# TODO this only triggers once, if you stay in the body, the enemy will stop atacking after 1 time
	if body == player:
		SignalManager.enemy_transition_state.emit(EnemyEnums.EnemyStates.ATTACK_STATE, {})
```
**Attack:** Attacks the player, deals damage and returns to the idle state.
```gdscript
extends BaseEnemyState

@export var damage : int

func enter(_previous_state: EnemyEnums.EnemyStates, _information: Dictionary = {}) -> void:
	attack_player()
	# Connect body exited signal
	SignalManager.weapon_hit_area_body_exited.connect(_on_attack_area_body_exited)
	
func exit() -> void:
	# Disconnect body exited signal
	SignalManager.weapon_hit_area_body_exited.disconnect(_on_attack_area_body_exited)

#Deal damage to the player when they enter the attack_area of the enemy
func attack_player():
	SignalManager.hurt_player.emit(damage)
	SignalManager.player_transition_state.emit(PlayerEnums.PlayerStates.HURT_STATE, {})

#Reset enemy after the player leaves the attack area of the enemy
func _on_attack_area_body_exited(body: PhysicsBody3D) -> void:
	if body == player:
		SignalManager.enemy_transition_state.emit(EnemyEnums.EnemyStates.IDLE_STATE)
```

### Signal-Based Transitioning
The state machine listens for the `SignalManager.enemy_transition_state` signal, ensuring clean and modular state changes. This event-driven approach makes the system flexible and easy to expand.

## Key Features
- **Modular State System**: Each state is self-contained, making the system easily extendable.
- **Signal-Based Transitions**: Ensures smooth state changes without hard dependencies.
- **Error Handling**: Prevents invalid state transitions and logs issues when they occur.