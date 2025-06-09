---
title: Interval SFX Player
description: Plays random sound effects at intervals with 3D positioning using composition pattern.
lastUpdated: 2025-06-09
author: Tjorn
---

The Interval SFX Player demonstrates how to combine IntervalAudioPlayer with 3D spatial audio to create ambient sound effects that play at random intervals from random positions. This is perfect for environmental audio like distant bird calls, wind effects, or background activity sounds.
This music player is used in the [Poultry Man Menu](/fowl-play/gameplay/user-interface/poultry-man) for the playback of the [ambient sound effects](/fowl-play/art/sound/poultry-man-menu/)

## Design Philosophy

The Interval SFX Player combines scheduled audio with spatial positioning:

1. **Spatial Immersion**: Uses 3D positioning to create believable environmental audio that seems to come from the world around the player.

2. **Composition Pattern**: Leverages IntervalAudioPlayer for timing while adding 3D spatial logic on top.

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

## Code Explanation

This section explains how the composition pattern creates immersive 3D environmental audio.

### Spatial Audio Implementation

#### Why 3D Positioning Matters

The class uses AudioStreamPlayer3D to create spatial audio:

```gdscript
extends AudioStreamPlayer3D
```

**Spatial audio benefits:**

1. **Immersion**: Sounds appear to come from specific locations in the world, enhancing believability.

2. **Natural Volume**: Sounds automatically fade with distance, creating realistic audio falloff.

3. **Directional Audio**: Players can hear which direction sounds are coming from, adding spatial awareness.

4. **Performance**: Godot's 3D audio system efficiently handles positioning and attenuation calculations.

### Dynamic Position Generation

#### Random Positioning Algorithm

Each sound gets a new random position around the player:

```gdscript
var random_angle := randf_range(0, 2 * PI)
var random_distance := randf_range(min_random_distance, max_random_distance)
position = Vector3(
    cos(random_angle) * random_distance,
    cos(random_angle) * random_distance,  # Note: This might be intentional for specific behavior
    sin(random_angle) * random_distance
)
```

**Position calculation breakdown:**

1. **Angle**: Random direction around the player (0 to 2π radians = full circle)
2. **Distance**: Random distance within the specified range
3. **Coordinates**: Converts polar coordinates to 3D Cartesian coordinates

**Note**: The Y-coordinate uses `cos(random_angle)` instead of a separate calculation, which creates specific vertical positioning behavior.

#### Distance Range Configuration

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

### Configuration Strategy

#### Export-Driven Setup

All key parameters are exposed for designer control:

```gdscript
@export var sounds_folder: String = "res://ui/game_menu/art/random_sounds/"
@export var min_random_distance: float = 2.0
@export var max_random_distance: float = 10.0
@export var min_interval: float = 5.0
@export var max_interval: float = 15.0
```

**Designer-friendly benefits:**

1. **Visual Configuration**: Settings are adjustable in the Godot editor
2. **Rapid Iteration**: No code changes needed to test different configurations
3. **Per-Scene Customization**: Different areas can have different ambient audio settings
4. **Clear Documentation**: Export annotations provide built-in documentation

### Integration Patterns

#### Environmental Ambience

```gdscript
# In a forest scene
extends Node3D

@onready var bird_sounds = $BirdSFXPlayer
@onready var wind_sounds = $WindSFXPlayer

func _ready():
    # Birds play more frequently, closer to the player
    bird_sounds.min_interval = 3.0
    bird_sounds.max_interval = 8.0
    bird_sounds.min_random_distance = 5.0
    bird_sounds.max_random_distance = 15.0

    # Wind plays less frequently, from farther away
    wind_sounds.min_interval = 10.0
    wind_sounds.max_interval = 30.0
    wind_sounds.min_random_distance = 10.0
    wind_sounds.max_random_distance = 25.0
```

#### Player-Relative Positioning

Since the position is set each time, the class assumes it's placed relative to the player or camera:

```gdscript
# Typical scene structure:
# Player
# ├── Camera3D
# ├── IntervalSFXPlayer (child of player for relative positioning)
# └── Other player components
```

### Attenuation Considerations

#### AudioStreamPlayer3D Properties

The class inherits all spatial audio properties:

- **Attenuation Model**: How volume decreases with distance
- **Max Distance**: Beyond this distance, sound becomes inaudible
- **Unit DB**: Volume at unit distance (1 meter)

**Important for setup:**

1. **Max Distance**: Should be larger than `max_random_distance` to ensure sounds are audible
2. **Attenuation Curve**: Linear, inverse, or logarithmic falloff affects realism
3. **Unit Volume**: Affects how loud sounds are at close range

### Performance Considerations

#### Position Updates

The class updates position only when playing new audio:

```gdscript
# Position is set per sound, not per frame
position = Vector3(...)
play()
```

**Performance benefits:**

1. **Minimal CPU**: No continuous position updates
2. **Efficient Memory**: Only stores one position per instance
3. **Godot Optimization**: Leverages Godot's optimized 3D audio system

## Tips for Best Results

1. **Configure attenuation carefully** - Set max_distance higher than max_random_distance to ensure all sounds are audible.

2. **Choose appropriate intervals** - Frequent sounds (every 5-15 seconds) work well for active environments, longer intervals for sparse ambience.

3. **Match sound content to distances** - Closer sounds should be more intimate (footsteps, small animals), distant sounds more atmospheric (wind, distant calls).

4. **Test in 3D** - Walk around your scene to ensure the positioning feels natural and immersive.

5. **Consider multiple players** - Use separate players for different types of ambient audio (animals, weather, mechanical sounds).

6. **Group related sounds** - Keep similar ambient sounds in the same folder (all bird sounds together, all wind sounds together).

7. **Test audio falloff** - Ensure the volume curve feels natural as players move around the environment.

8. **Consider player movement** - If the player moves quickly, shorter intervals might be needed to maintain consistent ambience.
