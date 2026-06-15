# Docker & Kubernetes — Live Scenarios

Levels: 🟩 Junior → 🟨 Middle → 🟥 Senior

**Rule:** 45 min blocks, no LLM. Use lab repo files where possible.

## 🟩 Level A — Docker warm-up

| # | Scenario | What they test |
|---|----------|----------------|
| A1 | Build fails — fix Dockerfile path | reading errors |
| A2 | Port already allocated | `docker ps`, stop container |
| A3 | Image huge — suggest multi-stage fix | lab 1.3 |
| A4 | `docker-compose up` — service won't start | depends_on, logs |
| A5 | Env var missing in container | `-e` / compose env |

## 🟨 Level B — Kubernetes

| # | Scenario | What they test |
|---|----------|----------------|
| B1 | Pod `CrashLoopBackOff` — find cause | `kubectl logs`, describe |
| B2 | Service exists but no traffic | selector mismatch |
| B3 | Rollout stuck — rollback | `kubectl rollout` |
| B4 | HPA not scaling — why? | metrics server, requests |
| B5 | ConfigMap not mounted — debug | volume mount path |

## 🟥 Level C — Interview combo

| # | Scenario | What they test |
|---|----------|----------------|
| C1 | Zero-downtime deploy strategy | rolling vs blue/green |
| C2 | Secret leaked in image layer | build args, scanning |
| C3 | **45 min mock**: A2 + B1 + explain fix aloud | timing |

## Daily format (5 days/week)

```
1. 10 min — repeat yesterday's scenario
2. 35 min — new scenario (write commands, not just read)
3. 10 min — out loud: root cause, prevention
```

## Common interview questions (answer without typing first)

1. What happens when you `docker run`? (layers, namespaces)
2. Difference: Deployment vs StatefulSet?
3. How would you debug high latency in prod?
4. Immutable infrastructure — what does it mean?
5. GitOps vs CI/CD push deploy?

## Progress

| ID | Done | Time | No hints? |
|----|------|------|-----------|
| A1–A5 | ⬜ | | |
| B1–B5 | ⬜ | | |
| C1–C3 | ⬜ | | |
