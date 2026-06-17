import sqlite3
from datetime import datetime,timedelta
from zoneinfo import ZoneInfo
import os

print("ACTION DB PATH:", os.path.abspath("sprout.db"))

DB_NAME = "sprout.db"

def save_action(user_email: str, action: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    timestamp = datetime.now(ZoneInfo("Asia/Kolkata")).isoformat()

    cursor.execute(
        """
        INSERT INTO eco_actions
        (user_email, action, timestamp)
        VALUES (?, ?, ?)
        """,
        (user_email, action, timestamp)
    )

    conn.commit()
    conn.close()


def get_user_actions(user_email: str):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cursor.execute(
        """
        SELECT action, timestamp
        FROM eco_actions
        WHERE user_email=?
        ORDER BY timestamp DESC
        """,
        (user_email,)
    )

    actions = cursor.fetchall()
    conn.close()
    return actions

def get_user_actions_by_days(user_email: str, days: int):
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    cutoff_date = (datetime.now(ZoneInfo("Asia/Kolkata"))- timedelta(days=days)).isoformat()

    cursor.execute(
        """
        SELECT action, timestamp
        FROM eco_actions
        WHERE user_email = ?
        AND timestamp >= ?
        ORDER BY timestamp DESC
        """,
        (user_email, cutoff_date)
    )

    actions = cursor.fetchall()
    conn.close()
    return actions