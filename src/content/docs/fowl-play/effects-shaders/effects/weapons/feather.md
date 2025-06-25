---
title: Feather Effects
description: Effects for the Feather weapon
lastUpdated: 2025-06-25
author: All
---

![Feather Effects](/src/assets/fowl-play/effects-shaders/effects/feather-launch.png)

When the [feather](/fowl-play/gameplay/combat/ranged-combat/weapons/feather) is launched, two GPUParticle3D nodes emit simultaneously: the wind effect emits continuously during flight to simulate gentle airflow with directional velocity, while the launch effect triggers a one-shot emission with explosiveness set to 1 to create the initial release burst effect.
