---
title: Signal Manager
description: Global signal management system
lastUpdated: 2025-04-14
author: Tjorn
---

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
signal init_stamina(max_stamina: float, stamina: float)
signal player_stats_changed(stats: LivingEntityStats)
signal player_hurt()
signal player_heal()
# Loader signals
signal switch_ui_scene(scene_path: String, params: Dictionary) ## This signal is used to switch the UI scene, replacing all current
signal add_ui_scene(scene_path: String, params: Dictionary) ## This signal is used to add an (additional) UI scene
signal switch_game_scene(scenscene_pathe: String) ## This signal is used to switch the game scene, replacing all current
signal add_game_scene(scene_path: String) ## This signal is used to add an (additional) game scene
signal settings_menu_toggled(value: bool)

# Enemy signals
signal enemy_transition_state(target_state: EnemyEnums.EnemyStates, information: Dictionary)

# Weapon signals
signal weapon_hit_area_body_entered(body: PhysicsBody3D)
signal weapon_hit_area_body_exited(body: PhysicsBody3D)
signal weapon_hit_target(target: PhysicsBody3D, damage: int)

## Dictionary to store cooldowns for signals
var _cooldowns: Dictionary[StringName, int] = {}


## Throttle function for signals, to prevent spamming
## This function ignores the signal if it is called before the cooldown time has passed
func emit_throttled(signal_name: StringName, args: Array = [], cooldown: float = 0.5) -> void:
	var now: int = Time.get_ticks_msec()
	if now < _cooldowns.get(signal_name, 0):
		return

	_cooldowns[signal_name] = now + int(cooldown * 1000)
	# callv destructures the array and passes it as arguments
	callv("emit_signal", [signal_name] + args)
```

## Available Signals

### Player Signals

| Signal                    | Parameters                                                        | Purpose                              |
| ------------------------- | ----------------------------------------------------------------- | ------------------------------------ |
| `player_transition_state` | `target_state: PlayerEnums.PlayerStates, information: Dictionary` | Triggers player state changes        |
| `init_health`             | `max_health: int, health: int`                                    | Initializes player health values     |
| `init_stamina`            | `max_stamina: float, stamina: float`                              | Initializes player stamina values    |
| `player_stats_changed`    | `stats: LivingEntityStats`                                        | Updates when player stats change     |
| `player_hurt`             | None                                                              | Emitted when player takes damage     |
| `player_heal`             | None                                                              | Emitted when player receives healing |

### Scene Management Signals

| Signal                  | Parameters                               | Purpose                                                      |
| ----------------------- | ---------------------------------------- | ------------------------------------------------------------ |
| `switch_ui_scene`       | `scene_path: String, params: Dictionary` | Replaces all current UI elements with a new UI scene         |
| `add_ui_scene`          | `scene_path: String, params: Dictionary` | Adds an additional UI scene without removing existing ones   |
| `switch_game_scene`     | `scene_path: String`                     | Replaces the current game scene with a new one               |
| `add_game_scene`        | `scene_path: String`                     | Adds an additional game scene without removing existing ones |
| `settings_menu_toggled` | `value: bool`                            | Triggered when settings menu is opened or closed             |

### Enemy Signals

| Signal                   | Parameters                                                      | Purpose                      |
| ------------------------ | --------------------------------------------------------------- | ---------------------------- |
| `enemy_transition_state` | `target_state: EnemyEnums.EnemyStates, information: Dictionary` | Triggers enemy state changes |

### Weapon Signals

| Signal                         | Parameters                           | Purpose                                          |
| ------------------------------ | ------------------------------------ | ------------------------------------------------ |
| `weapon_hit_area_body_entered` | `body: PhysicsBody3D`                | Triggered when a body enters a weapon's hit area |
| `weapon_hit_area_body_exited`  | `body: PhysicsBody3D`                | Triggered when a body exits a weapon's hit area  |
| `weapon_hit_target`            | `target: PhysicsBody3D, damage: int` | Emitted when a weapon successfully hits a target |

## Usage Examples

### Emitting Signals

Signals can be emitted from anywhere in the game by accessing the Signal Manager:

```gdscript
# Switch to a new UI scene with parameters
SignalManager.switch_ui_scene.emit("uid://your_ui_scene", {"level": 2})

# Change player state
SignalManager.player_transition_state.emit(PlayerEnums.PlayerStates.JUMP, {height = 5.0})

# Notify that player was hurt
SignalManager.player_hurt.emit()

# Emit a weapon hit signal
SignalManager.weapon_hit_target.emit(target_body, 25)
```

### Connecting to Signals

To listen for signals, connect a function to the relevant signal:

```gdscript
func _ready():
    SignalManager.player_hurt.connect(_on_player_hurt)
    SignalManager.weapon_hit_target.connect(_on_weapon_hit_target)

func _on_player_hurt():
    print("Player took damage")
    # Process damage logic

func _on_weapon_hit_target(target: PhysicsBody3D, damage: int):
    print("Weapon hit %s for %d damage" % [target.name, damage])
    # Process hit logic
```

### Using Throttled Emission

For signals that might be triggered too frequently, use the throttle function:

```gdscript
# Emit with throttling to prevent spam
SignalManager.emit_throttled("player_hurt", [], 1.0) # Won't emit more than once per second
```

## Benefits of Using SignalManager

1. **Decoupling** - Systems can communicate without direct references to each other
2. **Flexibility** - New systems can easily hook into existing functionality
3. **Maintainability** - Signal connections are centralized and easier to track
4. **Global Access** - Signals can be emitted or connected from anywhere
5. **Throttling** - Built-in mechanism to prevent signal spam

## Related Documentation

For specific information about how the Scene Manager and UI Manager use these signals, see the [Scene Management documentation](/fowl-play/gameplay/important-code/scene-manager/).
