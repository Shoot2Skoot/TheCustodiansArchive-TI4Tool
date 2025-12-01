import type { FactionData } from '@/data/factions/types';
import { getAllAgents } from '@/data/factions';
import styles from './LeadersSection.module.css';

interface LeadersSectionProps {
  gameId: string;
  playerId: string;
  leaders: FactionData['leaders'];
  factionId: string;
  codex3Enabled: boolean;
}

export function LeadersSection({
  gameId,
  playerId,
  leaders,
  factionId,
  codex3Enabled
}: LeadersSectionProps) {
  // Get the active leader versions based on Codex 3 setting
  const agent = codex3Enabled && leaders.agent.omega ? leaders.agent.omega : leaders.agent.base;
  const commander = codex3Enabled && leaders.commander.omega ? leaders.commander.omega : leaders.commander.base;
  const hero = codex3Enabled && leaders.hero.omega ? leaders.hero.omega : leaders.hero.base;

  // For now, show static "Locked" or "Unlocked" status
  // TODO: Connect to real unlock tracking system
  const agentUnlocked = true; // Agents are always unlocked
  const commanderUnlocked = false; // Placeholder
  const heroUnlocked = false; // Placeholder

  return (
    <div className={styles.content}>
      {/* Agent */}
      <div className={styles.leader}>
        <div className={styles.leaderHeader}>
          <span className={styles.leaderType}>Agent</span>
          <span className={`${styles.status} ${styles.unlocked}`}>Unlocked</span>
        </div>
        <div className={styles.leaderName}>{agent.name}</div>
        <div className={styles.leaderAbility}>{agent.ability}</div>
      </div>

      {/* Commander */}
      <div className={styles.leader}>
        <div className={styles.leaderHeader}>
          <span className={styles.leaderType}>Commander</span>
          <span className={`${styles.status} ${commanderUnlocked ? styles.unlocked : styles.locked}`}>
            {commanderUnlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        <div className={styles.leaderName}>{commander.name}</div>
        <div className={styles.leaderAbility}>{commander.ability}</div>
        {commander.unlockCondition && (
          <div className={styles.unlockCondition}>
            <span className={styles.unlockLabel}>Unlock:</span> {commander.unlockCondition}
          </div>
        )}
      </div>

      {/* Hero */}
      <div className={styles.leader}>
        <div className={styles.leaderHeader}>
          <span className={styles.leaderType}>Hero</span>
          <span className={`${styles.status} ${heroUnlocked ? styles.unlocked : styles.locked}`}>
            {heroUnlocked ? 'Unlocked' : 'Locked'}
          </span>
        </div>
        <div className={styles.leaderName}>{hero.name}</div>
        <div className={styles.leaderAbility}>{hero.ability}</div>
        {hero.unlockCondition && (
          <div className={styles.unlockCondition}>
            <span className={styles.unlockLabel}>Unlock:</span> {hero.unlockCondition}
          </div>
        )}
      </div>
    </div>
  );
}
