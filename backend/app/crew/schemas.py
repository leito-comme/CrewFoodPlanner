from pydantic import BaseModel, ConfigDict, Field
from typing import Optional


class CrewMemberBase(BaseModel):
    name: str = Field(min_length=1, max_length=50, description="Name of a crew member")
    height: float = Field(
        ge=130,
        le=250,
        description="Height of a crew member in centimeters",
    )
    weight: float = Field(
        ge=40, le=200, description="Weight of a crew member in kilograms"
    )
    allergies: Optional[str] = Field(
        max_length=200, description="List of allergies of a crew member"
    )


class CrewMemberCreate(CrewMemberBase):
    pass


class CrewMemberUpload(CrewMemberBase):
    id: int


class CrewMemberRead(CrewMemberBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
