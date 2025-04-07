---
title: Base Ranged Combat State
description: This document provides an overview of the `base_ranged_combat_state.gd` script, which is used for all state machine states.
lastUpdated: 2025-04-07
author: Tjorn
---

## Base Ranged Combat State

`base_ranged_combat_state.gd` is the base class for all ranged combat states. It contains common functions that all ranged combat states require. It extends from `BaseState` LINK TO BASESTATE PAGE HERE. The `BaseRangedCombatState` class is designed to be inherited by specific ranged combat states, such as `MinigunAttackState`, `BowAttackState`, etc. This allows for a modular and reusable design, where each specific state can implement its own unique behavior while still sharing common functionality.

### Design Philosophy

The ranged weapon system is built on a state machine architecture to provide flexibility, modularity, and maintainability. This design choice offers several advantages:

1. **Separation of Concerns**: Each weapon state is responsible for a specific aspect of the weapon's behavior, making the code easier to understand and modify.

2. **Extensibility**: New weapon types can be added by simply creating new state classes that inherit from `BaseRangedCombatState`. This allows for rapid prototyping and iteration.

3. **Predictable Behavior**: The state machine ensures that weapons follow a logical flow of operations (idle → windup → attacking → cooldown), preventing unexpected behaviors.

4. **Reusability**: Common functionality is implemented in the base class, reducing code duplication and ensuring consistent behavior across different weapons.

5. **Fine-tuned Control**: The state-based approach allows for precise control over animation timing, effects, sound, and other aspects of weapon behavior.

### Class Definition

```gdscript
class_name BaseRangedCombatState
extends BaseState

@export var ANIMATION_NAME: String
@export var state_type: WeaponEnums.WeaponState

var weapon: RangedWeapon
var transition_signal : Signal
var origin_entity : PhysicsBody3D ## The entity that is using the weapon


func setup(_weapon_node: RangedWeapon, _transition_signal : Signal) -> void:
	if not _weapon_node:
		print("Weapon does not exist! Please provide a valid weapon node.")
		return

	if not _transition_signal:
		print("Transition signal does not exist! Please provide a valid signal.")
		return


	weapon = _weapon_node
	transition_signal = _transition_signal


func enter(_previous_state, _information: Dictionary = {}) -> void:
	pass

func process_hit(raycast: RayCast3D) -> void:
	# make the raycast immediately check for collisions
	raycast.force_raycast_update()

	if raycast.is_colliding():
		var collider: Object = raycast.get_collider()
		print("Raycast hit: " + collider.name)

		if collider is PhysicsBody3D:
			DebugDrawer.draw_debug_impact(raycast.get_collision_point(), collider)
			if collider == origin_entity:
				print("Hit self")
				return
			print("Colliding with:" + collider.name)
			# TODO: hit marker
			SignalManager.weapon_hit_target.emit(collider, weapon.current_weapon.damage)
```

### Key Components

- **Animation Name**: The name of the animation to be played during the attack.
- **State Type**: The type of state, defined in `WeaponEnums.WeaponState`.
- **Weapon**: The weapon instance associated with this state.
- **Transition Signal**: A signal used to transition between states.
- **Origin Entity**: The entity that is using the weapon.
- **Setup Function**: Initializes the weapon and transition signal.
- **Enter Function**: Called when entering this state. Can be overridden in child classes.
- **Process Hit Function**: Processes the hit from the raycast, checking for collisions and emitting signals as necessary.
- Only used by hitscan weapons

### Implementation Benefits

This state-based design offers several technical advantages:

1. **Decoupled Weapon Logic**: The weapon's behavior is decoupled from the entity using it, allowing the same weapon to be used by different entities (players, NPCs) with minimal code changes.

2. **Performance Optimization**: Each state manages only the necessary resources and computations for its specific phase, reducing overhead.

3. **Easy Debugging**: When issues arise, they can be isolated to specific states, making debugging more straightforward.

4. **Networked Gameplay Ready**: The state machine design makes it easier to synchronize weapon states across a network for multiplayer gameplay.

5. **Designer-Friendly**: New weapons can be configured largely through data rather than code changes, allowing designers to create and balance weapons without deep programming knowledge.

## Usage

In order to correctly use the ranged weapon, the entity needs to call the `ranged_weapon_handler.gd` script. This script is responsible for managing the ranged weapon's state machine and handling the transitions between different states.

```gdscript
## Handles input transitions for ranged weapon state machine
class_name RangedWeaponHandler extends Node

@export var state_machine: RangedWeaponStateMachine


## Called when attack action is initiated (button pressed)
func start_use() -> void:
	match state_machine.current_state.state_type:
		WeaponEnums.WeaponState.COOLDOWN:
			print("Attack not allowed during cooldown")
			return
		WeaponEnums.WeaponState.IDLE:
			print("going to windup")
			state_machine.combat_transition_state.emit(WeaponEnums.WeaponState.WINDUP, {})
		WeaponEnums.WeaponState.ATTACKING:
			# Allow continuous fire if weapon supports it
			if weapon_supports_hold_fire():
				pass
			else:
				print("Cannot attack again during attack")
		_:
			pass


## Called when attack action is released (button released)
func end_use() -> void:
	print("Stopping weapon")
	match state_machine.current_state.state_type:
		WeaponEnums.WeaponState.WINDUP:
			# Cancel windup if released early
			state_machine.combat_transition_state.emit(WeaponEnums.WeaponState.IDLE, {})
		WeaponEnums.WeaponState.ATTACKING:
			# Cancel attack if released early
			if weapon_supports_early_release():
				state_machine.combat_transition_state.emit(WeaponEnums.WeaponState.COOLDOWN, {})
		_:
			pass


## Helper to check weapon's hold capability
func weapon_supports_hold_fire() -> bool:
	return state_machine.weapon.current_weapon.allow_continuous_fire


## Helper to check if weapon allows early release
func weapon_supports_early_release() -> bool:
	return state_machine.weapon.current_weapon.allow_early_release
```

### Example Usage

```gdscript
extends Node

@onready var current_weapon : RangedWeapon = $"../CurrentRangedWeapon".current_weapon

func _input(event: InputEvent) -> void:
	if event.is_action_pressed("attack_secondary"):
		_start_firing()
	elif event.is_action_released("attack_secondary"):
		_stop_firing()

func _start_firing() -> void:
	if not is_instance_valid(current_weapon):
		push_warning("No valid ranged weapon equipped")
		return

	if current_weapon.handler:
		current_weapon.handler.start_use()

func _stop_firing() -> void:
	if not is_instance_valid(current_weapon):
		return

	if current_weapon.handler:
		current_weapon.handler.end_use()
```

## Extending the System

When creating a new ranged weapon, you should consider:

1. **Required States**: Implement at minimum an idle state, attack state, and cooldown state for your weapon.
   - The idle state is the default state when the weapon is not in use.
   - The attack state handles the weapon's firing logic.
   - The cooldown state manages the time between attacks.
   - The windup state is optional but can be used for weapons that require a delay before firing, like the minigun.
2. **Optional Windup**: Add a windup state for weapons that need preparatory animations or effects.
3. **Projectile vs. Hitscan**: Decide if your weapon uses instant hit detection (hitscan) or spawns physical projectiles.
4. **Configuration Properties**: Define properties like damage, fire rate, recoil pattern, etc. in a resource file.
5. **Sound and VFX**: Each state can trigger appropriate sounds and visual effects tied to the weapon's behavior.
6. **Cooldown Management**: States can manage cooldowns effectively, ensuring that weapons are not overused and maintain balance in gameplay.

By following this architecture, new weapons can be added to the game with minimal effort while maintaining consistent, predictable behavior.
