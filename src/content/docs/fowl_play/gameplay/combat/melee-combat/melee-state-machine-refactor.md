---
title: Melee Weapon State Machine Refactor
description: Handles the melee weapon's combat states and transitions.
lastUpdated: 2025-03-31
author: Bastiaan
---

## Description
We refactored the code of the states within the melee state machine. This was done to simplify and optimise the code as some flaws were found in the code.
For this we made some timer objects coupled to the required states in instead of remaking new timers each time we enter the function.

## Code implementation
**Base attack state:**
Sets the base functions for the other states as well as some important variables used in other classes.
```gdscript
class_name BaseCombatState
extends BaseState

@export var ANIMATION_NAME: String

var weapon: MeleeWeapon


func setup(_weapon_node: MeleeWeapon) -> void:
	print(_weapon_node)
	weapon = _weapon_node


func enter(_previous_state, _information: Dictionary[String, float] = {}) -> void:
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
const STATE_TYPE: int = WeaponEnums.MeleeState.IDLE

# Checks for player input (attack button press)
func input(event: InputEvent) -> void:
	if event.is_action_pressed("attack"):
		# Switch to the WINDUP state when attacking
		SignalManager.combat_transition_state.emit(WeaponEnums.MeleeState.WINDUP)
```
**Windup state:**
Uses a timer to give a windup time before the attack takes place. Can be used with heavier weapons to give a feeling of more impact. Could add extra animation later. After the timer runs out transition to the attack state.
```gdscript
## WindupState: The weapon is preparing to attack.
class_name WindupState
extends BaseCombatState

# Constants
const STATE_TYPE: int = WeaponEnums.MeleeState.WINDUP
# Variables
@onready var windup_timer: Timer = %WindupTimer


# When entering this state, start the windup timer
func enter(_previous_state, _information: Dictionary[String, float] = {}) -> void:
	if weapon.current_weapon.windup_time <= 0:
		SignalManager.combat_transition_state.emit(WeaponEnums.MeleeState.ATTACKING)
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
	SignalManager.combat_transition_state.emit(WeaponEnums.MeleeState.ATTACKING)
```
**Attack state:**
Uses a timer to give time for the attack animation to take place. Also checks for collision with objects to deal damage. When the timer runs out transitions to the cooldown state.
```gdscript
## AttackingState: The weapon is actively attacking.
class_name AttackingState
extends BaseCombatState

# Constants
const STATE_TYPE: int = WeaponEnums.MeleeState.ATTACKING

@onready var attack_timer: Timer = %AttackTimer

var hit_area: Area3D

# Set up the weapon and cache important nodes
func setup(weapon_node: MeleeWeapon) -> void:
	super(weapon_node)
	if not weapon_node:
		print("Weapon does not exist! Please provide a valid weapon node.")
		return
	hit_area = weapon.hit_area

	print("Weapon set successfully:", weapon.current_weapon.name)

# When entering this state, start the attack timer and attack
func enter(_previous_state, _information: Dictionary[String, float] = {}) -> void:
	attack_timer.wait_time = weapon.current_weapon.attack_duration
	attack_timer.start()
	_attack()


# When exiting this state, stop and remove the attack timer
func exit() -> void:
	if attack_timer:
		attack_timer.stop()


# When the attack timer runs out, switch to the cooldown state
func _on_attack_timer_timeout() -> void:
	SignalManager.combat_transition_state.emit(WeaponEnums.MeleeState.COOLDOWN)


func _attack() -> void:
	if not hit_area:
		print("HitArea not found!")
		return

	# Get all enemies inside the hit area
	var enemies: Array[Node3D] = hit_area.get_overlapping_bodies()
	for enemy in enemies:
		if enemy is Enemy:
			enemy.take_damage(weapon.current_weapon.damage)
```
**Cooldown state:**
Uses timer for end delay after the attack. This gives some recovery time to attacks. After the timer finishes transition to the idle state.
```gdscript
class_name CooldownState
extends BaseCombatState
## CooldownState: The weapon is cooling down after an attack.
# Constants
const STATE_TYPE: int = WeaponEnums.MeleeState.COOLDOWN  # Defines this state as COOLDOWN
# Variables
@onready var cooldown_timer: Timer = %CooldownTimer

# When entering this state, start the cooldown timer
func enter(_previous_state, _information: Dictionary[String, float] = {}) -> void:
	# Create a timer that lasts as long as the weapon's cooldown time
	cooldown_timer.wait_time = weapon.current_weapon.attack_duration
	cooldown_timer.start()


# When exiting this state, stop and remove the cooldown timer
func exit() -> void:
	if cooldown_timer:
		cooldown_timer.stop()


# When the cooldown timer runs out, switch back to the IDLE state
func _on_cooldown_timer_timeout() -> void:
	SignalManager.combat_transition_state.emit(WeaponEnums.MeleeState.IDLE)
```
