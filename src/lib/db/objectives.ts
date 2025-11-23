import { supabase } from '../supabase';
import { ALL_STAGE_1_OBJECTIVES, ALL_STAGE_2_OBJECTIVES } from '../objectives';

export interface ObjectiveRecord {
  id: string;
  game_id: string;
  objective_type: string;
  objective_id: string | null;
  objective_name: string;
  objective_description: string | null;
  revealed_round: number;
  scored_by_players: string[] | null;
  created_at: string;
}

// Create initial public objectives for a game
export async function createInitialObjectives(
  gameId: string,
  objectiveIds: string[]
): Promise<boolean> {
  try {
    console.log('createInitialObjectives - gameId:', gameId, 'objectiveIds:', objectiveIds);
    const allObjectives = [...ALL_STAGE_1_OBJECTIVES, ...ALL_STAGE_2_OBJECTIVES];

    const objectivesData = objectiveIds.map((objectiveId, index) => {
      const objectiveDetails = allObjectives.find(obj => obj.id === objectiveId);

      return {
        game_id: gameId,
        objective_type: 'public-stage-1',
        objective_id: objectiveId,
        objective_name: objectiveDetails?.name || 'Unknown Objective',
        objective_description: objectiveDetails?.condition || null,
        revealed_round: 1, // All initial objectives are revealed at game start (round 1)
      };
    });

    console.log('createInitialObjectives - inserting:', objectivesData);
    const { error } = await supabase.from('objectives').insert(objectivesData as any);

    if (error) {
      console.error('Error creating objectives:', error);
      return false;
    }

    console.log('createInitialObjectives - SUCCESS');
    return true;
  } catch (err) {
    console.error('Error creating objectives:', err);
    return false;
  }
}

// Get all objectives for a game
export async function getObjectivesByGame(gameId: string): Promise<ObjectiveRecord[]> {
  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('game_id', gameId)
    .order('revealed_round', { ascending: true, nullsFirst: false })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching objectives:', error);
    return [];
  }

  return data || [];
}

// Get revealed objectives for current round
export async function getRevealedObjectives(
  gameId: string,
  currentRound: number
): Promise<ObjectiveRecord[]> {
  console.log('getRevealedObjectives - gameId:', gameId, 'currentRound:', currentRound);

  const { data, error } = await supabase
    .from('objectives')
    .select('*')
    .eq('game_id', gameId)
    .lte('revealed_round', currentRound)
    .order('revealed_round', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching revealed objectives:', error);
    return [];
  }

  console.log('getRevealedObjectives - data:', data);
  return data || [];
}

// Reveal next objective
export async function revealNextObjective(gameId: string, round: number): Promise<boolean> {
  try {
    // Find the next unrevealed objective
    const { data: objectives, error: fetchError } = await supabase
      .from('objectives')
      .select('*')
      .eq('game_id', gameId)
      .is('revealed_round', null)
      .order('created_at', { ascending: true })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching unrevealed objectives:', fetchError);
      return false;
    }

    if (!objectives || objectives.length === 0) {
      console.warn('No unrevealed objectives available');
      return false;
    }

    const objective = objectives[0];

    // Update the objective to set revealed_round
    const { error: updateError } = await supabase
      .from('objectives')
      .update({ revealed_round: round } as any)
      .eq('id', objective.id);

    if (updateError) {
      console.error('Error revealing objective:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error revealing objective:', err);
    return false;
  }
}

// Toggle objective completion for a player
export async function toggleObjectiveCompletion(
  objectiveId: string,
  playerId: string
): Promise<boolean> {
  try {
    // First get the current objective
    const { data: objective, error: fetchError } = await supabase
      .from('objectives')
      .select('scored_by_players')
      .eq('id', objectiveId)
      .single();

    if (fetchError) {
      console.error('Error fetching objective:', fetchError);
      return false;
    }

    const currentScorers = objective?.scored_by_players || [];
    let newScorers: string[];

    if (currentScorers.includes(playerId)) {
      // Remove player from scorers
      newScorers = currentScorers.filter((id: string) => id !== playerId);
    } else {
      // Add player to scorers
      newScorers = [...currentScorers, playerId];
    }

    // Update the objective
    const { error: updateError } = await supabase
      .from('objectives')
      .update({ scored_by_players: newScorers } as any)
      .eq('id', objectiveId);

    if (updateError) {
      console.error('Error updating objective completion:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error toggling objective completion:', err);
    return false;
  }
}

// Set objective completion to a specific state for a player
export async function setObjectiveCompletion(
  objectiveId: string,
  playerId: string,
  isScored: boolean
): Promise<boolean> {
  try {
    // First get the current objective
    const { data: objective, error: fetchError } = await supabase
      .from('objectives')
      .select('scored_by_players')
      .eq('id', objectiveId)
      .single();

    if (fetchError) {
      console.error('Error fetching objective:', fetchError);
      return false;
    }

    const currentScorers = objective?.scored_by_players || [];
    let newScorers: string[];

    if (isScored) {
      // Ensure player is in scorers
      if (!currentScorers.includes(playerId)) {
        newScorers = [...currentScorers, playerId];
      } else {
        // Already scored, no change needed
        return true;
      }
    } else {
      // Ensure player is not in scorers
      if (currentScorers.includes(playerId)) {
        newScorers = currentScorers.filter((id: string) => id !== playerId);
      } else {
        // Already not scored, no change needed
        return true;
      }
    }

    // Update the objective
    const { error: updateError } = await supabase
      .from('objectives')
      .update({ scored_by_players: newScorers } as any)
      .eq('id', objectiveId);

    if (updateError) {
      console.error('Error setting objective completion:', updateError);
      return false;
    }

    return true;
  } catch (err) {
    console.error('Error setting objective completion:', err);
    return false;
  }
}
