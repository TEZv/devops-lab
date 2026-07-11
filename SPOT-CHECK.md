# 🔍 Spot Check — "Something's Off"

> **Made in Ukraine** 🇺🇦 | Companion to [CHALLENGES.md](CHALLENGES.md)

These are **not** build exercises. A README, a pipeline, or a manifest *runs* or *looks* fine — but fails a correctness check in production.

**How to play**

1. Read the scenario. **Do not** open the answer yet.
2. Explain: what's wrong, what breaks first (dev? prod? security?), and the fix.
3. Open **Check your answer** only after you've committed.
4. Optional: reproduce in your Codespace when a command is involved.

**Career levels** match [CAREER-LEVELS.md](CAREER-LEVELS.md). Time = thinking time.

**Quest order:** start with **#1** if Compose/YAML/bash quotes ever bit you — guess first, then peek.

---

## Spot Check 1 — Quote Quest: Shell, YAML, .env ⏱️ ~5 min · 🟦 Intern

**Source**: One PR, three quote styles.

```bash
# CI debug script
echo $HOME
echo '$HOME'
echo "$HOME"
```

```yaml
# docker-compose.yml
environment:
  - MSG=it's broken
  - DATABASE_URL=postgres://admin:Secret@db:5432/app
```

```bash
# .env (intended)
API_KEY=abc123
MESSAGE=hello world
```

**Your task**

1. What does each `echo` line print? (Assume `$HOME=/home/devops`.)
2. Why does `MSG=it's broken` break YAML parsing?
3. Fix the `MSG` line without removing the apostrophe.
4. Why is `DATABASE_URL=...` a problem even if YAML parses fine?

<details>
<summary>✅ Check your answer</summary>

1. `echo $HOME` → `/home/devops`. `echo '$HOME'` → literal `$HOME`. `echo "$HOME"` → `/home/devops`. **Single quotes** = literal; **double quotes** = expand variables (bash).
2. Bare `it's` — the `'` in `it's` **ends** the YAML string early → syntax error or truncated value.
3. `- "MSG=it's fine"` or quote/escape per YAML rules.
4. **Secrets in git** — URL with password is a credential leak regardless of quotes. Use `.env` + `env_file:`, `.gitignore`, CI secrets. See **Spot Check #7**.

**Remember by doing:** context decides quotes — SQL uses `'text'`; bash uses `'` vs `"` for expansion; YAML needs quotes when `'` or `:` appear.

</details>

---

## Spot Check 2 — Rebuild Amnesia ⏱️ ~5 min · 🟦 Intern

**Source**: Challenge 1.1 passed yesterday. Today you edit `docker/index.html`, run:

```bash
docker run -d -p 8080:80 devops-quest
```

Browser still shows **old** content. Teammate says: "Docker is broken."

**Your task**

1. What's actually wrong?
2. Minimum command sequence to see new HTML.

<details>
<summary>✅ Check your answer</summary>

The **image** is immutable. `docker run` reuses the old image layer stack — editing files on disk doesn't change an existing image.

Minimum fix:

```bash
docker stop $(docker ps -q)   # if port busy / old container running
cd docker
docker build -t devops-quest .
docker run -d -p 8080:80 devops-quest
```

**Lesson**: change code → **rebuild** → run. Challenge 1.1 troubleshooting table.

</details>

---

## Spot Check 3 — EXPOSE Fantasy ⏱️ ~5 min · 🟦 Intern

**Source**: Dockerfile ends with:

```dockerfile
EXPOSE 80
```

New hire runs:

```bash
docker run -d devops-quest
curl http://localhost:8080
```

Connection refused.

**Your task**

1. Does `EXPOSE` publish the port to the host?
2. Fix the `docker run` command (host port 8080).

<details>
<summary>✅ Check your answer</summary>

`EXPOSE` is **documentation** (and default for linked containers) — it does **not** map ports to the host.

Fix:

```bash
docker run -d -p 8080:80 devops-quest
```

Format: `-p hostPort:containerPort`.

</details>

---

## Spot Check 4 — depends_on ≠ Ready ⏱️ ~7 min · 🟩 Junior

**Source**: `docker-compose.yml`:

```yaml
services:
  web:
    depends_on:
      - redis
  redis:
    image: redis:7
```

Web starts, immediately connects to Redis, logs `Connection refused` for 2–3 seconds, then works.

**Your task**

1. What does `depends_on` actually guarantee?
2. Name two ways to wait until Redis accepts connections.

<details>
<summary>✅ Check your answer</summary>

`depends_on` only waits for the **container to start**, not for the **service inside** to be ready.

Fixes:

- **healthcheck** on `redis` + `depends_on: condition: service_healthy` (Compose v2 syntax)
- **retry loop** in app entrypoint
- init container / wait-for-it script (know the trade-off)

Challenge 1.2 — multi-service wiring.

</details>

---

## Spot Check 5 — Liveness Kills the Patient ⏱️ ~7 min · 🟨 Middle

**Source**: K8s deployment: Java app needs **90s** to warm up. Manifest:

```yaml
livenessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 10
  periodSeconds: 5
readinessProbe:
  httpGet:
    path: /health
    port: 8080
  initialDelaySeconds: 90
```

Pods restart in a loop during deploy.

**Your task**

1. Which probe is misconfigured for slow startup?
2. What does kube do when **liveness** fails vs **readiness**?

<details>
<summary>✅ Check your answer</summary>

**Liveness** is too aggressive (`initialDelaySeconds: 10`). Kube **restarts** the container when liveness fails — killing a still-starting JVM.

**Readiness** failure only removes the pod from Service traffic — no restart.

Fix: generous **liveness** `initialDelaySeconds` (or startupProbe), tighter **readiness** once app can serve. Challenge 3.1.

</details>

---

## Spot Check 6 — :latest Roulette ⏱️ ~5 min · 🟩 Junior

**Source**: Production deployment:

```yaml
image: nginx:latest
```

"It works on my laptop. Prod is flaky after every deploy."

**Your task**

1. Why is `latest` a reproducibility problem?
2. What do you pin instead?

<details>
<summary>✅ Check your answer</summary>

`latest` is a **moving tag** — pull today ≠ pull tomorrow. Rolling deploys can mix two nginx versions across pods.

Pin digest or explicit version: `nginx:1.25.3` or `nginx@sha256:…`.

**Prod rule**: immutable image references.

</details>

---

## Spot Check 7 — Secret in Git ⏱️ ~7 min · 🟩 Junior

**Source**: `docker-compose.yml` in the repo:

```yaml
environment:
  - DATABASE_URL=postgres://admin:SuperSecret123@db:5432/app
```

CI passes. Security review fails.

**Your task**

1. What's the immediate security risk?
2. Two fixes (local dev + CI) that keep secrets out of git.
3. A teammate also has `MSG=it's a secret` in the same file — which Spot Check covers that quote bug?

<details>
<summary>✅ Check your answer</summary>

**Security:** credentials in **git history forever** — fork, log, screenshot leak.

Fixes:

- `.env` file + `env_file:` in Compose, `.env` in `.gitignore`
- CI secrets / GitHub Actions secrets → inject at runtime
- secret managers (Vault, cloud SM) for prod

Never commit real passwords — use `.env.example` with placeholders.

3. **`MSG=it's...`** → **Spot Check #1** (YAML apostrophe). This challenge is about **secrets in git**, not quote rules.

</details>

---

## Spot Check 8 — terraform apply Autopilot ⏱️ ~7 min · 🟨 Middle

**Source**: On-call runs:

```bash
terraform apply -auto-approve
```

from laptop against **production** workspace. Slack says: "Why did staging S3 bucket get deleted?"

**Your task**

1. What process steps were skipped?
2. How do workspaces / backends reduce blast radius?

<details>
<summary>✅ Check your answer</summary>

Skipped: `terraform plan` review, correct **workspace** confirmation, peer review for prod, possibly wrong **state** target.

Mitigations:

- separate workspaces / state per env (`staging`, `prod`)
- `plan` in CI, manual approve for prod (Challenge 4.2)
- `-auto-approve` banned on prod applies

**Lesson**: IaC is code + operations — Challenge 2.1.

</details>

---

## Spot Check 9 — HPA Without Fuel ⏱️ ~10 min · 🟨 Middle

**Source**: HorizontalPodAutoscaler targets CPU 50%. Deployment has:

```yaml
resources: {}
```

HPA never scales above 1 replica under load.

**Your task**

1. Why doesn't HPA scale?
2. What minimum `resources` fields does HPA need?

<details>
<summary>✅ Check your answer</summary>

HPA compares **current CPU usage** to **requests**. No `resources.requests.cpu` → metrics unavailable or undefined → no scaling.

Minimum:

```yaml
resources:
  requests:
    cpu: "100m"
    memory: "128Mi"
  limits:
    cpu: "500m"
    memory: "256Mi"
```

Challenge 3.2 — set requests before trusting HPA.

</details>

---

## Spot Check 10 — .dockerignore Oops ⏱️ ~7 min · 🟩 Junior

**Source**: Dockerfile:

```dockerfile
FROM node:20
WORKDIR /app
COPY . .
RUN npm ci && npm run build
```

Repo contains `.env` with API keys. Image builds fine. Security scan flags leaked secrets in layer history.

**Your task**

1. Which instruction copies `.env` into the image?
2. What belongs in `.dockerignore`?
3. Why doesn't deleting `.env` from the repo **after** build fix old images?

<details>
<summary>✅ Check your answer</summary>

`COPY . .` copies **everything** in build context unless excluded.

`.dockerignore` should list at minimum:

```gitignore
.env
.env.*
node_modules
.git
```

Old image layers **still contain** the secret — you must rebuild and rotate credentials. Challenge 1.3 multi-stage builds — copy only what's needed (`package*.json` first for cache, then source).

</details>

---

## Spot Check 11 — prune -a on Shared Runner ⏱️ ~7 min · 🟨 Middle

**Source**: CI pipeline step after deploy:

```bash
docker system prune -a -f
```

Next team's pipeline on the **same** self-hosted runner: all base images gone, 15-minute rebuilds, flaky timeouts.

**Your task**

1. What does `prune -a` remove beyond stopped containers?
2. When is aggressive prune OK vs dangerous?
3. Safer cleanup alternative for CI.

<details>
<summary>✅ Check your answer</summary>

`-a` removes **unused images** (not just dangling layers) — including cached `node:20`, `nginx:1.25`, etc. other jobs rely on.

OK: dedicated ephemeral runners (GitHub-hosted, fresh VM each job). Dangerous: shared bare-metal / long-lived self-hosted agents.

Safer: prune dangling only (`docker image prune -f`), per-job `--rm` containers, scheduled maintenance window, or separate runners per team.

</details>

---

## Spot Check 12 — delete pod Whack-a-Mole ⏱️ ~5 min · 🟩 Junior

**Source**: Pod crash looping. On-call runs:

```bash
kubectl delete pod api-7f8b9c
```

New pod `api-7f8b9d` starts, same crash. On-call: "Kubernetes is haunted."

**Your task**

1. Why does a new pod appear with a different suffix?
2. What object should you inspect/fix instead of only deleting pods?
3. One command to see **why** the container exited.

<details>
<summary>✅ Check your answer</summary>

**Deployment** (or ReplicaSet) owns replicas — delete pod → controller recreates to match desired state.

Inspect: `kubectl describe deployment api` / check image, env, probes, `kubectl logs api-7f8b9d --previous`.

Deleting pods is a **restart**, not a **fix** — change the Deployment spec or underlying config (ConfigMap/Secret).

</details>

---

## Progress

| # | Topic | Level | Done |
|---|-------|-------|------|
| 1 | Quote quest bash/YAML/.env | 🟦 | ⬜ |
| 2 | Image rebuild | 🟦 | ⬜ |
| 3 | EXPOSE vs -p | 🟦 | ⬜ |
| 4 | depends_on | 🟩 | ⬜ |
| 5 | Liveness vs readiness | 🟨 | ⬜ |
| 6 | :latest tag | 🟩 | ⬜ |
| 7 | Secrets in git | 🟩 | ⬜ |
| 8 | terraform apply | 🟨 | ⬜ |
| 9 | HPA resources | 🟨 | ⬜ |
| 10 | .dockerignore / COPY | 🟩 | ⬜ |
| 11 | docker prune -a | 🟨 | ⬜ |
| 12 | delete pod vs Deployment | 🟩 | ⬜ |

Mark ✅ when you can explain each trap cold.

**Pair with**: Level 1–3 challenges · [interview-sprint/02-Docker-K8s-Live.md](interview-sprint/02-Docker-K8s-Live.md)
