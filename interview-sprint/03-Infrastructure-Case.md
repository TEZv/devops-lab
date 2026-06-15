# Infrastructure Case — Interview Templates

## How to answer (5 steps)

1. **Clarify requirements** — traffic, SLA, budget, team size
2. **Draw components** — users, LB, app, DB, cache, CI
3. **State trade-offs** — managed vs self-hosted, cost, ops burden
4. **Failure modes** — what breaks first?
5. **Observability** — logs, metrics, alerts

---

## Case 1 — Deploy a web app 🟩

**Prompt:** "Ship a static site + API. Team of 3. Low traffic."

**Expected:** Docker → compose or single VM → GitHub Actions → optional CDN.

**Follow-up:** when do you add Kubernetes?

---

## Case 2 — Scale to 10k RPS 🟨

**Prompt:** "Traffic spiked. Monolith on one server dying."

**Expected:** LB, horizontal pods, DB connection pool, cache, autoscaling.

---

## Case 3 — CI/CD design 🟨

**Prompt:** "No tests in prod deploys. How do you fix culture + tech?"

**Expected:** branch protection, required checks, staging env, manual approval for prod (lab 4.2).

---

## Case 4 — Terraform at scale 🟨→🟥

**Prompt:** "50 microservices, one state file — problems?"

**Expected:** state per service/team, modules, remote backend, drift detection.

---

## Case 5 — Incident 🟥

**Prompt:** "Production down 20 min. Walk me through your first 5 minutes."

**Expected:** assess blast radius, rollback vs fix forward, comms, postmortem — not random `kubectl delete`.

---

## Practice (60 min)

1. Pick Case 2 or 4
2. 15 min — diagram
3. 15 min — list 3 failure modes
4. 15 min — monitoring you'd add
5. 15 min — record explanation

## Checklist

- [ ] Can sketch CI/CD from git push to prod
- [ ] Explain when **not** to use Kubernetes
- [ ] Know SLI/SLO/SLA at high level (see `05-Senior-SRE`)
