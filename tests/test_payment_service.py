from app.services.payment_service import is_valid_status_transition


def test_pending_can_become_success():
    assert is_valid_status_transition("PENDING", "SUCCESS")


def test_pending_can_become_failed():
    assert is_valid_status_transition("PENDING", "FAILED")


def test_success_cannot_become_pending():
    assert not is_valid_status_transition("SUCCESS", "PENDING")


def test_failed_cannot_become_success():
    assert not is_valid_status_transition("FAILED", "SUCCESS")
