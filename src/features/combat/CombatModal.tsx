import { useState, useEffect } from 'react';
import { Panel, Button } from '@/components/common';
import styles from './CombatModal.module.css';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type CombatPhase = 0 | 1 | 2 | 3 | 4;

export interface CombatParticipant {
  playerId: string;
  playerName: string;
  factionId: string;
  // Units
  ships: number;
  fighters: number;
  nonFighterShips: number;
  groundForces: number;
  infantry: number;
  mechs: number;
  pds: number;
  // Combat state
  hits: number;
  sustainDamageUsed: number;
  // Modifiers
  combatModifier: number;
}

export interface CombatState {
  // Basic info
  gameId: string;
  systemId: string;
  attackerId: string;
  defenderId: string;

  // Participants
  attacker: CombatParticipant;
  defender: CombatParticipant;

  // Flow control
  currentPhase: CombatPhase;
  currentStep: number;
  combatRound: number;

  // Phase-specific state
  spaceCombatComplete: boolean;
  defenderRetreatAnnounced: boolean;
  attackerRetreatAnnounced: boolean;
  bombardmentComplete: boolean;
  groundCombatPlanet: string | null;

  // Action cards & abilities used
  actionCardsUsed: string[];
  abilitiesUsed: string[];

  // Combat log
  log: string[];

  // Completion state
  isComplete: boolean;
  winner: 'attacker' | 'defender' | null;
}

// ============================================================================
// COMBAT MODAL COMPONENT
// ============================================================================

interface CombatModalProps {
  gameId: string;
  attackerId: string;
  defenderId: string;
  attackerName: string;
  defenderName: string;
  attackerFactionId: string;
  defenderFactionId: string;
  onClose: () => void;
  onComplete: (result: { winner: 'attacker' | 'defender' | null }) => void;
  initialState?: CombatState;
}

export function CombatModal({
  gameId,
  attackerId,
  defenderId,
  attackerName,
  defenderName,
  attackerFactionId,
  defenderFactionId,
  onClose,
  onComplete,
  initialState,
}: CombatModalProps) {
  // Initialize combat state
  const [combatState, setCombatState] = useState<CombatState>(() => {
    if (initialState) return initialState;

    return {
      gameId,
      systemId: 'temp-system', // TODO: Get from actual system
      attackerId,
      defenderId,
      attacker: {
        playerId: attackerId,
        playerName: attackerName,
        factionId: attackerFactionId,
        ships: 5,
        fighters: 3,
        nonFighterShips: 2,
        groundForces: 4,
        infantry: 3,
        mechs: 1,
        pds: 0,
        hits: 0,
        sustainDamageUsed: 0,
        combatModifier: 0,
      },
      defender: {
        playerId: defenderId,
        playerName: defenderName,
        factionId: defenderFactionId,
        ships: 4,
        fighters: 2,
        nonFighterShips: 2,
        groundForces: 3,
        infantry: 2,
        mechs: 1,
        pds: 1,
        hits: 0,
        sustainDamageUsed: 0,
        combatModifier: 0,
      },
      currentPhase: 0,
      currentStep: 0,
      combatRound: 1,
      spaceCombatComplete: false,
      defenderRetreatAnnounced: false,
      attackerRetreatAnnounced: false,
      bombardmentComplete: false,
      groundCombatPlanet: null,
      actionCardsUsed: [],
      abilitiesUsed: [],
      log: ['Combat initiated'],
      isComplete: false,
      winner: null,
    };
  });

  // Save state to localStorage for persistence
  useEffect(() => {
    if (!combatState.isComplete) {
      localStorage.setItem(`combat_${gameId}`, JSON.stringify(combatState));
    } else {
      localStorage.removeItem(`combat_${gameId}`);
    }
  }, [combatState, gameId]);

  // Helper to add log entry
  const addLog = (message: string) => {
    setCombatState(prev => ({
      ...prev,
      log: [...prev.log, message],
    }));
  };

  // Helper to advance to next step
  const advanceStep = () => {
    setCombatState(prev => ({
      ...prev,
      currentStep: prev.currentStep + 1,
    }));
  };

  // Helper to advance to next phase
  const advancePhase = (newPhase: CombatPhase, resetStep = true) => {
    setCombatState(prev => ({
      ...prev,
      currentPhase: newPhase,
      currentStep: resetStep ? 0 : prev.currentStep,
    }));
  };

  // ============================================================================
  // PHASE 0: SYSTEM ACTIVATION AND MOVEMENT COMPLETE
  // ============================================================================

  const renderPhase0 = () => {
    const step = combatState.currentStep;
    const [showPreCombatAbilities, setShowPreCombatAbilities] = useState(false);

    return (
      <div className={styles.phaseContent}>
        <h2>Phase 0: System Activation</h2>
        <p>The Attacker has completed movement into a system containing opponent ships.</p>

        {step === 0 && (
          <div className={styles.stepContent}>
            <h3>Step 0.1: Pre-Combat Abilities</h3>
            <p>Check for abilities that trigger "After a player activates a system that contains your units"</p>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  addLog('Phase 0: No pre-combat abilities used');
                  advanceStep();
                }}
                variant="primary"
              >
                No Abilities to Use
              </Button>

              <Button
                onClick={() => setShowPreCombatAbilities(!showPreCombatAbilities)}
                variant="secondary"
              >
                {showPreCombatAbilities ? 'Hide' : 'Show'} Pre-Combat Abilities
              </Button>
            </div>

            {showPreCombatAbilities && (
              <div className={styles.nestedAbilities}>
                <p className={styles.abilityNote}>Select the ability being used:</p>
                <div className={styles.buttonGroup}>
                  <Button
                    onClick={() => {
                      addLog('Phase 0: Yssaril Commander (So Ata) - Inspect hand/objectives');
                      setCombatState(prev => ({
                        ...prev,
                        abilitiesUsed: [...prev.abilitiesUsed, 'yssaril_commander'],
                      }));
                      setShowPreCombatAbilities(false);
                      advanceStep();
                    }}
                    variant="secondary"
                  >
                    Yssaril Commander (Inspect)
                  </Button>

                  <Button
                    onClick={() => {
                      addLog('Phase 0: Jol-Nar E-Res Siphons - Gain 4 TG');
                      setCombatState(prev => ({
                        ...prev,
                        abilitiesUsed: [...prev.abilitiesUsed, 'jolnar_eres_siphons'],
                      }));
                      setShowPreCombatAbilities(false);
                      advanceStep();
                    }}
                    variant="secondary"
                  >
                    Jol-Nar E-Res Siphons (+4 TG)
                  </Button>

                  <Button
                    onClick={() => {
                      addLog('Phase 0: Xxcha Nullification Field - End attacker turn (COMBAT ENDS)');
                      setCombatState(prev => ({
                        ...prev,
                        abilitiesUsed: [...prev.abilitiesUsed, 'xxcha_nullification'],
                        isComplete: true,
                        winner: 'defender',
                      }));
                    }}
                    variant="secondary"
                  >
                    Xxcha Nullification Field (End Turn)
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepContent}>
            <h3>Pre-Combat Abilities Resolved</h3>
            <p>Proceeding to Space Cannon Offense phase...</p>

            <Button
              onClick={() => {
                addLog('Advancing to Phase I: Space Cannon Offense');
                advancePhase(1);
              }}
              variant="primary"
            >
              Proceed to Space Cannon Offense
            </Button>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // PHASE I: SPACE CANNON OFFENSE
  // ============================================================================

  const renderPhaseI = () => {
    const step = combatState.currentStep;
    const { attacker, defender } = combatState;

    return (
      <div className={styles.phaseContent}>
        <h2>Phase I: Space Cannon Offense</h2>
        <div className={styles.combatStatus}>
          <div>Attacker Ships: {attacker.ships} | Defender Ships: {defender.ships}</div>
        </div>

        {step === 0 && (
          <div className={styles.stepContent}>
            <h3>Step I.1: Pre-SCO Abilities</h3>
            <p>Can defender play Action Cards that cancel Space Cannon?</p>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                No Action Cards
              </Button>

              <Button
                onClick={() => {
                  addLog('Defender plays DISABLE - PDS cannot fire');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'disable'],
                  }));
                  // Skip to end of SCO
                  setCombatState(prev => ({ ...prev, currentStep: 5 }));
                }}
                variant="secondary"
              >
                Play DISABLE (Cancel PDS)
              </Button>

              <Button
                onClick={() => {
                  addLog('Attacker plays SOLAR FLARE Ω - Ignore Space Cannon');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'solar_flare'],
                  }));
                  setCombatState(prev => ({ ...prev, currentStep: 5 }));
                }}
                variant="secondary"
              >
                Play SOLAR FLARE Ω (Ignore SC)
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepContent}>
            <h3>Step I.2: Defender Space Cannon Rolls</h3>
            <p>Defender fires Space Cannon at Attacker's ships</p>

            <div className={styles.inputGroup}>
              <label>Defender SCO Hits:</label>
              <input
                type="number"
                min="0"
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: { ...prev.attacker, hits: hits },
                  }));
                }}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                Continue
              </Button>

              <Button
                onClick={() => {
                  addLog('Attacker plays SCRAMBLE FREQUENCY - Reroll SCO');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'scramble_frequency'],
                  }));
                }}
                variant="secondary"
              >
                Play SCRAMBLE FREQUENCY (Reroll)
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h3>Step I.3: Attacker Space Cannon Rolls</h3>
            <p>Attacker fires Space Cannon at Defender's ships (if any units have this ability)</p>

            <div className={styles.inputGroup}>
              <label>Attacker SCO Hits:</label>
              <input
                type="number"
                min="0"
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: { ...prev.defender, hits: hits },
                  }));
                }}
              />
            </div>

            <Button onClick={() => advanceStep()} variant="primary">
              Continue
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <h3>Step I.4: Assign Hits</h3>
            <p>Attacker took {attacker.hits} hits | Defender took {defender.hits} hits</p>
            <p>Assign hits and use Sustain Damage as needed</p>

            <div className={styles.inputGroup}>
              <label>Attacker Ships Destroyed:</label>
              <input
                type="number"
                min="0"
                max={attacker.ships}
                defaultValue="0"
                onBlur={(e) => {
                  const destroyed = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: { ...prev.attacker, ships: prev.attacker.ships - destroyed },
                  }));
                }}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Defender Ships Destroyed:</label>
              <input
                type="number"
                min="0"
                max={defender.ships}
                defaultValue="0"
                onBlur={(e) => {
                  const destroyed = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: { ...prev.defender, ships: prev.defender.ships - destroyed },
                  }));
                }}
              />
            </div>

            <Button onClick={() => advanceStep()} variant="primary">
              Continue
            </Button>
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepContent}>
            <h3>Step I.5: Ship Count Check</h3>
            <p>Attacker Ships: {attacker.ships} | Defender Ships: {defender.ships}</p>

            {attacker.ships === 0 && defender.ships === 0 ? (
              <>
                <p>Both sides destroyed - Combat ends</p>
                <Button
                  onClick={() => {
                    addLog('All ships destroyed - Combat ends');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: null }));
                  }}
                  variant="primary"
                >
                  End Combat
                </Button>
              </>
            ) : attacker.ships === 0 ? (
              <>
                <p>Attacker has no ships remaining - Defender wins, skip to Invasion check</p>
                <Button
                  onClick={() => {
                    addLog('Attacker eliminated - Combat ends');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: 'defender' }));
                  }}
                  variant="primary"
                >
                  End Combat (Defender Wins)
                </Button>
              </>
            ) : defender.ships === 0 ? (
              <>
                <p>Defender has no ships remaining - Skip Space Combat, proceed to Invasion</p>
                <Button
                  onClick={() => {
                    addLog('Defender ships eliminated - Skipping Space Combat');
                    advancePhase(3);
                  }}
                  variant="primary"
                >
                  Skip to Invasion Phase
                </Button>
              </>
            ) : (
              <>
                <p>Both sides have ships - Proceed to Space Combat</p>
                <Button
                  onClick={() => {
                    addLog('Proceeding to Space Combat');
                    advancePhase(2);
                  }}
                  variant="primary"
                >
                  Proceed to Space Combat
                </Button>
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div className={styles.stepContent}>
            <h3>Space Cannon Phase Skipped</h3>
            <p>Action card prevented Space Cannon fire</p>

            <Button
              onClick={() => {
                if (defender.ships === 0) {
                  advancePhase(3);
                } else {
                  advancePhase(2);
                }
              }}
              variant="primary"
            >
              Continue to Next Phase
            </Button>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // PHASE II: SPACE COMBAT
  // ============================================================================

  const renderPhaseII = () => {
    const step = combatState.currentStep;
    const { attacker, defender, combatRound } = combatState;

    return (
      <div className={styles.phaseContent}>
        <h2>Phase II: Space Combat - Round {combatRound}</h2>
        <div className={styles.combatStatus}>
          <div>Attacker Ships: {attacker.ships} | Defender Ships: {defender.ships}</div>
        </div>

        {step === 0 && (
          <div className={styles.stepContent}>
            <h3>Step II.1: Start of Combat Effects</h3>
            <p>{combatRound === 1 ? 'Before combat / Start of combat abilities' : 'Start of round abilities'}</p>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                No Abilities to Use
              </Button>

              {combatRound === 1 && (
                <>
                  <Button
                    onClick={() => {
                      addLog('Yin Impulse Core - Destroy 1 Destroyer/Cruiser for 1 hit');
                      setCombatState(prev => ({
                        ...prev,
                        abilitiesUsed: [...prev.abilitiesUsed, 'yin_impulse_core'],
                      }));
                      advanceStep();
                    }}
                    variant="secondary"
                  >
                    Yin Impulse Core
                  </Button>

                  <Button
                    onClick={() => {
                      addLog('Muaat Reveal Prototype - Research unit upgrade');
                      setCombatState(prev => ({
                        ...prev,
                        actionCardsUsed: [...prev.actionCardsUsed, 'reveal_prototype'],
                      }));
                      advanceStep();
                    }}
                    variant="secondary"
                  >
                    Muaat Reveal Prototype
                  </Button>

                  <Button
                    onClick={() => {
                      addLog('Argent Hero - Place flagship + up to 2 Cruisers/Destroyers');
                      setCombatState(prev => ({
                        ...prev,
                        abilitiesUsed: [...prev.abilitiesUsed, 'argent_hero'],
                      }));
                      advanceStep();
                    }}
                    variant="secondary"
                  >
                    Argent Hero (Defender)
                  </Button>
                </>
              )}
            </div>
          </div>
        )}

        {step === 1 && combatRound === 1 && (
          <div className={styles.stepContent}>
            <h3>Step II.2: Anti-Fighter Barrage (AFB)</h3>
            <p>Both players roll AFB dice simultaneously. Hits destroy fighters only.</p>

            <div className={styles.inputGroup}>
              <label>Attacker AFB Hits on Defender Fighters:</label>
              <input
                type="number"
                min="0"
                max={defender.fighters}
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: {
                      ...prev.defender,
                      fighters: Math.max(0, prev.defender.fighters - hits),
                      ships: Math.max(0, prev.defender.ships - hits),
                    },
                  }));
                }}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Defender AFB Hits on Attacker Fighters:</label>
              <input
                type="number"
                min="0"
                max={attacker.fighters}
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: {
                      ...prev.attacker,
                      fighters: Math.max(0, prev.attacker.fighters - hits),
                      ships: Math.max(0, prev.attacker.ships - hits),
                    },
                  }));
                }}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                Continue
              </Button>

              <Button
                onClick={() => {
                  addLog('WAYLAY - AFB hits all ships, not just fighters');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'waylay'],
                  }));
                }}
                variant="secondary"
              >
                Play WAYLAY
              </Button>
            </div>
          </div>
        )}

        {(step === 1 && combatRound > 1) || (step === 2 && combatRound === 1) ? (
          <div className={styles.stepContent}>
            <h3>Step II.3: Announce Retreats</h3>
            <p>Defender announces retreat first. If Defender retreats, Attacker cannot.</p>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  addLog('No retreats announced');
                  advanceStep();
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
                    defenderRetreatAnnounced: true,
                  }));
                  advanceStep();
                }}
                variant="secondary"
              >
                Defender Announces Retreat
              </Button>

              {!combatState.defenderRetreatAnnounced && (
                <Button
                  onClick={() => {
                    addLog('Attacker announces retreat');
                    setCombatState(prev => ({
                      ...prev,
                      attackerRetreatAnnounced: true,
                    }));
                    advanceStep();
                  }}
                  variant="secondary"
                >
                  Attacker Announces Retreat
                </Button>
              )}
            </div>
          </div>
        ) : null}

        {((step === 2 && combatRound > 1) || (step === 3 && combatRound === 1)) && (
          <div className={styles.stepContent}>
            <h3>Step II.4: Roll Dice</h3>
            <p>Attacker rolls first, then Defender. Apply modifiers and rerolls.</p>

            <div className={styles.inputGroup}>
              <label>Attacker Hits:</label>
              <input
                type="number"
                min="0"
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: { ...prev.defender, hits },
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
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: { ...prev.attacker, hits },
                  }));
                }}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                Continue to Assign Hits
              </Button>

              <Button
                onClick={() => {
                  addLog('SCRAMBLE FREQUENCY - Reroll opponent dice');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'scramble_frequency_combat'],
                  }));
                }}
                variant="secondary"
              >
                Play SCRAMBLE FREQUENCY
              </Button>
            </div>
          </div>
        )}

        {((step === 3 && combatRound > 1) || (step === 4 && combatRound === 1)) && (
          <div className={styles.stepContent}>
            <h3>Step II.5: Assign Hits</h3>
            <p>Attacker took {attacker.hits} hits | Defender took {defender.hits} hits</p>
            <p>Use Sustain Damage or destroy ships</p>

            <div className={styles.inputGroup}>
              <label>Attacker Ships Destroyed:</label>
              <input
                type="number"
                min="0"
                max={attacker.ships}
                defaultValue="0"
                onBlur={(e) => {
                  const destroyed = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: { ...prev.attacker, ships: prev.attacker.ships - destroyed },
                  }));
                }}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Defender Ships Destroyed:</label>
              <input
                type="number"
                min="0"
                max={defender.ships}
                defaultValue="0"
                onBlur={(e) => {
                  const destroyed = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: { ...prev.defender, ships: prev.defender.ships - destroyed },
                  }));
                }}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                Continue
              </Button>

              <Button
                onClick={() => {
                  addLog('DIRECT HIT - Destroy ship that used Sustain Damage');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'direct_hit'],
                  }));
                }}
                variant="secondary"
              >
                Play DIRECT HIT
              </Button>

              <Button
                onClick={() => {
                  addLog('EMERGENCY REPAIRS - Repair Sustain Damage units');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'emergency_repairs'],
                  }));
                }}
                variant="secondary"
              >
                Play EMERGENCY REPAIRS
              </Button>
            </div>
          </div>
        )}

        {((step === 4 && combatRound > 1) || (step === 5 && combatRound === 1)) && (
          <div className={styles.stepContent}>
            <h3>Step II.6: Combat End/Repeat/Retreat</h3>
            <p>Attacker Ships: {attacker.ships} | Defender Ships: {defender.ships}</p>

            {attacker.ships === 0 && defender.ships === 0 ? (
              <>
                <p>All ships destroyed - Combat ends</p>
                <Button
                  onClick={() => {
                    addLog('All ships destroyed in space combat');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: null }));
                  }}
                  variant="primary"
                >
                  End Combat
                </Button>
              </>
            ) : attacker.ships === 0 ? (
              <>
                <p>Attacker eliminated - Defender wins</p>
                <Button
                  onClick={() => {
                    addLog('Attacker eliminated in space combat');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: 'defender' }));
                  }}
                  variant="primary"
                >
                  End Combat (Defender Wins)
                </Button>
              </>
            ) : defender.ships === 0 ? (
              <>
                <p>Defender eliminated - Proceed to Invasion</p>
                <Button
                  onClick={() => {
                    addLog('Defender eliminated - Attacker wins space combat');
                    advancePhase(3);
                  }}
                  variant="primary"
                >
                  Proceed to Invasion
                </Button>
              </>
            ) : combatState.defenderRetreatAnnounced || combatState.attackerRetreatAnnounced ? (
              <>
                <p>{combatState.defenderRetreatAnnounced ? 'Defender' : 'Attacker'} retreats</p>
                <Button
                  onClick={() => {
                    addLog(`${combatState.defenderRetreatAnnounced ? 'Defender' : 'Attacker'} retreated`);
                    setCombatState(prev => ({
                      ...prev,
                      isComplete: true,
                      winner: combatState.defenderRetreatAnnounced ? 'attacker' : 'defender',
                    }));
                  }}
                  variant="primary"
                >
                  Execute Retreat (Combat Ends)
                </Button>
              </>
            ) : (
              <>
                <p>Both sides remain - Continue combat</p>
                <Button
                  onClick={() => {
                    addLog(`Space Combat Round ${combatRound} complete - Starting Round ${combatRound + 1}`);
                    setCombatState(prev => ({
                      ...prev,
                      combatRound: prev.combatRound + 1,
                      currentStep: 0,
                      defenderRetreatAnnounced: false,
                      attackerRetreatAnnounced: false,
                    }));
                  }}
                  variant="primary"
                >
                  Next Combat Round
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // PHASE III: INVASION
  // ============================================================================

  const renderPhaseIII = () => {
    const step = combatState.currentStep;
    const { attacker, defender } = combatState;

    return (
      <div className={styles.phaseContent}>
        <h2>Phase III: Invasion</h2>
        <div className={styles.combatStatus}>
          <div>Attacker Ground Forces: {attacker.groundForces} | Defender Ground Forces: {defender.groundForces}</div>
        </div>

        {step === 0 && (
          <div className={styles.stepContent}>
            <h3>Step III.1: Bombardment</h3>
            <p>Attacker may roll Bombardment dice against ground forces on planets</p>

            <div className={styles.inputGroup}>
              <label>Bombardment Hits on Defender Ground Forces:</label>
              <input
                type="number"
                min="0"
                max={defender.groundForces}
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: {
                      ...prev.defender,
                      groundForces: Math.max(0, prev.defender.groundForces - hits),
                    },
                  }));
                }}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  addLog('Bombardment complete');
                  advanceStep();
                }}
                variant="primary"
              >
                Continue
              </Button>

              <Button
                onClick={() => {
                  addLog('BUNKER - Apply -4 to Bombardment rolls');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'bunker'],
                  }));
                }}
                variant="secondary"
              >
                Play BUNKER
              </Button>

              <Button
                onClick={() => {
                  addLog('BLITZ Ω - Gives Bombardment 6 to non-fighter ships');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'blitz'],
                  }));
                }}
                variant="secondary"
              >
                Play BLITZ Ω
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepContent}>
            <h3>Step III.2: Commit Ground Forces</h3>
            <p>Attacker commits ground forces from space to planets</p>

            <div className={styles.inputGroup}>
              <label>Attacker Ground Forces Committed:</label>
              <input
                type="number"
                min="0"
                max={attacker.groundForces}
                defaultValue={attacker.groundForces}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  if (attacker.groundForces === 0) {
                    addLog('No ground forces committed - Skipping Ground Combat');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: 'attacker' }));
                  } else {
                    addLog('Ground forces committed');
                    advanceStep();
                  }
                }}
                variant="primary"
              >
                Continue
              </Button>

              <Button
                onClick={() => {
                  addLog('Skip Ground Force Commitment - End Combat');
                  setCombatState(prev => ({ ...prev, isComplete: true, winner: 'attacker' }));
                }}
                variant="secondary"
              >
                Skip Commitment (End Combat)
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h3>Step III.3: Space Cannon Defense (SCD)</h3>
            <p>Defender's PDS fires at committed ground forces</p>

            <div className={styles.inputGroup}>
              <label>PDS Hits on Attacker Ground Forces:</label>
              <input
                type="number"
                min="0"
                max={attacker.groundForces}
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: {
                      ...prev.attacker,
                      groundForces: Math.max(0, prev.attacker.groundForces - hits),
                    },
                  }));
                }}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  if (attacker.groundForces === 0) {
                    addLog('All attacker ground forces destroyed - Defender wins');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: 'defender' }));
                  } else if (defender.groundForces === 0) {
                    addLog('No defender ground forces - Attacker establishes control');
                    advancePhase(4);
                  } else {
                    addLog('Proceeding to Ground Combat');
                    advancePhase(4);
                  }
                }}
                variant="primary"
              >
                Continue
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // PHASE IV: GROUND COMBAT
  // ============================================================================

  const renderPhaseIV = () => {
    const step = combatState.currentStep;
    const { attacker, defender, combatRound } = combatState;

    return (
      <div className={styles.phaseContent}>
        <h2>Phase IV: Ground Combat - Round {combatRound}</h2>
        <div className={styles.combatStatus}>
          <div>Attacker Ground Forces: {attacker.groundForces} | Defender Ground Forces: {defender.groundForces}</div>
        </div>

        {step === 0 && (
          <div className={styles.stepContent}>
            <h3>Step IV.1: Start of Ground Combat Round</h3>
            <p>Resolve start of round abilities</p>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                No Abilities to Use
              </Button>

              <Button
                onClick={() => {
                  addLog('Yin Indoctrination - Spend 2 Influence to replace opponent infantry');
                  setCombatState(prev => ({
                    ...prev,
                    abilitiesUsed: [...prev.abilitiesUsed, 'yin_indoctrination'],
                  }));
                  advanceStep();
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
                    abilitiesUsed: [...prev.abilitiesUsed, 'sol_commander'],
                  }));
                  advanceStep();
                }}
                variant="secondary"
              >
                Sol Commander
              </Button>

              <Button
                onClick={() => {
                  addLog('Magen Defense Grid ΩΩ - Produces 1 hit');
                  setCombatState(prev => ({
                    ...prev,
                    abilitiesUsed: [...prev.abilitiesUsed, 'magen_defense_grid'],
                  }));
                  advanceStep();
                }}
                variant="secondary"
              >
                Magen Defense Grid ΩΩ
              </Button>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className={styles.stepContent}>
            <h3>Step IV.2: Roll Dice</h3>
            <p>Both players roll dice for ground units</p>

            <div className={styles.inputGroup}>
              <label>Attacker Hits:</label>
              <input
                type="number"
                min="0"
                defaultValue="0"
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: { ...prev.defender, hits },
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
                onBlur={(e) => {
                  const hits = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: { ...prev.attacker, hits },
                  }));
                }}
              />
            </div>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                Continue
              </Button>

              <Button
                onClick={() => {
                  addLog('FIRE TEAM - Reroll any number of dice');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'fire_team'],
                  }));
                }}
                variant="secondary"
              >
                Play FIRE TEAM
              </Button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.stepContent}>
            <h3>Step IV.3: Assign Hits</h3>
            <p>Attacker took {attacker.hits} hits | Defender took {defender.hits} hits</p>

            <div className={styles.inputGroup}>
              <label>Attacker Ground Forces Destroyed:</label>
              <input
                type="number"
                min="0"
                max={attacker.groundForces}
                defaultValue="0"
                onBlur={(e) => {
                  const destroyed = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    attacker: { ...prev.attacker, groundForces: prev.attacker.groundForces - destroyed },
                  }));
                }}
              />
            </div>

            <div className={styles.inputGroup}>
              <label>Defender Ground Forces Destroyed:</label>
              <input
                type="number"
                min="0"
                max={defender.groundForces}
                defaultValue="0"
                onBlur={(e) => {
                  const destroyed = parseInt(e.target.value) || 0;
                  setCombatState(prev => ({
                    ...prev,
                    defender: { ...prev.defender, groundForces: prev.defender.groundForces - destroyed },
                  }));
                }}
              />
            </div>

            <Button onClick={() => advanceStep()} variant="primary">
              Continue
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className={styles.stepContent}>
            <h3>Step IV.4: L1Z1X Harrow Check</h3>
            <p>If L1Z1X is present, check for additional Bombardment</p>

            <div className={styles.buttonGroup}>
              <Button onClick={() => advanceStep()} variant="primary">
                No Harrow Ability
              </Button>

              <Button
                onClick={() => {
                  addLog('L1Z1X Harrow - Ships Bombard again');
                  setCombatState(prev => ({
                    ...prev,
                    abilitiesUsed: [...prev.abilitiesUsed, 'l1z1x_harrow'],
                  }));
                  advanceStep();
                }}
                variant="secondary"
              >
                Use L1Z1X Harrow
              </Button>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className={styles.stepContent}>
            <h3>Step IV.5: Loop/End Combat</h3>
            <p>Attacker Ground Forces: {attacker.groundForces} | Defender Ground Forces: {defender.groundForces}</p>

            {attacker.groundForces === 0 && defender.groundForces === 0 ? (
              <>
                <p>All ground forces destroyed - Defender retains control</p>
                <Button
                  onClick={() => {
                    addLog('All ground forces destroyed - Defender retains control');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: 'defender' }));
                  }}
                  variant="primary"
                >
                  End Combat (Defender Retains)
                </Button>
              </>
            ) : attacker.groundForces === 0 ? (
              <>
                <p>Attacker eliminated - Defender wins</p>
                <Button
                  onClick={() => {
                    addLog('Attacker ground forces eliminated');
                    setCombatState(prev => ({ ...prev, isComplete: true, winner: 'defender' }));
                  }}
                  variant="primary"
                >
                  End Combat (Defender Wins)
                </Button>
              </>
            ) : defender.groundForces === 0 ? (
              <>
                <p>Defender eliminated - Attacker establishes control</p>
                <Button
                  onClick={() => {
                    addLog('Defender eliminated - Attacker establishes control');
                    advanceStep();
                  }}
                  variant="primary"
                >
                  Establish Control
                </Button>
              </>
            ) : (
              <>
                <p>Both sides remain - Continue combat</p>
                <Button
                  onClick={() => {
                    addLog(`Ground Combat Round ${combatRound} complete - Starting Round ${combatRound + 1}`);
                    setCombatState(prev => ({
                      ...prev,
                      combatRound: prev.combatRound + 1,
                      currentStep: 0,
                    }));
                  }}
                  variant="primary"
                >
                  Next Combat Round
                </Button>
              </>
            )}
          </div>
        )}

        {step === 5 && (
          <div className={styles.stepContent}>
            <h3>Step IV.6: Establish Control</h3>
            <p>Attacker gains control of the planet</p>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  addLog('Attacker establishes control - Combat complete');
                  setCombatState(prev => ({ ...prev, isComplete: true, winner: 'attacker' }));
                }}
                variant="primary"
              >
                Establish Control (Combat Complete)
              </Button>

              <Button
                onClick={() => {
                  addLog('INFILTRATE - Replace enemy PDS/Space Dock');
                  setCombatState(prev => ({
                    ...prev,
                    actionCardsUsed: [...prev.actionCardsUsed, 'infiltrate'],
                  }));
                }}
                variant="secondary"
              >
                Play INFILTRATE
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  // Check if combat is complete
  if (combatState.isComplete) {
    return (
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <Panel className={styles.combatPanel}>
            <h1>Combat Complete</h1>

            <div className={styles.resultContent}>
              <h2>
                {combatState.winner === 'attacker'
                  ? `${attackerName} (Attacker) Wins!`
                  : combatState.winner === 'defender'
                  ? `${defenderName} (Defender) Wins!`
                  : 'Draw - All Units Destroyed'}
              </h2>

              <div className={styles.logSection}>
                <h3>Combat Log:</h3>
                <div className={styles.logContent}>
                  {combatState.log.map((entry, idx) => (
                    <div key={idx} className={styles.logEntry}>
                      {entry}
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

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <Panel className={styles.combatPanel}>
          <div className={styles.header}>
            <h1>Combat Assistant</h1>
            <div className={styles.participants}>
              <span className={styles.attacker}>Attacker: {attackerName}</span>
              <span className={styles.vs}>vs</span>
              <span className={styles.defender}>Defender: {defenderName}</span>
            </div>
          </div>

          <div className={styles.phaseIndicator}>
            Phase {combatState.currentPhase} - Step {combatState.currentStep}
          </div>

          {combatState.currentPhase === 0 && renderPhase0()}
          {combatState.currentPhase === 1 && renderPhaseI()}
          {combatState.currentPhase === 2 && renderPhaseII()}
          {combatState.currentPhase === 3 && renderPhaseIII()}
          {combatState.currentPhase === 4 && renderPhaseIV()}

          <div className={styles.debugSection}>
            <h4>Debug Info:</h4>
            <p>Attacker Ships: {combatState.attacker.ships} | Ground: {combatState.attacker.groundForces}</p>
            <p>Defender Ships: {combatState.defender.ships} | Ground: {combatState.defender.groundForces}</p>
            <p>Phase: {combatState.currentPhase} | Step: {combatState.currentStep} | Round: {combatState.combatRound}</p>
          </div>

          <div className={styles.footer}>
            <Button
              onClick={onClose}
              variant="secondary"
            >
              Save & Exit
            </Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}
