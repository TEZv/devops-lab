# CI/CD module

Level 4 challenges ([CHALLENGES.md](../CHALLENGES.md)): extend the pipeline, manual approvals, bonus GitOps.

## Files

| File | Purpose |
|------|---------|
| `pipeline.yml` | GitHub Actions: Docker build/test + Terraform validate |

## Quick Start

Copy or merge into `.github/workflows/` in your fork, then push to `main` and watch the **Actions** tab.

```bash
mkdir -p .github/workflows
cp ci-cd/pipeline.yml .github/workflows/pipeline.yml
git add .github/workflows/pipeline.yml
git commit -m "Add CI/CD pipeline"
git push
```

## Challenges

- **4.1** — Extend Pipeline
- **4.2** — Manual Approval
- **Bonus** — TF + Docker, ArgoCD, infra tests
