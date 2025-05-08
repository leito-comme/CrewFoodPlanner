from pydantic import BaseModel, ConfigDict, Field
from datetime import date
from app.constants.enum import Seasons


class ShippingDataBase(BaseModel):
    voyage_number: str = Field(
        min_length=4, max_length=10, description="Current voyage number"
    )
    departure_time: date = Field(description="Departure date")
    arrival_time: date = Field(description="Arrival date")
    season: Seasons = Field(description="Season, while crew will be in voyage")


class ShippingDataCreate(ShippingDataBase):
    pass


class ShippingDataRead(ShippingDataBase):
	id: int

	model_config = ConfigDict(from_attributes=True)