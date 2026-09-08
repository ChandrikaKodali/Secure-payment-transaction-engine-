from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, field_validator


Status = Literal["PENDING", "SUCCESS", "FAILED"]
Currency = Literal["INR", "USD", "EUR"]


class Payment(BaseModel):
    transaction_id: str = Field(min_length=3, max_length=64, pattern=r"^[A-Za-z0-9_-]+$")
    amount: Decimal = Field(gt=0, max_digits=14, decimal_places=2)
    currency: Currency
    status: Status = "PENDING"

    @field_validator("transaction_id")
    @classmethod
    def normalize_transaction_id(cls, value: str) -> str:
        return value.strip()


class StatusUpdate(BaseModel):
    status: Status
