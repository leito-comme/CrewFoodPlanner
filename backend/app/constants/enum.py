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


class ProductCategories(str, Enum):
    GRAIN = "grain"
    DAIRY = "dairy"
    MEAT = "meat"
    FISH = "fish"
    VEGETABLE = "vegetable"
    FRUIT = "fruit"
    FAT = "fat"
    SWEET = "sweet"
    BEVERAGE = "beverage"
    OTHER = "other"


class ProductAllergens(str, Enum):
    MILK = "milk"
    GLUTEN = "gluten"
    EGG = "egg"
    NUTS = "nuts"
    FISH = "fish"
    SOY = "soy"
    SHELLFISH = "shellfish"
    SESAME = "sesame"
    WHEAT = "wheat"
    NONE = "none"
