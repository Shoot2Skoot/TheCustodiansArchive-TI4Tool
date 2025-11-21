import { useState, useEffect, useCallback } from 'react';
import { Panel, Button } from '@/components/common';
import { STRATEGY_CARDS, getPlayerColor } from '@/lib/constants';
import { getFactionImage, FACTIONS } from '@/lib/factions';
import { useStore } from '@/store';
import { getCurrentUserId } from '@/lib/auth';
import type { PlayerActionState, ActionPhaseState } from '@/store/slices/undoSlice';
import { StrategyCardActionModal } from './StrategyCardActionModal';
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
  const [showStrategyCardModal, setShowStrategyCardModal] = useState(false);
  const [modalCardId, setModalCardId] = useState<number | null>(null);
  const [modalPlayerName, setModalPlayerName] = useState<string>('');
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

  // Handle tactical/component action
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

  // Handle strategy card action - open modal
  const handleStrategyCardAction = () => {
    if (!currentPlayer || !currentPlayerState) return;

    // Can only use strategy card once
    if (currentPlayerState.strategyCardUsed) return;

    const strategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
    if (!strategyCard) return;

    // Open the strategy card modal
    setModalCardId(strategyCard.strategyCardId);
    setModalPlayerName(currentPlayer.displayName);
    setShowStrategyCardModal(true);
  };

  // Handle strategy card modal close - process the action
  const handleStrategyCardModalClose = async () => {
    setShowStrategyCardModal(false);

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
    setShowPoliticsModal(false);
    // Still advance turn even if they cancel speaker selection
    advanceToNextPlayer();
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

  // Get turn counter for current player (count their tactical actions + 1 for current turn)
  const currentPlayerTurnCount = currentPlayerState ? currentPlayerState.tacticalActionsCount + 1 : 1;

  return (
    <div className={styles.container}>
      {/* Turn Indicator Panel - Matching Strategy Phase */}
      <Panel className={styles.turnIndicator}>
        <div className={styles.turnPanelLayout}>
          <div className={styles.turnPanelSpacer}></div>

          <div className={styles.turnPanelCenter}>
            {/* Action Queue Bar */}
            <div className={styles.turnQueueBar}>
              {turnOrder.map((selection) => {
                const player = players.find((p) => p.id === selection.playerId);
                const state = playerActionStates.find((s) => s.playerId === selection.playerId);

                if (!player || !state) return null;

                const activeTurnSelection = activePlayers[currentTurnIndex % activePlayers.length];
                const isCurrent = activeTurnSelection?.playerId === player.id;
                const nextTurnSelection = activePlayers[(currentTurnIndex + 1) % activePlayers.length];
                const isOnDeck = !state.hasPassed && nextTurnSelection?.playerId === player.id;
                const isPassed = state.hasPassed;

                return (
                  <div
                    key={player.id}
                    className={`${styles.queueBarItem} ${isCurrent ? styles.queueBarCurrent : ''} ${isOnDeck ? styles.queueBarOnDeck : ''} ${isPassed ? styles.queueBarPassed : ''}`}
                    style={{
                      borderColor: getPlayerColor(player.color),
                    }}
                  >
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
                          {state.tacticalActionsCount}
                        </div>
                      </div>
                      <div className={styles.queueBarStatuses}>
                        {state.strategyCardUsed && (
                          <div className={styles.queueBarStatus}>Card Used</div>
                        )}
                        {state.hasPassed && <div className={styles.queueBarStatus}>Passed</div>}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Current Turn Indicator */}
            <div className={styles.turnInfo}>
              <div className={styles.currentTurnText}>
                <span
                  className={styles.currentPlayer}
                  style={{ color: getPlayerColor(currentPlayer.color) }}
                >
                  {currentPlayer.factionName}, {currentPlayer.displayName}
                </span>
                <span className={styles.turnPrompt}>, Choose Your Action</span>
                <span className={styles.turnCount}>
                  [Turn {currentPlayerTurnCount}]
                </span>
              </div>
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
          {/* Action Buttons Panel */}
          <Panel className={styles.actionPanel}>
            <div className={styles.actionButtons}>
              <Button onClick={handleTacticalAction} variant="primary" size="large">
                Tactical / Component Action
              </Button>

              <Button
                onClick={handleStrategyCardAction}
                variant="primary"
                size="large"
                disabled={currentPlayerState?.strategyCardUsed}
                style={{
                  backgroundColor: strategyCardData?.color,
                  borderColor: strategyCardData?.color,
                }}
              >
                Use {strategyCardData?.name || 'Strategy Card'}
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

          {/* Strategy Card */}
          {currentStrategyCard && (
            <ActionStrategyCard
              cardId={currentStrategyCard.strategyCardId}
              isUsed={currentPlayerState?.strategyCardUsed || false}
              usedOnTurn={currentPlayerState?.strategyCardUsedOnTurn}
            />
          )}
        </div>
      </div>

      {/* Strategy Card Action Modal */}
      {showStrategyCardModal && modalCardId !== null && (
        <StrategyCardActionModal
          strategyCardId={modalCardId}
          playerName={modalPlayerName}
          onClose={handleStrategyCardModalClose}
        />
      )}

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
