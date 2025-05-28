from typing import AsyncGenerator
from datetime import datetime, timezone
import re

from fastapi import Depends
from fastapi_users.db import SQLAlchemyBaseUserTableUUID, SQLAlchemyUserDatabase
from sqlalchemy import func, DateTime, String
from sqlalchemy.ext.asyncio import (
    create_async_engine,
    async_sessionmaker,
    AsyncSession,
    AsyncAttrs,
)
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase, declared_attr

from app.config import settings
from app.constants.enum import Roles


engine = create_async_engine(settings.DATABASE_URL)
async_session_maker = async_sessionmaker(
    autocommit=False, autoflush=False, bind=engine, expire_on_commit=False
)


def camel_to_snake(name: str) -> str:
    name = re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()
    return name


class Base(AsyncAttrs, DeclarativeBase):
    __abstract__ = True

    @declared_attr.directive
    def __tablename__(cls) -> str:
        return f"{camel_to_snake(cls.__name__)}"

    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now(timezone.utc)
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), default=datetime.now(timezone.utc), onupdate=func.now()
    )


class User(SQLAlchemyBaseUserTableUUID, Base):
    __table_args__ = {"extend_existing": True}
    role: Mapped[Roles] = mapped_column(String(50), default="user", nullable=True)
    


async def get_async_session() -> AsyncGenerator[AsyncSession, None]:
    async with async_session_maker() as session:
        yield session


async def get_user_db(session: AsyncSession = Depends(get_async_session)):
    yield SQLAlchemyUserDatabase(session, User)
