import { supabase } from '../supabase';
import type { Player, PlayerColor } from '../../types';

// Helper to convert snake_case to camelCase
function toCamelCase(data: any): Player {
  return {
    id: data.id,
    gameId: data.game_id,
    userId: data.user_id,
    position: data.position,
    color: data.color,
    factionId: data.faction_id,
    victoryPoints: data.victory_points,
    displayName: data.display_name,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    joinedAt: data.joined_at,
  };
}

// Create a player
export async function createPlayer(
  gameId: string,
  position: number,
  color: PlayerColor,
  factionId: string,
  displayName?: string
) {
  const { data, error } = await supabase
    .from('players')
    .insert({
      game_id: gameId,
      position,
      color,
      faction_id: factionId,
      display_name: displayName || null,
      victory_points: 0,
    } as any)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create player: ${error.message}`);
  }

  return toCamelCase(data);
}

// Get all players for a game
export async function getPlayersByGame(gameId: string) {
  const { data, error } = await supabase
    .from('players')
    .select('*')
    .eq('game_id', gameId)
    .order('position', { ascending: true });

  if (error) {
    throw new Error(`Failed to get players: ${error.message}`);
  }

  return data.map(toCamelCase);
}

// Get player by ID
export async function getPlayerById(playerId: string) {
  const { data, error } = await supabase.from('players').select('*').eq('id', playerId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to get player: ${error.message}`);
  }

  return toCamelCase(data);
}

// Update player
export async function updatePlayer(playerId: string, updates: Partial<Player>) {
  const { data, error } = await supabase
    .from('players')
    .update({
      user_id: updates.userId,
      position: updates.position,
      color: updates.color,
      faction_id: updates.factionId,
      victory_points: updates.victoryPoints,
      display_name: updates.displayName,
      joined_at: updates.joinedAt,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', playerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update player: ${error.message}`);
  }

  return toCamelCase(data);
}

// Update player victory points
export async function updatePlayerVictoryPoints(playerId: string, victoryPoints: number) {
  return updatePlayer(playerId, { victoryPoints });
}

// Claim player slot (assign user to player)
export async function claimPlayerSlot(playerId: string, userId: string) {
  const { data, error } = await supabase
    .from('players')
    .update({
      user_id: userId,
      joined_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', playerId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to claim player slot: ${error.message}`);
  }

  return toCamelCase(data);
}

// Delete player
export async function deletePlayer(playerId: string) {
  const { error } = await supabase.from('players').delete().eq('id', playerId);

  if (error) {
    throw new Error(`Failed to delete player: ${error.message}`);
  }
}

// Check if color is available in game
export async function isColorAvailable(gameId: string, color: PlayerColor): Promise<boolean> {
  const { data, error } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', gameId)
    .eq('color', color)
    .single();

  if (error && error.code === 'PGRST116') {
    return true; // No player with this color found
  }

  return !data; // If data exists, color is taken
}

// Check if faction is available in game
export async function isFactionAvailable(gameId: string, factionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('players')
    .select('id')
    .eq('game_id', gameId)
    .eq('faction_id', factionId)
    .single();

  if (error && error.code === 'PGRST116') {
    return true; // No player with this faction found
  }

  return !data; // If data exists, faction is taken
}
