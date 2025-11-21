import { useState, useEffect, useCallback } from 'react';
import { Panel, Button, StrategyCardNumber } from '@/components/common';
import { STRATEGY_CARDS, getPlayerColor } from '@/lib/constants';
import { getFactionImage, FACTIONS } from '@/lib/factions';
import { useStore } from '@/store';
import { getCurrentUserId } from '@/lib/auth';
import type { PlayerActionState, ActionPhaseState } from '@/store/slices/undoSlice';
import { PoliticsCardModal } from './PoliticsCardModal';
import { ActionStrategyCard } from './ActionStrategyCard';
import { useSaveActionPhaseState } from './useSaveActionPhaseState';
import styles from './ActionPhase.module.css';

interface Player {
  id: string;
  position: number;
  displayName: string;
  color: string;
  factionName: string;
  factionId: string;
}

interface StrategySelection {
  playerId: string;
  strategyCardId: number;
  tradeGoodBonus: number;
  selectionOrder: number;
}

interface ActionPhaseProps {
  gameId: string;
  players: Player[];
  roundNumber: number;
  strategySelections: StrategySelection[];
  speakerPlayerId: string | null;
  onComplete: () => void;
}

export function ActionPhase({
  gameId,
  players,
  roundNumber,
  strategySelections,
  speakerPlayerId,
  onComplete,
}: ActionPhaseProps) {
  // Local state for action phase
  const [playerActionStates, setPlayerActionStates] = useState<PlayerActionState[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [globalTurnCounter, setGlobalTurnCounter] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentSpeakerPlayerId, setCurrentSpeakerPlayerId] = useState<string | null>(speakerPlayerId);
  const [isStrategyCardActionInProgress, setIsStrategyCardActionInProgress] = useState(false);
  const [showPoliticsModal, setShowPoliticsModal] = useState(false);

  // Get undo/redo functions from store
  const pushHistory = useStore((state) => state.pushHistory);
  const canUndo = useStore((state) => state.canUndo);
  const canRedo = useStore((state) => state.canRedo);
  const currentGame = useStore((state) => state.currentGame);

  // Database hooks
  const {
    saveStrategyCardAction,
    saveTacticalAction,
    savePassAction,
    changeSpeaker,
  } = useSaveActionPhaseState();

  // Get current user ID on mount
  useEffect(() => {
    getCurrentUserId().then(setCurrentUserId);
  }, []);

  // Initialize player action states
  useEffect(() => {
    const initialStates: PlayerActionState[] = players.map((player) => ({
      playerId: player.id,
      strategyCardUsed: false,
      hasPassed: false,
      tacticalActionsCount: 0,
      componentActionsCount: 0,
    }));
    setPlayerActionStates(initialStates);
  }, [players]);

  // Calculate turn order based on strategy card initiative
  const turnOrder = [...strategySelections].sort((a, b) => a.strategyCardId - b.strategyCardId);

  // Debug logging
  console.log('ActionPhase - Strategy Selections:', strategySelections);
  console.log('ActionPhase - Turn Order:', turnOrder);
  console.log('ActionPhase - Players:', players);
  console.log('ActionPhase - Player Action States:', playerActionStates);

  // Get active players (not passed)
  const activePlayers = turnOrder.filter((selection) => {
    const state = playerActionStates.find((s) => s.playerId === selection.playerId);
    return !state?.hasPassed;
  });

  // Get current player
  const currentTurnSelection = activePlayers[currentTurnIndex % activePlayers.length];
  const currentPlayer = currentTurnSelection
    ? players.find((p) => p.id === currentTurnSelection.playerId)
    : null;
  const currentPlayerState = currentPlayer
    ? playerActionStates.find((s) => s.playerId === currentPlayer.id)
    : null;

  const isHost = currentUserId && currentGame?.createdBy === currentUserId;

  // Get current game state snapshot for undo
  const getCurrentStateSnapshot = (): ActionPhaseState => ({
    currentTurnPlayerId: currentPlayer?.id || '',
    playerActionStates: [...playerActionStates],
    speakerPlayerId: currentSpeakerPlayerId,
  });

  // Handle tactical action
  const handleTacticalAction = async () => {
    if (!currentPlayer || !currentUserId) return;

    // Push current state to undo history BEFORE updating
    pushHistory({
      type: 'actionPhaseAction',
      actionType: 'tactical',
      data: getCurrentStateSnapshot(),
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Update the player's tactical action count
    setPlayerActionStates((prev) =>
      prev.map((state) =>
        state.playerId === currentPlayer.id
          ? { ...state, tacticalActionsCount: state.tacticalActionsCount + 1 }
          : state
      )
    );

    // Save to database
    await saveTacticalAction({
      gameId,
      roundNumber,
      playerId: currentPlayer.id,
    });

    // Increment global turn counter
    setGlobalTurnCounter((prev) => prev + 1);

    // Move to next player
    advanceToNextPlayer();
  };

  // Handle component action
  const handleComponentAction = async () => {
    if (!currentPlayer || !currentUserId) return;

    // Push current state to undo history BEFORE updating
    pushHistory({
      type: 'actionPhaseAction',
      actionType: 'component',
      data: getCurrentStateSnapshot(),
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Update the player's component action count
    setPlayerActionStates((prev) =>
      prev.map((state) =>
        state.playerId === currentPlayer.id
          ? { ...state, componentActionsCount: state.componentActionsCount + 1 }
          : state
      )
    );

    // Save to database (reusing tactical action table for now)
    await saveTacticalAction({
      gameId,
      roundNumber,
      playerId: currentPlayer.id,
    });

    // Increment global turn counter
    setGlobalTurnCounter((prev) => prev + 1);

    // Move to next player
    advanceToNextPlayer();
  };

  // Handle strategy card action - activate glow effect
  const handleStrategyCardAction = () => {
    if (!currentPlayer || !currentPlayerState) return;

    // Can only use strategy card once
    if (currentPlayerState.strategyCardUsed) return;

    const strategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
    if (!strategyCard) return;

    // Set strategy card action in progress (will add glow effect)
    setIsStrategyCardActionInProgress(true);
  };

  // Handle strategy card done button - process the action
  const handleStrategyCardDone = async () => {
    setIsStrategyCardActionInProgress(false);

    if (!currentPlayer || !currentUserId) return;

    const strategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
    if (!strategyCard) return;

    // Push current state to undo history BEFORE updating
    pushHistory({
      type: 'strategyCardAction',
      strategyCardId: strategyCard.strategyCardId,
      data: getCurrentStateSnapshot(),
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Mark strategy card as used with turn number
    setPlayerActionStates((prev) =>
      prev.map((state) =>
        state.playerId === currentPlayer.id
          ? { ...state, strategyCardUsed: true, strategyCardUsedOnTurn: globalTurnCounter }
          : state
      )
    );

    // Save to database
    await saveStrategyCardAction({
      gameId,
      roundNumber,
      playerId: currentPlayer.id,
      strategyCardId: strategyCard.strategyCardId,
    });

    // Increment global turn counter
    setGlobalTurnCounter((prev) => prev + 1);

    // Check if this is Politics card (card 3) - open speaker selection modal
    if (strategyCard.strategyCardId === 3) {
      setShowPoliticsModal(true);
      return; // Don't advance turn yet - wait for speaker selection
    }

    // Move to next player
    advanceToNextPlayer();
  };

  // Handle strategy card cancel button - just close without processing
  const handleStrategyCardCancel = () => {
    setIsStrategyCardActionInProgress(false);
  };

  // Handle speaker selection from Politics card
  const handleSelectSpeaker = async (newSpeakerId: string) => {
    if (!currentUserId) return;

    // Push current state to undo history BEFORE updating speaker
    pushHistory({
      type: 'speakerChange',
      newSpeakerId,
      data: getCurrentStateSnapshot(),
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Update speaker
    setCurrentSpeakerPlayerId(newSpeakerId);
    setShowPoliticsModal(false);

    // Save to database
    await changeSpeaker({
      gameId,
      newSpeakerId,
    });

    // Now advance to next player
    advanceToNextPlayer();
  };

  // Handle Politics modal cancel
  const handlePoliticsCancel = () => {
    if (!currentPlayer) return;

    setShowPoliticsModal(false);

    // Revert the strategy card action since they canceled
    setPlayerActionStates((prev) =>
      prev.map((state) =>
        state.playerId === currentPlayer.id
          ? {
              ...state,
              strategyCardUsed: false,
              strategyCardUsedOnTurn: undefined,
            }
          : state
      )
    );

    // Decrement the global turn counter since this action is being canceled
    setGlobalTurnCounter((prev) => prev - 1);

    // Don't advance turn - let them try another action
  };

  // Handle pass action
  const handlePass = async () => {
    if (!currentPlayer || !currentUserId || !currentPlayerState) return;

    // Can only pass after using strategy card
    if (!currentPlayerState.strategyCardUsed) return;

    // Push current state to undo history BEFORE updating
    pushHistory({
      type: 'passAction',
      data: getCurrentStateSnapshot(),
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Mark player as passed
    setPlayerActionStates((prev) =>
      prev.map((state) => (state.playerId === currentPlayer.id ? { ...state, hasPassed: true } : state))
    );

    // Save to database
    await savePassAction({
      gameId,
      roundNumber,
      playerId: currentPlayer.id,
    });

    // Move to next player
    advanceToNextPlayer();
  };

  // Advance to next player
  const advanceToNextPlayer = () => {
    setCurrentTurnIndex((prev) => prev + 1);
  };

  // Handle undo
  const handleUndo = useCallback(() => {
    if (!currentUserId || !canUndo(currentUserId, isHost || false)) return;

    const undoStack = useStore.getState().undoStack;
    if (undoStack.length === 0) return;

    const entry = undoStack[undoStack.length - 1];
    if (!entry) return;

    // Only process action phase entries, ignore strategy selection entries
    if (entry.type === 'strategySelection') return;

    // Manually manage the stacks
    const currentStateEntry = {
      type: entry.type,
      data: getCurrentStateSnapshot(),
      userId: currentUserId,
      timestamp: Date.now(),
    };

    // Pop from undo stack and push current state to redo stack
    useStore.setState((state) => ({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [...state.redoStack, currentStateEntry as any],
    }));

    // Restore to the "before" state
    if (
      entry.type === 'actionPhaseAction' ||
      entry.type === 'strategyCardAction' ||
      entry.type === 'passAction' ||
      entry.type === 'speakerChange'
    ) {
      setPlayerActionStates(entry.data.playerActionStates);
      setCurrentSpeakerPlayerId(entry.data.speakerPlayerId);

      // Find the turn index for the restored current player
      const restoredPlayerIndex = activePlayers.findIndex(
        (s) => s.playerId === entry.data.currentTurnPlayerId
      );
      if (restoredPlayerIndex !== -1) {
        setCurrentTurnIndex(restoredPlayerIndex);
      }
    }
  }, [currentUserId, isHost, canUndo, activePlayers, getCurrentStateSnapshot]);

  // Handle redo
  const handleRedo = useCallback(() => {
    if (!canRedo()) return;

    const redoStack = useStore.getState().redoStack;
    if (redoStack.length === 0) return;

    const entry = redoStack[redoStack.length - 1];
    if (!entry) return;

    // Only process action phase entries, ignore strategy selection entries
    if (entry.type === 'strategySelection') return;

    // Manually manage the stacks
    const currentStateEntry = {
      type: entry.type,
      data: getCurrentStateSnapshot(),
      userId: currentUserId || '',
      timestamp: Date.now(),
    };

    // Pop from redo stack and push current state to undo stack
    useStore.setState((state) => ({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [...state.undoStack, currentStateEntry as any],
    }));

    // Restore to the "after" state
    if (
      entry.type === 'actionPhaseAction' ||
      entry.type === 'strategyCardAction' ||
      entry.type === 'passAction' ||
      entry.type === 'speakerChange'
    ) {
      setPlayerActionStates(entry.data.playerActionStates);
      setCurrentSpeakerPlayerId(entry.data.speakerPlayerId);

      // Find the turn index for the restored current player
      const restoredPlayerIndex = activePlayers.findIndex(
        (s) => s.playerId === entry.data.currentTurnPlayerId
      );
      if (restoredPlayerIndex !== -1) {
        setCurrentTurnIndex(restoredPlayerIndex);
      }
    }
  }, [canRedo, currentUserId, activePlayers, getCurrentStateSnapshot]);

  // Keyboard shortcuts for undo/redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Z for undo (Cmd+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Ctrl+Y or Ctrl+Shift+Z for redo (Cmd+Shift+Z on Mac)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  // Check if all players have passed
  const allPlayersPassed = playerActionStates.every((state) => state.hasPassed);

  // Handle end phase
  const handleEndPhase = () => {
    if (allPlayersPassed) {
      onComplete();
    }
  };

  if (!currentPlayer) {
    return (
      <Panel>
        <h2>Action Phase</h2>
        <p>No active players remaining or waiting for data...</p>
        <Button onClick={handleEndPhase} variant="primary">
          End Action Phase
        </Button>
      </Panel>
    );
  }

  const currentStrategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
  const strategyCardData = currentStrategyCard
    ? STRATEGY_CARDS.find((c) => c.id === currentStrategyCard.strategyCardId)
    : null;

  // Get turn counter for current player (count their tactical + component actions + 1 for current turn)
  const currentPlayerTurnCount = currentPlayerState
    ? currentPlayerState.tacticalActionsCount + currentPlayerState.componentActionsCount + 1
    : 1;

  return (
    <div className={styles.container}>
      {/* Turn Indicator Panel - Matching Strategy Phase */}
      <Panel className={styles.turnIndicator}>
        <div className={styles.turnPanelLayout}>
          <div className={styles.turnPanelSpacer}></div>

          <div className={styles.turnPanelCenter}>
            {/* Action Queue Bar */}
            <div className={styles.turnQueueBar}>
              {(() => {
                const activeTurnSelection = activePlayers[currentTurnIndex % activePlayers.length];
                const nextTurnSelection = activePlayers[(currentTurnIndex + 1) % activePlayers.length];

                // Sort queue: on-deck first, then others (excluding current player)
                const sortedTurnOrder = [...turnOrder].sort((a, b) => {
                  const aState = playerActionStates.find((s) => s.playerId === a.playerId);
                  const bState = playerActionStates.find((s) => s.playerId === b.playerId);

                  const aIsCurrent = activeTurnSelection?.playerId === a.playerId;
                  const bIsCurrent = activeTurnSelection?.playerId === b.playerId;
                  const aIsOnDeck = !aState?.hasPassed && nextTurnSelection?.playerId === a.playerId;
                  const bIsOnDeck = !bState?.hasPassed && nextTurnSelection?.playerId === b.playerId;

                  // Current player is hidden, but handle for sorting
                  if (aIsCurrent) return 1;
                  if (bIsCurrent) return -1;

                  // On-deck player comes first
                  if (aIsOnDeck) return -1;
                  if (bIsOnDeck) return 1;

                  // Maintain original order for others
                  return 0;
                });

                return sortedTurnOrder.map((selection) => {
                  const player = players.find((p) => p.id === selection.playerId);
                  const state = playerActionStates.find((s) => s.playerId === selection.playerId);
                  const cardData = STRATEGY_CARDS.find((c) => c.id === selection.strategyCardId);

                  if (!player || !state) return null;

                  const isCurrent = activeTurnSelection?.playerId === player.id;
                  const isOnDeck = !state.hasPassed && nextTurnSelection?.playerId === player.id;
                  const isPassed = state.hasPassed;

                  // Hide current player from queue - they'll be shown separately below
                  if (isCurrent) return null;

                  return (
                    <div
                      key={player.id}
                      className={`${styles.queueBarItem} ${isOnDeck ? styles.queueBarCurrent : ''} ${isPassed ? styles.queueBarPassed : ''}`}
                      style={{
                        borderColor: getPlayerColor(player.color),
                      }}
                    >
                      {cardData && (
                        <StrategyCardNumber
                          number={selection.strategyCardId}
                          color={cardData.color}
                          size="small"
                          className={state.strategyCardUsed ? styles.cardNumberUsed : ''}
                        />
                      )}
                      <img
                        src={getFactionImage(player.factionId, 'color')}
                        alt={player.factionName}
                        className={styles.queueBarIcon}
                      />
                      <div className={styles.queueBarInfo}>
                        <div className={styles.queueBarTop}>
                          <div className={styles.queueBarNames}>
                            <div className={styles.queueBarFaction} style={{ color: getPlayerColor(player.color) }}>
                              {FACTIONS[player.factionId]?.shortName || player.factionName}
                            </div>
                            <div className={styles.queueBarPlayer}>
                              ({player.displayName})
                            </div>
                          </div>
                          <div className={styles.queueBarTacticalCount}>
                            {state.tacticalActionsCount > 0 && `T${state.tacticalActionsCount}`}
                            {state.tacticalActionsCount > 0 && state.componentActionsCount > 0 && ' '}
                            {state.componentActionsCount > 0 && `C${state.componentActionsCount}`}
                            {state.tacticalActionsCount === 0 && state.componentActionsCount === 0 && '—'}
                          </div>
                        </div>
                        <div className={styles.queueBarStatuses}>
                          {state.hasPassed && <div className={styles.queueBarStatus}>Passed</div>}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Current Player Display with Turn Info */}
            <div className={styles.currentPlayerDisplay}>
              {(() => {
                const currentStrategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
                const currentState = playerActionStates.find((s) => s.playerId === currentPlayer.id);
                const currentCardData = currentStrategyCard
                  ? STRATEGY_CARDS.find((c) => c.id === currentStrategyCard.strategyCardId)
                  : null;

                return (
                  <>
                    <div
                      className={styles.currentPlayerCard}
                      style={{
                        borderColor: getPlayerColor(currentPlayer.color),
                      }}
                    >
                      {currentCardData && (
                        <StrategyCardNumber
                          number={currentStrategyCard!.strategyCardId}
                          color={currentCardData.color}
                          size="small"
                          className={currentState?.strategyCardUsed ? styles.cardNumberUsed : ''}
                        />
                      )}
                      <img
                        src={getFactionImage(currentPlayer.factionId, 'color')}
                        alt={currentPlayer.factionName}
                        className={styles.currentPlayerIcon}
                      />
                      <div className={styles.currentPlayerInfo}>
                        <div className={styles.currentPlayerTop}>
                          <div className={styles.currentPlayerNames}>
                            <div className={styles.currentPlayerFaction} style={{ color: getPlayerColor(currentPlayer.color) }}>
                              {FACTIONS[currentPlayer.factionId]?.name || currentPlayer.factionName}
                            </div>
                            <div className={styles.currentPlayerName}>
                              ({currentPlayer.displayName})
                            </div>
                          </div>
                          <div className={styles.currentPlayerTacticalCount}>
                            {currentState && currentState.tacticalActionsCount > 0 && `T${currentState.tacticalActionsCount}`}
                            {currentState && currentState.tacticalActionsCount > 0 && currentState.componentActionsCount > 0 && ' '}
                            {currentState && currentState.componentActionsCount > 0 && `C${currentState.componentActionsCount}`}
                            {currentState && currentState.tacticalActionsCount === 0 && currentState.componentActionsCount === 0 && '—'}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Turn Text */}
                    <div className={styles.turnInfo}>
                      <div className={styles.currentTurnText}>
                        <div
                          className={styles.currentPlayer}
                          style={{ color: getPlayerColor(currentPlayer.color) }}
                        >
                          {FACTIONS[currentPlayer.factionId]?.name || currentPlayer.factionName}, {currentPlayer.displayName}
                        </div>
                        <div className={styles.turnPrompt}>
                          Choose Your Action <span className={styles.turnCount}>[Turn {currentPlayerTurnCount}]</span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          <div className={styles.turnPanelActions}>
            <Button
              variant="secondary"
              onClick={handleUndo}
              disabled={!currentUserId || !canUndo(currentUserId, isHost || false)}
            >
              Undo
            </Button>
            <Button
              variant="secondary"
              onClick={handleRedo}
              disabled={!canRedo()}
            >
              Redo
            </Button>
          </div>
        </div>
      </Panel>

      {/* Content Area: Left panels (70%) + Right column (30% - actions + strategy card) */}
      <div className={styles.contentArea}>
        {/* Left Column - Will contain multiple panels stacked vertically */}
        <div className={styles.leftColumn}>
          {/* Future panels will be added here */}
          {allPlayersPassed && (
            <Panel className={styles.endPhasePanel}>
              <Button onClick={handleEndPhase} variant="primary" size="large">
                End Action Phase
              </Button>
            </Panel>
          )}
        </div>

        {/* Right Column - Action buttons + Strategy Card stacked */}
        <div className={styles.rightColumn}>
          {/* Action Buttons Panel - Hide when strategy card is in progress */}
          {!isStrategyCardActionInProgress && (
            <Panel className={styles.actionPanel}>
              <div className={styles.actionButtons}>
                <div className={styles.actionButtonRow}>
                  <Button
                    onClick={handleTacticalAction}
                    variant="primary"
                    size="large"
                    customColor="#1e88e5"
                    className={styles.halfButton}
                  >
                    Tactical
                  </Button>
                  <Button
                    onClick={handleComponentAction}
                    variant="primary"
                    size="large"
                    customColor="#fb8c00"
                    className={styles.halfButton}
                  >
                    Component
                  </Button>
                </div>

                <Button
                  onClick={handleStrategyCardAction}
                  variant="primary"
                  size="large"
                  disabled={currentPlayerState?.strategyCardUsed}
                  customColor="#1a1a1a"
                  customBorderColor={strategyCardData?.color}
                  className={styles.strategyCardButton}
                >
                  Use {strategyCardData?.name || 'Strategy'} Card
                  {currentPlayerState?.strategyCardUsed && (
                    <span className={styles.buttonSubtext}>(Already Used)</span>
                  )}
                </Button>

                <Button
                  onClick={handlePass}
                  variant="secondary"
                  size="large"
                  disabled={!currentPlayerState?.strategyCardUsed}
                >
                  Pass
                  {!currentPlayerState?.strategyCardUsed && (
                    <span className={styles.buttonSubtext}>(Must use strategy card first)</span>
                  )}
                </Button>
              </div>
            </Panel>
          )}

          {/* Strategy Card */}
          {currentStrategyCard && (
            <ActionStrategyCard
              cardId={currentStrategyCard.strategyCardId}
              isUsed={currentPlayerState?.strategyCardUsed || false}
              usedOnTurn={currentPlayerState?.strategyCardUsedOnTurn}
              isInProgress={isStrategyCardActionInProgress}
              onDone={handleStrategyCardDone}
              onCancel={handleStrategyCardCancel}
            />
          )}
        </div>
      </div>

      {/* Politics Card Modal */}
      {showPoliticsModal && (
        <PoliticsCardModal
          players={players}
          currentSpeakerId={currentSpeakerPlayerId}
          onSelectSpeaker={handleSelectSpeaker}
          onCancel={handlePoliticsCancel}
        />
      )}
    </div>
  );
}
