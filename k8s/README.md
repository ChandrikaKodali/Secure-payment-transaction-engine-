# Kubernetes deployment

Build the image and make it available to your cluster:

```bash
docker build -t secure-payment-engine:latest .
kubectl apply -f k8s/postgres.yaml
kubectl apply -f k8s/api.yaml
kubectl get pods
```

For a real deployment, replace placeholder secrets and use a managed PostgreSQL/Kafka service rather than the single-replica demo database.
