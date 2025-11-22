import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from '../supabase';
import { useStore } from '../../store';
import type {
  Game,
  GameState,
  Player,
  StrategySelection,
  PlayerActionState,
  Objective,
} from '../../types';

// Helper functions to convert snake_case to camelCase
function gameStateToCamelCase(data: any): GameState {
  return {
    gameId: data.game_id,
    currentRound: data.current_round,
    currentPhase: data.current_phase,
    currentTurnPlayerId: data.current_turn_player_id,
    speakerPlayerId: data.speaker_player_id,
    mecatolClaimed: data.mecatol_claimed,
    mecatolClaimedRound: data.mecatol_claimed_round,
    lastActivityAt: data.last_activity_at,
    phaseStartedAt: data.phase_started_at,
    updatedAt: data.updated_at,
  };
}

function playerToCamelCase(data: any): Player {
  return {
    id: data.id,
    gameId: data.game_id,
    userId: data.user_id,
    position: data.position,
    factionId: data.faction_id,
    color: data.color,
    displayName: data.display_name,
    isReady: data.is_ready,
    createdAt: data.created_at,
  };
}

function strategySelectionToCamelCase(data: any): StrategySelection {
  return {
    id: data.id,
    gameId: data.game_id,
    roundNumber: data.round_number,
    playerId: data.player_id,
    strategyCardId: data.strategy_card_id,
    selectionOrder: data.selection_order,
    tradeGoodBonus: data.trade_good_bonus,
    createdAt: data.created_at,
  };
}

function playerActionStateToCamelCase(data: any): PlayerActionState {
  return {
    id: data.id,
    gameId: data.game_id,
    roundNumber: data.round_number,
    playerId: data.player_id,
    strategyCardUsed: data.strategy_card_used,
    hasPassed: data.has_passed,
    tacticalActionsCount: data.tactical_actions_count,
    componentActionsCount: data.component_actions_count,
    strategyCardUsedOnTurn: data.strategy_card_used_on_turn,
  };
}

function objectiveToCamelCase(data: any): Objective {
  return {
    id: data.id,
    gameId: data.game_id,
    type: data.type,
    objectiveId: data.objective_id,
    revealedRound: data.revealed_round,
    createdAt: data.created_at,
  };
}

// Subscribe to game updates
export function subscribeToGame(gameId: string): RealtimeChannel {
  const channel = supabase
    .channel(`game:${gameId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'games',
        filter: `id=eq.${gameId}`,
      },
      (payload) => {
        console.log('Game update:', payload);
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          useStore.getState().setCurrentGame(payload.new as Game);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'game_state',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        console.log('🔄 Game state update received:', payload);
        console.log('🔄 Event type:', payload.eventType);
        console.log('🔄 New game state (raw):', payload.new);
        if (payload.eventType === 'UPDATE' || payload.eventType === 'INSERT') {
          const newGameState = gameStateToCamelCase(payload.new);
          console.log('🔄 Setting game state with phase:', newGameState.currentPhase);
          useStore.getState().setGameState(newGameState);
          console.log('🔄 Game state set in store');
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'players',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        console.log('Player update:', payload);
        const currentPlayers = useStore.getState().players;

        if (payload.eventType === 'INSERT') {
          useStore.getState().setPlayers([...currentPlayers, playerToCamelCase(payload.new)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedPlayers = currentPlayers.map((p) =>
            p.id === payload.new.id ? playerToCamelCase(payload.new) : p
          );
          useStore.getState().setPlayers(updatedPlayers);
        } else if (payload.eventType === 'DELETE') {
          const filteredPlayers = currentPlayers.filter((p) => p.id !== payload.old.id);
          useStore.getState().setPlayers(filteredPlayers);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'strategy_selections',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        console.log('Strategy selection update:', payload);
        const currentSelections = useStore.getState().strategySelections;

        if (payload.eventType === 'INSERT') {
          useStore.getState().setStrategySelections([...currentSelections, strategySelectionToCamelCase(payload.new)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedSelections = currentSelections.map((s) =>
            s.id === payload.new.id ? strategySelectionToCamelCase(payload.new) : s
          );
          useStore.getState().setStrategySelections(updatedSelections);
        } else if (payload.eventType === 'DELETE') {
          const filteredSelections = currentSelections.filter((s) => s.id !== payload.old.id);
          useStore.getState().setStrategySelections(filteredSelections);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'player_action_state',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        console.log('Player action state update:', payload);
        const currentStates = useStore.getState().playerActionStates;

        if (payload.eventType === 'INSERT') {
          useStore.getState().setPlayerActionStates([...currentStates, playerActionStateToCamelCase(payload.new)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedStates = currentStates.map((s) =>
            s.id === payload.new.id ? playerActionStateToCamelCase(payload.new) : s
          );
          useStore.getState().setPlayerActionStates(updatedStates);
        } else if (payload.eventType === 'DELETE') {
          const filteredStates = currentStates.filter((s) => s.id !== payload.old.id);
          useStore.getState().setPlayerActionStates(filteredStates);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'objectives',
        filter: `game_id=eq.${gameId}`,
      },
      (payload) => {
        console.log('Objectives update:', payload);
        const currentObjectives = useStore.getState().objectives;

        if (payload.eventType === 'INSERT') {
          useStore.getState().setObjectives([...currentObjectives, objectiveToCamelCase(payload.new)]);
        } else if (payload.eventType === 'UPDATE') {
          const updatedObjectives = currentObjectives.map((o) =>
            o.id === payload.new.id ? objectiveToCamelCase(payload.new) : o
          );
          useStore.getState().setObjectives(updatedObjectives);
        } else if (payload.eventType === 'DELETE') {
          const filteredObjectives = currentObjectives.filter((o) => o.id !== payload.old.id);
          useStore.getState().setObjectives(filteredObjectives);
        }
      }
    )
    .subscribe((status) => {
      console.log('Subscription status:', status);
      if (status === 'SUBSCRIBED') {
        useStore.getState().setConnected(true);
        useStore.getState().setConnectionError(null);
      } else if (status === 'CHANNEL_ERROR') {
        useStore.getState().setConnected(false);
        useStore.getState().setConnectionError('Failed to connect to real-time updates');
      } else if (status === 'TIMED_OUT') {
        useStore.getState().setConnected(false);
        useStore.getState().setConnectionError('Connection timed out');
      } else if (status === 'CLOSED') {
        useStore.getState().setConnected(false);
      }
    });

  return channel;
}

// Unsubscribe from game updates
export async function unsubscribeFromGame(channel: RealtimeChannel) {
  await supabase.removeChannel(channel);
  useStore.getState().setConnected(false);
  useStore.getState().setGameChannel(null);
}

// Subscribe to presence (who's online in the game)
export function subscribeToPresence(gameId: string, userId: string, userName: string) {
  const channel = supabase.channel(`presence:${gameId}`, {
    config: {
      presence: {
        key: userId,
      },
    },
  });

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      console.log('Presence sync:', state);
      // You can update store with online users here if needed
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          userId,
          userName,
          onlineAt: new Date().toISOString(),
        });
      }
    });

  return channel;
}
