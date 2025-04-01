---
title: Enemy melee weapon implementation
description: First implementation of the enemy weapon
lastUpdated: 2025-03-31
author: Bastiaan
---

## Description
Added weapon instance to the enemy so the enemy has a weapon it holds. It uses the stats given in the weapon scene. This allows the enemy to deal damage. Current implementation is somewhat limited as seen in the enemy attack script.

## Implementation
**Set current weapon:** 
This script is used to set the weapon of the enemy in a modular way so different enemies can have different weapons easily. This will allow us to quickly implement different enemies using the already created weapons when implemented completely
```gdscript
@tool
class_name CurrentWeapon
extends Node3D

## Exported Variables
@export_group("weapon")
@export var weapon_scene: PackedScene:
	set(value):
		# Custom setter to validate the scene type
		if value and value.can_instantiate() and value.instantiate() is MeleeWeapon:
			weapon_scene = value
		else:
			push_error("Assigned scene is not a valid Weapon type")
			weapon_scene = null

var current_weapon: MeleeWeapon


func _ready() -> void:
	if not weapon_scene:
		push_error("No valid weapon scene assigned!")
		return

	current_weapon = weapon_scene.instantiate() as MeleeWeapon
	print("set weapon")
	if not current_weapon:
		push_error("Failed to instantiate weapon!")
		return

	add_child(current_weapon)
```

