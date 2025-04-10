---
title: Woodpecker
description: A 3D woodpecker enemy model with animations
lastUpdated: 2025-04-02
author: Jun Yi
---

The woodpecker is a common enemy that the player fights against in **Fowl Play**. This model has been created in Blender version 4.4.0.

## Model

The woodpecker model is built using modified primitive meshes - primarily cubes, circles, and cylinders - which combine to form its overall structure.

To maintain efficiency and preserve the ability to make non-destructive adjustments, the following modifiers were used:

1. **Mirror Modifier:** Ensures perfect symmetrical construction of the woodpecker and significantly reduced modeling time by only requiring one side to be sculpted
2. **Subdivision Surface Modifier:** Helped in creating smoother contours and higher detail while maintaing a low-poly base mesh.

![Woodpecker in Blender](../../../../../assets/3d/woodpecker/woodpecker.png)

### Texturing

The texturing process began with **UV unwrapping** the model to create a 2D representation of its surfaces. To efficiently generate UV maps, Blender's **Smart UV Project** tool was utilized. This automated approach provided a balanced distribution of UV islands while significantly reducing manual layout time.

The textures were painted by hand using a restrained color selection, with soft smearing effects added to enhance the horror-like artistic direction. The following color pallete was used:

1. **Legs:** #98916C
2. **Skin:** #DCCACA
3. **Beak:** #280E16
4. **Wings:** #1F191F
5. **Eyes:** #6D0400

### Rigging

Rigging was done using a fully manual bone placement process. While this approach required additional development time compared to automated solutions, it provided precise control over the armature structure. This level of control helped for implementing the woodpecker's unconventional movement patterns.

The armature follows an avian anatomical structure (_somewhat_), primarily based on chicken physiology while incorporating intentionally exaggerated proportions and movement capabilities. This hybrid approach blends realistic foundations with stylized enhancements to achieve bone flexibility.

## Animations

All of the animations were created in Blender with the help of rigging. Due to the placement of several bones in the model, it was easy to move the woodpecker around and keyframe different poses to create believable movement while maintaining its characteristics during gameplay. 

The animations are set to run at 30 FPS.

### Idle

The woodpecker idle animation is straightforward, it remains still, only occasionally moving its tail and wiggling its head.

![Woodpecker idle animation](/woodpecker/idle-animation.gif)

### Walk

For this animation, the woodpecker combines multiple movement styles. The goal was to make its walk resemble that of a humanoid character while retaining some bird-like traits—such as slight wing flapping during movement.

![Woodpecker walk animation](/woodpecker/walk-animation.gif)

### Attack

The inspiration for this animation mainly comes from how a real woodpecker behaves, where it continuously pecks at a tree. This animation mimics its behavior but with a more bizarre movement pattern, as it only utilizes the neck and head bones, unlike the real bird, which also involves its upper body.

![Woodpecker attack animation](/woodpecker/attack-animation.gif)

### Fall

When falling from a jump or glide, the woodpecker flaps once (but not hard) to show it's not trying to fly. At the same time, its legs slowly move into landing position to make the fall look realistic.

![Woodpecker fall animation](/woodpecker/fall-animation.gif)

### Glide

The woodpecker's gliding motion takes inspiration from chickens, which continuously flap their wings to maintain airspeed and slow their descent. In this animation, the woodpecker flaps its wings more vigorously than normal, showing how hard it's working to stay airborne.

![Woodpecker glide animation](/woodpecker/glide-animation.gif)

### Jump

The woodpecker jumps like a mix between a humanoid and a chicken. Its legs stay close together while it flaps its wings hard, making it look like it's really pushing upward.

![Woodpecker jump animation](/woodpecker/jump-animation.gif)
