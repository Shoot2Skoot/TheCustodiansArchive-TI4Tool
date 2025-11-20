import { supabase } from '../supabase';
import type { StrategySelection } from '../../types';

// Helper to convert snake_case to camelCase
function toCamelCase(data: any): StrategySelection {
  return {
    id: data.id,
    gameId: data.game_id,
    roundNumber: data.round_number,
    playerId: data.player_id,
    strategyCardId: data.strategy_card_id,
    selectionOrder: data.selection_order,
    tradeGoodBonus: data.trade_good_bonus,
    primaryActionUsed: data.primary_action_used,
    selectedAt: data.selected_at,
  };
}

// Create a strategy selection
export async function createStrategySelection(
  gameId: string,
  roundNumber: number,
  playerId: string,
  strategyCardId: number,
  selectionOrder: number,
  tradeGoodBonus: number = 0
) {
  const { data, error } = await supabase
    .from('strategy_selections')
    .insert({
      game_id: gameId,
      round_number: roundNumber,
      player_id: playerId,
      strategy_card_id: strategyCardId,
      selection_order: selectionOrder,
      trade_good_bonus: tradeGoodBonus,
      primary_action_used: false,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create strategy selection: ${error.message}`);
  }

  return toCamelCase(data);
}

// Bulk create strategy selections (for saving all at once)
export async function createStrategySelections(
  gameId: string,
  roundNumber: number,
  selections: Array<{
    playerId: string;
    strategyCardId: number;
    selectionOrder: number;
    tradeGoodBonus: number;
  }>
) {
  const insertData = selections.map((selection) => ({
    game_id: gameId,
    round_number: roundNumber,
    player_id: selection.playerId,
    strategy_card_id: selection.strategyCardId,
    selection_order: selection.selectionOrder,
    trade_good_bonus: selection.tradeGoodBonus,
    primary_action_used: false,
  }));

  const { data, error } = await supabase
    .from('strategy_selections')
    .insert(insertData)
    .select();

  if (error) {
    throw new Error(`Failed to create strategy selections: ${error.message}`);
  }

  return data.map(toCamelCase);
}

// Get all strategy selections for a game and round
export async function getStrategySelectionsByRound(gameId: string, roundNumber: number) {
  const { data, error } = await supabase
    .from('strategy_selections')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', roundNumber)
    .order('selection_order', { ascending: true });

  if (error) {
    throw new Error(`Failed to get strategy selections: ${error.message}`);
  }

  return data.map(toCamelCase);
}

// Get strategy selection by player for a specific round
export async function getStrategySelectionByPlayer(
  gameId: string,
  roundNumber: number,
  playerId: string
) {
  const { data, error } = await supabase
    .from('strategy_selections')
    .select('*')
    .eq('game_id', gameId)
    .eq('round_number', roundNumber)
    .eq('player_id', playerId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // No selection found
    }
    throw new Error(`Failed to get strategy selection: ${error.message}`);
  }

  return toCamelCase(data);
}

// Update primary action used status
export async function markPrimaryActionUsed(selectionId: string) {
  const { data, error } = await supabase
    .from('strategy_selections')
    .update({
      primary_action_used: true,
    })
    .eq('id', selectionId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update strategy selection: ${error.message}`);
  }

  return toCamelCase(data);
}

// Delete all strategy selections for a round (for reset)
export async function deleteStrategySelectionsForRound(gameId: string, roundNumber: number) {
  const { error } = await supabase
    .from('strategy_selections')
    .delete()
    .eq('game_id', gameId)
    .eq('round_number', roundNumber);

  if (error) {
    throw new Error(`Failed to delete strategy selections: ${error.message}`);
  }
}

// Check if a strategy card is already selected in this round
export async function isStrategyCardTaken(
  gameId: string,
  roundNumber: number,
  strategyCardId: number
): Promise<boolean> {
  const { data, error } = await supabase
    .from('strategy_selections')
    .select('id')
    .eq('game_id', gameId)
    .eq('round_number', roundNumber)
    .eq('strategy_card_id', strategyCardId)
    .single();

  if (error && error.code === 'PGRST116') {
    return false; // Card not taken
  }

  return !!data; // If data exists, card is taken
}
