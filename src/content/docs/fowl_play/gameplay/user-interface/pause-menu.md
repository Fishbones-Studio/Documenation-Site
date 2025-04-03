---
title: Pause Menu
description: A menu when the game is paused.
lastUpdated: 2025-04-03
author: Sly
---

Handles game pausing/unpausing and features an animated 3D chicken characters, dynamic button visibility, smooth transitions, and focus handling.

**Key Components:**
- `PauseMenu.gd`: Main controller script
- `pause_menu.tscn`: Scene container

### Properties

| Property	            | Type	            | Description   |
|-----------------------|-------------------|---------------|
| chicken	            | Node3D	        | The 3D chicken character to animate during pause |
| camera	            | Camera3D	        | Game camera to adjust during pause animations |
| footer	            | PanelContainer	| Bottom menu panel that slides in (not used)|
| game_logo_container   | MarginContainer	| Logo container with hover effects |
| paused                | bool              | Controls pause state with setter logic |
| prev_mouse_mode       | Input.MouseMode   | Stores previous mouse mode before pausing |


### UI Elements
**GIF:**
![pause menu](/ui/pause-menu.gif)

| Node      | Type      | Description   |
|-----------|-----------|---------------|
| Resume    | Button    | Unpauses the game |
| Settings  | Button    | Opens the settings ui |
| Quit      | Button	| Returns to main menu|
| Forfeit   | Button    | Forfeits the fight and returns to poultryman menu |

## Core Mechanics

### Pause State Management

```gdscript
var paused: bool:
    set(value):
        paused = value
        visible = value
        get_tree().paused = value
        Input.mouse_mode = Input.MOUSE_MODE_VISIBLE if value else prev_mouse_mode
        if value: 
            get_parent().move_child(self, get_parent().get_child_count() - 1) 
            _set_button_visibility()
```

**Behaviour:**
- Freezes the whole scene tree when paused, except itself. Since this node's process mode is set to `PROCESS_MODE_ALWAYS`, it will never get paused in the scene tree.
- Handles mouse visibility when paused and unpaused.
- Ensures this menu is always on top of other UI's.
- Updates the button visiblity dynamically.

### Input Handling
```gdscript
func _input(event: InputEvent) -> void:
    if Input.is_action_just_pressed("pause"):
        if not paused: 
            prev_mouse_mode = Input.mouse_mode
        paused = not paused
        if paused: 
            _squish_chicken()
            resume_button.grab_focus()
```

**Key Features:**
- Toggles pause on `pause` action in the input mappings. (default key is ESC)
- Preservers the previous mouse mode before entering this node.
- Auto-focuses on the resume button.
- Triggers the 3d chicken animation when entering this node.

## Visual Design
### Color Palette
| Usage                 | Hex           | Sample           |
|-----------------------|---------------|------------------|
| button normal font    | `#bebcbe`     | <span style="background-color:#2E3440; padding: 0.2rem 0.5rem"> Sample </span> |
| button hover font     | `#878085`     | <span style="background-color:#878085; padding: 0.2rem 0.5rem"> Sample </span> |
| button focus font     | `#878085`     | <span style="background-color:#878085; padding: 0.2rem 0.5rem"> Sample </span> |
| button pressed font   | `#eae7dc`     | <span style="background-color:#eae7dc; padding: 0.2rem 0.5rem"> Sample </span> |
| button normal bg      | `transparent` | <span style="background-color:#transparent: color=#bebcbe; padding: 0.2rem 0.5rem"> Sample </span> |
| button hover bg       | `#cccbc7` | <span style="background-color:#cccbc7; color: #878085; padding: 0.2rem 0.5rem"> Sample </span> |
| button focus bg       | `#cccbc7` | <span style="background-color:#cccbc7; color: #878085; padding: 0.2rem 0.5rem"> Sample </span> |
| button pressed bg     | `#262520` | <span style="background-color:#262520; color: #eae7dc; padding: 0.2rem 0.5rem"> Sample </span> |

### Typography
| Element       | Font           |  Size |
|---------------|----------------|-------|
| button        | `Frost Scream` | 36px  |

## Flow
1. Player presses pause button
2. Game freezes (physics/process stops)
3. Menu appears with animation
4. Player selects option
5. Menu closes with animation
6. Game resumes

## Dependencies
- Uses `SignalManager` to switch interfaces
- Uses `TweenManager` for animations