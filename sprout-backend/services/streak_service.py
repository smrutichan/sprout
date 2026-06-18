from datetime import date, timedelta, datetime
from sqlalchemy.orm import Session
from services.action_service import get_user_actions
from zoneinfo import ZoneInfo
from models.streak import Streak
from database import SessionLocal


def update_streak(user_email: str):
    db: Session = SessionLocal()

    streak = (db.query(Streak).filter(Streak.user_email == user_email).first())
    today = date.today()

    if not streak:
        streak = Streak(
            user_email=user_email,
            current_streak=1,
            longest_streak=1,
            last_action_date=str(today)
        )

        db.add(streak)
        db.commit()
        db.close()
        return

    last_date = date.fromisoformat(streak.last_action_date)

    # Same day
    if last_date == today:
        db.close()
        return
    
    # Consecutive day
    if last_date == today - timedelta(days=1):
        streak.current_streak += 1

    # Missed day
    else:
        streak.current_streak = 1

    streak.longest_streak = max(streak.longest_streak,streak.current_streak)
    streak.last_action_date = str(today)

    db.commit()
    db.close()


def get_streak(user_email: str):
    actions = get_user_actions(user_email)

    if not actions:
        return {
            "current_streak": 0,
            "longest_streak": 0,
            "last_action_date": None,
        }

    # Get unique action dates
    unique_days = sorted(
        {
            datetime.fromisoformat(timestamp).date()
            for _, timestamp in actions
        },
        reverse=True,
    )

    # Current streak
    current_streak = 0
    today = datetime.now(
        ZoneInfo("Asia/Kolkata")
    ).date()

    for i, day in enumerate(unique_days):
        expected_day = today - timedelta(days=i)

        if day == expected_day:
            current_streak += 1
        else:
            break

    # Longest streak
    longest_streak = 1
    running_streak = 1

    for i in range(1, len(unique_days)):
        if unique_days[i - 1] - unique_days[i] == timedelta(days=1):
            running_streak += 1
            longest_streak = max(
                longest_streak,
                running_streak
            )
        else:
            running_streak = 1

    return {
        "current_streak": current_streak,
        "longest_streak": max(longest_streak, current_streak),
        "last_action_date": str(unique_days[0]),
    }