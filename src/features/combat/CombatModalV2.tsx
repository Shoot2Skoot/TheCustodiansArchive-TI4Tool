import { useState, useEffect } from 'react';
import { Panel, Button } from '@/components/common';
import type {
  CombatState,
  CombatPhase,
  CombatStep,
  CombatParticipant,
} from '@/types/combat';
import { CombatPhase as Phase } from '@/types/combat';
import { getFactionById } from '@/lib/factions';
import {
  calculateTotalCapacity,
  calculateNeededCapacity,
  hasSpecialCapacityRules,
  getUnitStats,
  type UnitType,
} from '@/data/combatConfig';
import type { CombatUnit, DiceRoll } from '@/types/combatUnits';
import { createCombatUnit, getActiveUnits, canCombatContinue } from '@/types/combatUnits';
import { BatchDiceRoller } from './components/DiceRoller';
import { HitAssignment } from './components/HitAssignment';
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

  // Unit selection state for P0.5
  type UnitCounts = {
    // Space units
    warSun: number;
    dreadnought: number;
    cruiser: number;
    carrier: number;
    destroyer: number;
    fighter: number;
    flagship: number;
    // Ground units
    infantry: number;
    mech: number;
    // Structures
    pds: number;
  };

  const emptyUnitCounts = (): UnitCounts => ({
    warSun: 0,
    dreadnought: 0,
    cruiser: 0,
    carrier: 0,
    destroyer: 0,
    fighter: 0,
    flagship: 0,
    infantry: 0,
    mech: 0,
    pds: 0,
  });

  const [attackerUnits, setAttackerUnits] = useState<UnitCounts>(emptyUnitCounts());
  const [defenderUnits, setDefenderUnits] = useState<UnitCounts>(emptyUnitCounts());
  const [unitSelectionStep, setUnitSelectionStep] = useState<'attacker' | 'defender' | 'third-party-prompt' | 'third-party-select' | 'done'>('attacker');
  const [selectedThirdPartyId, setSelectedThirdPartyId] = useState<string | null>(null);
  const [thirdPartyUnits, setThirdPartyUnits] = useState<UnitCounts>(emptyUnitCounts());
  const [showAttackerCapacityModal, setShowAttackerCapacityModal] = useState(false);
  const [showDefenderCapacityModal, setShowDefenderCapacityModal] = useState(false);

  // Space Cannon hits state (for Phase 1) - DEPRECATED, will be removed
  const [defenderHits, setDefenderHits] = useState(0);
  const [attackerHits, setAttackerHits] = useState(0);

  // Combat Unit Tracking (NEW SYSTEM)
  const [attackerCombatUnits, setAttackerCombatUnits] = useState<CombatUnit[]>([]);
  const [defenderCombatUnits, setDefenderCombatUnits] = useState<CombatUnit[]>([]);
  const [thirdPartyCombatUnits, setThirdPartyCombatUnits] = useState<CombatUnit[]>([]);

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
            {players.map(player => {
              const faction = getFactionById(player.factionId);
              return (
                <Button
                  key={player.id}
                  onClick={() => {
                    setCombatState(prev => ({
                      ...prev,
                      attacker: createParticipant(player, true),
                    }));
                    addLog(`${faction?.name || player.displayName} (${player.displayName}) selected as Attacker`);
                    goToStep('P0.2');
                  }}
                  variant="secondary"
                  className={styles.playerButton}
                >
                  {faction?.name || player.displayName}
                  <span className={styles.playerName}> ({player.displayName})</span>
                </Button>
              );
            })}
          </div>
        </div>
      );
    }

    // P0.2: Select Defending Faction
    if (step === 'P0.2') {
      const attackerFaction = getFactionById(combatState.attacker?.factionId || '');
      return (
        <div className={styles.stepContent}>
          <h3>P0.2 — Select Defending Faction</h3>
          <p>Which player is defending the system?</p>
          <p className={styles.attackerNote}>
            Attacker: <strong>{attackerFaction?.name || combatState.attacker?.playerName}</strong> ({combatState.attacker?.playerName})
          </p>

          <div className={styles.playerSelection}>
            {players.filter(p => p.id !== combatState.attacker?.playerId).map(player => {
              const faction = getFactionById(player.factionId);
              return (
                <Button
                  key={player.id}
                  onClick={() => {
                    setCombatState(prev => ({
                      ...prev,
                      defender: createParticipant(player, false),
                    }));
                    addLog(`${faction?.name || player.displayName} (${player.displayName}) selected as Defender`);
                    goToStep('P0.3');
                  }}
                  variant="secondary"
                  className={styles.playerButton}
                >
                  {faction?.name || player.displayName}
                  <span className={styles.playerName}> ({player.displayName})</span>
                </Button>
              );
            })}
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
      const renderUnitCounter = (
        label: string,
        value: number,
        onChange: (newValue: number) => void
      ) => (
        <div className={styles.unitCounter}>
          <label>{label}</label>
          <div className={styles.counterControls}>
            <button
              onClick={() => onChange(Math.max(0, value - 1))}
              disabled={value === 0}
              className={styles.counterButton}
            >
              −
            </button>
            <input
              type="number"
              min="0"
              max="99"
              value={value}
              onChange={(e) => onChange(Math.max(0, parseInt(e.target.value) || 0))}
              className={styles.counterInput}
            />
            <button
              onClick={() => onChange(value + 1)}
              className={styles.counterButton}
            >
              +
            </button>
          </div>
        </div>
      );

      // Attacker unit selection
      if (unitSelectionStep === 'attacker') {
        return (
          <div className={styles.stepContent}>
            <h3>P0.5 — Unit Inventory: Attacker</h3>
            <p>
              <strong>{combatState.attacker?.playerName}</strong>, select all units you are bringing into combat:
            </p>

            <div className={styles.unitSelection}>
              <h4>Space Units</h4>
              <div className={styles.unitGrid}>
                {renderUnitCounter('War Suns', attackerUnits.warSun, (v) =>
                  setAttackerUnits({ ...attackerUnits, warSun: v })
                )}
                {renderUnitCounter('Dreadnoughts', attackerUnits.dreadnought, (v) =>
                  setAttackerUnits({ ...attackerUnits, dreadnought: v })
                )}
                {renderUnitCounter('Cruisers', attackerUnits.cruiser, (v) =>
                  setAttackerUnits({ ...attackerUnits, cruiser: v })
                )}
                {renderUnitCounter('Carriers', attackerUnits.carrier, (v) =>
                  setAttackerUnits({ ...attackerUnits, carrier: v })
                )}
                {renderUnitCounter('Destroyers', attackerUnits.destroyer, (v) =>
                  setAttackerUnits({ ...attackerUnits, destroyer: v })
                )}
                {renderUnitCounter('Fighters', attackerUnits.fighter, (v) =>
                  setAttackerUnits({ ...attackerUnits, fighter: v })
                )}
                {renderUnitCounter('Flagship', attackerUnits.flagship, (v) =>
                  setAttackerUnits({ ...attackerUnits, flagship: Math.min(1, v) })
                )}
              </div>

              <h4>Ground Units</h4>
              <div className={styles.unitGrid}>
                {renderUnitCounter('Infantry', attackerUnits.infantry, (v) =>
                  setAttackerUnits({ ...attackerUnits, infantry: v })
                )}
                {renderUnitCounter('Mechs', attackerUnits.mech, (v) =>
                  setAttackerUnits({ ...attackerUnits, mech: v })
                )}
              </div>
            </div>

            {/* Capacity Check for Attacker */}
            {hasSpecialCapacityRules(combatState.attacker?.factionId || '') ? (
              <div className={styles.capacityOk}>
                <p>
                  <strong>Capacity Check:</strong> No capacity required
                </p>
                <p style={{ marginTop: '8px', fontSize: '0.95em' }}>
                  <strong>Naalu Faction Ability:</strong> Your fighters and ground forces can move freely
                  without requiring capacity.
                </p>
              </div>
            ) : (
              <div className={
                calculateNeededCapacity({
                  war_sun: attackerUnits.warSun,
                  dreadnought: attackerUnits.dreadnought,
                  cruiser: attackerUnits.cruiser,
                  carrier: attackerUnits.carrier,
                  destroyer: attackerUnits.destroyer,
                  fighter: attackerUnits.fighter,
                  flagship: attackerUnits.flagship,
                  infantry: attackerUnits.infantry,
                  mech: attackerUnits.mech,
                  pds: attackerUnits.pds,
                }) > calculateTotalCapacity({
                  war_sun: attackerUnits.warSun,
                  dreadnought: attackerUnits.dreadnought,
                  cruiser: attackerUnits.cruiser,
                  carrier: attackerUnits.carrier,
                  destroyer: attackerUnits.destroyer,
                  fighter: attackerUnits.fighter,
                  flagship: attackerUnits.flagship,
                  infantry: attackerUnits.infantry,
                  mech: attackerUnits.mech,
                  pds: attackerUnits.pds,
                }, combatState.attacker?.factionId || '')
                  ? styles.capacityError
                  : styles.capacityOk
              }>
                <p>
                  <strong>Capacity Check:</strong>{' '}
                  {calculateTotalCapacity({
                    war_sun: attackerUnits.warSun,
                    dreadnought: attackerUnits.dreadnought,
                    cruiser: attackerUnits.cruiser,
                    carrier: attackerUnits.carrier,
                    destroyer: attackerUnits.destroyer,
                    fighter: attackerUnits.fighter,
                    flagship: attackerUnits.flagship,
                    infantry: attackerUnits.infantry,
                    mech: attackerUnits.mech,
                    pds: attackerUnits.pds,
                  }, combatState.attacker?.factionId || '')} available,{' '}
                  {calculateNeededCapacity({
                    war_sun: attackerUnits.warSun,
                    dreadnought: attackerUnits.dreadnought,
                    cruiser: attackerUnits.cruiser,
                    carrier: attackerUnits.carrier,
                    destroyer: attackerUnits.destroyer,
                    fighter: attackerUnits.fighter,
                    flagship: attackerUnits.flagship,
                    infantry: attackerUnits.infantry,
                    mech: attackerUnits.mech,
                    pds: attackerUnits.pds,
                  })} needed
                </p>
                {calculateNeededCapacity({
                  war_sun: attackerUnits.warSun,
                  dreadnought: attackerUnits.dreadnought,
                  cruiser: attackerUnits.cruiser,
                  carrier: attackerUnits.carrier,
                  destroyer: attackerUnits.destroyer,
                  fighter: attackerUnits.fighter,
                  flagship: attackerUnits.flagship,
                  infantry: attackerUnits.infantry,
                  mech: attackerUnits.mech,
                  pds: attackerUnits.pds,
                }) > calculateTotalCapacity({
                  war_sun: attackerUnits.warSun,
                  dreadnought: attackerUnits.dreadnought,
                  cruiser: attackerUnits.cruiser,
                  carrier: attackerUnits.carrier,
                  destroyer: attackerUnits.destroyer,
                  fighter: attackerUnits.fighter,
                  flagship: attackerUnits.flagship,
                  infantry: attackerUnits.infantry,
                  mech: attackerUnits.mech,
                  pds: attackerUnits.pds,
                }, combatState.attacker?.factionId || '') && (
                  <p className={styles.errorText}>
                    ⚠️ WARNING: Capacity exceeded by{' '}
                    {calculateNeededCapacity({
                      war_sun: attackerUnits.warSun,
                      dreadnought: attackerUnits.dreadnought,
                      cruiser: attackerUnits.cruiser,
                      carrier: attackerUnits.carrier,
                      destroyer: attackerUnits.destroyer,
                      fighter: attackerUnits.fighter,
                      flagship: attackerUnits.flagship,
                      infantry: attackerUnits.infantry,
                      mech: attackerUnits.mech,
                      pds: attackerUnits.pds,
                    }) - calculateTotalCapacity({
                      war_sun: attackerUnits.warSun,
                      dreadnought: attackerUnits.dreadnought,
                      cruiser: attackerUnits.cruiser,
                      carrier: attackerUnits.carrier,
                      destroyer: attackerUnits.destroyer,
                      fighter: attackerUnits.fighter,
                      flagship: attackerUnits.flagship,
                      infantry: attackerUnits.infantry,
                      mech: attackerUnits.mech,
                      pds: attackerUnits.pds,
                    }, combatState.attacker?.factionId || '')}!
                    You must have enough capacity to transport all fighters and ground forces.
                  </p>
                )}
              </div>
            )}

            <Button
              onClick={() => {
                // Check if capacity is exceeded
                const attackerFactionId = combatState.attacker?.factionId || '';
                const attackerConfigUnits = {
                  war_sun: attackerUnits.warSun,
                  dreadnought: attackerUnits.dreadnought,
                  cruiser: attackerUnits.cruiser,
                  carrier: attackerUnits.carrier,
                  destroyer: attackerUnits.destroyer,
                  fighter: attackerUnits.fighter,
                  flagship: attackerUnits.flagship,
                  infantry: attackerUnits.infantry,
                  mech: attackerUnits.mech,
                  pds: attackerUnits.pds,
                };
                const capacity = calculateTotalCapacity(attackerConfigUnits, attackerFactionId);
                const needed = calculateNeededCapacity(attackerConfigUnits);
                const hasSpecialRules = hasSpecialCapacityRules(attackerFactionId);
                const exceeded = needed > capacity;

                if (exceeded && !hasSpecialRules) {
                  setShowAttackerCapacityModal(true);
                } else {
                  addLog(`Attacker units confirmed`);
                  setUnitSelectionStep('defender');
                }
              }}
              variant="primary"
            >
              Continue to Defender Units
            </Button>

            {/* Attacker Capacity Warning Modal */}
            {showAttackerCapacityModal && (() => {
              const attackerFactionId = combatState.attacker?.factionId || '';
              const attackerConfigUnits = {
                war_sun: attackerUnits.warSun,
                dreadnought: attackerUnits.dreadnought,
                cruiser: attackerUnits.cruiser,
                carrier: attackerUnits.carrier,
                destroyer: attackerUnits.destroyer,
                fighter: attackerUnits.fighter,
                flagship: attackerUnits.flagship,
                infantry: attackerUnits.infantry,
                mech: attackerUnits.mech,
                pds: attackerUnits.pds,
              };
              const capacity = calculateTotalCapacity(attackerConfigUnits, attackerFactionId);
              const needed = calculateNeededCapacity(attackerConfigUnits);
              const exceeded = needed - capacity;

              return (
                <div className={styles.confirmationModal}>
                  <div className={styles.confirmationModalContent}>
                    <h3>
                      <span className={styles.warningIcon}>⚠️</span>
                      Capacity Exceeded
                    </h3>
                    <p>
                      <strong>Warning:</strong> Your attacker's capacity is exceeded by <strong>{exceeded}</strong> unit{exceeded !== 1 ? 's' : ''}.
                    </p>
                    <p>
                      Available capacity: <strong>{capacity}</strong>
                      <br />
                      Required capacity: <strong>{needed}</strong>
                    </p>
                    <p>
                      This is not a legal move unless you have upgrades (e.g., Carrier II) or special abilities that provide additional capacity.
                    </p>
                    <div className={styles.confirmationModalButtons}>
                      <button
                        className={styles.cancelButton}
                        onClick={() => setShowAttackerCapacityModal(false)}
                      >
                        Go Back and Fix
                      </button>
                      <button
                        className={styles.confirmButton}
                        onClick={() => {
                          setShowAttackerCapacityModal(false);
                          addLog(`Attacker units confirmed (capacity override)`);
                          setUnitSelectionStep('defender');
                        }}
                      >
                        Continue Anyway
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }

      // Defender unit selection
      if (unitSelectionStep === 'defender') {
        return (
          <div className={styles.stepContent}>
            <h3>P0.5 — Unit Inventory: Defender</h3>
            <p>
              <strong>{combatState.defender?.playerName}</strong>, select all units you have in the system:
            </p>

            <div className={styles.infoNote}>
              <p><strong>Note:</strong> Select units in the space area. Ground forces committed to planets will be selected during the invasion phase.</p>
            </div>

            <div className={styles.unitSelection}>
              <h4>Space Units</h4>
              <div className={styles.unitGrid}>
                {renderUnitCounter('War Suns', defenderUnits.warSun, (v) =>
                  setDefenderUnits({ ...defenderUnits, warSun: v })
                )}
                {renderUnitCounter('Dreadnoughts', defenderUnits.dreadnought, (v) =>
                  setDefenderUnits({ ...defenderUnits, dreadnought: v })
                )}
                {renderUnitCounter('Cruisers', defenderUnits.cruiser, (v) =>
                  setDefenderUnits({ ...defenderUnits, cruiser: v })
                )}
                {renderUnitCounter('Carriers', defenderUnits.carrier, (v) =>
                  setDefenderUnits({ ...defenderUnits, carrier: v })
                )}
                {renderUnitCounter('Destroyers', defenderUnits.destroyer, (v) =>
                  setDefenderUnits({ ...defenderUnits, destroyer: v })
                )}
                {renderUnitCounter('Fighters', defenderUnits.fighter, (v) =>
                  setDefenderUnits({ ...defenderUnits, fighter: v })
                )}
                {renderUnitCounter('Flagship', defenderUnits.flagship, (v) =>
                  setDefenderUnits({ ...defenderUnits, flagship: Math.min(1, v) })
                )}
              </div>

              <h4>Ground Units</h4>
              <div className={styles.unitGrid}>
                {renderUnitCounter('Infantry', defenderUnits.infantry, (v) =>
                  setDefenderUnits({ ...defenderUnits, infantry: v })
                )}
                {renderUnitCounter('Mechs', defenderUnits.mech, (v) =>
                  setDefenderUnits({ ...defenderUnits, mech: v })
                )}
              </div>

              <h4>Structures</h4>
              <div className={styles.unitGrid}>
                {renderUnitCounter('PDS', defenderUnits.pds, (v) =>
                  setDefenderUnits({ ...defenderUnits, pds: v })
                )}
              </div>
            </div>

            {/* Capacity Check for Defender */}
            {hasSpecialCapacityRules(combatState.defender?.factionId || '') ? (
              <div className={styles.capacityOk}>
                <p>
                  <strong>Capacity Check:</strong> No capacity required
                </p>
                <p style={{ marginTop: '8px', fontSize: '0.95em' }}>
                  <strong>Naalu Faction Ability:</strong> Your fighters and ground forces can move freely
                  without requiring capacity.
                </p>
              </div>
            ) : (
              <div className={
                calculateNeededCapacity({
                  war_sun: defenderUnits.warSun,
                  dreadnought: defenderUnits.dreadnought,
                  cruiser: defenderUnits.cruiser,
                  carrier: defenderUnits.carrier,
                  destroyer: defenderUnits.destroyer,
                  fighter: defenderUnits.fighter,
                  flagship: defenderUnits.flagship,
                  infantry: defenderUnits.infantry,
                  mech: defenderUnits.mech,
                  pds: defenderUnits.pds,
                }) > calculateTotalCapacity({
                  war_sun: defenderUnits.warSun,
                  dreadnought: defenderUnits.dreadnought,
                  cruiser: defenderUnits.cruiser,
                  carrier: defenderUnits.carrier,
                  destroyer: defenderUnits.destroyer,
                  fighter: defenderUnits.fighter,
                  flagship: defenderUnits.flagship,
                  infantry: defenderUnits.infantry,
                  mech: defenderUnits.mech,
                  pds: defenderUnits.pds,
                }, combatState.defender?.factionId || '')
                  ? styles.capacityError
                  : styles.capacityOk
              }>
                <p>
                  <strong>Capacity Check:</strong>{' '}
                  {calculateTotalCapacity({
                    war_sun: defenderUnits.warSun,
                    dreadnought: defenderUnits.dreadnought,
                    cruiser: defenderUnits.cruiser,
                    carrier: defenderUnits.carrier,
                    destroyer: defenderUnits.destroyer,
                    fighter: defenderUnits.fighter,
                    flagship: defenderUnits.flagship,
                    infantry: defenderUnits.infantry,
                    mech: defenderUnits.mech,
                    pds: defenderUnits.pds,
                  }, combatState.defender?.factionId || '')} available,{' '}
                  {calculateNeededCapacity({
                    war_sun: defenderUnits.warSun,
                    dreadnought: defenderUnits.dreadnought,
                    cruiser: defenderUnits.cruiser,
                    carrier: defenderUnits.carrier,
                    destroyer: defenderUnits.destroyer,
                    fighter: defenderUnits.fighter,
                    flagship: defenderUnits.flagship,
                    infantry: defenderUnits.infantry,
                    mech: defenderUnits.mech,
                    pds: defenderUnits.pds,
                  })} needed
                </p>
                {calculateNeededCapacity({
                  war_sun: defenderUnits.warSun,
                  dreadnought: defenderUnits.dreadnought,
                  cruiser: defenderUnits.cruiser,
                  carrier: defenderUnits.carrier,
                  destroyer: defenderUnits.destroyer,
                  fighter: defenderUnits.fighter,
                  flagship: defenderUnits.flagship,
                  infantry: defenderUnits.infantry,
                  mech: defenderUnits.mech,
                  pds: defenderUnits.pds,
                }) > calculateTotalCapacity({
                  war_sun: defenderUnits.warSun,
                  dreadnought: defenderUnits.dreadnought,
                  cruiser: defenderUnits.cruiser,
                  carrier: defenderUnits.carrier,
                  destroyer: defenderUnits.destroyer,
                  fighter: defenderUnits.fighter,
                  flagship: defenderUnits.flagship,
                  infantry: defenderUnits.infantry,
                  mech: defenderUnits.mech,
                  pds: defenderUnits.pds,
                }, combatState.defender?.factionId || '') && (
                  <p className={styles.errorText}>
                    ⚠️ WARNING: Capacity exceeded by{' '}
                    {calculateNeededCapacity({
                      war_sun: defenderUnits.warSun,
                      dreadnought: defenderUnits.dreadnought,
                      cruiser: defenderUnits.cruiser,
                      carrier: defenderUnits.carrier,
                      destroyer: defenderUnits.destroyer,
                      fighter: defenderUnits.fighter,
                      flagship: defenderUnits.flagship,
                      infantry: defenderUnits.infantry,
                      mech: defenderUnits.mech,
                      pds: defenderUnits.pds,
                    }) - calculateTotalCapacity({
                      war_sun: defenderUnits.warSun,
                      dreadnought: defenderUnits.dreadnought,
                      cruiser: defenderUnits.cruiser,
                      carrier: defenderUnits.carrier,
                      destroyer: defenderUnits.destroyer,
                      fighter: defenderUnits.fighter,
                      flagship: defenderUnits.flagship,
                      infantry: defenderUnits.infantry,
                      mech: defenderUnits.mech,
                      pds: defenderUnits.pds,
                    }, combatState.defender?.factionId || '')}!
                    Defender's units in space must fit within ship capacity.
                  </p>
                )}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  // Check if capacity is exceeded
                  const defenderFactionId = combatState.defender?.factionId || '';
                  const defenderConfigUnits = {
                    war_sun: defenderUnits.warSun,
                    dreadnought: defenderUnits.dreadnought,
                    cruiser: defenderUnits.cruiser,
                    carrier: defenderUnits.carrier,
                    destroyer: defenderUnits.destroyer,
                    fighter: defenderUnits.fighter,
                    flagship: defenderUnits.flagship,
                    infantry: defenderUnits.infantry,
                    mech: defenderUnits.mech,
                    pds: defenderUnits.pds,
                  };
                  const capacity = calculateTotalCapacity(defenderConfigUnits, defenderFactionId);
                  const needed = calculateNeededCapacity(defenderConfigUnits);
                  const hasSpecialRules = hasSpecialCapacityRules(defenderFactionId);
                  const exceeded = needed > capacity;

                  if (exceeded && !hasSpecialRules) {
                    setShowDefenderCapacityModal(true);
                  } else {
                    addLog(`Defender units confirmed`);
                    setUnitSelectionStep('third-party-prompt');
                  }
                }}
                variant="primary"
              >
                Continue
              </Button>
              <Button
                onClick={() => setUnitSelectionStep('attacker')}
                variant="secondary"
              >
                Back to Attacker
              </Button>
            </div>

            {/* Defender Capacity Warning Modal */}
            {showDefenderCapacityModal && (() => {
              const defenderFactionId = combatState.defender?.factionId || '';
              const defenderConfigUnits = {
                war_sun: defenderUnits.warSun,
                dreadnought: defenderUnits.dreadnought,
                cruiser: defenderUnits.cruiser,
                carrier: defenderUnits.carrier,
                destroyer: defenderUnits.destroyer,
                fighter: defenderUnits.fighter,
                flagship: defenderUnits.flagship,
                infantry: defenderUnits.infantry,
                mech: defenderUnits.mech,
                pds: defenderUnits.pds,
              };
              const capacity = calculateTotalCapacity(defenderConfigUnits, defenderFactionId);
              const needed = calculateNeededCapacity(defenderConfigUnits);
              const exceeded = needed - capacity;

              return (
                <div className={styles.confirmationModal}>
                  <div className={styles.confirmationModalContent}>
                    <h3>
                      <span className={styles.warningIcon}>⚠️</span>
                      Capacity Exceeded
                    </h3>
                    <p>
                      <strong>Warning:</strong> Your defender's capacity is exceeded by <strong>{exceeded}</strong> unit{exceeded !== 1 ? 's' : ''}.
                    </p>
                    <p>
                      Available capacity: <strong>{capacity}</strong>
                      <br />
                      Required capacity: <strong>{needed}</strong>
                    </p>
                    <p>
                      This is not a legal move unless you have upgrades (e.g., Carrier II) or special abilities that provide additional capacity.
                    </p>
                    <div className={styles.confirmationModalButtons}>
                      <button
                        className={styles.cancelButton}
                        onClick={() => setShowDefenderCapacityModal(false)}
                      >
                        Go Back and Fix
                      </button>
                      <button
                        className={styles.confirmButton}
                        onClick={() => {
                          setShowDefenderCapacityModal(false);
                          addLog(`Defender units confirmed (capacity override)`);
                          setUnitSelectionStep('third-party-prompt');
                        }}
                      >
                        Continue Anyway
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        );
      }

      // Third-party prompt
      if (unitSelectionStep === 'third-party-prompt') {
        const otherPlayers = players.filter(
          p =>
            p.id !== combatState.attacker?.playerId &&
            p.id !== combatState.defender?.playerId &&
            !combatState.thirdPartyParticipants.some(tp => tp.playerId === p.id)
        );

        const hasThirdParty = combatState.thirdPartyParticipants.length > 0;

        return (
          <div className={styles.stepContent}>
            <h3>P0.5 — Space Cannon Defense</h3>
            <p>
              {hasThirdParty
                ? 'Are there any other players with PDS or Space Cannon units that can fire into this system?'
                : 'Do any other players have PDS or Space Cannon units that can fire into this system?'
              }
            </p>

            {hasThirdParty && (
              <div className={styles.infoNote}>
                <p><strong>Already added:</strong></p>
                <ul>
                  {combatState.thirdPartyParticipants.map(tp => (
                    <li key={tp.playerId}>{tp.playerName}</li>
                  ))}
                </ul>
              </div>
            )}

            {otherPlayers.length === 0 ? (
              <div>
                <p className={styles.infoNote}>No additional players available.</p>
                <Button
                  onClick={() => {
                    addLog('No more third-party space cannon - Proceeding to summary');
                    setUnitSelectionStep('done');
                  }}
                  variant="primary"
                >
                  Continue to Summary
                </Button>
              </div>
            ) : (
              <div className={styles.buttonGroup}>
                <Button
                  onClick={() => {
                    setUnitSelectionStep('third-party-select');
                    setSelectedThirdPartyId(null);
                    setThirdPartyUnits(emptyUnitCounts());
                  }}
                  variant="primary"
                >
                  Yes - Add Player
                </Button>
                <Button
                  onClick={() => {
                    addLog('No more third-party space cannon - Proceeding to summary');
                    setUnitSelectionStep('done');
                  }}
                  variant="secondary"
                >
                  No - Continue to Summary
                </Button>
              </div>
            )}
          </div>
        );
      }

      // Third-party selection
      if (unitSelectionStep === 'third-party-select') {
        const otherPlayers = players.filter(
          p =>
            p.id !== combatState.attacker?.playerId &&
            p.id !== combatState.defender?.playerId &&
            !combatState.thirdPartyParticipants.some(tp => tp.playerId === p.id)
        );

        return (
          <div className={styles.stepContent}>
            <h3>P0.5 — Add Space Cannon Player</h3>

            {!selectedThirdPartyId ? (
              <div>
                <p>Select which player has Space Cannon units:</p>
                <div className={styles.infoNote}>
                  <p>Note: Space Cannons can only fire at the active player ({combatState.attacker?.playerName})</p>
                </div>
                <div className={styles.playerSelection}>
                  {otherPlayers.map(player => {
                    const faction = getFactionById(player.factionId);
                    return (
                      <Button
                        key={player.id}
                        onClick={() => setSelectedThirdPartyId(player.id)}
                        variant="secondary"
                      >
                        {faction?.name || player.displayName}
                        <span className={styles.playerName}> ({player.displayName})</span>
                      </Button>
                    );
                  })}
                </div>
                <Button
                  onClick={() => setUnitSelectionStep('third-party-prompt')}
                  variant="secondary"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div>
                <p>
                  <strong>
                    {(() => {
                      const player = players.find(p => p.id === selectedThirdPartyId);
                      const faction = player ? getFactionById(player.factionId) : null;
                      return faction?.name || player?.displayName || 'Unknown';
                    })()}
                  </strong> ({players.find(p => p.id === selectedThirdPartyId)?.displayName}), select your Space Cannon units:
                </p>

                <div className={styles.unitSelection}>
                  <h4>Space Cannon Units</h4>
                  <div className={styles.unitGrid}>
                    {renderUnitCounter('PDS', thirdPartyUnits.pds, (v) =>
                      setThirdPartyUnits({ ...thirdPartyUnits, pds: v })
                    )}
                  </div>

                  <div className={styles.infoNote}>
                    <p>These PDS will fire at <strong>{combatState.attacker?.playerName}</strong> (the active player)</p>
                  </div>
                </div>

                <div className={styles.buttonGroup}>
                  <Button
                    onClick={() => {
                      const player = players.find(p => p.id === selectedThirdPartyId);
                      if (player && thirdPartyUnits.pds > 0) {
                        addLog(
                          `${player.displayName} added with ${thirdPartyUnits.pds} PDS (firing at ${combatState.attacker?.playerName})`
                        );
                        setCombatState(prev => ({
                          ...prev,
                          thirdPartyParticipants: [
                            ...prev.thirdPartyParticipants,
                            {
                              playerId: player.id,
                              playerName: player.displayName,
                              factionId: player.factionId,
                              spaceCannonUnits: [], // Will populate based on thirdPartyUnits
                              firingAt: 'attacker', // Always fires at the active player
                            },
                          ],
                        }));
                        setSelectedThirdPartyId(null);
                        setThirdPartyUnits(emptyUnitCounts());
                        setUnitSelectionStep('third-party-prompt');
                      }
                    }}
                    variant="primary"
                    disabled={thirdPartyUnits.pds === 0}
                  >
                    Add Player
                  </Button>
                  <Button
                    onClick={() => {
                      setSelectedThirdPartyId(null);
                      setThirdPartyUnits(emptyUnitCounts());
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>
        );
      }

      // Done - show summary and continue
      if (unitSelectionStep === 'done') {
        // Convert UnitCounts to the format expected by combatConfig helpers
        const convertToConfigFormat = (units: UnitCounts) => ({
          war_sun: units.warSun,
          dreadnought: units.dreadnought,
          cruiser: units.cruiser,
          carrier: units.carrier,
          destroyer: units.destroyer,
          fighter: units.fighter,
          flagship: units.flagship,
          infantry: units.infantry,
          mech: units.mech,
          pds: units.pds,
        });

        const attackerFactionId = combatState.attacker?.factionId || '';
        const attackerConfigUnits = convertToConfigFormat(attackerUnits);

        const attackerCapacity = calculateTotalCapacity(attackerConfigUnits, attackerFactionId);
        const attackerNeeded = calculateNeededCapacity(attackerConfigUnits);
        const attackerCapacityExceeded = attackerNeeded > attackerCapacity;
        const attackerHasSpecialRules = hasSpecialCapacityRules(attackerFactionId);

        return (
          <div className={styles.stepContent}>
            <h3>P0.5 — Unit Inventory Summary</h3>

            <div className={styles.unitSummary}>
              <h4>
                Attacker: {getFactionById(combatState.attacker?.factionId || '')?.name || combatState.attacker?.playerName}
                {' '}({combatState.attacker?.playerName})
              </h4>
              <ul>
                {attackerUnits.warSun > 0 && <li>{attackerUnits.warSun} War Sun(s)</li>}
                {attackerUnits.dreadnought > 0 && <li>{attackerUnits.dreadnought} Dreadnought(s)</li>}
                {attackerUnits.cruiser > 0 && <li>{attackerUnits.cruiser} Cruiser(s)</li>}
                {attackerUnits.carrier > 0 && <li>{attackerUnits.carrier} Carrier(s)</li>}
                {attackerUnits.destroyer > 0 && <li>{attackerUnits.destroyer} Destroyer(s)</li>}
                {attackerUnits.fighter > 0 && <li>{attackerUnits.fighter} Fighter(s)</li>}
                {attackerUnits.flagship > 0 && <li>{attackerUnits.flagship} Flagship</li>}
                {attackerUnits.infantry > 0 && <li>{attackerUnits.infantry} Infantry</li>}
                {attackerUnits.mech > 0 && <li>{attackerUnits.mech} Mech(s)</li>}
              </ul>

              {/* Capacity Check for Attacker */}
              {!attackerHasSpecialRules && (
                <div className={attackerCapacityExceeded ? styles.capacityError : styles.capacityOk}>
                  <p>
                    <strong>Capacity:</strong> {attackerCapacity} available, {attackerNeeded} needed
                  </p>
                  {attackerCapacityExceeded && (
                    <p className={styles.errorText}>
                      ⚠️ WARNING: Capacity exceeded by {attackerNeeded - attackerCapacity}!
                      You must have enough capacity to transport all fighters and ground forces.
                    </p>
                  )}
                </div>
              )}

              {attackerHasSpecialRules && (
                <div className={styles.capacityOk}>
                  <p>
                    <strong>Capacity:</strong> No capacity required
                  </p>
                  <p style={{ marginTop: '8px', fontSize: '0.95em' }}>
                    <strong>Naalu Faction Ability:</strong> Your fighters and ground forces can move freely
                    without requiring capacity.
                  </p>
                </div>
              )}

              <h4>
                Defender: {getFactionById(combatState.defender?.factionId || '')?.name || combatState.defender?.playerName}
                {' '}({combatState.defender?.playerName})
              </h4>
              <ul>
                {defenderUnits.warSun > 0 && <li>{defenderUnits.warSun} War Sun(s)</li>}
                {defenderUnits.dreadnought > 0 && <li>{defenderUnits.dreadnought} Dreadnought(s)</li>}
                {defenderUnits.cruiser > 0 && <li>{defenderUnits.cruiser} Cruiser(s)</li>}
                {defenderUnits.carrier > 0 && <li>{defenderUnits.carrier} Carrier(s)</li>}
                {defenderUnits.destroyer > 0 && <li>{defenderUnits.destroyer} Destroyer(s)</li>}
                {defenderUnits.fighter > 0 && <li>{defenderUnits.fighter} Fighter(s)</li>}
                {defenderUnits.flagship > 0 && <li>{defenderUnits.flagship} Flagship</li>}
                {defenderUnits.infantry > 0 && <li>{defenderUnits.infantry} Infantry</li>}
                {defenderUnits.mech > 0 && <li>{defenderUnits.mech} Mech(s)</li>}
                {defenderUnits.pds > 0 && <li>{defenderUnits.pds} PDS</li>}
              </ul>

              {/* Capacity Check for Defender */}
              {(() => {
                const defenderFactionId = combatState.defender?.factionId || '';
                const defenderConfigUnits = convertToConfigFormat(defenderUnits);
                const defenderCapacity = calculateTotalCapacity(defenderConfigUnits, defenderFactionId);
                const defenderNeeded = calculateNeededCapacity(defenderConfigUnits);
                const defenderHasSpecialRules = hasSpecialCapacityRules(defenderFactionId);
                const defenderCapacityExceeded = defenderNeeded > defenderCapacity;

                if (defenderHasSpecialRules) {
                  return (
                    <div className={styles.capacityOk}>
                      <p>
                        <strong>Capacity:</strong> No capacity required
                      </p>
                      <p style={{ marginTop: '8px', fontSize: '0.95em' }}>
                        <strong>Naalu Faction Ability:</strong> Your fighters and ground forces can move freely
                        without requiring capacity.
                      </p>
                    </div>
                  );
                }

                return (
                  <div className={defenderCapacityExceeded ? styles.capacityError : styles.capacityOk}>
                    <p>
                      <strong>Capacity:</strong> {defenderCapacity} available, {defenderNeeded} needed
                    </p>
                    {defenderCapacityExceeded && (
                      <p className={styles.errorText}>
                        ⚠️ WARNING: Capacity exceeded by {defenderNeeded - defenderCapacity}!
                      </p>
                    )}
                  </div>
                );
              })()}

              {combatState.thirdPartyParticipants.length > 0 && (
                <>
                  <h4>
                    Third-Party Space Cannon (firing at{' '}
                    {getFactionById(combatState.attacker?.factionId || '')?.name || combatState.attacker?.playerName}):
                  </h4>
                  <ul>
                    {combatState.thirdPartyParticipants.map(tp => {
                      const faction = getFactionById(tp.factionId);
                      return (
                        <li key={tp.playerId}>
                          {faction?.name || tp.playerName} ({tp.playerName})
                        </li>
                      );
                    })}
                  </ul>
                </>
              )}
            </div>

            <div className={styles.infoNote}>
              <p><strong>Note:</strong> Capacity calculation includes faction-specific flagship values.
              If you have Carrier II upgrades (6 capacity vs base 4) or Nomad Memoria II upgrade (6 capacity vs base 3),
              you are responsible for accounting for that additional capacity.</p>
            </div>

            {/* Fleet Pool Allocation Check */}
            <div className={styles.fleetPoolCheck}>
              <h4>Fleet Pool Allocation</h4>
              {(() => {
                // Calculate ships that count toward fleet pool (excludes fighters, infantry, mechs, PDS, space docks)
                const attackerShips =
                  attackerUnits.warSun +
                  attackerUnits.dreadnought +
                  attackerUnits.cruiser +
                  attackerUnits.carrier +
                  attackerUnits.destroyer +
                  attackerUnits.flagship;

                const defenderShips =
                  defenderUnits.warSun +
                  defenderUnits.dreadnought +
                  defenderUnits.cruiser +
                  defenderUnits.carrier +
                  defenderUnits.destroyer +
                  defenderUnits.flagship;

                return (
                  <>
                    <p>
                      <strong>Attacker:</strong> {attackerShips} ship{attackerShips !== 1 ? 's' : ''}
                      {' '}→ Requires {attackerShips} command token{attackerShips !== 1 ? 's' : ''} in fleet pool
                    </p>
                    <p>
                      <strong>Defender:</strong> {defenderShips} ship{defenderShips !== 1 ? 's' : ''}
                      {' '}→ Requires {defenderShips} command token{defenderShips !== 1 ? 's' : ''} in fleet pool
                    </p>
                    <p className={styles.fleetPoolNote}>
                      <em>Note: Each non-fighter, non-ground-force ship requires 1 command token allocated to your fleet pool.</em>
                    </p>
                  </>
                );
              })()}
            </div>

            <div className={styles.buttonGroup}>
              <Button
                onClick={() => {
                  // Convert unit counts to individual CombatUnit instances
                  const convertToCombatUnits = (
                    counts: UnitCounts,
                    side: 'attacker' | 'defender',
                    participant: CombatParticipant
                  ): CombatUnit[] => {
                    const units: CombatUnit[] = [];
                    let unitIndex = 0;

                    // Helper to create units of a specific type
                    const addUnitsOfType = (type: UnitType, count: number) => {
                      for (let i = 0; i < count; i++) {
                        const stats = getUnitStats(type, participant.factionId);
                        units.push(
                          createCombatUnit(
                            type,
                            stats,
                            side,
                            participant.playerId,
                            participant.playerName,
                            participant.factionId,
                            unitIndex++
                          )
                        );
                      }
                    };

                    // Create units for each type
                    addUnitsOfType('war_sun', counts.warSun);
                    addUnitsOfType('dreadnought', counts.dreadnought);
                    addUnitsOfType('cruiser', counts.cruiser);
                    addUnitsOfType('carrier', counts.carrier);
                    addUnitsOfType('destroyer', counts.destroyer);
                    addUnitsOfType('fighter', counts.fighter);
                    addUnitsOfType('flagship', counts.flagship);
                    addUnitsOfType('infantry', counts.infantry);
                    addUnitsOfType('mech', counts.mech);
                    addUnitsOfType('pds', counts.pds);

                    return units;
                  };

                  // Convert attacker units
                  const attackerCombatUnitsArray = convertToCombatUnits(
                    attackerUnits,
                    'attacker',
                    combatState.attacker!
                  );
                  setAttackerCombatUnits(attackerCombatUnitsArray);

                  // Convert defender units
                  const defenderCombatUnitsArray = convertToCombatUnits(
                    defenderUnits,
                    'defender',
                    combatState.defender!
                  );
                  setDefenderCombatUnits(defenderCombatUnitsArray);

                  // TODO: Convert third-party units (for now, empty)
                  setThirdPartyCombatUnits([]);

                  addLog(`Unit inventory confirmed - ${attackerCombatUnitsArray.length} attacker units, ${defenderCombatUnitsArray.length} defender units`);
                  goToStep('P0.6');
                }}
                variant="primary"
              >
                Confirm and Continue
              </Button>
              <Button
                onClick={() => setUnitSelectionStep('attacker')}
                variant="secondary"
              >
                Edit Units
              </Button>
            </div>
          </div>
        );
      }

      return null;
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

    // P1.2: Space Cannon Rolls (NEW - uses dice rolling system)
    if (step === 'P1.2') {
      // Get all units with Space Cannon capability
      const defenderSpaceCannonUnits = defenderCombatUnits.filter(u => u.hasSpaceCannon && u.state !== 'destroyed');
      const attackerSpaceCannonUnits = attackerCombatUnits.filter(u => u.hasSpaceCannon && u.state !== 'destroyed');
      // TODO: Add third-party space cannon units

      const allSpaceCannonUnits = [...defenderSpaceCannonUnits, ...attackerSpaceCannonUnits];

      if (allSpaceCannonUnits.length === 0) {
        // No space cannon units - skip to next phase
        return (
          <div className={styles.stepContent}>
            <h3>P1.2 — Space Cannon Rolls</h3>
            <p>No Space Cannon units present. Skipping to Space Combat.</p>
            <Button
              onClick={() => {
                addLog('No Space Cannon units - proceeding to Space Combat');
                goToPhase(Phase.SPACE_COMBAT, 'P2.1');
              }}
              variant="primary"
            >
              Continue to Space Combat →
            </Button>
          </div>
        );
      }

      return (
        <div className={styles.stepContent}>
          <h3>P1.2 — Space Cannon Rolls</h3>
          <p className={styles.infoNote}>
            Space Cannon units fire at the attacker's fleet. Defender fires first, then attacker (if they have SC units), then third parties (in player order).
          </p>

          <BatchDiceRoller
            units={allSpaceCannonUnits}
            targetValueGetter={(unit) => unit.spaceCannonValue || 6}
            rollsGetter={(unit) => unit.spaceCannonRolls || 1}
            canReroll={true}
            onComplete={(rollResults) => {
              // Calculate total hits from all rolls
              let totalHits = 0;
              rollResults.forEach((unitRolls) => {
                const hits = unitRolls.filter(r => r.isHit).length;
                totalHits += hits;
              });

              addLog(`Space Cannon: ${totalHits} hit${totalHits !== 1 ? 's' : ''} scored`);

              // Store hits for P1.3 assignment
              setDefenderHits(totalHits); // Temp storage - will remove this later

              goToStep('P1.3');
            }}
            title="Space Cannon Offense — Roll Dice"
          />
        </div>
      );
    }

    // P1.3: Assign Hits (NEW - uses interactive UI)
    if (step === 'P1.3') {
      const hitsToAssign = defenderHits; // Temp: using old state variable for now

      return (
        <div className={styles.stepContent}>
          <h3>P1.3 — Space Cannon Hit Assignment</h3>
          <p className={styles.infoNote}>
            The attacker must assign {hitsToAssign} hit{hitsToAssign !== 1 ? 's' : ''} from Space Cannon fire to their ships.
          </p>

          <HitAssignment
            units={attackerCombatUnits}
            hitsToAssign={hitsToAssign}
            targetPlayerName={combatState.attacker?.playerName || 'Attacker'}
            onComplete={(updatedUnits) => {
              // Update attacker units with damage/destruction
              setAttackerCombatUnits(updatedUnits);

              const destroyedCount = updatedUnits.filter(u => u.state === 'destroyed').length;
              const damagedCount = updatedUnits.filter(u => u.state === 'sustained').length;

              addLog(`Space Cannon hits assigned: ${destroyedCount} ships destroyed, ${damagedCount} damaged`);
              goToStep('P1.4');
            }}
            title="Assign Space Cannon Hits to Attacker"
          />
        </div>
      );
    }

    // P1.4: Combat Continuation Check
    if (step === 'P1.4') {
      const activeAttackerShips = getActiveUnits(attackerCombatUnits).filter(u => u.isShip);
      const activeDefenderShips = getActiveUnits(defenderCombatUnits).filter(u => u.isShip);

      const attackerHasShips = activeAttackerShips.length > 0;
      const defenderHasShips = activeDefenderShips.length > 0;

      const attackerShipCount = activeAttackerShips.length;
      const defenderShipCount = activeDefenderShips.length;

      return (
        <div className={styles.stepContent}>
          <h3>P1.4 — Combat Continuation Check</h3>
          <p>Evaluate whether combat continues based on remaining ships.</p>

          <div className={styles.combatStatus}>
            <p>Attacker has {attackerShipCount} active ship{attackerShipCount !== 1 ? 's' : ''}</p>
            <p>Defender has {defenderShipCount} active ship{defenderShipCount !== 1 ? 's' : ''}</p>
          </div>

          {!attackerHasShips && !defenderHasShips ? (
            <div>
              <p>Both sides destroyed - Combat ends in a draw</p>
              <Button
                onClick={() => {
                  addLog('All ships destroyed - Combat ends in draw');
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
                  addLog('Attacker eliminated - Defender wins');
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
      const attackerAFBUnits = getActiveUnits(attackerCombatUnits).filter(u => u.hasAntiFighterBarrage);
      const defenderAFBUnits = getActiveUnits(defenderCombatUnits).filter(u => u.hasAntiFighterBarrage);

      const allAFBUnits = [...attackerAFBUnits, ...defenderAFBUnits];

      // If no AFB units on either side, skip this step
      if (allAFBUnits.length === 0) {
        return (
          <div className={styles.stepContent}>
            <h3>P2.2 — Anti-Fighter Barrage (Round {round} Only)</h3>
            <p>No units with Anti-Fighter Barrage capability present.</p>
            <Button
              onClick={() => {
                addLog('No AFB units - skipping to Retreats');
                setCombatState(prev => ({ ...prev, afbFiredThisCombat: true }));
                goToStep('P2.3');
              }}
              variant="primary"
            >
              Continue to Retreats
            </Button>
          </div>
        );
      }

      return (
        <div className={styles.stepContent}>
          <h3>P2.2 — Anti-Fighter Barrage (Round {round} Only)</h3>
          <p>Both players with AFB-capable units may simultaneously roll against enemy fighters.</p>
          <p className={styles.infoNote}>
            AFB rolls are NOT affected by combat modifiers. Excess hits are ignored unless specified (e.g., Argent Raid Formation).
          </p>

          <BatchDiceRoller
            units={allAFBUnits}
            targetValueGetter={(unit) => unit.antiFighterBarrageValue || 6}
            rollsGetter={(unit) => unit.antiFighterBarrageRolls || 1}
            canReroll={true}
            onComplete={(rollResults) => {
              let attackerHits = 0;
              let defenderHits = 0;

              rollResults.forEach((unitRolls) => {
                const unitId = unitRolls[0]?.unitId;
                const unit = allAFBUnits.find(u => u.id === unitId);
                if (!unit) return;

                const hits = unitRolls.filter(r => r.isHit).length;
                if (unit.owner === 'attacker') {
                  attackerHits += hits;
                } else {
                  defenderHits += hits;
                }
              });

              addLog(`AFB complete: Attacker ${attackerHits} hits, Defender ${defenderHits} hits`);
              setAttackerHits(attackerHits);
              setDefenderHits(defenderHits);
              setCombatState(prev => ({ ...prev, afbFiredThisCombat: true }));
              goToStep('P2.2-assignment');
            }}
            title="Anti-Fighter Barrage — Roll Dice"
          />

          <div className={styles.buttonGroup} style={{ marginTop: '20px' }}>
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

    // P2.2-assignment: AFB Hit Assignment
    if (step === 'P2.2-assignment') {
      const attackerAFBHits = attackerHits; // Hits attacker landed on defender
      const defenderAFBHits = defenderHits; // Hits defender landed on attacker

      // First assign defender's hits to attacker's fighters
      if (defenderAFBHits > 0) {
        return (
          <HitAssignment
            units={attackerCombatUnits.filter(u => u.type === 'fighter')}
            hitsToAssign={defenderAFBHits}
            targetPlayerName={combatState.attacker?.playerName || 'Attacker'}
            onComplete={(updatedUnits) => {
              // Update only fighters, keep other units unchanged
              const updatedAttackerUnits = attackerCombatUnits.map(u => {
                const updated = updatedUnits.find(uu => uu.id === u.id);
                return updated || u;
              });
              setAttackerCombatUnits(updatedAttackerUnits);

              const destroyedCount = updatedUnits.filter(u => u.state === 'destroyed').length;
              addLog(`AFB hits assigned to Attacker: ${destroyedCount} fighters destroyed`);

              // Move to assigning attacker's hits to defender
              goToStep('P2.2-assignment-defender');
            }}
            title="Assign AFB Hits to Attacker's Fighters"
          />
        );
      }

      // If defender had no hits, skip to assigning attacker's hits
      goToStep('P2.2-assignment-defender');
      return null;
    }

    // P2.2-assignment-defender: AFB Hit Assignment to Defender
    if (step === 'P2.2-assignment-defender') {
      const attackerAFBHits = attackerHits;

      if (attackerAFBHits > 0) {
        return (
          <HitAssignment
            units={defenderCombatUnits.filter(u => u.type === 'fighter')}
            hitsToAssign={attackerAFBHits}
            targetPlayerName={combatState.defender?.playerName || 'Defender'}
            onComplete={(updatedUnits) => {
              // Update only fighters, keep other units unchanged
              const updatedDefenderUnits = defenderCombatUnits.map(u => {
                const updated = updatedUnits.find(uu => uu.id === u.id);
                return updated || u;
              });
              setDefenderCombatUnits(updatedDefenderUnits);

              const destroyedCount = updatedUnits.filter(u => u.state === 'destroyed').length;
              addLog(`AFB hits assigned to Defender: ${destroyedCount} fighters destroyed`);

              // AFB complete, move to retreats
              goToStep('P2.3');
            }}
            title="Assign AFB Hits to Defender's Fighters"
          />
        );
      }

      // If attacker had no hits either, just proceed
      goToStep('P2.3');
      return null;
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
      const activeAttackerShips = getActiveUnits(attackerCombatUnits).filter(u => u.isShip);
      const activeDefenderShips = getActiveUnits(defenderCombatUnits).filter(u => u.isShip);

      const allCombatShips = [...activeAttackerShips, ...activeDefenderShips];

      return (
        <div className={styles.stepContent}>
          <h3>P2.4 — Combat Rolls (Round {round})</h3>
          <p>Both players roll dice for all participating ships.</p>

          <BatchDiceRoller
            units={allCombatShips}
            targetValueGetter={(unit) => unit.combatValue || 8}
            rollsGetter={(unit) => unit.combatRolls || 1}
            canReroll={true}
            onComplete={(rollResults) => {
              let attackerHits = 0;
              let defenderHits = 0;

              rollResults.forEach((unitRolls) => {
                const unitId = unitRolls[0]?.unitId;
                const unit = allCombatShips.find(u => u.id === unitId);
                if (!unit) return;

                const hits = unitRolls.filter(r => r.isHit).length;
                if (unit.owner === 'attacker') {
                  attackerHits += hits;
                } else {
                  defenderHits += hits;
                }
              });

              addLog(`Combat rolls complete: Attacker ${attackerHits} hits, Defender ${defenderHits} hits`);
              setAttackerHits(attackerHits);
              setDefenderHits(defenderHits);
              goToStep('P2.5');
            }}
            title="Space Combat — Roll Dice"
          />

          <div className={styles.buttonGroup} style={{ marginTop: '20px' }}>
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

    // P2.5: Hit Assignment & Damage Resolution (Attacker receives hits)
    if (step === 'P2.5') {
      const defenderHitsOnAttacker = defenderHits;

      // If defender landed hits on attacker, assign them
      if (defenderHitsOnAttacker > 0) {
        return (
          <HitAssignment
            units={attackerCombatUnits.filter(u => u.isShip)}
            hitsToAssign={defenderHitsOnAttacker}
            targetPlayerName={combatState.attacker?.playerName || 'Attacker'}
            onComplete={(updatedUnits) => {
              // Update ships, keep non-ships unchanged
              const updatedAttackerUnits = attackerCombatUnits.map(u => {
                const updated = updatedUnits.find(uu => uu.id === u.id);
                return updated || u;
              });
              setAttackerCombatUnits(updatedAttackerUnits);

              const destroyedCount = updatedUnits.filter(u => u.state === 'destroyed').length;
              const damagedCount = updatedUnits.filter(u => u.state === 'sustained').length;
              addLog(`Round ${round} hits assigned to Attacker: ${destroyedCount} ships destroyed, ${damagedCount} damaged`);

              // Move to assigning attacker's hits to defender
              goToStep('P2.5-defender');
            }}
            title={`Assign Combat Hits to Attacker (Round ${round})`}
          />
        );
      }

      // If defender had no hits, skip to assigning attacker's hits
      goToStep('P2.5-defender');
      return null;
    }

    // P2.5-defender: Hit Assignment to Defender
    if (step === 'P2.5-defender') {
      const attackerHitsOnDefender = attackerHits;

      if (attackerHitsOnDefender > 0) {
        return (
          <HitAssignment
            units={defenderCombatUnits.filter(u => u.isShip)}
            hitsToAssign={attackerHitsOnDefender}
            targetPlayerName={combatState.defender?.playerName || 'Defender'}
            onComplete={(updatedUnits) => {
              // Update ships, keep non-ships unchanged
              const updatedDefenderUnits = defenderCombatUnits.map(u => {
                const updated = updatedUnits.find(uu => uu.id === u.id);
                return updated || u;
              });
              setDefenderCombatUnits(updatedDefenderUnits);

              const destroyedCount = updatedUnits.filter(u => u.state === 'destroyed').length;
              const damagedCount = updatedUnits.filter(u => u.state === 'sustained').length;
              addLog(`Round ${round} hits assigned to Defender: ${destroyedCount} ships destroyed, ${damagedCount} damaged`);

              // Combat round hit assignment complete, move to continuation check
              goToStep('P2.6');
            }}
            title={`Assign Combat Hits to Defender (Round ${round})`}
          />
        );
      }

      // If attacker had no hits either, just proceed
      goToStep('P2.6');
      return null;
    }

    // P2.6: Combat Continuation Check
    if (step === 'P2.6') {
      const activeAttackerShips = getActiveUnits(attackerCombatUnits).filter(u => u.isShip);
      const activeDefenderShips = getActiveUnits(defenderCombatUnits).filter(u => u.isShip);

      const attackerHasShips = activeAttackerShips.length > 0;
      const defenderHasShips = activeDefenderShips.length > 0;
      const retreatAnnounced = combatState.attacker.hasAnnouncedRetreat || combatState.defender.hasAnnouncedRetreat;

      const attackerShipCount = activeAttackerShips.length;
      const defenderShipCount = activeDefenderShips.length;

      return (
        <div className={styles.stepContent}>
          <h3>P2.6 — Combat Continuation Check (Round {round})</h3>
          <p>Evaluate whether combat continues, ends, or a retreat is executed.</p>

          <div className={styles.combatStatus}>
            <p>Attacker has {attackerShipCount} active ship{attackerShipCount !== 1 ? 's' : ''}</p>
            <p>Defender has {defenderShipCount} active ship{defenderShipCount !== 1 ? 's' : ''}</p>
            <p>Retreat announced: {retreatAnnounced ? 'Yes' : 'No'}</p>
          </div>

          {!attackerHasShips && !defenderHasShips ? (
            <div>
              <p>All ships destroyed - Combat ends in a draw</p>
              <Button
                onClick={() => {
                  addLog('All ships destroyed - Combat ends in draw');
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
                  addLog('Attacker eliminated - Defender wins');
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
                  addLog('Defender eliminated - Attacker wins space combat, proceeding to Invasion');
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
                <span className={styles.attacker}>
                  Attacker: {getFactionById(combatState.attacker.factionId)?.name || combatState.attacker.playerName}
                </span>
                <span className={styles.vs}>vs</span>
                <span className={styles.defender}>
                  Defender: {getFactionById(combatState.defender.factionId)?.name || combatState.defender.playerName}
                </span>
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
