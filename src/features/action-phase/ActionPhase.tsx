import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { Panel, Button, StrategyCardNumber } from '@/components/common';
import { STRATEGY_CARDS, getPlayerColor, type PlayerColor } from '@/lib/constants';
import { getFactionImage, FACTIONS } from '@/lib/factions';
import { useStore } from '@/store';
import { getCurrentUserId } from '@/lib/auth';
import type { PlayerActionState, ActionPhaseState } from '@/store/slices/undoSlice';
import { setObjectiveCompletion } from '@/lib/db/objectives';
import { claimMecatolRex, getGameState } from '@/lib/db/gameState';
import { PoliticsCardModal } from './PoliticsCardModal';
import { MecatolRexModal } from './MecatolRexModal';
import { ActionStrategyCard } from './ActionStrategyCard';
import { ObjectivesPanel } from './ObjectivesPanel';
import { useSaveActionPhaseState } from './useSaveActionPhaseState';
import { PhaseType, PromptType, EventType } from '@/lib/audio';
import { playPhaseEnter, playPhaseExit, playFactionPrompt, playStrategyCard, playEvent } from '@/lib/audio';
import { normalizeFactionId, getStrategyCardAudioType } from '@/lib/audioHelpers';
import { getPlayerActionStates } from '@/lib/db/playerActionState';
import styles from './ActionPhase.module.css';

// Session storage keys for audio tracking (persists across StrictMode remounts)
const AUDIO_ENTRY_KEY = 'actionPhase_audioEntry';
const AUDIO_PROMPT_KEY = 'actionPhase_lastPromptPlayerId';

// Helper functions for audio tracking with sessionStorage
const hasPlayedPhaseEntry = () => sessionStorage.getItem(AUDIO_ENTRY_KEY) === 'true';
const setPlayedPhaseEntry = () => sessionStorage.setItem(AUDIO_ENTRY_KEY, 'true');
const getLastPromptPlayerId = () => sessionStorage.getItem(AUDIO_PROMPT_KEY);
const setLastPromptPlayerId = (id: string) => sessionStorage.setItem(AUDIO_PROMPT_KEY, id);
const resetAudioTracking = () => {
  sessionStorage.removeItem(AUDIO_ENTRY_KEY);
  sessionStorage.removeItem(AUDIO_PROMPT_KEY);
};

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
  onUndoRedoChange?: (handlers: {
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
  } | null) => void;
}

// Maximum number of players to show in full format in the queue bar
const MAX_FULL_QUEUE_ITEMS = 5;
// Maximum number of players to show in condensed format (just icon + initiative)
const MAX_CONDENSED_QUEUE_ITEMS = 4;
// Total items shown
const MAX_TOTAL_QUEUE_ITEMS = MAX_FULL_QUEUE_ITEMS + MAX_CONDENSED_QUEUE_ITEMS;

export function ActionPhase({
  gameId,
  players,
  roundNumber,
  strategySelections,
  speakerPlayerId,
  onComplete,
  onUndoRedoChange,
}: ActionPhaseProps) {
  // Debug logging - monitor render frequency
  console.log('🔵 ActionPhase render');

  // Local state for action phase
  const [playerActionStates, setPlayerActionStates] = useState<PlayerActionState[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [globalTurnCounter, setGlobalTurnCounter] = useState(1);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [currentSpeakerPlayerId, setCurrentSpeakerPlayerId] = useState<string | null>(speakerPlayerId);
  const [isStrategyCardActionInProgress, setIsStrategyCardActionInProgress] = useState(false);
  const [showPoliticsModal, setShowPoliticsModal] = useState(false);
  const [showChangeSpeakerModal, setShowChangeSpeakerModal] = useState(false);
  const [showMecatolRexModal, setShowMecatolRexModal] = useState(false);
  const [actionInProgress, setActionInProgress] = useState<'tactical' | 'component' | null>(null);
  const hasLoadedInitialState = useRef(false);

  // Get undo/redo functions from store
  const pushHistory = useStore((state) => state.pushHistory);
  const canUndo = useStore((state) => state.canUndo);
  const canRedo = useStore((state) => state.canRedo);
  const triggerObjectivesReload = useStore((state) => state.triggerObjectivesReload);
  const mecatolRexOwnerId = useStore((state) => state.gameState?.mecatolRexOwnerId);
  const mecatolClaimed = useStore((state) => state.gameState?.mecatolClaimed);
  const gameCreatedBy = useStore((state) => state.currentGame?.createdBy);
  const setGameState = useStore((state) => state.setGameState);

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

  // Play Action Phase entry sound once on mount
  useEffect(() => {
    if (!hasPlayedPhaseEntry()) {
      setPlayedPhaseEntry();
      playPhaseEnter(PhaseType.ACTION);
    }
    // Note: No cleanup - sessionStorage persists across StrictMode remounts
    // It will auto-clear when the browser session ends
  }, []);

  // Initialize player action states - load from database ONCE on mount
  useEffect(() => {
    // Only load once to avoid overwriting local state changes
    if (hasLoadedInitialState.current) return;

    const loadPlayerActionStates = async () => {
      try {
        const dbStates = await getPlayerActionStates(gameId, roundNumber);

        // Map database format to local state format
        const loadedStates: PlayerActionState[] = players.map((player) => {
          const dbState = dbStates.find((s) => s.player_id === player.id);
          return {
            playerId: player.id,
            strategyCardUsed: dbState?.strategy_card_used || false,
            hasPassed: dbState?.has_passed || false,
            tacticalActionsCount: dbState?.tactical_actions_count || 0,
            componentActionsCount: dbState?.component_actions_count || 0,
          };
        });

        setPlayerActionStates(loadedStates);
        hasLoadedInitialState.current = true;
      } catch (error) {
        console.error('Error loading player action states:', error);
        // Fallback to empty states on error
        const initialStates: PlayerActionState[] = players.map((player) => ({
          playerId: player.id,
          strategyCardUsed: false,
          hasPassed: false,
          tacticalActionsCount: 0,
          componentActionsCount: 0,
        }));
        setPlayerActionStates(initialStates);
        hasLoadedInitialState.current = true;
      }
    };

    loadPlayerActionStates();
    // Intentionally only depend on gameId and roundNumber, NOT players
    // to avoid reloading and overwriting local state changes
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, roundNumber]);

  // Calculate turn order based on strategy card initiative
  const turnOrder = useMemo(
    () => [...strategySelections].sort((a, b) => a.strategyCardId - b.strategyCardId),
    [strategySelections]
  );

  // Get active players (not passed)
  const activePlayers = useMemo(
    () => turnOrder.filter((selection) => {
      const state = playerActionStates.find((s) => s.playerId === selection.playerId);
      return !state?.hasPassed;
    }),
    [turnOrder, playerActionStates]
  );

  // Get current player
  const currentTurnSelection = activePlayers[currentTurnIndex % activePlayers.length];
  const currentPlayer = currentTurnSelection
    ? players.find((p) => p.id === currentTurnSelection.playerId)
    : null;
  const currentPlayerState = currentPlayer
    ? playerActionStates.find((s) => s.playerId === currentPlayer.id)
    : null;

  const isHost = currentUserId && gameCreatedBy === currentUserId;

  // Play faction prompt when turn changes
  useEffect(() => {
    if (currentPlayer && activePlayers.length > 0 && currentPlayer.id !== getLastPromptPlayerId()) {
      setLastPromptPlayerId(currentPlayer.id);
      const normalizedFactionId = normalizeFactionId(currentPlayer.factionId);
      playFactionPrompt(normalizedFactionId, PromptType.CHOOSE_ACTION, true);
    }
  }, [currentPlayer?.id, activePlayers.length]);

  // Get current game state snapshot for undo
  const getCurrentStateSnapshot = useCallback((): ActionPhaseState => ({
    currentTurnPlayerId: currentPlayer?.id || '',
    playerActionStates: [...playerActionStates],
    speakerPlayerId: currentSpeakerPlayerId,
  }), [currentPlayer?.id, playerActionStates, currentSpeakerPlayerId]);

  // Handle tactical action - show modal
  const handleTacticalAction = () => {
    setActionInProgress('tactical');
  };

  // Handle tactical action done
  const handleTacticalActionDone = async () => {
    if (!currentPlayer || !currentUserId) return;

    setActionInProgress(null);

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

  // Handle component action - show modal
  const handleComponentAction = () => {
    setActionInProgress('component');
  };

  // Handle component action done
  const handleComponentActionDone = async () => {
    if (!currentPlayer || !currentUserId) return;

    setActionInProgress(null);

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

  // Handle action cancel
  const handleActionCancel = () => {
    setActionInProgress(null);
  };

  // Handle strategy card action - activate glow effect
  const handleStrategyCardAction = () => {
    if (!currentPlayer || !currentPlayerState) return;

    // Can only use strategy card once
    if (currentPlayerState.strategyCardUsed) return;

    const strategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
    if (!strategyCard) return;

    // Play strategy card sound
    const cardAudioType = getStrategyCardAudioType(strategyCard.strategyCardId);
    if (cardAudioType) {
      playStrategyCard(cardAudioType);
    }

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

    // Play speaker change sound
    playEvent(EventType.SPEAKER_CHANGE);

    setShowPoliticsModal(false);

    // Save to database
    await changeSpeaker({
      gameId,
      newSpeakerId,
    });

    // Now advance to next player (Politics card action is complete)
    advanceToNextPlayer();
  };

  // Handle manual speaker change (from Change Speaker button)
  const handleManualSpeakerChange = async (newSpeakerId: string) => {
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

    // Play speaker change sound
    playEvent(EventType.SPEAKER_CHANGE);

    setShowChangeSpeakerModal(false);

    // Save to database
    await changeSpeaker({
      gameId,
      newSpeakerId,
    });

    // Do NOT advance to next player - this is a manual change outside of turn flow
  };

  // Handle Mecatol Rex claim
  const handleMecatolRexClaim = async (playerId: string) => {
    if (!currentUserId) return;

    const previousOwnerId = mecatolRexOwnerId;
    const wasClaimed = mecatolClaimed;

    console.log('🏛️ handleMecatolRexClaim called:', { playerId, previousOwnerId, wasClaimed });

    // Push to undo history BEFORE making the change
    pushHistory({
      type: 'mecatolRexClaim',
      newOwnerId: playerId,
      previousOwnerId,
      wasClaimed,
      userId: currentUserId,
      timestamp: Date.now(),
    });

    // Claim Mecatol Rex in the database
    try {
      await claimMecatolRex(gameId, playerId, roundNumber);
      console.log('✅ Mecatol Rex claim completed');

      // Play Mecatol Rex taken sound
      playEvent(EventType.MECATOL_REX_TAKEN);

      // Manually reload game state to ensure immediate UI update
      const newGameState = await getGameState(gameId);
      if (newGameState) {
        console.log('🔄 Manually updating game state after Mecatol Rex claim');
        setGameState(newGameState);
      }
    } catch (error) {
      console.error('❌ Error claiming Mecatol Rex:', error);
    }

    setShowMecatolRexModal(false);
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
  const handleUndo = useCallback(async () => {
    if (!currentUserId || !canUndo(currentUserId, isHost || false)) return;

    const undoStack = useStore.getState().undoStack;
    if (undoStack.length === 0) return;

    const entry = undoStack[undoStack.length - 1];
    if (!entry) return;

    // Only process action phase entries, ignore strategy selection entries
    if (entry.type === 'strategySelection') return;

    // Handle objective toggle separately
    if (entry.type === 'objectiveToggle') {
      // Pop from undo stack and push to redo stack
      useStore.setState((state) => ({
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, entry],
      }));

      // Restore to the state BEFORE the toggle
      await setObjectiveCompletion(entry.objectiveId, entry.playerId, entry.wasScored);
      triggerObjectivesReload();
      return;
    }

    // Handle Mecatol Rex claim separately
    if (entry.type === 'mecatolRexClaim') {
      // Pop from undo stack and push to redo stack
      useStore.setState((state) => ({
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, entry],
      }));

      // Restore to the state BEFORE the claim (previous owner or unclaimed)
      if (entry.wasClaimed && entry.previousOwnerId) {
        await claimMecatolRex(gameId, entry.previousOwnerId, roundNumber);
      } else {
        // Mecatol was unclaimed before, need to revert it
        // For now just set it back to the previous owner (which is null)
        // We'd need a separate function to unclaim, but let's keep it simple
        await claimMecatolRex(gameId, entry.previousOwnerId || '', roundNumber);
      }

      // Manually reload game state to ensure immediate UI update
      const newGameState = await getGameState(gameId);
      if (newGameState) {
        console.log('🔄 Manually updating game state after Mecatol Rex undo');
        setGameState(newGameState);
      }

      return;
    }

    // Manually manage the stacks for action phase entries
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
  }, [currentUserId, isHost, canUndo, activePlayers, getCurrentStateSnapshot, triggerObjectivesReload]);

  // Handle redo
  const handleRedo = useCallback(async () => {
    if (!canRedo()) return;

    const redoStack = useStore.getState().redoStack;
    if (redoStack.length === 0) return;

    const entry = redoStack[redoStack.length - 1];
    if (!entry) return;

    // Only process action phase entries, ignore strategy selection entries
    if (entry.type === 'strategySelection') return;

    // Handle objective toggle separately
    if (entry.type === 'objectiveToggle') {
      // Pop from redo stack and push to undo stack
      useStore.setState((state) => ({
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, entry],
      }));

      // Re-apply the change (opposite of wasScored)
      await setObjectiveCompletion(entry.objectiveId, entry.playerId, !entry.wasScored);
      triggerObjectivesReload();
      return;
    }

    // Handle Mecatol Rex claim separately
    if (entry.type === 'mecatolRexClaim') {
      // Pop from redo stack and push to undo stack
      useStore.setState((state) => ({
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, entry],
      }));

      // Re-apply the claim (new owner)
      await claimMecatolRex(gameId, entry.newOwnerId, roundNumber);
      return;
    }

    // Manually manage the stacks for action phase entries
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
  }, [canRedo, currentUserId, activePlayers, getCurrentStateSnapshot, triggerObjectivesReload]);

  // Provide undo/redo handlers to parent component
  useEffect(() => {
    if (onUndoRedoChange) {
      onUndoRedoChange({
        canUndo: currentUserId ? canUndo(currentUserId, isHost || false) : false,
        canRedo: canRedo(),
        onUndo: handleUndo,
        onRedo: handleRedo,
      });
    }

    // Cleanup when component unmounts
    return () => {
      if (onUndoRedoChange) {
        onUndoRedoChange(null);
      }
    };
  }, [currentUserId, isHost, canUndo, canRedo, handleUndo, handleRedo, onUndoRedoChange]);

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
      // Play phase exit sound
      playPhaseExit(PhaseType.ACTION);
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

                // Sort queue: starting from on-deck player, continue in initiative order (wrapping around)
                const onDeckInitiative = nextTurnSelection ? turnOrder.find(t => t.playerId === nextTurnSelection.playerId)?.strategyCardId : null;

                const sortedTurnOrder = [...turnOrder].sort((a, b) => {
                  const aIsCurrent = activeTurnSelection?.playerId === a.playerId;
                  const bIsCurrent = activeTurnSelection?.playerId === b.playerId;

                  // Current player is hidden, sort them to the end
                  if (aIsCurrent) return 1;
                  if (bIsCurrent) return -1;

                  // Sort by initiative order, wrapping around from on-deck player
                  if (onDeckInitiative != null) {
                    const aInitiative = a.strategyCardId;
                    const bInitiative = b.strategyCardId;

                    // Calculate position relative to on-deck initiative (wrapping around)
                    const aOffset = aInitiative >= onDeckInitiative ? aInitiative - onDeckInitiative : (8 - onDeckInitiative) + aInitiative;
                    const bOffset = bInitiative >= onDeckInitiative ? bInitiative - onDeckInitiative : (8 - onDeckInitiative) + bInitiative;

                    return aOffset - bOffset;
                  }

                  return a.strategyCardId - b.strategyCardId;
                });

                // Limit the number of items shown in the queue to prevent overflow
                const visibleTurnOrder = sortedTurnOrder.slice(0, MAX_TOTAL_QUEUE_ITEMS + 1); // +1 to account for current player being filtered out

                let visibleItemIndex = 0; // Track index of visible items (excluding current player)

                return visibleTurnOrder.map((selection) => {
                  const player = players.find((p) => p.id === selection.playerId);
                  const state = playerActionStates.find((s) => s.playerId === selection.playerId);
                  const cardData = STRATEGY_CARDS.find((c) => c.id === selection.strategyCardId);

                  if (!player || !state) return null;

                  const isCurrent = activeTurnSelection?.playerId === player.id;
                  const isPassed = state.hasPassed;

                  // Hide current player from queue - they'll be shown separately below
                  if (isCurrent) return null;

                  // Determine if this item should be condensed (beyond the first N items)
                  const isCondensed = visibleItemIndex >= MAX_FULL_QUEUE_ITEMS;
                  visibleItemIndex++;

                  return (
                    <div
                      key={player.id}
                      className={`${styles.queueBarItem} ${isPassed ? styles.queueBarPassed : ''} ${isCondensed ? styles.queueBarCondensed : ''}`}
                      style={{
                        color: getPlayerColor(player.color as PlayerColor),
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
                      {!isCondensed && (
                        <div className={styles.queueBarInfo}>
                          <div className={styles.queueBarTop}>
                            <div className={styles.queueBarFaction} style={{ color: getPlayerColor(player.color as PlayerColor) }}>
                              {FACTIONS[player.factionId]?.shortName || player.factionName}
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
                      )}
                    </div>
                  );
                });
              })()}
            </div>

            {/* Current Player Display */}
            <div className={styles.currentPlayerDisplay}>
              {(() => {
                const currentStrategyCard = turnOrder.find((s) => s.playerId === currentPlayer.id);
                const currentState = playerActionStates.find((s) => s.playerId === currentPlayer.id);
                const currentCardData = currentStrategyCard
                  ? STRATEGY_CARDS.find((c) => c.id === currentStrategyCard.strategyCardId)
                  : null;

                return (
                  <div
                    className={styles.currentPlayerCard}
                    style={{
                      color: getPlayerColor(currentPlayer.color as PlayerColor),
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
                          <span className={styles.currentPlayerFaction} style={{ color: getPlayerColor(currentPlayer.color as PlayerColor) }}>
                            {FACTIONS[currentPlayer.factionId]?.name || currentPlayer.factionName}
                          </span>
                          <span className={styles.currentPlayerName}>
                            {currentPlayer.displayName}
                          </span>
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
                );
              })()}
            </div>
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

          {/* Middle Panels Container - 50/50 split */}
          <div className={styles.middlePanelsContainer}>
            {/* Public Objectives Panel */}
            <ObjectivesPanel gameId={gameId} />

            {/* Placeholder Panel */}
            <Panel className={styles.placeholderPanel}>
              <div className={styles.placeholderContent}>
                <p>Future content will go here</p>
              </div>
            </Panel>
          </div>

          {/* Game Action Buttons Panel */}
          <Panel className={styles.gameActionsPanel}>
            <div className={styles.gameActionButtons}>
              <Button onClick={() => setShowChangeSpeakerModal(true)} variant="secondary" size="medium">
                Change Speaker
              </Button>
              <Button onClick={() => setShowMecatolRexModal(true)} variant="secondary" size="medium">
                Mecatol Rex
              </Button>
              <Button onClick={() => console.log('Enter Combat clicked')} variant="secondary" size="medium">
                Enter Combat
              </Button>
            </div>
          </Panel>
        </div>

        {/* Right Column - Action buttons + Strategy Card stacked */}
        <div className={styles.rightColumn}>
          {/* Action Buttons Panel - Hide when any action is in progress */}
          {!isStrategyCardActionInProgress && !actionInProgress && (
            <Panel className={styles.actionPanel}>
              <div className={styles.actionPanelHeading}>
                Choose Your Action <span className={styles.turnCount}>[Turn {currentPlayerTurnCount}]</span>
              </div>
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

                <div className={styles.strategyPassRow}>
                  <Button
                    onClick={handleStrategyCardAction}
                    variant="primary"
                    size="large"
                    disabled={currentPlayerState?.strategyCardUsed}
                    customColor="#1a1a1a"
                    customBorderColor={strategyCardData?.color}
                    className={`${styles.strategyCardButton} ${currentPlayerState?.strategyCardUsed ? styles.narrowButton : styles.wideButton}`}
                  >
                    Use {strategyCardData?.name || 'Strategy'} Card
                    {currentPlayerState?.strategyCardUsed && (
                      <span className={styles.buttonSubtext}>(Already Used)</span>
                    )}
                  </Button>

                  <div
                    className={!currentPlayerState?.strategyCardUsed ? styles.narrowButton : styles.wideButton}
                    title={!currentPlayerState?.strategyCardUsed ? 'Must use strategy card first' : 'Pass your turn'}
                  >
                    <Button
                      onClick={handlePass}
                      variant="secondary"
                      size="large"
                      disabled={!currentPlayerState?.strategyCardUsed}
                      style={{ width: '100%' }}
                    >
                      Pass
                    </Button>
                  </div>
                </div>
              </div>
            </Panel>
          )}

          {/* Action Resolution Panel - Show when tactical or component action is in progress */}
          {actionInProgress && (
            <Panel className={styles.actionResolutionPanel} beveled>
              <div className={styles.actionResolutionHeading}>
                {actionInProgress === 'tactical' ? 'Tactical Action' : 'Component Action'} in Progress
              </div>
              <div className={styles.actionResolutionContent}>
                <p className={styles.actionResolutionText}>
                  {actionInProgress === 'tactical'
                    ? 'Resolve your tactical action. When complete, click Done to advance to the next player.'
                    : 'Resolve your component action. When complete, click Done to advance to the next player.'}
                </p>
                <div className={styles.actionResolutionButtons}>
                  <Button onClick={handleActionCancel} variant="secondary" size="large">
                    Cancel
                  </Button>
                  <Button
                    onClick={actionInProgress === 'tactical' ? handleTacticalActionDone : handleComponentActionDone}
                    variant="primary"
                    size="large"
                  >
                    Done
                  </Button>
                </div>
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

      {/* Change Speaker Modal */}
      {showChangeSpeakerModal && (
        <PoliticsCardModal
          players={players}
          currentSpeakerId={currentSpeakerPlayerId}
          onSelectSpeaker={handleManualSpeakerChange}
          onCancel={() => setShowChangeSpeakerModal(false)}
        />
      )}

      {/* Mecatol Rex Modal */}
      {showMecatolRexModal && (
        <MecatolRexModal
          players={players}
          mecatolRexOwnerId={mecatolRexOwnerId ?? null}
          custodiansTaken={mecatolClaimed ?? false}
          onClaimMecatolRex={handleMecatolRexClaim}
          onClose={() => setShowMecatolRexModal(false)}
        />
      )}
    </div>
  );
}
