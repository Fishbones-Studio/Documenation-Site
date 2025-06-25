---
title: Fire Ball Effect
description: The effects for the Fire Ball ability
lastUpdated: 2025-06-25
author: All
---

![Fire Ball](/src/assets/fowl-play/effects-shaders/effects/abilities/fireball.png)

We wanted to create an ability that could be used by both the player and enemies, a forward firing projectile. Initially, we explored options for an instant hit or fast-moving projectile, but ultimately favored a slower-moving version to allow for more strategic gameplay. To make it more visually engaging and mechanically distinct, we added a twist: the projectile would gradually increase in size as it traveled, growing more fierce until its lifetime expired. This idea evolved into what became the fireball, a slow, expanding projectile that looks majestic.

## Steps

The implementation of this ability is a bit more complex compared to the others and can be broken down into four parts:

1.  **Vision**
    Before starting to create this ability, it is important to visualize the different shapes needed to create this effect. As stated before, we had envisioned a fireball that gradually expands as it travels, which would look very majestic.

2.  **Shapes**
    The fireball is constructed from three different shapes which were custom made in Blender. The primary shape is the upper part of the fireball, which is a UV sphere with half of the vertices removed and the remaining ones slightly shifted backwards, this would create a sort of rocket-like head. Additionally, the fireball includes a core shape and trailing meshes that simulate the motion and flames behind it.

3.  **Enhancement**
    To further improve the fireball effect, a `GPUParticle3D` node was used to emit small spark particles coming out of the rear end. This added another layer of depth and made the fireball feel a bit more alive.

4.  **Composition**
    The final effect combines custom meshes, particles, and shaders to create a dynamic and visually striking fireball.

## Visual Shaders

The fireball effect is made up of multiple custom meshes, each representing a different visual component. Such as, the core, the circular head, and the trail. To bring the fireball to life and give it that majestic look we wanted, each mesh has had its own shaders created. These shaders work together to simulate the dynamic motion of a fireball, resulting in a cohesive and visually striking effect.

### Head Shaders

This shader effect simulates the heat and energy of fireball through animated textures and alpha blending.

- **Texture animation**
  UVs are offset using `TIME` and a speed vector, making the texture scroll and giving the fireball the illusion that it’s continuously moving.

- **Texture blending with gradient**
  Two textures are used to create this. A base noise texture and a secondary gradient texture. The shader compares these textures using a subtraction operation, followed by a clamp to control the output between 0 and 1, so it stays within the valid range of rendering.

- **Alpha**
  The value of the texture blending is used as the alpha channel for the fireball. This means that part of the mesh can smoothly fade in and out, simulating flickering edges without the need to use a `GPUParticle3D` node.

- **Albedo**
  This value determines the albedo of the mesh, making it have a solid color which is used as the base, while the alpha is on top of it.

### Ball Shaders

The core of the fireball primarily uses a fresnel-based transparency shader, which results in a dynamic glow and transparency effect that react naturally to the camera’s angle relative to the object’s surface. This would simulate the glowing effect of the core, which is what we wanted to achieve with this shader.

- **Fresnel**
  It uses the dot product between the surface normal and the view direction to calculate a curve, making the edges more transparent or brighter depending on the angle.

- **Inversion**
  With the invert parameter it allows the fresnel behaviour to be flipped. This allowed more control over the shader whether to make the edges glow or the center glow.

- **Power**
  This parameter controls the sharpness of the curve. A higher value results in a tighter, more focused glow, while a lower value creates a softer fade.

### Trail Shaders

Similar to the head shaders, the trail shaders use a combination of animated UV coordinates and texture blending to create a dynamic trailing effect. This technique gives the trail a smooth, flowing quality that simulates motion and fading over time, greatly enhancing the perception of speed and direction.

It works by combining two textures with animated UV coordinates;

1.  The base color texture defines the overall color and appearance of the trail.
2.  The second texture acts as a mask that scrolls over the trail’s surface based on the time and speed settings.

By continuously offsetting the UV coordinates of the mask texture, the shader simulates forward motion along the length of the trail. This scrolling effect, combined with texture blending, results in a smooth and responsive visual that reacts dynamically to change in time or velocity.

To control the transparency, the shader multiplies the color values of both textures. This blending approach enables part of the trail to gradually fade, mimicking natural vanish without requiring additional geometry. Furthermore, the shader uses additive blending, which allows the trail to glow brightly and blend visually with the surrounding environment, making it ideal for the trail effect.

## Spark Particles

![Fire Ball Spark](/src/assets/fowl-play/effects-shaders/effects/abilities/fireball-spark.png)

The spark particle is used alongside the trail shader to further enhance the sense of energy dispensation and movement. The spark particles are made using a `GPUParticles3D` node. It uses a spherical emission shape with a slight radius to avoid rigid lines, creating a natural arc. The particles are emitted along the negative X-axis with minimal spread. The speed of the particle varies from 3 to 10 with a strong radial velocity, giving each spark a sense of explosive force.
