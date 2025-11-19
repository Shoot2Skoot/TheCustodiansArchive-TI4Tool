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

export const STRATEGY_CARDS = [
  {
    id: 1,
    name: 'Leadership',
    primary: 'Gain 3 command tokens.',
    secondary: 'Spend 1 influence to gain 1 command token.',
  },
  {
    id: 2,
    name: 'Diplomacy',
    primary:
      'Choose 1 system other than the active system; that system is prevented from being the active system until your next turn.',
    secondary: 'Spend 1 token from your strategy pool to ready up to 2 exhausted planets you control.',
  },
  {
    id: 3,
    name: 'Politics',
    primary: 'Choose a player other than the speaker; that player becomes the speaker. Draw 2 action cards.',
    secondary: 'Spend 1 token from your strategy pool to draw 2 action cards.',
  },
  {
    id: 4,
    name: 'Construction',
    primary:
      'Place 1 PDS or 1 space dock on a planet you control. Place 1 PDS on a planet you control.',
    secondary: 'Spend 1 token from your strategy pool and place or replace 1 structure.',
  },
  {
    id: 5,
    name: 'Trade',
    primary: 'Gain 3 trade goods. Replenish commodities.',
    secondary: 'Spend 1 token from your strategy pool to replenish your commodities.',
  },
  {
    id: 6,
    name: 'Warfare',
    primary:
      'Remove 1 command token from your strategy or fleet pool and return it to your reinforcements. Then, place that command token on a planet you control or in a space area you control that does not contain 1 of your command tokens.',
    secondary: 'Spend 1 token from your strategy pool to use the PRODUCTION ability of 1 unit in any system.',
  },
  {
    id: 7,
    name: 'Technology',
    primary: 'Research 1 technology.',
    secondary: 'Spend 1 token from your strategy pool and 6 resources to research 1 technology.',
  },
  {
    id: 8,
    name: 'Imperial',
    primary:
      'Immediately score 1 public objective; if you cannot, gain 1 victory point instead. Then, draw 1 secret objective.',
    secondary: 'Spend 1 token from your strategy pool to draw 1 secret objective.',
  },
] as const;

export type StrategyCardId = (typeof STRATEGY_CARDS)[number]['id'];
