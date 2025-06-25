---
title: Ground Pound Effect
description: The effects for the Ground Pound ability
lastUpdated: 2025-06-25
author: All
---

# Ground Pound

Spawns debris/rocks from the ground using a custom rock mesh and GPUParticle3D.

## Elements

1. **Rock Mesh:** Irregular, jagged shapes for realism.
2. **Particle Emission:** GPUParticle3D controls number, velocity, spread, and lifetime.
3. **Motion & Physics:** Uses gravity and acceleration for dynamic debris.

## Impact Effect

- **Ring-shaped Emission:** 8m radius, slight vertical height for horizontal shockwave.
- **Random Rotation:** Y-axis for natural look.
- **Direction & Spread:** Upward, 360° emission.
- **Scale Curve:** Quick growth, then shrink.
- **Gravity:** Disabled for sharp timing.
