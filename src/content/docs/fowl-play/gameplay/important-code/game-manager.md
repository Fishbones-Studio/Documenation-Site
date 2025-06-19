---
title: Game Manager
description: Autoload script for managing game state, player stats, and currencies in Fowl Play.
lastUpdated: 2025-06-19
author: Tjorn
---

The Game Manager is an autoload script in Fowl Play that manages the overall game state, player stats, and currencies. It handles the player's chicken character, prosperity eggs, feathers of rebirth, and various game mechanics such as round progression and cheat settings.
It holds a globally accessible reference to the current chicken player, which can then be used within other scenes as necessary.

## The Code

```gdscript
#game_manager.gd
extends Node

signal prosperity_eggs_changed(new_value: int)
signal feathers_of_rebirth_changed(new_value: int)
signal player_stats_updated(new_stats: LivingEntityStats)
signal chicken_player_set()


var chicken_player: ChickenPlayer = null:
	set(value):
		if chicken_player == value:
			return # No change
		chicken_player = value
		print("GameManager.chicken_player set to:", value)
		if value != null:
			chicken_player_set.emit()

var current_enemy: Enemy

var prosperity_eggs: int:
	set(value):
		if prosperity_eggs == value:
			return
		elif value < 0:
			push_error("Prosperity Eggs cannot be negative, setting to 0 instead.")
			value = 0
		prosperity_eggs = value
		SaveManager.save_currency(prosperity_eggs, CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS)
		prosperity_eggs_changed.emit(value)


var feathers_of_rebirth: int:
	set(value):
		if feathers_of_rebirth == value:
			return
		elif value < 0:
			push_error("Feathers of Rebirth cannot be negative, setting to 0 instead.")
			value = 0
		feathers_of_rebirth = value
		SaveManager.save_currency(feathers_of_rebirth, CurrencyEnums.CurrencyTypes.FEATHERS_OF_REBIRTH)
		feathers_of_rebirth_changed.emit(value)


## Amount of prosperity eggs earned per round. Gets multiplied by the round number
var arena_round_reward : Dictionary[CurrencyEnums.CurrencyTypes, int] = {
	CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS: 50,
}
## Amount of prosperity eggs earned for completing the arena (aka the final round)
var arena_completion_reward: Dictionary[CurrencyEnums.CurrencyTypes, int] = {
	CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS: 200,
	CurrencyEnums.CurrencyTypes.FEATHERS_OF_REBIRTH: 5,
}

var current_round: int = 1:
	set(value):
		if current_round == value:
			return
		# If the round progresses, add more prosperity eggs
		if value > current_round:
			# Use the setter to ensure signal emission and inventory update
			SaveManager.save_rounds_one_by_one()
		current_round = value


# Cheat variables
var infinite_health: bool = false:
	set(value):
		if infinite_health == value:
			return # No change
		infinite_health = value
		if chicken_player:
			chicken_player.stats = apply_cheat_settings(chicken_player.stats, SaveManager.get_loaded_player_stats()) # Re-apply settings when toggle changes
		else:
			push_warning("Chicken player not set, cannot apply health cheat settings.")


var infinite_damage: bool = false:
	set(value):
		if infinite_damage == value:
			return # No change
		infinite_damage = value
		if chicken_player:
			chicken_player.stats = apply_cheat_settings(chicken_player.stats, SaveManager.get_loaded_player_stats()) # Re-apply settings when toggle changes
		else:
			push_warning("Chicken player not set, cannot apply damage cheat settings.")


## Applies or removes cheat effects based on current toggle states.
func apply_cheat_settings(stats : LivingEntityStats, default_stats : LivingEntityStats, apply_only_when_on := false) -> LivingEntityStats:
	if apply_only_when_on && !(infinite_health or infinite_damage):
		print("Cheat settings not applied, both cheats are off.")
		return stats

	if default_stats == null:
		push_error("Apply cheats: Failed to load default player stats from SaveManager!")
		return stats

	# Health Cheat
	if infinite_health:
		print("Setting infinite health")
		stats.max_health = INF
		stats.current_health = INF
		# Using a very large number for regen instead of INF, since INF is a float
		stats.health_regen = 9223372036854775807 # Max int
	else:
		print("Restoring health stats from default resource for health")
		# Restore health stats from the loaded default resource
		stats.max_health = default_stats.max_health
		# Restore health, the current_health has a clamp in setter
		stats.current_health = default_stats.max_health
		stats.health_regen = default_stats.health_regen

	# Damage Cheats
	if infinite_damage:
		print("Setting infinite damage")
		stats.attack = INF
	else:
		print("Restoring damage stats from default resource for damage")
		# Restore damage stats from the loaded default resource
		stats.attack = default_stats.attack

	player_stats_updated.emit(stats) # Emit signal to update player stats in the game
	return stats


## Game reset to be used in game, with persisting upgrades, f.o.r. and encounters
func reset_game() -> void:
	# Use the setter for prosperity_eggs to ensure signals/updates happen
	prosperity_eggs = clamp(
		(100 + current_round * int(arena_round_reward.get(CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS, 50) / 2.0)), 200, 200
	)
	SaveManager.reset_game_data()
	if Inventory:
		Inventory.reset_inventory()
	else:
		push_warning("Inventory not available for reset.")


## Deletes the save files
func hard_reset_game() -> void:
	Inventory.hard_reset_inventory()
	SaveManager.hard_reset_game_data()
```

---

## Features

- **Player Management:** Tracks and manages the player chicken and its stats. Provides an easy global reference to the current player.
- **Currency Management:** Handles prosperity eggs and feathers of rebirth, including saving and signal emission.
- **Round Progression:** Tracks the current round and manages round-based rewards.
- **Cheat Support:** Provides toggles for infinite health and infinite damage, with automatic stat application.
- **Reward Logic:** Configurable rewards for each round and for arena completion.
- **Game Reset:** Supports both soft and hard resets, including inventory and save data.
- **Signals:** Emits signals for currency changes, player stat updates, and player assignment.

## Signals

- `prosperity_eggs_changed(new_value: int)`: Emitted when prosperity eggs are updated.
- `feathers_of_rebirth_changed(new_value: int)`: Emitted when feathers of rebirth are updated.
- `player_stats_updated(new_stats: LivingEntityStats)`: Emitted when player stats are changed (including cheats).
- `chicken_player_set()`: Emitted when the chicken player is assigned.

## Properties

### Player & Enemy

- `chicken_player: ChickenPlayer`
  - Reference to the chicken player. Emits `chicken_player_set` when assigned.
- `current_enemy: Enemy`
  - Reference to the current enemy in the arena.

### Currencies

- `prosperity_eggs: int`
  - Main in-game currency. Cannot be negative. Emits `prosperity_eggs_changed` on update.
- `feathers_of_rebirth: int`
  - Special currency for meta-progression. Cannot be negative. Emits `feathers_of_rebirth_changed` on update.

### Rewards

- `arena_round_reward: Dictionary[CurrencyEnums.CurrencyTypes, int]`
  - Reward per round, multiplied by the round number.
- `arena_completion_reward: Dictionary[CurrencyEnums.CurrencyTypes, int]`
  - Reward for completing the final round.

### Rounds

- `current_round: int`
  - Tracks the current round. Triggers save logic on increment.

### Cheats

- `infinite_health: bool`
  - If true, sets player health and regen to extremely high values.
- `infinite_damage: bool`
  - If true, sets player attack to extremely high value.

## Methods

### `apply_cheat_settings(stats, default_stats, apply_only_when_on := false) -> LivingEntityStats`

Applies or removes cheat effects to the provided stats object, based on the current cheat toggles. Emits `player_stats_updated` after changes.

- **Parameters:**
  - `stats`: The stats object to modify.
  - `default_stats`: The default stats to restore when cheats are off.
  - `apply_only_when_on`: If true, only applies changes if a cheat is enabled.

### `reset_game()`

Performs a soft reset of the game, preserving upgrades, feathers of rebirth, and encounters. Resets prosperity eggs to a value based on the current round and reward settings. Resets inventory and game data.

### `hard_reset_game()`

Performs a full reset, deleting all save files and inventory data.

## Usage

- **Currency Updates:** Set `prosperity_eggs` or `feathers_of_rebirth` to update values, save, and emit signals.
- **Player Assignment:** Assign to `chicken_player` to set the player and emit the relevant signal.
- **Cheats:** Toggle `infinite_health` or `infinite_damage` to apply or remove cheat effects. Stats are updated automatically.
- **Round Progression:** Update `current_round` to progress rounds and trigger save logic.
- **Rewards:** Configure `arena_round_reward` and `arena_completion_reward` for custom rewards.

## Integration

- **SaveManager:** Used for saving and loading currency, player stats, and round data.
- **Inventory:** Used for resetting or hard-resetting inventory data.
- **CurrencyEnums:** Used for type-safe currency management.
- **LivingEntityStats:** Used for player stat management and applicating cheats.

## Error Handling

- Prevents negative values for currencies, clamping to zero and logging errors.
- Warns if attempting to apply cheats before the player is set.
- Handles missing inventory gracefully during resets.
