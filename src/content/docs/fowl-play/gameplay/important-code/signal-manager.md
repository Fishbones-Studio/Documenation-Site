---
title: Signal Manager
description: Global signal management system
lastUpdated: 2025-03-17
author: Tjorn
---

# Signal Manager

The Signal Manager is a critical component that facilitates communication between different systems in the game, including the Scene Manager, UI Manager, and player functionality.

## Overview

Implemented as an autoload, the Signal Manager defines and manages global signals that can be accessed from anywhere in the game. This centralized approach to signal management simplifies communication between disconnected parts of the codebase.

## Implementation

```gdscript
## Signal Manager
##
## This script is used to manage signals in the game that are needed in multiple scenes.
## It is an autoload script, meaning it is loaded automatically when the game starts and is accessible from anywhere.
##

extends Node

# Player signals
signal player_transition_state(target_state: PlayerEnums.PlayerStates, information: Dictionary)
signal init_health(max_health: int, health: int)
signal hurt_player(damage: int)
signal init_stamina(max_stamina: float, stamina: float)
# Loader signals
signal switch_ui_scene(scene_path: String) ## This signal is used to switch the UI scene, replacing all current
signal add_ui_scene(scene_path: String) ## This signal is used to add an (additional) UI scene
signal switch_game_scene(scene_path: String) ## This signal is used to switch the game scene, replacing all current
signal add_game_scene(scene_path: String) ## This signal is used to add an (additional) game scene
```

## Available Signals

### Player Signals

| Signal                    | Parameters                                                        | Purpose                           |
| ------------------------- | ----------------------------------------------------------------- | --------------------------------- |
| `player_transition_state` | `target_state: PlayerEnums.PlayerStates, information: Dictionary` | Triggers player state changes     |
| `init_health`             | `max_health: int, health: int`                                    | Initializes player health values  |
| `hurt_player`             | `damage: int`                                                     | Applies damage to the player      |
| `init_stamina`            | `max_stamina: float, stamina: float`                              | Initializes player stamina values |

### Scene Management Signals

| Signal              | Parameters           | Purpose                                                          |
| ------------------- | -------------------- | ---------------------------------------------------------------- |
| `switch_ui_scene`   | `scene_path: String` | Replaces all current UI elements with a new UI scene             |
| `add_ui_scene`      | `scene_path: String` | Adds an additional UI scene without removing existing ones       |
| `switch_game_scene` | `scene_path: String` | Replaces the current game scene with a new one                   |
| `add_game_scene`    | `scene_path: String` | Adds an additional game scene (unused in current implementation) |

## Usage Examples

### Emitting Signals

Signals can be emitted from anywhere in the game by accessing the Signal Manager:

```gdscript
# Switch to a new UI scene
SignalManager.switch_ui_scene.emit("uid://your_ui_scene")

# Change player state
SignalManager.player_transition_state.emit(PlayerEnums.PlayerStates.JUMP, {height = 5.0})

# Apply damage to player
SignalManager.hurt_player.emit(10)
```

### Connecting to Signals

To listen for signals, connect a function to the relevant signal:

```gdscript
func _ready():
    SignalManager.hurt_player.connect(_on_player_hurt)

func _on_player_hurt(damage: int):
    print("Player took %d damage" % damage)
    # Process damage logic
```

## Benefits of Using SignalManager

1. **Decoupling** - Systems can communicate without direct references to each other
2. **Flexibility** - New systems can easily hook into existing functionality
3. **Maintainability** - Signal connections are centralized and easier to track
4. **Global Access** - Signals can be emitted or connected from anywhere

## Related Documentation

For specific information about how the Scene Manager and UI Manager use these signals, see the [Scene Management documentation](/fowl_play/gameplay/important-code/scene_manager/).
