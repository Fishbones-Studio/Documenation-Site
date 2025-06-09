---
title: Random Audio Player
description: Audio player that plays random audio files in a folder, in 3D space.
lastUpdated: 2025-06-09
author: Tjorn
---

The Random Audio Player is a specialized audio playback class that extends AudioStreamPlayer3D to provide randomized audio selection from a folder of audio files. Unlike the [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-audio-player), which focuses on timing and delegation, this class directly handles 3D positional audio playback with built-in randomization logic.

## Design Philosophy

The BaseRandomAudioPlayer follows a different architectural approach compared to the [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-audio-player). Here are the key differences and design choices:

1. **Direct Inheritance**: Extends AudioStreamPlayer3D directly to provide immediate 3D audio capabilities without requiring additional components or signal connections.

2. **Immediate Playback**: Designed for on-demand audio playback rather than scheduled intervals, making it ideal for event-driven sound effects, such as weapons, footsteps, or environmental sounds.

3. **Simplified Integration**: Can be dropped into any scene as a ready-to-use 3D audio source with randomization built-in.

4. **Export Configuration**: Uses @export variables for easy configuration in the Godot editor, supporting rapid prototyping and iteration.

## The code

```gdscript
## Base class for AudioStreamPlayer3Ds that play random streams from a folder.
class_name BaseRandomAudioPlayer
extends AudioStreamPlayer3D

@export var audio_folder: String = "res://sounds/" ## Folder containing audio files
@export var file_extensions: Array[String] = ["ogg", "wav", "mp3"] ## Supported audio formats
@export var avoid_repeats: bool = true ## Avoid playing the same audio consecutively, if possible

var _available_streams: Array[AudioStream] = []
var _current_stream_index: int = -1


func _ready() -> void:
	_load_audio_streams()


func _load_audio_streams() -> void:
	_available_streams.clear()

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
				_available_streams.append(audio)
			else:
				push_warning(
					"Could not load '%s' as AudioStream, even though it was listed and matched extension."
					% resource_path
				)

	if _available_streams.is_empty():
		if not file_names_in_folder.is_empty():
			push_warning(
				"No loadable audio files with extensions %s found in '%s', despite files being present."
				% [str(file_extensions), audio_folder]
			)
		else:
			# This covers the case where the directory was empty or no matching/loadable files were found.
			push_warning(
				"No audio streams loaded from directory: %s. Check folder contents and file extensions."
				% audio_folder
			)


## Selects and returns the next AudioStream based on the configuration.
## Returns null if no streams are available.
func _get_next_random_stream() -> AudioStream:
	if _available_streams.is_empty():
		return null

	var next_index := _current_stream_index
	if _available_streams.size() > 1 and avoid_repeats:
		while next_index == _current_stream_index:
			next_index = randi() % _available_streams.size()
	elif not _available_streams.is_empty(): # Handles single item or repeats allowed
		next_index = randi() % _available_streams.size()
	else: # Should not happen if initial check passes, but as a fallback
		return null

	_current_stream_index = next_index
	return _available_streams[_current_stream_index]
```

### Architectural Differences from IntervalAudioPlayer

#### Direct Inheritance

The BaseRandomAudioPlayer extends `AudioStreamPlayer3D` directly, which is fundamentally different from the IntervalAudioPlayer's approach:

1. **Immediate Functionality**: By inheriting from AudioStreamPlayer3D, this class becomes a drop-in replacement for any 3D audio source. No additional components or signal connections are needed.

2. **Performance**: Direct inheritance eliminates the overhead of signal emission and reception, making it more suitable for frequently triggered sound effects.

3. **Simplicity**: For use cases that only need 3D audio, this approach reduces complexity by combining audio selection and playback in a single component.

#### When to Choose Each Approach

- **Use BaseRandomAudioPlayer when**: You need immediate 3D sound effects, working with event-driven audio (footsteps, weapons, etc.), or want minimal setup complexity.
- **Use IntervalAudioPlayer when**: You need scheduled/timed audio, want to support multiple audio player types, or require complex audio routing.

### Audio Loading Strategy

#### Immediate Loading in \_ready()

Audio files are loaded in `_ready()` rather than on-demand because:

1. **Predictable Performance**: Loading happens once during scene initialization, avoiding hitches during gameplay.

2. **Error Discovery**: File loading issues are discovered early, when they're easier to debug and fix.

3. **Memory Planning**: All audio memory is allocated upfront, making memory usage predictable.

4. **Fail State**: If audio files are missing or corrupted, the problem is detected immediately rather than during gameplay.

#### Resource Caching Consistency

Uses `ResourceLoader.CACHE_MODE_REUSE` for the same reasons as [IntervalAudioPlayer](/fowl-play/gameplay/audio/interval-audio-player):

1. **Memory Efficiency**: Prevents duplicate loading of the same audio files across multiple instances.
2. **Consistency**: Ensures all instances use the same AudioStream objects for identical files.
3. **Godot Integration**: Leverages Godot's built-in resource management system.

### Randomization Logic

#### Repeat Prevention

The `_get_next_random_stream()` function implements intelligent randomization:

```gdscript
var next_index := _current_stream_index
if _available_streams.size() > 1 and avoid_repeats:
    while next_index == _current_stream_index:
        next_index = randi() % _available_streams.size()
```

This approach provides:

1. **Natural Feel**: Prevents the jarring experience of the same sound playing twice in immediate succession.

2. **True Randomness When Appropriate**: When only one audio file exists or repeats are explicitly allowed, pure randomness is used.

#### Return Value Strategy

The method returns `null` when no streams are available rather than throwing an error because:

1. **Caller Control**: Allows the calling code to decide how to handle missing audio (play nothing, use fallback, etc.).

2. **Graceful Degradation**: Missing audio won't crash the game, maintaining stability in production.

3. **Optional Audio**: Supports scenarios where audio is nice-to-have but not essential for functionality.

### Error Handling

#### Progressive Warning System

The class uses a layered warning approach:

1. **Directory Issues**: Errors for missing directories (fundamental problem).
2. **Content Issues**: Warnings for empty directories or failed loads (partial problems).
3. **Graceful Continuation**: System continues to work with whatever audio is available.

This ensures that:

- Critical issues (missing directories) are flagged as errors
- Non-critical issues (some files missing) generate warnings but don't stop execution
- The system provides maximum functionality even with incomplete audio sets

## Tips for Best Results

1. **Position carefully in 3D space** - Since this extends AudioStreamPlayer3D, the transform position determines where the sound originates from. Place it at the exact location where the sound should appear to come from.

2. **Configure attenuation settings** - Use the AudioStreamPlayer3D's built-in attenuation properties to control how the sound fades with distance. This is crucial for realistic 3D audio.

3. **Group related sounds** - Keep variations of the same sound effect (like different footstep sounds) in the same folder for easy management and consistent behavior.

4. **Test repeat avoidance** - With `avoid_repeats` enabled, make sure you have at least 2-3 variations of each sound to prevent noticeable patterns.

5. **Use descriptive folder names** - Since the audio folder is exported, clear naming helps designers understand what sounds belong where.

6. **Consider memory usage** - All audio files are loaded at once, so avoid putting too many large files in a single folder. For music or long ambient tracks, consider using IntervalAudioPlayer instead.
