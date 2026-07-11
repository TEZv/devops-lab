# DevOps Lab · CHALLENGES

> Hands-on поруч із [Archer Gym](https://devops-lab-gym.web.app). DE трек: [Mage Gym](https://de-lab-interview-gym.web.app).

## Level 1 — Shell

1. **grep + pipe** — знайди ERROR у `sample.log`, порахуй рядки
2. **permissions** — `chmod` на deploy script (не 777)
3. **cron** — nightly backup рядок (див. DE Lab orchestration O3)

## Level 2 — Git / CI

1. **Feature branch** → PR → review → merge (без push у `main`)
2. **GitHub Actions** — lint + test на push
3. Звʼязок з DE Lab `11-skills` U6

## Level 3 — Docker

1. **Dockerfile** — Python ETL image (non-root user)
2. **docker compose** — app + postgres local
3. **`:latest` trap** — pin image digest у prod

## Level 4 — Terraform / IaC

1. **Pet module** — S3 bronze bucket + least-privilege IAM (bridge DE cloud A3)
2. **Remote state** — S3 backend + DynamoDB lock
3. **plan → PR → apply** — drift triage якщо хтось клікнув у console

## Level 5 — K8s-lite

1. **Deployment + Service** — 3 replicas, label `app=web`, ClusterIP
2. **Probe trap** — liveness port/path match app (не CrashLoop)
3. **kubectl triage** — get → describe → logs → fix YAML → rollout status
4. Gym: [шар 5](https://devops-lab-gym.web.app/#/block/05-k8s-devops/K0)

## Level 6 — Production habits

1. **SLI/SLO** — error rate + latency; error budget перед risky deploy
2. **On-call** — ack → runbook → mitigate → #incidents
3. **Postmortem** — blameless timeline + action items (bridge [DE governance E6](https://de-lab-interview-gym.web.app))
4. Gym: [шар 6](https://devops-lab-gym.web.app/#/block/06-prod-devops/R0) · [Ops Interview Arena](https://devops-lab-gym.web.app/#/interview)
