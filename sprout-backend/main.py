from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from services.pet_service import (get_pet,update_pet)
from services.world_service import (get_world,update_world)
from services.memory_service import (save_memory,get_memories)
from services.diary_service import (add_action,get_actions)
from services.gemini_service import (generate_diary,generate_future_message)
from schemas.user_schema import (UserCreate,UserLogin)
from auth.auth import (hash_password,verify_password,create_access_token)
from services.user_service import (create_user,get_user_by_email)
from services.action_service import (save_action,get_user_actions,get_user_actions_by_days)
from auth.auth import get_current_user
from fastapi import Depends

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {
        "message": "Sprout Backend Running"
    }

@app.get("/pet")
def pet():
    return get_pet()

@app.get("/world")
def world():
    return get_world()

@app.get("/diary")
def diary():
    diary_entry = generate_diary(get_actions(),get_memories())
    return {
        "entry": diary_entry
    }

@app.get("/memory")
def memories():
    return {
        "memories":
        get_memories()
    }

@app.get("/future")
def future():
    world_state = get_world()
    goals = get_memories()
    future_message = generate_future_message(world_state,goals)
    return {
        "message": future_message
    }

@app.get("/history")
def history(user_email: str = Depends(get_current_user)):
    actions = get_user_actions(user_email)
    return {
        "actions": [
            {
                "action": action,
                "timestamp": timestamp
            }
            for action, timestamp in actions
        ]
    }

@app.get("/history/{days}")
def history_by_days(days: int,user_email: str = Depends(get_current_user)):
    actions = get_user_actions_by_days(user_email,days)
    return {
        "actions": [
            {
                "action": action,
                "timestamp": timestamp
            }
            for action, timestamp in actions
        ]
    }

@app.post("/signup")
def signup(user: UserCreate):
    existing_user = get_user_by_email(user.email)

    if existing_user:
        return {"error":"Email already exists"}

    create_user(
        user.name,
        user.email,
        hash_password(user.password)
    )

    return {"message":"User created successfully"}

@app.post("/login")
def login(user: UserLogin):
    existing_user = get_user_by_email(user.email)

    if not existing_user:
        return {"error":"User not found"}

    if verify_password(user.password,existing_user.password):
        token = create_access_token(
            {
                "email":
                existing_user.email
            }
        )
        return {"token":token}

    return {"error":"Invalid credentials"}

@app.post("/memory")
def add_memory(text: str):
    save_memory(text)
    return {
        "status": "saved"
    }

@app.post("/action/{action}")
def perform_action( action: str, user_email: str = Depends(get_current_user)):
    print("CURRENT USER:", user_email)
    pet_data = update_pet(action)
    world_data = update_world(action)
    add_action(action)
    save_action(user_email,action)
    pet_level = pet_data["level"]

    if action == "public_transport":
        if pet_level == 1:
            ai_response = (
                "🚌🌱 Yay! Fewer cars on the road today. I think I just grew a tiny new leaf!"
            )
        elif pet_level == 2:
            ai_response = (
                "🚌🌿 Public transport saves space, energy, and clean air. The forest is proud of you!"
            )
        elif pet_level == 3:
            ai_response = (
                "🚌🪴 Another sustainable journey! The air feels fresher and the ecosystem is thriving."
            )
        else:
            ai_response = (
                "🚌🌳 The future grows brighter with every sustainable commute. Entire ecosystems benefit from choices like yours."
            )

    elif action == "walk_cycle":
        if pet_level == 1:
            ai_response = (
                "🚶🌱 Wheee! Every step helps me grow stronger. My roots are doing a happy dance!"
            )
        elif pet_level == 2:
            ai_response = (
                "🚲🌿 Nature loves seeing you move sustainably. The birds seem extra cheerful today!"
            )
        elif pet_level == 3:
            ai_response = (
                "🚶🪴 Every eco-friendly journey helps maintain balance in our growing ecosystem."
            )
        else:
            ai_response = (
                "🚲🌳 The Earth remembers every sustainable step. Today's choice echoes into the future."
            )

    elif action == "recycle":
        if pet_level == 1:
            ai_response = (
                "♻️🌱 A recycled item today! Somewhere a landfill just sighed dramatically."
            )
        elif pet_level == 2:
            ai_response = (
                "♻️🌿 Less waste, cleaner rivers, happier wildlife. That's a win for everyone!"
            )
        elif pet_level == 3:
            ai_response = (
                "♻️🪴 Recycling may seem small, but ecosystems are built from thousands of good choices."
            )
        else:
            ai_response = (
                "♻️🌳 The rivers and forests thank you. Even the smallest actions ripple through generations."
            )

    elif action == "save_energy":
        if pet_level == 1:
            ai_response = (
                "💡🌱 You saved energy! I celebrated by photosynthesizing extra enthusiastically."
            )
        elif pet_level == 2:
            ai_response = (
                "💡🌿 Less energy wasted means cleaner air for all of us. Great job!"
            )
        elif pet_level == 3:
            ai_response = (
                "💡🪴 The ecosystem appreciates every watt saved. Small habits create lasting change."
            )
        else:
            ai_response = (
                "💡🌳 Energy conserved today becomes a healthier future tomorrow. The forests are grateful."
            )

    elif action == "reusable":
        if pet_level == 1:
            ai_response = (
                "🥤🌱 The turtles have officially nominated you for Human of the Day!"
            )
        elif pet_level == 2:
            ai_response = (
                "🥤🌿 Fewer plastics, happier rivers. Nature definitely noticed that choice."
            )
        elif pet_level == 3:
            ai_response = (
                "🥤🪴 Every reusable item prevents a little waste from entering our world."
            )
        else:
            ai_response = (
                "🥤🌳 The rivers remember acts of care like this. Small habits become lasting legacies."
            )

    elif action == "plant_based":
        if pet_level == 1:
            ai_response = (
                "🥗🌱 A plant-powered meal! I checked with the vegetables—they were honored to help."
            )
        elif pet_level == 2:
            ai_response = (
                "🥗🌿 Today's meal helped lighten our footprint. Even the trees seem happier!"
            )
        elif pet_level == 3:
            ai_response = (
                "🥗🪴 Sustainable food choices nourish both people and the planet."
            )
        else:
            ai_response = (
                "🥗🌳 The forests flourish when we choose wisely. Today's meal helped shape a greener future."
            )

    else:
        ai_response = (
            "🌎✨ Another choice has shaped the future. I'm proud to grow alongside you."
        )

    return {
        "pet": pet_data,
        "world": world_data,
        "message": ai_response
    }