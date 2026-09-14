from fastapi import FastAPI, HTTPException, Security
from fastapi.security import APIKeyHeader
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Literal
import os
import psycopg2
from psycopg2.errors import UniqueViolation
from dotenv import load_dotenv
from pathlib import Path

from app.models import Payment


# --------------------------------------------------
# Load environment variables
# --------------------------------------------------

BASE_DIR = Path(__file__).resolve().parent
load_dotenv(BASE_DIR / ".env")

API_KEY = os.getenv("API_KEY")


# --------------------------------------------------
# API Key configuration
# --------------------------------------------------

api_key_header = APIKeyHeader(
    name="X-API-Key",
    auto_error=False
)


def verify_api_key(x_api_key: str | None):
    if not API_KEY:
        raise HTTPException(
            status_code=500,
            detail="API_KEY is not configured on the server"
        )

    if not x_api_key:
        raise HTTPException(
            status_code=401,
            detail="Missing API key"
        )

    if x_api_key != API_KEY:
        raise HTTPException(
            status_code=401,
            detail="Invalid API key"
        )


# --------------------------------------------------
# FastAPI application
# --------------------------------------------------

app = FastAPI(
    title="Secure Payment Transaction Engine",
    description="A secure payment transaction processing API",
    version="1.0.0"
)


# --------------------------------------------------
# CORS
# --------------------------------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://secure-payment-engine-frontend.onrender.com",
        "http://localhost:5173",
        "http://localhost:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --------------------------------------------------
# Request models
# --------------------------------------------------

class StatusUpdate(BaseModel):
    status: Literal["PENDING", "SUCCESS", "FAILED"]


# --------------------------------------------------
# Status transition validation
# --------------------------------------------------

def is_valid_status_transition(
    current_status: str,
    new_status: str
):
    allowed_transitions = {
        "PENDING": ["PENDING", "SUCCESS", "FAILED"],
        "SUCCESS": ["SUCCESS"],
        "FAILED": ["FAILED"]
    }

    return new_status in allowed_transitions.get(
        current_status,
        []
    )


# --------------------------------------------------
# Database connection
# --------------------------------------------------

def get_connection():
    return psycopg2.connect(
        host=os.getenv("DB_HOST"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME"),
        user=os.getenv("DB_USER"),
        password=os.getenv("DB_PASSWORD")
    )


# --------------------------------------------------
# Create database tables automatically
# --------------------------------------------------

def create_tables():
    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payments (
                id SERIAL PRIMARY KEY,
                transaction_id VARCHAR(100) UNIQUE NOT NULL,
                amount DECIMAL(12,2) NOT NULL,
                currency VARCHAR(10) NOT NULL,
                status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS payment_audit_logs (
                id SERIAL PRIMARY KEY,
                transaction_id VARCHAR(100) NOT NULL,
                old_status VARCHAR(20) NOT NULL,
                new_status VARCHAR(20) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
            """
        )

        connection.commit()
        print("Database tables created successfully")

    except Exception as error:
        connection.rollback()
        print("Database table creation error:", error)
        raise

    finally:
        cursor.close()
        connection.close()


# --------------------------------------------------
# Startup
# --------------------------------------------------

@app.on_event("startup")
def startup_event():
    try:
        create_tables()
        print("Database initialization completed")
    except Exception as error:
        print("Database initialization failed:", error)


# --------------------------------------------------
# Health check
# --------------------------------------------------

@app.get("/health")
def health_check():
    return {
        "status": "OK",
        "service": "Secure Payment Transaction Engine"
    }


# --------------------------------------------------
# Create payment
# --------------------------------------------------

@app.post("/payments")
def create_payment(
    payment: Payment,
    x_api_key: str | None = Security(api_key_header)
):
    verify_api_key(x_api_key)

    if payment.amount <= 0:
        raise HTTPException(
            status_code=400,
            detail="Amount must be greater than 0"
        )

    connection = get_connection()
    cursor = connection.cursor()

    try:
        cursor.execute(
            """
            INSERT INTO payments
            (transaction_id, amount, currency, status)
            VALUES (%s, %s, %s, %s)
            RETURNING id
            """,
            (
                payment.transaction_id,
                payment.amount,
                payment.currency,
                payment.status
            )
        )

        payment_id = cursor.fetchone()[0]

        connection.commit()

        return {
            "message": "Payment created successfully",
            "payment_id": payment_id,
            "transaction_id": payment.transaction_id,
            "amount": payment.amount,
            "currency": payment.currency,
            "status": payment.status
        }

    except UniqueViolation:
        connection.rollback()

        raise HTTPException(
            status_code=409,
            detail="Transaction ID already exists"
        )

    finally:
        cursor.close()
        connection.close()


# --------------------------------------------------
# Get all payments
# --------------------------------------------------

@app.get("/payments")
def get_payments(
    x_api_key: str | None = Security(api_key_header)
):
    verify_api_key(x_api_key)

    connection = get_connection()
    cursor = connection.cursor()

    try:
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
            ORDER BY id
            """
        )

        rows = cursor.fetchall()

        payments = []

        for row in rows:
            payments.append({
                "id": row[0],
                "transaction_id": row[1],
                "amount": float(row[2]),
                "currency": row[3],
                "status": row[4],
                "created_at": row[5]
            })

        return payments

    finally:
        cursor.close()
        connection.close()


# --------------------------------------------------
# Get payment by transaction ID
# --------------------------------------------------

@app.get("/payments/{transaction_id}")
def get_payment(
    transaction_id: str,
    x_api_key: str | None = Security(api_key_header)
):
    verify_api_key(x_api_key)

    connection = get_connection()
    cursor = connection.cursor()

    try:
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

        result = cursor.fetchone()

        if not result:
            raise HTTPException(
                status_code=404,
                detail="Payment not found"
            )

        return {
            "id": result[0],
            "transaction_id": result[1],
            "amount": float(result[2]),
            "currency": result[3],
            "status": result[4],
            "created_at": result[5]
        }

    finally:
        cursor.close()
        connection.close()


# --------------------------------------------------
# Update payment status
# --------------------------------------------------

@app.put("/payments/{transaction_id}/status")
def update_payment_status(
    transaction_id: str,
    status_update: StatusUpdate,
    x_api_key: str | None = Security(api_key_header)
):
    verify_api_key(x_api_key)

    connection = get_connection()
    cursor = connection.cursor()

    try:
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

        result = cursor.fetchone()

        if not result:
            raise HTTPException(
                status_code=404,
                detail="Payment not found"
            )

        current_status = result[4]
        new_status = status_update.status

        if not is_valid_status_transition(
            current_status,
            new_status
        ):
            raise HTTPException(
                status_code=400,
                detail={
                    "message": "Payment status update failed",
                    "error": (
                        f"Invalid status transition: "
                        f"{current_status} -> {new_status}"
                    )
                }
            )

        cursor.execute(
            """
            UPDATE payments
            SET status = %s
            WHERE transaction_id = %s
            """,
            (
                new_status,
                transaction_id
            )
        )

        cursor.execute(
            """
            INSERT INTO payment_audit_logs
            (transaction_id, old_status, new_status)
            VALUES (%s, %s, %s)
            """,
            (
                transaction_id,
                current_status,
                new_status
            )
        )

        connection.commit()

        return {
            "message": "Payment status updated successfully",
            "transaction_id": transaction_id,
            "old_status": current_status,
            "new_status": new_status
        }

    finally:
        cursor.close()
        connection.close()