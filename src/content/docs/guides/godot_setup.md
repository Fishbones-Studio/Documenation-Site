---
title: Godot Setup
description: A guide to the Godot setup
lastUpdated: 2025-03-04
author: Tjorn
---

## Godot

Using Godot 4.4 and GDScript.

### Additional Setup Notes

You can download and install Godot 4.4 from the [official website](https://godotengine.org/download/). Make sure to enable the necessary plugins in your project settings once Godot is installed.
Make sure to also fetch the required submodules:
```bash
git submodule init  # Initializes the submodules (configures them)
git submodule update # Fetches the content of the submodules and checks out the specified commits
```

### Plugin Usage

To configure the plugins:

1. Install the plugin via the asset browser.
   > > You can also manually install the pluggins by adding them to the 'addons' folder.
2. Restart Godot to finalize the changes.
   > > Certain plugins might require additional setup. Read their documentation to be sure.
