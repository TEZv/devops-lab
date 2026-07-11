# DevOps Lab

Окремий трек поруч із [DE Lab](https://de-lab-interview-gym.web.app): **Archer** (лучник), той самий ritual **місія → drill → орби**.

## Live Gym

**https://devops-lab-gym.web.app** (після першого deploy)

## Локально

```bash
cd interactive
npx --yes serve -p 8780
```

## Структура

| Шар | Блок |
|-----|------|
| 1 Linux | `01-linux-shell-devops` |
| 2 Git/CI | `02-git-ci-devops` |
| 3 Docker | `03-docker-devops` |
| 4 IaC | `04-terraform-devops` |
| 5–6 | soon (K8s, prod) |

Hands-on: **`CHALLENGES.md`**

## Deploy

```bash
cd interactive
firebase hosting:sites:create devops-lab-gym   # один раз (вже створено)
firebase deploy --only hosting:devops-lab-gym --project earning-app-bytezv
```

## Синхрон з DE Lab

- Спільний engine (`engine.js`, `theory-viz.js`)
- Окремий `localStorage` (прогрес, career tier)
- Перехресні лінки в header обох Gym
