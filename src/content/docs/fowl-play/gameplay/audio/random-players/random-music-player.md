---
title: Random Music Player
description: Advanced music player with crossfading, pause effects, and automatic track progression.
lastUpdated: 2025-06-09
author: Tjorn
---

The Random Music Player is a sophisticated music playback script that extends [BaseRandomAudioPlayer](/fowl-play/gameplay/audio/random-players/base-random-audio-player) with advanced features like crossfading between tracks, EQ effects during pause states, and automatic track progression. It's designed to provide seamless background music during the rounds in the arena.

## Design Philosophy

1. **Seamless Transitions**: Crossfading between tracks eliminates jarring cuts and downtime between songs.

2. **Adaptive Audio**: Responds to game state changes (like pause) with appropriate audio effects.

3. **Configurable Behavior**: Extensive export properties allow fine-tuning without code changes.

## The Code

```gdscript
## Plays random music from a folder, fading between tracks.
class_name RandomMusicPlayer
extends BaseRandomAudioPlayer

const MIN_DB := -80.0 ## Minimum volume in decibels, used for fade out and hacky way to 'silence' the player
const MAX_DB := 0.0

@export var fade_duration: float = 1.0
@export var playback_delay: float = 0.5 ## Delay before starting the next track fade
@export var start_on_ready: bool = true

@export_group("Pause Effect")
@export var pause_eq_enabled: bool = false
## EQ Band 0: ~32 Hz, 1: ~100 Hz, 2: ~320 Hz, 3: ~1 kHz, 4: ~3.2 kHz, 5: ~10 kHz
@export var pause_eq_band_0_db: float = 1.0
@export var pause_eq_band_1_db: float = 0.0
@export var pause_eq_band_2_db: float = -4.0
@export var pause_eq_band_3_db: float = -9.0
@export var pause_eq_band_4_db: float = -14.0
@export var pause_eq_band_5_db: float = -18.0
@export var pause_volume_adjustment_db: float = -6.0 ## Adjust volume by this dB when paused

var transitioning: bool = false
var stopped: bool = false
var is_game_paused: bool = false
var _eq_effect_index: int = -1
var _fading_volume_db: float = MIN_DB ## Internal volume for tweening, before pause adjustment

var tween: Tween

func _ready():
    if start_on_ready:
        play_random_music()
```

### State Management Architecture

The class uses a layered volume system for maximum flexibility:

```gdscript
var _fading_volume_db: float = MIN_DB  # Base volume for crossfading
var pause_volume_adjustment_db: float = -6.0  # Additional pause adjustment
# Final volume = _fading_volume_db + pause_volume_adjustment_db
```

#### Why Layered Volumes?

1. **Independent Control**: Crossfading and pause effects can operate independently without interfering.

2. **Smooth Transitions**: The base volume can fade while pause adjustments are applied instantly.

3. **Predictable Behavior**: Each volume layer has a single, clear responsibility.

#### Transition State Tracking

The `transitioning` boolean prevents overlapping operations:

```gdscript
if transitioning: return
transitioning = true
```

This ensures:

- Only one crossfade can happen at a time
- Manual play requests don't interrupt ongoing transitions
- The system remains in a predictable state

### Crossfading Implementation

#### Tweening the Volume

Tweens provide smooth, frame-rate-independent volume changes:

```gdscript
tween = create_tween().set_trans(Tween.TRANS_SINE)
tween.tween_property(self, "_fading_volume_db", MAX_DB, fade_duration)
```

#### Tweening Advantages

1. **Smooth Curves**: TRANS_SINE provides natural-sounding fade curves
2. **Performance**: Godot's tween system is optimized for smooth animations
3. **Interruption Safety**: Old tweens can be killed cleanly when new ones start

### Dynamic EQ System

#### Real-Time Effect Management

The pause EQ system dynamically adds and removes audio effects:

```gdscript
func _add_pause_eq_effect() -> void:
    var eq_effect := AudioEffectEQ.new()
    # Configure EQ bands...
    AudioServer.add_bus_effect(bus_index, eq_effect)
    _eq_effect_index = AudioServer.get_bus_effect_count(bus_index) - 1
```

##### Dynamic Effects

1. **Performance**: EQ is only active when needed, saving CPU
2. **Flexibility**: Different games can have different pause audio styles
3. **Non-Destructive**: No permanent changes to the audio bus configuration

#### EQ Band Configuration

The predefined EQ curve simulates audio heard through a wall or underwater:

- **Low frequencies**: Slightly boosted (bass travels through obstacles)
- **Mid frequencies**: Gradually cut (muffled effect)
- **High frequencies**: Heavily cut (treble is most affected by obstacles)

This creates an immersive effect that suggests the game world is "distant" when paused.

### Process Function

The `_process()` function checks the game pause state every frame:

```gdscript
func _process(_delta: float) -> void:
    var current_tree_paused_state := get_tree().paused
    if current_tree_paused_state != is_game_paused:
        is_game_paused = current_tree_paused_state
        _on_pause_state_changed(is_game_paused)

    _update_actual_volume()
```

This allows the player to respond immediately to pause state changes, ensuring:

1. **Immediate Response**: Pause state changes are detected instantly
2. **No Signal Dependencies**: Works regardless of how pause is implemented
3. **Volume Accuracy**: Ensures volume is always correct, even during tweening

So while the `_process()` function runs every frame, which makes it relatively expensive, it only performs minimal checks and updates, keeping performance impact low. The tradeoff for not using the `_process()` function is that the player would not respond to pause state changes, which is critical for the pause EQ effect.

### Error Handling

#### Graceful Degradation

Multiple validation and backup layers ensure the system continues working even when things go wrong:

```gdscript
if _available_streams.is_empty():
    push_warning("No music files available...")
    return

var next_music_stream := _get_next_random_stream()
if next_music_stream:
    # Success path
else:
    push_warning("No next music track found...")
    transitioning = false
```

#### Resource Cleanup

The `_exit_tree()` method ensures clean shutdown:

```gdscript
func _exit_tree() -> void:
    _remove_pause_eq_effect()  # Remove dynamic audio effects
    if tween and tween.is_valid(): tween.kill()  # Stop all animations
```

This prevents:

- Memory leaks from orphaned tweens
- Audio artifacts from leftover EQ effects
- Console warnings about invalid references

### State Persistence

The player remembers its state across pause cycles:

```gdscript
# Game pauses -> EQ applied, volume reduced
# Game unpauses -> EQ removed, volume restored
# Music continues seamlessly
```

## Tips

1. **Choose appropriate fade durations** - 1-2 seconds works well in our case, but adjust based on your game or scene's pacing and music style.

2. **Configure EQ** - Depending on the musics nature, the EQ bands might need adjustment. Songs with a heavy bass require less boost on the low frequencies, while songs with a lot of treble might need more attenuation on the high frequencies.

3. **Test pause effects** - Make sure the pause EQ sounds good with your specific music tracks.

4. **Consider track length** - Longer tracks (3+ minutes) work better with crossfading since transitions are less frequent.

5. **Match track volumes** - Ensure all music files have similar loudness to prevent jarring volume jumps.

6. **Plan for interruptions** - Test what happens when the player quickly pauses/unpauses or changes scenes during transitions.
