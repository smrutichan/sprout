world = {
    "forest": 50,
    "river": 50,
    "air": 50,
    "wildlife": 50
}

def get_world():
    return world

def update_world(action):
    if action == "public_transport":
        world["air"] += 3
        world["wildlife"] += 1

    elif action == "walk_cycle":
        world["air"] += 2
        world["forest"] += 2

    elif action == "recycle":
        world["river"] += 3
        world["wildlife"] += 2

    elif action == "save_energy":
        world["air"] += 2
        world["forest"] += 1

    elif action == "reusable":
        world["river"] += 3
        world["wildlife"] += 2

    elif action == "plant_based":
        world["forest"] += 2
        world["air"] += 2

    # Prevent values going above 100
    world["forest"] = min(100, world["forest"])
    world["river"] = min(100, world["river"])
    world["air"] = min(100, world["air"])
    world["wildlife"] = min(100, world["wildlife"])

    return world