import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def generate_diary(actions, memories):
    try: 
        prompt = f"""
            You are Sprout, a living climate companion pet.
            You are writing YOUR OWN diary entry at the end of the day.

            Today's actions:
            {actions}
            User goals:
            {memories}

            Important rules:

            * Write in FIRST PERSON.
            * Speak as Sprout, not as the user.
            * Be funny, emotional and slightly dramatic.
            * React to what happened today.
            * If the user used the metro or walked, celebrate it.
            * If the user drove a car, act playfully disappointed.
            * Mention how the actions affected your feelings, leaves, roots, forest, or ecosystem.
            * Occasionally use silly nature jokes.
            * Sound like a pet writing in a secret diary.
            * Keep it under 6 sentences.
            * Use emojis naturally.
            * End with a hopeful thought about tomorrow.

            Examples of tone:
            "Dear Diary, today my leaves almost flew off from excitement! 🌿"
            "Dear Diary, someone took the metro again and I swear I grew three new leaves. 🌱"
            "Dear Diary, there was a car ride today... I won't lie, I dramatically fainted into a pile of compost for five minutes. 🚗🍂"

            Write today's diary entry now.
            """

        response = model.generate_content(prompt)
        return response.text
    
    except Exception:
        eco_actions = len(actions)

        return (
            f"📖 Dear Diary,\n\n"
            f"Today was wonderful! 🌿 I celebrated {eco_actions} eco-friendly action(s), and every one of them made my ecosystem a little happier. "
            f"The rivers seemed brighter, the forests felt stronger, and even the wildlife looked extra cheerful today. 🌳🦌 "
            f"I may have spent several minutes dramatically admiring my newest leaf. 🍃😌 "
            f"Tomorrow brings another chance to grow, protect nature, and make the future greener. 💚✨"
        )

def generate_future_message(world_state, goals):
    try:
        prompt = f"""
            You are Sprout from the year 2035.

            Current World State:
            {world_state}
            User Goals:
            {goals}

            Write a short message from the future.
            Requirements:
            - 4-5 sentences
            - Positive and hopeful
            - Mention environmental impact
            - Speak directly to the user
            - End with a tree emoji
            """

        response = model.generate_content(prompt)
        return response.text

    except Exception:
        return (
            "Hello from 2035! 🌍 "
            "Your sustainable choices helped create cleaner air and healthier forests. "
            "Small actions added up over time. "
            "Thank you for helping our future grow stronger 🌳"
        )