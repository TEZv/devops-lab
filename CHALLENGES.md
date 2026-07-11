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

## Level 5+ (soon)

- K8s-lite: Deployment + Service diagram
- Incident runbook (bridge з DE governance E6)
