from fastapi import FastAPI, Header, Security, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from app.models import Payment, StatusUpdate
from app.database import get_connection
from app.security.auth import verify_api_key, api_key_header
from app.services.payment_service import create_payment, update_status


# ============================================================
# FASTAPI APPLICATION
# ============================================================

app = FastAPI(
    title="Secure Payment Transaction Engine",
    version="2.0.0"
)


# ============================================================
# CORS CONFIGURATION
# Allows React frontend to communicate with FastAPI backend
# ============================================================

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# HEALTH CHECK
# ============================================================

@app.get("/health")
def health_check():
    return {
        "status": "OK"
    }


# ============================================================
# CREATE PAYMENT
# ============================================================

@app.post("/payments", status_code=201)
def create_payment_endpoint(
    payment: Payment,

    idempotency_key: str = Header(
        ...,
        alias="Idempotency-Key",
        min_length=8,
        max_length=128
    ),

    x_api_key: str | None = Security(api_key_header),
):

    # Verify API key
    verify_api_key(x_api_key)

    # Create payment
    row, replayed = create_payment(
        payment,
        idempotency_key
    )

    # Prepare response
    result = {
        "message": (
            "Payment already exists"
            if replayed
            else "Payment created successfully"
        ),

        "payment_id": row[0],

        "transaction_id": row[1],

        "amount": row[2],

        "currency": row[3],

        "status": row[4],

        "idempotent_replay": replayed,
    }

    return result


# ============================================================
# GET ALL PAYMENTS
# ============================================================

@app.get("/payments")
def get_payments(
    x_api_key: str | None = Security(api_key_header)
):

    # Verify API key
    verify_api_key(x_api_key)

    # Connect to PostgreSQL
    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    transaction_id,
                    amount,
                    currency,
                    status,
                    created_at
                FROM payments
                ORDER BY id DESC
                """
            )

            rows = cursor.fetchall()

    # Convert database rows to JSON
    return [
        {
            "id": r[0],
            "transaction_id": r[1],
            "amount": r[2],
            "currency": r[3],
            "status": r[4],
            "created_at": r[5],
        }

        for r in rows
    ]


# ============================================================
# GET SINGLE PAYMENT
# ============================================================

@app.get("/payments/{transaction_id}")
def get_payment(
    transaction_id: str,

    x_api_key: str | None = Security(api_key_header)
):

    # Verify API key
    verify_api_key(x_api_key)

    # Search payment
    with get_connection() as connection:

        with connection.cursor() as cursor:

            cursor.execute(
                """
                SELECT
                    id,
                    transaction_id,
                    amount,
                    currency,
                    status,
                    created_at
                FROM payments
                WHERE transaction_id = %s
                """,

                (transaction_id,)
            )

            row = cursor.fetchone()

    # Payment not found
    if not row:

        raise HTTPException(
            status_code=404,
            detail="Payment not found"
        )

    return {
        "id": row[0],
        "transaction_id": row[1],
        "amount": row[2],
        "currency": row[3],
        "status": row[4],
        "created_at": row[5],
    }


# ============================================================
# UPDATE PAYMENT STATUS
# ============================================================

@app.put("/payments/{transaction_id}/status")
def update_payment_status(

    transaction_id: str,

    status_update: StatusUpdate,

    x_api_key: str | None = Security(api_key_header),
):

    # Verify API key
    verify_api_key(x_api_key)

    # Update status
    old_status, new_status = update_status(
        transaction_id,
        status_update.status
    )

    return {

        "message":
            "Payment status updated successfully",

        "transaction_id":
            transaction_id,

        "old_status":
            old_status,

        "new_status":
            new_status,
    }