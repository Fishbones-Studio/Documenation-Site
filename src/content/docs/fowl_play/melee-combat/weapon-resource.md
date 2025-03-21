---
title: Melee Weapon Resource
description: Manages weapon stats and its model.
lastUpdated: 2025-03-16
author: Cenker
---

## Description

The **WeaponResource** class is a custom resource that defines the attributes of a melee weapon. It allows for **easy creation, customization, and balancing** of melee weapons by storing key properties such as **damage, attack timing, and visuals**.

By using a resource-based approach, weapon data can be **reused across multiple characters**, making it simple to balance weapons, modify stats, and manage weapon variations **without altering any code**.

## Features

- **Defines core weapon properties** like damage, attack speed, and cooldown.
- **Supports different weapon models and UI elements** for better customization.
- **Allows easy modification** directly in the Godot Editor, no coding required.
- **Works seamlessly with the Weapon State Machine**, allowing weapons to behave dynamically.

---

## Weapon Resource Properties

Each weapon has a set of attributes that determine its combat behavior. These can be edited **directly in the Godot Editor** without any coding knowledge.

### **Weapon Attributes**
- **`damage`** *(int)* – The amount of damage the weapon deals per attack.

### **Timing Variables**
- **`windup_time`** *(float)* – The delay before an attack is executed after pressing the attack button.
- **`attack_duration`** *(float)* – The time during which the weapon is actively attacking.
- **`cooldown_time`** *(float)* – The delay before the weapon can be used again after an attack.

### **Visual & UI Elements**
- **`model`** *(PackedScene)* – The visual representation of the weapon in-game.

---

## Weapon Resource Code

```gdscript
## WeaponResource: Defines weapon properties that can be used across different weapons.
class_name WeaponResource
extends BaseResource

# Weapon Attributes
@export var damage: int

# Timing Variables
@export var windup_time: float 
@export var attack_duration: float 
@export var cooldown_time: float 

# Visual & UI Elements
@export var model: PackedScene

# Assigns this resource as a weapon type upon initialization
func _init() -> void:
	type = ItemEnums.ItemTypes.WEAPON

```
## Creating/Editing Weapons in our game

### To add a weapon and or modify weapon properties, follow these steps:

#### 1. Create a new Weapon Resource
- In the FileSystem, right-click and select New Resource.
- Choose WeaponResource as the resource type.
- Save it as a `.tres` file (for example, sword.tres).

#### 2. Edit the weapon properties
- Open the newly created resource.
- Adjust values like damage, windup time, and cooldown in the Inspector Panel.

#### 3. Assign the resource to a weapon
- Drag and drop the weapon model scene into the WeaponResource model property.

Now, the weapon will automatically use the updated stats in-game without changing any code!

