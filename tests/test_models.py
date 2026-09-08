import pytest
from pydantic import ValidationError
from app.models import Payment


def test_payment_requires_positive_amount():
    with pytest.raises(ValidationError):
        Payment(transaction_id="TXN_TEST", amount=0, currency="INR")


def test_payment_rejects_invalid_currency():
    with pytest.raises(ValidationError):
        Payment(transaction_id="TXN_TEST", amount=100, currency="GBP")


def test_payment_defaults_to_pending():
    payment = Payment(transaction_id="TXN_TEST", amount=100, currency="INR")
    assert payment.status == "PENDING"
