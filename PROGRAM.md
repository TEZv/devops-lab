# DevOps Lab · програма

Це маршрут за життєвим циклом системи, а не календар і не тренування під одну вакансію.

**Канон:** `PROGRAM.md` визначає порядок, `CHALLENGES.md` містить лабораторні спринти, `interactive/` дає короткі drills і симуляції.

## Як влаштоване навчання

Кожен етап має чотири рухи:

1. **Спостерігати:** зібрати факти, logs, metrics і current state.
2. **Змінити:** зробити малу відтворювану зміну через code/config.
3. **Зламати:** виконати failure injection, rollback і recovery.
4. **Зафіксувати:** залишити verification evidence, runbook і follow-up.

Етап завершено, коли артефакт працює, failure drill відтворюється, а exit gate підтверджений доказами.

---

## 01 · HOST · Керувати хостом

**Навички:** Linux filesystem, shell pipelines, processes, signals, permissions, systemd, DNS/TCP/HTTP, logs, disk/memory triage.

**Gym:** `01-linux-shell-devops`

**Лабораторний спринт:** розгорнути локальний сервіс, зібрати diagnostic bundle, зламати його трьома способами й пройти evidence-first triage.

**Артефакт:** `diagnose.sh` + runbook + incident timeline.

**Exit gate:** причина збою знайдена до рестарту; команда безпечна для повторного запуску; evidence збережено.

## 02 · DELIVERY · Будувати delivery flow

**Навички:** Git history, branch protection concepts, CI stages, test/lint/security gates, artifacts, secrets, versioning, deployment strategies, rollback.

**Gym:** `02-git-ci-devops`

**Лабораторний спринт:** побудувати pipeline від commit до versioned artifact, додати failing gate, release metadata і rollback rehearsal.

**Артефакт:** pipeline config + immutable artifact + release/rollback note.

**Exit gate:** broken change не проходить gate; один commit однозначно відповідає одному artifact; rollback описаний і перевірений.

## 03 · RUNTIME · Пакувати runtime

**Навички:** Docker layers, multi-stage builds, non-root, networks, volumes, health checks, configuration, SBOM/scanning basics, Compose.

**Gym:** `03-docker-devops`

**Лабораторний спринт:** контейнеризувати API + database, оптимізувати image, прибрати secrets, додати health/dependency behavior і провести container failure drill.

**Артефакт:** Dockerfile + Compose stack + validation script + image report.

**Exit gate:** clean build відтворюється; process non-root; config зовні; unhealthy dependency не маскується як healthy app.

## 04 · PROVISION · Описувати інфраструктуру

**Навички:** Terraform state, providers, modules, variables, outputs, environments, drift, import, remote-state strategy, plan review, policy checks.

**Gym:** `04-terraform-devops`

**Лабораторний спринт:** описати ізольований stack, розділити module/environment, змоделювати drift і відновити контроль без видалення state.

**Артефакт:** module + environment config + plan evidence + state/recovery note.

**Exit gate:** plan передбачуваний; secrets і state не в Git; destructive change помітна до apply; recovery не починається з “delete state”.

## 05 · ORCHESTRATE · Оркеструвати workloads

**Навички:** Kubernetes objects, labels/selectors, ConfigMap/Secret, probes, requests/limits, rollout, scheduling, service discovery, troubleshooting.

**Gym:** `05-k8s-devops`

**Лабораторний спринт:** задеплоїти workload, додати probes/resources, виконати broken rollout, network/config failure і rollback.

**Артефакт:** manifests/Helm-lite package + smoke test + rollback runbook.

**Exit gate:** rollout без downtime; broken pod діагностується через events/logs/status; rollback не залежить від ручного редагування live object.

## 06 · RELIABILITY · Експлуатувати сервіс

**Навички:** SLI/SLO, error budget, metrics/logs/traces, alert design, incident command, capacity, backups/restore, security habits, postmortems.

**Gym:** `06-prod-devops` → `#/interview` для змішаних operational scenarios.

**Лабораторний спринт:** визначити SLO, побудувати dashboard/alerts, провести incident drill і перевірити restore.

**Артефакт:** service scorecard + alert policy + incident log + postmortem + restore evidence.

**Exit gate:** alerts actionable; SLO рахується з user-visible signal; restore доведений запуском, не наявністю backup-файлу.

---

## Оцінювання

Кожен спринт оцінюється за п’ятьма осями, по `0–2` бали:

| Вісь | 0 | 1 | 2 |
|---|---|---|---|
| Correctness | не запускається | happy path | negative path перевірений |
| Safety | небезпечні ручні дії | часткові guards | least privilege + rollback |
| Reliability | restart як стратегія | recovery описаний | failure drill пройдений |
| Observability | немає evidence | logs | metrics + actionable signal |
| Communication | список команд | runbook | trade-offs + postmortem |

`8/10` і відсутність нуля в будь-якій осі — рекомендований gate для переходу.

## Що є архівом

`CAREER-LEVELS.md`, старі interview sprints і зовнішні ресурси — довідковий шар. Вони не є альтернативним треком.

## Контентні правила

- Жодних назв роботодавців, leaked tests або прив’язки до конкретної вакансії.
- Vendor/tool вказується лише як реалізація принципу; завдання формулюється через системну проблему.
- Кожен блок містить build task, failure injection, recovery та evidence of completion.
- Multiple choice і drag/match — розминка, не головна лабораторна робота.
- Небезпечні команди виконуються тільки в disposable local environment з явним scope.
