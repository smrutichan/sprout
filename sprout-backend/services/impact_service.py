from datetime import datetime, timedelta

CO2_MAP = {
    "walk_cycle": 0.5,
    "public_transport": 0.3,
    "save_energy": 0.7,
    "recycle": 0.2,
    "reusable_products": 0.1,
    "plant_based": 1.2,
}

def calculate_impact(actions):
    today = datetime.now().date()

    today_co2 = 0
    week_co2 = 0
    month_co2 = 0

    for action, timestamp in actions:
        action_date = datetime.fromisoformat(timestamp).date()
        co2 = CO2_MAP.get(action, 0)

        # Today
        if action_date == today:
            today_co2 += co2

        # Last 7 days
        if action_date >= today - timedelta(days=7):
            week_co2 += co2

        # Last 30 days
        if action_date >= today - timedelta(days=30):
            month_co2 += co2

    return {
        "today": round(today_co2, 2),
        "week": round(week_co2, 2),
        "month": round(month_co2, 2),

        # Fun equivalents
        "trees": round(month_co2 / 21, 2),
        "car_km": round(month_co2 * 4, 1),
        "electricity": round(month_co2 * 2.5, 1),
    }