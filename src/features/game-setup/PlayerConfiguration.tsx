import { useState } from 'react';
import { Button, Modal } from '@/components/common';
import { FACTION_LIST, getFactionImage } from '@/lib/factions';
import { PLAYER_COLORS } from '@/lib/constants';
import type { PlayerColor } from '@/types/enums';
import styles from './PlayerConfiguration.module.css';

interface PlayerSetup {
  position: number;
  color: PlayerColor | null;
  factionId: string | null;
  displayName: string;
}

interface PlayerConfigurationProps {
  playerCount: number;
  players: PlayerSetup[];
  onComplete: (players: PlayerSetup[]) => void;
  onBack: () => void;
}

export function PlayerConfiguration({ players: initialPlayers, onComplete, onBack }: PlayerConfigurationProps) {
  const [players, setPlayers] = useState<PlayerSetup[]>(initialPlayers);
  const [showFactionModal, setShowFactionModal] = useState(false);
  const [selectedFactionForPlayer, setSelectedFactionForPlayer] = useState<number | null>(null);

  const usedColors = new Set(players.filter(p => p.color).map(p => p.color));
  const usedFactions = new Set(players.filter(p => p.factionId).map(p => p.factionId));

  const handleColorSelect = (position: number, color: PlayerColor) => {
    setPlayers(players.map(p =>
      p.position === position ? { ...p, color } : p
    ));
  };

  const handleOpenFactionModal = (position: number) => {
    setSelectedFactionForPlayer(position);
    setShowFactionModal(true);
  };

  const handleFactionSelect = (factionId: string) => {
    if (selectedFactionForPlayer !== null) {
      setPlayers(players.map(p =>
        p.position === selectedFactionForPlayer ? { ...p, factionId } : p
      ));
    }
    setShowFactionModal(false);
    setSelectedFactionForPlayer(null);
  };

  const handleRandomFaction = (position: number) => {
    const availableFactions = FACTION_LIST.filter(f => !usedFactions.has(f.id));
    if (availableFactions.length === 0) return;

    const randomIndex = Math.floor(Math.random() * availableFactions.length);
    const randomFaction = availableFactions[randomIndex];
    if (!randomFaction) return;

    setPlayers(players.map(p =>
      p.position === position ? { ...p, factionId: randomFaction.id } : p
    ));
  };

  const handleRandomAllFactions = () => {
    const availableFactions = [...FACTION_LIST];
    const shuffled = availableFactions.sort(() => Math.random() - 0.5);

    setPlayers(players.map((p, index) => ({
      ...p,
      factionId: shuffled[index]?.id || null,
    })));
  };

  const handleRandomAllColors = () => {
    const availableColors = [...PLAYER_COLORS];
    const shuffled = availableColors.sort(() => Math.random() - 0.5);

    setPlayers(players.map((p, index) => ({
      ...p,
      color: shuffled[index] || null,
    })));
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

  const handleNameChange = (position: number, displayName: string) => {
    setPlayers(players.map(p =>
      p.position === position ? { ...p, displayName } : p
    ));
  };

  const isComplete = players.every(p => p.color && p.factionId);

  const handleContinue = () => {
    if (isComplete) {
      onComplete(players);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Configure Players</h2>
        <p className={styles.description}>
          Assign colors and factions to each player
        </p>
        <div className={styles.randomButtons}>
          <Button
            variant="secondary"
            size="small"
            onClick={handleRandomAllColors}
          >
            🎨 Randomize All Colors
          </Button>
          <Button
            variant="secondary"
            size="small"
            onClick={handleRandomAllFactions}
          >
            🎲 Randomize All Factions
          </Button>
          <Button
            variant="primary"
            size="small"
            onClick={handleRandomizeAll}
          >
            ✨ Randomize Everything
          </Button>
        </div>
      </div>

      <div className={styles.playerList}>
        {players.map((player) => (
          <PlayerSlot
            key={player.position}
            player={player}
            usedColors={usedColors}
            onColorSelect={(color) => handleColorSelect(player.position, color)}
            onFactionClick={() => handleOpenFactionModal(player.position)}
            onRandomFaction={() => handleRandomFaction(player.position)}
            onNameChange={(name) => handleNameChange(player.position, name)}
          />
        ))}
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

      <Modal
        isOpen={showFactionModal}
        onClose={() => {
          setShowFactionModal(false);
          setSelectedFactionForPlayer(null);
        }}
        title="Select Faction"
        size="large"
      >
        <FactionSelector
          usedFactions={usedFactions}
          onSelect={handleFactionSelect}
        />
      </Modal>
    </div>
  );
}

interface PlayerSlotProps {
  player: PlayerSetup;
  usedColors: Set<PlayerColor | null>;
  onColorSelect: (color: PlayerColor) => void;
  onFactionClick: () => void;
  onRandomFaction: () => void;
  onNameChange: (name: string) => void;
}

function PlayerSlot({
  player,
  usedColors,
  onColorSelect,
  onFactionClick,
  onRandomFaction,
  onNameChange,
}: PlayerSlotProps) {
  const selectedFaction = player.factionId ? FACTION_LIST.find(f => f.id === player.factionId) : null;

  return (
    <div className={styles.playerSlot}>
      <div className={styles.playerHeader}>
        <span className={styles.playerPosition}>Player {player.position}</span>
        <input
          type="text"
          value={player.displayName}
          onChange={(e) => onNameChange(e.target.value)}
          className={styles.playerNameInput}
          placeholder={`Player ${player.position}`}
        />
      </div>

      <div className={styles.playerConfig}>
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
                  onClick={() => !isUsed && onColorSelect(color)}
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
          <div className={styles.factionControls}>
            <button
              className={styles.factionButton}
              onClick={onFactionClick}
            >
              {selectedFaction ? (
                <div className={styles.selectedFaction}>
                  <img
                    src={getFactionImage(selectedFaction.id)}
                    alt={selectedFaction.name}
                    className={styles.factionImage}
                  />
                  <span className={styles.factionName}>{selectedFaction.shortName}</span>
                </div>
              ) : (
                <span className={styles.factionPlaceholder}>Select Faction</span>
              )}
            </button>
            <Button
              variant="ghost"
              size="small"
              onClick={onRandomFaction}
              title="Random faction"
            >
              🎲
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

interface FactionSelectorProps {
  usedFactions: Set<string | null>;
  onSelect: (factionId: string) => void;
}

function FactionSelector({ usedFactions, onSelect }: FactionSelectorProps) {
  const [search, setSearch] = useState('');

  const filteredFactions = FACTION_LIST.filter(faction =>
    faction.name.toLowerCase().includes(search.toLowerCase()) ||
    faction.shortName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.factionSelector}>
      <input
        type="text"
        placeholder="Search factions..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className={styles.searchInput}
        autoFocus
      />

      <div className={styles.factionGrid}>
        {filteredFactions.map((faction) => {
          const isUsed = usedFactions.has(faction.id);
          return (
            <button
              key={faction.id}
              className={`${styles.factionCard} ${isUsed ? styles.disabled : ''}`}
              onClick={() => !isUsed && onSelect(faction.id)}
              disabled={isUsed}
            >
              <img
                src={getFactionImage(faction.id)}
                alt={faction.name}
                className={styles.factionCardImage}
              />
              <div className={styles.factionCardName}>{faction.shortName}</div>
              {isUsed && <div className={styles.usedBadge}>In Use</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
