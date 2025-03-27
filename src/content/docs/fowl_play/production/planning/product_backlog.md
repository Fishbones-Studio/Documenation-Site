---
title: Product Backlog
description: Our Product Backlog for Fowl Play
lastUpdated: 2025-03-27
author: Jun Yi, Sly, Nick, Tjorn
---

## Introduction

For the development of Fowl Play, we have chosen to work with Scrum. This approach gives us the flexibility to adapt tasks as needed and have regular evaluations of the game. For our scrum board, we will use [Trello](https://trello.com/b/KfBXcMj7/project-fowl-play).

## Roles

<table>
  <tr>
   <td colspan="3">Fowl Play Team</td>
  </tr>
  <tr>
   <td>Product Owner</td>
   <td>Nick Frietman</td>
   <td>Programmer, Producer</td>
  </tr>
  <tr>
   <td>Scrum Master</td>
   <td>Tjorn Brederoo</td>
   <td>Programmer, Producer, Sound</td>
  </tr>
  <tr>
   <td>Development</td>
   <td>Jun Yi Xie</td>
   <td>Programmer, 3D</td>
  </tr>
  <tr>
   <td>Development</td>
   <td>Sly Moertanom</td>
   <td>Programmer</td>
  </tr>
  <tr>
   <td>Development</td>
   <td>Joyce Stoop</td>
   <td>Artist, 3D, Sound</td>
  </tr>
  <tr>
   <td>Development</td>
   <td>Finn Korf</td>
   <td>Artist, 3D</td>
  </tr>
  <tr>
   <td>Development</td>
   <td>Bastiaan Smeets</td>
   <td>Programmer</td>
  </tr>
  <tr>
   <td>Development</td>
   <td>Cenker Aydin</td>
   <td>Programmer, Sound</td>
  </tr>
</table>

## Sprints

Each sprint lasts two weeks, to make sure meetings are regular but not overwhelming. Two weeks fit with the short timeline for this project, allowing us to divide the remaining time in six sprints.

###

### Planning

<table>
  <tr>
   <td></td>
   <td>Start Date</td>
   <td><strong>End Date</strong></td>
  </tr>
  <tr>
   <td>Sprint 1</td>
   <td>28 March 2025</td>
   <td>11 April 2025</td>
  </tr>
  <tr>
   <td>Sprint 2</td>
   <td>14 April 2025</td>
   <td>25 April 2025</td>
  </tr>
  <tr>
   <td>Sprint 3</td>
   <td>28 April 2025</td>
   <td>9 May 2025</td>
  </tr>
  <tr>
   <td>Sprint 4</td>
   <td>12 May 2025</td>
   <td>23 May 2025</td>
  </tr>
  <tr>
   <td>Sprint 5</td>
   <td>26 May 2025</td>
   <td>6 June 2025</td>
  </tr>
  <tr>
   <td>Sprint 6</td>
   <td>9 June 2025</td>
   <td>19 June 2025</td>
  </tr>
</table>

### Daily Scrum

The Development team will provide regular updates on their work progress. This way, the other Scrum members know about the progress and any obstacles encountered.

### Retrospectives

At the end of each Sprint, the Fowl Play team will hold a retrospective meeting. In this meeting, we will:

1. Review what went will in the Sprint
2. Discuss what could be improved
3. Decide what will be done in the next sprint

### Backlog Refinement

During each sprint, the Product Owner will refine the backlog as needed. This ensures user stories and tasks remain clear and well-defined for the Development team.

##

## Definition of Ready

A User Story is Sprint-Ready when it meets the following criteria:

1. Each Epic follows the same structure as a User Story and consists of one or more User Stories.
2. Each User Story follows the structure: "As [role], I want [need], to achieve [goal]."
3. During Backlog Refinement, the team collectively discusses each User Story to ensure it is clearly defined and achievable within the next Sprint.
4. Each User Story contains at least one acceptance criterion that has been reviewed and discussed with the Development Team.
5. During each Sprint, the Epics, User Stories, and Tasks in the Sprint Backlog are prioritized.

## Definition of Done

A User Story is marked as ‘done’ when it meets the following criteria:

1. The delivered code has been reviewed by at least one other member of the Development Team.
2. The delivered code contains sufficient comments, so it can be understood by all members.
3. The delivered code follows the specified code conventions.
4. All associated acceptance criteria of the User Stories are completed and tested.
5. All bug reports related to the User Story are resolved where possible and otherwise discussed with the team.
6. Where possible, the delivered code is modular and easy to read, following DRY principles.
7. Appropriate documentation is added.

## Epics

Epics are large, high-level goals that break down the project vision into more manageable pieces. For the development of Fowl Play, we have defined multiple epics to structure work across all sprints.

### Character Models and Animations

As a player, I want high-quality 3D models and fluid animations, so that entities and environments feel immersive and responsive.

### Character Movement

As a player, I want to control my character in the game, so I can interact and navigate through the level.

### Enemy AI and Behavior

As a player, I want enemies to have unique attack patterns and behaviors, so each fight feels different.

### Combat System

As a player, I want a variety of weapons, abilities, passives, and biological and mechanical mutations, so I can experiment with different combat play styles

### Game Sound Design

As a player, I want impactful sound effects and music, so that the atmosphere of the game feels more dynamic and engaging.

### Meta Progression

As a player, I want a roguelike progression system, so that I can feel a sense of improvement after each fight.

### Game Interfaces and Design

As a player, I want the User Interfaces to be modern and match the overall style of the game, so that it enhances user engagement, improves usability, and provides a seamless experience.

### Game Visuals and Shaders

As a player, I want visually striking effects and dynamic shaders, so that the game feels more immersive and the combat feels more intense and engaging.

##

## User Stories

User Stories are epics broken down in pieces, that can be worked on by individual Scrum members during a sprint.

### Creating detailed default player models

As a player, I want the default player model to be animated, so the current action is always clear to me.

Acceptance Criteria

1. The models match the intended art direction of Fowl Play.
2. Models are rigged and animated
3. The models are exported in a format suitable for the Godot game engine (.glb).

### Creating detailed default enemy models

As a player, I want to see detailed and clear enemy models, so I always know where the enemy is located.

Acceptance Criteria

1. There are multiple enemy models and its styling matches the art direction.
   1. The models and textures are visually clear, so they don't overwhelm the player
   2. The model and texture fit in the designated area, and don’t clash with existing environmental objects.
2. The models are exported in a format suitable for the Godot game engine (.glb).

### Enemy model basic animations

As a player, I want well-animated enemy models, so I can read and then react to their actions.

Acceptance Criteria

1. The enemy model must have a basic attack animation.
2. The enemy model must have a basic idle animation.
3. The enemy model must have a basic chase animation.
4. The enemy model must have a basic hurt animation.
5. The enemy model must have a basic death animation.
6. Frame rate is consistent.

### Player model idle animation

As a player, I want a uniform idle animation for the player model, so the model looks natural and visually appealing while idle in the game.

Acceptance Criteria

1. The idle animation of the player model should take inspiration from that of a real life chicken (e.g., slight head or wing movement).
2. Frame rate is consistent.

### Player model walking animation

As a player, I want a uniform walking animation for the player model, so the model looks natural and visually appealing while walking in the game.

Acceptance Criteria

1. The walking animation of the player model should take inspiration from that of a real life chicken (e.g., head bobbles a bit with each step).
2. Frame rate is consistent.

### Player model running animation

As a player, I want a uniform running animation for the player model, so the model looks natural and visually appealing while running in the game.

Acceptance Criteria

1. The running animation of the player model should take inspiration from that of a real life chicken (e.g., quick steps with a slight wobble).
2. Frame rate is consistent.

### Player model jumping animation

As a player, I want a uniform jumping animation for the player model, so the model looks natural and visually appealing while jumping in the game.

Acceptance Criteria

1. The jumping animation of the player model should take inspiration from that of a real life chicken (e.g., legs are extended upwards and slight flap of the wings).
2. Frame rate is consistent.

### Player model falling animation

As a player, I want a uniform falling animation for the player model, so the model looks natural and visually appealing while falling in the game.

Acceptance Criteria

1. The falling animation of the player model should take inspiration from that of a real life chicken (e.g., facing downwards while falling and slight wing flapping).
2. Frame rate is consistent.

### Player model gliding animation

As a player, I want a uniform gliding animation for the player model, so the model looks natural and visually appealing while gliding in the game.

Acceptance Criteria

1. The gliding animation of the player model should take inspiration from that of a real life chicken (e.g., continuously flapping its wing).
2. Frame rate is consistent.

### Player model dashing animation

As a player, I want a uniform dashing animation for the player model, so the model looks natural and visually appealing while dashing in the game.

Acceptance Criteria

1. The dashing animation of the player model should take inspiration from that of a real life chicken (e.g., accelerates forwards very fast with a few wing flaps).
2. Frame rate is consistent.

### Player model default melee attack animation

As a player, I want a uniform default melee attack animation for the player model, so the model looks natural and visually appealing while performing a melee attack in the game.

Acceptance Criteria

1. The melee attack animation of the player model should take inspiration froma real life chicken (e.g., punches with its wings, or pecks the enemy).
2. Frame rate is consistent.

### Player model default ranged attack animation

As a player, I want a uniform default ranged attack animation for the player model, so the model looks natural and visually appealing while performing a ranged attack in the game.

Acceptance Criteria

1. The ranged attack animation of the player model should take inspiration from that of a real life chicken (e.g., throws an egg).
2. Frame rate is consistent.

### Designing the main arena

As a player, I want to compete in an arena with clear navigation, so that matches feel engaging, fair, and allow for tactical decision-making.

Acceptance Criteria

1. The arena should be dynamic.
2. The arena has proper collision hitboxes, so the player will not phase through any relevant objects.

### Designing the arena props

As a player, I want to have relevant props inside the arena, so I feel immersed within the level.

Acceptance Criteria

1. The props are relevant to the arena theme and environment (e.g., walls, pillars, pipes, floor, cages, barrels, rocks, fungi).
2. The models are exported in a format suitable for the Godot game engine (e.g., .glb).
3. The models are properly textured.

### Designing the 3D environmental hazards

As a player, I want environmental hazards, so the level has dynamic challenges besides the enemy.

Acceptance Criteria

1. There should be multiple environmental hazards, each with a unique design (e.g., saw, spikes, webs, lava, etc).
2. The environmental hazards should be 3D.
3. The models are exported in a format suitable for the Godot game engine (e.g., .glb).
4. The models are properly textured.

### Basic environmental hazards animation

As a player, I want the environmental hazards animated for each hazard type, so they look more visually appealing and create a stronger effect during gameplay.

Acceptance Criteria

1. The animation of each environmental hazard is distinct.
2. Frame rate is consistent.

### Easy to configure and manage animations

As a player, I want to create an animation tree for the animations, so that animations can be easily configured and managed.

Acceptance Criteria

1. It’s created in Godot’s AnimationTree node
2. The animations have clear and easy to understand names.

### Blend tree animations

As a player, I want to create a blend tree for the animations, so that animations can be easily blended.

Acceptance Criteria

1. Multiple animations are integrated into the blend tree.

### Movement animation state machine

As a player, I want to create an animation state machine for movement animations, so that animations can be easily switched and blended.

Acceptance Criteria

1. The movement animations include at least idling, walking, running, jumping, gliding, falling and dashing states.
2. The state machine allows for easy addition or modification of movement animations.

### Attack animation state machine

As a player, I want to create an animation state machine for attack animations, so that animations can be easily switched and blended.

Acceptance Criteria

1. The attack animations include at least melee and ranged attack states.
2. The state machine allows for easy addition or modification of movement animations.

### One-shot attack animation node

As a player, I want to create a one-shot animation node for attack animations, so that attack animations only play once and not continuously.

Acceptance Criteria

1. Attack animations must only play once and cannot be chained, until the previous animation is finished.

### Smooth animation transitions

As a player, I want to make sure animation transitions are properly blended, so they feel smooth and not clunky.

Acceptance Criteria

1. Transitions between each animation must feel natural.
2. There should be no stuttering or inconsistency for transitions.

### Cardinal and diagonal movement

As a player, I want to smoothly move my chicken in the cardinal and diagonal directions, so I can dodge enemy attacks and strategically reposition myself.

Acceptance Criteria

1. The player can press the movement keys to move in the cardinal and diagonal directions.
2. Movement speed should be configurable.
3. Camera should smoothly follow the player movement.
4. Camera should be behind the player.

### Vertical movement

As a player, I want to smoothly move my chicken vertically, so that I can evade enemy attacks and navigate the arena.

Acceptance Criteria

1. The player can press the jump key to perform a jump.
2. The player can press the jump key while airborne to perform a double jump.
3. The player can adjust cardinal and diagonal movement while airborne.
4. The player falls at a natural rate due to gravity.

### Stamina System

As a player, I want a clear and intuitive stamina system for my chicken, so I have to strategically perform certain actions.

Acceptance Criteria

1. The chicken has a stamina property.
2. Stamina regenerates gradually when not in use.
3. Different actions consume varying amounts of stamina.
4. Stamina is visually displayed on the screen.

### Sprint Mechanic

As a player, I want my chicken to be able to sprint, so I can move faster and reposition myself quicker.

Acceptance Criteria

1. The player can press the sprint key to perform a sprint.
2. Holding the spring key will let the player keep sprinting.
3. The player sprints in the facing direction.
4. The sprint speed should be configurable.
5. Sprinting drains stamina.

### Dash Mechanic

As a player, I want the chicken to have a dash mechanic, so I can quickly approach or evade enemies and combat feels more dynamic.

Acceptance Criteria

1. The player can press the dash key to perform a dash.
2. The player dashes in the facing direction.
3. The dash has a duration, speed, and cooldown.
4. The dash properties should be adjustable.
5. The dash drains stamina.

### Glide Mechanic

As a player, I want the chicken to have a glide mechanic, so I can slowly fall towards the ground and dodge attacks while airborne.

Acceptance Criteria

1. The player can hold the jump key while falling to perform a glide.
2. The player glides in the facing direction.
3. The glide speed should be adjustable.
4. Gliding drains stamina.

### Enemy pathfinding

As a player, I want the enemy AI to navigate through the level intelligently, so that they can chase or engage in combat with the players effectively without getting stuck on obstacles.

Acceptance Criteria

1. .. idk..

### Enemy behaviour trees

As a player, I want the enemy AI to use behaviour trees, so that their decision making feels structured and responsive to different situations.

Acceptance Criteria

1. The AI must have fallback behaviours.
2. .. idk..

### Enemy steering behaviours

As a player, I want the enemy AI to use steering behaviours, so that their movement feels realistic and responsive in the game.

Acceptance Criteria

1. .. idk..

### Enemy unique attack patterns

As a player, I want the enemy AI to have unique attack patterns, so that their behaviour feels dynamic and challenging.

Acceptance Criteria

1. Each enemy must have at least two distinct attack types (e.g., melee and ranged attacks).
2. Each enemy has a specific attack pattern which suits their behaviour (e.g., a fat chicken is slow, but does high damage).

### Main menu soundtrack

As a player, I want to have a soundtrack play while I’m on the main menu screen, so that I can have an immersive audio experience while exploring the game’s interface.

Acceptance Criteria

1. The soundtrack should start playing automatically when the main menu screen is displayed.
2. The soundtrack should loop while the player remains on the main menu screen.
3. The volume should be adjustable in the game’s settings menu (e.g., Music Volume or Master Volume).
4. The soundtrack is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Poultry Man soundtrack

As a player, I want to have relaxing and wholesome music in the Poultry Man UI, so that it enhances the atmosphere while I am doing my tasks as a poultry man.

Acceptance Criteria

1. The soundtrack should start playing once the player enters the Poultry Man UI.
2. The soundtrack should continuously loop while the player is still on the Poultry Man UI.
3. The volume should be adjustable in the game’s settings menu (e.g., Music Volume or Master Volume).
4. The soundtrack is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Arena fight soundtrack

As a player, I want an intense soundtrack to play during arena fights, so that it enhances the atmosphere and excitement of the battle.

Acceptance Criteria

1. The soundtrack should start playing once the player enters the arena.
2. The soundtrack should continuously loop during the fight.
3. The soundtrack should stop when the fight ends.
4. The volume should be adjustable in the game’s settings menu (e.g., Music Volume or Master Volume).
5. The soundtrack is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Boss fight soundtrack

As a player, I want a custom-made soundtrack to play during the boss fight, so that it adds more depth and immersion to the final fight while keeping you excited.

Acceptance Criteria

1. The soundtrack should start playing immediately once the boss appears in the arena.
2. The soundtrack should continuously loop while the boss is still present in the arena.
3. The soundtrack should stop or transition (e.g., to the regular arena fight soundtrack) when the boss fight ends.
4. The volume should be adjustable in the game’s settings menu (e.g., Music Volume or Master Volume).
5. The soundtrack is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Idle sound effects

As a player, I want my character to have idle sound effects, so that they enhance the auditory experience and make the game feel more immersive, even when the character is standing still.

Acceptance Criteria

1. The idle sound effects should play occasionally while the player’s character is in the idle movement state.
2. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
3. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Walking sound effects

As a player, I want walking sound effects to play when my character walks, so that they enhance the auditory experience and make the game more immersive.

Acceptance Criteria

1. The walking sound effects should play while the player’s character is in the walk movement state (e.g., pressing any movement keys).
2. The sound effects should immediately stop playing when the character is not in the walk movement state.
3. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
4. The soundtrack is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Running sound effects

As a player, I want running sound effects to play when my character runs, so that they enhance the auditory experience and make the game more immersive.

Acceptance Criteria

1. The running sound effects should play while the player’s character is in the sprint movement state (e.g., holding the run key while moving).
2. The sound effects should immediately stop playing when the character is not in the sprint movement state.
3. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
4. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Jumping sound effects

As a player, I want jumping sound effects to play when my character jumps, so that they enhance the auditory experience and make the game more immersive.

Acceptance Criteria

1. The jumping sound effects should play while the player’s character is in the jump movement state (e.g., pressing the jump key).
2. The sound effects should immediately stop playing when the character is not in the jump movement state.
3. The sound effects should play again while the player’s character tries to jump while airborne.
4. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
5. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Falling sound effects

As a player, I want falling sound effects to play when my character falls, so that they enhance the auditory experience and make the game more immersive.

Acceptance Criteria

1. The falling sound effects should play while the player’s character is in the fall movement state.
2. The sound effects should immediately stop playing when the character is not in the fall movement state.
3. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
4. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Gliding sound effects

As a player, I want gliding sound effects to play when my character glides, so that they enhance the auditory experience and make the game more immersive.

Acceptance Criteria

1. The gliding sound effects should play while the player’s character is in the glide movement state.
2. The sound effects should immediately stop playing when the character is not in the glide movement state.
3. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
4. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Dashing sound effects

As a player, I want dashing sound effects to play when my character dashes, so that they enhance the auditory experience and make the game more immersive.

Acceptance Criteria

1. The dashing sound effects should play while the player’s character is in the dash movement state.
2. The sound effects should immediately stop playing when the character is not in the dash movement state.
3. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
4. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Attacking sound effects

As a player, I want attacking sound effects to play when my character is performing an attack, so that they enhance the auditory experience and make the combat feel more alive.

Acceptance Criteria

1. The attack should have a distinct sound effect that is easily recognizable.
2. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
3. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Taking damage sound effects

As a player, I want sound effects to play when my character takes damage, so that they enhance the auditory experience and provide clear indication of when I get hurt.

Acceptance Criteria

1. The sound effects should play when the player’s character takes damage (e.g., their health gets depleted by the enemy or environmental hazards).
2. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
3. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Dying sound effects

As a player, I want sound effects to play when my character dies, so that they enhance the auditory experience and inform me of my death in the arena.

Acceptance Criteria

1. The sound effects should play when the player’s character health reaches 0.
2. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
3. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Environmental Hazards sound effects

As a player, I want sound effects to play when interacting with the environmental hazards, so that they enhance the auditory experience and make hazards feel more immersive.

Acceptance Criteria

1. Different environmental hazard types should have distinct sound effects.
2. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
3. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Weapon sound effects

As a player, I want weapons to have unique sound effects when used, so that they enhance the auditory experience and make the game more immersive

Acceptance Criteria

1. Different weapon types should have distinct sound effects.
2. The sound effects should play when the weapon is used.
3. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
4. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### User Interface sound effects

As a player, I want sound effects to play for UI interactions (e.g., hover, button clicks), so that they enhance the overall user and audio experience while interacting with the UI.

Acceptance Criteria

1. The volume should be adjustable in the game’s settings menu (e.g., SFX Volume or Master Volume).
2. The sound effect is exported in a format suitable for the Godot game engine (e.g., .mp3, .wav or .ogg).

### Arena selection

As a player, I want to be able to select which arena my chicken will fight in, so that I can choose my preferred battleground and strategize accordingly.

Acceptance Criteria

1. Arenas can be selected from a selection screen.
2. Each arena has a preview image, name and description.
3. Locked arenas are clearly distinguishable from unlocked arenas.

### Underground sewer arena

As a player, I want my chicken to fight in an underground sewer arena filled with toxic environmental hazards, so that I must avoid any dangerous obstacles and quickly finish the fight.

Acceptance Criteria

1. The floor is unstable and has different holes in them, which decay overtime.
2. While you are in the sewage water, you will slowly take continuous damage over time.
3. Environmental hazards are present which cause damage to the player.
4. Obstacles can prevent the player from falling down.

### Underground water arena

As a player, I want my chicken to fight in an arena surrounded by water and floating platforms, so that I must be sharp with my movement to prevent falling into the water.

Acceptance Criteria

1. The floor is made of water.
2. There are floating platforms, which slowly disappear over time the longer you stand on them.
3. Falling into water slows the player's movement and prevents you from jumping.
4. The longer you stay submerged in water, the faster you will drown.

### Lava pit arena

As a player, I want my chicken to fight in an arena with volcanic terrain and lava hazards, so that I must stay mobile and adapt to the environment.

Acceptance Criteria

1. There is a central platform surrounded by lava.
2. Falling into lava damages the players.
3. The arena contains hazards, forcing the player to move and reposition.

### Abandoned cave arena

As a player, I want my chicken to fight in an arena with unstable terrain and dangerous hazards, so that I must be cautious of my surroundings and play with an observant play style

Acceptance Criteria

1. The arena has rocks that frequently fall, creating dynamic obstacles.
2. The arena contains various hazards (e.g., spikes or webs).
3. Terrain may shift or collapse due to instability.

### Game Logo

As a player, I want a high-quality, visually distinctive game logo, so that I can immediately recognize the game.

Acceptance Criteria

1. The file format should be either .jpg or .png.
2. Matches the game art style.
3. There should be three variants, black, white and transparent versions of the logo.

### Game Icon

As a player, I want there to be a custom game icon, so I can see a visible icon in my taskbar while I have the game running.

Acceptance Criteria

1. The game icon should have an uniform size (e.g., 16x16 or 256x256).
2. The file format should be .ico (macOS) or .svg (windows).

### Main theme design

As a player, I want there to be a main theme design, so that the game has a styling theme it follows to stay consistent with all UI aspects of the game.

Acceptance Criteria

1. Unified typography for all text elements
2. The different components have been styled and are identical.
3. There are main and accent colors for the game.
4. The sizing and spacing is optimal.
5. There is a style guide.

### Main menu interface

As a player, I want an engaging and clear main menu, so that I can easily navigate the game's features.

Acceptance Criteria

1. Main menu should be visually appealing.
2. The logo should be visible in the main menu.
3. There are different buttons present in the main menu which represent different parts of the game (e.g., start game, settings, etc).
4. The layout should be unique.
5. The styling is consistent.

### Loading screen

As a player, I want to see a loading screen if it takes too long to transition between UI’s, so that I have something to look at while I am waiting.

Acceptance Criteria

1. The loading screen has smooth transitions.

### Settings menu

As a player, I want to customize my game settings, so that I can adjust the experience to my preferences.

Acceptance Criteria

1. Able to change the music and sounds of the game.
2. Able to change the key bindings.
3. Able to change the graphics (e.g., combat visual effects).
4. Able to change the display settings (e.g., resolutions and full screen).
5. User friendly layout and theme matches with the rest of the UI.

### Pause menu

As a player, I want to be able to pause my game, so that I can temporarily freeze my gameplay.

Acceptance Criteria

1. The pause menu freezes the game.
2. The pause menu should pop up instantly with no delay.
3. The pause menu overlays on top of the current game scene.
4. Shows different options like saving, forfeiting, resuming and settings menu.
5. The design is in line with other key UI elements.

### Poultry Man menu

As a player, I want to have a visible poultry man menu, so that I can efficiently navigate through different parts while I am playing as the poultry man in the game.

Acceptance Criteria

1. The overall layout should be unique and from the point of view of the poultry man.
2. There are interactable assets / objects which take the player to a different part of the UI (e.g., clicking on the arena brings you to the fighting aspect of the game).

### Player hit points HUD

As a player, I want a health bar to display during the gameplay, so that I am aware of how many hit points I have lost so far in the fight.

Acceptance Criteria

1. It should show the remaining hitpoints in rounded numbers.

### Player stamina HUD

As a player, I want to have a clear visible stamina bar during the arena fight, so that I can effectively manage my movement actions based on remaining stamina.

Acceptance Criteria

1. Stamina HUD should be positioned in a clear way and not block any important gameplay views.

### Player stats UI

As a player, I want to have a screen which shows the stats my character has, so that I know what the strengths and weaknesses of my character is.

Acceptance Criteria

1. The stats screen should display hit points, attack, defense, weight and speed.
2. The UI needs to be consistent with other elements.

### Player weapons and abilities HUD

As a player, I want to have a HUD which displays the weapons and abilities I have in the fight, so that I know which weapons are at my disposal and the different abilities which I could utilize during the fight.

Acceptance Criteria

1. The hud shouldn’t block or interrupt the player’s character view.

### Enemy general HUD

As a player, I want enemies to also have a visible HUD display, so that I know how many hit points they have and other kinds of statuses.

Acceptance Criteria

1. The enemy HUD should be visible and not interrupt any gameplay or the view of the player’s character.

### Weapon icons

As a player, I want to have custom icons for all the weapons, so that while in a fight the player can easily tell which weapon he has equipped in his HUD.

Acceptance Criteria

1. Each weapon should have distinct icons and should easily be recognizable.
2. The icons are consistent in sizing.
3. The icons follow the main theme of the game.
4. There’s enough contrast between the icons and any relevant background elements.

### Ability icons

As a player, I want to have custom icons for all the upgrades, so that I immediately can tell what available abilities I have while I’m fighting in the arena.

Acceptance Criteria

1. Each ability should have distinct icons and should easily be recognizable.
2. The icons are consistent in sizing.
3. The icons follow the main theme of the game.
4. There’s enough contrast between the icons and any relevant background elements.

### Armor icons

As a player, I want to have custom icons for all the armors, so that it's easier to differentiate the different armor types and easier to recognize.

Acceptance Criteria

1. Each armor should have distinct icons and should easily be recognizable.
2. The icons are consistent in sizing.
3. The icons follow the main theme of the game.
4. There’s enough contrast between the icons and any relevant background elements.

### Upgrade icons

As a player, I want to have custom icons for all the upgrades, so that it adds more characteristics and is visually pleasing to the player’s eyes.

Acceptance Criteria

1. Each upgrade should have distinct icons and should easily be recognizable.
2. The icons are consistent in sizing.
3. The icons follow the main theme of the game.
4. There’s enough contrast between the icons and any relevant background elements.

### Selection of arena UI

As a player, I want to have a UI before I enter the arena that shows which arena I can fight in, so that I can choose the best arena for my character to fight in.

Acceptance Criteria

1. Lists all the available arena’s the player can choose from.
2. Description of each arena with their own gimmick.

### General Shop UI

As a player, I want a shop where I can buy different kinds of items (e.g., weapons, armor, abilities, etc), so that I can spend the currency I have won from fighting in the arena and strengthen my character.

Acceptance Criteria

1. Show the amount of currency the player has in possession.
2. Each item has its own price.
3. Description for each item to inform of what they can do.
4. A confirm button, to prevent the player from accidental purchases.
5. Static sets of item types which can be shown in the shop (e.g., a shop always has two weapons that are being sold).

### Upgrade UI

As a player, I want an UI for my meta progression, so that I can upgrade my chicken with the currency earned from the arena.

Acceptance Criteria

1. Highlights all the upgrades available to the player.
2. Uses the currency earned from fighting in the arena.

### Chicken collection UI

As a player, I want to have a list of all the chickens I have seen or used, so that I can see the different kinds of chickens and what strengths and weaknesses they have.

Acceptance Criteria

1. Each chicken should be shown in a list and have the option to expand, which brings up their detail page.
2. User friendly layout, so a scroll if it overflows.

### Saving option

As a player, I want the ability to save my progress and exit the game, so that I can resume my session later from the exact same point

Acceptance Criteria

1. It should save all of the character’s equipment, items and how far they have made into the arena.
2. A clear menu, with the option to save and cancel.

### Forfeiting option

As a player, I want to have a forfeit option available, so that I can quit my run and still earn some rewards depending on how far I made it in the arena.

Acceptance Criteria

1. A confirmation button, which informs the player of what action forfeiting would mean for their character.

### Temporary run upgrades UI

As a player, I want after each round in the arena to show run upgrades which would make my character stronger, so that I can pick the most beneficial upgrades to help me with in the arena.

Acceptance Criteria

1. The run upgrades should have clear descriptions which highlights their effects during the run.
2. The UI should list three run upgrades which the player can choose from.

### Character selection UI

As a player, I want to have a list of all the available and ready-to-fight characters, so that I can see all the character’s I can use to fight in the arena.

Acceptance Criteria

1. Shows a list of all the available characters in the player's possession.

### Death screen UI

As a player, I want a death screen to appear, so that I am aware that I have died in battle.

Acceptance Criteria

1. Screen is clear and informs the player that he has lost.
2. The player is given the option to put their character’s remains into a “meat grinder”.
3. It has a new run and quit option.

### Victory screen UI

As a player, I want to have a screen show up when I have defeated the enemy, so that I know the result of the fight.

Acceptance Criteria

1. The UI is clear and informs the player of his victory.
2. The UI has an option to continue or exit.

### Inventory UI

As a player, I want an inventory at my disposable, so that I can view what items (e.g., weapons, armor, etc) I have in my possession.

Acceptance Criteria

1. The UI is intuitive and displays all items.
2. If there’s not enough room to show the items, there should be a scroll available.
3. The theme fits the other UI elements of the game and is consistent.
4. It should be uniform in sizing and margins.

### Combat visual effects

As a player, I want clear and responsive visual feedback for my actions in combat, so that I understand what has happened visually.

Acceptance Criteria

1. Visual effects for when the player’s character has died.
2. Custom visual effects for different attacks (e.g., melee and ranged weapons) and weapon types.

### Combat crosshair

As a player, I want to have a visible crosshair, so that I know where my attacks are aimed at.

Acceptance Criteria 

1. The crosshair should be positioned at the center of the screen and move along the camera.

### Weapon windup

As a player, I want weapons to have a windup, so that there is enough time to play the animations for the weapon.

Acceptance Criteria 

1. Each weapon should have a windup property.
2. While in the windup state, the startup animation for the weapon should be played.

### Weapon cooldown

As a player, I want weapons to have a cooldown, so that the player can’t spam their attacks and the gameplay is more balanced.

Acceptance Criteria 

1. Each weapon should have a cooldown property.
