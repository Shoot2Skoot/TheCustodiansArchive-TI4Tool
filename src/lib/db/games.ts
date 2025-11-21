import { supabase } from '../supabase';
import type { Game, GameConfig } from '../../types';

// Helper to convert snake_case to camelCase
function toCamelCase(data: any): Game {
  return {
    id: data.id,
    roomCode: data.room_code,
    status: data.status,
    config: data.config,
    createdBy: data.created_by,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    startedAt: data.started_at,
    endedAt: data.ended_at,
    deletedAt: data.deleted_at,
  };
}

// Helper to generate room codes
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude similar looking chars
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a new game
export async function createGame(config: GameConfig, userId?: string) {
  const roomCode = generateRoomCode();

  const { data, error } = await supabase
    .from('games')
    .insert({
      room_code: roomCode,
      status: 'setup',
      config: config as any,
      created_by: userId || null,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create game: ${error.message}`);
  }

  return toCamelCase(data);
}

// Get game by ID
export async function getGameById(gameId: string) {
  const { data, error } = await supabase.from('games').select('*').eq('id', gameId).single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Game not found
    }
    throw new Error(`Failed to get game: ${error.message}`);
  }

  return toCamelCase(data);
}

// Get game by room code
export async function getGameByRoomCode(roomCode: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .eq('room_code', roomCode)
    .is('deleted_at', null)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Game not found
    }
    throw new Error(`Failed to get game: ${error.message}`);
  }

  return toCamelCase(data);
}

// Update game
export async function updateGame(gameId: string, updates: Partial<Game>) {
  const { data, error} = await supabase
    .from('games')
    .update({
      room_code: updates.roomCode,
      status: updates.status,
      config: updates.config,
      started_at: updates.startedAt,
      ended_at: updates.endedAt,
      deleted_at: updates.deletedAt,
      updated_at: new Date().toISOString(),
    } as any)
    .eq('id', gameId)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update game: ${error.message}`);
  }

  return toCamelCase(data);
}

// Update game status
export async function updateGameStatus(
  gameId: string,
  status: Game['status'],
  additionalUpdates?: Partial<Game>
) {
  const updates: Partial<Game> = {
    status,
    ...additionalUpdates,
  };

  if (status === 'in-progress' && !additionalUpdates?.startedAt) {
    updates.startedAt = new Date().toISOString();
  }

  if (status === 'completed' && !additionalUpdates?.endedAt) {
    updates.endedAt = new Date().toISOString();
  }

  return updateGame(gameId, updates);
}

// Soft delete game
export async function deleteGame(gameId: string) {
  const { error } = await supabase
    .from('games')
    .update({
      deleted_at: new Date().toISOString(),
    } as any)
    .eq('id', gameId);

  if (error) {
    throw new Error(`Failed to delete game: ${error.message}`);
  }
}

// Get all games for a user
export async function getGamesByUser(userId: string) {
  const { data, error } = await supabase
    .from('games')
    .select('*')
    .or(`created_by.eq.${userId}`)
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to get games: ${error.message}`);
  }

  return data.map(toCamelCase);
}

// Get games where user is a player (with player details)
export async function getGamesByPlayer(userId: string) {
  const { data, error } = await supabase
    .from('games')
    .select(`
      *,
      players!inner(
        id,
        user_id,
        faction_id,
        color,
        display_name,
        position
      )
    `)
    .eq('players.user_id', userId)
    .is('deleted_at', null)
    .order('updated_at', { ascending: false })
    .limit(10);

  if (error) {
    throw new Error(`Failed to get user games: ${error.message}`);
  }

  return data.map((game: any) => ({
    game: toCamelCase(game),
    players: game.players.map((p: any) => ({
      id: p.id,
      userId: p.user_id,
      factionId: p.faction_id,
      color: p.color,
      displayName: p.display_name,
      position: p.position,
    })),
  }));
}
