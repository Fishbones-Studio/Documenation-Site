---
title: Scene Management
description: UI and Scene manager
lastUpdated: 2025-03-17
author: Tjorn
---

# Scene Manager

The Scene Manager provides a centralized system for handling game scene transitions. It serves as a parent for all gameplay scenes, creating a clean separation between gameplay elements and UI components.

## Overview

The Scene Manager is implemented as a Godot node that manages the loading, unloading, and switching of game scenes during runtime. This approach allows for better organization of the game structure and simplified scene transitions.

**Important Note:** The Scene Manager is loaded as the main scene by Godot, serving as the entry point for the game.

## Implementation

```gdscript
## This scene loader is used as a parent for all gameplay scenes
##
## This allows for a single point of entry for all scenes, seperate from UI elements
extends Node

func _ready() -> void:
	SignalManager.switch_game_scene.connect(_on_switch_game_scene)


func _on_switch_game_scene(scene_path: String) -> void:
	# Remove the current children
	for child in get_children():
		child.queue_free()

	_on_add_game_scene(scene_path)


func _on_add_game_scene(scene_path: String) -> void:
	# Load the scene from the path
	var new_scene_resource: Resource = ResourceLoader.load(scene_path)

	if new_scene_resource == null:
		push_error("Error: Could not load scene at path: ", scene_path)
		return  # Exit if the scene failed to load

	# Check if the loaded resource is a PackedScene
	if new_scene_resource is PackedScene:
		# Instance the new scene
		var new_scene: Node = new_scene_resource.instantiate()

		await get_tree().process_frame ## Waits one frame to ensure the scene is fully loaded, can help with some issues

		# Add it as a child of the scene loader
		add_child(new_scene)
	else:
		push_error("Error: Resource at path is not a PackedScene: ", scene_path)
```

## Key Components

### Initialization

On ready, the Scene Manager connects to the `switch_game_scene` signal from the SignalManager:

```gdscript
func _ready() -> void:
	SignalManager.switch_game_scene.connect(_on_switch_game_scene)
```

### Scene Switching

When the signal to switch scenes is received, the manager:

1. Removes all existing child nodes
2. Loads and adds the new scene

```gdscript
func _on_switch_game_scene(scene_path: String) -> void:
	# Remove the current children
	for child in get_children():
		child.queue_free()

	_on_add_game_scene(scene_path)
```

### Scene Loading

The Scene Manager loads new scenes from a provided path:

1. Loads the scene resource
2. Verifies it's a valid PackedScene
3. Instantiates the scene
4. Waits one frame for stability
5. Adds the new scene as a child

## Usage

To switch to a new gameplay scene, emit the `switch_game_scene` signal from anywhere in your code:

```gdscript
SignalManager.switch_game_scene.emit("uid://to_scene")
```

## Future Improvements

A potential optimization is background scene loading, which could be implemented for larger scenes to prevent stutters during transitions.

# UI Manager

The UI Manager is responsible for handling UI scenes in the game. It works alongside the Scene Manager, but focuses specifically on user interface elements.

## Overview

The UI Manager is implemented as a CanvasLayer node that manages loading, unloading, and switching of UI scenes. It's registered as an autoload in the project settings, making it accessible globally throughout the game.

## Implementation

```gdscript
## UI manager
## This script manages the UI scenes in the game.
## It handles switching between different UI scenes and loading them dynamically.
extends CanvasLayer

@export var initial_ui_scene: PackedScene


func _ready():
	SignalManager.switch_ui_scene.connect(_on_switch_ui)
	SignalManager.add_ui_scene.connect(_on_add_ui_scene)
	if initial_ui_scene:
		add_child(initial_ui_scene.instantiate())


func _on_switch_ui(new_ui_scene_path: String) -> void:
	# Remove the current children
	for child in get_children():
		child.queue_free()

	# Load the new UI scene from the path
	_on_add_ui_scene(new_ui_scene_path)


func _on_add_ui_scene(new_ui_scene_path: String) -> void:
	# Load the UI scene from the path
	var new_ui_scene_resource: Resource = ResourceLoader.load(new_ui_scene_path)

	if new_ui_scene_resource == null:
		push_error("Error: Could not load UI scene at path: ", new_ui_scene_path)
		return  # Exit if the scene failed to load

	# Check if the loaded resource is a PackedScene
	if new_ui_scene_resource is PackedScene:
		# Instance the new UI scene
		var new_ui_node: Node = new_ui_scene_resource.instantiate()

		# Add it as a child of the UI manager
		add_child(new_ui_node)
	else:
		push_error("Error: Resource at path is not a PackedScene: ", new_ui_scene_path)
```

## Key Components

### Initialization

On ready, the UI Manager:

1. Connects to the relevant signals from the SignalManager
2. Loads the initial UI scene if one is specified
   - Currently, the initial UI scene is the Main Menu

```gdscript
func _ready():
	SignalManager.switch_ui_scene.connect(_on_switch_ui)
	SignalManager.add_ui_scene.connect(_on_add_ui_scene)
	if initial_ui_scene:
		add_child(initial_ui_scene.instantiate())
```

### UI Scene Switching

Similar to the Scene Manager, when the signal to switch UI scenes is received, the manager:

1. Removes all existing UI elements
2. Loads and adds the new UI scene

### UI Scene Adding

The UI Manager can also add UI scenes without removing existing ones, allowing for layered UI elements.

## Usage

To switch to a new UI scene:

```gdscript
SignalManager.switch_to_ui_scene.emit("uid://your_ui_scene.tscn")
```

To add a UI scene without removing existing ones:

```gdscript
SignalManager.add_ui_scene.emit("uid://your_ui_scene.tscn")
```

# Scene-Related Signals

The Scene and UI Managers rely on signals defined in the Signal Manager to function. Here are the key signals related to scene management:

| Signal              | Purpose                                                             |
| ------------------- | ------------------------------------------------------------------- |
| `switch_ui_scene`   | Replaces all current UI elements with a new UI scene                |
| `add_ui_scene`      | Adds an additional UI scene without removing existing ones          |
| `switch_game_scene` | Replaces the current game scene with a new one                      |
| `add_game_scene`    | Adds an additional game scene (not currently used in Scene Manager) |

For more information about other signals and the Signal Manager system, see the [Signal Manager documentation](/fowl-play/gameplay/important-code/signal-manager/).

# Architecture Overview

The game's scene management architecture consists of three main components:

1. **Scene Manager** - Loaded as the main scene by Godot, manages gameplay scenes
2. **UI Manager** - Registered as an autoload, manages UI scenes separate from gameplay
3. **Signal Manager** - An autoload that facilitates communication between components

This separation of concerns allows for:

- Clear distinction between gameplay and UI elements
- Independent switching of gameplay scenes without affecting the UI
- Dynamic layering of UI elements when needed
- Global access to UI functionality from any part of the game
- Centralized signal management for simplified communication
