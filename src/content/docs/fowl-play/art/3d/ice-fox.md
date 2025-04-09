---
title: Ice Fox
description: Creation process of the Ice Fox enemy
lastUpdated: 2025-04-09
author: Jun Yi
---

The Ice Fox is a common enemy in Fowl Play and is modeled, textured, rigged and animated in Blender 4.4.0.

### Add-ons

During the creation process, Blender add-ons were used to smoothen the workflow:
1. [Easy Weight Tool][1] – for symmetrical weight painting across mirrored bones
2. [Rigify][2] – for manually adding armature structure
3. [Node Wrangler][3] – to speed up material and shaders


## Model

For most of the body parts, I used the Mirror Modifier. This allowed me to maintain symmetry throughout the modeling process, which made the workflow faster and more efficient. 

The model of the Ice Fox can be divided into the following sections:

- Body
- Head
- Tail
- Front Legs
- Back Legs
- Eyes
- Ears

The reason for this seperation during modeling was to allow for more precision later on while texturing the model. Since each part was a seperate mesh, it became easier to assign and manage materials individually. It also allowed me to apply differnt UV maps to a specific part without interfering with another, giving me more control over the final structure layout of the Ice Fox.

![Ice Fox Model](../../../../../assets/3d/ice-fox/model.png)


## Texturing

My overall vision for the Ice Fox was to give it a snow-like, icy appereance with a mix of white and azure to create that frosty aestethic. To achieve this, I created a custom color palette as a reference, which helped during the texturing process.

![Color palette of the Ice Fox Model](../../../../../assets/3d/ice-fox/color_palette.png)

### UVs

For each individual mesh, I created a UV map. This gave me more control while texturing, allowing materials and shaders to align properly with the model's geometry.

### Shaders

Instead of manually texture painting the look of the model, I used shaders to generate the base colors and visual details. This method allowed for a more procedural approach, giving me flexibility to adjust the look of each part of the model quickly and non-destructively.

![Example of the shaders used for the eyes](../../../../../assets/3d/ice-fox/eyes_shaders_example.png)

### Baking

Since the shaders were only visible inside Blender, I had to bake them onto a new image texture. This allowed me to preserve the visual look of the shaders and export them as a standard textures. The baked image was then used as a material and applied to the UVs I had unwrapped, making it possible to retain the shader details even outside of Blender.

## Rigging


### Anatomy


### Inverse Kinematics




## Animations



[1]: https://extensions.blender.org/add-ons/easyweight/
[2]: https://docs.blender.org/manual/en/latest/addons/rigging/rigify/index.html
[3]: https://docs.blender.org/manual/en/latest/addons/node/node_wrangler.html
