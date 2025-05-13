---
title: Melee Weapon State Machine
lastUpdated: 2025-05-13
description: Handles the melee weapon's combat states and transitions, including the refactored state logic.
author: Bastiaan, Cenker, Tjorn
---

## Overview

The melee weapon system uses a state machine to manage different attack phases. Each state governs behavior, animations, and transitions based on player input and attack flow. The state logic was refactored to optimize code, improve timer handling, and clarify responsibilities.

## State Machine Implementation

### States Overview

The melee system consists of four primary states:

- **IDLE**: Default state when no attack input is given.
- **WINDUP**: Prepares the attack, allowing anticipation and animation sync.
- **ATTACK**: Executes the weapon's hitbox activation and damage.
- **COOLDOWN**: Ends the attack, adding a delay before another action.

### State Transitions

State transitions occur based on player input and attack logic:

- **IDLE → WINDUP**: When the player initiates an attack or an enemy detects a target.
- **WINDUP → ATTACK**: When the windup duration completes.
- **ATTACK → COOLDOWN**: When the attack animation finishes.
- **COOLDOWN → IDLE**: When the cooldown period expires.

## State Machine Code

```gdscript
## State machine for the player melee system.
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
		# Pass the weapon to each state (refactored: pass all required args)
		state_node.setup(weapon, SignalManager.combat_transition_state, weapon.actor)

	print(states)

	# Start in the initial state if it exists
	if current_state:
		current_state.enter(current_state.STATE_TYPE)

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

func _input(event: InputEvent) -> void:
	if current_state == null:
		push_error(owner.name + ": No state set.")
		return
	current_state.input(event)

func _transition_to_next_state(target_state: WeaponEnums.MeleeState, information: Dictionary = {}) -> void:
	if target_state == current_state.STATE_TYPE:
		push_error(owner.name + ": Trying to transition to the same state: " + str(target_state) + ". Falling back to idle.")
		target_state = WeaponEnums.MeleeState.IDLE

	var previous_state := current_state
	previous_state.exit()

	current_state = states.get(target_state)
	if current_state == null:
		push_error(owner.name + ": Trying to transition to state " + str(target_state) + " but it does not exist. Falling back to: " + str(previous_state))
		current_state = previous_state

	current_state.enter(previous_state.STATE_TYPE, information)

func _get_initial_state() -> BaseCombatState:
	return starting_state if starting_state != null else get_child(0)
```

## State Implementations

### Melee Weapon Handler

This script is used to get a reference to the node owning this scene.

```gdscript
extends Node3D
# Used to get reference to player/enemy in their respective scenes.
@export var actor : CharacterBody3D
```

### Base Attack State

Sets the base functions for the other states as well as some important variables used in other classes.

```gdscript
class_name BaseCombatState
extends BaseState

@export var ANIMATION_NAME: String
var melee_combat_transition_state : Signal

var root_actor: CharacterBody3D
var weapon: MeleeWeapon

func setup(_weapon_node: MeleeWeapon, _melee_combat_transition_state: Signal, _root_actor: CharacterBody3D) -> void:
	if not _weapon_node:
		print("Weapon does not exist! Please provide a valid weapon node.")
		return
	weapon = _weapon_node
	root_actor = _root_actor
	melee_combat_transition_state = _melee_combat_transition_state

func enter(_previous_state, _information: Dictionary = {}) -> void:
	pass
```

### Idle State

This state is used to reset the weapon and wait on the trigger to attack.

```gdscript
## IdleState: The weapon is idle and waiting for input.
class_name IdleState
extends BaseCombatState

# Constants
const STATE_TYPE: int = WeaponEnums.WeaponState.IDLE

var hit_area: Area3D
var valid_attack : bool = false

func setup(weapon_node: MeleeWeapon, melee_combat_transition_state: Signal, root_actor: CharacterBody3D) -> void:
	super(weapon_node, melee_combat_transition_state, root_actor)
	hit_area = weapon_node.hit_area

func process(delta: float) -> void:
	var targets: Array[Node3D] = hit_area.get_overlapping_bodies()
	for target in targets:
		if(target == GameManager.chicken_player):
			valid_attack = true
		else:
			valid_attack = false
	if(valid_attack):
		melee_combat_transition_state.emit(WeaponEnums.WeaponState.WINDUP, {})

func input(event: InputEvent) -> void:
	if event.is_action_pressed("attack"):
		melee_combat_transition_state.emit(WeaponEnums.WeaponState.WINDUP, {})
```

### Windup State

Uses a timer to give a windup time before the attack takes place. After the timer runs out transition to the attack state.

```gdscript
## WindupState: The weapon is preparing to attack.
class_name WindupState
extends BaseCombatState

const STATE_TYPE: int = WeaponEnums.WeaponState.WINDUP
@onready var windup_timer: Timer = %WindupTimer

func enter(_previous_state, _information: Dictionary = {}) -> void:
	if weapon.current_weapon.windup_time <= 0:
		melee_combat_transition_state.emit(WeaponEnums.WeaponState.ATTACKING, {})
		return
	elif weapon.current_weapon.windup_time > 0:
		windup_timer.wait_time = weapon.current_weapon.windup_time
		windup_timer.start()

func exit() -> void:
	if windup_timer:
		windup_timer.stop()

func _on_windup_timer_timeout() -> void:
	melee_combat_transition_state.emit(WeaponEnums.WeaponState.ATTACKING, {})
```

### Attack State

Uses a timer to give time for the attack animation to take place. Also checks for collision with objects to deal damage. When the timer runs out transitions to the cooldown state.

```gdscript
## AttackingState: The weapon is actively attacking.
class_name AttackingState
extends BaseCombatState

const STATE_TYPE: int = WeaponEnums.WeaponState.ATTACKING
var hit_area: Area3D
@onready var attack_timer: Timer = %AttackTimer

func setup(weapon_node: MeleeWeapon, melee_combat_transition_state: Signal, root_actor: CharacterBody3D) -> void:
	super(weapon_node, melee_combat_transition_state, root_actor)
	hit_area = weapon_node.hit_area

func enter(_previous_state, _information: Dictionary = {}) -> void:
	attack_timer.wait_time = weapon.current_weapon.attack_duration
	attack_timer.start()
	_attack()

func exit() -> void:
	if attack_timer:
		attack_timer.stop()

func _on_attack_timer_timeout() -> void:
	melee_combat_transition_state.emit(WeaponEnums.WeaponState.COOLDOWN)

func _attack() -> void:
	if not hit_area:
		print("HitArea not found!")
		return
	var targets: Array[Node3D] = hit_area.get_overlapping_bodies()
	if(root_actor == GameManager.chicken_player):
		for target in targets:
			if target is Enemy:
				SignalManager.weapon_hit_target.emit(target, weapon.current_weapon.damage)
	else:
		for target in targets:
			if target == GameManager.chicken_player:
				SignalManager.weapon_hit_target.emit(target, weapon.current_weapon.damage)
```

### Cooldown State

Uses timer for end delay after the attack. This gives some recovery time to attacks. After the timer finishes transition to the idle state.

```gdscript
## CooldownState: The weapon is cooling down after an attack.
class_name CooldownState
extends BaseCombatState

const STATE_TYPE: int = WeaponEnums.WeaponState.COOLDOWN
@onready var cooldown_timer: Timer = %CooldownTimer

func enter(_previous_state, _information: Dictionary = {}) -> void:
	cooldown_timer.wait_time = weapon.current_weapon.attack_duration
	cooldown_timer.start()

func exit() -> void:
	if cooldown_timer:
		cooldown_timer.stop()

func _on_cooldown_timer_timeout() -> void:
	melee_combat_transition_state.emit(WeaponEnums.WeaponState.IDLE, {})
```

## Key Features

- **Modular State System**: Each state is self-contained, making the system easily extendable.
- **Signal-Based Transitions**: Ensures smooth state changes without hard dependencies.
- **Error Handling**: Prevents invalid state transitions and logs issues when they occur.
- **Weapon Flexibility**: The system supports different melee weapons by passing the weapon reference to each state.
- **Refactored State Logic**: Timers are now persistent and coupled to states, improving performance and clarity.
