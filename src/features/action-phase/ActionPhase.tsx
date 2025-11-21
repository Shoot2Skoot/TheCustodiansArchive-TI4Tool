import { useState, useEffect, useCallback } from 'react';
import { Panel, Button } from '@/components/common';
import { STRATEGY_CARDS } from '@/lib/constants';
import { useStore } from '@/store';
import { getCurrentUserId } from '@/lib/auth';
import type { PlayerActionState, ActionPhaseState } from '@/store/slices/undoSlice';
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
  cardId: number;
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
  players,
  roundNumber,
  strategySelections,
  speakerPlayerId,
  onComplete,
}: ActionPhaseProps) {
  // Local state for action phase
  const [playerActionStates, setPlayerActionStates] = useState<PlayerActionState[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentSpeakerPlayerId, setCurrentSpeakerPlayerId] = useState<string | null>(speakerPlayerId);

  // Get undo/redo functions from store
  const pushHistory = useStore((state) => state.pushHistory);
  const canUndo = useStore((state) => state.canUndo);
  const canRedo = useStore((state) => state.canRedo);
  const currentGame = useStore((state) => state.currentGame);

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
  const turnOrder = [...strategySelections].sort((a, b) => a.cardId - b.cardId);

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
  const handleTacticalAction = () => {
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

    // Move to next player
    advanceToNextPlayer();
  };

  // Handle strategy card action
  const handleStrategyCardAction = () => {
    if (!currentPlayer || !currentUserId || !currentPlayerState) return;

    // Can only use strategy card once
    if (currentPlayerState.strategyCardUsed) return;

    // Push current state to undo history BEFORE updating
    const strategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
    if (!strategyCard) return;

    pushHistory({
      type: 'strategyCardAction',
      strategyCardId: strategyCard.cardId,
      data: getCurrentStateSnapshot(),
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Mark strategy card as used
    setPlayerActionStates((prev) =>
      prev.map((state) =>
        state.playerId === currentPlayer.id ? { ...state, strategyCardUsed: true } : state
      )
    );

    // Check if this is Politics card (card 3) - will open speaker selection modal later
    if (strategyCard.cardId === 3) {
      // TODO: Open speaker selection modal
      console.log('Politics card - speaker selection needed');
    }

    // Move to next player
    advanceToNextPlayer();
  };

  // Handle pass action
  const handlePass = () => {
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
    ? STRATEGY_CARDS.find((c) => c.id === currentStrategyCard.cardId)
    : null;

  return (
    <Panel className={styles.actionPhasePanel}>
      <div className={styles.header}>
        <h2>Action Phase - Round {roundNumber}</h2>
        <div className={styles.undoButtons}>
          <Button
            onClick={handleUndo}
            disabled={!currentUserId || !canUndo(currentUserId, isHost || false)}
            variant="secondary"
            size="small"
          >
            Undo
          </Button>
          <Button onClick={handleRedo} disabled={!canRedo()} variant="secondary" size="small">
            Redo
          </Button>
        </div>
      </div>

      <div className={styles.currentPlayerDisplay}>
        <h3>Current Player</h3>
        <div className={styles.playerInfo}>
          <div className={styles.playerColor} style={{ backgroundColor: currentPlayer.color }} />
          <span className={styles.playerName}>{currentPlayer.displayName}</span>
          <span className={styles.factionName}>({currentPlayer.factionName})</span>
        </div>
        {strategyCardData && (
          <div className={styles.strategyCardInfo}>
            <div
              className={styles.strategyCardBadge}
              style={{ backgroundColor: strategyCardData.color }}
            >
              {strategyCardData.id}. {strategyCardData.name}
            </div>
          </div>
        )}
      </div>

      <div className={styles.actionButtons}>
        <Button onClick={handleTacticalAction} variant="primary" size="large">
          Tactical / Component Action
          <span className={styles.buttonSubtext}>Resolving...</span>
        </Button>

        <Button
          onClick={handleStrategyCardAction}
          variant="primary"
          size="large"
          disabled={currentPlayerState?.strategyCardUsed}
        >
          Use Strategy Card
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

      {allPlayersPassed && (
        <div className={styles.endPhaseSection}>
          <Button onClick={handleEndPhase} variant="primary" size="large">
            End Action Phase
          </Button>
        </div>
      )}

      <div className={styles.playerStates}>
        <h4>Player Status</h4>
        <div className={styles.playerList}>
          {turnOrder.map((selection) => {
            const player = players.find((p) => p.id === selection.playerId);
            const state = playerActionStates.find((s) => s.playerId === selection.playerId);
            const card = STRATEGY_CARDS.find((c) => c.id === selection.cardId);

            if (!player || !state || !card) return null;

            return (
              <div key={player.id} className={styles.playerStateItem}>
                <div className={styles.playerColor} style={{ backgroundColor: player.color }} />
                <span className={styles.playerName}>{player.displayName}</span>
                <div className={styles.cardBadge} style={{ backgroundColor: card.color }}>
                  {card.id}
                </div>
                <div className={styles.stateIndicators}>
                  {state.strategyCardUsed && <span className={styles.indicator}>✓ Card Used</span>}
                  {state.hasPassed && <span className={styles.indicator}>⏸ Passed</span>}
                  {state.tacticalActionsCount > 0 && (
                    <span className={styles.indicator}>
                      {state.tacticalActionsCount} Tactical
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Panel>
  );
}
