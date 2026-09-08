import json
from kafka import KafkaProducer
from app.config import get_settings


def publish_outbox_batch(rows):
    settings = get_settings()
    producer = KafkaProducer(
        bootstrap_servers=settings.kafka_bootstrap_servers,
        value_serializer=lambda value: json.dumps(value, default=str).encode("utf-8"),
        retries=5,
        acks="all",
    )
    try:
        for row in rows:
            producer.send(settings.kafka_topic, key=str(row[0]).encode(), value=row[1])
        producer.flush()
    finally:
        producer.close()
