from pydantic import BaseModel, ConfigDict


class CrewMemberBase(BaseModel):
    name: str
    role: str
    allergies: str | None = None


class CrewMemberCreate(CrewMemberBase):
    pass


class CrewMemberRead(CrewMemberBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
