---
title: Settings Menu - Key Bindings
description: Key Bindings settings panel for customizing input actions.
lastUpdated: 2025-05-13
author: Sly
---

The `KeyBindingsPanel` is a Control node that provides an interface for managing key bindings in the game. 

It allows users to view and modify the input mappings for various actions, including keyboard, mouse, and controller inputs. The panel is designed to be user-friendly, with clear labels and visual feedback for the current bindings.

## Properties
### Configuration

| Type | Name | Description |
|------|------|-------------|
| String | config_path | Path to the configuration file ("user://settings.cfg") |
| String | config_name | Section name for key bindings in config ("key_bindings") |
| Dictionary[String, float] | key_bindings | Stores key bindings for various actions |

### Node References

| Type | Name | Description |
|------|------|-------------|
| PackedScene | input_button_scene | Preloaded scene for input mapping rows |
| Label | error_text_label | Displays input mapping errors |
| Button | restore_defaults_button | Button to reset all bindings to defaults |
| VBoxContainer | content_container | Container for input mapping rows |

### Navigation

| Type | Name | Description |
|------|------|-------------|
| int | _current_focus_index | Tracks currently focused button index |
| Array[Button] | _focusable_buttons | Array of all focusable buttons in UI |

## Implementation

`ready()` initializes the key bindings panel by calling `_load_input_settings()` to load the current input settings. It sets the mouse filter to stop input events from propagating to lower layers and enables focus mode for all controls.
```gdscript
func _ready():
	# Make this block input to lower layers
	self.mouse_filter = Control.MOUSE_FILTER_STOP
	self.focus_mode = Control.FOCUS_ALL

	# Initial load of saved settings when scene enters tree
	_load_input_settings()
```

`_input()` handles remapping input events. It checks if the settings manager is in remapping mode and processes the input event accordingly. It validates the event type, checks for existing assignments, and updates the input mapping if valid. If not in remapping mode, it checks for the "ui_accept" action to activate the focused button.
```gdscript
func _input(event: InputEvent) -> void:
	if SettingsManager.is_remapping:
		if event is InputEventMouseMotion:
			return

		get_viewport().set_input_as_handled()

		# Validate event type matches input mode
		if not _is_valid_event_for_input_type(event, SettingsManager.input_type):
			error_text_label.text = "Invalid input event for this action"
			return

		# Prevent double-click from being registered
		if event is InputEventMouseButton and event.double_click:
			event = event.duplicate()
			event.double_click = false

		# Check for existing assignments
		if _is_event_already_assigned(event, SettingsManager.action_to_remap):
			error_text_label.text = "Input event already assigned to another action"
			return

		var current_events: Array[InputEvent] = InputMap.action_get_events(SettingsManager.action_to_remap)
		var split_events: Dictionary = _split_events_by_type(current_events)

		# Replace existing binding of same type
		var old_event: InputEvent = _get_event_to_replace(split_events, SettingsManager.input_type)
		if old_event:
			InputMap.action_erase_event(SettingsManager.action_to_remap, old_event)

		InputMap.action_add_event(SettingsManager.action_to_remap, event)
		_finalize_remapping()
	else:

		if Input.is_action_just_pressed("ui_accept"):
			_activate_focused_button()
```

`_save_input_settings()` saves the current input settings to the configuration file. It iterates through all actions in the InputMap and saves their events, excluding built-in UI actions.
```gdscript
func _save_input_settings():
	var config = ConfigFile.new()

	# Skip Godot's built-in UI actions to prevent accidental override
	for action in InputMap.get_actions():
		if action.begins_with("ui_"):
			continue

		config.set_value(config_name, action, InputMap.action_get_events(action))

	config.save(config_path)
```

`_load_input_settings()` loads the input settings from the configuration file. It first loads the default settings from the project settings and then overrides them with the saved configuration. It calls `_create_action_list()` to update the UI with the current bindings.
```gdscript
func _load_input_settings():
	# Load defaults first, then override with saved config
	InputMap.load_from_project_settings()

	SettingsManager.load_settings(get_viewport(),get_window(),config_name)

	_create_action_list()
```

`_create_action_list()` populates the UI with action rows. It clears existing children from the content container and iterates through all actions in the InputMap, creating a row for each action. It uses `_split_events_by_type()` to categorize events and `_set_label_text()` to update the labels for each panel.
```gdscript
func _create_action_list():
	error_text_label.text = ""

	# Clear existing children
	for child in content_container.get_children():
		child.queue_free()

	# Add action rows
	for action in InputMap.get_actions():
		if action.begins_with("ui_") or action in ["cycle_debug_menu", "toggle_console"]:
			continue

		var action_row: Node = input_button_scene.instantiate()
		var split_events: Dictionary = _split_events_by_type(InputMap.action_get_events(action))

		action_row.find_child("Label").text = action
		_set_label_text(action_row, "PrimaryPanel", split_events.primary, action)
		_set_label_text(action_row, "SecondaryPanel", split_events.secondary, action)
		_set_label_text(action_row, "ControllerPanel", split_events.controller, action)

		content_container.add_child(action_row)

	# Setup navigation after creating UI
	_setup_navigation()
```

`_setup_navigation()` initializes the navigation system for the key bindings panel. It creates a grid of focusable buttons based on the remap buttons in the content container. It sets the initial focus to the first button in the grid.
```gdscript
func _setup_navigation():
	_focusable_buttons.clear()
	var grid: Array = _get_button_grid()

	# Flatten grid into focusable buttons array (row-major order)
	for row in grid:
		_focusable_buttons.append_array(row)

	# Set initial focus
	if _focusable_buttons.size() > 0:
		_current_focus_index = 0
		_focusable_buttons[_current_focus_index].grab_focus()
```

`_get_button_grid()` constructs a grid of focusable buttons based on the remap buttons in the content container. It iterates through each row and adds the buttons to the grid.
```gdscript
func _get_button_grid() -> Array:
	var grid: Array = []

	# Build grid of remap buttons per row
	for row in content_container.get_children():
		var row_buttons: Array[Button] = []
		for panel_name in ["PrimaryPanel", "SecondaryPanel", "ControllerPanel"]:
			var panel := row.find_child(panel_name) as RemapPanel
			if panel and panel.button is Button:
				panel.button.focus_mode = Control.FOCUS_ALL
				row_buttons.append(panel.button)
		if row_buttons.size() > 0:
			grid.append(row_buttons)

	# Add restore defaults button as its own row
	if restore_defaults_button is Button:
		restore_defaults_button.focus_mode = Control.FOCUS_ALL
		grid.append([restore_defaults_button])

	return grid
```

`_activate_focused_button()` emits the "pressed" signal for the currently focused button.
```gdscript
func _activate_focused_button():
	var focused := get_viewport().gui_get_focus_owner() as Button
	if focused:
		focused.emit_signal("pressed")
```

`trim_mapping_suffix()` cleans up the display text for input mappings by removing technical suffixes and simplifying controller input formatting. It extracts the button name from parentheses or uses the first word before a space.
```gdscript
func _trim_mapping_suffix(mapping: String) -> String:
	# Clean up display text by removing technical suffixes
	var cleaned: String = mapping.replace(" (Physical)", "")

	# Simplify controller input formatting
	if cleaned.begins_with("Joypad"):
		var start: int = cleaned.find("(")
		var end: int = cleaned.find(")")
		if start != -1 and end != -1:
			# Extract button name from parentheses
			cleaned = cleaned.substr(start + 1, end - start - 1)
		else:
			# Fallback to first word before space
			cleaned = cleaned.substr(0, cleaned.find(" "))

	return cleaned.strip_edges()
```

`is_valid_event_for_input_type()` checks if the input event is valid for the specified input type. It ensures that controller events are only accepted when the remap mode is set to controller.
```gdscript
func _is_valid_event_for_input_type(event: InputEvent, input_type: int) -> bool:
	# Validate controller vs keyboard/mouse input based on remap mode
	match input_type:
		SaveEnums.InputType.CONTROLLER:
			return event is InputEventJoypadButton or event is InputEventJoypadMotion
		_: # Only controller is special, Primary and Secondary can be treated the same
			return event is InputEventMouseButton or event is InputEventKey
```

`_split_events_by_type()` categorizes input events by type, prioritizing primary, secondary, and controller inputs. It returns a dictionary with the categorized events.
```gdscript
func _split_events_by_type(events: Array[InputEvent]) -> Dictionary:
	# Categorize inputs by type with priority: primary > secondary > controller
	var result: Dictionary = {
								 primary = null,
								 secondary = null,
								 controller = null
							 }

	for event in events:
		if event is InputEventJoypadButton or event is InputEventJoypadMotion:
			if not result.controller:
				result.controller = event
		else:
			# Fill primary first, then secondary
			if not result.primary:
				result.primary = event
			elif not result.secondary:
				result.secondary = event

	return result
```

`_is_event_already_assigned()` checks if the input event is already assigned to another action. It iterates through all actions in the InputMap and compares the events.
```gdscript
func _is_event_already_assigned(event: InputEvent, current_action: String) -> bool:
	# Check all actions except current one for duplicate bindings. Also ignore built-in UI actions
	for action in InputMap.get_actions():
		if action == current_action or action.begins_with("ui_") or action in ["cycle_debug_menu", "toggle_console"]:
			continue

		for existing_event in InputMap.action_get_events(action):
			if existing_event.is_match(event):
				return true

	return false
```

`_get_event_to_replace()` retrieves the existing binding slot to replace based on the input type. It returns the corresponding event for primary, secondary, or controller inputs.
```gdscript
func _get_event_to_replace(split_events: Dictionary, input_type: int) -> InputEvent:
	# Get existing binding slot to replace based on input type
	match input_type:
		SaveEnums.InputType.PRIMARY: return split_events.primary
		SaveEnums.InputType.SECONDARY: return split_events.secondary
		SaveEnums.InputType.CONTROLLER: return split_events.controller
		_: return null
```

`_finalize_remapping()` is called after a successful remapping. It updates the input settings and UI, resets the remapping state, and refreshes the action list.
```gdscript
func _finalize_remapping():
	# Update storage and UI after successful remapping
	_save_input_settings()
	SettingsManager.is_remapping = false
	SettingsManager.action_to_remap = ""
	_create_action_list()
```

`_set_label_text()` is a helper function that safely sets the text on labels with a fallback. It updates the button text based on the event type and action to remap.
```gdscript
func _set_label_text(row: Node, container_name: String, event: InputEvent, action_to_remap: String = ""):
	# Helper to safely set text on labels with fallback
	var panel: RemapPanel = row.find_child(container_name)
	if event:
		panel.button.text = _trim_mapping_suffix(event.as_text())
	else:
		panel.button.text = "Unassigned"
	panel.action_to_remap = action_to_remap
```

`_on_restore_defaults_button_up()` is called when the restore defaults button is pressed. It resets all key bindings to their default values, removes the configuration file, and refreshes the action list.
```gdscript
func _on_restore_defaults_button_up() -> void:
	SettingsManager.is_remapping = false
	SettingsManager.action_to_remap = ""

	# Restore default bindings and remove config file
	InputMap.load_from_project_settings()

	if FileAccess.file_exists(config_path):
		DirAccess.remove_absolute(config_path)

	_create_action_list()
```

## Technical Details

The KeyBindingsPanel is designed to be modular and extensible. It allows for easy addition of new input actions and supports multiple input types (keyboard, mouse, controller). The UI is built using Godot's Control nodes, providing a responsive and user-friendly experience. 

### Keyboard/Controller Navigation

The navigation system is implemented using a grid layout, allowing users to easily navigate between input mapping rows. The focus is set to the first button in the grid, and users can use the arrow keys or joystick to move between buttons. The restore defaults button is treated as a separate row in the grid, ensuring it is easily accessible.

### Configuration Persistence

Settings are stored in a configuration file (`user://settings.cfg`) using the `ConfigFile` class. The stored values are:
- **Section**: "key_bindings"
- **Keys**: Input action names (e.g., "MoveForward", "Jump", "Shoot")
- **Values**: Input events (e.g., "W", "Space", "LeftMouseButton")
This allows the game to remember user preferences across sessions.

## Dependencies
- `SettingsManager`: Manages loading and saving settings.
- `RemapPanel`: Custom panel for displaying input mappings.

## Usage

To use the KeyBindingsPanel, you need to add it to the settings menu as PackedScene (see `SettingsMenu`). The panel will automatically load the current key bindings and allow users to adjust them using the buttons. When the user changes a binding, the new mapping is saved to the configuration file.