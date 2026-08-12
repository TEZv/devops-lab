# DevOps Lab · Interactive Gym

Короткі drills і operational scenarios для програми [DevOps Lab](../PROGRAM.md).

Home показує один маршрут із шести lifecycle stages. Кожна stage містить summary, artifact, exit gate та перехід до блоку. Career picker і зовнішні ресурси живуть у нижньому довідковому розділі.

## Місце Gym у навчанні

```text
PROGRAM.md → короткий Gym drill → CHALLENGES build task → failure injection → recovery → exit gate
```

Gym не замінює лабораторні спринти. Drag/match і multiple choice — розминка, а не доказ operational readiness.

## Local run

```bash
cd interactive
python -m http.server 8780
# http://127.0.0.1:8780/
```

## Content audit

```bash
node tooling/audit-curriculum.mjs
```

Audit перевіряє JSON, унікальність IDs, UA/EN parity, applied tasks і employer fingerprints.

## Content policy

- Observe before change.
- Every block includes failure/recovery thinking.
- No employer names, leaked tests or vacancy-specific wording.
- Dangerous actions stay inside disposable local scope.

Live: https://devops-lab-gym.web.app
