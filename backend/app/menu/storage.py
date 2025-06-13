import json
import os
from typing import Optional

MENU_PATH = os.path.join(os.path.dirname(__file__), "data", "current_menu.json")


def save_menu(data: dict) -> None:
    os.makedirs(os.path.dirname(MENU_PATH), exist_ok=True)
    with open(MENU_PATH, "w", encoding="utf-8") as f:
        json.dump(data, f, ensure_ascii=False, indent=2)


def load_menu() -> Optional[dict]:
    try:
        with open(MENU_PATH, "r", encoding="utf-8") as f:
            return json.load(f)
    except FileNotFoundError:
        return None


def delete_menu() -> None:
    if os.path.exists(MENU_PATH):
        os.remove(MENU_PATH)
