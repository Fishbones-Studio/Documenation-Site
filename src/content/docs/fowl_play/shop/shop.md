---
title: Shop inplementation FowlPlay
description: Our implementation of the shop
lastUpdated: 2025-03-13
author: Nick Frietman
---

## Implementation shop


Our idea of the shop we wanted to maken is a RNG shop what will display 5 different items of different rarity and types.

### Shop UI
To make this I started by making a layout for the UI of the shop. I started by making individual elements to place the items in, however I soon noticed that I would need a single item_template scene and clone it however much items slots we wanted. I needed this because I wanted to add a script to the items to randomly fill in the slots. The following image is how the shop-layout looks when running.

![Player shop layout](../../../../assets/shop/shop_layout.png)

As you can see there are 5 different slots where the name, item buff, type and cost is displayed with a button to buy the item. This UI is randomly changed every time you open the shop. Later on in the project we want the shop to be locked and only changed after every arena fight.

The following code is used to refresh the shop 

```gdscript
extends Control
@onready var shop_slots: HBoxContainer = $shop_slots
func _ready():
	randomize()
	refresh_shop()

#Function to refresh the shop
func refresh_shop():
	#loop over the shop_slots to get all the Item_Templates and fill them with a item
	
	for slot in shop_slots.get_children():
		if slot == null:
			print("Error: Found a Nil slot!")
			continue
			
		if slot is Item_Template:
			var random_item = ItemDatabase.get_random_item()
			slot.set_item(random_item)
```
### Item Template

slot.set_item(random_item) refers to code inside of the Item_Template scene. In this function I assign the item data to the actual label inside of my item placeholder

```gdscript
extends Control
class_name Item_Template
@onready var item_name: Label = $VBoxContainer/item_name
@onready var item_cost: Label = $VBoxContainer/item_cost
@onready var item_type: Label = $VBoxContainer/item_type

func set_item(item):
	item_name.text = item.name
	item_type.text = item.type
	item_cost.text = str(item.cost)

```

### Item Database

The itemdatabase is a global script where all purchasable items will be stored and their logic will be defined

```gdscript
extends Node

enum Rarity {COMMON, UNCOMMON, RARE, EPIC, LEGENDARY}

var items = [
	{"name": "Stick", "rarity": Rarity.COMMON, "type": "Melee", "cost": 100},
	{"name": "Lake", "rarity": Rarity.COMMON, "type": "Melee", "cost": 100},
	{"name": "Flipflops", "rarity": Rarity.COMMON, "type": "Melee", "cost": 100},
	{"name": "Bone", "rarity": Rarity.COMMON, "type": "Melee", "cost": 100},
	{"name": "Hammer", "rarity": Rarity.UNCOMMON, "type": "Melee", "cost": 200},
	{"name": "Knife", "rarity": Rarity.UNCOMMON, "type": "Melee", "cost": 200},
	{"name": "Frying Pan", "rarity": Rarity.UNCOMMON, "type": "Melee", "cost": 200},
	{"name": "Sword", "rarity": Rarity.RARE, "type": "Melee", "cost": 1000},
	{"name": "Axe", "rarity": Rarity.RARE, "type": "Melee", "cost": 1000},
	{"name": "Lightsaber", "rarity": Rarity.RARE, "type": "Melee", "cost": 1000},
	{"name": "Slingshot", "rarity": Rarity.COMMON, "type": "Ranged", "cost": 100},
	{"name": "Crossbow", "rarity": Rarity.COMMON, "type": "Ranged", "cost": 100},
	{"name": "Revolver", "rarity": Rarity.UNCOMMON, "type": "Ranged", "cost": 200},
	{"name": "Pistol", "rarity": Rarity.UNCOMMON, "type": "Ranged", "cost": 200},
	{"name": "Musket", "rarity": Rarity.UNCOMMON, "type": "Ranged", "cost": 200},
	{"name": "Minigun", "rarity": Rarity.RARE, "type": "Ranged", "cost": 1000},
	{"name": "Sniper", "rarity": Rarity.RARE, "type": "Ranged", "cost": 1000},
	{"name": "Lazet eyes", "rarity": Rarity.RARE, "type": "Ranged", "cost": 1000},
	{"name": "Flamethrower", "rarity": Rarity.RARE, "type": "Ranged", "cost": 1000},
	{"name": "Cap", "rarity": Rarity.COMMON, "type": "Helemt", "cost": 100},
	{"name": "Flipflops", "rarity": Rarity.COMMON, "type": "Boots", "cost": 100},
	{"name": "Bubblewrap Helmet", "rarity": Rarity.COMMON, "type": "Helemt", "cost": 100},
	{"name": "Bubblewrap Boots", "rarity": Rarity.UNCOMMON, "type": "Boots", "cost": 200},
	{"name": "Rollerblades", "rarity": Rarity.RARE, "type": "Boots", "cost": 500},
	{"name": "Jordans", "rarity": Rarity.RARE, "type": "Boots", "cost": 1000},
	{"name": "Helmet", "rarity": Rarity.RARE, "type": "Helmet", "cost": 1000},
	{"name": "Mohawk", "rarity": Rarity.RARE, "type": "Helmet", "cost": 1000},
	{"name": "Helicoter blades", "rarity": Rarity.RARE, "type": "Ability", "cost": 1000},
	{"name": "Mechenical butt", "rarity": Rarity.RARE, "type": "Ability", "cost": 1000},
	{"name": "Chamovlage Mutation", "rarity": Rarity.RARE, "type": "Ability", "cost": 1000},
	{"name": "Necromancer Mutation", "rarity": Rarity.RARE, "type": "Ability", "cost": 1000},
	{"name": "Blink Mutation", "rarity": Rarity.RARE, "type": "Ability", "cost": 1000},
	
]
#Function to get a random item from the list above
func get_random_item():
	var rarity_chances = { Rarity.COMMON: 60, Rarity.UNCOMMON: 30, Rarity.RARE: 10}
	var roll = randi() % 100
	var selected_rarity = Rarity.COMMON
	var cumulative = 0
	#Get a random rarity accordingly to the chances
	for rarity in rarity_chances.keys():
		cumulative += rarity_chances[rarity]
		if roll < cumulative:
			selected_rarity = rarity
			break
			
	print("Selected rarity:", selected_rarity)
	#List of items that match the rarity
	var filtered_items = items.filter(func(item): return item.rarity == selected_rarity)
			
	#Select item
	if filtered_items.size() > 0:
		var selected_item = filtered_items[randi() % filtered_items.size()]
		print("Selected item:", selected_item["name"])
		return selected_item
		
			
```



