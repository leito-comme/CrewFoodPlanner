from fastapi import APIRouter, Depends, HTTPException
from fastapi_users import FastAPIUsers
from app.database import User
from app.users.schemas import UserRead, UserCreate, UserUpdate
from app.users.manager import get_user_manager
from uuid import UUID
from fastapi_users.authentication import AuthenticationBackend, BearerTransport, JWTStrategy

SECRET = "SECRET"

bearer_transport = BearerTransport(tokenUrl="auth/jwt/login")

def get_jwt_strategy():
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

auth_backend = AuthenticationBackend(
    name="jwt",
    transport=bearer_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, UUID](
    get_user_manager,
    [auth_backend],
)

router = APIRouter()


router.include_router(
    fastapi_users.get_auth_router(auth_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)

router.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

@router.get("/admin/dashboard", tags=["admin"])
async def get_admin_data(user: User = Depends(fastapi_users.current_user(active=True))):
    if user.role != "admin":
        raise HTTPException(status_code=403, detail="Только для админов")
    return {"msg": f"Добро пожаловать, админ {user.email}"}
