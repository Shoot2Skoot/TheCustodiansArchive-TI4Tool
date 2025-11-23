// Twilight Imperium 4th Edition Public Objectives

export type ObjectiveStage = 1 | 2;
export type ObjectiveExpansion = 'base' | 'pok';

export interface PublicObjective {
  id: string;
  name: string;
  condition: string;
  points: number;
  stage: ObjectiveStage;
  expansion: ObjectiveExpansion;
}

// Stage I Objectives - Base Game
export const STAGE_1_BASE_OBJECTIVES: PublicObjective[] = [
  {
    id: 'corner-the-market',
    name: 'Corner the Market',
    condition: 'Control 4 planets that each have the same planet trait.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'develop-weaponry',
    name: 'Develop Weaponry',
    condition: 'Own 2 unit upgrade technologies.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'diversify-research',
    name: 'Diversify Research',
    condition: 'Own 2 technologies in each of 2 colors.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'erect-a-monument',
    name: 'Erect a Monument',
    condition: 'Spend 8 resources.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'expand-borders',
    name: 'Expand Borders',
    condition: 'Control 6 planets in non-home systems.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'found-research-outposts',
    name: 'Found Research Outposts',
    condition: 'Control 3 planets that have technology specialties.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'intimidate-council',
    name: 'Intimidate Council',
    condition: "Have 1 or more ships in 2 systems that are adjacent to Mecatol Rex's System.",
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'lead-from-the-front',
    name: 'Lead from the Front',
    condition: 'Spend a total of 3 tokens from your tactic and/or strategy pools.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'negotiate-trade-routes',
    name: 'Negotiate Trade Routes',
    condition: 'Spend 5 trade goods.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
  {
    id: 'sway-the-council',
    name: 'Sway the Council',
    condition: 'Spend 8 influence.',
    points: 1,
    stage: 1,
    expansion: 'base',
  },
];

// Stage I Objectives - Prophecy of Kings Expansion
export const STAGE_1_POK_OBJECTIVES: PublicObjective[] = [
  {
    id: 'amass-wealth',
    name: 'Amass Wealth',
    condition: 'Spend 3 influence, 3 resources, and 3 trade goods.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'build-defenses',
    name: 'Build Defenses',
    condition: 'Have 4 or more structures.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'discover-lost-outposts',
    name: 'Discover Lost Outposts',
    condition: 'Control 2 planets that have attachments.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'engineer-a-marvel',
    name: 'Engineer a Marvel',
    condition: 'Have your flagship or a war sun on the game board.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'explore-deep-space',
    name: 'Explore Deep Space',
    condition: 'Have units in 3 systems that do not contain planets.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'improve-infrastructure',
    name: 'Improve Infrastructure',
    condition: 'Have structures on 3 planets outside of your home system.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'make-history',
    name: 'Make History',
    condition: 'Have units in 2 systems that contain legendary planets, Mecatol Rex, or anomalies.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'populate-the-outer-rim',
    name: 'Populate the Outer Rim',
    condition: 'Have units in 3 systems on the edge of the game board other than your home system.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'push-boundaries',
    name: 'Push Boundaries',
    condition: 'Control more planets than each of 2 of your neighbors.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
  {
    id: 'raise-a-fleet',
    name: 'Raise a Fleet',
    condition: 'Have 5 or more non-fighter ships in 1 system.',
    points: 1,
    stage: 1,
    expansion: 'pok',
  },
];

// Stage II Objectives - Base Game
export const STAGE_2_BASE_OBJECTIVES: PublicObjective[] = [
  {
    id: 'centralize-galactic-trade',
    name: 'Centralize Galactic Trade',
    condition: 'Spend 10 trade goods.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'conquer-the-weak',
    name: 'Conquer the Weak',
    condition: "Control 1 planet that is in another player's home system.",
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'form-galactic-brain-trust',
    name: 'Form Galactic Brain Trust',
    condition: 'Control 5 planets that have technology specialties.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'found-a-golden-age',
    name: 'Found a Golden Age',
    condition: 'Spend 16 resources.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'galvanize-the-people',
    name: 'Galvanize the People',
    condition: 'Spend a total of 6 tokens from your tactic and/or strategy pools.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'manipulate-galactic-law',
    name: 'Manipulate Galactic Law',
    condition: 'Spend 16 influence.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'master-the-sciences',
    name: 'Master the Sciences',
    condition: 'Own 2 technologies in each of 4 colors.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'revolutionize-warfare',
    name: 'Revolutionize Warfare',
    condition: 'Own 3 unit upgrade technologies.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'subdue-the-galaxy',
    name: 'Subdue the Galaxy',
    condition: 'Control 11 planets in non-home systems.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
  {
    id: 'unify-the-colonies',
    name: 'Unify the Colonies',
    condition: 'Control 6 planets that each have the same planet trait.',
    points: 2,
    stage: 2,
    expansion: 'base',
  },
];

// Stage II Objectives - Prophecy of Kings Expansion
export const STAGE_2_POK_OBJECTIVES: PublicObjective[] = [
  {
    id: 'achieve-supremacy',
    name: 'Achieve Supremacy',
    condition: "Have your flagship or a war sun in another player's home system or the Mecatol Rex system.",
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'become-a-legend',
    name: 'Become a Legend',
    condition: 'Have units in 4 systems that contain legendary planets, Mecatol Rex, or anomalies.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'command-an-armada',
    name: 'Command an Armada',
    condition: 'Have 8 or more non-fighter ships in 1 system.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'construct-massive-cities',
    name: 'Construct Massive Cities',
    condition: 'Have 7 or more structures.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'control-the-borderlands',
    name: 'Control the Borderlands',
    condition: 'Have units in 5 systems on the edge of the game board other than your home system.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'hold-vast-reserves',
    name: 'Hold Vast Reserves',
    condition: 'Spend 6 influence, 6 resources, and 6 trade goods.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'patrol-vast-territories',
    name: 'Patrol Vast Territories',
    condition: 'Have units in 5 systems that do not contain planets.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'protect-the-border',
    name: 'Protect the Border',
    condition: 'Have structures on 5 planets outside of your home system.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'reclaim-ancient-monuments',
    name: 'Reclaim Ancient Monuments',
    condition: 'Control 3 planets that have attachments.',
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
  {
    id: 'rule-distant-lands',
    name: 'Rule Distant Lands',
    condition: "Control 2 planets that are each in or adjacent to a different, other player's home system.",
    points: 2,
    stage: 2,
    expansion: 'pok',
  },
];

// Combined Stage I objectives (for selection during setup)
export const ALL_STAGE_1_OBJECTIVES = [
  ...STAGE_1_BASE_OBJECTIVES,
  ...STAGE_1_POK_OBJECTIVES,
];

// Combined Stage II objectives
export const ALL_STAGE_2_OBJECTIVES = [
  ...STAGE_2_BASE_OBJECTIVES,
  ...STAGE_2_POK_OBJECTIVES,
];

// Helper function to get objective by ID
export function getObjectiveById(id: string): PublicObjective | undefined {
  return [...ALL_STAGE_1_OBJECTIVES, ...ALL_STAGE_2_OBJECTIVES].find(
    (obj) => obj.id === id
  );
}

// Helper function to get objectives by stage
export function getObjectivesByStage(stage: ObjectiveStage): PublicObjective[] {
  return stage === 1 ? ALL_STAGE_1_OBJECTIVES : ALL_STAGE_2_OBJECTIVES;
}

// Helper function to get objective image path
export function getObjectiveImage(stage: ObjectiveStage): string {
  return stage === 1
    ? '/src/assets/icons/color/public-1.png'
    : '/src/assets/icons/color/public-2.png';
}
