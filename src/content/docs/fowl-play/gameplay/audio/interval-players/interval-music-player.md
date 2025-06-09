---
title: Interval Music Player
description: Plays random music tracks at configurable intervals using composition pattern.
lastUpdated: 2025-06-09
author: Tjorn
---

The Interval Music Player demonstrates how to use the IntervalAudioPlayer as a composition component to create scheduled music playback. Unlike the RandomMusicPlayer, which handles crossfading and complex state management, this player focuses on simple, interval-based music playback suitable for ambient background music.
This music player is used in the [Poultry Man Menu](/fowl-play/gameplay/user-interface/poultry-man) for the playback of the [ambient tracks](/fowl-play/art/music/poultry-man-menu/).

## Design Philosophy

The Interval Music Player showcases the composition pattern with IntervalAudioPlayer:

1. **Composition over Inheritance**: Uses IntervalAudioPlayer as a component rather than extending it, providing clear separation of concerns.

2. **Simple Music Playback**: No crossfading or complex transitions. Each track plays completely before the next begins.

3. **Configurable Timing**: Flexible interval settings allow for both frequent and sparse music playback.

4. **Lightweight Implementation**: Minimal code footprint makes it easy to understand and modify.

## The Code

```gdscript
## Plays a random song from a specified folder at random intervals.
extends AudioStreamPlayer

@export var music_folder: String = "res://ui/game_menu/art/random_music/" ## Folder containing music files
@export var file_extensions: Array[String] = ["ogg", "wav", "mp3"] ## Supported audio formats
@export var min_interval: float = 30.0  ## Minimum time between songs in seconds
@export var max_interval: float = 60.0 ## Maximum time between songs in seconds
@export var avoid_repeats: bool = true ## Avoid playing the same song consecutively


func _ready() -> void:
	var _random_player := IntervalAudioPlayer.new(music_folder, file_extensions, min_interval, max_interval, false, avoid_repeats)
	_random_player.play_audio.connect(_on_play_sound)
	add_child(_random_player)


func _on_play_sound(sound: AudioStream, _sound_name: String) -> void:
	stream = sound
	play()
```

### Composition Pattern Benefits

#### Why Composition Instead of Inheritance?

The class uses composition by creating an IntervalAudioPlayer instance rather than extending it:

```gdscript
var _random_player := IntervalAudioPlayer.new(...)
add_child(_random_player)
```

**Advantages of this approach:**

1. **Clear Responsibility Split**: The IntervalAudioPlayer handles timing and file management, while this class handles audio playback.

2. **Flexible Audio Types**: By extending AudioStreamPlayer instead of IntervalAudioPlayer, this class can be easily adapted for different audio player types.

3. **Easier Testing**: Each component can be tested independently, making debugging simpler.

4. **Reusable Logic**: The same IntervalAudioPlayer instance could drive multiple audio players if needed.

### Signal-Based Communication

#### Loose Coupling Through Signals

The connection between components uses Godot's signal system:

```gdscript
_random_player.play_audio.connect(_on_play_sound)
```

**Why signals are ideal here:**

1. **Decoupling**: The IntervalAudioPlayer doesn't need to know about AudioStreamPlayer specifics.

2. **Flexibility**: Multiple audio players could connect to the same signal for synchronized playback.

3. **Godot Integration**: Leverages Godot's optimized signal system for efficient communication.

4. **Debugging**: Signal connections are visible in the debugger, making the data flow clear.

### Configuration Strategy

#### Export Variables for Direct Control

All configuration is exposed through @export variables:

```gdscript
@export var music_folder: String = "res://ui/game_menu/art/random_music/"
@export var min_interval: float = 30.0
@export var max_interval: float = 60.0
```

**Benefits:**

1. **Designer-Friendly**: Audio settings can be adjusted in the Godot editor without code changes.

2. **Per-Instance Configuration**: Different scenes can have different music timing without separate classes.

3. **Rapid Iteration**: Timing can be tweaked and tested immediately during development.

### Timing Considerations

#### Interval vs Track Length

The class doesn't account for track length in its timing:

```gdscript
# IntervalAudioPlayer waits: interval time + current track length
# This class just plays the provided track
```

**This design choice means:**

1. **Simplicity**: No complex timing calculations in this class.

2. **Predictable Gaps**: There will always be the specified interval between tracks.

3. **Natural Flow**: Longer tracks automatically create longer quiet periods.

### Integration Patterns

#### Menu Music Implementation

```gdscript
# Perfect for menu systems where music should play occasionally
extends Control

@onready var menu_music = $IntervalMusicPlayer

func _ready():
    # Music will start automatically based on IntervalAudioPlayer settings
    pass
```

#### Ambient Background Music

```gdscript
# For exploration games where music should be sparse and atmospheric
extends Node

@onready var ambient_music = $IntervalMusicPlayer

# Configure for very long intervals to create rare, special moments
# min_interval = 300.0  # 5 minutes
# max_interval = 900.0  # 15 minutes
```

### When to Use This vs RandomMusicPlayer

#### Use Interval Music Player when:

- You want gaps of silence between tracks
- Music should feel ambient and non-intrusive
- Simple implementation is preferred over features
- Menu or exploration music is needed
- You don't need crossfading or complex state management

#### Use RandomMusicPlayer when:

- You want continuous music with seamless transitions
- You need pause effects and state-aware audio
- Professional polish and crossfading are important
- The music is a primary part of the experience

### Error Handling

#### Graceful Delegation

The class delegates all error handling to the IntervalAudioPlayer:

```gdscript
# No error handling needed here - IntervalAudioPlayer handles:
# - Missing directories
# - Failed file loads
# - Empty audio collections
```

**This delegation provides:**

1. **Single Source of Truth**: Error handling logic is centralized in IntervalAudioPlayer.

2. **Consistency**: All interval-based players will handle errors the same way.

3. **Maintainability**: Error handling improvements benefit all users of IntervalAudioPlayer.

## Tips for Best Results

1. **Configure appropriate intervals** - For menu music, 30-60 seconds works well. For ambient music, consider 5-15 minutes.

2. **Choose suitable music** - This player works best with self-contained tracks that sound good with gaps between them.

3. **Test the experience** - Play through extended sessions to ensure the timing feels natural.

4. **Consider volume levels** - Since tracks play in isolation, ensure consistent volume across all music files.

5. **Use completion-friendly tracks** - Avoid tracks that end abruptly, as there's no crossfading to smooth transitions.

6. **Group by purpose** - Keep menu music, exploration music, etc. in separate folders for clear organization.

7. **Monitor memory usage** - All tracks are loaded at startup, so avoid putting too many large files in one folder.
