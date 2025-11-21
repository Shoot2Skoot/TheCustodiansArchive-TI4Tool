import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { getGamesByPlayer } from '@/lib/db/games';
import { getFactionById } from '@/lib/factions';

export interface RecentGame {
  gameId: string;
  roomCode: string;
  lastUpdated: string;
  players: Array<{
    factionId: string;
    factionName: string;
    displayName: string | null;
    color: string;
  }>;
}

export function useRecentGames() {
  const [recentGames, setRecentGames] = useState<RecentGame[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function loadRecentGames() {
      try {
        setIsLoading(true);
        setError(null);

        // Get current user
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
          if (mounted) {
            setRecentGames([]);
            setIsLoading(false);
          }
          return;
        }

        // Get games where user is a player
        const gamesData = await getGamesByPlayer(user.id);

        if (mounted) {
          // Transform to RecentGame format
          const formattedGames: RecentGame[] = gamesData.map((gameData) => ({
            gameId: gameData.game.id,
            roomCode: gameData.game.roomCode,
            lastUpdated: gameData.game.updatedAt,
            players: gameData.players
              .sort((a, b) => a.position - b.position)
              .map((player) => {
                const faction = getFactionById(player.factionId);
                return {
                  factionId: player.factionId,
                  factionName: faction?.name || 'Unknown Faction',
                  displayName: player.displayName,
                  color: player.color,
                };
              }),
          }));

          setRecentGames(formattedGames);
        }
      } catch (err) {
        console.error('Failed to load recent games:', err);
        if (mounted) {
          setError(err instanceof Error ? err.message : 'Failed to load recent games');
        }
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    }

    loadRecentGames();

    return () => {
      mounted = false;
    };
  }, []);

  const refreshRecentGames = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setRecentGames([]);
        return;
      }

      const gamesData = await getGamesByPlayer(user.id);

      const formattedGames: RecentGame[] = gamesData.map((gameData) => ({
        gameId: gameData.game.id,
        roomCode: gameData.game.roomCode,
        lastUpdated: gameData.game.updatedAt,
        players: gameData.players
          .sort((a, b) => a.position - b.position)
          .map((player) => {
            const faction = getFactionById(player.factionId);
            return {
              factionId: player.factionId,
              factionName: faction?.name || 'Unknown Faction',
              displayName: player.displayName,
              color: player.color,
            };
          }),
      }));

      setRecentGames(formattedGames);
    } catch (err) {
      console.error('Failed to refresh recent games:', err);
      setError(err instanceof Error ? err.message : 'Failed to refresh recent games');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    recentGames,
    isLoading,
    error,
    refreshRecentGames,
  };
}
