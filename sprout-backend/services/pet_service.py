pet = {
    "name": "Sprout",
    "energy": 100,
    "happiness": 50,
    "level": 1
}

def get_pet():
    return pet

def update_pet(action):
    if action == "public_transport":
        pet["energy"] += 3
        pet["happiness"] += 4

    elif action == "walk_cycle":
        pet["energy"] += 4
        pet["happiness"] += 5

    elif action == "recycle":
        pet["energy"] += 5
        pet["happiness"] += 5

    elif action == "save_energy":
        pet["energy"] += 3
        pet["happiness"] += 4

    elif action == "reusable":
        pet["energy"] += 5
        pet["happiness"] += 5

    elif action == "plant_based":
        pet["energy"] += 4
        pet["happiness"] += 5

    pet["energy"] = max(0, pet["energy"])
    pet["happiness"] = max(0, pet["happiness"])

    if pet["energy"] >= 200:
        pet["level"] = 4

    elif pet["energy"] >= 150:
        pet["level"] = 3

    elif pet["energy"] >= 120:
        pet["level"] = 2

    else:
        pet["level"] = 1

    return pet