---
title: Peck
lastUpdated: 2025-05-13
description: The peck is the default melee weapon in Fowl Play, used by the player.
author: Tjorn
---

Peck is the default melee weapon in Fowl Play, used by the player. It is a simple yet effective weapon that allows players to deal damage to enemies in close combat.
The peck is a quick attack that can be executed with a short windup time, making it ideal for fast-paced combat scenarios. The weapon's design is inspired by the natural pecking behavior of birds, and it is represented in the game with a unique animation.

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

The peck is the default melee weapon in Fowl Play, and is thus not purchasable. Once the player has acquired a different melee weapon, the peck will be dropped, and only returns on player death. The peck is not a very powerful weapon, but it is fast and can be used to deal damage quickly in close combat situations.
Since Peck is the default melee weapon, the stats are not as high as other melee weapons. The peck is a good starting weapon for players to learn the combat mechanics of Fowl Play, and it can be used effectively in the early stages of the game.

## Custom Script

Peck uses a custom script, to trigger the anations on the chicken player (and hendere):

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
