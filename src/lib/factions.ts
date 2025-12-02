// Twilight Imperium 4 Factions

export interface Faction {
  id: string;
  name: string;
  shortName: string;
  abilities: string[];
  commodities: number;
  startingTech: string[];
  startingUnits: Record<string, number>;
  homeSystem?: string;
}

export const FACTIONS: Record<string, Faction> = {
  arborec: {
    id: 'arborec',
    name: 'The Arborec',
    shortName: 'Arborec',
    abilities: ['Mitosis', 'Groveholdings'],
    commodities: 3,
    startingTech: ['Magen Defense Grid'],
    startingUnits: {},
  },
  argent: {
    id: 'argent',
    name: 'The Argent Flight',
    shortName: 'Argent',
    abilities: ['Zeal', 'New Byzantium'],
    commodities: 3,
    startingTech: ['Neural Motivator', 'Sarween Tools'],
    startingUnits: {},
  },
  creuss: {
    id: 'creuss',
    name: 'The Ghosts of Creuss',
    shortName: 'Creuss',
    abilities: ['Quantum Entanglement', 'Slave Wormhole Generator'],
    commodities: 4,
    startingTech: ['Gravity Drive'],
    startingUnits: {},
  },
  empyrean: {
    id: 'empyrean',
    name: 'The Empyrean',
    shortName: 'Empyrean',
    abilities: ['Ethereal', 'Obsidian'],
    commodities: 2,
    startingTech: ['Dark Energy Tap'],
    startingUnits: {},
  },
  hacan: {
    id: 'hacan',
    name: 'The Emirates of Hacan',
    shortName: 'Hacan',
    abilities: ['Arbiters', 'Masters of Trade'],
    commodities: 6,
    startingTech: ['Antimass Deflectors', 'Sarween Tools'],
    startingUnits: {},
  },
  'jol-nar': {
    id: 'jol-nar',
    name: 'The Universities of Jol-Nar',
    shortName: 'Jol-Nar',
    abilities: ['Fragile', 'Brilliant', 'Analytical'],
    commodities: 4,
    startingTech: ['Neural Motivator', 'Antimass Deflectors', 'Sarween Tools', 'Plasma Scoring'],
    startingUnits: {},
  },
  keleres: {
    id: 'keleres',
    name: 'The Council Keleres',
    shortName: 'Keleres',
    abilities: ['Council Patronage', 'Galactic Threat'],
    commodities: 2,
    startingTech: ['Antimass Deflectors', 'Plasma Scoring'],
    startingUnits: {},
  },
  l1z1x: {
    id: 'l1z1x',
    name: "The L1Z1X Mindnet",
    shortName: 'L1Z1X',
    abilities: ['Assimilate', 'Harrow'],
    commodities: 2,
    startingTech: ['Neural Motivator', 'Inheritance Systems'],
    startingUnits: {},
  },
  letnev: {
    id: 'letnev',
    name: 'The Barony of Letnev',
    shortName: 'Letnev',
    abilities: ['Munitions Reserves', 'Armada'],
    commodities: 2,
    startingTech: ['Antimass Deflectors', 'Plasma Scoring'],
    startingUnits: {},
  },
  mahact: {
    id: 'mahact',
    name: 'The Mahact Gene-Sorcerers',
    shortName: 'Mahact',
    abilities: ['Edict', 'Imperia'],
    commodities: 3,
    startingTech: ['Bio-Stims'],
    startingUnits: {},
  },
  mentak: {
    id: 'mentak',
    name: 'The Mentak Coalition',
    shortName: 'Mentak',
    abilities: ['Ambush', 'Pillage'],
    commodities: 2,
    startingTech: ['Sarween Tools', 'Plasma Scoring'],
    startingUnits: {},
  },
  muaat: {
    id: 'muaat',
    name: 'The Embers of Muaat',
    shortName: 'Muaat',
    abilities: ['Star Forge', 'Gashlai Physiology'],
    commodities: 4,
    startingTech: ['Plasma Scoring'],
    startingUnits: {},
  },
  naalu: {
    id: 'naalu',
    name: 'The Naalu Collective',
    shortName: 'Naalu',
    abilities: ['Telepathic', 'Foresight'],
    commodities: 3,
    startingTech: ['Neural Motivator', 'Sarween Tools'],
    startingUnits: {},
  },
  'naaz-rokha': {
    id: 'naaz-rokha',
    name: 'The Naaz-Rokha Alliance',
    shortName: 'Naaz-Rokha',
    abilities: ['Fabrication', 'Copartnerships'],
    commodities: 3,
    startingTech: ['Psychoarchaeology', 'AI Development Algorithm'],
    startingUnits: {},
  },
  nekro: {
    id: 'nekro',
    name: 'The Nekro Virus',
    shortName: 'Nekro',
    abilities: ['Galactic Threat', 'Technological Singularity', 'Propagation'],
    commodities: 3,
    startingTech: ['Daxcive Animators'],
    startingUnits: {},
  },
  nomad: {
    id: 'nomad',
    name: 'The Nomad',
    shortName: 'Nomad',
    abilities: ['The Company', 'Future Sight'],
    commodities: 4,
    startingTech: ['Sling Relay'],
    startingUnits: {},
  },
  saar: {
    id: 'saar',
    name: 'The Clan of Saar',
    shortName: 'Saar',
    abilities: ['Scavenge', 'Nomadic'],
    commodities: 3,
    startingTech: ['Antimass Deflectors'],
    startingUnits: {},
  },
  sardakk: {
    id: 'sardakk',
    name: "The Sardakk N'orr",
    shortName: "Sardakk N'orr",
    abilities: ['Unrelenting', 'Hegemonic Trade Policy'],
    commodities: 3,
    startingTech: [],
    startingUnits: {},
  },
  sol: {
    id: 'sol',
    name: 'The Federation of Sol',
    shortName: 'Sol',
    abilities: ['Orbital Drop', 'Versatile', 'Jol-Nar Partnership'],
    commodities: 4,
    startingTech: ['Neural Motivator', 'Antimass Deflectors'],
    startingUnits: {},
  },
  titans: {
    id: 'titans',
    name: 'The Titans of Ul',
    shortName: 'Titans',
    abilities: ['Terragenesis', 'Awaken'],
    commodities: 2,
    startingTech: ['Antimass Deflectors', 'Scanlink Drone Network'],
    startingUnits: {},
  },
  "vuil'raith": {
    id: "vuil'raith",
    name: "The Vuil'raith Cabal",
    shortName: "Vuil'raith",
    abilities: ['Devour', 'Reclaim'],
    commodities: 2,
    startingTech: [],
    startingUnits: {},
  },
  winnu: {
    id: 'winnu',
    name: 'The Winnu',
    shortName: 'Winnu',
    abilities: ['Reclamation', 'Blood Ties'],
    commodities: 3,
    startingTech: [],
    startingUnits: {},
  },
  xxcha: {
    id: 'xxcha',
    name: 'The Xxcha Kingdom',
    shortName: 'Xxcha',
    abilities: ['Peace Accords', 'Quash'],
    commodities: 4,
    startingTech: ['Graviton Laser System'],
    startingUnits: {},
  },
  yin: {
    id: 'yin',
    name: 'The Yin Brotherhood',
    shortName: 'Yin',
    abilities: ['Indoctrination', 'Devotion'],
    commodities: 2,
    startingTech: ['Sarween Tools'],
    startingUnits: {},
  },
  yssaril: {
    id: 'yssaril',
    name: 'The Yssaril Tribes',
    shortName: 'Yssaril',
    abilities: ['Stall Tactics', 'Scheming', 'Crafty'],
    commodities: 3,
    startingTech: ['Neural Motivator'],
    startingUnits: {},
  },
};

export const FACTION_LIST = Object.values(FACTIONS);

export const getFactionById = (id: string): Faction | undefined => {
  return FACTIONS[id];
};

export const getFactionImage = (factionId: string, style: 'color' | 'black' | 'white' = 'color'): string => {
  // Use dynamic import with new URL for Vite
  return new URL(`../assets/factions/${style}/${factionId}.png`, import.meta.url).href;
};
