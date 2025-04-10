---
title: Melee Weapon State Machine Refactor
description: Handles the melee weapon's combat states and transitions.
lastUpdated: 2025-04-10
author: Bastiaan
---

## Description
We refactored the code of the states within the melee state machine. This was done to simplify and optimise the code as some flaws were found in the code.
For this we made some timer objects coupled to the required states in instead of remaking new timers each time we enter the function.

## Code implementation
**Melee weapon handler**
This script is used to get a reference to the node owning this scene.
```gdscript
extends Node3D
# Used to get reference to player/enemy in their respective scenes.
@export var actor : CharacterBody3D
```
**Base attack state:**
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
**Idle state:**
This state is used to reset the weapon and wait on the trigger to attack.
```gdscript
## IdleState: The weapon is idle and waiting for input.
class_name IdleState
extends BaseCombatState

# Constants
# Defines this state as IDLE
const STATE_TYPE: int = WeaponEnums.WeaponState.IDLE

var hit_area: Area3D
var valid_attack : bool = false


# Set up the weapon and cache important nodes
func setup(weapon_node: MeleeWeapon, melee_combat_transition_state: Signal, root_actor: CharacterBody3D) -> void:
	super(weapon_node, melee_combat_transition_state, root_actor)
	hit_area = weapon_node.hit_area


# This is only excecuted if the root actor is an enemy.
# This looks for the player within the weapon's attack area and then transitions to windup like player.
func process(delta: float) -> void:
	var targets: Array[Node3D] = hit_area.get_overlapping_bodies()
	for target in targets:
		if(target == GameManager.chicken_player):
			valid_attack = true
		else:
			valid_attack = false
	if(valid_attack):
		melee_combat_transition_state.emit(WeaponEnums.WeaponState.WINDUP, {})


# Checks for player input (attack button press)
func input(event: InputEvent) -> void:
	if event.is_action_pressed("attack"):
		# Switch to the WINDUP state when attacking
		melee_combat_transition_state.emit(WeaponEnums.WeaponState.WINDUP, {})
```
**Windup state:**
Uses a timer to give a windup time before the attack takes place. Can be used with heavier weapons to give a feeling of more impact. Could add extra animation later. After the timer runs out transition to the attack state.
```gdscript
## WindupState: The weapon is preparing to attack.
class_name WindupState
extends BaseCombatState

# Constants
const STATE_TYPE: int = WeaponEnums.WeaponState.WINDUP
# Variables
@onready var windup_timer: Timer = %WindupTimer


# When entering this state, start the windup timer
func enter(_previous_state, _information: Dictionary = {}) -> void:
	if weapon.current_weapon.windup_time <= 0:
		melee_combat_transition_state.emit(WeaponEnums.WeaponState.ATTACKING, {})
		return
	elif weapon.current_weapon.windup_time > 0:
		windup_timer.wait_time = weapon.current_weapon.windup_time
		windup_timer.start()


# When exiting this state, stop the windup timer
func exit() -> void:
	if windup_timer:
		windup_timer.stop()


# When the windup timer runs out, switch to the ATTACKING state
func _on_windup_timer_timeout() -> void:
	melee_combat_transition_state.emit(WeaponEnums.WeaponState.ATTACKING, {})

```
**Attack state:**
Uses a timer to give time for the attack animation to take place. Also checks for collision with objects to deal damage. When the timer runs out transitions to the cooldown state.
```gdscript
## AttackingState: The weapon is actively attacking.
class_name AttackingState
extends BaseCombatState

# Constants
const STATE_TYPE: int = WeaponEnums.WeaponState.ATTACKING

var hit_area: Area3D

@onready var attack_timer: Timer = %AttackTimer

# Set up the weapon and cache important nodes
func setup(weapon_node: MeleeWeapon, melee_combat_transition_state: Signal, root_actor: CharacterBody3D) -> void:
	super(weapon_node, melee_combat_transition_state, root_actor)
	hit_area = weapon_node.hit_area


# When entering this state, start the attack timer and attack
func enter(_previous_state, _information: Dictionary = {}) -> void:
	attack_timer.wait_time = weapon.current_weapon.attack_duration
	attack_timer.start()
	_attack()


# When exiting this state, stop and remove the attack timer
func exit() -> void:
	if attack_timer:
		attack_timer.stop()


# When the attack timer runs out, switch to the cooldown state
func _on_attack_timer_timeout() -> void:
	melee_combat_transition_state.emit(WeaponEnums.WeaponState.COOLDOWN)


func _attack() -> void:
	if not hit_area:
		print("HitArea not found!")
		return

	# Get targets for the given area in the attack area. Check which actor is making the attack
	# and corresponding to what actor makes the attack deal damage to certain types of targets
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
**Cooldown state:**
Uses timer for end delay after the attack. This gives some recovery time to attacks. After the timer finishes transition to the idle state.
```gdscript
## CooldownState: The weapon is cooling down after an attack.
class_name CooldownState
extends BaseCombatState

# Constants
const STATE_TYPE: int = WeaponEnums.WeaponState.COOLDOWN  # Defines this state as COOLDOWN
# Variables
@onready var cooldown_timer: Timer = %CooldownTimer


# When entering this state, start the cooldown timer
func enter(_previous_state, _information: Dictionary = {}) -> void:
	# Create a timer that lasts as long as the weapon's cooldown time
	cooldown_timer.wait_time = weapon.current_weapon.attack_duration
	cooldown_timer.start()


# When exiting this state, stop and remove the cooldown timer
func exit() -> void:
	if cooldown_timer:
		cooldown_timer.stop()


# When the cooldown timer runs out, switch back to the IDLE state
func _on_cooldown_timer_timeout() -> void:
	melee_combat_transition_state.emit(WeaponEnums.WeaponState.IDLE, {})

```
