# DevOps Lab · лабораторні спринти

Це основна практична частина [програми](PROGRAM.md). Gym дає короткі drills; тут ти будуєш, ламаєш і відновлюєш системи.

## Правила роботи

- Спочатку evidence, потім change.
- Усі небезпечні дії — лише в disposable local environment із явним scope.
- Завдання vendor-neutral і не відтворюють тести конкретного роботодавця.
- `Core` обов’язковий. `Stretch` — після exit gate.

Evidence bundle для кожного етапу:

```text
work/stage-XX/
├── README.md          # design, assumptions, trade-offs
├── src/               # scripts, manifests, pipeline, IaC
├── tests/             # smoke / policy / integration checks
├── evidence/          # logs, plans, metrics, screenshots
├── runbook.md
└── postmortem.md      # коли є failure drill
```

## Definition of done

- Clean setup відтворюється з README.
- Є автоматична перевірка happy path.
- Failure injection виконаний, recovery доведений.
- Secrets/state не потрапляють у Git.
- Runbook починається з observation і decision points.

---

## Stage 01 · HOST · Evidence-first triage

### Контекст

Локальний HTTP-сервіс періодично повертає `503`, диск росте, а process інколи зникає. “Просто restart” не зараховується.

### Core mission

1. Запусти сервіс під process supervisor або systemd-compatible local environment.
2. Напиши `diagnose.sh`, який збирає:
   - process/listener state;
   - disk/inode/memory snapshot;
   - recent service logs;
   - DNS/TCP/HTTP checks;
   - timestamps і host metadata.
3. Створи runbook із decision tree.

### Failure injection

- port conflict;
- permission denied на config/log path;
- disk pressure або runaway log;
- wrong DNS/host mapping.

### Acceptance

- Script read-only за замовчуванням і safe для rerun.
- Evidence bundle дозволяє визначити root cause після завершення інциденту.
- Restart, cleanup і kill — окремі явні remediation steps.
- Runbook пояснює, коли escalation правильніший за “ще одну команду”.

**Stretch:** додай network namespace або latency/loss simulation.

---

## Stage 02 · DELIVERY · Commit to artifact

### Контекст

Малий сервіс має tests, lint і container build. Потрібен pipeline, де broken change не стає release.

### Core mission

Побудуй flow:

```text
commit → validate → test → scan → build → attest → publish candidate → approve → deploy → smoke → promote
```

### Обов’язкові рішення

- Dependency/cache strategy.
- Immutable version/tag, пов’язаний із commit SHA.
- Secrets лише через CI secret store/environment injection.
- Quality gates і branch/review policy описані незалежно від CI vendor.
- Rollback або roll-forward strategy.

### Failure injection

- flaky test;
- leaked dummy secret;
- image scan violation;
- deploy succeeded, smoke failed.

### Acceptance

- Artifact build-иться один раз і promote-иться без rebuild.
- Failed gate залишає зрозумілий diagnosis.
- Logs не друкують secret values.
- Rollback rehearsal має measured recovery time.

**Stretch:** provenance/SBOM і concurrency control для deploy environment.

---

## Stage 03 · RUNTIME · Container stack under stress

### Контекст

API залежить від database і worker. Потрібен локальний production-like stack без hardcoded secrets.

### Core mission

1. Створи multi-stage, non-root image.
2. Побудуй Compose stack із network, volume, config і health checks.
3. Додай smoke test і inspect script.
4. Порівняй image size/build time до і після оптимізації.

### Failure injection

- database unavailable at startup;
- wrong environment variable;
- read-only filesystem;
- full/slow dependency;
- `SIGTERM` під час request/job.

### Acceptance

- Readiness відрізняється від process-alive.
- Service завершується gracefully.
- Дані переживають container recreation лише там, де це потрібно.
- Image не містить build tools, local credentials або floating runtime assumptions.

**Stretch:** resource limits і lightweight load test.

---

## Stage 04 · PROVISION · Terraform without state panic

### Контекст

Потрібно описати однаковий stack для `dev` і `stage`, не копіюючи resources і не зберігаючи secrets/state у repo.

### Core mission

1. Відокрем reusable module від environment configuration.
2. Додай validation, outputs і naming/tagging policy.
3. Задокументуй remote-state/locking strategy.
4. Додай format/validate/plan checks у CI.
5. Створи policy/check, який блокує небезпечну конфігурацію.

### Failure injection

- manual drift;
- resource rename;
- failed apply;
- lost local state copy;
- destructive plan.

### Acceptance

- Plan review показує scope і destructive actions.
- Recovery використовує import/state operations усвідомлено, не `delete state`.
- Environment isolation перевіряється.
- Sensitive output не з’являється в logs/evidence.

**Stretch:** test module contract і migration між module versions.

---

## Stage 05 · ORCHESTRATE · Broken rollout lab

### Контекст

Контейнерний сервіс переходить у Kubernetes. Потрібні zero-downtime rollout, sensible resources і діагностика broken pods.

### Core mission

Створи manifests або простий chart для:

- Deployment;
- Service;
- ConfigMap/Secret references;
- readiness/liveness/startup probes;
- requests/limits;
- disruption/rollout policy;
- smoke test.

### Failure injection

- wrong image tag;
- selector mismatch;
- bad config;
- readiness failure;
- resource starvation;
- service points to no endpoints.

### Acceptance

- Diagnosis починається з status/events/logs/endpoints, не з випадкових edits.
- Broken rollout автоматично зупиняється або швидко відкатується.
- Config change має передбачуваний rollout behavior.
- Live cluster не редагується як source of truth.

**Stretch:** autoscaling experiment із поясненням метрики й stabilization behavior.

---

## Stage 06 · RELIABILITY · Service ownership

### Контекст

Сервіс працює, але команда отримує шумні alerts і не знає, чи backup відновлюється.

### Core mission

1. Визнач user journey і 2–3 SLI.
2. Запропонуй SLO/error budget із window та rationale.
3. Створи dashboard: traffic, errors, latency, saturation + dependency signal.
4. Перепиши alerts так, щоб кожен мав owner, impact і first action.
5. Проведи incident drill і restore drill.

### Incident scenario

Latency росте, error rate низький, CPU normal, але dependency queue накопичується. Через 20 хвилин deploy погіршує ситуацію.

### Acceptance

- SLI вимірює user-visible reliability, а не “pod is running”.
- Alert page-ить лише actionable/high-impact condition.
- Incident timeline відділяє факти від гіпотез.
- Restore підтверджений читанням/запитом до відновлених даних.
- Postmortem містить systemic follow-ups, не “бути уважнішими”.

**Stretch:** capacity forecast і chaos experiment із stop conditions.

---

## Final integration · One service, full lifecycle

Збери один невеликий сервіс через усі етапи:

```text
source → Git → CI → artifact → container → IaC → Kubernetes → SLO/incident
```

Фінальний пакет має містити architecture diagram, reproducible setup, threat/failure model, release evidence, rollback/restore evidence і 10-хвилинний operational walkthrough.

## Progress board

| Stage | Artifact | Failure drill | Recovery | Exit gate | Score /10 |
|---|---|---|---|---|---:|
| 01 Host | ☐ | ☐ | ☐ | ☐ |  |
| 02 Delivery | ☐ | ☐ | ☐ | ☐ |  |
| 03 Runtime | ☐ | ☐ | ☐ | ☐ |  |
| 04 Provision | ☐ | ☐ | ☐ | ☐ |  |
| 05 Orchestrate | ☐ | ☐ | ☐ | ☐ |  |
| 06 Reliability | ☐ | ☐ | ☐ | ☐ |  |

Оцінювання — за rubric у [PROGRAM.md](PROGRAM.md). Завершений failure drill важливіший за десять правильних multiple-choice відповідей.
