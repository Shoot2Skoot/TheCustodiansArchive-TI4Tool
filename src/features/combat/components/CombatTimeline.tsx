import type { CombatPhase, CombatStep } from '@/types/combat';
import { CombatPhase as Phase } from '@/types/combat';
import { getFactionImage } from '@/lib/factions';
import styles from '../CombatModal.module.css';

interface CombatTimelineProps {
  currentPhase: CombatPhase;
  currentStep: CombatStep;
  completedPhases: Set<CombatPhase>;
  spaceCannonPlayers?: Array<{
    playerName: string;
    factionId: string;
    side: 'attacker' | 'defender' | 'third_party';
  }>;
  currentSpaceCannonPlayerIndex?: number;
}

interface PhaseDefinition {
  id: CombatPhase;
  label: string;
  shortLabel: string;
  substeps: Array<{
    id: string;
    label: string;
  }>;
}

const PHASE_DEFINITIONS: PhaseDefinition[] = [
  {
    id: Phase.START,
    label: 'Start',
    shortLabel: 'ST',
    substeps: [
      { id: 'P0.1', label: 'Select Attacker' },
      { id: 'P0.2', label: 'Select Defender' },
      { id: 'P0.3', label: 'Third Parties' },
      { id: 'P0.4', label: 'Attacker Units' },
      { id: 'P0.5', label: 'Defender Units' },
      { id: 'P0.6', label: 'Build SC List' },
    ],
  },
  {
    id: Phase.SPACE_CANNON_OFFENSE,
    label: 'Space Cannon',
    shortLabel: 'SC',
    substeps: [
      { id: 'P1.1', label: 'Start SC' },
      { id: 'P1.2', label: 'Roll' },
      { id: 'P1.3', label: 'Assign' },
      { id: 'P1.4', label: 'Check' },
    ],
  },
  {
    id: Phase.SPACE_COMBAT,
    label: 'Space Combat',
    shortLabel: 'SB',
    substeps: [
      { id: 'P2.1', label: 'Start Round' },
      { id: 'P2.2', label: 'AFB' },
      { id: 'P2.3', label: 'Retreat' },
      { id: 'P2.4', label: 'Roll' },
      { id: 'P2.5', label: 'Assign' },
      { id: 'P2.6', label: 'Check' },
    ],
  },
  {
    id: Phase.INVASION,
    label: 'Invasion',
    shortLabel: 'IV',
    substeps: [
      { id: 'P3.1', label: 'Bombardment' },
      { id: 'P3.2', label: 'SC Defense' },
      { id: 'P3.3', label: 'Commit' },
      { id: 'P3.4', label: 'Start GC' },
      { id: 'P3.5', label: 'Roll' },
      { id: 'P3.6', label: 'Assign' },
      { id: 'P3.7', label: 'Check' },
      { id: 'P3.8', label: 'Winner' },
      { id: 'P3.9', label: 'Retreat' },
      { id: 'P3.10', label: 'Next Round' },
    ],
  },
  {
    id: Phase.ESTABLISH_CONTROL,
    label: 'Control',
    shortLabel: 'EC',
    substeps: [
      { id: 'PC.1', label: 'Establish' },
      { id: 'PC.2', label: 'Claim' },
      { id: 'PC.3', label: 'Complete' },
    ],
  },
];

export function CombatTimeline({
  currentPhase,
  currentStep,
  completedPhases,
  spaceCannonPlayers = [],
  currentSpaceCannonPlayerIndex = 0,
}: CombatTimelineProps) {
  const getPhaseStatus = (phase: CombatPhase): 'completed' | 'active' | 'upcoming' => {
    if (completedPhases.has(phase)) return 'completed';
    if (phase === currentPhase) return 'active';
    return 'upcoming';
  };

  const getSubstepStatus = (substepId: string, phaseId: CombatPhase): 'completed' | 'active' | 'upcoming' => {
    const currentStepStr = currentStep.toString();
    const currentStepBase = currentStepStr.split('-')[0]; // Handle P2.2-assignment format

    // If this substep belongs to a completed phase, it's completed
    if (completedPhases.has(phaseId)) return 'completed';

    // If this substep belongs to a future phase, it's upcoming
    if (phaseId !== currentPhase) return 'upcoming';

    // Same phase - compare step numbers
    const substepNum = parseFloat(substepId.substring(1)); // "P1.2" -> 1.2
    const currentNum = parseFloat(currentStepBase.substring(1)); // "P1.3" -> 1.3

    if (substepNum < currentNum) return 'completed';
    if (substepId === currentStepBase || currentStepStr.startsWith(substepId)) return 'active';
    return 'upcoming';
  };

  // Determine player turn order status for Space Cannon
  const getPlayerTurnStatus = (playerIndex: number): 'completed' | 'active' | 'upcoming' => {
    if (currentPhase !== Phase.SPACE_CANNON_OFFENSE) return 'upcoming';

    if (playerIndex < currentSpaceCannonPlayerIndex) return 'completed';
    if (playerIndex === currentSpaceCannonPlayerIndex) return 'active';
    return 'upcoming';
  };

  return (
    <div className={styles.timelineBanner}>
      {/* Main phase indicators with inline substeps */}
      <div className={styles.timelineRow}>
        <div className={styles.timeline}>
          {PHASE_DEFINITIONS.map((phase, index) => {
            const status = getPhaseStatus(phase.id);
            const isLast = index === PHASE_DEFINITIONS.length - 1;
            const isActivePhase = phase.id === currentPhase;

            return (
              <>
                {/* Phase circle */}
                <div key={phase.id} className={styles.timelinePhase}>
                  <div className={styles.phaseNode}>
                    <div className={`${styles.phaseCircle} ${styles[status]}`}>
                      {phase.shortLabel}
                    </div>
                    <div className={styles.phaseLabel}>{phase.label}</div>
                  </div>

                  {/* Only show connector if not active phase OR if it's active and last (to next phase) */}
                  {!isActivePhase && !isLast && (
                    <div className={`${styles.phaseConnector} ${status === 'completed' ? styles.completed : ''}`} />
                  )}
                </div>

                {/* Show substeps inline for active phase only */}
                {isActivePhase && (
                  <div key={`${phase.id}-substeps`} className={styles.inlineSubsteps}>
                    {phase.substeps.map((substep, idx) => {
                      const substepStatus = getSubstepStatus(substep.id, phase.id);
                      const isLastSubstep = idx === phase.substeps.length - 1;

                      return (
                        <div key={substep.id} className={styles.substepWrapper}>
                          {idx === 0 && <div className={`${styles.substepConnector} ${styles.fromPhase}`} />}
                          <div
                            className={`${styles.substepBubble} ${styles[substepStatus]}`}
                            title={`${substep.id}: ${substep.label}`}
                          >
                            <div className={styles.substepId}>{substep.id}</div>
                            <div className={styles.substepLabel}>{substep.label}</div>
                          </div>
                          {!isLastSubstep && (
                            <div className={`${styles.substepConnector} ${substepStatus === 'completed' ? styles.completed : ''}`} />
                          )}
                        </div>
                      );
                    })}

                    {/* Player turn order for Space Cannon phase */}
                    {phase.id === Phase.SPACE_CANNON_OFFENSE && spaceCannonPlayers.length > 0 && (
                      <>
                        <div className={styles.substepConnector} />
                        {spaceCannonPlayers.map((player, playerIdx) => {
                          const playerStatus = getPlayerTurnStatus(playerIdx);
                          const isLastPlayer = playerIdx === spaceCannonPlayers.length - 1;

                          return (
                            <div key={`player-${playerIdx}`} className={styles.substepWrapper}>
                              <div
                                className={`${styles.playerTurnCircle} ${styles[playerStatus]}`}
                                title={player.playerName}
                              >
                                <img
                                  src={getFactionImage(player.factionId, 'color')}
                                  alt={player.playerName}
                                  className={styles.playerTurnIcon}
                                />
                              </div>
                              {!isLastPlayer && (
                                <div className={`${styles.substepConnector} ${playerStatus === 'completed' ? styles.completed : ''}`} />
                              )}
                            </div>
                          );
                        })}
                      </>
                    )}

                    {/* Connector to next phase */}
                    {!isLast && <div className={`${styles.phaseConnector} ${styles.toPhase}`} />}
                  </div>
                )}
              </>
            );
          })}
        </div>
      </div>
    </div>
  );
}
