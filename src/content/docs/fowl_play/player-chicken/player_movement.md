---
title: Chicken Movement
description: Basic chicken player movement.
lastUpdated: 2025-03-13
author: Tjorn
---
## Movement
When playing as the chicken, the player experiences the game in third person. Movement is camera-relative, meaning the chicken will move in the direction the camera is facing. The speed and behavior of the chicken changes based on its current state.

### Controls
#### Keyboard
- **WASD**: Basic movement (forward, backward, left, right)
- **Mouse**: Controlling the camera, and in turn player movement direction
- **Space**: Jump/Glide
- **Shift**: Sprint
- **CTRL**: Dash
#### Controller (Xbox buttons for reference)
- **Left Joystick**: Basic movement (forward, backward, left, right)
- **Right Joystick**: Controlling the camera, and in turn player movement direction
- **A**: Jump/Glide
- **L3/Left Click**: Sprint
- **B**: Dash

## States Overview
The chicken player implements a state machine to manage different movement behaviors. Each state has its own logic for handling input, physics, and animations, with basic movement logic implemented in the parent state [`base_player_state.gd`](#base-player-state).

### Available States
- **IDLE_STATE**: Default state when no movement input is detected
- **WALK_STATE**: Basic movement at normal speed
- **SPRINT_STATE**: Faster movement with stamina consumption
- **JUMP_STATE**: Vertical movement when jumping from the ground
- **GLIDE_STATE**: Slow descent when falling, with horizontal movement control
- **DASH_STATE**: Quick burst of speed in a specific direction
- **HURT_STATE**: Temporary state when the player takes damage
- **FALL_STATE**: When the player is falling without gliding

### State Decision
Fowl Play is a 3D roguelike arena fighter where players control a chicken in underground fight rings. The movement states were chosen to support the core gameplay loop of arena combat, environmental hazard navigation, and strategic resource management:

- **IDLE_STATE**: Serves as a clean transition point between other movement states. Allows the player to stand still for a moment, potentially hiding behind cover within the arena.

- **WALK_STATE**: Offers predictable, controlled navigation needed for exploring the fight arena, approaching enemies carefully, and avoiding environmental hazards as mentioned in the [pitch document](/fowl_play/pitches/pitch_document/).

- **SPRINT_STATE**: Implements the risk-reward philosophy central to the game's design. By draining stamina, sprinting creates decisions about when to use limited resources for quicker repositioning or escaping threats.

- **JUMP_STATE** & **GLIDE_STATE**: Support vertical exploration and combat strategy in the multi-level arena environment. These states allow players to gain tactical advantages over the various enemy types and navigate over the hazards.

- **DASH_STATE**: Provides critical evasive capabilities needed for the fast-paced combat encounters against progressively stronger enemies. The dash's stamina cost aligns with the game's resource management mechanics, forcing players to make quick strategic decisions during combat.

- **HURT_STATE**: Reflects the punishing nature of underground fighting rings by interrupting player movement flow when taking damage, creating consequences for poor positioning or timing.

- **FALL_STATE**: Ensures precise air control mechanics, and serves as a clean transition point between arial and grounded movement states.

## Player State Machine
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

	current_state.enter(previous_state.STATE_TYPE, information)


func _get_initial_state() -> BasePlayerState:
	return starting_state if starting_state != null else get_child(0)
```

### State Machine Implementation

#### The State Pattern
The player movement system uses the State pattern to organize different movement behaviors. This allows each state to handle its own physics, input, and transitions independently.

#### Base Player State
`base_player_state.gd` provides common functionality shared by all the player states. It extends from [`base_state.gd`](/fowl_play/important-code/important_code/#base-state), and provides additional typed `setup` and `enter` methods. The `setup` method passes in a reference to the player, so the states can apply movement to the player. The `enter` method passes in the previous state, and some optional additional information.

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

#### Example Dash State
`dash_state.gd` provides a quick burst of movement in a specific direction, consuming stamina. The dash duration and cooldown are set on a timer, so the player cannot infinitely dash.
After the initial burst, dash movement is added in the `physics_process` method until the dash timer runs out. 

```gdscript
## State handling player dash movement
## 
## Applies instant burst movement in facing direction with stamina cost
extends BasePlayerState

@export_range(10, 100) var stamina_cost: int = 30

@export_range(1.0, 20.0) var dash_distance: float = 30.0

var _dash_available: bool = true
var _dash_direction: Vector3

@onready var dash_duration_timer: Timer = $DashDurationTimer
@onready var dash_cooldown_timer: Timer = $DashCooldownTimer


func enter(_previous_state: PlayerEnums.PlayerStates, information: Dictionary = {}) -> void:
	# check if already dashed
	if information.get("dashed", false):
		print("already dashed")
		SignalManager.player_transition_state.emit(PlayerEnums.PlayerStates.IDLE_STATE, information)
		return

	super.enter(_previous_state)

	if not _dash_available or player.stamina < stamina_cost:
		print("dash not available")
		if previous_state == PlayerEnums.PlayerStates.JUMP_STATE:
			SignalManager.player_transition_state.emit(PlayerEnums.PlayerStates.FALL_STATE, information)
		else:
			# adding dashed true to the information dictionary
			information.set("dashed", true)
			SignalManager.player_transition_state.emit(previous_state, information)
		return

	# Consume stamina
	player.stamina -= stamina_cost

	# Get dash direction (player-relative input or player forward)
	var input_dir: Vector2 = get_player_input_dir()

	if input_dir != Vector2.ZERO:
		# Use movement direction from input (matches player-relative movement)
		_dash_direction = get_player_direction(input_dir)
	else:
		# Fallback to player's forward direction
		_dash_direction = -player.global_basis.z.normalized()

	# Ensure vertical component is flat
	_dash_direction.y = 0

	# Initial velocity burst
	player.velocity = _dash_direction * dash_distance

	dash_duration_timer.start()


func physics_process(_delta: float) -> void:
	player.velocity = _dash_direction * dash_distance


func exit() -> void:
	_dash_available = false
	dash_duration_timer.stop()
	dash_cooldown_timer.start()


func _on_dash_timer_timeout():
	# Transition back to the previous state
	var information: Dictionary = {"dashed": true}
	if previous_state == PlayerEnums.PlayerStates.JUMP_STATE:
		SignalManager.player_transition_state.emit(PlayerEnums.PlayerStates.FALL_STATE, information)
	else:
		SignalManager.player_transition_state.emit(previous_state, information)


func _on_dash_cooldown_timer_timeout():
	print("dash available again")
	_dash_available = true

```

##### Dash State Enter Method
The `enter` method in the dash state demonstrates how state parameters are used to manage game mechanics:

###### Parameters Usage
- `_previous_state`: Tracks which state the player was in before dashing, essential for returning to the appropriate state after the dash completes.
- `information` dictionary: Used to pass data between states and prevent infinite dash loops.

###### Information Dictionary
The `information` dictionary allows states to communicate. In the dash state it specifically:

1. **Checks for repeated dashes**: When `information.get("dashed", false)` is true, the player has already performed a dash in this movement sequence.
2. **Communicates dash history**: Sets `information.set("dashed", true)` when transitioning back to prevent dash chaining.

###### Preventing Infinite Dashing
The dash state is designed to prevent infinite or chain dashing for several important reasons:

1. **Game Balance**: The dash allows players to strategically evade attacks and hazards. Infinite dashing would allow the player to bypass all challenges, breaking the core gameplay loop and difficulty balance.

2. **Resource Management**: The stamina cost creates decisions about when to use the dash ability. Without limitations, this strategic element would be lost.

3. **Skill Expression**: The cooldown system encourages players to time their dashes effectively rather than spamming the ability, creating a higher skill ceiling for players.

The three main constraints implemented to prevent infinite dashing are:
- The `_dash_available` flag and cooldown timer 
- Stamina consumption requirement
- The "dashed" flag in the information dictionary to prevent immediate re-entry into dash state

## Key Components

### Movement Calculation
Movement is calculated based on player input and camera orientation:
1. Input direction is captured using `get_player_input_dir()`.
2. This direction is transformed to world space using `get_player_direction()`.
3. The resulting vector is applied to player velocity, scaled by the state's movement speed.

### State Transitions
State transitions are triggered by the `SignalManager.player_transition_state` signal. When a state determines a transition should occur (e.g., player presses jump), it emits this signal with the target state and optional information.

## Implementation Notes
- Each state should set an appropriate `movement_speed` value.
- Override `physics_process()` in derived states for custom movement behavior.
- Use `enter()` and `exit()` to handle state-specific setup and cleanup.