import type { Player } from '@/types';
import type { FactionData } from '@/data/factions';
import type { CategoryType } from '../FactionComparisonPage';
import type { GameConfig } from '@/types/game';
import { getFactionImage } from '@/lib/factions';
import { AbilitiesSection } from './sections/AbilitiesSection';
import { FlagshipSection } from './sections/FlagshipSection';
import { MechSection } from './sections/MechSection';
import { StartingTechSection } from './sections/StartingTechSection';
import { CommoditiesSection } from './sections/CommoditiesSection';
import { HomeSystemSection } from './sections/HomeSystemSection';
import { PromissorySection } from './sections/PromissorySection';
import { LeadersSection } from './sections/LeadersSection';
import styles from './FactionCard.module.css';

interface FactionCardProps {
  gameId: string;
  player: Player;
  faction: FactionData;
  activeCategories: Set<CategoryType>;
  codexConfig?: GameConfig['expansions'];
}

export function FactionCard({
  gameId,
  player,
  faction,
  activeCategories,
  codexConfig,
}: FactionCardProps) {
  return (
    <div className={styles.factionCard}>
      {/* Header */}
      <div className={styles.header}>
        <img
          src={getFactionImage(faction.id, 'color')}
          alt={faction.name}
          className={styles.factionIcon}
        />
        <div className={styles.headerText}>
          <h3 className={styles.factionName}>{faction.name}</h3>
          <div className={styles.playerInfo}>
            <span className={`${styles.playerColor} ${styles[player.color]}`}>
              {player.color}
            </span>
            {player.displayName && (
              <span className={styles.playerName}>{player.displayName}</span>
            )}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className={styles.content}>
        {/* Abilities */}
        {activeCategories.has('abilities') && (
          <AbilitiesSection abilities={faction.abilities} />
        )}

        {/* Flagship */}
        {activeCategories.has('flagship') && (
          <FlagshipSection flagship={faction.flagship} />
        )}

        {/* Mech */}
        {activeCategories.has('mech') && faction.mech && (
          <MechSection mech={faction.mech} />
        )}

        {/* Starting Technologies */}
        {activeCategories.has('startingTech') && (
          <StartingTechSection technologies={faction.startingTechnologies} />
        )}

        {/* Commodities */}
        {activeCategories.has('commodities') && (
          <CommoditiesSection commodityValue={faction.commodityValue} />
        )}

        {/* Home System */}
        {activeCategories.has('homeSystem') && (
          <HomeSystemSection homeSystem={faction.homeSystem} />
        )}

        {/* Promissory Note */}
        {activeCategories.has('promissory') && (
          <PromissorySection
            promissoryNote={faction.promissoryNote}
            codex1Enabled={codexConfig?.codex1 || false}
          />
        )}

        {/* Leaders */}
        {activeCategories.has('leaders') && (
          <LeadersSection
            gameId={gameId}
            playerId={player.id}
            leaders={faction.leaders}
            factionId={faction.id}
            codex3Enabled={codexConfig?.codex3 || false}
          />
        )}
      </div>
    </div>
  );
}
