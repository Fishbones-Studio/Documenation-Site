---
title: Peck
lastUpdated: 2025-05-13
description: The peck is the default melee weapon in Fowl Play, used by the player.
author: Tjorn
---

![Peck Icon](../../../../../../../assets/fowl-play/gameplay/combat/melee-combat/weapons/peck/peck.png)

The Peck is inspired by the natural pecking of birds. It is quick and always available to the player unless replaced by another weapon. It serves as the default melee weapon, allowing players to engage in close combat without needing to purchase another weapon.

## Resource Overview

```gdscript
[resource]
script = ExtResource("1_mvqda")
damage = 10
windup_time = 0.2
attack_duration = 0.4
cooldown_time = 0.3
loop_animation = false
name = "Peck"
purchasable = false
drop_chance = 0
cost = 0
currency_type = 0
description = "[color=orange]Default weapon:[/color] The fearsome PECK! Your trusty beak unleashes %s Base Damage after a %s windup. The pecking lasts %s, after which your beak needs a breather for %s. Wouldn't want to break it, right?"
icon = ExtResource("1_gp07i")
model_uid = "uid://cyabnta5e4ldb"
metadata/_custom_type_script = "uid://bflt4m3fx7gmv"
```

## Gameplay considerations

- **Strengths**: Always available, quick to use, and ideal for learning combat mechanics.
- **Weaknesses**: Lower damage and range compared to other weapons.
- **Best Used**: As a fallback weapon or for new players.
- **Note**: Once another melee weapon is purchased, the peck will be replaced and unavailable until the player dies. The peck is not purchasable.

## Animations

- **Attack**: The player character jumps slightly and pecks with its beak while airborne. Uses a custom script to trigger the animation on the player or compatible enemy:

```gdscript
class_name Peck
extends MeleeWeapon


func play_attack_animation() -> void:
	var animation_tree: AnimationTree

	if entity_stats.is_player:
		if GameManager.chicken_player and GameManager.chicken_player.animation_tree:
			animation_tree = GameManager.chicken_player.animation_tree
	else:
		if GameManager.current_enemy and GameManager.current_enemy.animation_tree:
			animation_tree = GameManager.current_enemy.animation_tree

	if animation_tree:
		# Fire the OneShot request
		animation_tree.set("parameters/MeleeOneShot/request", AnimationNodeOneShot.ONE_SHOT_REQUEST_FIRE)
```
