#!/usr/bin/env node
/** Build data/interview-bank.json from devops blocks/*.json + sprint stubs. */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blocksDir = path.join(__dirname, '..', 'blocks');
const outPath = path.join(__dirname, '..', 'data', 'interview-bank.json');

const ARCHETYPE_BY_BLOCK = {
  '01-linux-shell-devops': 'sre',
  '02-git-ci-devops': 'cicd',
  '03-docker-devops': 'startup',
  '04-terraform-devops': 'platform',
  '05-k8s-devops': 'platform',
  '06-prod-devops': 'sre',
};

const ARCHETYPES = [
  { id: 'universal', sigil: 'CORE', color: '#8b9cb3', glyph: '🧭', label: { ua: 'Універсальне', en: 'Universal' } },
  { id: 'platform', sigil: 'IAC', color: '#e8a84b', glyph: '🏗️', label: { ua: 'Platform / IaC', en: 'Platform / IaC' } },
  { id: 'sre', sigil: 'ONCALL', color: '#ff6b6b', glyph: '🛡️', label: { ua: 'SRE / Prod', en: 'SRE / Prod' } },
  { id: 'cicd', sigil: 'PIPE', color: '#5b8def', glyph: '🔀', label: { ua: 'Git / CI', en: 'Git / CI' } },
  { id: 'security', sigil: 'SEC', color: '#4ecdc4', glyph: '🔐', label: { ua: 'Security', en: 'Security' } },
  { id: 'startup', sigil: 'PET', color: '#c77dff', glyph: '🚀', label: { ua: 'Pet / Startup', en: 'Pet / Startup' } },
];

function levelPrompt(level, block) {
  const bits = [];
  if (level.mission?.brief) bits.push(level.mission.brief);
  if (level.instruction) bits.push(level.instruction);
  if (!bits.length) bits.push(level.intro || block.subtitle || '');
  return bits.join(' · ');
}

function inferSkill(blockId) {
  const m = {
    '01-linux-shell-devops': 'linux',
    '02-git-ci-devops': 'git',
    '03-docker-devops': 'docker',
    '04-terraform-devops': 'iac',
    '05-k8s-devops': 'k8s',
    '06-prod-devops': 'prod',
  };
  return m[blockId] || 'linux';
}

function inferDiff(type) {
  if (['theory', 'flip_cards'].includes(type)) return 'easy';
  if (['scenario', 'whats_wrong', 'fill_blanks'].includes(type)) return 'medium';
  return 'medium';
}

function inferMinutes(type) {
  const m = { theory: 8, match_pairs: 12, fill_blanks: 15, scenario: 12, drag_order: 10, whats_wrong: 12, multi_choice: 10 };
  return m[type] || 12;
}

function gymTasks() {
  const tasks = [];
  const files = fs.readdirSync(blocksDir).filter((f) => f.endsWith('.json') && !f.endsWith('.en.json'));
  for (const file of files) {
    const fileId = file.replace(/\.json$/, '');
    const block = JSON.parse(fs.readFileSync(path.join(blocksDir, file), 'utf8'));
    const archetype = ARCHETYPE_BY_BLOCK[fileId] || 'universal';
    for (const level of block.levels || []) {
      tasks.push({
        id: `gym-${fileId}-${level.id}`,
        archetype,
        kind: 'gym',
        blockId: fileId,
        levelId: level.id,
        tag: level.tag || level.id,
        skill: inferSkill(fileId),
        difficulty: inferDiff(level.type),
        minutes: inferMinutes(level.type),
        title: { ua: level.title || block.title, en: level.title || block.title },
        prompt: { ua: levelPrompt(level, block), en: levelPrompt(level, block) },
        source: `blocks/${fileId}.json`,
      });
    }
  }
  return tasks;
}

const GYM = 'https://devops-lab-gym.web.app';
const DE = 'https://de-lab-interview-gym.web.app';
const QUEST = 'https://github.com/TEZv/devops-lab/blob/main/CHALLENGES.md';

const OPS_STUBS = [
  {
    id: 'ops-linux-triage', archetype: 'sre', skill: 'linux', difficulty: 'medium', minutes: 20,
    title: { ua: 'Linux: disk full triage', en: 'Linux: disk full triage' },
    prompt: { ua: 'df -h, du, /var/log — вголос 3 кроки без rm -rf.', en: 'df -h, du, /var/log — 3 steps aloud, no rm -rf.' },
    source: 'interview-sprint/01-Linux-Networking-Sprint-30.md',
    resources: [
      { label: 'Gym · Shell runbook L6', url: `${GYM}/#/block/01-linux-shell-devops/L6` },
      { label: 'DevOps Quest MD', url: QUEST },
    ],
  },
  {
    id: 'ops-dockerfile-review', archetype: 'startup', skill: 'docker', difficulty: 'medium', minutes: 25,
    title: { ua: 'Dockerfile review: non-root + pin tag', en: 'Dockerfile review: non-root + pin tag' },
    prompt: { ua: 'Знайди :latest і USER root. Запропонуй fix.', en: 'Find :latest and USER root. Propose fix.' },
    source: 'interview-sprint/02-Docker-K8s-Live.md',
    resources: [
      { label: 'Gym · Dockerfile D2', url: `${GYM}/#/block/03-docker-devops/D2` },
      { label: 'DevOps Quest MD', url: QUEST },
    ],
  },
  {
    id: 'ops-terraform-plan', archetype: 'platform', skill: 'iac', difficulty: 'medium', minutes: 30,
    title: { ua: 'Terraform: plan vs apply на дошці', en: 'Terraform: plan vs apply on whiteboard' },
    prompt: { ua: 'Намалюй .tf → plan → apply → state. Де drift?', en: 'Draw .tf → plan → apply → state. Where is drift?' },
    source: 'interview-sprint/03-Infrastructure-Case.md',
    resources: [
      { label: 'Gym · Terraform MATCH T1', url: `${GYM}/#/block/04-terraform-devops/T1` },
      { label: 'Bridge · DE orch O2', url: `${DE}/#/block/14-orchestration-de/O2` },
    ],
  },
  {
    id: 'ops-k8s-crashloop', archetype: 'platform', skill: 'k8s', difficulty: 'hard', minutes: 35,
    title: { ua: 'K8s: CrashLoopBackOff triage', en: 'K8s: CrashLoopBackOff triage' },
    prompt: { ua: 'describe + logs + probe. Без delete namespace.', en: 'describe + logs + probe. No delete namespace.' },
    source: 'interview-sprint/02-Docker-K8s-Live.md',
    resources: [
      { label: 'Gym · CrashLoop K5', url: `${GYM}/#/block/05-k8s-devops/K5` },
      { label: 'Gym · Probe trap K3', url: `${GYM}/#/block/05-k8s-devops/K3` },
    ],
  },
  {
    id: 'ops-incident-comms', archetype: 'sre', skill: 'prod', difficulty: 'medium', minutes: 20,
    title: { ua: 'Incident: comms template', en: 'Incident: comms template' },
    prompt: { ua: '3 речення для #incidents: impact, action, ETA.', en: '3 sentences for #incidents: impact, action, ETA.' },
    source: 'CHALLENGES.md',
    resources: [
      { label: 'Gym · Incident R4', url: `${GYM}/#/block/06-prod-devops/R4` },
      { label: 'Bridge · DE gov E6', url: `${DE}/#/block/17-governance-ops-de/E6` },
    ],
  },
  {
    id: 'ops-iam-least-priv', archetype: 'security', skill: 'iac', difficulty: 'medium', minutes: 25,
    title: { ua: 'IAM: Action * Resource * trap', en: 'IAM: Action * Resource * trap' },
    prompt: { ua: 'Перепиши policy на один S3 prefix read-only.', en: 'Rewrite policy to one S3 prefix read-only.' },
    source: 'blocks/04-terraform-devops.json',
    resources: [
      { label: 'Gym · IAM trap T3', url: `${GYM}/#/block/04-terraform-devops/T3` },
      { label: 'Bridge · DE cloud A3', url: `${DE}/#/block/13-cloud-storage-de/A3` },
    ],
  },
].map((s) => ({ ...s, kind: 'stub' }));

const bank = {
  version: 2,
  updated: new Date().toISOString().slice(0, 10),
  ethics: {
    ua: 'Без брендів роботодавців. Архетипи DevOps/SRE + публічні патерни. DE Mage Gym — окремий data-трек.',
    en: 'No employer brands. DevOps/SRE archetypes + public patterns. DE Mage Gym is a separate data track.',
  },
  archetypes: ARCHETYPES,
  tasks: [...gymTasks(), ...OPS_STUBS],
};

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, `${JSON.stringify(bank, null, 2)}\n`);
console.log(`Wrote ${bank.tasks.length} tasks → ${outPath}`);
