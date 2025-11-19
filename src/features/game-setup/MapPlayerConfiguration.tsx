import { useState } from 'react';
import { Button, Modal } from '@/components/common';
import { FACTION_LIST, getFactionImage } from '@/lib/factions';
import { PLAYER_COLORS } from '@/lib/constants';
import type { PlayerColor } from '@/types/enums';
import styles from './MapPlayerConfiguration.module.css';

interface PlayerSetup {
  position: number;
  color: PlayerColor | null;
  factionId: string | null;
  displayName: string;
}

interface MapPlayerConfigurationProps {
  playerCount: number;
  players: PlayerSetup[];
  onComplete: (players: PlayerSetup[]) => void;
  onBack: () => void;
}

// Define player positions for each player count (x, y as percentages relative to the map)
// These will be scaled to account for the 75% map size
const MAP_SCALE = 0.75;
const MAP_OFFSET = (100 - MAP_SCALE * 100) / 2;

const scalePosition = (pos: number) => MAP_OFFSET + (pos * MAP_SCALE);

const PLAYER_POSITIONS_RAW: Record<number, { x: number; y: number }[]> = {
  3: [
    { x: 50, y: 99 },   // Bottom
    { x: 90, y: 23 },   // Top right
    { x: 10, y: 23 },   // Top left
  ],
  4: [
    { x: 34, y: 9 },   // Top
    { x: 93, y: 44 },   // Right
    { x: 67, y: 91 },   // Bottom
    { x: 7, y: 56 },   // Left
  ],
  5: [
    { x: 32, y: 6 },    // Top
    { x: 92, y: 25 },   // Top right
    { x: 92, y: 74 },   // Bottom right
    { x: 50, y: 99 },   // Bottom left
    { x: 7, y: 56 },    // Top left
  ],
  6: [
    { x: 50, y: 1 },    // Top
    { x: 91, y: 26 },   // Top right
    { x: 91, y: 74 },   // Bottom right
    { x: 50, y: 99 },   // Bottom
    { x: 10, y: 74 },   // Bottom left
    { x: 9, y: 26 },   // Top left
  ],
  7: [
    { x: 64, y: 0 },    // Top
    { x: 99, y: 22 },   // Top right
    { x: 99, y: 78 },   // Right
    { x: 64, y: 100 },   // Bottom right
    { x: 13, y: 91 },   // Bottom left
    { x: 0, y: 50 },   // Left
    { x: 13, y: 9 },   // Top left
  ],
  8: [
    { x: 50, y: 0 },    // Top
    { x: 87, y: 11 },   // Top right
    { x: 100, y: 50 },   // Right
    { x: 87, y: 89 },   // Bottom right
    { x: 50, y: 100 },   // Bottom
    { x: 13, y: 89 },   // Bottom left
    { x: 0, y: 50 },   // Left
    { x: 13, y: 11 },   // Top left
  ],
};

// Scale all positions to account for the 75% map size
const PLAYER_POSITIONS: Record<number, { x: number; y: number }[]> = Object.fromEntries(
  Object.entries(PLAYER_POSITIONS_RAW).map(([count, positions]) => [
    count,
    positions.map(pos => ({
      x: scalePosition(pos.x),
      y: scalePosition(pos.y),
    })),
  ])
) as Record<number, { x: number; y: number }[]>;

export function MapPlayerConfiguration({
  playerCount,
  players: initialPlayers,
  onComplete,
  onBack
}: MapPlayerConfigurationProps) {
  const [players, setPlayers] = useState<PlayerSetup[]>(initialPlayers);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState<number | null>(null);

  const usedColors = new Set(players.filter(p => p.color).map(p => p.color));
  const usedFactions = new Set(players.filter(p => p.factionId).map(p => p.factionId));

  const handlePlayerClick = (position: number) => {
    setSelectedPlayer(position);
    setShowConfigModal(true);
  };

  const handlePlayerUpdate = (position: number, updates: Partial<PlayerSetup>) => {
    setPlayers(players.map(p =>
      p.position === position ? { ...p, ...updates } : p
    ));
  };

  const handleConfigComplete = () => {
    setShowConfigModal(false);
    setSelectedPlayer(null);
  };

  const handleRandomizeAll = () => {
    const availableColors = [...PLAYER_COLORS];
    const shuffledColors = availableColors.sort(() => Math.random() - 0.5);

    const availableFactions = [...FACTION_LIST];
    const shuffledFactions = availableFactions.sort(() => Math.random() - 0.5);

    setPlayers(players.map((p, index) => ({
      ...p,
      color: shuffledColors[index] || null,
      factionId: shuffledFactions[index]?.id || null,
    })));
  };

  const isComplete = players.every(p => p.color && p.factionId);

  const handleContinue = () => {
    if (isComplete) {
      onComplete(players);
    }
  };

  const positions = PLAYER_POSITIONS[playerCount] || [];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Configure Players</h2>
        <p className={styles.description}>
          Click each player to assign colors and factions
        </p>
        <Button
          variant="primary"
          size="small"
          onClick={handleRandomizeAll}
        >
          ✨ Randomize Everything
        </Button>
      </div>

      <div className={styles.mapContainer}>
        <div className={styles.mapBackground}>
          <img
            src={`/src/assets/galaxy-maps/${playerCount}p.png`}
            alt={`${playerCount} player map`}
            className={styles.mapImage}
          />
        </div>

        {/* Player rings positioned around the map */}
        {players.map((player, index) => {
          const position = positions[index];
          if (!position) return null;

          return (
            <PlayerRing
              key={player.position}
              player={player}
              x={position.x}
              y={position.y}
              onClick={() => handlePlayerClick(player.position)}
            />
          );
        })}
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={handleContinue}
          disabled={!isComplete}
        >
          Continue to Game Options
        </Button>
      </div>

      {/* Player Configuration Modal */}
      <Modal
        isOpen={showConfigModal}
        onClose={() => {
          setShowConfigModal(false);
          setSelectedPlayer(null);
        }}
        title={`Configure Player ${selectedPlayer}`}
        size="large"
      >
        {selectedPlayer !== null && (
          <PlayerConfigModal
            player={players.find(p => p.position === selectedPlayer)!}
            usedColors={usedColors}
            usedFactions={usedFactions}
            onUpdate={(updates) => handlePlayerUpdate(selectedPlayer, updates)}
            onComplete={handleConfigComplete}
          />
        )}
      </Modal>
    </div>
  );
}

interface PlayerRingProps {
  player: PlayerSetup;
  x: number;
  y: number;
  onClick: () => void;
}

function PlayerRing({ player, x, y, onClick }: PlayerRingProps) {
  const selectedFaction = player.factionId ? FACTION_LIST.find(f => f.id === player.factionId) : null;
  const hasColor = player.color !== null;
  const hasFaction = player.factionId !== null;

  return (
    <button
      className={styles.playerRing}
      style={{
        left: `${x}%`,
        top: `${y}%`,
        borderWidth: hasColor ? '8px' : '0',
        borderStyle: 'solid',
        borderColor: hasColor ? `var(--color-player-${player.color})` : 'transparent',
      }}
      onClick={onClick}
    >
      {hasFaction && selectedFaction ? (
        <img
          src={getFactionImage(selectedFaction.id, 'color')}
          alt={selectedFaction.name}
          className={styles.factionIcon}
        />
      ) : (
        <span className={styles.questionMark}>?</span>
      )}
      <span className={styles.playerBadge}>
        {player.displayName}
      </span>

      {/* Hover Tooltip */}
      <div
        className={styles.playerTooltip}
        style={{
          borderColor: hasColor ? `var(--color-player-${player.color})` : 'var(--color-border)',
        }}
      >
        {hasFaction && selectedFaction ? (
          <div className={styles.tooltipFaction}>{selectedFaction.name}</div>
        ) : (
          <div className={styles.tooltipFaction}>No faction selected</div>
        )}
        <div className={styles.tooltipPlayer}>{player.displayName}</div>
      </div>
    </button>
  );
}

interface PlayerConfigModalProps {
  player: PlayerSetup;
  usedColors: Set<PlayerColor | null>;
  usedFactions: Set<string | null>;
  onUpdate: (updates: Partial<PlayerSetup>) => void;
  onComplete: () => void;
}

function PlayerConfigModal({
  player,
  usedColors,
  usedFactions,
  onUpdate,
  onComplete
}: PlayerConfigModalProps) {
  const [search, setSearch] = useState('');
  const [localName, setLocalName] = useState(player.displayName);

  const filteredFactions = FACTION_LIST.filter(faction =>
    faction.name.toLowerCase().includes(search.toLowerCase()) ||
    faction.shortName.toLowerCase().includes(search.toLowerCase())
  );

  const handleNameChange = (name: string) => {
    setLocalName(name);
    onUpdate({ displayName: name });
  };

  const handleColorSelect = (color: PlayerColor) => {
    onUpdate({ color });
  };

  const handleFactionSelect = (factionId: string) => {
    onUpdate({ factionId });
  };

  const isComplete = player.color && player.factionId && player.displayName.trim();

  return (
    <div className={styles.playerConfigModal}>
      {/* Name Input */}
      <div className={styles.nameSection}>
        <label className={styles.sectionLabel}>Player Name</label>
        <input
          type="text"
          value={localName}
          onChange={(e) => handleNameChange(e.target.value)}
          className={styles.nameInput}
          placeholder="Enter player name"
          autoFocus
        />
      </div>

      {/* Color Selection */}
      <div className={styles.colorSection}>
        <label className={styles.sectionLabel}>Color</label>
        <div className={styles.colorGrid}>
          {PLAYER_COLORS.map((color) => {
            const isUsed = usedColors.has(color) && player.color !== color;
            const isSelected = player.color === color;
            return (
              <button
                key={color}
                className={`${styles.colorButton} ${isSelected ? styles.selected : ''}`}
                style={{
                  backgroundColor: `var(--color-player-${color})`,
                  opacity: isUsed ? 0.3 : 1,
                }}
                onClick={() => !isUsed && handleColorSelect(color)}
                disabled={isUsed}
                title={color}
              />
            );
          })}
        </div>
      </div>

      {/* Faction Selection */}
      <div className={styles.factionSection}>
        <label className={styles.sectionLabel}>Faction</label>
        <input
          type="text"
          placeholder="Search factions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className={styles.searchInput}
        />

        <div className={styles.factionGrid}>
          {filteredFactions.map((faction) => {
            const isUsed = usedFactions.has(faction.id);
            const isSelected = player.factionId === faction.id;
            return (
              <button
                key={faction.id}
                className={`${styles.factionCard} ${isUsed ? styles.disabled : ''} ${isSelected ? styles.selectedFaction : ''}`}
                onClick={() => !isUsed && handleFactionSelect(faction.id)}
                disabled={isUsed}
              >
                <img
                  src={getFactionImage(faction.id)}
                  alt={faction.name}
                  className={styles.factionCardImage}
                />
                <div className={styles.factionCardName}>{faction.name}</div>
                {isUsed && <div className={styles.usedBadge}>In Use</div>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Done Button */}
      <div className={styles.modalActions}>
        <Button
          variant="primary"
          size="large"
          onClick={onComplete}
          disabled={!isComplete}
        >
          Done
        </Button>
      </div>
    </div>
  );
}
