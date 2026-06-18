import os
from dotenv import load_dotenv
import google.generativeai as genai

load_dotenv()
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = genai.GenerativeModel("gemini-2.5-flash")

def generate_diary(actions, memories):
    try: 
        prompt = f"""
            You are Sprout, a cheerful little climate companion writing in your personal diary.
            Write a short diary entry about today's eco-friendly activities.

            Today's actions:
            {actions}
            User goals:
            {memories}

            Requirements:
                - Write in FIRST PERSON as Sprout.
                - This is Sprout's diary, not a message to the user.
                - Use a playful, casual, slightly goofy tone.
                - Sound like a small plant reflecting on its day.
                - Mention today's eco actions naturally.
                - Write only 2 or 3 short paragraphs.
                - Keep the entire entry under 120 words.
                - Include a few emojis naturally.
                - Use proper paragraph breaks.
                - Do NOT use markdown.
                - Do NOT use asterisks (*), bold text, bullet points, or lists.
                - Do NOT directly address the user as "you" throughout the entry.
                - Focus on Sprout's feelings, growth, excitement, and observations.
                - End with a short hopeful thought about tomorrow.
                - Output only the diary entry.

            Avoid repetitive phrases from previous entries.
            Vary the opening, wording, and sentence structure each time.
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