---
title: Shop Implementation
description: Implementation of the shops
lastUpdated: 2025-06-19
author: Tjorn
---

Fowl Play features a modular, extensible shop system. The game features multiple shop types (Equipment, Upgrade, Rebirth), each with their own item logic and UI, but sharing a common base for code reuse and maintainability.

## Architecture Overview

- **BaseShop**: Abstract base for all shop UIs. Handles item selection, display, and navigation.
- **EquipmentShop / UpgradeShop**: Extend `BaseShop` for equipment and in-run upgrades.
- **RebirthShop**: Special shop for permanent upgrades, does not extend `BaseShop`.
- **BaseShopItem**: Abstract base for shop item UI elements. Used only by EquipmentShop and UpgradeShop.
- **ShopItem / UpgradeShopItem**: Extend `BaseShopItem` for each shop type.
- **SkillTreeItem**: Used in RebirthShop, does not extend `BaseShopItem`.

### Diagram

```
BaseShop
 ├─ EquipmentShop
 │    └─ ShopItem (BaseShopItem)
 └─ UpgradeShop
      └─ UpgradeShopItem (BaseShopItem)

RebirthShop (custom logic)
 └─ SkillTreeItem (not BaseShopItem)
```

---

## BaseShop: Core Shop Logic

Handles displaying a list/grid of purchasable items, selection, preview, and controller navigation.

**Key Features:**

- Populates shop items from a database.
- Prevents duplicates and checks inventory as needed.
- Weighted random selection for item variety.
- Controller/keyboard navigation and focus.
- Signals for purchase completion.

**Key Methods:**

- `_refresh_shop()`: Repopulates the shop UI with available items.
- `_get_available_items()`: Filters the item database for valid items.
- `_get_shop_selection()`: Ensures variety, fills slots with random items.
- `create_shop_item(item)`: Abstract, implemented in child classes.
- `_setup_controller_navigation()`: Sets up navigation for keyboard/controller users.
- `_on_populate_visual_fields(item)`: Updates the preview panel.

---

## EquipmentShop / UpgradeShop: Specialized Shops

Both extend `BaseShop` and implement `create_shop_item()` to instantiate the correct item UI node.

- **EquipmentShop**: Checks inventory, prevents duplicates, uses `ShopItem`.
- **UpgradeShop**: Allows duplicates, uses `UpgradeShopItem`.

---

## RebirthShop: Permanent Upgrades

Handles permanent stat upgrades via a skill tree UI. Does not extend `BaseShop`.

**Key Features:**

- Groups upgrades by type.
- Displays progress and cost for each upgrade.
- Handles reset/refund logic.
- Custom controller navigation for vertical skill tree layout.

**Key Methods:**

- `_refresh_shop()`: Rebuilds the skill tree UI.
- `_get_refund_amount()`: Calculates total refund for purchased upgrades.
- `_on_stats_reset()`: Applies refund, resets upgrades and stats, refreshes UI.

---

## BaseShopItem: Shop Item UI Logic

Abstract base for shop item UI elements in Equipment and Upgrade shops.

**Key Features:**

- Focus/hover styling and signals.
- Purchase attempt logic (static `purchase_in_progress` prevents double-purchases).
- Affordability checks.
- Name label coloring based on affordability.

**Note:** Not used by RebirthShop's `SkillTreeItem`.

---

## ShopItem / UpgradeShopItem / SkillTreeItem: Concrete Item UIs

- **ShopItem** (Equipment Shop): Extends `BaseShopItem`. Handles equipment purchase logic, inventory checks, signals, and UI updates.
- **UpgradeShopItem** (Upgrade Shop): Extends `BaseShopItem`. Handles in-run upgrade purchase logic and UI updates.
- **SkillTreeItem** (Rebirth Shop): Does NOT extend `BaseShopItem`. Handles permanent upgrade logic, stat preview, and refund logic.

---

## Signals and UI Flow

- Signals are used for purchase confirmation/cancellation, previewing items, updating UI, and communication between shop items and the main shop UI.
- UI Flow:
  1. Shop is opened, `_refresh_shop()` populates items.
  2. Player navigates with mouse or controller.
  3. Hover/focus emits preview signals.
  4. Purchase attempts trigger confirmation dialogs.
  5. On confirmation, currency is deducted, item is added, and UI is refreshed.

---

## Extending the Shop System

To add a new shop type:

1. Create a new shop class extending `BaseShop`.
2. Implement `create_shop_item()` to instantiate your custom item UI.
3. Create a new shop item class extending `BaseShopItem` (or similar).
4. Implement `set_item_data()`, `populate_visual_fields()`, and `attempt_purchase()` in your item class.

---

## Best Practices

- Separate shop logic (selection, navigation) from item logic (purchase, display).
- Use signals for decoupling UI elements and game systems.
- Use static purchase lock to prevent double-purchases.
- Handle UI updates (focus, preview, cost coloring) in real time.

---

## Summary

| Class           | Purpose                             | Extends        |
| --------------- | ----------------------------------- | -------------- |
| BaseShop        | Core shop logic, item selection, UI | Control        |
| EquipmentShop   | Equipment shop, prevents duplicates | BaseShop       |
| UpgradeShop     | In-run upgrades, allows duplicates  | BaseShop       |
| RebirthShop     | Permanent upgrades, skill tree UI   | UserInterface  |
| BaseShopItem    | Shop item UI, focus/hover/purchase  | PanelContainer |
| ShopItem        | Equipment item UI and logic         | BaseShopItem   |
| UpgradeShopItem | Upgrade item UI and logic           | BaseShopItem   |
| SkillTreeItem   | Rebirth upgrade UI and logic        | PanelContainer |

---

## Related Documentation

- [Equipment Shop UI Documentation](/fowl-play/gameplay/user-interface/shops/equipment-shop)
- [Rebirth Shop UI Documentation](/fowl-play/gameplay/user-interface/shops/rebirth-shop)
- [Upgrade Shop UI Documentation](/fowl-play/gameplay/user-interface/shops/in-run-upgrade-shop)
