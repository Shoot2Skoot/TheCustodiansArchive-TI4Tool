// Game Constants

export const PLAYER_COLORS = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'black',
  'orange',
  'pink',
] as const;

export type PlayerColor = (typeof PLAYER_COLORS)[number];

// Map player color names to actual hex values
export const PLAYER_COLOR_MAP: Record<PlayerColor, string> = {
  red: '#e53935',
  blue: '#1e88e5',
  green: '#43a047',
  yellow: '#fdd835',
  purple: '#8e24aa',
  black: '#c0c0c0', // Silver for visibility on dark backgrounds
  orange: '#fb8c00',
  pink: '#ec407a',
};

// Utility function to get player color hex value
export function getPlayerColor(colorName: PlayerColor): string {
  return PLAYER_COLOR_MAP[colorName];
}

export const STRATEGY_CARDS = [
  {
    id: 1,
    name: 'Leadership',
    color: '#ee1b21',
    primary: '🔶 Gain 3 command tokens.\n🔶 Gain 1 command token for every 3 [INFLUENCE] you spend.',
    secondary: '🔶 Gain 1 command token for every 3 [INFLUENCE] you spend.',
  },
  {
    id: 2,
    name: 'Diplomacy',
    color: '#f7941d',
    primary: '🔶 Choose a non–Mecatol Rex system with a planet you control; each other player places a command token there from reinforcements, then ready each exhausted planet you control in that system.',
    secondary: '🔶 Spend 1 strategy token to ready up to 2 exhausted planets.',
  },
  {
    id: 3,
    name: 'Politics',
    color: '#fff202',
    primary: '🔶 Choose a different speaker.\n🔶 Draw 2 action cards.\n🔶 Look at the top 2 agenda cards; place each on the top or bottom of the deck in any order.',
    secondary: '🔶 Spend 1 strategy token to draw 2 action cards.',
  },
  {
    id: 4,
    name: 'Construction',
    color: '#3bb448',
    primary: '🔶 Place 1 PDS or 1 space dock on a planet you control.\n🔶 Place 1 PDS on a planet you control.',
    secondary: '🔶 Place 1 strategy token in any system; you may place 1 space dock or 1 PDS on a planet you control in that system.',
  },
  {
    id: 5,
    name: 'Trade',
    color: '#00aaa0',
    primary: '🔶 Gain 3 [TRADE_GOOD].\n🔶 Replenish commodities.\n🔶 Choose any number of other players. Each may resolve this card\'s secondary without spending a command token.',
    secondary: '🔶 Spend 1 strategy token to replenish commodities.',
  },
  {
    id: 6,
    name: 'Warfare',
    color: '#0688c7',
    primary: '🔶 Remove 1 of your command tokens from the board, then gain 1 command token.\n🔶 Redistribute any number of command tokens on your command sheet.',
    secondary: '🔶 Spend 1 strategy token to use the PRODUCTION ability of 1 space dock in your home system.',
  },
  {
    id: 7,
    name: 'Technology',
    color: '#12459d',
    primary: '🔶 Research 1 technology.\n🔶 Spend 6 [RESOURCES] to research 1 technology.',
    secondary: '🔶 Spend 1 strategy token and 4 [RESOURCES] to research 1 technology.',
  },
  {
    id: 8,
    name: 'Imperial',
    color: '#762b8f',
    primary: '🔶 Immediately score 1 public objective you qualify for.\n🔶 If you control Mecatol Rex, gain 1 victory point; otherwise, draw 1 secret objective.',
    secondary: '🔶 Spend 1 strategy token to draw 1 secret objective.',
  },
] as const;

export type StrategyCardId = (typeof STRATEGY_CARDS)[number]['id'];
