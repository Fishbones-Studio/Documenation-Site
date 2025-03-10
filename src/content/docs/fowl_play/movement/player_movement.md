---
title: Chicken movement
description: Basic chicken player movement.
lastUpdated: 2025-03-10
author: Tjorn
---
## States

The player has the following states:
- IDLE_STATE
- WALK_STATE
- SPRINT_STATE
- JUMP_STATE
- GLIDE_STATE
- DASH_STATE
- HURT_STATE
- FALL_STATE

### Player State Machine
```gdscript
## State machine for the player movement system.
##
## This script manages the different states of the player movement system, for the chicken player.

extends Node

@export var starting_state: BasePlayerState
@export var player: ChickenPlayer

var states: Dictionary[PlayerEnums.PlayerStates, BasePlayerState] = {}

@onready var current_state: BasePlayerState = _get_initial_state()


func _ready() -> void:
	if player == null:
		push_error(owner.name + ": No player reference set")

	# Connect the signal to the transition function
	SignalManager.player_transition_state.connect(_transition_to_next_state)

	# We wait for the owner to be ready to guarantee all the data and nodes are available.
	await owner.ready

	# Get all states in the scene tree
	for state_node: BasePlayerState in get_children():
		states[state_node.STATE_TYPE] = state_node
		state_node.setup(player)

	print(states)

	if current_state:
		current_state.enter(current_state.STATE_TYPE)


func _input(event: InputEvent) -> void:
	if current_state == null:
		push_error(owner.name + ": No state set.")
		return
	current_state.input(event)


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


func _transition_to_next_state(target_state: PlayerEnums.PlayerStates, information: Dictionary = {}) -> void:
	var previous_state := current_state
	previous_state.exit()

	current_state = states.get(target_state)
	if current_state == null:
		push_error(owner.name + ": Trying to transition to state " + str(target_state) + " but it does not exist. Falling back to: " + str(previous_state))
		current_state = previous_state

	# TODO: start animation of the state

	current_state.enter(previous_state.STATE_TYPE, information)


func _get_initial_state() -> BasePlayerState:
	return starting_state if starting_state != null else get_child(0)
```

### Base Player State
`base_state.gd` functions as the base for all states. It contains common functions, of which all states require at least one. As you can see, the `base_state.gd` is missing an `enter` and `setup` function. These functions will be implemented in the child classes, so that they can contain typed parameters. GDScript sadly has no concept of generics.
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
##
`base_player_state` contains the state machine implementation used by the chicken player.
```gdscript
class_name BasePlayerState
extends BaseState

@export var STATE_TYPE: PlayerEnums.PlayerStates

var player: ChickenPlayer
var movement_speed: float = 0.0
var previous_state: PlayerEnums.PlayerStates


## Called once to set the player reference
##
## Parameters:
## _player: The player reference to set.
func setup(_player: ChickenPlayer) -> void:
	if _player == null:
		push_error(owner.name + ": No player reference set" + str(STATE_TYPE))
	player = _player


## Called once when entering the state
##
## Parameters:
## _previous_state: The state that was active before this one.
func enter(_previous_state: PlayerEnums.PlayerStates, _information: Dictionary = {}) -> void:
	previous_state = _previous_state


# Providing default player movement
func physics_process(_delta: float) -> void:
	if movement_speed == 0.0:
		push_error("BasePlayerState: movement_speed is null. Please set it in the child class before calling super.")

	var direction: Vector3 = get_player_direction( get_player_input_dir())

	# Apply horizontal movement
	player.velocity.x = direction.x * movement_speed
	player.velocity.z = direction.z * movement_speed


func get_player_input_dir() -> Vector2:
	# Get 3D movement input
	return Input.get_vector("move_left", "move_right", "move_forward", "move_backward")


func get_player_direction(input_dir: Vector2) -> Vector3:
	# Calculate camera-relative movement direction
	var player_basis: Basis = player.global_basis
	return (player_basis.x * input_dir.x + player_basis.z * input_dir.y).normalized()
```