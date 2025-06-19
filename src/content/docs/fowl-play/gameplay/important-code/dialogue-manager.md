---
title: Dialogue Manager Wrapper
description: Custom Dialogue Management System integrated with UIManager
lastUpdated: 2025-06-18
author: Tjorn
---

Our Dialogue Manager is a custom wrapper around the [Godot Dialogue Manager](https://github.com/nathanhoad/godot_dialogue_manager) addon, designed to integrate with our [UI Manager](/fowl-play/gameplay/important-code/ui-manager). This ensures that all dialogue balloons are managed as part of the global UI system, allowing for consistent input blocking, mouse handling, and UI stacking.

> The wrapper replaces the default Dialogue Manager in the autoload, so all parts of the project that use DialogueManager as an autoload automatically benefit from this seamless integration.

## In Short

The `DialogueManagerWrapper` extends the base `DialogueManagerBase` class and overrides the balloon display logic. Instead of instantiating dialogue balloons directly, it delegates their creation and visibility to the `UIManager` using a dedicated UI enum (`UIEnums.UI.DIALOGUE_BALLOON`). This allows dialogue UIs to participate in the same input and focus management as the rest of the game's UI.

**Key features:**

- All dialogue balloons are managed as UI scenes by the `UIManager`.
- Only one dialogue balloon can be active at a time.
- When a dialogue ends, the balloon is hidden/removed via the `UIManager`.
- Fallback to default behavior if the `UIManager` is not available (e.g., in tests).

---

## How It Works

1. **Dialogue Start:**  
   When a dialogue is started (via `show_dialogue_balloon` or similar), the wrapper emits a signal to the `UIManager` to add the `DIALOGUE_BALLOON` UI.
2. **Balloon Instantiation:**  
   The `UIManager` creates or shows the balloon scene and returns the node.
3. **Balloon Setup:**  
   The wrapper calls the balloon's `start()` method, passing in the dialogue resource, title, and any extra game states.
4. **Dialogue End:**  
   When the dialogue ends, the wrapper tells the `UIManager` to hide or remove the balloon, restoring the previous UI state.

## The Code

```gdscript
# DialogueManager.gd Custom Wrapper
## Custom wrapper for the DialogueManager to handle balloon display via UIManager.
extends DialogueManagerBase

func _ready() -> void:
	super._ready()
	dialogue_ended.connect(_on_wrapper_dialogue_ended)


func _prepare_balloon_params(
	resource: DialogueResource, title: String, extra_game_states: Array
) -> Dictionary:
	return {
		"resource": resource,
		"title": title,
		"extra_game_states": extra_game_states,
	}


func _show_balloon_via_manager(
	resource: DialogueResource, title: String, extra_game_states: Array
) -> Node:
	if not is_instance_valid(UIManager):
		push_error(
			"DialogueManagerWrapper: UIManager not available. "
			+ "Falling back to default balloon handling."
		)
		return super.show_dialogue_balloon(resource, title, extra_game_states)

	var existing_balloon = UIManager.ui_list.get(UIEnums.UI.DIALOGUE_BALLOON)
	if is_instance_valid(existing_balloon):
		UIManager.toggle_ui(UIEnums.UI.DIALOGUE_BALLOON)
		await get_tree().process_frame

	SignalManager.add_ui_scene.emit(UIEnums.UI.DIALOGUE_BALLOON, {})
	await get_tree().process_frame

	var balloon_node = UIManager.ui_list.get(UIEnums.UI.DIALOGUE_BALLOON)

	if not is_instance_valid(balloon_node):
		push_error(
			"DialogueManagerWrapper: Dialogue balloon node not found in UIManager "
			+ "after attempting to add."
		)
		return null

	_start_balloon.call_deferred(balloon_node, resource, title, extra_game_states)

	return balloon_node


# Call "start" on the given balloon.
func _start_balloon(balloon: Node, resource: DialogueResource, title: String, extra_game_states: Array) -> void:
	if balloon.has_method(&"start"):
		balloon.start(resource, title, extra_game_states)
	elif balloon.has_method(&"Start"):
		balloon.Start(resource, title, extra_game_states)
	else:
		assert(false, DMConstants.translate(&"runtime.dialogue_balloon_missing_start_method"))

	dialogue_started.emit(resource)
	bridge_dialogue_started.emit(resource)


func _on_wrapper_dialogue_ended(_resource: DialogueResource) -> void:
	var balloon_in_list = UIManager.ui_list.get(UIEnums.UI.DIALOGUE_BALLOON)
	if is_instance_valid(balloon_in_list):
		UIManager.toggle_ui(UIEnums.UI.DIALOGUE_BALLOON)


# Overridden public methods from DialogueManager
func show_example_dialogue_balloon(
	resource: DialogueResource, title: String = "", extra_game_states: Array = []
) -> CanvasLayer:
	return await _show_balloon_via_manager(resource, title, extra_game_states) as CanvasLayer


func show_dialogue_balloon(
	resource: DialogueResource, title: String = "", extra_game_states: Array = []
) -> Node:
	return await _show_balloon_via_manager(resource, title, extra_game_states)


func show_dialogue_balloon_scene(
	_balloon_scene_input,
	resource: DialogueResource,
	title: String = "",
	extra_game_states: Array = []
) -> Node:
	push_warning(
		"DialogueManagerWrapper: `_balloon_scene_input` in "
		+ "show_dialogue_balloon_scene is ignored. Using UIManager's default "
		+ "dialogue balloon (UIEnums.UI.DIALOGUE_BALLOON)."
	)
	return await _show_balloon_via_manager(resource, title, extra_game_states)
```

## Signals

| Signal             | Parameters                   | Description                                     |
| ------------------ | ---------------------------- | ----------------------------------------------- |
| `dialogue_started` | `resource: DialogueResource` | Emitted when a dialogue balloon is created.     |
| `got_dialogue`     | `line: DialogueLine`         | Emitted when a line of dialogue is encountered. |
| `mutated`          | `mutation: Dictionary`       | Emitted when a mutation is encountered.         |
| `dialogue_ended`   | `resource: DialogueResource` | Emitted when the dialogue ends.                 |

---

## Main Methods

### Showing Dialogue Balloons

```gdscript
show_dialogue_balloon(
    resource: DialogueResource,
    title: String = "",
    extra_game_states: Array = []
) -> Node
```

Shows a dialogue balloon via the `UIManager`.

- If a balloon is already open, it toggles it off and on again to reset.
- The balloon is registered as `UIEnums.UI.DIALOGUE_BALLOON` in the `UIManager`.

---

### Showing Example Dialogue Balloons

```gdscript
show_example_dialogue_balloon(
    resource: DialogueResource,
    title: String = "",
    extra_game_states: Array = []
) -> CanvasLayer
```

Same as above, but for the example balloon.

### Showing the Dialogue Balloon Scene

```gdscript
show_dialogue_balloon_scene(
    _balloon_scene_input,
    resource: DialogueResource,
    title: String = "",
    extra_game_states: Array = []
) -> Node
```

**Note:** The `_balloon_scene_input` parameter is ignored.  
Always uses the default balloon registered in the `UIManager` as `UIEnums.UI.DIALOGUE_BALLOON`.

## Internal Methods

### \_show_balloon_via_manager

Handles the logic of showing a dialogue balloon through the `UIManager`:

- Emits `SignalManager.add_ui_scene` for `UIEnums.UI.DIALOGUE_BALLOON`.
- Waits for the UIManager to instantiate and return the balloon node.
- Calls the balloon's `start()` method with the dialogue parameters.

If the `UIManager` is not available, falls back to the default balloon handling from the base class.

### \_on_wrapper_dialogue_ended

When the dialogue ends, this method toggles the dialogue balloon UI off via the `UIManager`, ensuring proper cleanup and restoration of previous UI state.

## Example Usage

```gdscript
# Start a dialogue using the wrapper (from anywhere in your game)
DialogueManager.show_dialogue_balloon(my_dialogue_resource, "start")
```

The balloon will be managed by the `UIManager`, blocking input and showing the mouse as needed. When the dialogue ends, the balloon is hidden and the previous UI (e.g., HUD) is restored.

## Notes

- **Only one dialogue balloon can be active at a time.** If a new dialogue starts while one is open, the old one is toggled off and replaced.
- **UIManager integration is required.** If the `UIManager` is not present, the wrapper falls back to the default behavior.

## See Also

- [Godot Dialogue Manager (Addon)](https://github.com/nathanhoad/godot_dialogue_manager#documentation)
