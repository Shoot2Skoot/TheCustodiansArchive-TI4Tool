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
    color: '#ee1b21',
    primary: '⟡ Gain 3 command tokens.\n⟡ Spend any amount of influence to gain 1 command token for every 3 influence spent.',
    secondary: '⟡ Spend any amount of influence to gain 1 command token for every 3 influence spent.',
  },
  {
    id: 2,
    name: 'Diplomacy',
    color: '#f7941d',
    primary: '⟡ Choose 1 system other than the Mecatol Rex system that contains a planet you control; each other player places a command token from his reinforcements in the chosen system. Then, ready each exhausted planet you control in that system.',
    secondary: '⟡ Spend 1 token from your strategy pool to ready up to 2 exhausted planets.',
  },
  {
    id: 3,
    name: 'Politics',
    color: '#fff202',
    primary: '⟡ Choose a player other than the speaker. That player gains the speaker token.\n⟡ Draw 2 action cards.\n⟡ Look at the top 2 cards of the agenda deck. Place each card on the top or bottom of the deck in any order.',
    secondary: '⟡ Spend 1 token from your strategy pool to draw 2 action cards.',
  },
  {
    id: 4,
    name: 'Construction',
    color: '#3bb448',
    primary: '⟡ Place 1 PDS or 1 space dock on a planet you control.\n⟡ Place 1 PDS on a planet you control.',
    secondary: '⟡ Place 1 token from your strategy pool in any system; you may place either 1 space dock or 1 PDS on a planet you control in that system.',
  },
  {
    id: 5,
    name: 'Trade',
    color: '#00aaa0',
    primary: '⟡ Gain 3 trade goods.\n⟡ Replenish commodities.\n⟡ Choose any number of other players. Those players use the secondary ability of this strategy card without spending a command token.',
    secondary: '⟡ Spend 1 token from your strategy pool to replenish commodities.',
  },
  {
    id: 6,
    name: 'Warfare',
    color: '#0688c7',
    primary: '⟡ Remove 1 of your command tokens from the game board; then, gain 1 command token.\n⟡ Redistribute any number of the command tokens on your command sheet.',
    secondary: '⟡ Spend 1 token from your strategy pool to use the PRODUCTION ability of 1 of your space docks in your home system.',
  },
  {
    id: 7,
    name: 'Technology',
    color: '#12459d',
    primary: '⟡ Research 1 technology.\n⟡ Spend 6 resources to research 1 technology.',
    secondary: '⟡ Spend 1 token from your strategy pool and 4 resources to research 1 technology.',
  },
  {
    id: 8,
    name: 'Imperial',
    color: '#762b8f',
    primary: '⟡ Immediately score 1 public objective if you fulfill its requirements.\n⟡ Gain 1 victory point if you control Mecatol Rex; otherwise, draw 1 secret objective.',
    secondary: '⟡ Spend 1 token from your strategy pool to draw 1 secret objective.',
  },
] as const;

export type StrategyCardId = (typeof STRATEGY_CARDS)[number]['id'];
