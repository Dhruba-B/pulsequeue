# PulseQueue Kubernetes Deployment

This is the Phase 1 Kubernetes foundation for local development with Kind or Minikube. It keeps each deployable service isolated, uses Redis as the queue and event backbone, and makes worker replicas horizontally scalable.

## Architecture

PulseQueue runs in the `pulsequeue` namespace:

- `redis`: persistent queue storage, job state, pub/sub, worker heartbeats.
- `ollama`: local LLM runtime for Ollama-backed AI jobs.
- `api-server`: Express and Socket.IO service on port `5000`.
- `worker`: horizontally scalable job processors. Each pod gets a unique `PULSEQUEUE_WORKER_ID` from its Kubernetes pod name.
- `scheduler`: delayed job promotion and recovery scanning.
- `dashboard`: Vite-built React UI served by Nginx on port `80`.

Internal service discovery uses Kubernetes DNS:

- Redis URL: `redis://redis:6379`
- Ollama URL: `http://ollama:11434`
- API service: `api-server:5000`
- Dashboard service: `dashboard:80`

## Manifests

The `/k8s` directory contains a Kustomize base:

- `namespace.yaml`
- `configmap.yaml`
- `ollama.yaml`
- `secret.template.yaml`
- `redis.yaml`
- `api.yaml`
- `worker.yaml`
- `worker-hpa.yaml`
- `scheduler.yaml`
- `dashboard.yaml`
- `kustomization.yaml`

`secret.template.yaml` is intentionally not included in `kustomization.yaml`; create a real secret before applying the base.

## Build Images

Build from the repository root so Docker can copy shared monorepo packages:

```bash
docker build -f Dockerfile.api -t pulsequeue-api:local .
docker build -f Dockerfile.worker -t pulsequeue-worker:local .
docker build -f Dockerfile.scheduler -t pulsequeue-scheduler:local .
docker build -f Dockerfile.dashboard -t pulsequeue-dashboard:local .
```

For Kind:

```bash
kind load docker-image pulsequeue-api:local
kind load docker-image pulsequeue-worker:local
kind load docker-image pulsequeue-scheduler:local
kind load docker-image pulsequeue-dashboard:local
```

For Minikube, build directly into the Minikube Docker daemon:

```bash
eval $(minikube docker-env)
docker build -f Dockerfile.api -t pulsequeue-api:local .
docker build -f Dockerfile.worker -t pulsequeue-worker:local .
docker build -f Dockerfile.scheduler -t pulsequeue-scheduler:local .
docker build -f Dockerfile.dashboard -t pulsequeue-dashboard:local .
```

On Windows PowerShell with Minikube:

```powershell
minikube docker-env | Invoke-Expression
docker build -f Dockerfile.api -t pulsequeue-api:local .
docker build -f Dockerfile.worker -t pulsequeue-worker:local .
docker build -f Dockerfile.scheduler -t pulsequeue-scheduler:local .
docker build -f Dockerfile.dashboard -t pulsequeue-dashboard:local .
```

## Secrets

Create a real secret instead of applying the template:

```bash
kubectl create namespace pulsequeue
kubectl create secret generic pulsequeue-secrets \
  --namespace pulsequeue \
  --from-literal=OPENAI_API_KEY='your-key-here'
```

If OpenAI jobs are not needed, the deployments still start because the secret reference is optional.

## Deploy

```bash
kubectl apply -k k8s
kubectl get pods -n pulsequeue
kubectl get svc -n pulsequeue
```

Expose the local API and dashboard:

```bash
kubectl port-forward -n pulsequeue svc/api-server 5000:5000
kubectl port-forward -n pulsequeue svc/dashboard 4173:80
```

Open:

- Dashboard: `http://localhost:4173`
- API health: `http://localhost:5000/healthz`

## Scaling Workers

Manual scaling:

```bash
kubectl scale deployment/worker -n pulsequeue --replicas=5
```

The worker Deployment also includes an HPA:

```bash
kubectl get hpa -n pulsequeue
```

The HPA needs Metrics Server in the local cluster. On Minikube:

```bash
minikube addons enable metrics-server
```

Kind requires installing Metrics Server separately.

## Environment Variables

Shared configuration is in `k8s/configmap.yaml`:

- `NODE_ENV`
- `API_PORT`
- `REDIS_URL`
- `OLLAMA_HOST`
- `VITE_API_URL`
- `VITE_SOCKET_URL`
- `WORKER_TYPE`

Sensitive values belong in `pulsequeue-secrets`:

- `OPENAI_API_KEY`

Note: Vite variables are baked into the dashboard at image build time. Rebuild `pulsequeue-dashboard:local` when changing `VITE_API_URL` or `VITE_SOCKET_URL`.

## Ollama

The Kubernetes manifests deploy Ollama inside the cluster and point workers at the Ollama Service through `OLLAMA_HOST`:

```yaml
OLLAMA_HOST: "http://ollama:11434"
```

The `ollama` Deployment stores models in the `ollama-data` PVC and pulls `qwen2.5:3b` on startup. The first pod start can take a while because it downloads the model; later starts reuse the PVC.

```bash
kubectl apply -k k8s
kubectl rollout status deployment/ollama -n pulsequeue
kubectl rollout restart deployment/worker -n pulsequeue
```

To inspect the in-cluster Ollama endpoint:

```bash
kubectl get pods,svc -n pulsequeue -l app.kubernetes.io/name=ollama
kubectl logs -n pulsequeue deployment/ollama
```

## Kustomize Recommendation

Use Kustomize for Phase 1. It is built into `kubectl`, keeps raw Kubernetes objects visible while the architecture is still stabilizing, and makes local overlays for Kind, Minikube, staging, and production straightforward.

Helm becomes useful later if PulseQueue needs reusable chart packaging, complex value matrices, or third-party distribution.
