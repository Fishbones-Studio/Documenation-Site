---
title: Random Audio Player
description: Audio player that plays random audio files in a folder.
lastUpdated: 2025-04-07
author: Tjorn
---

The Random Audio Player is a versatile audio playback system designed to play random audio files from a specified folder. It can be used for background music, sound effects, or any other audio that needs to be played at random intervals. The player is designed to be flexible and easy to use, making it suitable for various applications in the game. _The player is unsuitable for applications where songs need to be played in a specific order or need to loop._

## The Core

At the heart of everything is the `RandomAudioPlayer` class. This handles loading audio files, picking them at random, and scheduling playback. It also emits a signal when it's time to play a sound, allowing connection to actual `AudioStream` (and variant) nodes:

```gdscript
## Base class for random audio playback functionality
class_name RandomAudioPlayer
extends Node

## Signal to notify the player to start playing the audio
signal play_audio(sound: AudioStream, sound_name: String)

var audio_folder: String
var file_extensions: Array[String]
var min_interval: float
var max_interval: float
var avoid_repeats: bool
var start_playing: bool

var available_audio: Array[AudioStream] = []
var current_index: int = -1
var _timer: Timer

func _init(_audio_folder : String, _file_extentions : Array[String] = ["ogg", "wav", "mp3"], _min_interval : float = 5.0, _max_interval: float = 15.0, _start_playing : bool = true,  _avoid_repeats : bool = true) -> void:
    audio_folder = _audio_folder
    file_extensions = _file_extentions
    min_interval = _min_interval
    max_interval = _max_interval
    avoid_repeats = _avoid_repeats
    start_playing = _start_playing

    _load_audio_files()

func _ready() -> void:
    _setup_timer()
    if available_audio.size() > 0:
        # Start playing immediately if start_playing is true
        if start_playing:
            _play_random_audio()
        else:
            # Start the timer without playing immediately
            _timer.start(randf_range(min_interval, max_interval))
    else:
        push_warning("No audio files found in: %s" % audio_folder)

func get_current_audio_name() -> String:
    if current_index >= 0 and current_index < available_audio.size():
        return available_audio[current_index].resource_path.get_file().get_basename()
    return ""

func _load_audio_files() -> void:
    var dir := DirAccess.open(audio_folder)
    if dir:
        dir.list_dir_begin()
        var file_name: String = dir.get_next()
        while file_name != "":
            if not dir.current_is_dir() and file_name.get_extension() in file_extensions:
                var audio = load(audio_folder.path_join(file_name))
                if audio is AudioStream:
                    available_audio.append(audio)
            file_name = dir.get_next()
    else:
        push_error("Could not open audio directory: %s" % audio_folder)

func _setup_timer() -> void:
    _timer = Timer.new()
    add_child(_timer)
    _timer.timeout.connect(_play_random_audio)

func _play_random_audio() -> void:
    if available_audio.size() == 0:
        return

    print("Playing random audio")

    # Select next audio ensuring no immediate repeats if avoid_repeats is true
    var next_index := current_index
    if available_audio.size() > 1 and avoid_repeats:
        while next_index == current_index:
            next_index = randi() % available_audio.size()

    current_index = next_index
    var audio := available_audio[current_index]

    # Custom playback implementation in child classes
    play_audio.emit(audio, get_current_audio_name())

    # Schedule next playback
    _schedule_next_playback(audio)


func _schedule_next_playback(audio : AudioStream) -> void:
    var interval := randf_range(min_interval, max_interval)
    _timer.start(interval + audio.get_length()) # Wait until current audio ends + random interval
```

### How It Works

What's great about this system is its simplicity. Point it to a folder with audio files, and it handles the rest. Here's what's happening under the hood:

1. It scans a folder for audio files (ogg, wav, mp3).
2. It loads them all into memory (so keep folder sizes reasonable).
3. It picks files at random.
   - It avoids repetition if specified. This is done by keeping track of the last played file and ensuring the next one is different.
     - This means that if there are only two files in the folder, it will play them back to back.
4. Between the sounds, it waits for a random interval (between `min_interval` and `max_interval` seconds) before playing the next one.
   - This is done by using a timer that adds the current sound's length to the randomly chosen interval. Effectively, this means that the next sound will be played after a random interval, plus the length of the current sound.
     - If the current sound is 5 seconds long, and the random interval is 10 seconds, the next sound will be played after 15 seconds.

The base class doesn't actually play audio itself. It emits a signal with the required information, which can be connected to any `AudioStream` or `AudioStreamPlayer` node. This uses composition instead of inheritance, since the different audio players have different parents.

## Random Music Player

This plays audio files from a specified folder at random intervals, using `AudioStreamPlayer`. This means the audio is coming from a fixed position, not a 2D or 3D space. This is perfect for music playback or sound effects that don't need to be spatialized:

```gdscript
## Plays a random song from a specified folder at random intervals.
extends AudioStreamPlayer

@export var music_folder: String = "res://ui/game_menu/art/random_music/" ## Folder containing music files
@export var file_extensions: Array[String] = ["ogg", "wav", "mp3"] ## Supported audio formats
@export var min_interval: float = 30.0  ## Minimum time between songs in seconds
@export var max_interval: float = 60.0 ## Maximum time between songs in seconds
@export var avoid_repeats: bool = true ## Avoid playing the same song consecutively


func _ready() -> void:
    var _random_player := RandomAudioPlayer.new(music_folder, file_extensions, min_interval, max_interval, false, avoid_repeats)
    _random_player.play_audio.connect(_on_play_sound)
    add_child(_random_player)


func _on_play_sound(sound: AudioStream, sound_name: String) -> void:
    print("Playing music: ", sound_name)
    stream = sound
    play()
```

This is perfect for menu screens or ambient background music. Just tweak the intervals to your liking - longer breaks work well for background music, shorter ones for more continuous play.

## Random Sound Player

This plays audio files from a specified folder at random intervals, using `AudioStreamPlayer3D`. This means the audio is coming from a 3D position in space. This is perfect for sound effects that need to be spatialized, but where the exact position doesn't matter, like ambient sounds:

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
    var _random_player := RandomAudioPlayer.new(sounds_folder, file_extensions, min_interval, max_interval, true, avoid_repeats)
    _random_player.play_audio.connect(_on_play_sound)
    add_child(_random_player)

func _on_play_sound(sound: AudioStream, sound_name: String) -> void:
	print("Playing sound: ", sound_name)
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

## Tips for Best Results

1. **Group similar sounds together** - Organize sounds by type or purpose to make them easier to manage and ensure consistent playback.
2. **Keep file counts reasonable** - 5-10 variations are usually enough for most purposes. Adding too many variations worsens performance and can make it harder to find specific sounds later on.
3. **Match volumes carefully** - Big volume differences between files can break immersion.
4. **Use descriptive filenames** - This helps with debugging and makes it easier to find specific sounds later on.
