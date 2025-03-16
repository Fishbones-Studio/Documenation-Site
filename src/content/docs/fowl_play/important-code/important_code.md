---
title: Important Code
description: Important code used in multiple places
lastUpdated: 2025-03-13
author: Tjorn
---

## Base State
`base_state.gd` functions as the base for all states. It contains common functions, of which all states require at least one. As you can see, the `base_state.gd` is missing an `enter` and `setup` function. These functions will be implemented in the child classes, so that they can contain typed parameters. GDScript sadly has no concept of generics.
```gdscript
## Base class for all state implementations in a state machine pattern.
##
## **Note:** This class should not be used directly. Always create child classes.
class_name BaseState
extends Node

## Handles input events for state-specific behavior.
##
## **Must be overridden** in child classes that need input handling.
##
## Parameters:
##  _event: Input event to process.
func input(_event: InputEvent) -> void:
	pass


## Called every frame with delta time.
##
## **Must be overridden** in child classes that need frame-based updates.
##
## Parameters:
##  _delta: Time elapsed since previous frame in seconds.
func process(_delta: float) -> void:
	pass


## Called every physics frame with delta time.
##
## **Must be overridden** in child classes that need physics updates.
##
## Parameters:
##  _delta: Time elapsed since previous physics frame in seconds.
func physics_process(_delta: float) -> void:
	pass


## Called when leaving this state.
##
## Use this to clean up any state-specific resources or reset temporary state.
## **Must be overridden** in child classes if needed.
func exit() -> void:
	pass
```

### Movement
Movement is added in the `physics_process` on a set tick rate, because the entities the states will apply too, extend from `PhysicsBody3D`, which is tied to the physics engine.
Applying movement in the default `process`, which runs every frame, can cause issues such as missing collisions.