---
title: Dagger
lastUpdated: 2025-05-13
description: Dagger is a slower paced weapon, with high range
author: Tjorn
---

![Dagger Icon](../../../../../../../assets/fowl-play/gameplay/combat/melee-combat/weapons/dagger/dagger.png)

The Dagger is a high-range melee weapon with a slower attack cycle. Its unique feature is the ability to deal damage multiple times per attack, rewarding precise timing and positioning.

## Resource

```gdscript
[gd_resource type="Resource" script_class="MeleeWeaponResource" load_steps=3 format=3 uid="uid://blv5macbefk8v"]

[ext_resource type="Texture2D" uid="uid://4if2m81qjh0x" path="res://entities/weapons/melee_weapons/melee_weapon_models/dagger/art/dagger.png" id="1_8lwf8"]
[ext_resource type="Script" uid="uid://bflt4m3fx7gmv" path="res://entities/weapons/melee_weapons/melee_weapon_resource.gd" id="1_43o3y"]

[resource]
script = ExtResource("1_43o3y")
damage = 8
windup_time = 0.5
attack_duration = 2.0
cooldown_time = 2.5
stun_time = 0.1
loop_animation = false
name = "Dagger"
purchasable = true
is_free = false
drop_chance = 12
cost = 100
currency_type = 0
description = "Deals %s Base Damage per hit after winding up for %s. The attack lasts %s, then enters a cooldown state for %s, and stuns targets hit for %s.

Allows for [color=orange]multiple hits per attack[/color]."
short_description = "The user hurls their dagger, hitting targets [color=yellow]multiple times[/color] as it travels forward, dealing [color=yellow]minor[/color] damage and stunning targets [color=yellow]slightly[/color]."
icon = ExtResource("1_8lwf8")
model_uid = "uid://dldj0suybdnhl"

```

## Gameplay Considerations

- **Strengths**: High base damage and long range. Can hit twice per attack cycle.
- **Weaknesses**: Long windup and cooldown, requiring careful timing.
- **Best Used**: For players who can anticipate enemy movement and maximize the multiple-hit potential.
- **Notable Mechanics**: The dagger's multi-hit mechanic allows for multiple hits per attack, which can be a strategic advantage.

## Animations

- **Attack**: The dagger lunges forward, rotating flat, then spins and moves in an arc.
- **Cooldown**: The weapon is inspected, adding a flourish after the attack.
- **Idle**: The dagger is tossed and spins in the air.
