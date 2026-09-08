from datetime import datetime, timedelta
import os

import psycopg2
from airflow import DAG
from airflow.operators.python import PythonOperator


def reconcile():
    conn = psycopg2.connect(
        host=os.getenv("DB_HOST", "postgres"),
        port=os.getenv("DB_PORT", "5432"),
        database=os.getenv("DB_NAME", "payment_engine"),
        user=os.getenv("DB_USER", "postgres"),
        password=os.getenv("DB_PASSWORD", "postgres"),
    )

    try:
        with conn.cursor() as cur:

            # Find payments that do not have a matching settlement
            cur.execute("""
                SELECT
                    p.transaction_id,
                    p.amount,
                    p.currency,
                    p.status
                FROM payments p
                LEFT JOIN settlements s
                    ON p.transaction_id = s.transaction_id
                WHERE s.transaction_id IS NULL
            """)

            unmatched_payments = cur.fetchall()

            # Find settlements that do not have a matching payment
            cur.execute("""
                SELECT
                    s.transaction_id,
                    s.amount,
                    s.currency,
                    s.status
                FROM settlements s
                LEFT JOIN payments p
                    ON s.transaction_id = p.transaction_id
                WHERE p.transaction_id IS NULL
            """)

            unmatched_settlements = cur.fetchall()

            # Find amount/currency mismatches
            cur.execute("""
                SELECT
                    p.transaction_id,
                    p.amount AS payment_amount,
                    s.amount AS settlement_amount,
                    p.currency AS payment_currency,
                    s.currency AS settlement_currency
                FROM payments p
                JOIN settlements s
                    ON p.transaction_id = s.transaction_id
                WHERE p.amount <> s.amount
                   OR p.currency <> s.currency
            """)

            mismatches = cur.fetchall()

            print("========== RECONCILIATION REPORT ==========")

            print("\nUnmatched Payments:")
            if unmatched_payments:
                for row in unmatched_payments:
                    print({
                        "transaction_id": row[0],
                        "amount": str(row[1]),
                        "currency": row[2],
                        "status": row[3],
                    })
            else:
                print("None")

            print("\nUnmatched Settlements:")
            if unmatched_settlements:
                for row in unmatched_settlements:
                    print({
                        "transaction_id": row[0],
                        "amount": str(row[1]),
                        "currency": row[2],
                        "status": row[3],
                    })
            else:
                print("None")

            print("\nAmount/Currency Mismatches:")
            if mismatches:
                for row in mismatches:
                    print({
                        "transaction_id": row[0],
                        "payment_amount": str(row[1]),
                        "settlement_amount": str(row[2]),
                        "payment_currency": row[3],
                        "settlement_currency": row[4],
                    })
            else:
                print("None")

            print("\n========== RECONCILIATION COMPLETE ==========")

    finally:
        conn.close()


default_args = {
    "retries": 2,
    "retry_delay": timedelta(minutes=5),
}


with DAG(
    dag_id="payment_reconciliation",
    start_date=datetime(2026, 1, 1),
    schedule=timedelta(days=1),
    catchup=False,
    default_args=default_args,
) as dag:

    reconcile_task = PythonOperator(
        task_id="reconcile_payments",
        python_callable=reconcile,
    )