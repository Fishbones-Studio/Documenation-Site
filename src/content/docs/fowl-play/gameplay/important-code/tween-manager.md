---
title: Tween Manager
description: Global tween management system.
lastUpdated: 2025-04-03
author: Sly
---

`TweenManager` is an autoload (singleton) utility class that provides a standardized way for creating and managing tweens. It simplifies tween creation with sensible defaults while maintaining flexibility for custom animations.

### Constants

| Name               | Type                 | Value             | Description                            |
| ------------------ | -------------------- | ----------------- | -------------------------------------- |
| DEFAULT_DURATION   | float                | 0.2               | Default animation duration in seconds  |
| DEFAULT_TRANSITION | Tween.TransitionType | Tween.TRANS_CUBIC | Default transition type for animations |
| DEFAULT_EASE       | Tween.EaseType       | Tween.EASE_OUT    | Default easing function for animations |

### Methods

```gdscript
func create_scale_tween(
	tween: Tween,
	node: Node,
	scale: Variant,
	duration: float = DEFAULT_DURATION,
	transition: Tween.TransitionType = DEFAULT_TRANSITION,
	ease: Tween.EaseType = DEFAULT_EASE
) -> Tween:
	assert(scale is Vector2 or scale is Vector3,
			"Scale must be a Vector2 or Vector3")

	if not tween: tween = node.create_tween()
	tween.tween_property(node, "scale", scale, duration)\
			.set_trans(transition)\
			.set_ease(ease)

	return tween
```

Creates and configures a tween for scaling a Node2D or Node3D and returns the configured tween. If a tween is provided as argument, adds a tween property to the tween. If no tween is provided, creates a new tween instead and binds it to the provided node. Assert is a debug-only way (removed in released builds) to check wether the scale argument is either a Vector2 or Vector3, and if not, pushes an error.

```gdscript
func create_move_tween(
	tween: Tween,
	node: Node,
	axis: String,
	distance: float,
	duration: float = DEFAULT_DURATION,
	transition: Tween.TransitionType = DEFAULT_TRANSITION,
	ease: Tween.EaseType = DEFAULT_EASE
) -> Tween:
	assert(axis.to_lower() in ["x", "y", "z"], "Axis must be 'x', 'y', or 'z'")

	var property := "position:%s" % axis.to_lower()

	if not tween: tween = node.create_tween()
	tween.tween_property(node, property, distance, duration)\
		.set_trans(transition)\
		.set_ease(ease)

	return tween
```

Creates and configures a tween for axis-specific movement for a Node and returns the configured tween. If a tween is provided as argument, adds a tween property to the tween. If no tween is provided, creates a new tween instead and binds it to the provided node. Assert is a debug-only way (removed in released builds) to check wether the axis is correct.

## Usage Examples

**Basic Usage:**

```gdscript
# Create new scale animation
TweenManager.create_scale_tween(null, $Character, Vector2(1.2, 1.2))
```

**Chained Tween:**

```gdscript
var tween = self.create_tween()
# Create new scale animation
TweenManager.create_scale_tween(tween, $Character, Vector2(1.2, 1.2))
TweenManager.create_move_tween(tween, $Character, "y", 200)
TweenManager.create_scale_tween(tween, $Character, Vector2(1.0, 1.0))
```

### Extension Guide

To add new tween types:

- Create new method following existing pattern
- Maintain parameter consistency
- Document default behaviors

```gdscript
func create_rotate_tween(...):
    # Implementation example
    pass
```
