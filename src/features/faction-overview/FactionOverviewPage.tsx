import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Panel } from '@/components/common';
import { useGame } from '@/hooks';
import { useStore } from '@/store';
import { shallow } from 'zustand/shallow';
import { FACTIONS_BY_ID } from '@/data/factions';
import type { FactionData } from '@/data/factions';
import { FactionHeaderWithSelector } from './components/FactionHeaderWithSelector';
import { AbilitiesSection } from '../faction-comparison/components/sections/AbilitiesSection';
import { FlagshipSection } from '../faction-comparison/components/sections/FlagshipSection';
import { MechSection } from '../faction-comparison/components/sections/MechSection';
import { StartingTechSection } from '../faction-comparison/components/sections/StartingTechSection';
import { CommoditiesSection } from '../faction-comparison/components/sections/CommoditiesSection';
import { HomeSystemSection } from '../faction-comparison/components/sections/HomeSystemSection';
import { PromissorySection } from '../faction-comparison/components/sections/PromissorySection';
import { LeadersSection } from '../faction-comparison/components/sections/LeadersSection';
import styles from './FactionOverviewPage.module.css';

export type CategoryType =
  | 'abilities'
  | 'flagship'
  | 'mech'
  | 'startingTech'
  | 'commodities'
  | 'homeSystem'
  | 'promissory'
  | 'leaders';

// Default categories to show
const DEFAULT_CATEGORIES: Set<CategoryType> = new Set([
  'abilities',
  'flagship',
  'mech',
  'startingTech',
  'commodities',
  'homeSystem',
  'promissory',
  'leaders',
]);

export function FactionOverviewPage() {
  const { gameId } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const { isLoading, error } = useGame(gameId || null);
  const players = useStore((state) => state.players, shallow);
  const game = useStore((state) => state.game);

  // Track selected faction ID
  const [selectedFactionId, setSelectedFactionId] = useState<string | null>(
    players.length > 0 ? players[0].factionId : null
  );

  // Track active filter categories
  const [activeCategories, setActiveCategories] = useState<Set<CategoryType>>(DEFAULT_CATEGORIES);

  const toggleCategory = (category: CategoryType) => {
    setActiveCategories((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  const codexConfig = game?.config?.expansions;

  if (!gameId) {
    return (
      <div className={styles.page}>
        <Panel className={styles.errorPanel}>
          <div className={styles.error}>Invalid game ID</div>
        </Panel>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <Panel className={styles.loadingPanel}>
          <div className={styles.loadingContent}>
            <div className={styles.spinner}></div>
            <p>Loading game...</p>
          </div>
        </Panel>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.page}>
        <Panel className={styles.errorPanel}>
          <h2>Error</h2>
          <p>{error}</p>
        </Panel>
      </div>
    );
  }

  // Get player factions
  const playerFactions = players
    .map((player) => {
      const faction = FACTIONS_BY_ID.get(player.factionId);
      return faction ? { player, faction } : null;
    })
    .filter((pf): pf is { player: typeof players[0]; faction: FactionData } => pf !== null);

  if (playerFactions.length === 0) {
    return (
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.title}>Faction Overview</h1>
        </header>
        <Panel className={styles.emptyPanel}>
          <p>No factions to display.</p>
          <p className={styles.emptyHint}>Players must be assigned factions to view faction information.</p>
        </Panel>
      </div>
    );
  }

  // Find selected player and faction
  const selectedPlayerFaction = playerFactions.find((pf) => pf.faction.id === selectedFactionId) || playerFactions[0];
  const { player: selectedPlayer, faction: selectedFaction } = selectedPlayerFaction;

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          className={styles.backButton}
          onClick={() => navigate(`/game/${gameId}`)}
        >
          ← Back to Game
        </button>
        <h1 className={styles.title}>Faction Overview</h1>
      </header>

      <FactionHeaderWithSelector
        playerFactions={playerFactions}
        selectedFactionId={selectedFaction.id}
        onSelectFaction={setSelectedFactionId}
        selectedPlayer={selectedPlayer}
        selectedFaction={selectedFaction}
        activeCategories={activeCategories}
        onToggleCategory={toggleCategory}
      />

      <div className={styles.sectionsContainer}>
        {/* Abilities */}
        {activeCategories.has('abilities') && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>⚡ Faction Abilities</span>
            </div>
            <div className={styles.sectionContent}>
              <AbilitiesSection abilities={selectedFaction.abilities} />
            </div>
          </Panel>
        )}

        {/* Flagship */}
        {activeCategories.has('flagship') && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>🚀 Flagship</span>
            </div>
            <div className={styles.sectionContent}>
              <FlagshipSection flagship={selectedFaction.flagship} />
            </div>
          </Panel>
        )}

        {/* Mech (PoK only) */}
        {activeCategories.has('mech') && selectedFaction.mech && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>🤖 Mech Unit</span>
            </div>
            <div className={styles.sectionContent}>
              <MechSection mech={selectedFaction.mech} />
            </div>
          </Panel>
        )}

        {/* Starting Technologies */}
        {activeCategories.has('startingTech') && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>🔬 Starting Technologies</span>
            </div>
            <div className={styles.sectionContent}>
              <StartingTechSection technologies={selectedFaction.startingTechnologies} />
            </div>
          </Panel>
        )}

        {/* Commodities */}
        {activeCategories.has('commodities') && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>💰 Commodities</span>
            </div>
            <div className={styles.sectionContent}>
              <CommoditiesSection commodityValue={selectedFaction.commodityValue} />
            </div>
          </Panel>
        )}

        {/* Home System */}
        {activeCategories.has('homeSystem') && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>🏠 Home System</span>
            </div>
            <div className={styles.sectionContent}>
              <HomeSystemSection homeSystem={selectedFaction.homeSystem} />
            </div>
          </Panel>
        )}

        {/* Promissory Note */}
        {activeCategories.has('promissory') && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>📜 Promissory Note</span>
            </div>
            <div className={styles.sectionContent}>
              <PromissorySection
                promissoryNote={selectedFaction.promissoryNote}
                codex1Enabled={codexConfig?.codex1 || false}
              />
            </div>
          </Panel>
        )}

        {/* Leaders */}
        {activeCategories.has('leaders') && (
          <Panel className={styles.sectionPanel} beveled>
            <div className={styles.sectionHeader}>
              <span className={styles.sectionTitle}>👑 Leaders</span>
            </div>
            <div className={styles.sectionContent}>
              <LeadersSection
                gameId={gameId}
                playerId={selectedPlayer.id}
                leaders={selectedFaction.leaders}
                factionId={selectedFaction.id}
                codex3Enabled={codexConfig?.codex3 || false}
              />
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
