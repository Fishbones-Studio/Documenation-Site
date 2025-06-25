---
title: Crescent Slash Effect
description: The effects for the Crescent Slash ability
lastUpdated: 2025-06-25
author: All
---

# Crescent Slash

**Crescent Slash** uses a `GPUParticles3D` node to efficiently emit the particles that form the slash effect.

- **Mesh Type:** QuadMesh for easy UV mapping and animation.
- **Shape:** Flat particle textures are curved by converting 2D coordinates into polar coordinates.
- **Noise:** A `NoiseTexture2D` adds variation to the outer edges for a dynamic look.
- **Glow:** Shader increases emission for a bright, radiant effect.
- **Animated UVs:** The vertical component of the polar-transformed UVs is shifted over time, creating a sweeping arc that fades as particles expire.
