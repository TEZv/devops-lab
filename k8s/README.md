# Kubernetes module

Level 3 challenges ([CHALLENGES.md](../CHALLENGES.md)): deploy, health checks, HPA, ConfigMaps.

Requires Minikube (pre-installed in Codespaces).

## Files

| File | Purpose |
|------|---------|
| `deployment.yml` | Deployment + Service for the web app |

## Quick Start (Codespaces)

```bash
minikube start
kubectl apply -f k8s/deployment.yml
kubectl get pods
minikube service devops-lab-service
```

## Challenges

- **3.1** — Health Checks
- **3.2** — Auto-Scaling
- **3.3** — ConfigMap as Volume
