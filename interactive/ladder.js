/**
 * DevOps Lab: CareerTier × SkillLayer × Archer
 * Sync contract with de-lab ladder.js (shared tier names).
 */
(function (global) {
  const CAREER_KEY = 'devops-lab-career-tier';

  const CAREER_TIERS = [
    {
      id: 'intern',
      order: 0,
      deLabel: 'Intern / Apprentice',
      devopsLabel: 'Intern / Apprentice',
      recommendLayers: [1, 2],
      blurbUa: 'Shell + Git basics. Фокус: linux + один CI сценарій.',
      blurbEn: 'Shell + Git basics. Focus: linux + one CI scenario.',
    },
    {
      id: 'junior',
      order: 1,
      deLabel: 'Junior',
      devopsLabel: 'Junior',
      recommendLayers: [1, 2, 3],
      blurbUa: 'Dockerfile, compose, простий pipeline. Фокус: layers 1–3.',
      blurbEn: 'Dockerfile, compose, simple pipeline. Focus: layers 1–3.',
    },
    {
      id: 'middle',
      order: 2,
      deLabel: 'Middle',
      devopsLabel: 'Middle',
      recommendLayers: [1, 2, 3, 4],
      accentLayers: [3, 4],
      blurbUa: 'Terraform trade-offs, IAM, cost. Фокус: docker + IaC.',
      blurbEn: 'Terraform trade-offs, IAM, cost. Focus: docker + IaC.',
    },
    {
      id: 'senior',
      order: 3,
      deLabel: 'Senior',
      devopsLabel: 'Senior',
      recommendLayers: [1, 2, 3, 4, 5, 6],
      accentLayers: [4, 5, 6],
      blurbUa: 'K8s-lite, prod incidents, observability.',
      blurbEn: 'K8s-lite, prod incidents, observability.',
    },
    {
      id: 'lead',
      order: 4,
      deLabel: 'Team Lead',
      devopsLabel: 'Team Lead',
      recommendLayers: [1, 2, 3, 4, 5, 6],
      metaFirst: true,
      blurbUa: 'Менторить runbooks, hiring bar, platform roadmap.',
      blurbEn: 'Mentors runbooks, hiring bar, platform roadmap.',
    },
    {
      id: 'head',
      order: 5,
      deLabel: 'Head of Data',
      devopsLabel: 'Head of Platform',
      recommendLayers: [1, 2, 3, 4, 5, 6],
      metaFirst: true,
      blurbUa: 'Стратегія платформи, SRE/DevOps баланс, roadmap лаби.',
      blurbEn: 'Platform strategy, SRE/DevOps balance, lab roadmap.',
    },
  ];

  const DEVOPS_SKILL_LAYERS = [
    {
      n: 1,
      id: 'linux',
      icon: '🐧',
      titleUa: 'Linux & shell',
      titleEn: 'Linux & shell',
      skill: 'linux',
      mode: 'practice',
      blocks: ['01-linux-shell-devops'],
    },
    {
      n: 2,
      id: 'git-ci',
      icon: '🔀',
      titleUa: 'Git / CI',
      titleEn: 'Git / CI',
      skill: 'git',
      mode: 'both',
      blocks: ['02-git-ci-devops'],
    },
    {
      n: 3,
      id: 'docker',
      icon: '🐳',
      titleUa: 'Docker',
      titleEn: 'Docker',
      skill: 'docker',
      mode: 'practice',
      blocks: ['03-docker-devops'],
    },
    {
      n: 4,
      id: 'iac',
      icon: '🏗️',
      titleUa: 'IaC · Terraform',
      titleEn: 'IaC · Terraform',
      skill: 'iac',
      mode: 'both',
      blocks: ['04-terraform-devops'],
    },
    {
      n: 5,
      id: 'k8s',
      icon: '☸️',
      titleUa: 'K8s-lite',
      titleEn: 'K8s-lite',
      skill: 'k8s',
      mode: 'practice',
      blocks: [],
      soon: true,
    },
    {
      n: 6,
      id: 'prod',
      icon: '🛡️',
      titleUa: 'Production habits',
      titleEn: 'Production habits',
      skill: 'prod',
      mode: 'both',
      blocks: [],
      soon: true,
    },
  ];

  const HERO_THEMES = {
    archer: { id: 'archer', lab: 'devops-lab', label: 'DevOps Archer', weapon: 'bow' },
    mage: { id: 'mage', lab: 'de-lab', label: 'DE Mage', weapon: 'staff' },
  };

  function getCareerTier(lab) {
    return CAREER_TIERS.map((c) => ({
      ...c,
      label: lab === 'devops' ? c.devopsLabel : c.deLabel,
    }));
  }

  function loadCareerTier() {
    try {
      const id = localStorage.getItem(CAREER_KEY) || 'intern';
      return CAREER_TIERS.find((c) => c.id === id) || CAREER_TIERS[0];
    } catch {
      return CAREER_TIERS[0];
    }
  }

  function saveCareerTier(id) {
    const tier = CAREER_TIERS.find((c) => c.id === id) || CAREER_TIERS[0];
    try { localStorage.setItem(CAREER_KEY, tier.id); } catch { /* */ }
    return tier;
  }

  function isLayerRecommended(layerN, tier) {
    const t = tier || loadCareerTier();
    return (t.recommendLayers || []).includes(layerN);
  }

  function isLayerAccent(layerN, tier) {
    const t = tier || loadCareerTier();
    return (t.accentLayers || []).includes(layerN);
  }

  global.LabLadder = {
    CAREER_KEY,
    CAREER_TIERS,
    DEVOPS_SKILL_LAYERS,
    HERO_THEMES,
    getCareerTier,
    loadCareerTier,
    saveCareerTier,
    isLayerRecommended,
    isLayerAccent,
  };
})(window);
