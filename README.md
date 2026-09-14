## 🚀 Live Demo

🔗 [Secure Payment Engine – Live Demo](https://secure-payment-engine-frontend.onrender.com)
### Demo Login
- **Username:** `admin`
- **Password:** `admin123`

# Secure Payment Transaction Engine

An internship-oriented payment API demonstrating secure transaction processing, PostgreSQL, TDD, idempotency, transactional outbox events, Kafka, Docker, Airflow reconciliation, and Kubernetes deployment patterns.

## Architecture

```text
Client
  |
  v
FastAPI + API Key + Validation
  |
  +----> PostgreSQL (payments + audit + outbox)
  |                  |
  |                  v
  |             Outbox Worker
  |                  |
  |                  v
  |                Kafka
  |
  +----> Swagger / OpenAPI

Airflow --> daily payment reconciliation --> PostgreSQL

Docker Compose: API + PostgreSQL + Kafka + Zookeeper + Outbox Worker
Kubernetes: API deployment + PostgreSQL demo deployment
```

## Key engineering features

- API-key authentication using `X-API-Key`.
- Strict Pydantic validation for amount, currency, transaction ID and status.
- PostgreSQL constraints and indexes.
- Idempotency using a required `Idempotency-Key`.
- Transaction state machine: `PENDING -> SUCCESS/FAILED`; terminal states cannot move backwards.
- Row locking (`FOR UPDATE`) for safe concurrent status changes.
- Audit log for status changes.
- Transactional outbox: payment DB changes and event creation commit together.
- Kafka publishing through an independent outbox worker.
- Pytest unit tests for validation and state transitions.
- Docker Compose local infrastructure.
- Airflow reconciliation DAG.
- Kubernetes deployment manifests.

## Run locally

1. Create `.env` from `.env.example` and set your own values.
2. Install dependencies:

```bash
python -m pip install -r requirements.txt
```

3. Ensure PostgreSQL is running and execute `sql/schema.sql`.
4. Start the API:

```bash
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

5. Open `http://localhost:8000/docs`.

## Create a payment

Headers:

```text
X-API-Key: <your-api-key>
Idempotency-Key: demo-payment-001
```

JSON:

```json
{
  "transaction_id": "TXN2001",
  "amount": 1000.00,
  "currency": "INR",
  "status": "PENDING"
}
```

Repeat the exact request with the same idempotency key to demonstrate that the operation is replay-safe.

## Run tests

```bash
pytest -q
```

## Docker

```bash
docker compose up --build
```

Then open `http://localhost:8000/docs`.

## Airflow

The DAG in `airflow/reconciliation_dag.py` demonstrates a daily reconciliation job. For production, use a managed Airflow environment and externalized secrets.

## Kubernetes

The manifests in `k8s/` are a local/demo deployment pattern. For production, use managed PostgreSQL/Kafka, Kubernetes Secrets, resource limits, probes, autoscaling, and network policies.

## GCP direction

The API can be packaged as a container for Cloud Run or GKE. PostgreSQL should be moved to Cloud SQL and secrets to Secret Manager. Kafka can be provided by a managed Kafka service. Do not commit credentials to the repository.

## Interview talking points

- Why idempotency matters in payment APIs.
- Why terminal payment states cannot be reversed casually.
- Why database constraints are required in addition to application validation.
- Why a transactional outbox prevents a DB-success/Kafka-failure inconsistency.
- Why `FOR UPDATE` protects concurrent status updates.
- Why tests cover business invariants rather than only HTTP happy paths.
