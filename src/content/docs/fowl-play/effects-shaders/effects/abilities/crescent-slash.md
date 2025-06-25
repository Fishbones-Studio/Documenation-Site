---
title: Crescent Slash Effect
description: The effects for the Crescent Slash ability
lastUpdated: 2025-06-25
author: All
---

![Crescent Slash](/src/assets/fowl-play/effects-shaders/effects/abilities/crescent-slash.png)

This ability is created using a GPUParticles3D node to efficiently emit the particles that form the slash effect.

## Mesh Type

The particles are rendered using a QuadMesh as its visual base. The reason for choosing a QuadMesh is to allow for easier UV mapping, which is important later on while animating the slash sequence.

## Shape

The flat particles textures are turned into curved shapes by converting the 2D coordinates into polar coordinates.

## Noise

A NoiseTexture2D is applied to add variation to the outer edges of the shape, making it look more dynamic.

## Glow

To make the slash glow, the shader adds brightness by increasing the emission value, which makes the effect look bright and radiant.

## Animated UV Coordinates

To create the arching animation, the vertical component of the polar-transformed UVs is shifted over time, based on the progress value tied to the particle’s lifetime. This produces a smooth sweeping arc effect that fades out as the particles expire.
