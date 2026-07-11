# Terraform module

Level 2 challenges ([CHALLENGES.md](../CHALLENGES.md)): plan infrastructure, variables, outputs, multiple resources.

## Files

| File | Purpose |
|------|---------|
| `main.tf` | GitHub provider, sample repo + Actions secret |

## Quick Start (Codespaces)

```bash
cd terraform
export GITHUB_TOKEN=$(gh auth token)   # or your PAT with repo scope
terraform init
terraform plan
```

> **Note:** `terraform apply` creates a real public repo `devops-practice-repo` on your GitHub account. Use a fork or adjust `main.tf` if you only want to plan.

## Challenges

- **2.1** — Read & Plan
- **2.2** — Variables & Parameterization
- **2.3** — Outputs
- **2.4** — Add More Resources
