---
title: Melee Combat State Machine
description: Manages weapon state transitions and behavior for combat.
lastUpdated: 2025-03-16
author: Cenker
---

## Description
The weapon combat system is designed to handle the various states a weapon can be in during combat, such as idle, windup, attacking, and cooldown. The system uses a state machine to manage transitions between these states, ensuring smooth and responsive combat mechanics.

### Controls
#### Keyboard
- **Left Click**: Initiate attack


## Weapon State Machine
The state machine is implemented in GDScript and manages the transitions between states. Below is the code for the state machine and its associated states.

### Weapon State Machine Code
```gdscript
## Weapon State Machine: Manages weapon state transitions and behavior.
extends Node3D

## Exported Variables
@export var current_weapon: WeaponResource

## Public Variables
var current_weapon_instance: Node3D
var current_state: BaseState
var states: Dictionary = {}

## Onready Variables
@onready var hitbox: Area3D = $"../HitArea"


func _ready():
	if not current_weapon:
		push_error("No weapon assigned!")
		return

	# Initialize states because we can't set states as child nodes of our state machine
	states = {
		WeaponEnums.WeaponState.IDLE: IdleState.new(),
		WeaponEnums.WeaponState.WINDUP: WindupState.new(),
		WeaponEnums.WeaponState.ATTACKING: AttackingState.new(),
		WeaponEnums.WeaponState.COOLDOWN: CooldownState.new()
	}

	# Set the owner of each state to this state machine
	for state in states.values():
		state.weapon_state_machine = self

	# Equip the weapon and start in the Idle state
	equip_weapon(current_weapon)
	transition_to(WeaponEnums.WeaponState.IDLE)

func _process(delta: float):
	if current_state:
		current_state.process(delta)

## Public Methods
func transition_to(new_state: WeaponEnums.WeaponState):
	if current_state:
		current_state.exit()

	current_state = states.get(new_state)
	if current_state:
		current_state.enter()

func equip_weapon(weapon_resource: WeaponResource):
	if current_weapon_instance:
		current_weapon_instance.queue_free()

	current_weapon = weapon_resource

	if weapon_resource.model:
		current_weapon_instance = weapon_resource.model.instantiate()
		add_child(current_weapon_instance)
	elif weapon_resource:
		current_weapon_instance = weapon_resource.instantiate()
		add_child(current_weapon_instance)

	transition_to(WeaponEnums.WeaponState.IDLE)

func attack():
	var enemies = hitbox.get_overlapping_bodies()
	# We search for a class named Enemy within our hitbox
	for enemy in enemies:
		if enemy is Enemy:
			enemy.take_damage(current_weapon.damage)

```

## States Implementation

Each state has its own function and purpose within the weapon system. Below is a detailed breakdown of what each state does.

### Available States
- **IDLE**: Default state when the weapon is not in use.
- **WINDUP**: Prepares the weapon for an attack.
- **ATTACKING**: Handles the active attack phase, dealing damage to enemies.
- **COOLDOWN**: A brief pause after an attack before the weapon can be used again.


## Idle State

#### The default state when the weapon is not in use.

-   Listens for player input to begin an attack.
-   If an attack is initiated, it transitions to the windup state.


```gdscript
class_name IdleState extends BaseState

## Public Variables
var weapon_state_machine: Node3D

func enter() -> void:
    print("Entering Idle State")

func process(delta: float) -> void:
    if Input.is_action_just_pressed("attack"):
        weapon_state_machine.transition_to(WeaponEnums.WeaponState.WINDUP)

func exit() -> void:
    pass

```

### Windup State

## Prepares the weapon before executing an attack.

-   This state simulates the "build-up" before an attack is executed.
-   Helps add weight and realism to weapon swings.
-   Once the windup timer is completed, it transitions to the attacking state.

```gdscript
class_name WindupState extends BaseState

## Public Variables
var weapon_state_machine: Node3D
var windup_timer: float = 0.0

func enter() -> void:
    print("Entering Windup State")
    windup_timer = weapon_state_machine.current_weapon.windup_time

func process(delta: float) -> void:
    windup_timer -= delta

    if windup_timer <= 0:
        weapon_state_machine.transition_to(WeaponEnums.WeaponState.ATTACKING)

func exit() -> void:
    pass


```

## Attacking State

#### Handles the active attack phase of the weapon.

-   The weapon deals damage to any enemies within range.
-   The state lasts for a fixed duration based on the weapon’s attack speed.
-   Once the duration ends, the weapon transitions into the cooldown state.



 ```gdscript
 class_name AttackingState extends BaseState

## Public Variables
var weapon_state_machine: Node3D
var attack_duration: float = 0.0

func enter() -> void:
    print("Entering Attacking State")
    attack_duration = weapon_state_machine.current_weapon.attack_duration

    # Call the attack logic once when entering the ATTACKING state.
    weapon_state_machine.attack()

func process(delta: float) -> void:
    attack_duration -= delta

    if attack_duration <= 0:
        weapon_state_machine.transition_to(WeaponEnums.WeaponState.COOLDOWN)

func exit() -> void:
    pass
```

#### Cooldown State

## Prevents immediate re-attacks by enforcing a short delay.

-   The weapon cannot attack again until the cooldown period is over.
-   Ensures balanced and fair gameplay.
-   Once the cooldown ends, the weapon transitions back to the idle state.

```gdscript
class_name CooldownState extends BaseState

## Public Variables
var weapon_state_machine: Node3D
var cooldown_timer: float = 0.0

func enter() -> void:
    print("Entering Cooldown State")
    cooldown_timer = weapon_state_machine.current_weapon.cooldown_time

func process(delta: float) -> void:
    cooldown_timer -= delta

    if cooldown_timer <= 0:
        weapon_state_machine.transition_to(WeaponEnums.WeaponState.IDLE)

func exit() -> void:
    pass


```