---
title: Changes till Playtest One
description: Ideas which have changed in the period of the pitch, till playtest one
lastUpdated: 2025-04-16
author: All
---

Since the [First Pitch](/fowl-play/production/pitches/pitch-document) and the [week 6 progression update](/fowl-play/production/pitches/week-6-progress-presentation) we have made some changes to the design of the game. This document will outline the changes we have made and the reasons behind them.

## Mutations

### Original Vision

In our initial pitch, mutations were a core feature and a major selling point for Fowl Play. The idea was to allow players to mutate their chicken with a variety of biological and mechanical enhancements, each providing unique abilities, stat boosts, or gameplay-altering effects. We brainstormed a wide range of mutations, such as extra limbs for faster attacks, armored plating for increased defense, or mechanical wings for improved mobility. Concept art was created to visualize these features.

#### Planned Mutation Types

- **Biological Mutations:** Extra eyes, claws, tentacles, or grotesque growths that would alter the chicken's stats or grant new abilities (e.g., poison attacks, regeneration).
- **Mechanical Mutations:** Robotic limbs, armor plating, and jetpacks that would provide new combat options and movement mechanics.
- **Hybrid Mutations:** Combinations of biological and mechanical features, such as a chicken with a mechanical beaks

Each mutation was intended to have both gameplay and visual impact, changing how the chicken looked and played. Mutations could be stacked or combined, leading to wild and unpredictable builds.

### Changes and Constraints

As development progressed, we realized that implementing a full mutation system with visual changes was not feasible within our timeframe. Creating multiple models and ensuring they worked with animations would have required significant art and programming resources. As a result, we decided to scale back this feature for the player character.

### The Alternative: Weapons as Mutations

Instead of physical mutations, the chicken player will now use weapons and equipment to gain new abilities. These weapons will functionally replace mutations, providing stat boosts and special powers. In-game, these abilities will still be referred to as "mutations" for thematic and story consistency, but they will not alter the chicken's appearance. This approach allows us to keep the spirit of the original idea, while staying within our production limits.

### Mutations in the World and Lore

While the player’s chicken will not visually mutate, mutations remain a key part of the game’s world and story. Enemies and NPCs, especially bosses, will feature dramatic and grotesque mutations, both biological and mechanical. These designs reinforce the dark, unsettling atmosphere and the lore of a world obsessed with mutated chicken meat. Mutations will be referenced in the limited dialogue, environmental storytelling, and enemy design.

## Weapon Slots

In the week 6 update, we mentioned the player being able to equip two weapons and two abilities. These slots were free for the player to fill in. However, the system was not fully fleshed out yet. As a result of playtesting, we made some changes to the weapon and ability system to streamline gameplay and improve balance, such as limiting the weapon types and slots available to the player. As of Playtest One, the system is as follows:

### Weapon and Ability Slots

- **1 Melee Weapon Slot:** Equip one melee weapon (e.g., leek, butter knife or dagger).
- **1 Ranged Weapon Slot:** Equip one ranged weapon (e.g., minigun). This slot allows for distance attacks and tactical variety. _Note_ as of playtest one, only 1 ranged weapon is implemented.
- **2 Ability Slots:** Equip up to two special abilities or power-ups. Abilities can include temporary buffs, area attacks, unique movement options, or defensive maneuvers. These are activated independently from weapons and can significantly impact combat. _Note_ as of playtest one, only 1 ability is implemented.

### Inventory and Equipment Rules

- **No Duplicate Weapons:** Players cannot have multiple copies of the same weapon or ability in their inventory.
- **Slot Replacement:** Acquiring a new weapon of the same type (melee or ranged) will automatically replace the currently equipped weapon in that slot. The replaced weapon is lost unless reacquired later. _This is new since the week 6 update._
- **Ability Swapping:** New abilities found or purchased will prompt the player to choose which slot to replace if both are filled.
- **Active Weapon:** While the player can equip two different weapons, only one is active at a time. Players can switch between the two weapons during gameplay, with the press of a button.
- **Acquisition:** Weapons and abilities are purchased at [the shop](/fowl-play/gameplay/game-progression/shop) in the [poultry man menu](/fowl-play/gameplay/user-interface/poultry-man).

### Design Rationale

Limiting the player to one melee and one ranged weapon encourages a more balanced playstyle. If the player only has melee weapons, they must engage enemies up close, which increasing the challenge. Allowing two ranged weapons would make it too easy to stay at a distance and avoid danger, reducing the game's difficulty, especially during boss fights. Balancing enemies against this, while possible, is difficult and time-consuming.
Additionally, having only one ranged weapon slot encourages players to experiment with timing. Each weapon has a different cooldown and attack duration, so players must learn to time their attacks and switch their active weapon at the same time. This adds a layer of strategy to the gameplay, as players must adapt to different weapons and their cooldowns.

Preventing duplicate weapons or abilities in the inventory makes each purchase at the shop more meaningful. Players must carefully consider their choices, as purchases are final and previously replaced weapons cannot be recovered unless bought again, costing precious currency.

## Round System

In the original pitch, we envisioned a round-based system where players would face multiple waves of enemies in each arena. The idea was to create a sense of progression and challenge as players advanced through increasingly difficult rounds.

### Original Vision

- **5 Rounds per Arena:** The initial design featured five rounds, with increasing difficulty and a boss fight at the end.

### Current System

- **3 Rounds per Arena:** To improve pacing and reduce development overhead, the number of rounds has been reduced to three.
  - **Rounds 1 & 2:** Standard combat rounds featuring a mix of enemy types.
  - **Round 3:** Always a boss fight against a dramatically mutated or enhanced enemy.

### Additional Details

- **Forfeit Option:** After each round, players can choose to forfeit and end their run, sacrificing potential rewards for safety. _Note: currently, the player can always forfeit, but this will be changed in the future._
- **Progression:** Difficulty and rewards scale with each round, encouraging risk-reward decision-making.
- **Special Events:** Between rounds, players may encounter shops, healing opportunities, or story events.

## Enemy models

Our initial goal was to design multiple detailed enemies for the following three types: normal, elite, and boss. This way, the player could experience fighting against a wide variety of enemies.

### Quantity over quality

Due to a lack of time and manpower, the majority of the models were created using an easier but usable approach. This allowed us to implement a few enemy models before our first playtesting. While they are not very detailed, they are still functional within our game.

### Types of enemies

This part is somewhat tied to the round system. We wanted to have more than just regular and boss enemies. The third option was to include an elite type enemy, which would act as a 'mini-boss' before the actual boss fight. However, since the rounds were reduced from the initial 5 to just 3, there was no room to include an elite enemy. 
