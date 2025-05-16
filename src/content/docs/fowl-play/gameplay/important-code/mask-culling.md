---
title: Culling
description: Script for setting visual layer to child nodes
lastUpdated: 2025-04-14
author: Tjorn
---

This script is used to add a specified Visual Layer to all compatible 3D child nodes of a parent node in Godot. Visual Layers are used to control which objects are visible to specific cameras or effects, allowing for selective rendering and isolation of scene elements.

### Features

- **Layer Selection:** Choose which visual layer (1–20) to add to child nodes.
- **Recursive Application:** Optionally apply the layer to all descendants, not just direct children.
- **Compatibility:** Only nodes inheriting from `VisualInstance3D` are affected.
- **Non-destructive:** The specified layer is added on top of any existing layers, preserving previous settings.
- **Debug Output:** Prints the result for each affected node for easy verification.

### Parameters

- `layer_to_add` (`int`, 1–20): The visual layer number to add to each applicable child node.
- `recursive` (`bool`): If `true`, applies the layer to all descendants; if `false`, only direct children are affected.

### How It Works

1. On ready, the script validates the chosen layer number.
2. It calculates the bitmask for the selected layer.
3. It iterates through the children (or all descendants if recursive), adding the layer to each compatible node.

### Code

Use this script as a child of any `Node3D` to automatically set visual layers for its children, such as isolating a player model for a subviewport camera.

```gdscript
## Script to add Visual Layer to all applicable child nodes,
## optionally recursively.
extends Node3D

# Export the layer *number* (1 to 20) you want to ADD to the children.
@export_range(1, 20) var layer_to_add : int = 1
# If true, applies the layer to all descendants. If false, only direct children.
@export var recursive := false

func _ready():
	# Validate the input layer number just in case
	if layer_to_add < 1 or layer_to_add > 20:
		printerr(
			"Invalid layer_to_add specified: ",
			layer_to_add,
			". Must be between 1 and 20."
		)
		return

	# Calculate the bitmask value for the specified layer number.
	var layer_bitmask = 1 << (layer_to_add - 1)

	if recursive:
		# Start the recursive process from this node's children
		for child in get_children():
			_apply_layer_recursively(child, layer_bitmask)
	else:
		# Apply only to direct children
		for child in get_children():
			_apply_layer_to_node(child, layer_bitmask)


# Helper function to apply the layer to a single node if applicable
func _apply_layer_to_node(node: Node, layer_bitmask: int) -> void:
	# Check if the node inherits from VisualInstance3D
	if node is VisualInstance3D:
		var visual_instance = node as VisualInstance3D
		# Use the bitwise OR operator (|) to add the new layer's bit
		visual_instance.layers = visual_instance.layers | layer_bitmask
		# Print the result for debugging
		print(
			"Node '",
			visual_instance.name,
			"' layers set to: ",
			visual_instance.layers
		)


# Recursive function to apply the layer to a node and all its descendants
func _apply_layer_recursively(node: Node, layer_bitmask: int) -> void:
	# Apply the layer to the current node first
	_apply_layer_to_node(node, layer_bitmask)

	# Then, recurse into this node's children
	for child in node.get_children():
		_apply_layer_recursively(child, layer_bitmask)
```

## Example Usage

This script is used in the chicken player model scene (`chicken_player.tscn`) to ensure the player model is only visible to a specific camera in the HUD.  
In the [player hud](/fowl-play/gameplay/user-interface/player-hud), a subviewport camera is set up to render only objects on visual layer 2.  
By attaching this script to the player model and setting `layer_to_add` to `2`, the player model is isolated from the main scene and rendered exclusively in the HUD's subviewport.  
This allows for effects such as animated player icons, damage/heal feedback, and custom shaders, without affecting the main game view.

**Typical setup:**

- Attach this script to the root node of the player model.
- Set `layer_to_add` to `2`.
- Enable `recursive` if the model has nested meshes.
- The subviewport camera in the HUD is configured to only render layer 2.

See the [Player Hud documentation](/fowl-play/gameplay/user-interface/player-hud) for more details on the subviewport and camera configuration.
