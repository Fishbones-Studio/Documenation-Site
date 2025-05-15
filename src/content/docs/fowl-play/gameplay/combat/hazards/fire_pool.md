---
title: Fire Pool
description: Fire Pool Hazard
lastUpdated: 2025-05-15
author: Tjorn
---

The Fire Pool hazards are a temporary hazard spawned by the [slingshot](/fowl-play/gameplay/combat/ranged-combat/weapons/slingshot). They are a type of [bleed hazard](/fowl-play/gameplay/combat/hazards/base_hazards/#bleed-hazard)

<!-- TODO: link visual shader docs once created -->

## Code

```gdscript
extends BleedHazard

@export var alive_time : float = 3.0

@onready var remove_timer : Timer = $RemoveTimer
@onready var audio_stream_player : AudioStreamPlayer3D = $AudioStreamPlayer3D

func _ready() -> void:
	var audio_length = audio_stream_player.stream.get_length()
	var max_start = max(audio_length - alive_time, 0.0)
	var start_position = randf_range(0.0, max_start)
	audio_stream_player.seek(start_position)
	audio_stream_player.play()
	remove_timer.start(alive_time)

func _on_remove_timer_timeout():
	audio_stream_player.stop()
	erase_invalid_bodies()
	queue_free()
```

The Fire Pool removes itself after a set duration.

## Stats

| Stat            | Value |
| --------------- | ----- |
| Alive Time      | 3s    |
| Damage Interval | 1.0s  |
| Damage Duration | 5.0s  |

Its damage value is set by the slingshot.
