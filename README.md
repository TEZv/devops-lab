# 🛠️ DevOps Lab — Hands-On Practice

> **Made in Ukraine** 🇺🇦 | Created by [TEZv](https://github.com/TEZv)

A hands-on repository for learning DevOps: from Docker to Kubernetes, from Terraform to CI/CD.

Quest format, difficulty levels, and a progress tracker — the same style as [de-lab](https://github.com/TEZv/de-lab).

## What's Included

- **Docker** — containerization, multi-service compose, multi-stage builds
- **Terraform** — Infrastructure as Code (IaC), variables, outputs
- **Kubernetes (Minikube)** — deployments, health checks, auto-scaling
- **GitHub Actions** — CI/CD pipelines and manual approvals
- **GitHub CLI** — automation (pre-installed in Codespaces)

## Getting Started

### Option A — Local

```bash
git clone https://github.com/TEZv/devops-lab.git
cd devops-lab
```

Install [Docker](https://docs.docker.com/get-docker/), then open **[CHALLENGES.md](CHALLENGES.md)** — Level 1, Challenge 1.1.

For Terraform/Kubernetes challenges, [Codespaces](#option-b--github-codespaces) is easier (tools pre-installed).

### Option B — GitHub Codespaces

1. Open this repository on GitHub
2. Click **Code** → **Codespaces** → **Create codespace**
3. Wait ~2–3 minutes for the environment to build
4. Ready — Docker, Terraform, kubectl, Minikube, and `gh` are available

## Structure

```
devops-lab/
├── .devcontainer/       # Codespace configuration
├── docker/              # Dockerfile & docker-compose
├── terraform/           # Terraform configs
├── k8s/                   # Kubernetes manifests
├── ci-cd/                 # GitHub Actions workflows
└── CHALLENGES.md          # 🎮 Main quest
```

## Challenges

👉 **[CHALLENGES.md](CHALLENGES.md)** — 15+ hands-on challenges from beginner to advanced, with questions to think about and a progress tracker.

Fork this repo and start practicing!

## Related Labs

| Repo | Focus |
|------|-------|
| **[devops-lab](https://github.com/TEZv/devops-lab)** (you are here) | Docker, Terraform, K8s, CI/CD |
| **[de-lab](https://github.com/TEZv/de-lab)** | SQL, Python, dbt, BigQuery, interview sprint |

## License

MIT — use freely, credit the author ❤️
