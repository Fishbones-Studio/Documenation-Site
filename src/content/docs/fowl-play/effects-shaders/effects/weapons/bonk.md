---
title: Bonk Effect
description: Leek Weapon bonk effect
lastUpdated: 2025-06-25
author: All
---

For the [leek weapon](/fowl-play/gameplay/combat/melee-combat/weapons/leek), we have added a special effect for when it’s used by the player to hit an enemy. This effect is implemented by creating a Tween instance on the target’s model node, then queuing multiple scale transitions with specific durations and scale targets to simulate a cartoonish impact.
