# 🛠️ DevOps Lab — Challenges

> **Made in Ukraine** 🇺🇦 | Created by [TEZv](https://github.com/TEZv)

## 📖 The Quest

You've just been hired as the **first DevOps engineer** at **DevOps Quest Inc.** — a startup building a learning platform. There's no infrastructure, no containers, no pipelines. Nothing. Just a blank canvas and your skills.

Your mission: build everything from scratch, step by step, until the platform runs itself.

Each challenge unlocks the next. Complete them all and you'll have a fully automated, containerized, self-healing, auto-scaling platform deployed through CI/CD.

> **How to use**: Open this repo in a [GitHub Codespace](https://github.com/codespaces) — all tools are pre-installed. Start from Level 1 and work your way up.

### Career levels (every challenge)

| Badge | Level |
|-------|--------|
| 🟦 | Intern / Trainee |
| 🟩 | Junior |
| 🟨 | Middle |
| 🟥 | Senior |

Full guide: **[CAREER-LEVELS.md](CAREER-LEVELS.md)** · Interview track: **[interview-sprint/00-README.md](interview-sprint/00-README.md)**

---

## 🟢 Level 1: Docker — "Containerize the App"

*The dev team just shipped their first web page. It's time to put it in a container.*

### Challenge 1.1 — Build & Run ⏱️ ~15 min · 🟦 Intern

**Quest**: The team gave you a simple HTML page. Package it into a Docker container and serve it to the world (well, to localhost).

1. Open `docker/index.html` and replace the content with:
```html
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>DevOps Quest</title></head>
<body style="font-family:monospace;text-align:center;padding-top:100px;background:#1a1a2e;color:#b23a4e">
<h1>&#x2694;&#xFE0F; DevOps Quest</h1>
<p>Stage 1: Containerized</p>
<p id="status">Status: Building...</p>
<script>document.getElementById('status').textContent='Status: Live \u2713';</script>
</body>
</html>
```
2. Build the Docker image.
3. Run the container.
4. Verify the page is served.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

```bash
# Navigate to the docker directory
cd docker

# Build the image (the dot means "use current directory")
docker build -t devops-quest .

# Run the container (-d = background, -p 8080:80 = map port 8080 to container port 80)
docker run -d -p 8080:80 devops-quest

# Verify it's running
curl http://localhost:8080

# Or check in browser: go to the "Ports" tab and click port 8080
```

**Made changes to index.html? Rebuild:**
```bash
# Stop the old container
docker stop $(docker ps -q)

# Rebuild the image
docker build -t devops-quest .

# Run again
docker run -d -p 8080:80 devops-quest
```

**Troubleshooting:**

| Problem | Cause | Fix |
|---------|-------|-----|
| `port is already allocated` | Another container is using port 8080 | `docker stop $(docker ps -q)` then re-run |
| Page shows old content after rebuild | Old container still running, new one failed to start | Stop all containers first, then rebuild |
| Browser shows old page | Browser cache | Hard refresh: `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) |
| Emoji shows as `âš"ï¸` or gibberish | Missing `charset` declaration | Make sure `<head>` includes `<meta charset="UTF-8">` |
| Too many stopped containers eating disk | Containers not removed after stopping | `docker rm $(docker ps -aq)` to clean up |

**Quick cleanup (nuclear option):**
```bash
# Stop ALL containers and remove them
docker stop $(docker ps -q) 2>/dev/null
docker rm $(docker ps -aq) 2>/dev/null

# Now rebuild fresh
docker build -t devops-quest .
docker run -d -p 8080:80 devops-quest
```

</details>

**Questions to think about**:
- What does each line in the `Dockerfile` do?
- What happens if you change the HTML but don't rebuild the image?

---

### Challenge 1.2 — Multi-Service Compose ⏱️ ~20 min · 🟩 Junior

**Quest**: The app needs a database for visitor tracking. Add Redis as a second service and connect them together.

1. Add a `redis` service to `docker-compose.yml`.
2. Make the web service depend on redis.
3. Verify both containers are running and can communicate.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

Edit `docker-compose.yml` to look like this:

```yaml
version: "3.8"
services:
  web:
    build: .
    ports:
      - "8080:80"
    depends_on:
      - redis
    restart: unless-stopped
  redis:
    image: redis:alpine
    ports:
      - "6379:6379"
    restart: unless-stopped
```

Then run:
```bash
# Stop any running containers first
docker stop $(docker ps -q)

# Start all services with docker compose
docker compose up -d

# Verify both are running
docker compose ps

# Test that web can reach redis
docker compose exec web sh -c "apk add --no-cache redis && redis-cli -h redis ping"
# Expected output: PONG
```

**Made changes? Rebuild and restart:**
```bash
docker compose down
docker compose up -d --build
```

</details>

**Questions to think about**:
- How do containers discover each other in Docker Compose? (Hint: check the service names)
- What happens if redis starts before web is ready?

---

### Challenge 1.3 — Multi-Stage Build ⏱️ ~30 min · 🟩 Junior

**Quest**: The image is too big for production. Create a multi-stage build — build a Node.js app in stage 1, copy only the result to nginx in stage 2.

1. Create a simple Node.js app that generates a static page.
2. Build it in stage 1 using a `node` image.
3. Copy only the output to nginx in stage 2.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

First, create `docker/package.json`:
```json
{
  "name": "devops-quest-builder",
  "scripts": {
    "build": "node build.js"
  }
}
```

Then create `docker/build.js`:
```javascript
const fs = require('fs');
const html = `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>DevOps Quest</title></head>
<body style="font-family:monospace;text-align:center;padding-top:100px;background:#1a1a2e;color:#b23a4e">
<h1>&#x2694;&#xFE0F; DevOps Quest</h1>
<p>Stage 1: Containerized &#x2713;</p>
<p>Stage 2: Multi-Stage Build &#x2713;</p>
<p>Image size: optimized!</p>
</body>
</html>`;
fs.writeFileSync('dist/index.html', html);
```

Then update `docker/Dockerfile`:
```dockerfile
# Stage 1: Build
FROM node:alpine AS builder
WORKDIR /app
COPY package.json .
RUN npm install
COPY build.js .
RUN mkdir dist && npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY --from=builder /app/dist/index.html /usr/share/nginx/html/index.html
```

Build and run:
```bash
docker stop $(docker ps -q)
docker build -t devops-quest .
docker run -d -p 8080:80 devops-quest
curl http://localhost:8080
```

Compare image sizes:
```bash
docker images | grep devops-quest
```

</details>

**Questions to think about**:
- Why is the final image smaller with multi-stage?
- What's left behind in the build stage?

---

## 🟡 Level 2: Terraform — "Infrastructure as Code"

*The startup is growing. Manual setup won't scale. It's time to define infrastructure as code.*

### Challenge 2.1 — Read & Plan ⏱️ ~15 min · 🟩 Junior

**Quest**: Before touching anything, learn to read the plan. Terraform's `plan` command shows you what *would* change — without actually changing it.

1. Run `terraform init` in the `terraform/` directory.
2. Run `terraform plan` and read the output carefully.
3. Answer: what resources will be created? What values are computed?

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

```bash
cd terraform

# Initialize Terraform (downloads providers)
terraform init

# See what Terraform WOULD do (without doing it)
terraform plan
```

Read the output carefully. You'll see:
- **"Plan:"** — how many resources will be created
- **Resource details** — what each resource looks like
- **Computed values** — values that will only be known after apply (marked with `<computed>` or shown only after creation)

</details>

**Questions to think about**:
- What does `terraform plan` actually do?
- Why is it safer than running `terraform apply` directly?

---

### Challenge 2.2 — Variables & Parameterization ⏱️ ~20 min · 🟩 Junior

**Quest**: The repo name is hardcoded. Your teammate wants to reuse this config for another project. Make it configurable.

1. Create a `variables.tf` file with a variable for the repository name.
2. Replace the hardcoded name in `main.tf` with a reference to the variable.
3. Create a `terraform.tfvars` file to set the value.
4. Run `terraform plan` — the output should be identical.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

Create `terraform/variables.tf`:
```hcl
variable "repo_name" {
  description = "Name of the GitHub repository"
  type        = string
  default     = "devops-quest-app"
}

variable "repo_description" {
  description = "Description of the GitHub repository"
  type        = string
  default     = "DevOps Quest — a learning platform built with DevOps best practices"
}
```

Create `terraform/terraform.tfvars`:
```hcl
repo_name        = "devops-quest-app"
repo_description = "DevOps Quest — a learning platform built with DevOps best practices"
```

Update `terraform/main.tf` — replace hardcoded values:
```hcl
resource "github_repository" "example" {
  name        = var.repo_name
  description = var.repo_description
  visibility  = "public"
  auto_init   = true
}
```

Then verify:
```bash
terraform plan
# The plan should show the same resources as before
```

**Want to override a variable without editing files?**
```bash
terraform plan -var="repo_name=my-other-project"
```

</details>

**Questions to think about**:
- What's the difference between `variable` default values and `terraform.tfvars`?
- How would you override a variable without editing files?

---

### Challenge 2.3 — Outputs ⏱️ ~15 min · 🟩 Junior

**Quest**: After creating infrastructure, your team needs to know where to find it. Expose the important URLs and names.

1. Create an `outputs.tf` file.
2. Output at least: the repository name, its URL, and the clone URL.
3. Run `terraform plan` — notice the outputs section at the bottom.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

Create `terraform/outputs.tf`:
```hcl
output "repository_name" {
  description = "Name of the created repository"
  value       = github_repository.example.name
}

output "repository_url" {
  description = "URL of the created repository"
  value       = github_repository.example.html_url
}

output "repository_clone_url" {
  description = "Clone URL of the created repository"
  value       = github_repository.example.http_clone_url
}
```

Then verify:
```bash
terraform plan
# Scroll to the bottom — you'll see the outputs section
```

</details>

**Questions to think about**:
- When are output values actually computed — at plan or at apply?
- How could another Terraform module use these outputs?

---

### Challenge 2.4 — Add More Resources ⏱️ ~25 min · 🟨 Middle

**Quest**: The team wants branch protection and issue labels. Add them to the Terraform config.

Add at least one of the following to `main.tf`:

- A `github_branch_protection` resource for the `main` branch.
- A `github_issue_label` resource with custom colors.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

Add branch protection to `terraform/main.tf`:
```hcl
resource "github_branch_protection" "main" {
  repository_id = github_repository.example.node_id
  pattern       = "main"

  required_pull_request_reviews {
    required_approving_review_count = 1
  }

  required_status_checks {
    strict   = true
    contexts = ["build", "test"]
  }
}
```

Add issue labels:
```hcl
resource "github_issue_label" "bug" {
  repository  = github_repository.example.name
  name        = "bug"
  color       = "e94560"
  description = "Something isn't working"
}

resource "github_issue_label" "devops" {
  repository  = github_repository.example.name
  name        = "devops"
  color       = "0f3460"
  description = "Infrastructure & deployment"
}
```

Then verify:
```bash
terraform plan
# You should see the new resources being added
```

</details>

**Questions to think about**:
- How do resource dependencies work in Terraform?
- What happens if you reference an attribute of a resource that hasn't been created yet?

---

## 🔴 Level 3: Kubernetes — "Deploy to Production"

*The platform is growing. It's time to deploy to Kubernetes — the industry standard for container orchestration.*

### Challenge 3.1 — Health Checks ⏱️ ~20 min · 🟨 Middle

**Quest**: Your pods are running, but Kubernetes doesn't know if they're healthy. Add probes so Kubernetes can monitor and restart unhealthy pods automatically.

1. Add a `livenessProbe` to the Deployment.
2. Add a `readinessProbe` to the Deployment.
3. Apply and verify with `kubectl describe pod`.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

First, start Minikube:
```bash
minikube start
```

Update `k8s/deployment.yml` — add probes inside the container spec:
```yaml
        livenessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 5
          periodSeconds: 10

        readinessProbe:
          httpGet:
            path: /
            port: 80
          initialDelaySeconds: 3
          periodSeconds: 5
```

Apply and verify:
```bash
kubectl apply -f k8s/deployment.yml
kubectl get pods
kubectl describe pod <pod-name>
# Look for "Liveness" and "Readiness" in the output
```

**Made changes? Re-apply:**
```bash
kubectl apply -f k8s/deployment.yml
```

</details>

**Questions to think about**:
- What's the difference between liveness and readiness probes?
- What happens if a liveness probe fails? And a readiness probe?

---

### Challenge 3.2 — Auto-Scaling ⏱️ ~25 min · 🟨 Middle

**Quest**: Traffic is unpredictable. Let Kubernetes automatically add or remove pods based on load.

1. Create a `HorizontalPodAutoscaler` (HPA) resource.
2. Configure it to scale between 2 and 10 replicas based on CPU usage.
3. Apply and check status with `kubectl get hpa`.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

First, make sure your Deployment has resource requests (HPA needs them). Add to the container spec in `k8s/deployment.yml`:
```yaml
        resources:
          requests:
            cpu: 50m
          limits:
            cpu: 100m
```

Create `k8s/hpa.yml`:
```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: devops-quest-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: devops-lab
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 50
```

Apply:
```bash
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/hpa.yml
kubectl get hpa
```

Test scaling (generate load):
```bash
kubectl run load-gen --image=busybox --restart=Never -- /bin/sh -c "while true; do wget -q -O- http://devops-lab-service:80; done"
# Watch HPA scale up
kubectl get hpa -w
```

</details>

**Questions to think about**:
- What metrics can HPA use besides CPU?
- Why does HPA need resource requests to be set on the pod?

---

### Challenge 3.3 — ConfigMap as Volume ⏱️ ~30 min · 🟨 Middle

**Quest**: Every time the HTML changes, you rebuild the whole image. That's slow. Instead, store the HTML in a ConfigMap and mount it as a volume — now you can update content without rebuilding.

1. Create a `ConfigMap` containing the HTML content.
2. Mount the ConfigMap as a volume in the Deployment.
3. Verify the page is served from the ConfigMap, not the image.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

Create `k8s/configmap.yml`:
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: devops-quest-html
data:
  index.html: |
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><title>DevOps Quest</title></head>
    <body style="font-family:monospace;text-align:center;padding-top:100px;background:#1a1a2e;color:#b23a4e">
    <h1>&#x2694;&#xFE0F; DevOps Quest</h1>
    <p>Stage 1: Containerized &#x2713;</p>
    <p>Stage 2: Multi-Stage Build &#x2713;</p>
    <p>Stage 3: Kubernetes &#x2713;</p>
    <p>Stage 4: ConfigMap Volume &#x2713;</p>
    <p>Content from ConfigMap &mdash; no rebuild needed!</p>
    </body>
    </html>
```

Update `k8s/deployment.yml` — add volume and volumeMount to the container:
```yaml
        volumeMounts:
          - name: html-volume
            mountPath: /usr/share/nginx/html/index.html
            subPath: index.html
      volumes:
        - name: html-volume
          configMap:
            name: devops-quest-html
```

Apply:
```bash
kubectl apply -f k8s/configmap.yml
kubectl apply -f k8s/deployment.yml
kubectl apply -f k8s/hpa.yml
```

**Update content without rebuilding:**
```bash
# Edit the ConfigMap
kubectl edit configmap devops-quest-html
# Change the HTML, save, and pods will pick it up
```

</details>

**Questions to think about**:
- What happens to the running pod if you update the ConfigMap?
- When would you use a ConfigMap vs a Secret?

---

## 💀 Level 4: CI/CD — "Automate Everything"

*You've built everything manually. Now make it automatic — every git push triggers a full pipeline.*

### Challenge 4.1 — Extend the Pipeline ⏱️ ~30 min · 🟨 Middle

**Quest**: The pipeline only builds and plans. Add a test stage and a deploy stage to make it complete.

1. Add a `test` stage that runs after `build`.
2. Add a `deploy` stage that applies Kubernetes manifests.
3. Make `deploy` only run on the `main` branch.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

Update `ci-cd/pipeline.yml`:

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Build Docker image
        run: docker build -t devops-quest ./docker

      - name: Run container
        run: docker run -d -p 8080:80 devops-quest

      - name: Test
        run: curl -f http://localhost:8080

  terraform:
    runs-on: ubuntu-latest
    needs: build
    steps:
      - uses: actions/checkout@v4

      - name: Setup Terraform
        uses: hashicorp/setup-terraform@v3

      - name: Terraform Init
        run: cd terraform && terraform init

      - name: Terraform Plan
        run: cd terraform && terraform plan

  deploy:
    runs-on: ubuntu-latest
    needs: [build, terraform]
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Kubernetes
        run: echo "Deploy step — replace with kubectl apply in a real cluster"
```

Push to main and watch the pipeline run in the **Actions** tab.

</details>

**Questions to think about**:
- What's the difference between `needs` and `runs-on` in GitHub Actions?
- How do you share artifacts between jobs?

---

### Challenge 4.2 — Manual Approval ⏱️ ~25 min · 🟨 Middle

**Quest**: Auto-deploy to production is risky. Add a manual approval gate — the pipeline pauses until a human says "go".

1. Add a GitHub Environment called `production`.
2. Add required reviewers to the environment.
3. Make the `deploy` job use this environment.

<details>
<summary>🔧 Stuck? Click here for step-by-step instructions</summary>

**Step 1**: Create the environment on GitHub:
1. Go to your repo → **Settings** → **Environments** → **New environment**
2. Name it `production`
3. Add **Required reviewers** (add yourself)
4. Save

**Step 2**: Update `ci-cd/pipeline.yml` — add environment to the deploy job:
```yaml
  deploy:
    runs-on: ubuntu-latest
    needs: [build, terraform]
    if: github.ref == 'refs/heads/main'
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Deploy to Production
        run: echo "🚀 Deploying to production!"
```

Now when the pipeline reaches the deploy stage, it will pause and wait for approval in the **Actions** tab.

</details>

**Questions to think about**:
- What are the trade-offs between manual approvals and automated deployments?
- How would you implement "automatic rollback" if deployment fails?

---

## 🟣 Level 5: Interview Ready — "Ship the Story"

*DevOps Quest Inc. is hiring. You need to explain what you built — and debug under pressure.*

### Challenge 5.1 — Linux Debug Live ⏱️ ~45 min · 🟨 Middle

**Quest**: Timed drill from [`interview-sprint/01-Linux-Networking-Sprint-30.md`](interview-sprint/01-Linux-Networking-Sprint-30.md) — pick Day 7 or 14 mock.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Set a 45-minute timer. Pick **Day 7** or **Day 14** mock from the sprint. No LLM. Afterward, log which commands you forgot.

</details>

---

### Challenge 5.2 — Docker / K8s Live ⏱️ ~45 min · 🟨 Middle

**Quest**: Complete **C3** from [`interview-sprint/02-Docker-K8s-Live.md`](interview-sprint/02-Docker-K8s-Live.md) — explain root cause out loud.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Do scenarios **A2** (port allocated) + **B1** (CrashLoopBackOff). Narrate: symptom → command → root cause → prevention.

</details>

---

### Challenge 5.3 — Infrastructure Case ⏱️ ~60 min · 🟨 Middle

**Quest**: [`interview-sprint/03-Infrastructure-Case.md`](interview-sprint/03-Infrastructure-Case.md) — Case 2 or 4 on whiteboard + 3 failure modes.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Use the 5-step framework in the case file. Draw boxes before details. List 3 ways the design fails under load.

</details>

---

### Challenge 5.4 — Explain Your Platform ⏱️ ~30 min · 🟨 Middle

**Quest**: 5-minute pitch: what you built in Levels 1–4, how CI/CD works, what you'd do first in an outage.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Record audio or write bullets: Docker → Terraform → K8s → GitHub Actions. End with: "First thing in an outage: check recent deploys, then logs, then rollback."

</details>

---

## 🔍 Spot Check — "Something's Off"

> **Different muscle.** Not "run the command" — spot what **fails a correctness check**: wrong probe, moving tags, secrets in git, `depends_on` myths. Try **before** opening answers.
>
> **#1** is the quote quest (bash/YAML) — full challenge, not a handout. Do it first if Compose ever bit you.

Full set (12 exercises, ~5–10 min each): **[SPOT-CHECK.md](SPOT-CHECK.md)**

| # | Trap | Level | Ties to |
|---|------|-------|---------|
| 1 | Quote quest — bash `$VAR`, YAML `it's` | 🟦 | Compose / CI |
| 2 | Edit HTML but skip `docker build` | 🟦 | Challenge 1.1 |
| 3 | `EXPOSE` ≠ port published to host | 🟦 | Challenge 1.1 |
| 4 | `depends_on` ≠ service ready | 🟩 | Challenge 1.2 |
| 5 | Liveness kills slow-start app | 🟨 | Challenge 3.1 |
| 6 | `nginx:latest` in production | 🟩 | Image tags |
| 7 | Secrets in committed Compose | 🟩 | Security |
| 8 | `terraform apply -auto-approve` wrong env | 🟨 | Challenge 2.1, 4.2 |
| 9 | HPA without `resources.requests` | 🟨 | Challenge 3.2 |
| 10 | `COPY . .` without `.dockerignore` | 🟩 | Challenge 1.3 |
| 11 | `docker system prune -a` on shared runner | 🟨 | CI hygiene |
| 12 | `kubectl delete pod` vs fix Deployment | 🟩 | Challenge 3.1 |

**When to use**: after Level 1, or one per day before interviews. Passing = explain the failure mode **without** peeking.

<details>
<summary>🔧 Example — Spot Check 5 (peek only after you try)</summary>

`livenessProbe` with `initialDelaySeconds: 10` on a JVM that needs 90s → kube **restarts** the pod while it's still starting.

`readinessProbe` only removes traffic — use generous liveness delay or `startupProbe`, tune readiness for "can serve requests".

</details>

---

## 🏆 Bonus Challenges — "Master Level"

*You've completed the main quest. These challenges combine multiple tools and require creative thinking.*

### Bonus 1 — Terraform + Docker Provider ⏱️ ~45 min · 🟥 Senior

**Quest**: Why use Docker CLI when you can manage containers with Terraform? Use the [Terraform Docker provider](https://registry.terraform.io/providers/kreuzwerker/docker/latest) to build and run containers via Terraform. Compare both approaches.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Add the Docker provider to your Terraform config:

```hcl
terraform {
  required_providers {
    docker = {
      source  = "kreuzwerker/docker"
      version = "~> 3.0"
    }
  }
}

provider "docker" {}

resource "docker_image" "quest" {
  name = "nginx:alpine"
}

resource "docker_container" "quest" {
  image = docker_image.quest.image_id
  name  = "devops-quest-tf"
  ports {
    internal = 80
    external = 8081
  }
}
```

</details>

---

### Bonus 2 — GitOps with ArgoCD ⏱️ ~60 min · 🟥 Senior

**Quest**: What if Kubernetes always matched your git repo? Install ArgoCD and configure it to sync manifests from GitHub. Now every `git push` = automatic deployment.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

```bash
# Install ArgoCD in your Minikube cluster
kubectl create namespace argocd
kubectl apply -n argocd -f https://raw.githubusercontent.com/argoproj/argo-cd/stable/manifests/install.yaml

# Get the ArgoCD admin password
kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d

# Port-forward to access the UI
kubectl port-forward svc/argocd-server -n argocd 8080:443
```

Then create an ArgoCD Application that points to your GitHub repo's `k8s/` directory.

</details>

---

### Bonus 3 — Infrastructure Tests ⏱️ ~45 min · 🟥 Senior

**Quest**: How do you know your infrastructure actually works? Write a test script that verifies everything after `terraform apply`.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Create `tests/infra_test.sh`:
```bash
#!/bin/bash
set -e

echo "🧪 Testing infrastructure..."

# Test 1: Repository exists
REPO_URL=$(terraform output -raw repository_url)
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$REPO_URL")
if [ "$HTTP_CODE" == "200" ]; then
  echo "✅ Repository is accessible"
else
  echo "❌ Repository returned HTTP $HTTP_CODE"
  exit 1
fi

# Test 2: Branch protection exists
REPO_NAME=$(terraform output -raw repository_name)
gh api "repos/$REPO_NAME/branches/main/protection" > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✅ Branch protection is enabled"
else
  echo "❌ Branch protection is missing"
  exit 1
fi

echo "🎉 All tests passed!"
```

</details>

---

### Bonus 4 — Senior DevOps Vocabulary ⏱️ ~4 hours · 🟥 Senior

**Quest**: [`interview-sprint/04-Senior-DevOps-Additions.md`](interview-sprint/04-Senior-DevOps-Additions.md)

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Mark each term in the file: can explain / need to study. Focus on GitOps + immutable infra first.

</details>

### Bonus 5 — SRE Overview ⏱️ ~2 hours · 🟥 Senior

**Quest**: [`interview-sprint/05-Senior-SRE-Additions.md`](interview-sprint/05-Senior-SRE-Additions.md) — optional stretch for on-call / reliability roles.

<details>
<summary>🔧 Stuck? Click here for a hint</summary>

Optional unless targeting SRE titles. Skim SLI/SLO/error budget — enough to use terms correctly in interviews.

</details>

---

## 📋 Progress Tracker

| Challenge | Career | Time | Status |
|-----------|--------|------|--------|
| 1.1 Build & Run | 🟦 | ~15 min | ⬜ |
| 1.2 Multi-Service Compose | 🟩 | ~20 min | ⬜ |
| 1.3 Multi-Stage Build | 🟩 | ~30 min | ⬜ |
| 2.1 Read & Plan | 🟩 | ~15 min | ⬜ |
| 2.2 Variables & Parameterization | 🟩 | ~20 min | ⬜ |
| 2.3 Outputs | 🟩 | ~15 min | ⬜ |
| 2.4 Add More Resources | 🟨 | ~25 min | ⬜ |
| 3.1 Health Checks | 🟨 | ~20 min | ⬜ |
| 3.2 Auto-Scaling | 🟨 | ~25 min | ⬜ |
| 3.3 ConfigMap as Volume | 🟨 | ~30 min | ⬜ |
| 4.1 Extend Pipeline | 🟨 | ~30 min | ⬜ |
| 4.2 Manual Approval | 🟨 | ~25 min | ⬜ |
| 5.1 Linux Debug Live | 🟨 | ~45 min | ⬜ |
| 5.2 Docker/K8s Live | 🟨 | ~45 min | ⬜ |
| 5.3 Infra Case | 🟨 | ~60 min | ⬜ |
| 5.4 Platform Pitch | 🟨 | ~30 min | ⬜ |
| 🔍 Spot Check (12) | 🟦–🟨 | ~1.75 hr total | ⬜ |
| Bonus 1 TF + Docker | 🟥 | ~45 min | ⬜ |
| Bonus 2 ArgoCD | 🟥 | ~60 min | ⬜ |
| Bonus 3 Infra Tests | 🟥 | ~45 min | ⬜ |
| Bonus 4 Senior DevOps | 🟥 | ~4 hrs | ⬜ |
| Bonus 5 SRE | 🟥 | ~2 hrs | ⬜ |

**Total estimated time: ~10–12 hours** (core + interview + bonuses)

Mark completed challenges with ✅ in your fork.

---

## 🎯 The Big Picture

Complete all challenges and your quest page will evolve:

| Stage | Unlocked By |
|-------|-------------|
| ⚔️ Containerized | Challenge 1.1 |
| 🔗 Multi-Service | Challenge 1.2 |
| 🪶 Optimized Build | Challenge 1.3 |
| 📋 Infrastructure as Code | Challenge 2.1-2.4 |
| 🚀 Kubernetes Deploy | Challenge 3.1 |
| 📈 Auto-Scaling | Challenge 3.2 |
| 🔄 Zero-Downtime Updates | Challenge 3.3 |
| 🤖 Full CI/CD | Challenge 4.1-4.2 |
| 🎤 Interview Ready | Challenge 5.1-5.4 |
| 🔍 Sharp Eyes | Spot Check ≥ 8/12 without peeking |
| 🏆 GitOps Master | All Bonus Challenges |

**You started with nothing. You ended with a fully automated platform.** 🎉
