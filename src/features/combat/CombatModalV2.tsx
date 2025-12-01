import { useState, useEffect } from 'react';
import { Panel, Button } from '@/components/common';
import type {
  CombatState,
  CombatPhase,
  CombatStep,
  CombatParticipant,
} from '@/types/combat';
import { CombatPhase as Phase } from '@/types/combat';
import styles from './CombatModal.module.css';

// ============================================================================
// TYPES
// ============================================================================

interface CombatModalProps {
  gameId: string;
  players: Array<{ id: string; displayName: string; factionId: string; color: string }>;
  onClose: () => void;
  onComplete: (result: { winner: 'attacker' | 'defender' | null }) => void;
  initialState?: CombatState;
}

// ============================================================================
// HELPER: Create Initial Combat State
// ============================================================================

function createInitialCombatState(gameId: string): CombatState {
  const now = new Date().toISOString();

  return {
    id: `combat_${gameId}_${Date.now()}`,
    gameId,
    systemId: 'temp-system',
    planetIds: [],
    createdAt: now,
    updatedAt: now,
    currentPhase: Phase.ACTIVATION,
    currentStep: 'P0.1',
    spaceCombatRound: 1,
    groundCombatRound: 1,
    currentPlanetIndex: 0,
    attacker: null as any, // Will be set in P0.1
    defender: null as any, // Will be set in P0.2
    thirdPartyParticipants: [],
    activationComplete: false,
    spaceCannonOffenseComplete: false,
    spaceCombatComplete: false,
    bombardmentComplete: false,
    invasionComplete: false,
    groundCombatComplete: false,
    afbFiredThisCombat: false,
    log: [{
      id: `log_${Date.now()}`,
      timestamp: now,
      phase: Phase.ACTIVATION,
      step: 'P0.1',
      eventType: 'COMBAT_STARTED' as any,
      description: 'Combat assistant activated',
    }],
    isComplete: false,
    winner: null,
    canUndo: false,
    canRedo: false,
  };
}

function createParticipant(
  player: { id: string; displayName: string; factionId: string; color: string },
  isAttacker: boolean
): CombatParticipant {
  return {
    playerId: player.id,
    playerName: player.displayName,
    factionId: player.factionId,
    color: player.color,
    isAttacker,
    spaceUnits: [],
    groundForces: [],
    structures: [],
    queuedHits: 0,
    hitsProduced: 0,
    hasAnnouncedRetreat: false,
    hasRetreated: false,
    globalModifiers: [],
    actionCardsPlayed: [],
    promissoryNotesPlayed: [],
    abilitiesUsed: [],
    technologiesExhausted: [],
    leadersExhausted: [],
  };
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function CombatModalV2({
  gameId,
  players,
  onClose,
  onComplete,
  initialState,
}: CombatModalProps) {
  const [combatState, setCombatState] = useState<CombatState>(() => {
    return initialState || createInitialCombatState(gameId);
  });

  const [showAbilityList, setShowAbilityList] = useState(false);

  // Save state to localStorage
  useEffect(() => {
    if (!combatState.isComplete) {
      localStorage.setItem(`combat_${gameId}`, JSON.stringify(combatState));
    } else {
      localStorage.removeItem(`combat_${gameId}`);
    }
  }, [combatState, gameId]);

  // Helper: Add log entry
  const addLog = (message: string) => {
    setCombatState(prev => ({
      ...prev,
      log: [...prev.log, {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString(),
        phase: prev.currentPhase,
        step: prev.currentStep,
        eventType: 'STEP_CHANGED' as any,
        description: message,
      }],
    }));
  };

  // Helper: Advance to next step
  const goToStep = (step: CombatStep) => {
    setCombatState(prev => ({ ...prev, currentStep: step }));
    addLog(`Advanced to ${step}`);
  };

  // Helper: Advance to next phase
  const goToPhase = (phase: CombatPhase, firstStep: CombatStep) => {
    setCombatState(prev => ({
      ...prev,
      currentPhase: phase,
      currentStep: firstStep,
    }));
    addLog(`Advanced to Phase ${phase}`);
  };

  // ========================================================================
  // PHASE 0: ACTIVATION & COMBAT INITIALIZATION
  // ========================================================================

  const renderPhase0 = () => {
    const step = combatState.currentStep;

    // P0.1: Select Attacking Faction
    if (step === 'P0.1') {
      return (
        <div className={styles.stepContent}>
          <h3>P0.1 — Select Attacking Faction</h3>
          <p>Which player is activating the system?</p>

          <div className={styles.playerSelection}>
            {players.map(player => (
              <Button
                key={player.id}
                onClick={() => {
                  setCombatState(prev => ({
                    ...prev,
                    attacker: createParticipant(player, true),
                  }));
                  addLog(`${player.displayName} selected as Attacker`);
                  goToStep('P0.2');
                }}
                variant="secondary"
                className={styles.playerButton}
              >
                {player.displayName}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // P0.2: Select Defending Faction
    if (step === 'P0.2') {
      return (
        <div className={styles.stepContent}>
          <h3>P0.2 — Select Defending Faction</h3>
          <p>Which player is defending the system?</p>
          <p className={styles.attackerNote}>
            Attacker: <strong>{combatState.attacker?.playerName}</strong>
          </p>

          <div className={styles.playerSelection}>
            {players.filter(p => p.id !== combatState.attacker?.playerId).map(player => (
              <Button
                key={player.id}
                onClick={() => {
                  setCombatState(prev => ({
                    ...prev,
                    defender: createParticipant(player, false),
                  }));
                  addLog(`${player.displayName} selected as Defender`);
                  goToStep('P0.3');
                }}
                variant="secondary"
                className={styles.playerButton}
              >
                {player.displayName}
              </Button>
            ))}
          </div>
        </div>
      );
    }

    // P0.3: Activation Step - "After you activate a system" abilities
    if (step === 'P0.3') {
      return (
        <div className={styles.stepContent}>
          <h3>P0.3 — Activation Step</h3>
          <p>Declare any abilities or action cards that trigger "after you activate a system" or "after another player activates a system."</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No activation abilities used');
                goToStep('P0.4');
              }}
              variant="primary"
            >
              Continue (No Abilities)
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Show'} Activation Abilities
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <p className={styles.abilityNote}>Available activation abilities:</p>
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('So Ata (Yssaril Commander) - Inspect hand/objectives');
                    setCombatState(prev => ({
                      ...prev,
                      defender: {
                        ...prev.defender!,
                        abilitiesUsed: [...prev.defender!.abilitiesUsed, 'yssaril_commander'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  So Ata (Yssaril Commander)
                </Button>

                <Button
                  onClick={() => {
                    addLog('E-Res Siphons (Jol-Nar) - Gain 4 TG');
                    setCombatState(prev => ({
                      ...prev,
                      defender: {
                        ...prev.defender!,
                        promissoryNotesPlayed: [...prev.defender!.promissoryNotesPlayed, 'eres_siphons'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  E-Res Siphons (+4 TG)
                </Button>

                <Button
                  onClick={() => {
                    addLog('Nullification Field (Xxcha) - COMBAT CANCELLED');
                    setCombatState(prev => ({
                      ...prev,
                      isComplete: true,
                      winner: 'defender',
                    }));
                  }}
                  variant="danger"
                >
                  Nullification Field (End Turn)
                </Button>

                {/* Add more abilities as needed */}
              </div>
            </div>
          )}
        </div>
      );
    }

    // P0.4: Movement Step
    if (step === 'P0.4') {
      return (
        <div className={styles.stepContent}>
          <h3>P0.4 — Movement Step</h3>
          <p>The attacker moves ships into the activated system and confirms when movement is complete.</p>

          <Button
            onClick={() => {
              addLog('Movement complete');
              goToStep('P0.5');
            }}
            variant="primary"
          >
            Movement Complete
          </Button>
        </div>
      );
    }

    // P0.5: Unit Inventory Confirmation
    if (step === 'P0.5') {
      return (
        <div className={styles.stepContent}>
          <h3>P0.5 — Unit Inventory Confirmation</h3>
          <p>Define all units present in combat for both attacker and defender.</p>

          {/* TODO: Add unit selection UI */}
          <p className={styles.placeholder}>Unit selection UI will be added here</p>

          <Button
            onClick={() => {
              addLog('Unit inventory confirmed');
              goToStep('P0.6');
            }}
            variant="primary"
          >
            Confirm Units
          </Button>
        </div>
      );
    }

    // P0.6: Post-Movement Actions Window
    if (step === 'P0.6') {
      return (
        <div className={styles.stepContent}>
          <h3>P0.6 — Post-Movement Actions Window</h3>
          <p>This is the timing window after movement is complete but before Space Cannon Offense.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Proceeding to Space Cannon Offense');
                setCombatState(prev => ({ ...prev, activationComplete: true }));
                goToPhase(Phase.SPACE_CANNON_OFFENSE, 'P1.1');
              }}
              variant="primary"
            >
              Continue to Space Cannon Offense
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Show'} Post-Movement Actions
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <p className={styles.abilityNote}>Available post-movement action cards:</p>
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('Experimental Battlestation played');
                    setCombatState(prev => ({
                      ...prev,
                      attacker: {
                        ...prev.attacker!,
                        actionCardsPlayed: [...prev.attacker!.actionCardsPlayed, 'experimental_battlestation'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Experimental Battlestation
                </Button>

                <Button
                  onClick={() => {
                    addLog('Rescue played');
                    setCombatState(prev => ({
                      ...prev,
                      defender: {
                        ...prev.defender!,
                        actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'rescue'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Rescue
                </Button>

                <Button
                  onClick={() => {
                    addLog('Stymie played');
                    setCombatState(prev => ({
                      ...prev,
                      defender: {
                        ...prev.defender!,
                        actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'stymie'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Stymie
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ========================================================================
  // PHASE 1: SPACE CANNON OFFENSE
  // ========================================================================

  const renderPhase1 = () => {
    const step = combatState.currentStep;

    // P1.1: Space Cannon Offense Cancellation Window
    if (step === 'P1.1') {
      return (
        <div className={styles.stepContent}>
          <h3>P1.1 — Space Cannon Offense Cancellation Window</h3>
          <p>Prompt players to declare any effects that trigger "at the start of an invasion."</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No SCO cancellation cards');
                goToStep('P1.2');
              }}
              variant="primary"
            >
              Continue (No Cards)
            </Button>

            <Button
              onClick={() => {
                addLog('DISABLE played - Space Cannon phase skipped');
                setCombatState(prev => ({
                  ...prev,
                  spaceCannonOffenseComplete: true,
                }));
                goToPhase(Phase.SPACE_COMBAT, 'P2.1');
              }}
              variant="secondary"
            >
              Play DISABLE (Skip Space Cannon)
            </Button>
          </div>
        </div>
      );
    }

    // Placeholder for P1.2-P1.4
    return (
      <div className={styles.stepContent}>
        <h3>Space Cannon Offense - {step}</h3>
        <p className={styles.placeholder}>Implementation in progress...</p>

        <Button
          onClick={() => {
            addLog(`${step} completed`);
            if (step === 'P1.4' || step === 'P1.3' || step === 'P1.2') {
              goToPhase(Phase.SPACE_COMBAT, 'P2.1');
            } else {
              const nextStep = `P1.${parseInt(step.split('.')[1]) + 1}` as CombatStep;
              goToStep(nextStep);
            }
          }}
          variant="primary"
        >
          Continue
        </Button>
      </div>
    );
  };

  // ========================================================================
  // PHASE 2: SPACE COMBAT
  // ========================================================================

  const renderPhase2 = () => {
    return (
      <div className={styles.stepContent}>
        <h3>Phase 2: Space Combat - Round {combatState.spaceCombatRound}</h3>
        <p className={styles.placeholder}>Space combat implementation in progress...</p>

        <Button
          onClick={() => {
            addLog('Space Combat Complete');
            goToPhase(Phase.INVASION, 'P3.1');
          }}
          variant="primary"
        >
          Skip to Invasion
        </Button>
      </div>
    );
  };

  // ========================================================================
  // PHASE 3: INVASION / BOMBARDMENT
  // ========================================================================

  const renderPhase3 = () => {
    return (
      <div className={styles.stepContent}>
        <h3>Phase 3: Invasion / Bombardment</h3>
        <p className={styles.placeholder}>Invasion implementation in progress...</p>

        <Button
          onClick={() => {
            addLog('Invasion Complete');
            goToPhase(Phase.GROUND_COMBAT, 'P4.1');
          }}
          variant="primary"
        >
          Skip to Ground Combat
        </Button>
      </div>
    );
  };

  // ========================================================================
  // PHASE 4: GROUND COMBAT
  // ========================================================================

  const renderPhase4 = () => {
    return (
      <div className={styles.stepContent}>
        <h3>Phase 4: Ground Combat - Round {combatState.groundCombatRound}</h3>
        <p className={styles.placeholder}>Ground combat implementation in progress...</p>

        <Button
          onClick={() => {
            addLog('Ground Combat Complete');
            goToPhase(Phase.POST_COMBAT, 'PC.1');
          }}
          variant="primary"
        >
          Skip to Post-Combat
        </Button>
      </div>
    );
  };

  // ========================================================================
  // PHASE 5: POST-COMBAT
  // ========================================================================

  const renderPhase5 = () => {
    return (
      <div className={styles.stepContent}>
        <h3>Post-Combat Cleanup</h3>
        <p>Combat has concluded.</p>

        <Button
          onClick={() => {
            addLog('Combat Complete');
            setCombatState(prev => ({
              ...prev,
              isComplete: true,
              winner: 'attacker',
            }));
          }}
          variant="primary"
        >
          Complete Combat
        </Button>
      </div>
    );
  };

  // ========================================================================
  // MAIN RENDER
  // ========================================================================

  // Combat complete screen
  if (combatState.isComplete) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <Panel className={styles.combatPanel}>
            <h1>Combat Complete</h1>

            <div className={styles.resultContent}>
              <h2>
                {combatState.winner === 'attacker'
                  ? `${combatState.attacker?.playerName} (Attacker) Wins!`
                  : combatState.winner === 'defender'
                  ? `${combatState.defender?.playerName} (Defender) Wins!`
                  : 'Draw - Combat Ended'}
              </h2>

              <div className={styles.logSection}>
                <h3>Combat Log:</h3>
                <div className={styles.logContent}>
                  {combatState.log.map((entry) => (
                    <div key={entry.id} className={styles.logEntry}>
                      [{entry.step}] {entry.description}
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    onComplete({ winner: combatState.winner });
                    onClose();
                  }}
                  variant="primary"
                >
                  Close Combat
                </Button>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    );
  }

  // Main combat UI
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <Panel className={styles.combatPanel}>
          {/* Header */}
          <div className={styles.header}>
            <h1>Activate Enemy System</h1>
            {combatState.attacker && combatState.defender && (
              <div className={styles.participants}>
                <span className={styles.attacker}>Attacker: {combatState.attacker.playerName}</span>
                <span className={styles.vs}>vs</span>
                <span className={styles.defender}>Defender: {combatState.defender.playerName}</span>
              </div>
            )}
          </div>

          {/* Static Reminders */}
          <div className={styles.staticReminders}>
            <p>The active player may make transactions at any point during their turn, once per neighbor.</p>
          </div>

          {/* Phase indicator */}
          <div className={styles.phaseIndicator}>
            Phase {combatState.currentPhase} — {combatState.currentStep}
            {combatState.currentPhase === Phase.SPACE_COMBAT && ` (Round ${combatState.spaceCombatRound})`}
            {combatState.currentPhase === Phase.GROUND_COMBAT && ` (Round ${combatState.groundCombatRound})`}
          </div>

          {/* Phase content */}
          <div className={styles.phaseContent}>
            {combatState.currentPhase === Phase.ACTIVATION && renderPhase0()}
            {combatState.currentPhase === Phase.SPACE_CANNON_OFFENSE && renderPhase1()}
            {combatState.currentPhase === Phase.SPACE_COMBAT && renderPhase2()}
            {combatState.currentPhase === Phase.INVASION && renderPhase3()}
            {combatState.currentPhase === Phase.GROUND_COMBAT && renderPhase4()}
            {combatState.currentPhase === Phase.POST_COMBAT && renderPhase5()}
          </div>

          {/* Footer */}
          <div className={styles.footer}>
            <Button onClick={onClose} variant="secondary">
              Save & Exit
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
