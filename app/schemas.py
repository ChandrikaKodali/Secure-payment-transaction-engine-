from pydantic import BaseModel, Field
from decimal import Decimal
from typing import Literal


class Payment(BaseModel):
    transaction_id: str = Field(min_length=1)
    amount: Decimal
    currency: Literal["INR", "USD", "EUR"]
    status: Literal["PENDING", "SUCCESS", "FAILED"] = "PENDING"