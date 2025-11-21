import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { createGame, getGameById, updateGame, deleteGame } from '@/lib/db/games';
import { createPlayer, getPlayersByGame, updatePlayerVictoryPoints } from '@/lib/db/players';
import { createGameState, updateGameState } from '@/lib/db/gameState';
import { useStore } from '@/store';
import type { GameConfig } from '@/types';

export function StateManagementTest() {
  const [status, setStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [logs, setLogs] = useState<string[]>([]);
  const [testGameId, setTestGameId] = useState<string | null>(null);

  // Get store state for display
  const currentGame = useStore((state) => state.currentGame);
  const players = useStore((state) => state.players);
  const gameState = useStore((state) => state.gameState);

  const addLog = (message: string, type: 'info' | 'success' | 'error' = 'info') => {
    const icon = type === 'success' ? '✓' : type === 'error' ? '✗' : '→';
    setLogs((prev) => [...prev, `${icon} ${message}`]);
  };

  const runTests = async () => {
    setStatus('testing');
    setLogs([]);

    try {
      // Test 1: Authentication
      addLog('Testing authentication...');
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw new Error(`Auth failed: ${authError.message}`);
      addLog(`Authenticated as: ${authData.user?.id}`, 'success');

      // Test 2: Create Game (using service layer)
      addLog('Creating test game using service layer...');
      const testConfig: GameConfig = {
        playerCount: 4,
        victoryPointLimit: 10,
        timerEnabled: false,
        timerMode: 'per-turn',
        timerDurationMinutes: 15,
        showObjectives: true,
        showTechnologies: true,
        showStrategyCards: true,
      };

      const game = await createGame(testConfig, authData.user?.id);
      setTestGameId(game.id);
      addLog(`Created game: ${game.roomCode} (ID: ${game.id})`, 'success');

      // Test 3: Create Game State
      addLog('Creating game state...');
      const state = await createGameState(game.id);
      addLog(`Game state created: Round ${state.currentRound}, Phase ${state.currentPhase}`, 'success');

      // Test 4: Create Players
      addLog('Creating players...');
      const player1 = await createPlayer(game.id, 1, 'red', 'hacan', 'Player 1');
      await createPlayer(game.id, 2, 'blue', 'sol', 'Player 2');
      addLog(`Created ${2} players`, 'success');

      // Test 5: Get Players
      addLog('Fetching players...');
      const fetchedPlayers = await getPlayersByGame(game.id);
      addLog(`Fetched ${fetchedPlayers.length} players`, 'success');

      // Test 6: Update Player VP
      addLog('Updating player victory points...');
      await updatePlayerVictoryPoints(player1.id, 3);
      addLog(`Updated ${player1.displayName} VP to 3`, 'success');

      // Test 7: Update Game State
      addLog('Updating game state...');
      const updatedState = await updateGameState(game.id, {
        currentPhase: 'strategy',
        currentRound: 1,
      });
      addLog(`Game state: Round ${updatedState.currentRound}, Phase ${updatedState.currentPhase}`, 'success');

      // Test 8: Update Game
      addLog('Updating game status...');
      const updatedGame = await updateGame(game.id, {
        status: 'in-progress',
        startedAt: new Date().toISOString(),
      });
      addLog(`Game status: ${updatedGame.status}`, 'success');

      // Test 9: Get Game by ID
      addLog('Fetching game by ID...');
      const fetchedGame = await getGameById(game.id);
      if (!fetchedGame) throw new Error('Game not found after creation');
      addLog(`Fetched game: ${fetchedGame.roomCode}`, 'success');

      // Test 10: Zustand Store
      addLog('Testing Zustand store...');
      useStore.getState().setCurrentGame(fetchedGame);
      useStore.getState().setGameState(updatedState);
      useStore.getState().setPlayers(fetchedPlayers);
      addLog('Store updated successfully', 'success');

      // Test 11: Store Selectors
      addLog('Testing store selectors...');
      const storeGame = useStore.getState().currentGame;
      const storePlayers = useStore.getState().players;
      if (storeGame && storePlayers.length === 2) {
        addLog(`Store contains game ${storeGame.roomCode} with ${storePlayers.length} players`, 'success');
      } else {
        throw new Error('Store state incorrect');
      }

      setStatus('success');
      addLog('All tests passed! ✓', 'success');

    } catch (error) {
      setStatus('error');
      const errorMessage = error instanceof Error ? error.message : String(error);
      addLog(`Test failed: ${errorMessage}`, 'error');
    }
  };

  const cleanup = async () => {
    if (!testGameId) {
      addLog('No test game to clean up', 'info');
      return;
    }

    try {
      addLog('Cleaning up test data...');
      await deleteGame(testGameId);
      setTestGameId(null);
      useStore.getState().clearGame();
      useStore.getState().clearPlayers();
      addLog('Test data cleaned up', 'success');
    } catch (error) {
      addLog(`Cleanup failed: ${error}`, 'error');
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-primary)' }}>
        State Management Test Suite
      </h2>

      <div style={{ display: 'flex', gap: 'var(--space-4)', marginBottom: 'var(--space-6)' }}>
        <button
          onClick={runTests}
          disabled={status === 'testing'}
          style={{
            background: status === 'testing' ? 'var(--color-bg-primary)' : 'var(--color-accent-primary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-accent)',
            padding: 'var(--space-3) var(--space-6)',
            fontSize: 'var(--text-base)',
            cursor: status === 'testing' ? 'not-allowed' : 'pointer',
            fontWeight: 'var(--font-semibold)',
            borderRadius: '4px',
          }}
        >
          {status === 'testing' ? 'Running Tests...' : 'Run Tests'}
        </button>

        <button
          onClick={cleanup}
          disabled={!testGameId}
          style={{
            background: !testGameId ? 'var(--color-bg-primary)' : 'var(--color-error)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-accent)',
            padding: 'var(--space-3) var(--space-6)',
            fontSize: 'var(--text-base)',
            cursor: !testGameId ? 'not-allowed' : 'pointer',
            fontWeight: 'var(--font-semibold)',
            borderRadius: '4px',
          }}
        >
          Clean Up Test Data
        </button>
      </div>

      {/* Test Logs */}
      {logs.length > 0 && (
        <div
          style={{
            marginBottom: 'var(--space-6)',
            padding: 'var(--space-4)',
            background: 'var(--color-bg-tertiary)',
            border: `1px solid ${
              status === 'success'
                ? 'var(--color-success)'
                : status === 'error'
                  ? 'var(--color-error)'
                  : 'var(--color-border-primary)'
            }`,
            borderLeft: `4px solid ${
              status === 'success'
                ? 'var(--color-success)'
                : status === 'error'
                  ? 'var(--color-error)'
                  : 'var(--color-info)'
            }`,
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)' }}>Test Logs</h3>
          <pre
            style={{
              fontSize: 'var(--text-sm)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {logs.join('\n')}
          </pre>
        </div>
      )}

      {/* Store State Display */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--space-4)',
        }}
      >
        {/* Current Game */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-accent-secondary)' }}>
            Store: Current Game
          </h3>
          {currentGame ? (
            <pre
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: 'var(--color-text-secondary)',
              }}
            >
              {JSON.stringify(
                {
                  id: currentGame.id,
                  roomCode: currentGame.roomCode,
                  status: currentGame.status,
                  playerCount: currentGame.config.playerCount,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <p style={{ color: 'var(--color-text-tertiary)' }}>No game in store</p>
          )}
        </div>

        {/* Game State */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-accent-secondary)' }}>
            Store: Game State
          </h3>
          {gameState ? (
            <pre
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: 'var(--color-text-secondary)',
              }}
            >
              {JSON.stringify(
                {
                  currentRound: gameState.currentRound,
                  currentPhase: gameState.currentPhase,
                  mecatolClaimed: gameState.mecatolClaimed,
                },
                null,
                2
              )}
            </pre>
          ) : (
            <p style={{ color: 'var(--color-text-tertiary)' }}>No game state in store</p>
          )}
        </div>

        {/* Players */}
        <div
          style={{
            padding: 'var(--space-4)',
            background: 'var(--color-bg-tertiary)',
            border: '1px solid var(--color-border-primary)',
            borderRadius: '4px',
          }}
        >
          <h3 style={{ marginBottom: 'var(--space-3)', color: 'var(--color-accent-secondary)' }}>
            Store: Players ({players.length})
          </h3>
          {players.length > 0 ? (
            <pre
              style={{
                fontSize: 'var(--text-xs)',
                fontFamily: 'var(--font-mono)',
                whiteSpace: 'pre-wrap',
                wordWrap: 'break-word',
                color: 'var(--color-text-secondary)',
              }}
            >
              {JSON.stringify(
                players.map((p) => ({
                  position: p.position,
                  color: p.color,
                  faction: p.factionId,
                  vp: p.victoryPoints,
                })),
                null,
                2
              )}
            </pre>
          ) : (
            <p style={{ color: 'var(--color-text-tertiary)' }}>No players in store</p>
          )}
        </div>
      </div>
    </div>
  );
}
