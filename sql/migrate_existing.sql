-- Run this ONCE against your existing payment_engine database before using the upgraded API.
ALTER TABLE payments ADD COLUMN IF NOT EXISTS idempotency_key VARCHAR(128);
UPDATE payments SET idempotency_key = transaction_id WHERE idempotency_key IS NULL;
ALTER TABLE payments ALTER COLUMN idempotency_key SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS uq_payments_idempotency_key ON payments(idempotency_key);

CREATE TABLE IF NOT EXISTS payment_outbox (
    id BIGSERIAL PRIMARY KEY,
    event_type VARCHAR(64) NOT NULL,
    payload JSONB NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP NULL
);
CREATE INDEX IF NOT EXISTS idx_outbox_unpublished ON payment_outbox(id) WHERE published_at IS NULL;
