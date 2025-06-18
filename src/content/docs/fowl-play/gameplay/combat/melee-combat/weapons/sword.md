---
title: Sword
lastUpdated: 2025-05-13
description: Sword
author: Tjorn
---

![Sword Icon](../../../../../../../assets/fowl-play/gameplay/combat/melee-combat/weapons/sword/sword.png)
The Sword is a powerful melee weapon with high base damage and an attack arc. It is designed for players who want to deal significant damage in a single swing.

## Resource

```gdscript
[gd_resource type="Resource" script_class="MeleeWeaponResource" load_steps=3 format=3 uid="uid://c4dujlqw5d4kl"]

[ext_resource type="Texture2D" uid="uid://l66orp7qg35j" path="res://entities/weapons/melee_weapons/melee_weapon_models/sword/art/sword.png" id="1_djghw"]
[ext_resource type="Script" uid="uid://bflt4m3fx7gmv" path="res://entities/weapons/melee_weapons/melee_weapon_resource.gd" id="1_tqsw4"]

[resource]
script = ExtResource("1_tqsw4")
damage = 50
windup_time = 0.3
attack_duration = 0.5
cooldown_time = 0.4
stun_time = 1.5
loop_animation = false
name = "Sword"
purchasable = true
is_free = false
drop_chance = 50
cost = 150
currency_type = 0
description = "Deals %s Base Damage with a broad slash after winding up for %s. The attack lasts %s, then enters a cooldown state for %s, and stuns targets hit for %s."
short_description = "The user [color=yellow]winds up briefly[/color], then delivers a broad slash dealing [color=yellow]great[/color] damage and stunning targets [color=yellow]significantly[/color]."
icon = ExtResource("1_djghw")
model_uid = "uid://co3ix5krmh3qr"

```

## Gameplay Considerations

- **Strengths**: High damage output and wide attack arc, making it still hit when the player is not directly in front of the player.
- **Weaknesses**: Slightly slower than the fastest weapons, requiring good timing.
- **Best Used**: For players who want to maximize damage per hit and control space in melee combat.

## Animations

- **Attack**: The sword moves forward and rotates in an arc, simulating a slash.
- **Cooldown**: The sword spins back to its original position, readying for the next attack.
- **Idle**: The sword wiggles and rotates slightly, notifying the player that it is ready.
