---
title: Settings Menu
description: Settings Menu with sidebar navigation and dynamic content Loading.
lastUpdated: 2025-05-13
author: Sly
---

The `SettingsMenu` is a Control node that provides a settings interface with a sidebar navigation system. It allows users to access different settings categories (Controls, Key Bindings, Graphics, Audio, and optionally Cheat in debug mode) and displays the corresponding settings panel in the main content area.

## Properties
### Node References

| Type	| Name	| Description |
|-------|-------|-------------|
| Label	| settings_label |	Displays the current settings category in the header |
| Control | content	| Container for the active settings panel |
| Button | controls	| Button for Controls settings |
| Button | key_bindings	| Button for Key Bindings settings |
| Button | graphics	| Button for Graphics settings |
| Button | audio	| Button for Audio settings |
| Button | cheat	| Button for Cheat settings (only in debug builds) |
| VBoxContainer	| sidebar_container | Container for the sidebar navigation items |

### Preloaded Scenes

| Type | Name |	Description |
|------|------|-------------|
| PackedScene | controls_menu |	Scene for Controls settings panel |
| PackedScene | keybinds_menu |	Scene for Key Bindings settings panel |
| PackedScene | graphics_menu |	Scene for Graphics settings panel |
| PackedScene | audio_menu | Scene for Audio settings panel |
| PackedScene | cheat_menu | Scene for Cheat settings panel |

## Implementation
`ready()` connects the `focus_entered` signal of the sidebar buttons to the `_on_sidebar_focus_entered` function, which initializes the settings based on the focused sidebar item. It also removes the cheat menu if the game is not run in debug mode and sets the initial focus to the Controls button in the sidebar.
```gdscript
func _ready() -> void:
	for item: SiderBarItem in sidebar_container.get_children():
		item.focus_entered.connect(_on_sidebar_focus_entered.bind(item))

	# Remove cheat menu if not in debug
	if not OS.has_feature("debug"):
		cheat.queue_free()

	controls.grab_focus()
```
`_input()` handles input events, specifically checking for the pause action or cancel action. If either is pressed and the previous UI was the pause menu, it calls `_on_close_button_pressed()` to close the settings menu and restore focus to the pause menu.
```gdscript
func _input(_event: InputEvent) -> void:
	# Remove settings menu, and make pause focusable again, if conditions are true
	if (Input.is_action_just_pressed("pause") \
	or Input.is_action_just_pressed("ui_cancel") ) \
	and UIManager.previous_ui == UIManager.ui_list.get(UIEnums.UI.PAUSE_MENU):
		_on_close_button_pressed()
```
The `_on_sidebar_focus_entered()` function is called when a sidebar item is focused. It sets the active state of the sidebar items and updates the content area with the corresponding settings panel.
```gdscript
func _on_sidebar_focus_entered(sidebar_item: SiderBarItem) -> void:
	for item: SiderBarItem in sidebar_container.get_children():
		item.active = item == sidebar_item

	_update_content(sidebar_item)
```
`on_close_button_pressed()` is called when the close button is pressed. It removes the settings menu from the UI stack and restores focus to the pause menu if in pause menu.
```gdscript
func _on_close_button_pressed() -> void:
	UIManager.remove_ui(self)
	UIManager.handle_pause() # Close
	UIManager.handle_pause() # Open, so resume button focuses again.
	UIManager.get_viewport().set_input_as_handled()
```
The `_update_content()` function is responsible for updating the content area with the appropriate settings panel based on the selected sidebar item. It removes any existing children from the content area and instantiates the corresponding settings panel.
```gdscript
func _update_content(sidebar_item: SiderBarItem) -> void:
	for child in content.get_children():
		content.remove_child(child)

	match sidebar_item:
		controls:
			content.add_child(controls_menu.instantiate())
		key_bindings:
			content.add_child(keybinds_menu.instantiate())
		graphics:
			content.add_child(graphics_menu.instantiate())
		audio:
			content.add_child(audio_menu.instantiate())
		cheat:
			content.add_child(cheat_menu.instantiate())

	settings_label.text = "Settings / " + _format_text(sidebar_item.name)
```

`_format_text()` is a helper function that formats the sidebar item name to improve readability. It adds spaces before capital letters that are not at the start or after an existing space.`
```gdscript
# Add space before capital letters that aren't at start or after existing space
func _format_text(text: String) -> String:
	var result: String = ""

	for i in range(text.length()):
		var character = text[i]

		if character == character.to_upper() and i > 0 and text[i-1] != " ":
			result += " "

		result += character

	return result
```
Formats the text by adding spaces before capital letters that are not at the start or after an existing space. This is used to improve the readability of the settings category names.

## Example Scene Structure
```plaintext
├── sidebar_container (VBoxContainer)
│   ├── controls (SiderBarItem)
│   ├── key_bindings (SiderBarItem)
│   ├── graphics (SiderBarItem)
│   ├── audio (SiderBarItem)
│   └── cheat (SiderBarItem)
└── content (Control)
```
This structure represents the sidebar navigation and the content area where the settings panels will be displayed. Each SiderBarItem corresponds to a specific settings category, and the content area will dynamically load the appropriate panel based on user selection.

## Dependencies
- UIManager: The SettingsMenu relies on the UIManager to handle the opening and closing of the menu, as well as managing the UI stack.
- SiderBarItem: Each sidebar item is an instance of the SiderBarItem class, which handles the visual representation and interaction logic for the sidebar navigation.

## Usage
To use the SettingsMenu, you need to add it to your scene using the UIManager. The sidebar items should be set up as SiderBarItem nodes, and the corresponding settings panels should be preloaded as PackedScene resources. The menu can be opened from the pause menu or any other UI element that requires access to the game settings.

## Conclusion
The SettingsMenu provides a user-friendly interface for configuring game settings. With its sidebar navigation and dynamic content loading, players can easily access and modify their preferences. The implementation is designed to be flexible and extensible, allowing for future additions or modifications to the settings categories.

<!-- No Controller Support yet -->