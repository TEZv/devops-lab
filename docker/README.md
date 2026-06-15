# Docker module

Level 1 challenges ([CHALLENGES.md](../CHALLENGES.md)): containerize the app, add Redis, multi-stage builds.

## Files

| File | Purpose |
|------|---------|
| `Dockerfile` | nginx + static HTML |
| `docker-compose.yml` | multi-service stack (web + redis) |
| `index.html` | quest landing page |

## Quick Start

```bash
cd docker
docker build -t devops-quest .
docker run -d -p 8080:80 devops-quest
curl http://localhost:8080
```

## Challenges

- **1.1** — Build & Run
- **1.2** — Multi-Service Compose
- **1.3** — Multi-Stage Build
