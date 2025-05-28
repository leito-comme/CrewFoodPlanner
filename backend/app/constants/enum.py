from enum import Enum


class Seasons(str, Enum):
	WINTER = "winter"
	SPRING = "spring"
	SUMMER = "summer"
	AUTUMN = "autumn"

class Roles(str, Enum):
	user = "user"
	manager = "manager"
	admin = "admin"