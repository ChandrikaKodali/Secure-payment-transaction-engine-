import json
from kafka import KafkaProducer
from app.config import get_settings


def publish_payment_event(event: dict) -> None:
    settings = get_settings()
    producer = KafkaProducer(
        bootstrap_servers=settings.kafka_bootstrap_servers,
        value_serializer=lambda value: json.dumps(value, default=str).encode("utf-8"),
        retries=5,
    )
    try:
        producer.send(settings.kafka_topic, event)
        producer.flush()
    finally:
        producer.close()
