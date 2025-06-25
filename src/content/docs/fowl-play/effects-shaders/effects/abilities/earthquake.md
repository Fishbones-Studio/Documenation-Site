---
title: Earthquake Effect
description: The effects for the Earthquake boss move
lastUpdated: 2025-06-25
author: All
---

![Earthquake](/src/assets/fowl-play/effects-shaders/effects/abilities/earthquake.png)

The initial reason for the creation of this ability was to expand Bob’s (a boss) move set. For this ability we wanted to create an effect that reflects its destructive force. We chose a distortion effect to simulate the visual shaking and warping.

This ability uses multiple GPUParticle3D nodes to achieve the dynamic and immersive effect we aimed for. The material is applied to sphere meshes with custom shaders to generate the distortion.

## Vertex Displacement

The shader displaces the vertices of the sphere mesh based on the 3D noise texture that scrolls over time, simulating the trembling and warping of the surface.

## Scale and speed

The scale and speed determines how much the vertices are displaced and how fast the noise texture scrolls.

## Screen-Space distortion

It distorts the rendered screen texture around the spheres, creating a warping effect that visually disrupts the surrounding environment.

## Fresnel effect

Adds a glowing highlight along the edges of the spheres that changes based on the viewing angle, enhancing the sense of depth of the distortion.

## Camera Shake

This ability also features a camera shake effect whenever it’s emitted. It uses our custom camera script to adjust the shake parameters.
