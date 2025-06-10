---
title: Interval SFX Player
description: Plays random sound effects at intervals with 3D positioning using composition pattern.
lastUpdated: 2025-06-09
author: Tjorn
---

The Interval SFX Player demonstrates how to combine [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player) with 3D spatial audio to create ambient sound effects that play at random intervals from random positions. This is perfect for environmental audio like distant bird calls, wind effects, or background activity sounds.
This music player is used in the [Poultry Man Menu](/fowl-play/gameplay/user-interface/poultry-man) for the playback of the [ambient sound effects](/fowl-play/art/sound/poultry-man-menu/)

## Design Philosophy

The Interval SFX Player combines scheduled audio with spatial positioning:

1. **Spatial Immersion**: Uses 3D positioning to create believable environmental audio that seems to come from the world around the player.

2. **Composition Pattern**: Leverages [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player) for timing while adding 3D spatial logic on top.

3. **Dynamic Positioning**: Each sound plays from a different random position, creating variety and realism.

4. **Environmental Audio**: Designed for ambient sounds that enhance atmosphere without being intrusive.

## The Code

```gdscript
## Plays a random sound effect from a specified folder at random intervals.
extends AudioStreamPlayer3D

@export var sounds_folder: String = "res://ui/game_menu/art/random_sounds/" ## Folder containing sound effect files
@export var min_random_distance: float = 2.0 ## Minimum distance from the player in 3D space
@export var max_random_distance: float = 10.0 ## Maximum distance from the player in 3D space
@export var file_extensions: Array[String] = ["ogg", "wav", "mp3"] ## Supported audio formats
@export var min_interval: float = 5.0 ## Minimum time between sound effects in seconds
@export var max_interval: float = 15.0 ## Maximum time between sound effects in seconds
@export var avoid_repeats: bool = true ## Avoid playing the same sound consecutively


func _ready() -> void:
	var _random_player := IntervalAudioPlayer.new(sounds_folder, file_extensions, min_interval, max_interval, true, avoid_repeats)
	_random_player.play_audio.connect(_on_play_sound)
	add_child(_random_player)


func _on_play_sound(sound: AudioStream, _sound_name: String) -> void:
	stream = sound
	# Set random position in 3D space
	var random_angle := randf_range(0, 2 * PI)
	var random_distance := randf_range(min_random_distance, max_random_distance)
	position = Vector3(
		cos(random_angle) * random_distance,
		cos(random_angle) * random_distance,
		sin(random_angle) * random_distance
	)
	play()
```

### Spatial Positioning

The class uses AudioStreamPlayer3D to create spatial audio:

```gdscript
extends AudioStreamPlayer3D
```

#### Benefits of 3D Audio

1. **Immersion**: Sounds appear to come from specific locations in the world, enhancing believability.

2. **Natural Volume**: Sounds automatically fade with distance, creating realistic audio falloff.

3. **Directional Audio**: Players can hear which direction sounds are coming from, adding spatial awareness.

### Randomized positioning

Each sound gets a new random position:

```gdscript
var random_angle := randf_range(0, 2 * PI)
var random_distance := randf_range(min_random_distance, max_random_distance)
position = Vector3(
    cos(random_angle) * random_distance,
    cos(random_angle) * random_distance,
    sin(random_angle) * random_distance
)
```

#### Position Calculation

This calculation uses polar coordinates to determine a random position in 3D space relative to the player:

1. **Angle**: Random direction
2. **Distance**: Random distance within the specified range

**Note**: The Y-coordinate uses `cos(random_angle)` instead of a separate calculation, which means all audio will come from the same height level as the player.

#### Distance Range

The configurable distance range provides control over audio placement:

```gdscript
@export var min_random_distance: float = 2.0
@export var max_random_distance: float = 10.0
```

**Why configurable distances matter:**

1. **Audible Range**: Ensures sounds aren't too close (jarring) or too far (inaudible)
2. **Game Scale**: Different games need different audio ranges based on their world scale
3. **Performance**: Closer sounds require more audio processing, distant sounds can be simplified
4. **Design Intent**: Horror games might want closer sounds, while open-world games might prefer distant ambient audio

### Composition Benefits

#### Clean Separation of Concerns

The class splits responsibilities clearly:

```gdscript
# IntervalAudioPlayer handles:
# - File loading and management
# - Timing and scheduling
# - Audio selection and repeat avoidance

# This class handles:
# - 3D positioning
# - Spatial audio playback
# - Distance-based configuration
```

**This separation provides:**

1. **Maintainability**: Each component has a single, clear purpose
2. **Reusability**: The IntervalAudioPlayer can be used with other audio players
3. **Testing**: Each component can be tested independently
4. **Flexibility**: Easy to modify positioning logic without affecting timing

### Attenuation Considerations

The class inherits all spatial audio properties:

- **Attenuation Model**: How volume decreases with distance
- **Max Distance**: Beyond this distance, sound becomes inaudible
- **Unit DB**: Volume at unit distance (1 meter)

### Important notes on Attenuation

1. **Max Distance**: Should be larger than `max_random_distance` to ensure sounds are audible
2. **Attenuation Curve**: Linear, inverse, or logarithmic falloff affects realism
3. **Unit Volume**: Affects how loud sounds are at close range
