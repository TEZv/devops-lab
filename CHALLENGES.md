# 🛠️ DevOps Lab — Challenges

> **Made in Ukraine** 🇺🇦 | Created by [TEZv](https://github.com/TEZv)

A hands-on set of DevOps challenges, from beginner to advanced.
Each challenge builds on previous ones.

> **How to use**: Open this repo in a [GitHub Codespace](https://github.com/codespaces) — all tools (Docker, Terraform, Kubernetes, GitHub CLI) are pre-installed. Start from Level 1 and work your way up.

---

## 🟢 Level 1: Docker

### Challenge 1.1 — Build & Run

**Goal**: Understand the Docker build lifecycle.

The `docker/` directory contains a simple `Dockerfile` and `index.html`.

1. Modify `index.html` to display something unique (a personal message, a counter, anything creative).
2. Build the Docker image.
3. Run the container and verify the page is served.

**Questions to think about**:
- What does each line in the `Dockerfile` do?
- What happens if you change the HTML but don't rebuild the image?

---

### Challenge 1.2 — Multi-Service Docker Compose

**Goal**: Connect multiple containers together.

Currently `docker-compose.yml` has only one service (`web`). Add a second one:

1. Add a `redis` service to `docker-compose.yml`.
2. Make the web service depend on redis.
3. Verify both containers are running and can communicate.

**Questions to think about**:
- How do containers discover each other in Docker Compose?
- What happens if redis starts before web is ready?

---

### Challenge 1.3 — Multi-Stage Build

**Goal**: Optimize Docker images for production.

Create a multi-stage build that:

1. Stage 1: Use a Node.js image to build a simple static site (or any build tool you like).
2. Stage 2: Copy only the build output into an nginx image.
3. The final image should be as small as possible.

**Questions to think about**:
- Why is the final image smaller with multi-stage?
- What's left behind in the build stage?

---

## 🟡 Level 2: Terraform

### Challenge 2.1 — Read & Plan

**Goal**: Understand Terraform's plan-before-apply workflow.

The `terraform/` directory has a basic configuration that creates a GitHub repository.

1. Run `terraform init` in the `terraform/` directory.
2. Run `terraform plan` and read the output carefully.
3. Answer: what resources will be created? What values are computed?

**Questions to think about**:
- What does `terraform plan` actually do?
- Why is it safer than running `terraform apply` directly?

---

### Challenge 2.2 — Variables & Parameterization

**Goal**: Make your Terraform code reusable.

Currently the repository name is hardcoded. Refactor it:

1. Create a `variables.tf` file with a variable for the repository name.
2. Replace the hardcoded name in `main.tf` with a reference to the variable.
3. Create a `terraform.tfvars` file to set the default value.
4. Run `terraform plan` again — the output should be identical.

**Questions to think about**:
- What's the difference between `variable` default values and `terraform.tfvars`?
- How would you override a variable without editing files?

---

### Challenge 2.3 — Outputs

**Goal**: Expose useful information after infrastructure is created.

1. Create an `outputs.tf` file.
2. Output at least: the repository name, its URL, and the clone URL.
3. Run `terraform plan` — notice the outputs section at the bottom.

**Questions to think about**:
- When are output values actually computed — at plan or at apply?
- How could another Terraform module use these outputs?

---

### Challenge 2.4 — Add More Resources

**Goal**: Compose multiple Terraform resources together.

Add at least one of the following to `main.tf`:

- A `github_branch_protection` resource for the `main` branch.
- A `github_team` resource and link it to the repository.
- A `github_issue_label` resource with custom colors.

**Questions to think about**:
- How do resource dependencies work in Terraform?
- What happens if you reference an attribute of a resource that hasn't been created yet?

---

## 🔴 Level 3: Kubernetes

### Challenge 3.1 — Health Checks

**Goal**: Make Kubernetes aware of your application's health.

The `k8s/deployment.yml` has a basic Deployment with no health checks.

1. Add a `livenessProbe` — how should Kubernetes check if nginx is alive?
2. Add a `readinessProbe` — when should Kubernetes start sending traffic to a pod?
3. Apply the manifest and verify probes are working with `kubectl describe pod`.

**Questions to think about**:
- What's the difference between liveness and readiness probes?
- What happens if a liveness probe fails? And a readiness probe?

---

### Challenge 3.2 — Auto-Scaling

**Goal**: Let Kubernetes scale your application automatically.

1. Create a `HorizontalPodAutoscaler` (HPA) resource.
2. Configure it to scale between 2 and 10 replicas based on CPU usage.
3. Apply it and check status with `kubectl get hpa`.

**Questions to think about**:
- What metrics can HPA use besides CPU?
- Why does HPA need resource requests to be set on the pod?

---

### Challenge 3.3 — ConfigMap as Volume

**Goal**: Separate configuration from container images.

Instead of baking HTML into the Docker image:

1. Create a `ConfigMap` containing the HTML content.
2. Mount the ConfigMap as a volume in the Deployment.
3. Verify the page is served from the ConfigMap, not the image.

**Questions to think about**:
- What happens to the running pod if you update the ConfigMap?
- When would you use a ConfigMap vs a Secret?

---

## 💀 Level 4: CI/CD

### Challenge 4.1 — Extend the Pipeline

**Goal**: Build a complete CI/CD pipeline.

The `ci-cd/pipeline.yml` has basic build and terraform plan stages.

1. Add a `test` stage that runs after `build`.
2. Add a `deploy` stage that applies Kubernetes manifests.
3. Make `deploy` only run on the `main` branch.

**Questions to think about**:
- What's the difference between `needs` and `runs-on` in GitHub Actions?
- How do you share artifacts between jobs?

---

### Challenge 4.2 — Manual Approval

**Goal**: Add a safety gate before production deployments.

1. Add a manual approval step before the `deploy` stage.
2. Use GitHub Environments with required reviewers.
3. Test: the pipeline should pause and wait for approval before deploying.

**Questions to think about**:
- What are the trade-offs between manual approvals and automated deployments?
- How would you implement "automatic rollback" if deployment fails?

---

## 🏆 Bonus Challenges

These combine multiple tools and require creative thinking.

### Bonus 1 — Terraform + Docker Provider

Use the [Terraform Docker provider](https://registry.terraform.io/providers/kreuzwerker/docker/latest) to build and run Docker containers via Terraform instead of the Docker CLI. Compare both approaches.

### Bonus 2 — GitOps with ArgoCD

Install ArgoCD in your Minikube cluster and configure it to sync Kubernetes manifests from your GitHub repository. Now every `git push` triggers a deployment.

### Bonus 3 — Infrastructure Tests

Write a test script (bash or Python) that verifies your infrastructure after `terraform apply`:
- Can we reach the GitHub repository?
- Are the branch protection rules set correctly?
- Are the labels created?

---

## 📋 Progress Tracker

| Challenge | Status |
|-----------|--------|
| 1.1 Build & Run | ⬜ |
| 1.2 Multi-Service Compose | ⬜ |
| 1.3 Multi-Stage Build | ⬜ |
| 2.1 Read & Plan | ⬜ |
| 2.2 Variables & Parameterization | ⬜ |
| 2.3 Outputs | ⬜ |
| 2.4 Add More Resources | ⬜ |
| 3.1 Health Checks | ⬜ |
| 3.2 Auto-Scaling | ⬜ |
| 3.3 ConfigMap as Volume | ⬜ |
| 4.1 Extend Pipeline | ⬜ |
| 4.2 Manual Approval | ⬜ |
| Bonus 1 — TF + Docker | ⬜ |
| Bonus 2 — ArgoCD | ⬜ |
| Bonus 3 — Infra Tests | ⬜ |

Mark completed challenges with ✅ in your fork.
