from fastapi import Depends, HTTPException
from app.database import User
from app.users.router import auth_backend
from fastapi_users import FastAPIUsers
from app.users.manager import get_user_manager
from uuid import UUID
from app.constants.enum import Roles

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

current_user = fastapi_users.current_user(active=True)


# def require_role(role: Roles):
#     async def _require(user: User = Depends(current_user)):
#         if user.role != role:
#             raise HTTPException(status_code=403, detail="Недостаточно прав")
#         return user

#     return _require


# current_admin = require_role("admin")
