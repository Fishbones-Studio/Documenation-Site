---
title: Control Overview
description: UI item that shows controls for specified actions
lastUpdated: 2025-06-19
author: Tjorn
---

`ControlOverview` is a reusable Godot UI component for dynamically displaying control hints, used in the Training Area. It automatically shows the correct icons and descriptions for each control, and updates them in real time if the player's input device changes (e.g., switching from keyboard to controller).

![Attack Controls](/src/assets/fowl-play/gameplay/user-interface/control-overview/attack.png)
![Movement Controls](/src/assets/fowl-play/gameplay/user-interface/control-overview/movement.png)

## The Code

```gdscript
class_name ControlOverview extends Control

@export var control_text_dict : Dictionary[StringName, String]:
	set(value):
		control_text_dict = value
		_update_control_visuals()

@onready var control_container : GridContainer = %ControlContainer

var _icon_nodes: Dictionary = {}

func _ready() -> void:
	if control_text_dict && !control_text_dict.is_empty() && control_container:
		_update_control_visuals()
	SignalManager.keybind_changed.connect(_on_keybind_changed)

func _on_keybind_changed(keybind : String) -> void:
	var keybind_name: StringName = StringName(keybind)
	if _icon_nodes.has(keybind_name):
		var texture_rect: TextureRect = _icon_nodes[keybind_name]
		var controller_texture_icon := ControllerIconTexture.new()
		controller_texture_icon.path = keybind_name
		texture_rect.texture = controller_texture_icon

func _update_control_visuals() -> void:
	if !control_container:
		return

	for child in control_container.get_children():
		child.queue_free()
	_icon_nodes.clear()

	for keybind_name: StringName in control_text_dict.keys():
		var texture_rect := TextureRect.new()
		var controller_texture_icon := ControllerIconTexture.new()
		controller_texture_icon.path = keybind_name
		texture_rect.texture = controller_texture_icon
		texture_rect.custom_minimum_size = Vector2(48, 48)
		texture_rect.expand_mode = TextureRect.EXPAND_FIT_WIDTH_PROPORTIONAL
		control_container.add_child(texture_rect)
		_icon_nodes[keybind_name] = texture_rect

		var label := Label.new()
		label.text = control_text_dict[keybind_name]
		label.theme_type_variation = "HeaderSmall"
		control_container.add_child(label)

func setup(params: Dictionary) -> void:
	if params.has("control_text_dict"):
		var input_dict: Dictionary = params["control_text_dict"]
		var typed_dict: Dictionary[StringName, String] = {}
		for key in input_dict.keys():
			var string_name_key: StringName = StringName(key)
			var string_value: String = String(input_dict[key])
			typed_dict[string_name_key] = string_value
		control_text_dict = typed_dict
```

## How It Works

- **Dictionary:**  
  The controls and their descriptions are provided via a dictionary (`control_text_dict`). This allows the same UI to be used for different sets of controls in different contexts.

- **Automatic Icon Handling:**  
  For each control, the system uses the [controller_icons](https://github.com/rsubtil/controller_icons/) addon to display the correct icon for the current input device (keyboard, Xbox controller, etc.). If the player switches devices, the icons update automatically.

- **Live Updates:**  
  The component listens for keybind changes (such as when the player remaps controls or switches input devices) and updates the displayed icons accordingly.

## Technical Details

### Initialization

- When the component is ready, it checks if a control dictionary (`control_text_dict`) is set.
  - If so, it populates the UI with the corresponding icons and descriptions.

### Dynamic UI Generation

- For each entry in the dictionary:
  - A `TextureRect` is created to display the control icon.
  - The icon is generated using the `ControllerIconTexture` class from the controller_icons addon, ensuring the correct icon for the current device.
  - A `Label` is created to show the control’s description.
  - Both are added to the `GridContainer` for layout.

### Keybind Change Handling

- The component connects to a global signal (`keybind_changed`).
- When triggered (e.g., by remapping or device change), it updates only the affected icon(s) without rebuilding the entire UI.

### Properties

- `control_text_dict: Dictionary[StringName, String]`  
  The dictionary mapping input action names to their description strings. Setting this property updates the UI.

### Methods

- `setup(params: Dictionary) -> void`  
  Configures the control overview with a new set of controls. Expects a dictionary with a `"control_text_dict"` key.

## Dependencies

- **controller_icons addon:**  
  This addon is required for displaying the correct input device icons.  
  [GitHub: rsubtil/controller_icons](https://github.com/rsubtil/controller_icons/)
