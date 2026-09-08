import json
from fastapi import HTTPException
from psycopg2.errors import UniqueViolation
from app.database import get_connection

ALLOWED_TRANSITIONS = {
    "PENDING": {"PENDING", "SUCCESS", "FAILED"},
    "SUCCESS": {"SUCCESS"},
    "FAILED": {"FAILED"},
}


def is_valid_status_transition(current_status: str, new_status: str) -> bool:
    return new_status in ALLOWED_TRANSITIONS.get(current_status, set())


def _enqueue_event(cursor, event_type: str, payload: dict):
    cursor.execute(
        "INSERT INTO payment_outbox (event_type, payload) VALUES (%s, %s::jsonb)",
        (event_type, json.dumps(payload, default=str)),
    )


def create_payment(payment, idempotency_key: str):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            try:
                cursor.execute(
                    "SELECT id, transaction_id, amount, currency, status, created_at FROM payments WHERE idempotency_key = %s",
                    (idempotency_key,),
                )
                existing = cursor.fetchone()
                if existing:
                    return existing, True

                cursor.execute(
                    """INSERT INTO payments
                       (transaction_id, amount, currency, status, idempotency_key)
                       VALUES (%s, %s, %s, %s, %s)
                       RETURNING id, transaction_id, amount, currency, status, created_at""",
                    (payment.transaction_id, payment.amount, payment.currency, payment.status, idempotency_key),
                )
                row = cursor.fetchone()
                _enqueue_event(cursor, "PAYMENT_CREATED", {
                    "payment_id": row[0], "transaction_id": row[1], "amount": row[2],
                    "currency": row[3], "status": row[4],
                })
                connection.commit()
                return row, False
            except UniqueViolation:
                connection.rollback()
                raise HTTPException(status_code=409, detail="Transaction ID or idempotency key already exists")


def update_status(transaction_id: str, new_status: str):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                "SELECT id, status FROM payments WHERE transaction_id = %s FOR UPDATE",
                (transaction_id,),
            )
            payment = cursor.fetchone()
            if not payment:
                raise HTTPException(status_code=404, detail="Payment not found")

            old_status = payment[1]
            if not is_valid_status_transition(old_status, new_status):
                raise HTTPException(status_code=409, detail=f"Invalid status transition: {old_status} -> {new_status}")

            if old_status != new_status:
                cursor.execute("UPDATE payments SET status = %s WHERE transaction_id = %s", (new_status, transaction_id))
                cursor.execute(
                    "INSERT INTO payment_audit_logs (transaction_id, old_status, new_status) VALUES (%s, %s, %s)",
                    (transaction_id, old_status, new_status),
                )
                _enqueue_event(cursor, "PAYMENT_STATUS_CHANGED", {
                    "transaction_id": transaction_id,
                    "old_status": old_status,
                    "new_status": new_status,
                })
            connection.commit()
            return old_status, new_status
