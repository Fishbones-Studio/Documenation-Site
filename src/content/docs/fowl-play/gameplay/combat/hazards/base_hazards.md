---
title: Base Hazards
description: Creation of environmental hazards
lastUpdated: 2025-05-15
author: Tjorn
---

Environmental hazards in Fowl Play are designed to add dynamic challenges and strategic depth to combat encounters. Hazards are placed throughout the arena to force both players and enemies to carefully consider their movement, positioning, and timing during fights. Each hazard type has a unique gameplay effect, encouraging players to adapt their tactics and stay alert. Currently, there are four main types of hazards: [`Base Hazard`](#base-hazard), [`Bleed Hazard`](#bleed-hazard), [`Hold Hazard`](#hold-hazard), and [`Knock Hazard`](#knock-hazard).

## Base Hazard

[`Base Hazard`](#base-hazard), as the name implies, serves as the foundation for all other hazards in the game. It provides basic functionality for detecting when a body enters the hazard area and applying damage to the player or enemy. Child classes can extend this functionality to create more complex hazards, but the base hazard can be used on its own as well, although this is not done in Fowl Play.

### Code

```gdscript
## BazeHazard serves as a base class for all hazards in the game.
##
## It handles the basic functionality of detecting when a body enters the hazard area
## and applying damage to the player or enemy. Child classes can extend this functionality

class_name BaseHazard
extends Node

@export var damage: int = 10

## Dictionary to track active bodies and their entry time
var active_bodies: Dictionary[int, int] = {} ## Dictionary[body_id, entry_time]. By using id (int), we prevent errors after the body no longer existing.
var bodies_to_remove: Array[int] = [] ## List of bodies to remove after iteration. By using id (int), we prevent errors after the body no longer existing.


func _process(_delta: float) -> void:
	erase_invalid_bodies()


func _on_hazard_area_body_entered(body: Node3D) -> void:
	if body is PhysicsBody3D:
		SignalManager.weapon_hit_target.emit(body, damage, DamageEnums.DamageTypes.TRUE)


## Overwrite in child class
func _on_hazard_area_body_exited(_body: Node3D) -> void:
	pass


# Erase invalid entries from the active_bodies dictionary
func erase_invalid_bodies() -> void:
	# Erase invalid entries after iteration
	for id in bodies_to_remove:
		active_bodies.erase(id)
	bodies_to_remove.clear()
```

The [`Base Hazard`](#base-hazard) uses a dictionary of body IDs instead of direct references to avoid errors if a body is deleted, ensuring correct tracking. The logic is kept minimal and generic so that all other hazards can inherit and extend it, promoting code reuse and consistency. Damage is applied immediately on entry to make the hazard's effect clear and predictable for players.

## Bleed Hazard

The [`Bleed Hazard`](#bleed-hazard) applies damage at tick-based intervals after an entity enters the hazard area. The damage continues for a set duration, even if the entity leaves the hazard area. This creates a lingering threat that punishes careless movement.

### Code

```gdscript
## This hazard applies damage at tick based intervals
## The damage applies after the entity touches the hazard area, and then damages the player for a set duration
class_name BleedHazard
extends BaseHazard

@export var damage_interval: float = 1.0  ## Time between damage ticks
@export var damage_duration: float = 5.0  ## Total duration of damage


func _process(_delta: float) -> void:
	if active_bodies.size() > 0:
		_apply_continuous_damage()
	super(_delta)


func _on_hazard_area_body_entered(body: Node3D) -> void:
	if body is PhysicsBody3D:
		var id: int = body.get_instance_id()
		if not active_bodies.has(id):
			active_bodies[id] = Time.get_ticks_msec()


func _apply_continuous_damage() -> void:
	var current_time: int = Time.get_ticks_msec()

	for id in active_bodies:
		var body: PhysicsBody3D = instance_from_id(id)

		if not is_instance_valid(body):
			bodies_to_remove.append(id)
			continue

		var elapsed: float = (current_time - active_bodies[id]) / 1000.0
		if elapsed >= damage_duration:
			bodies_to_remove.append(id)
		elif fmod(elapsed, damage_interval) < 0.01: # Small threshold for float comparison
			print("Sting hazard hurt entity")
			super._on_hazard_area_body_entered(body)
```

**Explanation:**
[`Bleed Hazard`](#bleed-hazard) tracks entry time for each body and applies damage at intervals, even after leaving the area. This is implemented to create a lingering threat and to encourage players to avoid hazards entirely, not just quickly pass through. The use of timers and periodic checks allows for tuning of how punishing the hazard is.

## Hold Hazard

The [`Hold Hazard`](#hold-hazard) applies damage at regular intervals while an entity remains in the hazard area. Unlike [`Bleed Hazards`](#bleed-hazard), the damage stops immediately when the entity exits the hazard area, giving the player an easy out.

### Code

```gdscript
## This hazard applies damage at tick based intervals
## The damage applies while the entity is in the hazard area, and immediately stops on exit
class_name HoldHazard
extends BaseHazard

@export var damage_interval: float = 2.0  ## Time between damage ticks


func _process(_delta: float) -> void:
	if active_bodies.size() > 0:
		_apply_continuous_damage()
	super(_delta)


func _on_hazard_area_body_entered(body: Node3D) -> void:
	if body is PhysicsBody3D:
		var id: int = body.get_instance_id()
		if not active_bodies.has(id):
			active_bodies[id] = Time.get_ticks_msec()


func _on_hazard_area_body_exited(body: Node3D) -> void:
	if body is PhysicsBody3D:
		var id: int = body.get_instance_id()
		active_bodies.erase(id)


func _apply_continuous_damage() -> void:
	var current_time: int = Time.get_ticks_msec()

	for id in active_bodies:
		var body: PhysicsBody3D = instance_from_id(id)

		if not is_instance_valid(body):
			bodies_to_remove.append(id)
			continue

		var elapsed: float = (current_time - active_bodies[id]) / 1000.0
		if fmod(elapsed, damage_interval) < 0.01: # Small threshold for float comparison
			print("Temp hold hazard hurt entity")
			super._on_hazard_area_body_entered(body)
```

**Explanation:**
[`Hold Hazard`](#hold-hazard) only applies damage while the entity is present, removing them from the active list on exit. This design rewards quick reactions and lets players minimize damage by leaving the hazard promptly. The interval-based approach makes the hazard's threat more manageable and fair, as players have control over how long they are exposed.

## Knock Hazard

The [`Knock Hazard`](#knock-hazard) applies knockback and damage to entities that enter the hazard area. This can reposition players or enemies, potentially pushing them into other hazards or into the opponent. The knockback is calculated based on the direction from the hazard to the entity, with configurable force and limits for horizontal and vertical knockback.

### Code

```gdscript
class_name KnockHazard
extends BaseHazard

@export var knockback_force: float = 5.0
@export var minimum_horizontal_knockback: float = 1.1
@export var minimum_vertical_knockback: float = 7.0
@export var maximum_horizontal_knockback: float = 3.0
@export var maximum_vertical_knockback: float = 10.0

@onready var hazard_area: Area3D = $HazardArea


func _on_hazard_area_body_entered(body: Node3D) -> void:
	if not body is CharacterBody3D:
		return

	# Calculate knockback direction
	var knockback_direction : Vector3 = self.global_position.direction_to(body.global_position)
	var knockback : Vector3 = calculate_knockback(knockback_direction)

	if body.collision_layer in [2, 4]:  # Player
		SignalManager.weapon_hit_target.emit(
				body,
				damage,
				DamageEnums.DamageTypes.TRUE,
				{
				"knockback": knockback,
			})


func calculate_knockback(direction: Vector3) -> Vector3:
	var horizontal_component := func(axis: float) -> float:
		var magnitude = abs(axis) * knockback_force
		magnitude = clamp(magnitude, minimum_horizontal_knockback, maximum_horizontal_knockback)
		return magnitude * sign(axis)

	var knockback: Vector3 = Vector3(
		horizontal_component.call(direction.x),
		clamp(max(abs(direction.y) * knockback_force, minimum_vertical_knockback), minimum_vertical_knockback, maximum_vertical_knockback),
		horizontal_component.call(direction.z)
	)
	return knockback
```

**Explanation:**
[`Knock Hazard`](#knock-hazard) calculates knockback based on the direction from the hazard to the entity, with configurable force and clamping to prevent excessive movement. This approach ensures knockback feels responsive and fair, while still being a significant threat. The modular calculation function allows for easy adjustment and reuse in other hazards or attacks.

---

## Hazard Spawning

### Code

```gdscript
extends Marker3D

@export_range(0, 100, 1) var chance: int
@export var hazard_scene: PackedScene


func _ready() -> void:
	_spawn_hazard()


func _spawn_hazard() -> void:
	if randi() % 100 < chance and hazard_scene:
		var hazard: BaseHazard = hazard_scene.instantiate()
		add_child(hazard)

		hazard.global_position = global_position
```

Hazard spawning uses random chance to add unpredictability and replayability to arena layouts. By instantiating hazards as children of a marker, the system keeps placement modular and easy to manage.

---

## Gameplay Impact

- **Area Denial:** Hazards create zones that are dangerous to enter, shaping the flow of combat and limiting safe movement options.
- **Tactical Positioning:** Players must plan their routes and attacks to avoid hazards, while also using them to their advantage (e.g., luring enemies into hazards).
- **Dynamic Fights:** The randomization of hazards ensures that no two fights play out the same way, as both players and AI must constantly adapt to the environment. This means the player cannot just memorize a single strategy, but must instead be flexible and responsive to the changing battlefield.
- **Risk vs Reward:** Hazards can be used strategically to deal damage to enemies, but players must balance the risk of taking damage themselves. This adds depth to combat decisions and encourages players to think critically about their actions.

All hazards deal `True` damage, meaning they ignore the entities defense stats. This ensures that hazards are always a threat, regardless of the player's build or equipment. It also simplifies the damage calculation, as players can always expect a consistent level of danger from hazards.

---

## References

For the visual implementation of the hazards, refer to the [3D Art section](/fowl-play/art/3d/hazards) for details on modeling, texturing, and shading techniques used in Fowl Play.
