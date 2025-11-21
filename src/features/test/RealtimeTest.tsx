import { useState, useEffect } from 'react';
import { useGame } from '@/hooks/useGame';
import { useGameActions } from '@/hooks/useGameActions';
import { createGame, deleteGame } from '@/lib/db/games';
import { createPlayer } from '@/lib/db/players';
import { createGameState } from '@/lib/db/gameState';
import { supabase } from '@/lib/supabase';
import { useStore } from '@/store';
import type { GameConfig, GamePhase } from '@/types';

export function RealtimeTest() {
  const [testGameId, setTestGameId] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isCreatingGame, setIsCreatingGame] = useState(false);

  // Use the custom hook to load and subscribe to the game
  const { game, gameState, players, isLoading, error } = useGame(testGameId);
  const { incrementVictoryPoints, changePhase } = useGameActions();

  const isConnected = useStore((state) => state.isConnected);
  const connectionError = useStore((state) => state.connectionError);

  const addLog = (message: string) => {
    setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  useEffect(() => {
    if (testGameId && game) {
      addLog(`✓ Game loaded: ${game.roomCode}`);
    }
  }, [game, testGameId]);

  useEffect(() => {
    if (testGameId && gameState) {
      addLog(`→ Game state updated: Round ${gameState.currentRound}, Phase ${gameState.currentPhase}`);
    }
  }, [gameState, testGameId]);

  useEffect(() => {
    if (testGameId && players.length > 0) {
      addLog(`→ Players updated: ${players.length} players`);
      players.forEach((p) => {
        addLog(`  - ${p.displayName} (${p.color}): ${p.victoryPoints} VP`);
      });
    }
  }, [players, testGameId]);

  useEffect(() => {
    if (isConnected) {
      addLog('✓ Real-time connected');
    }
  }, [isConnected]);

  useEffect(() => {
    if (connectionError) {
      addLog(`✗ Connection error: ${connectionError}`);
    }
  }, [connectionError]);

  const setupTestGame = async () => {
    setIsCreatingGame(true);
    setLogs([]);

    try {
      addLog('Authenticating...');
      const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
      if (authError) throw new Error(`Auth failed: ${authError.message}`);
      addLog('✓ Authenticated');

      addLog('Creating test game...');
      const testConfig: GameConfig = {
        playerCount: 3,
        victoryPointLimit: 10,
        timerEnabled: false,
        timerMode: 'per-turn',
        timerDurationMinutes: 15,
        showObjectives: true,
        showTechnologies: true,
        showStrategyCards: true,
      };

      const game = await createGame(testConfig, authData.user?.id);
      addLog(`✓ Game created: ${game.roomCode}`);

      addLog('Creating game state...');
      await createGameState(game.id);
      addLog('✓ Game state created');

      addLog('Creating players...');
      await createPlayer(game.id, 1, 'red', 'hacan', 'Hacan Player');
      await createPlayer(game.id, 2, 'blue', 'sol', 'Sol Player');
      await createPlayer(game.id, 3, 'green', 'jol-nar', 'Jol-Nar Player');
      addLog('✓ 3 players created');

      // Set the game ID to trigger the useGame hook
      setTestGameId(game.id);
      addLog('✓ Subscribing to real-time updates...');
    } catch (error) {
      addLog(`✗ Setup failed: ${error}`);
    } finally {
      setIsCreatingGame(false);
    }
  };

  const testVPUpdate = async () => {
    if (!players[0]) {
      addLog('✗ No players to update');
      return;
    }

    try {
      addLog(`Incrementing VP for ${players[0].displayName}...`);
      await incrementVictoryPoints(players[0].id, players[0].victoryPoints);
      addLog('✓ VP update sent (watch for real-time update)');
    } catch (error) {
      addLog(`✗ VP update failed: ${error}`);
    }
  };

  const testPhaseChange = async () => {
    if (!gameState) {
      addLog('✗ No game state');
      return;
    }

    const phases: GamePhase[] = ['setup', 'speaker-selection', 'strategy', 'action', 'status', 'agenda'];
    const currentIndex = phases.indexOf(gameState.currentPhase as any);
    const nextPhase = phases[(currentIndex + 1) % phases.length];

    if (!nextPhase) {
      addLog('✗ Could not determine next phase');
      return;
    }

    try {
      addLog(`Changing phase to ${nextPhase}...`);
      await changePhase(nextPhase);
      addLog('✓ Phase change sent (watch for real-time update)');
    } catch (error) {
      addLog(`✗ Phase change failed: ${error}`);
    }
  };

  const cleanup = async () => {
    if (!testGameId) {
      addLog('No test game to clean up');
      return;
    }

    try {
      addLog('Cleaning up test game...');
      await deleteGame(testGameId);
      setTestGameId(null);
      useStore.getState().clearGame();
      useStore.getState().clearPlayers();
      useStore.getState().clearRealtime();
      addLog('✓ Test game deleted');
    } catch (error) {
      addLog(`✗ Cleanup failed: ${error}`);
    }
  };

  return (
    <div style={{ padding: 'var(--space-6)' }}>
      <h2 style={{ marginBottom: 'var(--space-4)', color: 'var(--color-accent-primary)' }}>
        Real-time Synchronization Test
      </h2>

      <div style={{ marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
        <div
          style={{
            width: '12px',
            height: '12px',
            borderRadius: '50%',
            background: isConnected ? 'var(--color-success)' : 'var(--color-error)',
          }}
        />
        <span style={{ color: 'var(--color-text-secondary)' }}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </span>
        {connectionError && (
          <span style={{ color: 'var(--color-error)', marginLeft: 'var(--space-2)' }}>
            ({connectionError})
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: 'var(--space-3)', marginBottom: 'var(--space-6)', flexWrap: 'wrap' }}>
        <button
          onClick={setupTestGame}
          disabled={isCreatingGame || !!testGameId}
          style={{
            background: isCreatingGame || testGameId ? 'var(--color-bg-primary)' : 'var(--color-accent-primary)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-accent)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
            cursor: isCreatingGame || testGameId ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
          }}
        >
          {isCreatingGame ? 'Creating...' : testGameId ? 'Game Active' : 'Setup Test Game'}
        </button>

        <button
          onClick={testVPUpdate}
          disabled={!testGameId || players.length === 0}
          style={{
            background: !testGameId || players.length === 0 ? 'var(--color-bg-primary)' : 'var(--color-info)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-accent)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
            cursor: !testGameId || players.length === 0 ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
          }}
        >
          Update VP (Test Realtime)
        </button>

        <button
          onClick={testPhaseChange}
          disabled={!testGameId || !gameState}
          style={{
            background: !testGameId || !gameState ? 'var(--color-bg-primary)' : 'var(--color-info)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-accent)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
            cursor: !testGameId || !gameState ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
          }}
        >
          Change Phase (Test Realtime)
        </button>

        <button
          onClick={cleanup}
          disabled={!testGameId}
          style={{
            background: !testGameId ? 'var(--color-bg-primary)' : 'var(--color-error)',
            color: 'var(--color-text-primary)',
            border: '1px solid var(--color-border-accent)',
            padding: 'var(--space-3) var(--space-4)',
            fontSize: 'var(--text-sm)',
            cursor: !testGameId ? 'not-allowed' : 'pointer',
            borderRadius: '4px',
          }}
        >
          Clean Up
        </button>
      </div>

      {isLoading && (
        <div style={{ padding: 'var(--space-4)', color: 'var(--color-info)' }}>
          Loading game data...
        </div>
      )}

      {error && (
        <div style={{ padding: 'var(--space-4)', color: 'var(--color-error)' }}>
          Error: {error}
        </div>
      )}

      {/* Event Log */}
      <div
        style={{
          marginBottom: 'var(--space-6)',
          padding: 'var(--space-4)',
          background: 'var(--color-bg-tertiary)',
          border: '1px solid var(--color-border-primary)',
          borderRadius: '4px',
          maxHeight: '400px',
          overflowY: 'auto',
        }}
      >
        <h3 style={{ marginBottom: 'var(--space-3)', fontSize: 'var(--text-lg)' }}>Event Log</h3>
        {logs.length === 0 ? (
          <p style={{ color: 'var(--color-text-tertiary)' }}>No events yet. Click "Setup Test Game" to begin.</p>
        ) : (
          <pre
            style={{
              fontSize: 'var(--text-xs)',
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordWrap: 'break-word',
              color: 'var(--color-text-secondary)',
              margin: 0,
            }}
          >
            {logs.join('\n')}
          </pre>
        )}
      </div>

      {/* Current State Display */}
      {testGameId && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: 'var(--space-4)',
          }}
        >
          <div
            style={{
              padding: 'var(--space-4)',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '4px',
            }}
          >
            <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--color-accent-secondary)' }}>Game</h4>
            {game && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                <div>Room: {game.roomCode}</div>
                <div>Status: {game.status}</div>
                <div>Players: {game.config.playerCount}</div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '4px',
            }}
          >
            <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--color-accent-secondary)' }}>Game State</h4>
            {gameState && (
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
                <div>Round: {gameState.currentRound}</div>
                <div>Phase: {gameState.currentPhase}</div>
                <div>Mecatol: {gameState.mecatolClaimed ? 'Claimed' : 'Unclaimed'}</div>
              </div>
            )}
          </div>

          <div
            style={{
              padding: 'var(--space-4)',
              background: 'var(--color-bg-tertiary)',
              border: '1px solid var(--color-border-primary)',
              borderRadius: '4px',
            }}
          >
            <h4 style={{ marginBottom: 'var(--space-2)', color: 'var(--color-accent-secondary)' }}>
              Players ({players.length})
            </h4>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-secondary)' }}>
              {players.map((p) => (
                <div key={p.id}>
                  {p.displayName}: {p.victoryPoints} VP
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
