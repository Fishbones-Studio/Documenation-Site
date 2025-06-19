---
title: Currency
description: Currency system in Fowl Play
lastUpdated: 2025-06-19
author: Tjorn
---

Fowl Play features a two currency system designed to enhance both short- and long-term progression. The two main types of currency are:

- **Prosperity Eggs**: The primary, run-based currency used for most in-game purchases and temporary upgrades during a play session. Short term progression.
- **Feathers of Rebirth**: A rare, persistent currency used for unlocking permanent upgrades and special features across multiple playthroughs. Long term progression.

## Prosperity Eggs

**Prosperity Eggs** are the main currency you will earn and spend during each run. They are obtained by winning rounds and can be used to purchase items and upgrades in various in-game shops.

- **How to Earn:**

  - Awarded after each victorious round.
  - The amount earned increases with the number of rounds won.

- **Usage:**

  - Spend in the [Equipment Shop](/fowl-play/gameplay/user-interface/shops/equipment-shop) and [In-Run Upgrade Shop](/fowl-play/gameplay/user-interface/shops/in-run-upgrade-shop) to buy items and temporary upgrades.

- **Reset Mechanic:**
  - Upon death, your Prosperity Eggs are reset based on your progress:
    - This ensures you always have enough to purchase at least one item in the Equipment Shop at the start of a new run, enhancing gameplay variety and making the game fairer towards the player.

```gdscript
prosperity_eggs = clamp(
    (100 + current_round * int(arena_round_reward.get(CurrencyEnums.CurrencyTypes.PROSPERITY_EGGS, 50) / 2.0)), 200, 200
)
```

## Feathers of Rebirth

**Feathers of Rebirth** are a special, persistent currency that carries over between runs and deaths. They are much rarer than Prosperity Eggs and are used to unlock powerful, permanent upgrades.

- **How to Earn:**

  - Awarded for winning entire runs.
  - Can also be obtained by sacrificing your chicken in the [Poultry Man Menu](/fowl-play/gameplay/user-interface/poultry-man).

- **Usage:**

  - Spend in the [Rebirth Shop](/fowl-play/gameplay/user-interface/shops/rebirth-shop) to unlock permanent upgrades and enhancements.
    - Spend with the shopkeeper in the [In-Run Upgrade Shop](/fowl-play/gameplay/user-interface/shops/in-run-upgrade-shop#resetting-the-shop) to reset/refresh the shop inventory.

- **Persistence:**
  - Feathers of Rebirth do **not** reset on death.
  - They can only be lost by performing a complete save reset via the main menu or by manually deleting your save file.
