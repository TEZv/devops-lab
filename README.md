# DevOps Lab

Практичне середовище для проходження повного lifecycle сервісу — від Linux process до reliability та incident recovery.

Це не збірка задач під конкретну вакансію. Навчання організоване як capabilities:

```text
Host → Delivery → Runtime → Provision → Orchestrate → Reliability
```

## З чого почати

1. Відкрий **[PROGRAM.md](PROGRAM.md)** — єдиний канон порядку навчання.
2. Виконай sprint поточного етапу в **[CHALLENGES.md](CHALLENGES.md)**.
3. Використовуй **[interactive](interactive/README.md)** для коротких drills перед build/failure tasks.
4. Переходь далі після artifact + failure injection + recovery + exit gate.

## Learning surfaces

| Surface | Для чого |
|---|---|
| [PROGRAM.md](PROGRAM.md) | маршрут за lifecycle, artifacts і gates |
| [CHALLENGES.md](CHALLENGES.md) | основні лабораторні спринти |
| [interactive/](interactive/README.md) | drills, operational scenarios, progress |
| [docker/](docker/README.md) | container runtime workspace |
| [terraform/](terraform/README.md) | IaC workspace |
| [k8s/](k8s/README.md) | Kubernetes workspace |
| [ci-cd/](ci-cd/README.md) | delivery pipeline workspace |

`CAREER-LEVELS.md`, `SPOT-CHECK.md` та `interview-sprint/` — довідковий архів, не друга програма.

## Local Gym

```bash
cd interactive
python -m http.server 8780
# http://127.0.0.1:8780/
```

Live Gym: https://devops-lab-gym.web.app

## Content standard

- observe → change → break → recover → document;
- небезпечні дії лише в disposable local scope;
- vendor-neutral problem framing;
- жодних leaked employer tests або employer fingerprints;
- multiple choice/drag/match — лише розминка;
- фінал етапу — working artifact, failure drill і evidence.

## Related lab

[Data Engineering Lab](https://github.com/TEZv/de-lab) покриває SQL, Python, modeling, pipelines і data operations.

## License

MIT.
