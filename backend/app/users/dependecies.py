from fastapi import Depends, HTTPException
from users.models import User
from users.router import fastapi_users
from app.constants.enum import Roles

current_user = fastapi_users.current_user(active=True)

def require_role(role: Roles):
    async def _require(user: User = Depends(current_user)):
        if user.role != role:
            raise HTTPException(status_code=403, detail="Недостаточно прав")
        return user
    return _require

current_admin = require_role("admin")
