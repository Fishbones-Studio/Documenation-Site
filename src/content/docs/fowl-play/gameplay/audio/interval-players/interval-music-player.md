---
title: Interval Music Player
description: Plays random music tracks at configurable intervals using composition pattern.
lastUpdated: 2025-06-09
author: Tjorn
---

The Interval Music Player demonstrates how to use the [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player) as a composition component to create scheduled music playback. Unlike the [RandomMusicPlayer](/fowl-play/gameplay/audio/random-players/random-audio-player), which handles crossfading and complex state management, this player focuses on simple, interval-based music playback.
This music player is used in the [Poultry Man Menu](/fowl-play/gameplay/user-interface/poultry-man) for the playback of the [ambient tracks](/fowl-play/art/music/poultry-man-menu/).

## Design Philosophy

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

### Composition over Inheritance

The class uses composition by creating an [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player) instance rather than extending it:

```gdscript
var _random_player := IntervalAudioPlayer.new(...)
add_child(_random_player)
```

#### Advantages of Composition

1. **Clear Responsibility Split**: The [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player) handles timing and file management, while this class handles audio playback.

2. **Flexible Audio Types**: By extending AudioStreamPlayer instead of [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player), this class can be easily adapted for different audio player types.

3. **Easier Testing**: Each component can be tested independently, making debugging simpler.

4. **Reusable Logic**: The same [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player) instance could drive multiple audio players if needed.

### Signals

The connection between components uses Godot's signal system:

```gdscript
_random_player.play_audio.connect(_on_play_sound)
```

#### Advantages of Using Signals

This approach provides several benefits:

1. **Decoupling**: The [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-players/interval-audio-player) doesn't need to know about AudioStreamPlayer specifics.

2. **Flexibility**: Multiple audio players could connect to the same signal for synchronized playback.

3. **Godot Integration**: Leverages Godot's signal system for efficient communication.

4. **Debugging**: Signal connections are visible in the debugger, making the data flow clear.

### When to Use

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
