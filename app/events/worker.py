import time
from app.database import get_connection
from app.events.outbox import publish_outbox_batch


def fetch_batch(limit=50):
    with get_connection() as connection:
        with connection.cursor() as cursor:
            cursor.execute(
                """SELECT id, payload FROM payment_outbox
                   WHERE published_at IS NULL
                   ORDER BY id FOR UPDATE SKIP LOCKED LIMIT %s""", (limit,)
            )
            rows = cursor.fetchall()
            if not rows:
                return []
            ids = [row[0] for row in rows]
            publish_outbox_batch(rows)
            cursor.execute("UPDATE payment_outbox SET published_at = CURRENT_TIMESTAMP WHERE id = ANY(%s)", (ids,))
            connection.commit()
            return rows


def run():
    while True:
        try:
            fetch_batch()
        except Exception as exc:
            print(f"outbox worker error: {exc}")
        time.sleep(2)


if __name__ == "__main__":
    run()
