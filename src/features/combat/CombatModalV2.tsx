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
    const [defenderHits, setDefenderHits] = useState(0);
    const [attackerHits, setAttackerHits] = useState(0);

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
                  defender: {
                    ...prev.defender!,
                    actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'disable'],
                  },
                  spaceCannonOffenseComplete: true,
                }));
                goToPhase(Phase.SPACE_COMBAT, 'P2.1');
              }}
              variant="secondary"
            >
              Play DISABLE (Skip Space Cannon)
            </Button>

            <Button
              onClick={() => {
                addLog('SOLAR FLARE Ω played - Ignore Space Cannon');
                setCombatState(prev => ({
                  ...prev,
                  attacker: {
                    ...prev.attacker!,
                    actionCardsPlayed: [...prev.attacker!.actionCardsPlayed, 'solar_flare'],
                  },
                  spaceCannonOffenseComplete: true,
                }));
                goToPhase(Phase.SPACE_COMBAT, 'P2.1');
              }}
              variant="secondary"
            >
              Play SOLAR FLARE Ω (Ignore SC)
            </Button>
          </div>
        </div>
      );
    }

    // P1.2: Space Cannon Rolls (Defender fires first)
    if (step === 'P1.2') {
      return (
        <div className={styles.stepContent}>
          <h3>P1.2 — Space Cannon Rolls</h3>
          <p>Defender fires Space Cannon units at Attacker's ships.</p>
          <p className={styles.infoNote}>
            Third-party players with Space Cannon in adjacent systems may also fire (in player order).
          </p>

          <div className={styles.inputGroup}>
            <label>Defender Space Cannon Hits:</label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              onChange={(e) => {
                const hits = parseInt(e.target.value) || 0;
                setDefenderHits(hits);
                setCombatState(prev => ({
                  ...prev,
                  attacker: {
                    ...prev.attacker!,
                    queuedHits: hits,
                  },
                }));
              }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Attacker Space Cannon Hits (if any units have SC):</label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              onChange={(e) => {
                const hits = parseInt(e.target.value) || 0;
                setAttackerHits(hits);
                setCombatState(prev => ({
                  ...prev,
                  defender: {
                    ...prev.defender!,
                    queuedHits: hits,
                  },
                }));
              }}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog(`Space Cannon Rolls: Defender ${defenderHits} hits, Attacker ${attackerHits} hits`);
                goToStep('P1.3');
              }}
              variant="primary"
            >
              Continue to Hit Assignment
            </Button>

            <Button
              onClick={() => {
                addLog('SCRAMBLE FREQUENCY played - Reroll opponent SC dice');
                // In a real implementation, this would trigger a reroll
              }}
              variant="secondary"
            >
              Play SCRAMBLE FREQUENCY
            </Button>

            <Button
              onClick={() => {
                addLog('Graviton Laser System - Force hits to non-fighter ships');
              }}
              variant="secondary"
            >
              Use Graviton Laser System
            </Button>
          </div>
        </div>
      );
    }

    // P1.3: Assign Hits
    if (step === 'P1.3') {
      const attackerHits = combatState.attacker.queuedHits;
      const defenderHits = combatState.defender.queuedHits;

      return (
        <div className={styles.stepContent}>
          <h3>P1.3 — Assign Hits</h3>
          <p>Assign Space Cannon hits to ships. Ships with Sustain Damage may absorb hits.</p>

          <div className={styles.hitAssignment}>
            <div>
              <h4>Attacker took {attackerHits} hits</h4>
              <div className={styles.inputGroup}>
                <label>Ships Destroyed:</label>
                <input type="number" min="0" max={attackerHits} defaultValue="0" />
              </div>
              <div className={styles.inputGroup}>
                <label>Sustain Damage Used:</label>
                <input type="number" min="0" max={attackerHits} defaultValue="0" />
              </div>
            </div>

            <div>
              <h4>Defender took {defenderHits} hits</h4>
              <div className={styles.inputGroup}>
                <label>Ships Destroyed:</label>
                <input type="number" min="0" max={defenderHits} defaultValue="0" />
              </div>
              <div className={styles.inputGroup}>
                <label>Sustain Damage Used:</label>
                <input type="number" min="0" max={defenderHits} defaultValue="0" />
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Hits assigned, proceeding to combat continuation check');
                // Reset queued hits
                setCombatState(prev => ({
                  ...prev,
                  attacker: { ...prev.attacker!, queuedHits: 0 },
                  defender: { ...prev.defender!, queuedHits: 0 },
                }));
                goToStep('P1.4');
              }}
              variant="primary"
            >
              Confirm Hit Assignment
            </Button>
          </div>
        </div>
      );
    }

    // P1.4: Combat Continuation Check
    if (step === 'P1.4') {
      // In real implementation, would check actual unit counts
      const attackerHasShips = true; // Placeholder
      const defenderHasShips = true; // Placeholder

      return (
        <div className={styles.stepContent}>
          <h3>P1.4 — Combat Continuation Check</h3>
          <p>Evaluate whether combat continues based on remaining ships.</p>

          <div className={styles.combatStatus}>
            <p>Attacker has ships: {attackerHasShips ? 'Yes' : 'No'}</p>
            <p>Defender has ships: {defenderHasShips ? 'Yes' : 'No'}</p>
          </div>

          {!attackerHasShips && !defenderHasShips ? (
            <div>
              <p>Both sides destroyed - Combat ends in a draw</p>
              <Button
                onClick={() => {
                  setCombatState(prev => ({ ...prev, isComplete: true, winner: 'draw' }));
                }}
                variant="primary"
              >
                End Combat (Draw)
              </Button>
            </div>
          ) : !attackerHasShips ? (
            <div>
              <p>Attacker has no ships - Defender wins</p>
              <Button
                onClick={() => {
                  setCombatState(prev => ({ ...prev, isComplete: true, winner: 'defender' }));
                }}
                variant="primary"
              >
                End Combat (Defender Wins)
              </Button>
            </div>
          ) : !defenderHasShips ? (
            <div>
              <p>Defender has no ships - Skip to Invasion</p>
              <Button
                onClick={() => {
                  addLog('Defender eliminated, proceeding to Invasion');
                  goToPhase(Phase.INVASION, 'P3.1');
                }}
                variant="primary"
              >
                Proceed to Invasion
              </Button>
            </div>
          ) : (
            <div>
              <p>Both sides have ships - Proceed to Space Combat</p>
              <Button
                onClick={() => {
                  addLog('Proceeding to Space Combat');
                  setCombatState(prev => ({ ...prev, spaceCannonOffenseComplete: true }));
                  goToPhase(Phase.SPACE_COMBAT, 'P2.1');
                }}
                variant="primary"
              >
                Proceed to Space Combat
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ========================================================================
  // PHASE 2: SPACE COMBAT
  // ========================================================================

  const renderPhase2 = () => {
    const step = combatState.currentStep;
    const round = combatState.spaceCombatRound;

    // P2.1: Start of Combat Effects
    if (step === 'P2.1') {
      return (
        <div className={styles.stepContent}>
          <h3>P2.1 — Start of Combat Effects (Round {round})</h3>
          <p>Resolve "before combat" and "start of combat" abilities.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No start of combat abilities');
                // If round 1, go to AFB. Otherwise skip to P2.3
                if (round === 1 && !combatState.afbFiredThisCombat) {
                  goToStep('P2.2');
                } else {
                  goToStep('P2.3');
                }
              }}
              variant="primary"
            >
              Continue (No Abilities)
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Show'} Start of Combat Abilities
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <p className={styles.abilityNote}>Available abilities:</p>
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('Mentak Ambush - Pre-combat effect');
                    setCombatState(prev => ({
                      ...prev,
                      defender: {
                        ...prev.defender!,
                        abilitiesUsed: [...prev.defender!.abilitiesUsed, 'mentak_ambush'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Mentak Ambush
                </Button>

                <Button
                  onClick={() => {
                    addLog('Yin Impulse Core - Destroy 1 Destroyer/Cruiser for 1 hit');
                    setCombatState(prev => ({
                      ...prev,
                      defender: {
                        ...prev.defender!,
                        abilitiesUsed: [...prev.defender!.abilitiesUsed, 'yin_impulse_core'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Yin Impulse Core
                </Button>

                <Button
                  onClick={() => {
                    addLog('Reveal Prototype (Muaat) - Research unit upgrade');
                    setCombatState(prev => ({
                      ...prev,
                      attacker: {
                        ...prev.attacker!,
                        actionCardsPlayed: [...prev.attacker!.actionCardsPlayed, 'reveal_prototype'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Reveal Prototype (Muaat)
                </Button>

                <Button
                  onClick={() => {
                    addLog('Argent Hero - Place flagship + up to 2 Cruisers/Destroyers');
                    setCombatState(prev => ({
                      ...prev,
                      defender: {
                        ...prev.defender!,
                        abilitiesUsed: [...prev.defender!.abilitiesUsed, 'argent_hero'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Argent Hero (Defender)
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // P2.2: Anti-Fighter Barrage (Round 1 Only)
    if (step === 'P2.2') {
      return (
        <div className={styles.stepContent}>
          <h3>P2.2 — Anti-Fighter Barrage (Round {round} Only)</h3>
          <p>Both players with AFB-capable units may simultaneously roll against enemy fighters.</p>
          <p className={styles.infoNote}>
            AFB rolls are NOT affected by combat modifiers. Excess hits are ignored unless specified (e.g., Argent Raid Formation).
          </p>

          <div className={styles.inputGroup}>
            <label>Attacker AFB Hits on Defender Fighters:</label>
            <input type="number" min="0" defaultValue="0" />
          </div>

          <div className={styles.inputGroup}>
            <label>Defender AFB Hits on Attacker Fighters:</label>
            <input type="number" min="0" defaultValue="0" />
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Anti-Fighter Barrage complete');
                setCombatState(prev => ({ ...prev, afbFiredThisCombat: true }));
                goToStep('P2.3');
              }}
              variant="primary"
            >
              Continue to Retreats
            </Button>

            <Button
              onClick={() => {
                addLog('WAYLAY - AFB hits all ships, not just fighters');
                setCombatState(prev => ({
                  ...prev,
                  defender: {
                    ...prev.defender!,
                    actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'waylay'],
                  },
                }));
              }}
              variant="secondary"
            >
              Play WAYLAY
            </Button>

            <Button
              onClick={() => {
                addLog('Argent Raid Formation - Excess AFB hits to ships with SD');
              }}
              variant="secondary"
            >
              Use Argent Raid Formation
            </Button>
          </div>
        </div>
      );
    }

    // P2.3: Announce Retreats
    if (step === 'P2.3') {
      return (
        <div className={styles.stepContent}>
          <h3>P2.3 — Announce Retreats (Round {round})</h3>
          <p>Defender declares intent to retreat first. If Defender retreats, Attacker cannot.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No retreats announced');
                goToStep('P2.4');
              }}
              variant="primary"
            >
              No Retreats
            </Button>

            <Button
              onClick={() => {
                addLog('Defender announces retreat');
                setCombatState(prev => ({
                  ...prev,
                  defender: { ...prev.defender!, hasAnnouncedRetreat: true },
                }));
                goToStep('P2.4');
              }}
              variant="secondary"
              disabled={combatState.defender.hasAnnouncedRetreat}
            >
              Defender Announces Retreat
            </Button>

            {!combatState.defender.hasAnnouncedRetreat && (
              <Button
                onClick={() => {
                  addLog('Attacker announces retreat');
                  setCombatState(prev => ({
                    ...prev,
                    attacker: { ...prev.attacker!, hasAnnouncedRetreat: true },
                  }));
                  goToStep('P2.4');
                }}
                variant="secondary"
                disabled={combatState.attacker.hasAnnouncedRetreat}
              >
                Attacker Announces Retreat
              </Button>
            )}
          </div>

          {(combatState.defender.hasAnnouncedRetreat || combatState.attacker.hasAnnouncedRetreat) && (
            <div className={styles.nestedAbilities}>
              <p className={styles.abilityNote}>Post-retreat action cards:</p>
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('INTERCEPT - Cancel retreat');
                    setCombatState(prev => ({
                      ...prev,
                      defender: { ...prev.defender!, hasAnnouncedRetreat: false },
                      attacker: { ...prev.attacker!, hasAnnouncedRetreat: false },
                      actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'intercept'],
                    }));
                  }}
                  variant="secondary"
                >
                  Play INTERCEPT
                </Button>

                <Button
                  onClick={() => {
                    addLog('ROUT - Response to retreat');
                  }}
                  variant="secondary"
                >
                  Play ROUT
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // P2.4: Combat Rolls
    if (step === 'P2.4') {
      return (
        <div className={styles.stepContent}>
          <h3>P2.4 — Combat Rolls (Round {round})</h3>
          <p>Both players roll dice for all participating ships. Attacker rolls first, then Defender.</p>

          <div className={styles.inputGroup}>
            <label>Attacker Hits:</label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              onChange={(e) => {
                const hits = parseInt(e.target.value) || 0;
                setCombatState(prev => ({
                  ...prev,
                  defender: { ...prev.defender!, queuedHits: hits },
                  attacker: { ...prev.attacker!, hitsProduced: hits },
                }));
              }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Defender Hits:</label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              onChange={(e) => {
                const hits = parseInt(e.target.value) || 0;
                setCombatState(prev => ({
                  ...prev,
                  attacker: { ...prev.attacker!, queuedHits: hits },
                  defender: { ...prev.defender!, hitsProduced: hits },
                }));
              }}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog(`Combat rolls complete: Attacker ${combatState.attacker.hitsProduced} hits, Defender ${combatState.defender.hitsProduced} hits`);
                goToStep('P2.5');
              }}
              variant="primary"
            >
              Continue to Hit Assignment
            </Button>

            <Button
              onClick={() => {
                addLog('SCRAMBLE FREQUENCY - Reroll opponent dice');
              }}
              variant="secondary"
            >
              Play SCRAMBLE FREQUENCY
            </Button>

            <Button
              onClick={() => {
                addLog('Jol-Nar Modifier: -1 to all combat rolls');
              }}
              variant="secondary"
            >
              Apply Jol-Nar Modifier
            </Button>
          </div>
        </div>
      );
    }

    // P2.5: Hit Assignment & Damage Resolution
    if (step === 'P2.5') {
      const attackerHits = combatState.attacker.queuedHits;
      const defenderHits = combatState.defender.queuedHits;

      return (
        <div className={styles.stepContent}>
          <h3>P2.5 — Hit Assignment & Damage Resolution (Round {round})</h3>
          <p>Both players assign hits to their opponent's ships simultaneously.</p>

          <div className={styles.hitAssignment}>
            <div>
              <h4>Attacker took {attackerHits} hits</h4>
              <div className={styles.inputGroup}>
                <label>Ships Destroyed:</label>
                <input type="number" min="0" max={attackerHits} defaultValue="0" />
              </div>
              <div className={styles.inputGroup}>
                <label>Sustain Damage Used:</label>
                <input type="number" min="0" max={attackerHits} defaultValue="0" />
              </div>
            </div>

            <div>
              <h4>Defender took {defenderHits} hits</h4>
              <div className={styles.inputGroup}>
                <label>Ships Destroyed:</label>
                <input type="number" min="0" max={defenderHits} defaultValue="0" />
              </div>
              <div className={styles.inputGroup}>
                <label>Sustain Damage Used:</label>
                <input type="number" min="0" max={defenderHits} defaultValue="0" />
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Hits assigned');
                setCombatState(prev => ({
                  ...prev,
                  attacker: { ...prev.attacker!, queuedHits: 0, hitsProduced: 0 },
                  defender: { ...prev.defender!, queuedHits: 0, hitsProduced: 0 },
                }));
                goToStep('P2.6');
              }}
              variant="primary"
            >
              Confirm Hit Assignment
            </Button>

            <Button
              onClick={() => {
                addLog('DIRECT HIT - Destroy ship that used Sustain Damage');
              }}
              variant="secondary"
            >
              Play DIRECT HIT
            </Button>

            <Button
              onClick={() => {
                addLog('EMERGENCY REPAIRS - Repair Sustain Damage');
              }}
              variant="secondary"
            >
              Play EMERGENCY REPAIRS
            </Button>

            <Button
              onClick={() => {
                addLog('SHIELD HOLDING - Cancel a hit');
              }}
              variant="secondary"
            >
              Play SHIELD HOLDING
            </Button>
          </div>
        </div>
      );
    }

    // P2.6: Combat Continuation Check
    if (step === 'P2.6') {
      // In real implementation, would check actual unit counts
      const attackerHasShips = true; // Placeholder
      const defenderHasShips = true; // Placeholder
      const retreatAnnounced = combatState.attacker.hasAnnouncedRetreat || combatState.defender.hasAnnouncedRetreat;

      return (
        <div className={styles.stepContent}>
          <h3>P2.6 — Combat Continuation Check (Round {round})</h3>
          <p>Evaluate whether combat continues, ends, or a retreat is executed.</p>

          <div className={styles.combatStatus}>
            <p>Attacker has ships: {attackerHasShips ? 'Yes' : 'No'}</p>
            <p>Defender has ships: {defenderHasShips ? 'Yes' : 'No'}</p>
            <p>Retreat announced: {retreatAnnounced ? 'Yes' : 'No'}</p>
          </div>

          {!attackerHasShips && !defenderHasShips ? (
            <div>
              <p>All ships destroyed - Combat ends in a draw</p>
              <Button
                onClick={() => {
                  setCombatState(prev => ({
                    ...prev,
                    isComplete: true,
                    winner: 'draw',
                    spaceCombatComplete: true,
                  }));
                }}
                variant="primary"
              >
                End Combat (Draw)
              </Button>
            </div>
          ) : !attackerHasShips ? (
            <div>
              <p>Attacker eliminated - Defender wins</p>
              <Button
                onClick={() => {
                  setCombatState(prev => ({
                    ...prev,
                    isComplete: true,
                    winner: 'defender',
                    spaceCombatComplete: true,
                  }));
                }}
                variant="primary"
              >
                End Combat (Defender Wins)
              </Button>
            </div>
          ) : !defenderHasShips ? (
            <div>
              <p>Defender eliminated - Attacker wins space combat</p>
              <Button
                onClick={() => {
                  addLog('Attacker wins space combat, proceeding to Invasion');
                  setCombatState(prev => ({ ...prev, spaceCombatComplete: true }));
                  goToPhase(Phase.INVASION, 'P3.1');
                }}
                variant="primary"
              >
                Proceed to Invasion
              </Button>
            </div>
          ) : retreatAnnounced ? (
            <div>
              <p>{combatState.defender.hasAnnouncedRetreat ? 'Defender' : 'Attacker'} retreats to adjacent system</p>
              <Button
                onClick={() => {
                  addLog(`${combatState.defender.hasAnnouncedRetreat ? 'Defender' : 'Attacker'} retreated - Combat ends`);
                  setCombatState(prev => ({
                    ...prev,
                    isComplete: true,
                    winner: combatState.defender.hasAnnouncedRetreat ? 'attacker' : 'defender',
                    spaceCombatComplete: true,
                  }));
                }}
                variant="primary"
              >
                Execute Retreat (Combat Ends)
              </Button>
            </div>
          ) : (
            <div>
              <p>Both sides have ships - Continue to next round</p>
              <Button
                onClick={() => {
                  addLog(`Space Combat Round ${round} complete - Starting Round ${round + 1}`);
                  setCombatState(prev => ({
                    ...prev,
                    spaceCombatRound: prev.spaceCombatRound + 1,
                    currentStep: 'P2.1',
                    attacker: { ...prev.attacker!, hasAnnouncedRetreat: false },
                    defender: { ...prev.defender!, hasAnnouncedRetreat: false },
                  }));
                }}
                variant="primary"
              >
                Next Combat Round (Round {round + 1})
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ========================================================================
  // PHASE 3: INVASION / BOMBARDMENT
  // ========================================================================

  const renderPhase3 = () => {
    const step = combatState.currentStep;

    // P3.1: Bombardment Declaration
    if (step === 'P3.1') {
      return (
        <div className={styles.stepContent}>
          <h3>P3.1 — Bombardment Declaration</h3>
          <p>Bombardment is optional. The attacker may choose to bombard planets before committing ground forces.</p>
          <p className={styles.infoNote}>
            Bombardment rolls are NOT affected by standard combat roll modifiers.
          </p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Attacker chooses to bombard');
                goToStep('P3.2');
              }}
              variant="primary"
            >
              Bombard
            </Button>

            <Button
              onClick={() => {
                addLog('Skip Bombardment');
                setCombatState(prev => ({ ...prev, bombardmentComplete: true }));
                goToStep('P3.7');
              }}
              variant="secondary"
            >
              Skip Bombardment
            </Button>
          </div>
        </div>
      );
    }

    // P3.2: Bombardment Target Selection
    if (step === 'P3.2') {
      return (
        <div className={styles.stepContent}>
          <h3>P3.2 — Bombardment Target Selection</h3>
          <p>Select which planet(s) to target and which units will bombard.</p>
          <p className={styles.infoNote}>
            Planetary Shield prevents Bombardment unless ignored (e.g., War Sun).
          </p>

          <div className={styles.placeholder}>
            Planet/unit selection UI placeholder
          </div>

          <Button
            onClick={() => {
              addLog('Bombardment targets selected');
              goToStep('P3.3');
            }}
            variant="primary"
          >
            Confirm Targets
          </Button>
        </div>
      );
    }

    // P3.3: Defender Bombardment Response
    if (step === 'P3.3') {
      return (
        <div className={styles.stepContent}>
          <h3>P3.3 — Defender Bombardment Response</h3>
          <p>Before Bombardment rolls, defender may respond with action cards.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No Bombardment response');
                goToStep('P3.4');
              }}
              variant="primary"
            >
              Continue (No Response)
            </Button>

            <Button
              onClick={() => {
                addLog('BUNKER played - Apply -4 to all Bombardment rolls');
                setCombatState(prev => ({
                  ...prev,
                  defender: {
                    ...prev.defender!,
                    actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'bunker'],
                  },
                }));
                goToStep('P3.4');
              }}
              variant="secondary"
            >
              Play BUNKER (-4 to Bombardment)
            </Button>
          </div>
        </div>
      );
    }

    // P3.4: Bombardment Rolls
    if (step === 'P3.4') {
      return (
        <div className={styles.stepContent}>
          <h3>P3.4 — Bombardment Rolls</h3>
          <p>Execute Bombardment dice rolls for each bombarding unit.</p>

          <div className={styles.inputGroup}>
            <label>Bombardment Hits:</label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              onChange={(e) => {
                const hits = parseInt(e.target.value) || 0;
                setCombatState(prev => ({
                  ...prev,
                  defender: { ...prev.defender!, queuedHits: hits },
                }));
              }}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog(`Bombardment rolls complete: ${combatState.defender.queuedHits} hits`);
                goToStep('P3.5');
              }}
              variant="primary"
            >
              Continue to Hit Assignment
            </Button>

            <Button
              onClick={() => {
                addLog('SCRAMBLE FREQUENCY - Reroll Bombardment dice');
              }}
              variant="secondary"
            >
              Play SCRAMBLE FREQUENCY
            </Button>

            <Button
              onClick={() => {
                addLog('BLITZ Ω - Gives Bombardment 6 to non-fighter ships');
              }}
              variant="secondary"
            >
              Play BLITZ Ω
            </Button>
          </div>
        </div>
      );
    }

    // P3.5: Bombardment Hit Assignment
    if (step === 'P3.5') {
      const hits = combatState.defender.queuedHits;

      return (
        <div className={styles.stepContent}>
          <h3>P3.5 — Bombardment Hit Assignment</h3>
          <p>Assign Bombardment hits to defender's ground forces on targeted planets.</p>

          <div className={styles.inputGroup}>
            <label>Defender Ground Forces Destroyed:</label>
            <input type="number" min="0" max={hits} defaultValue="0" />
          </div>

          <div className={styles.inputGroup}>
            <label>Mechs Using Sustain Damage:</label>
            <input type="number" min="0" max={hits} defaultValue="0" />
          </div>

          <Button
            onClick={() => {
              addLog('Bombardment hits assigned');
              setCombatState(prev => ({
                ...prev,
                defender: { ...prev.defender!, queuedHits: 0 },
                bombardmentComplete: true,
              }));
              goToStep('P3.6');
            }}
            variant="primary"
          >
            Confirm Hit Assignment
          </Button>
        </div>
      );
    }

    // P3.6: Invasion Continuation Check
    if (step === 'P3.6') {
      const defenderHasGroundForces = true; // Placeholder

      return (
        <div className={styles.stepContent}>
          <h3>P3.6 — Invasion Continuation Check</h3>
          <p>Check if defender has remaining ground forces.</p>

          {!defenderHasGroundForces ? (
            <div>
              <p>No defender ground forces remain - Attacker may land unopposed</p>
              <Button
                onClick={() => {
                  addLog('Attacker lands unopposed');
                  goToPhase(Phase.GROUND_COMBAT, 'P4.6');
                }}
                variant="primary"
              >
                Establish Control
              </Button>
            </div>
          ) : (
            <div>
              <p>Defender has ground forces - Proceed to ground force commitment</p>
              <Button
                onClick={() => {
                  addLog('Proceeding to ground force commitment');
                  goToStep('P3.7');
                }}
                variant="primary"
              >
                Commit Ground Forces
              </Button>
            </div>
          )}
        </div>
      );
    }

    // P3.7: Commit Ground Forces
    if (step === 'P3.7') {
      return (
        <div className={styles.stepContent}>
          <h3>P3.7 — Commit Ground Forces</h3>
          <p>Attacker commits ground forces (Infantry, Mechs) from space to planets containing enemy ground forces.</p>

          <div className={styles.placeholder}>
            Ground force selection UI placeholder
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Ground forces committed');
                goToStep('P3.8');
              }}
              variant="primary"
            >
              Confirm Commitment
            </Button>

            <Button
              onClick={() => {
                addLog('Skip ground force commitment - End invasion');
                setCombatState(prev => ({
                  ...prev,
                  isComplete: true,
                  winner: 'attacker',
                  invasionComplete: true,
                }));
              }}
              variant="secondary"
            >
              Skip Commitment (End Combat)
            </Button>
          </div>
        </div>
      );
    }

    // P3.8: Defender Landing Response
    if (step === 'P3.8') {
      return (
        <div className={styles.stepContent}>
          <h3>P3.8 — Defender Landing Response</h3>
          <p>After attacker commits ground forces, defender may respond with action cards.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No landing response');
                goToStep('P3.9');
              }}
              variant="primary"
            >
              Continue (No Response)
            </Button>

            <Button
              onClick={() => {
                addLog('PARLEY played - Return committed ground forces to space');
                setCombatState(prev => ({
                  ...prev,
                  defender: {
                    ...prev.defender!,
                    actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'parley'],
                  },
                }));
              }}
              variant="secondary"
            >
              Play PARLEY
            </Button>

            <Button
              onClick={() => {
                addLog('PAX played - Return ground forces and destroy one');
                setCombatState(prev => ({
                  ...prev,
                  defender: {
                    ...prev.defender!,
                    actionCardsPlayed: [...prev.defender!.actionCardsPlayed, 'pax'],
                  },
                }));
              }}
              variant="secondary"
            >
              Play PAX
            </Button>

            <Button
              onClick={() => {
                addLog('GHOST SQUAD Ω - Move ground forces between planets');
              }}
              variant="secondary"
            >
              Use GHOST SQUAD Ω
            </Button>
          </div>
        </div>
      );
    }

    // P3.9: Space Cannon Defense
    if (step === 'P3.9') {
      return (
        <div className={styles.stepContent}>
          <h3>P3.9 — Space Cannon Defense (SCD)</h3>
          <p>Defender's PDS units may fire against attacker's committed ground forces.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Defender passes on Space Cannon Defense');
                goToStep('P3.10');
              }}
              variant="primary"
            >
              Pass (No SCD)
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Fire'} Space Cannon Defense
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <div className={styles.inputGroup}>
                <label>SCD Hits on Attacker Ground Forces:</label>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  onChange={(e) => {
                    const hits = parseInt(e.target.value) || 0;
                    setCombatState(prev => ({
                      ...prev,
                      attacker: { ...prev.attacker!, queuedHits: hits },
                    }));
                  }}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Ground Forces Destroyed:</label>
                <input type="number" min="0" defaultValue="0" />
              </div>

              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('Space Cannon Defense complete');
                    setCombatState(prev => ({
                      ...prev,
                      attacker: { ...prev.attacker!, queuedHits: 0 },
                    }));
                    goToStep('P3.10');
                  }}
                  variant="primary"
                >
                  Confirm SCD Results
                </Button>

                <Button
                  onClick={() => {
                    addLog('CRASH LANDING - Place 1 ground force on planet');
                  }}
                  variant="secondary"
                >
                  Play CRASH LANDING
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // P3.10: Ground Combat Trigger Check
    if (step === 'P3.10') {
      const attackerHasGroundForces = true; // Placeholder

      return (
        <div className={styles.stepContent}>
          <h3>P3.10 — Ground Combat Trigger Check</h3>
          <p>Check if attacker has remaining ground forces on the planet.</p>

          {!attackerHasGroundForces ? (
            <div>
              <p>Attacker has no ground forces - Invasion fails</p>
              <Button
                onClick={() => {
                  setCombatState(prev => ({
                    ...prev,
                    isComplete: true,
                    winner: 'defender',
                    invasionComplete: true,
                  }));
                }}
                variant="primary"
              >
                End Combat (Invasion Failed)
              </Button>
            </div>
          ) : (
            <div>
              <p>Attacker has ground forces - Proceed to Ground Combat</p>
              <Button
                onClick={() => {
                  addLog('Proceeding to Ground Combat');
                  setCombatState(prev => ({ ...prev, invasionComplete: true }));
                  goToPhase(Phase.GROUND_COMBAT, 'P4.1');
                }}
                variant="primary"
              >
                Proceed to Ground Combat
              </Button>
            </div>
          )}
        </div>
      );
    }

    return null;
  };

  // ========================================================================
  // PHASE 4: GROUND COMBAT
  // ========================================================================

  const renderPhase4 = () => {
    const step = combatState.currentStep;
    const round = combatState.groundCombatRound;

    // P4.1: Start of Ground Combat Round
    if (step === 'P4.1') {
      return (
        <div className={styles.stepContent}>
          <h3>P4.1 — Start of Ground Combat Round {round}</h3>
          <p>Resolve abilities that trigger at the start of a ground combat round.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No start of ground combat abilities');
                goToStep('P4.2');
              }}
              variant="primary"
            >
              Continue (No Abilities)
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Show'} Ground Combat Abilities
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <p className={styles.abilityNote}>Available abilities:</p>
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('Yin Indoctrination - Spend 2 Influence to replace opponent infantry');
                    setCombatState(prev => ({
                      ...prev,
                      attacker: {
                        ...prev.attacker!,
                        abilitiesUsed: [...prev.attacker!.abilitiesUsed, 'yin_indoctrination'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Yin Indoctrination
                </Button>

                <Button
                  onClick={() => {
                    addLog('Sol Commander - Place 1 infantry from reinforcements');
                    setCombatState(prev => ({
                      ...prev,
                      attacker: {
                        ...prev.attacker!,
                        abilitiesUsed: [...prev.attacker!.abilitiesUsed, 'sol_commander'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Sol Commander (Claire Gibson)
                </Button>

                <Button
                  onClick={() => {
                    addLog('Magen Defense Grid ΩΩ - Produces 1 hit');
                    setCombatState(prev => ({
                      ...prev,
                      attacker: { ...prev.attacker!, queuedHits: prev.attacker.queuedHits + 1 },
                    }));
                  }}
                  variant="secondary"
                >
                  Magen Defense Grid ΩΩ
                </Button>

                <Button
                  onClick={() => {
                    addLog('Arborec Mech - Deploy after tactical action');
                  }}
                  variant="secondary"
                >
                  Arborec Mech Deploy
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // P4.2: Ground Combat Rolls
    if (step === 'P4.2') {
      return (
        <div className={styles.stepContent}>
          <h3>P4.2 — Ground Combat Rolls (Round {round})</h3>
          <p>Both players roll dice for all participating ground forces.</p>

          <div className={styles.inputGroup}>
            <label>Attacker Hits:</label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              onChange={(e) => {
                const hits = parseInt(e.target.value) || 0;
                setCombatState(prev => ({
                  ...prev,
                  defender: { ...prev.defender!, queuedHits: hits },
                  attacker: { ...prev.attacker!, hitsProduced: hits },
                }));
              }}
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Defender Hits:</label>
            <input
              type="number"
              min="0"
              defaultValue="0"
              onChange={(e) => {
                const hits = parseInt(e.target.value) || 0;
                setCombatState(prev => ({
                  ...prev,
                  attacker: { ...prev.attacker!, queuedHits: hits },
                  defender: { ...prev.defender!, hitsProduced: hits },
                }));
              }}
            />
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog(`Ground combat rolls: Attacker ${combatState.attacker.hitsProduced} hits, Defender ${combatState.defender.hitsProduced} hits`);
                goToStep('P4.3');
              }}
              variant="primary"
            >
              Continue to Hit Assignment
            </Button>

            <Button
              onClick={() => {
                addLog('FIRE TEAM - Reroll any number of dice');
              }}
              variant="secondary"
            >
              Play FIRE TEAM
            </Button>

            <Button
              onClick={() => {
                addLog('Sol Agent (Evelyn Delouis) - Roll 1 additional die');
              }}
              variant="secondary"
            >
              Use Sol Agent
            </Button>

            <Button
              onClick={() => {
                addLog('Jol-Nar Modifier: -1 to all ground combat rolls');
              }}
              variant="secondary"
            >
              Apply Jol-Nar Modifier
            </Button>

            <Button
              onClick={() => {
                addLog('Sardakk N\'orr Modifier: +1 to all combat rolls');
              }}
              variant="secondary"
            >
              Apply Sardakk N'orr Modifier
            </Button>
          </div>
        </div>
      );
    }

    // P4.3: Ground Combat Hit Assignment
    if (step === 'P4.3') {
      const attackerHits = combatState.attacker.queuedHits;
      const defenderHits = combatState.defender.queuedHits;

      return (
        <div className={styles.stepContent}>
          <h3>P4.3 — Ground Combat Hit Assignment (Round {round})</h3>
          <p>Both players assign hits to their opponent's ground forces simultaneously.</p>

          <div className={styles.hitAssignment}>
            <div>
              <h4>Attacker took {attackerHits} hits</h4>
              <div className={styles.inputGroup}>
                <label>Ground Forces Destroyed:</label>
                <input type="number" min="0" max={attackerHits} defaultValue="0" />
              </div>
              <div className={styles.inputGroup}>
                <label>Mechs Using Sustain Damage:</label>
                <input type="number" min="0" max={attackerHits} defaultValue="0" />
              </div>
            </div>

            <div>
              <h4>Defender took {defenderHits} hits</h4>
              <div className={styles.inputGroup}>
                <label>Ground Forces Destroyed:</label>
                <input type="number" min="0" max={defenderHits} defaultValue="0" />
              </div>
              <div className={styles.inputGroup}>
                <label>Mechs Using Sustain Damage:</label>
                <input type="number" min="0" max={defenderHits} defaultValue="0" />
              </div>
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Ground combat hits assigned');
                setCombatState(prev => ({
                  ...prev,
                  attacker: { ...prev.attacker!, queuedHits: 0, hitsProduced: 0 },
                  defender: { ...prev.defender!, queuedHits: 0, hitsProduced: 0 },
                }));
                goToStep('P4.4');
              }}
              variant="primary"
            >
              Confirm Hit Assignment
            </Button>

            <Button
              onClick={() => {
                addLog('Mentak Mech (Moll Terminus) - Opponent ground forces cannot use SD');
              }}
              variant="secondary"
            >
              Use Mentak Mech Ability
            </Button>

            <Button
              onClick={() => {
                addLog('Sardakk Valkyrie Particle Weave - Produce 1 additional hit');
              }}
              variant="secondary"
            >
              Use Valkyrie Particle Weave
            </Button>
          </div>
        </div>
      );
    }

    // P4.4: L1Z1X Harrow Check
    if (step === 'P4.4') {
      return (
        <div className={styles.stepContent}>
          <h3>P4.4 — L1Z1X Harrow Check</h3>
          <p>If L1Z1X is present, their ships may use Bombardment again after the round ends.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No Harrow ability');
                goToStep('P4.5');
              }}
              variant="primary"
            >
              Continue (No Harrow)
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Use'} L1Z1X Harrow
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <div className={styles.inputGroup}>
                <label>Harrow Bombardment Hits:</label>
                <input
                  type="number"
                  min="0"
                  defaultValue="0"
                  onChange={(e) => {
                    const hits = parseInt(e.target.value) || 0;
                    setCombatState(prev => ({
                      ...prev,
                      defender: { ...prev.defender!, queuedHits: hits },
                    }));
                  }}
                />
              </div>

              <div className={styles.inputGroup}>
                <label>Ground Forces Destroyed:</label>
                <input type="number" min="0" defaultValue="0" />
              </div>

              <Button
                onClick={() => {
                  addLog('L1Z1X Harrow used');
                  setCombatState(prev => ({
                    ...prev,
                    defender: { ...prev.defender!, queuedHits: 0 },
                  }));
                  goToStep('P4.5');
                }}
                variant="primary"
              >
                Confirm Harrow
              </Button>
            </div>
          )}
        </div>
      );
    }

    // P4.5: Ground Combat Continuation Check
    if (step === 'P4.5') {
      // In real implementation, would check actual unit counts
      const attackerHasGroundForces = true; // Placeholder
      const defenderHasGroundForces = true; // Placeholder

      return (
        <div className={styles.stepContent}>
          <h3>P4.5 — Ground Combat Continuation Check (Round {round})</h3>
          <p>Evaluate whether ground combat continues or ends.</p>

          <div className={styles.combatStatus}>
            <p>Attacker has ground forces: {attackerHasGroundForces ? 'Yes' : 'No'}</p>
            <p>Defender has ground forces: {defenderHasGroundForces ? 'Yes' : 'No'}</p>
          </div>

          {!attackerHasGroundForces && !defenderHasGroundForces ? (
            <div>
              <p>All ground forces destroyed - Defender retains control</p>
              <Button
                onClick={() => {
                  setCombatState(prev => ({
                    ...prev,
                    isComplete: true,
                    winner: 'defender',
                    groundCombatComplete: true,
                  }));
                }}
                variant="primary"
              >
                End Combat (Defender Retains)
              </Button>
            </div>
          ) : !attackerHasGroundForces ? (
            <div>
              <p>Attacker eliminated - Defender wins</p>
              <Button
                onClick={() => {
                  setCombatState(prev => ({
                    ...prev,
                    isComplete: true,
                    winner: 'defender',
                    groundCombatComplete: true,
                  }));
                }}
                variant="primary"
              >
                End Combat (Defender Wins)
              </Button>
            </div>
          ) : !defenderHasGroundForces ? (
            <div>
              <p>Defender eliminated - Attacker establishes control</p>
              <Button
                onClick={() => {
                  addLog('Defender eliminated - Attacker establishes control');
                  goToStep('P4.6');
                }}
                variant="primary"
              >
                Establish Control
              </Button>
            </div>
          ) : (
            <div>
              <p>Both sides have ground forces - Continue to next round</p>
              <Button
                onClick={() => {
                  addLog(`Ground Combat Round ${round} complete - Starting Round ${round + 1}`);
                  setCombatState(prev => ({
                    ...prev,
                    groundCombatRound: prev.groundCombatRound + 1,
                    currentStep: 'P4.1',
                  }));
                }}
                variant="primary"
              >
                Next Ground Combat Round (Round {round + 1})
              </Button>
            </div>
          )}
        </div>
      );
    }

    // P4.6: Establish Control
    if (step === 'P4.6') {
      return (
        <div className={styles.stepContent}>
          <h3>P4.6 — Establish Control</h3>
          <p>Attacker gains control of the planet. The planet is exhausted upon gaining control.</p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Attacker establishes control - Proceeding to Post-Combat');
                setCombatState(prev => ({ ...prev, groundCombatComplete: true }));
                goToPhase(Phase.POST_COMBAT, 'PC.1');
              }}
              variant="primary"
            >
              Establish Control
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Show'} Post-Control Actions
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <p className={styles.abilityNote}>Post-control abilities:</p>
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('INFILTRATE - Replace defender structures');
                    setCombatState(prev => ({
                      ...prev,
                      attacker: {
                        ...prev.attacker!,
                        actionCardsPlayed: [...prev.attacker!.actionCardsPlayed, 'infiltrate'],
                      },
                    }));
                  }}
                  variant="secondary"
                >
                  Play INFILTRATE
                </Button>

                <Button
                  onClick={() => {
                    addLog('L1Z1X Assimilate - Replace defender structures');
                  }}
                  variant="secondary"
                >
                  Use L1Z1X Assimilate
                </Button>

                <Button
                  onClick={() => {
                    addLog('REPARATIONS - Exhaust opponent planet, ready your planet');
                  }}
                  variant="secondary"
                >
                  Play REPARATIONS
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
  // PHASE 5: POST-COMBAT
  // ========================================================================

  const renderPhase5 = () => {
    const { currentStep: step } = combatState;
    const [showAbilityList, setShowAbilityList] = useState(false);

    // PC.1: Faction-Specific Triggers
    if (step === 'PC.1') {
      return (
        <div className={styles.stepContent}>
          <h3>PC.1 — Faction-Specific Triggers</h3>
          <p>
            Resolve any post-combat faction abilities or effects that trigger after combat ends.
          </p>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('No faction triggers - Proceeding to capacity check');
                goToStep('PC.2');
              }}
              variant="primary"
            >
              Continue to Capacity Check
            </Button>

            <Button
              onClick={() => setShowAbilityList(!showAbilityList)}
              variant="secondary"
            >
              {showAbilityList ? 'Hide' : 'Show'} Faction Triggers
            </Button>
          </div>

          {showAbilityList && (
            <div className={styles.nestedAbilities}>
              <p className={styles.abilityNote}>Post-combat faction abilities:</p>
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    addLog('Vuil\'raith Cabal - Capturing units (place them on Dimensional Tear)');
                  }}
                  variant="secondary"
                >
                  Use Vuil'raith Cabal Capture
                </Button>

                <Button
                  onClick={() => {
                    addLog('Mentak Coalition - Salvage Operations (gain trade goods from destroyed ships)');
                  }}
                  variant="secondary"
                >
                  Use Mentak Salvage Operations
                </Button>
              </div>
            </div>
          )}
        </div>
      );
    }

    // PC.2: Capacity Check
    if (step === 'PC.2') {
      return (
        <div className={styles.stepContent}>
          <h3>PC.2 — Capacity Check</h3>
          <p>
            The winner must ensure they have sufficient capacity for all fighters and ground forces in the system.
          </p>

          <div className={styles.infoNote}>
            <p><strong>Capacity Rules:</strong></p>
            <ul>
              <li>Each Carrier provides 4 capacity (6 with Carrier II upgrade)</li>
              <li>Each Dreadnought provides 1 capacity</li>
              <li>Each War Sun provides 6 capacity</li>
              <li>If capacity is exceeded, excess units must be removed immediately</li>
            </ul>
          </div>

          <div className={styles.placeholder}>
            <p>
              Future enhancement: Automatic capacity calculation and unit removal interface
            </p>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                addLog('Capacity check complete - All units within capacity limits');
                goToStep('PC.3');
              }}
              variant="primary"
            >
              Capacity is Sufficient
            </Button>

            <Button
              onClick={() => {
                addLog('WARNING: Capacity exceeded - Removing excess units');
                // In a full implementation, this would open a unit removal UI
                goToStep('PC.3');
              }}
              variant="danger"
            >
              Remove Excess Units
            </Button>
          </div>
        </div>
      );
    }

    // PC.3: Combat Complete
    if (step === 'PC.3') {
      const determineWinner = () => {
        // Determine winner based on combat outcome
        // This is a simplified version - full logic would check multiple conditions
        if (combatState.spaceCombatComplete && combatState.attacker?.spaceForces?.ships?.length === 0) {
          return 'defender';
        }
        if (combatState.groundCombatComplete) {
          return 'attacker'; // Attacker controls planet
        }
        if (combatState.defenderRetreated) {
          return 'attacker';
        }
        if (combatState.attackerRetreated) {
          return 'defender';
        }
        return 'attacker'; // Default
      };

      return (
        <div className={styles.stepContent}>
          <h3>PC.3 — Combat Complete</h3>
          <p>
            All combat resolution is complete. The combat will now be finalized and recorded.
          </p>

          <div className={styles.infoNote}>
            <p><strong>Combat Summary:</strong></p>
            <ul>
              <li>Space Combat: {combatState.spaceCombatComplete ? 'Complete' : 'Not fought'}</li>
              <li>Space Combat Rounds: {combatState.spaceCombatRound}</li>
              <li>Ground Combat: {combatState.groundCombatComplete ? 'Complete' : 'Not fought'}</li>
              <li>Ground Combat Rounds: {combatState.groundCombatRound}</li>
              <li>Attacker Retreated: {combatState.attackerRetreated ? 'Yes' : 'No'}</li>
              <li>Defender Retreated: {combatState.defenderRetreated ? 'Yes' : 'No'}</li>
            </ul>
          </div>

          <div className={styles.buttonGroup}>
            <Button
              onClick={() => {
                const winner = determineWinner();
                addLog(`Combat Complete - ${winner === 'attacker' ? 'Attacker' : 'Defender'} Wins`);
                setCombatState(prev => ({
                  ...prev,
                  isComplete: true,
                  winner,
                }));
              }}
              variant="primary"
            >
              Complete Combat
            </Button>
          </div>
        </div>
      );
    }

    return null;
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
