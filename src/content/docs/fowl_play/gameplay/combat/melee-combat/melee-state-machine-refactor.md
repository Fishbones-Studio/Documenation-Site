---
title: Melee Weapon State Machine
description: Handles the melee weapon's combat states and transitions.
lastUpdated: 2025-03-31
author: Bastiaan
---

## Overview
We refactored the code of the states within the melee state machine. This was done to simplify and optimise the code as some flaws were found in the code.
For this we made some timer objects coupled to the required states in instead of remaking new timers each time we enter the function.

## Code impllementation
**Base attack state:**
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
**Attack state:**
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
## CooldownState: The weapon is cooling down after an attack.
```gdscript
class_name CooldownState
extends BaseCombatState

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
**Windup state:**
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
