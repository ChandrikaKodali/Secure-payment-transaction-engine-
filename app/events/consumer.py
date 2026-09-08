import json
from kafka import KafkaConsumer
from app.config import get_settings


def run():
    settings = get_settings()
    consumer = KafkaConsumer(
        settings.kafka_topic,
        bootstrap_servers=settings.kafka_bootstrap_servers,
        group_id="payment-analytics",
        auto_offset_reset="earliest",
        value_deserializer=lambda value: json.loads(value.decode("utf-8")),
    )
    for message in consumer:
        event = message.value
        print(f"payment event received: {event}")


if __name__ == "__main__":
    run()
