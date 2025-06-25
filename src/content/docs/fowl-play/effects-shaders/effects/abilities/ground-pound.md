---
title: Ground Pound Effect
description: The effects for the Ground Pound ability
lastUpdated: 2025-06-25
author: All
---

![Ground Pound](/src/assets/fowl-play/effects-shaders/effects/abilities/ground-pound.png)

For the ground pound ability, we had this idea of making debris or rocks spawn from the ground. This idea was straightforward to implement since it primarily required a custom rock mesh, which could easily be modeled in Blender. We then used a `GPUParticle3D` node to emit these rocks, creating a visual effect of rocks erupting upwards upon impact.

## Elements

The actual implementation of this effect can be divided into three parts:

1.  **Rock Mesh Creation**
    Modeled in Blender, this includes multiple small rock pieces designed to look like natural debris.
2.  **Particle Emission**
    The rocks are emitted through a `GPUParticle3D` node, controlling the number, velocity, spread, and lifetime to simulate the explosion of debris upon impact.
3.  **Motion and Physics**
    The particles use physics properties like gravity and initial acceleration to mimic realistic rock debris behavior, creating a dynamic and immersive effect.

## Rock Mesh

![Rock Mesh](/src/assets/fowl-play/effects-shaders/effects/abilities/ground-pound-rock-mesh.png)

The model of the rock mesh was created in Blender. The design focused on making irregular, jagged shapes to mimic natural debris and add realism to the effect. By varying the size and angles of the rocks, the mesh achieves a rugged, broken appearance that enhances the impact of the ability.

## Impact Effect

The `GPUParticle3D` node handles the visual burst of the ground pound effect. It is triggered only at the moment the entity lands, ensuring the debris emission is tightly synchronized with the ground impact, enhancing the sense of force and timing.

The particle system emits numerous small rock fragments outward in a radial pattern, mimicking debris being forcefully displaced. This is achieved by using a ring-shaped emission with a wide cone angle and a tightly controlled vertical height, giving it a disc-like explosion effect.

- **Emission Shape**
  A ring shape with a radius of 8 meters and slight vertical height. This helps simulate a horizontal shockwave.

- **Random Rotation**
  All the particles rotate on the Y-axis to avoid visual repetition and add a natural, scattered look.

- **Direction and Spread**
  Debris is shot mostly upward with a 360-degree emission angle, creating a chaotic, but upward-focused burst.

- **Scale Curve**
  The particles grow quickly at first and then shrink back to zero, giving it a sense of a short-lived eruption feel.

- **Gravity**
  In the particle system, gravity is disabled so that it is clean and not affected by downward drag, which keeps the timing sharp.
