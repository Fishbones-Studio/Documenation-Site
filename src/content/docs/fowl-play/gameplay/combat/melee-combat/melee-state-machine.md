---
title: Melee Weapon State Machine
description: Handles the melee weapon's combat states and transitions.
lastUpdated: 2025-03-16
author: Cenker
---

## Overview
The melee weapon system uses a state machine to manage different attack phases. Each state governs behavior, animations, and transitions based on player input and attack flow.

## State Machine Implementation

### States Overview
The melee system consists of four primary states:

- **IDLE**: Default state when no attack input is given.
- **WINDUP**: Prepares the attack, allowing anticipation and animation sync.
- **ATTACK**: Executes the weapon's hitbox activation.
- **COOLDOWN**: Ends the attack, adding a delay before another action.

### State Transitions
State transitions occur based on player input and attack logic:

- **IDLE → WINDUP**: When the player initiates an attack.
- **WINDUP → ATTACK**: When the windup duration completes.
- **ATTACK → COOLDOWN**: When the attack animation finishes.
- **COOLDOWN → IDLE**: When the cooldown period expires.

## Code Implementation

```gdscript
## State machine for the player melee system.
##
## This script manages the different states of the combat melee system, for the current melee weapon.
extends Node

@export var starting_state: BaseCombatState
@export var weapon: Node3D

var states: Dictionary[WeaponEnums.MeleeState, BaseCombatState] = {}

# The current active state (set when the scene loads)
@onready var current_state: BaseCombatState = _get_initial_state()


func _ready() -> void:
	if weapon == null:
		push_error(owner.name + ": No weapon reference set")

	# Listen for state transition signals
	SignalManager.combat_transition_state.connect(_transition_to_next_state)

	# Wait for the owner to be ready before setting up states
	await owner.ready

	# Get all states in the scene and store them in the dictionary
	for state_node: BaseCombatState in get_children():
		states[state_node.STATE_TYPE] = state_node
		# Pass the weapon to each state
		state_node.setup(weapon)

	print(states)

	# Start in the initial state if it exists
	if current_state:
		current_state.enter(current_state.STATE_TYPE)


func _process(delta: float) -> void:
	if current_state == null:
		push_error(owner.name + ": No state set.")
		return
	# Run the active state's process function
	current_state.process(delta)


func _physics_process(delta: float) -> void:
	if current_state == null:
		push_error(owner.name + ": No state set.")
		return
	# Run the active state's physics process
	current_state.physics_process(delta)


func _input(event: InputEvent) -> void:
	if current_state == null:
		push_error(owner.name + ": No state set.")
		return
	# Pass input events to the current state
	current_state.input(event)


# Handles transitioning from one state to another
func _transition_to_next_state(target_state: WeaponEnums.MeleeState, information: Dictionary[String, float] = {}) -> void:
	# Prevent transitioning to the same state
	if target_state == current_state.STATE_TYPE:
		push_error(owner.name + ": Trying to transition to the same state: " + str(target_state) + ". Falling back to idle.")
		target_state = WeaponEnums.MeleeState.IDLE

	# Exit the current state before switching
	var previous_state := current_state
	previous_state.exit()

	# Switch to the new state
	current_state = states.get(target_state)
	if current_state == null:
		push_error(owner.name + ": Trying to transition to state " + str(target_state) + " but it does not exist. Falling back to: " + str(previous_state))
		current_state = previous_state

	# Enter the new state and carry over any necessary information
	current_state.enter(previous_state.STATE_TYPE, information)


# Gets the initial state when the game starts
func _get_initial_state() -> BaseCombatState:
	return starting_state if starting_state != null else get_child(0)
```
### State Behavior
Each state in the melee system implements its own behavior:

#### **IDLE**
- The default state when the player is not attacking.
- Waits for input to transition to `WINDUP`.

#### **WINDUP**
- Prepares the attack animation.
- Can be interrupted if necessary.
- Transitions to `ATTACK` when the windup duration expires.

#### **ATTACK**
- Activates the weapon's hitbox.
- Processes damage application.
- Moves to `COOLDOWN` once the attack completes.

#### **COOLDOWN**
- Prevents spamming attacks by enforcing a delay.
- Returns to `IDLE` once the cooldown timer ends.

### Signal-Based Transitioning
The state machine listens for the `SignalManager.combat_transition_state` signal, ensuring clean and modular state changes. This event-driven approach makes the system flexible and easy to expand.

## Key Features
- **Modular State System**: Each state is self-contained, making the system easily extendable.
- **Signal-Based Transitions**: Ensures smooth state changes without hard dependencies.
- **Error Handling**: Prevents invalid state transitions and logs issues when they occur.
- **Weapon Flexibility**: The system supports different melee weapons by passing the weapon reference to each state.

