from fastapi_users import BaseUserManager, UUIDIDMixin
from fastapi import Depends
from app.database import get_user_db
from app.database import User
from uuid import UUID

SECRET = "SECRET"

class UserManager(UUIDIDMixin, BaseUserManager[User, UUID]):
    reset_password_token_secret = SECRET
    verification_token_secret = SECRET

    async def on_after_register(self, user: User, request=None):
        print(f"User {user.email} зарегистрирован")

async def get_user_manager(user_db=Depends(get_user_db)):
    yield UserManager(user_db)
