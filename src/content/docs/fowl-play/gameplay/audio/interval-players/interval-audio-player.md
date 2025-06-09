---
title: Interval Audio Player
description: Audio player that plays random audio files in a folder, at a random configurable interval.
lastUpdated: 2025-06-09
author: Tjorn
---

The Interval Audio Player is an audio playback class designed to play random audio files from a specified folder, at a random interval. It can be used for background music, sound effects, or any other audio that needs to be played at random intervals. This means the player is _unsuitable for applications where songs need to be played in a specific order or need to loop._

## Design Philosophy

The IntervalAudioPlayer is built around several key principles:

1. **Separation of Concerns**: The base class handles timing, file loading, and selection logic, while audio playback is delegated to child classes through signals. This allows for different playback implementations (2D audio, 3D positional audio, etc.) without duplicating the core functionality.

2. **Robust Error Handling**: The system gracefully handles missing files, empty directories, and loading failures to prevent crashes in production.

3. **Performance Optimization**: Audio files are loaded once during initialization and cached, avoiding repeated disk I/O during gameplay.

## The Code

```gdscript
## Base class for random audio playback functionality
class_name IntervalAudioPlayer
extends Node

## signal to notify the player to start playing the audio
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


func _init(
	_audio_folder: String,
	_file_extensions: Array[String] = ["ogg", "wav", "mp3"],
	_min_interval: float = 5.0,
	_max_interval: float = 15.0,
	_start_playing: bool = true,
	_avoid_repeats: bool = true
) -> void:
	audio_folder = _audio_folder
	file_extensions = _file_extensions
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
		var audio_stream: AudioStream = available_audio[current_index]
		if audio_stream != null and audio_stream.resource_path != "":
			return audio_stream.resource_path.get_file().get_basename()
	return ""


func _load_audio_files() -> void:
	available_audio.clear()

	if not DirAccess.dir_exists_absolute(audio_folder):
		push_error(
			"Audio directory does not exist or is not accessible: %s"
			% audio_folder
		)
		return

	var file_names_in_folder: PackedStringArray = ResourceLoader.list_directory(
		audio_folder
	)

	if file_names_in_folder.is_empty():
		push_warning(
			"Audio directory '%s' is empty or contains no files recognized by ResourceLoader."
			% audio_folder
		)

	for file_name in file_names_in_folder:
		var extension: String = file_name.get_extension().to_lower()
		if extension in file_extensions:
			var resource_path: String = audio_folder.path_join(file_name)
			var audio: AudioStream = ResourceLoader.load(
				resource_path,
				"AudioStream",
				ResourceLoader.CACHE_MODE_REUSE
			)

			if audio != null:
				available_audio.append(audio)
			else:
				push_warning(
					"Could not load '%s' as AudioStream, even though it was listed and matched extension."
					% resource_path
				)

	if available_audio.is_empty() and not file_names_in_folder.is_empty():
		push_warning(
			"No loadable audio files with extensions %s found in '%s', despite files being present."
			% [str(file_extensions), audio_folder]
		)


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
	else: # If only one audio or repeats are allowed
		next_index = randi() % available_audio.size()

	current_index = next_index
	var audio: AudioStream = available_audio[current_index]

	# Custom playback implementation in child classes
	play_audio.emit(audio, get_current_audio_name())

	# Schedule next playback
	_schedule_next_playback(audio)


func _schedule_next_playback(audio: AudioStream) -> void:
	var interval := randf_range(min_interval, max_interval)
	if audio != null: # Ensure audio is valid before getting length
		_timer.start(interval + audio.get_length()) # Wait until current audio ends + random interval
	else:
		_timer.start(interval) # Fallback if audio is somehow null
		push_warning("Attempted to schedule playback with a null AudioStream.")
```

### Class Design Decisions

#### Extending Node

The class extends `Node` rather than `AudioStreamPlayer` for several important reasons:

1. **Flexibility**: By not inheriting audio playback functionality, the class can be used with any type of audio player (AudioStreamPlayer, AudioStreamPlayer2D, AudioStreamPlayer3D) through child classes.

2. **Separation of Responsibilities**: The base class focuses purely on timing, file management, and selection logic. Audio playback is delegated through signals, allowing for specialized implementations.

3. **Scene Hierarchy Freedom**: As a plain Node, it can be placed anywhere in the scene tree without affecting existing audio setups or creating conflicts with other AudioStreamPlayer nodes.

#### Signals

The `play_audio` signal is emitted instead of playing audio directly, so:

1. **Delegation Pattern**: Child classes can implement different playback strategies (2D positional audio, 3D spatial audio, with effects, etc.) without modifying the core logic.

2. **Loose Coupling**: The timing logic doesn't need to know how audio is played, making the system more modular and testable.

3. **Extensibility**: New playback behaviors can be added by connecting additional handlers to the signal.

### Performance Considerations

#### Front-Loading Audio Files

Audio files are loaded during `_init()` rather than on-demand, because:

1. **Smooth Gameplay**: Avoids hitches during gameplay when audio needs to be played.
2. **Predictable Memory Usage**: All audio is loaded upfront, making memory requirements clear.
3. **Error Detection**: Loading failures are discovered immediately during initialization, not during gameplay.

#### Resource Caching Strategy

The code uses `ResourceLoader.CACHE_MODE_REUSE`, because:

1. **Memory Efficiency**: Prevents loading the same audio file multiple times if used across different IntervalAudioPlayer instances.
2. **Consistency**: Ensures all instances reference the same AudioStream object for identical files.
3. **Godot Integration**: Works with Godot's resource management system for automatic cleanup.

### Error Handling Philosophy

#### Graceful Degradation

The class uses warnings instead of errors in many cases:

1. **Partial Success**: If some audio files fail to load, the system continues with the files that did load successfully.
2. **Production Stability**: Missing audio files won't crash the game, they'll just result in less variety.
3. **Development Feedback**: Warnings provide clear feedback about issues without locking the game.

#### Defensive Programming

Multiple validation checks prevent runtime errors:

1. **Directory Existence**: Checked before attempting to read files.
2. **Array Bounds**: Current index is validated before accessing the audio array.
3. **Null Checks**: Audio streams are validated before use.

### Timing and Scheduling Logic

#### Waiting for Audio to Finish

The `_schedule_next_playback()` function waits for the current audio to complete plus a random interval:

1. **No Overlap**: Prevents multiple audio files from playing simultaneously and creating noise.
2. **Natural Spacing**: Creates realistic gaps between sounds, mimicking how ambient sounds occur in real-life.
3. **Predictable Behavior**: Users can count on audio not cutting each other off unexpectedly.

#### Repeat Avoidance

The repeat avoidance logic prevents the same audio from playing twice in a row when multiple files are available:

1. **Natural Randomness**: True randomness can feel unnatural when the same sound repeats immediately.
2. **Better User Experience**: Provides more apparent variety in the audio playback.
3. **Configurable**: Can be disabled for cases where immediate repeats are acceptable or desired.

### Initialization Strategy

#### Constructor vs \_ready() Split

The class splits initialization between `_init()` and `_ready()`:

1. **Data Loading in \_init()**: Audio files are loaded before the node enters the scene tree, ensuring they're available immediately.
2. **Scene Operations in \_ready()**: Timer creation and signal connections happen after the node is in the scene, ensuring proper parent-child relationships.
3. **Immediate Availability**: The audio list is ready as soon as the object is created, making it useful for immediate queries.

## Tips for Best Results

1. **Group similar sounds together** - Organize sounds by type or purpose to make them easier to manage and ensure consistent playback.
2. **Keep file counts reasonable** - 5-10 variations are usually enough for most purposes. Adding too many variations worsens performance and can make it harder to find specific sounds later on.
3. **Match volumes carefully** - Big volume differences between files can break immersion.
4. **Use descriptive filenames** - This helps with debugging and makes it easier to find specific sounds later on.
