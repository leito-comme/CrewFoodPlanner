from pydantic import BaseModel, ConfigDict, Field
from datetime import date
from typing import Optional
from app.constants.enum import Seasons


class ShippingDataBase(BaseModel):
    voyage_number: str = Field(
        min_length=4, max_length=10, description="Current voyage number"
    )
    departure_date: date = Field(description="Departure date")
    arrival_date: date = Field(description="Arrival date")
    season: Seasons = Field(description="Season, while crew will be in voyage")
    description: Optional[str] = Field(
        max_length=200, description="Additional information about the current voyage"
    )
    is_current: bool = Field(description="This field shows which voyage is current")


class ShippingDataCreate(ShippingDataBase):
    pass


class ShippingDataRead(ShippingDataBase):
    id: int

    model_config = ConfigDict(from_attributes=True)
