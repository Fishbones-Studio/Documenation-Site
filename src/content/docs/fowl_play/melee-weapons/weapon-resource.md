---
title: Melee Weapon Resource
description: Manages weapon stats and its model.
lastUpdated: 2025-03-16
author: Cenker
---

## Description

The **weapon_resource** class is our custom resource that defines the attributes of a melee weapon. It allows for the easy creation and customization of weapons by storing properties such as damage, timing values, and visuals.

Using a resource-based approach makes it simple to reuse weapon data across different characters, balance weapons efficiently, and manage weapon variations without modifying the core combat system.

## Features

- **Stores essential weapon properties**, such as damage, attack speed, and cooldown.
- **Supports different weapon models and UI elements**, allowing for better customization.
- **Enables easy modification** without altering the weapon's core logic.

---

## Weapon Resource Properties

Each weapon has a set of attributes that define its combat characteristics:

### **Weapon Attributes**
- **`name`** *(String)* – The name of the weapon.
- **`damage`** *(int)* – The amount of damage the weapon deals per attack.

### **Timing Variables**
- **`windup_time`** *(float)* – The delay before an attack is executed after pressing the attack button.
- **`attack_duration`** *(float)* – The time during which the weapon is actively attacking.
- **`cooldown_time`** *(float)* – The delay before the weapon can be used again after an attack.

### **Visual & UI Elements**
- **`model`** *(PackedScene)* – The visual representation of the weapon in-game.
- **`icon`** *(Texture)* – The weapon's icon, used in UI elements such as inventory or shop menus.

---

## Weapon Resource Code

```gdscript
## WeaponResource: Defines weapon properties that can be used across different weapons.

extends Resource
class_name WeaponResource

## Weapon Attributes
@export var name: String 
@export var damage: int

## Timing Variables
@export var windup_time: float 
@export var attack_duration: float 
@export var cooldown_time: float 

## Visual & UI Elements
@export var model: PackedScene
@export var icon: Texture  # The icon for the shop/inventory

```

This resource is used by the Weapon State Machine to determine how a weapon behaves during combat. Each weapon can have different values, making it easy to create unique weapons such as swords, axes, and hammers with varying attributes.