---
title: Round Handler System
description: Documentation for the arena round management system
lastUpdated: 2025-06-19
author: Tjorn
---

## In Short

The **Round Handler** is responsible for managing the flow of arena rounds, including enemy selection and spawning, round progression, intermissions, and reward distribution. It handles all transitions and state changes between rounds, with special logic for boss rounds and intermissions.

## The Code

```gdscript
################################################################################
## Manages round transitions, enemy spawning, and battle flow.
## Handles enemy selection, round progression, and intermission logic.
################################################################################
class_name RoundHandler
extends Node

signal next_enemy_selected(enemy: Enemy)

@export_category("Round Settings")
## Default max rounds (overridden by round_setup)
@export var max_rounds: int = 3
## Enable/disable intermission between rounds
@export var intermission_enabled: bool = true
## Time between round transitions
@export var transition_delay: float = 2.0
## Which stat type to increment per round and their respective value
@export var stat_increment_per_round: Dictionary[StatsEnums.Stats, float] = {
	StatsEnums.Stats.MAX_HEALTH: 10.0,
	StatsEnums.Stats.MAX_STAMINA: 10.0,
	StatsEnums.Stats.ATTACK: 5.0,
	StatsEnums.Stats.DEFENSE: 5.0,
	StatsEnums.Stats.HEALTH_REGEN: 5.0,
	StatsEnums.Stats.STAMINA_REGEN: 5.0
}
@export_category("Spawn")
@export var enemy_spawn_position: Marker3D
@export var player_spawn_position: Marker3D
@export var intermission_spawn_position: Marker3D

var round_state: RoundEnums.RoundTypes = RoundEnums.RoundTypes.WAITING

var _next_enemy: Enemy = null # The next enemy to fight, decided after the previous round
var _current_enemy: Enemy = null # The one currently in the arena fighting
var _enemy_scenes_by_type: Dictionary = {} # Categorized enemy scenes by type
var _used_enemies: Array[PackedScene] = [] # Tracks enemies already spawned in the current run


## Sets up the round system with the provided enemies and max rounds.
func setup_rounds(enemies: Array[PackedScene], _max_rounds: int) -> void:
	if enemies.is_empty():
		push_error("RoundHandler: No enemies provided for setup!")
		return

	if _max_rounds > 0:
		max_rounds = _max_rounds

	_categorize_enemies(enemies)
	_used_enemies.clear() # Reset the used enemies list at the start of a new run
	GameManager.current_round = 1
	SignalManager.start_next_round.connect(_proceed_to_next_round)
	_start_round()


## Categorizes enemy scenes by their type for efficient selection.
func _categorize_enemies(enemies: Array[PackedScene]) -> void:
	_enemy_scenes_by_type.clear()

	for scene in enemies:
		var temp_enemy: Enemy = scene.instantiate() as Enemy
		if not temp_enemy:
			push_error(
				"RoundHandler: Invalid enemy scene: %s" % scene.resource_path
			)
			continue

		var enemy_type: EnemyEnums.EnemyTypes = temp_enemy.type
		if not _enemy_scenes_by_type.has(enemy_type):
			_enemy_scenes_by_type[enemy_type] = []

		_enemy_scenes_by_type[enemy_type].append(scene)
		temp_enemy.queue_free()


## Main round state machine entry point.
func _start_round() -> void:
	match round_state:
		RoundEnums.RoundTypes.WAITING:
			await _enter_waiting()
		RoundEnums.RoundTypes.IN_PROGRESS:
			await _enter_in_progress()
		RoundEnums.RoundTypes.CONCLUDING:
			await _enter_concluding()
		RoundEnums.RoundTypes.INTERMISSION:
			_enter_intermission()
		_:
			push_error("RoundHandler: Invalid state: %s" % round_state)


## Handles the waiting period before a round starts.
func _enter_waiting() -> void:
	var current_round_string: String = "Round " + NumberUtils.to_words(GameManager.current_round)
	if GameManager.current_round == max_rounds:
		current_round_string = "Final Round"
	SignalManager.add_ui_scene.emit(
		UIEnums.UI.ROUND_SCREEN,
		{
			"display_text": current_round_string
		}
	)

	GameManager.chicken_player.global_position = player_spawn_position.global_position
	GameManager.chicken_player.look_at(enemy_spawn_position.global_position)
	await get_tree().create_timer(transition_delay).timeout

	round_state = RoundEnums.RoundTypes.IN_PROGRESS
	_start_round()


## Handles the round in-progress state, including enemy selection and spawning.
func _enter_in_progress() -> void:
	# Use the pre-selected next_enemy if available, otherwise pick one (for the first round)
	if not _current_enemy:
		if _next_enemy:
			_current_enemy = _next_enemy
			_next_enemy = null
		else:
			# This case should only happen for the very first round
			if GameManager.current_round == max_rounds:
				_current_enemy = _create_enemy(EnemyEnums.EnemyTypes.BOSS)
				if not _current_enemy: # No boss enemies available
					printerr(
						"RoundHandler: No boss enemies available for the final round. Spawning a regular enemy instead."
					)
					_current_enemy = _create_enemy(EnemyEnums.EnemyTypes.REGULAR)
			else:
				_current_enemy = _create_enemy(EnemyEnums.EnemyTypes.REGULAR)

			if not _current_enemy:
				push_error(
					"RoundHandler: Critical - Failed to create any enemy for the current round."
				)
				return

	if not _current_enemy:
		push_error(
			"RoundHandler: _current_enemy is null before spawning. This should not happen."
		)
		return

	_spawn_enemy()
	SaveManager.save_enemy_encounter(_current_enemy.stats.name)

	# Wait for enemy defeat
	await SignalManager.enemy_died
	round_state = RoundEnums.RoundTypes.CONCLUDING
	_start_round()


## Handles the end of a round, including rewards and next enemy selection.
func _enter_concluding() -> void:
	# Check if all rounds are completed (boss defeated)
	if GameManager.current_round == max_rounds:
		_handle_victory()
		return

	# Show the round screen
	SignalManager.add_ui_scene.emit(
		UIEnums.UI.ROUND_SCREEN,
		{
			"display_text": "Enemy Defeated!",
			"currency_dict": _handle_round_reward()
		}
	)

	# Decide and store the next enemy *before* the wait time
	if GameManager.current_round + 1 == max_rounds:
		_next_enemy = _create_enemy(EnemyEnums.EnemyTypes.BOSS)
		if not _next_enemy: # No boss enemies available
			printerr(
				"RoundHandler: No boss enemies available for the upcoming final round. Preparing a regular enemy instead."
			)
			_next_enemy = _create_enemy(EnemyEnums.EnemyTypes.REGULAR)
	else:
		_next_enemy = _create_enemy(EnemyEnums.EnemyTypes.REGULAR)

	if _next_enemy:
		next_enemy_selected.emit(_next_enemy)
	else:
		push_error("RoundHandler: Critical - Failed to prepare any next enemy.")

	await get_tree().create_timer(transition_delay).timeout

	# Increment round *after* picking the next enemy and waiting
	GameManager.current_round += 1
	round_state = (
		RoundEnums.RoundTypes.INTERMISSION
		if intermission_enabled
		else RoundEnums.RoundTypes.WAITING
	)
	_start_round()


## Handles the intermission state, including player teleport and shop refresh.
func _enter_intermission() -> void:
	GameManager.chicken_player.global_position = intermission_spawn_position.global_position
	SignalManager.upgrades_shop_refreshed.emit()


## Method for handling normal round rewards
func _handle_round_reward() -> Dictionary[CurrencyEnums.CurrencyTypes, int]:
	# Add currency
	var prosperity_eggs: int = GameManager.arena_round_reward.get(
		CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS, 0
	) * GameManager.current_round

	GameManager.prosperity_eggs += prosperity_eggs
	return {
		CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS: prosperity_eggs
	} as Dictionary[CurrencyEnums.CurrencyTypes, int]


## Proceeds to the next round from intermission.
func _proceed_to_next_round() -> void:
	if round_state != RoundEnums.RoundTypes.INTERMISSION:
		push_error("Proceed called outside intermission state!")
		return

	round_state = RoundEnums.RoundTypes.WAITING
	_start_round()


## Instantiates a random enemy of the given type, avoiding repeats if possible.
func _create_enemy(type: EnemyEnums.EnemyTypes) -> Enemy:
	var all_scenes_for_type: Array = _enemy_scenes_by_type.get(
		type, []
	)

	if all_scenes_for_type.is_empty():
		push_warning(
			"RoundHandler: No enemy scenes available for type: %s" % str(type)
		)
		return null

	var available_unique_scenes: Array[PackedScene] = []
	for scene in all_scenes_for_type:
		if not _used_enemies.has(scene):
			available_unique_scenes.append(scene)

	var scene_to_instantiate: PackedScene = null

	if not available_unique_scenes.is_empty():
		# Prefer to pick an enemy that hasn't been used yet in this run
		scene_to_instantiate = available_unique_scenes.pick_random()
		if scene_to_instantiate:
			_used_enemies.append(scene_to_instantiate)
	else:
		# All unique enemies of this type have been used in this run.
		# Allow re-picking from the full list for this type.
		push_warning(
			(
				"RoundHandler: All unique enemies of type '%s' have been used in this run. "
				+ "Re-picking from the full list for this type."
			)
			% str(type)
		)
		scene_to_instantiate = all_scenes_for_type.pick_random()

	if not scene_to_instantiate:
		# This should ideally not happen if all_scenes_for_type was not empty
		push_error(
			"RoundHandler: Failed to select an enemy scene for type: %s"
			% str(type)
		)
		return null

	return scene_to_instantiate.instantiate() as Enemy


## Spawns the current enemy in the arena and connects its death signal.
func _spawn_enemy() -> void:
	assert(_current_enemy, "Attempted to spawn null enemy!")

	# Ensure the enemy node is not already in the tree if reusing instances
	if _current_enemy.get_parent():
		_current_enemy.get_parent().remove_child(_current_enemy)

	var original_enemy_stats: Dictionary[StringName, float] = {}

	# Apply the increment in stats
	for stat: StatsEnums.Stats in stat_increment_per_round.keys():
		var stat_name: StringName = StatsEnums.stat_to_string(stat) as StringName
		var original_value: float = _current_enemy.stats.apply_stat_effect(stat_name, SaveManager.get_loaded_rounds_won() * stat_increment_per_round[stat])
		original_enemy_stats[stat_name] = original_value

	add_child(_current_enemy)
	_current_enemy.global_position = enemy_spawn_position.global_position
	_current_enemy.look_at(player_spawn_position.global_position)

	# Connect death signal (one-shot ensures it disconnects after firing)
	var death_callback = func():
		if is_instance_valid(_current_enemy):
			for stat_name in original_enemy_stats.keys():
				_current_enemy.stats.set(stat_name, original_enemy_stats[stat_name])
			_current_enemy.queue_free()
		_current_enemy = null

	if is_instance_valid(_current_enemy):
		_current_enemy.tree_exiting.connect(death_callback, CONNECT_ONE_SHOT)
	else:
		push_error("RoundHandler: _current_enemy became invalid before connecting death_callback.")


## Handles the end-of-game victory logic and reward distribution.
func _handle_victory() -> void:
	GameManager.current_round += 1 # bc winning also counts as round won
	var currency_dict: Dictionary[CurrencyEnums.CurrencyTypes, int] = {}
	if _current_enemy.type ==  EnemyEnums.EnemyTypes.BOSS:
		for currency_type in GameManager.arena_completion_reward:
			var amount = GameManager.arena_completion_reward[currency_type]
			currency_dict[currency_type] = amount

			match currency_type:
				CurrencyEnums.CurrencyTypes.FEATHERS_OF_REBIRTH:
					GameManager.feathers_of_rebirth += amount
				CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS:
					GameManager.prosperity_eggs += amount
	else:
		currency_dict = _handle_round_reward()

	SignalManager.game_won.emit()
	SignalManager.add_ui_scene.emit(
		UIEnums.UI.VICTORY_SCREEN, {"currency_dict": currency_dict}
	)
```

---

## Features

- **Round Progression:** Manages current round, transitions, and state machine.
- **Enemy Management:** Selects, spawns, and tracks unique enemies per round, with boss handling.
- **Stat Scaling:** Increments enemy stats per round for increasing difficulty.
- **Intermission Support:** Optionally handles intermissions between rounds for upgrades and rest.
- **Reward Distribution:** Handles currency and reward logic after each round and upon victory.
- **Signals & UI Integration:** Emits signals for UI updates and round events.

## Key Concepts

### Round States

- **WAITING:** Prepares the player and arena for the next round.
- **IN_PROGRESS:** Handles enemy spawning and battle logic.
- **CONCLUDING:** Processes round completion, rewards, and next enemy selection.
- **INTERMISSION:** (Optional) Allows the player to rest and upgrade between rounds.

### Enemy Selection

- Enemies are categorized by type (e.g., REGULAR, BOSS).
- The system avoids repeating the same enemy within a run, if possible.
- Bosses are reserved for the final round.

### Stat Scaling

- Enemy stats are incremented each round based on a configurable dictionary.
- Scaling is applied using the number of rounds won.

## Usage

### Setup

To initialize the round system, call:

```gdscript
setup_rounds(enemies: Array[PackedScene], max_rounds: int)
```

- `enemies`: Array of enemy scenes to use for this run.
- `max_rounds`: Total number of rounds (overrides the default).

### Signals

- `next_enemy_selected(enemy: Enemy)`: Emitted when the next enemy is chosen.
- Relies on external signals such as `SignalManager.enemy_died` and `SignalManager.start_next_round`.

### Exported Properties

- `max_rounds`: Total number of rounds in the arena.
- `intermission_enabled`: Enables/disables intermission between rounds.
- `transition_delay`: Time (seconds) between round transitions.
- `stat_increment_per_round`: Dictionary mapping stat types to increment values per round.
- `enemy_spawn_position`, `player_spawn_position`, `intermission_spawn_position`: Markers for spawn locations.

## Main Methods

### `setup_rounds(enemies, max_rounds)`

Initializes the round system, categorizes enemies, and starts the first round.

### `_start_round()`

Main state machine entry point. Calls the appropriate handler based on the current round state.

### `_enter_waiting()`

Handles the pre-round waiting period, displays round info, and positions the player.

### `_enter_in_progress()`

Selects and spawns the enemy for the round, waits for the enemy to be defeated.

### `_enter_concluding()`

Handles end-of-round logic, including rewards and next enemy selection.

### `_enter_intermission()`

Moves the player to the intermission area and refreshes the shop.

### `_proceed_to_next_round()`

Transitions from intermission to the next round.

### `_create_enemy(type)`

Selects and instantiates a random enemy of the given type, avoiding repeats if possible.

### `_spawn_enemy()`

Adds the current enemy to the scene, applies stat scaling, and connects its death signal.

### `_handle_round_reward()`

Calculates and gives round rewards.

### `_handle_victory()`

Handles end-of-game victory logic and rewards.

## Integration

- **UI:** Emits signals to update the UI for round screens and victory screens.
- **GameManager:** Relies on [`GameManager`](/fowl-play/gameplay/important-code/game-manager) for player/enemy references, round tracking, and currency.
- **SignalManager:** Uses signals for round transitions, enemy death, and shop refresh.

## Error Handling

- Logs errors if no enemies are provided, or if enemy instantiation fails.
- Warns if all unique enemies of a type have been used and repeats are necessary.

## Dependencies

- **GameManager:** For player, round, and currency management.
- **SignalManager:** For event-driven communication.
- **Enemy, StatsEnums, EnemyEnums, CurrencyEnums, UIEnums:** For type safety and logic.

## Best Practices

- Always provide a diverse set of enemy scenes for each type to maximize variety.
- Use signals to decouple UI and gameplay logic.
- Adjust stat scaling and rewards for desired difficulty and pacing.
