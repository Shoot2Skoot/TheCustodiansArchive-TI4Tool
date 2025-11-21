import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal, Panel, useToast } from '@/components/common';
import { useBackgroundPreference, type BackgroundType } from '@/hooks/useBackgroundPreference';
import { useRecentGames } from '@/hooks/useRecentGames';
import { getFactionById, getFactionImage } from '@/lib/factions';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [joinView, setJoinView] = useState<'code' | 'recent'>('code');
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const { background, setBackground } = useBackgroundPreference();
  const { recentGames, isLoading: isLoadingGames, error: gamesError } = useRecentGames();
  const { showToast } = useToast();

  // Show toast notification if there's an error loading recent games
  useEffect(() => {
    if (gamesError) {
      showToast(gamesError, 'error');
    }
  }, [gamesError, showToast]);

  const handleCreateGame = () => {
    navigate('/setup');
  };

  const handleJoinGame = async () => {
    if (!roomCode.trim()) return;

    setIsJoining(true);
    try {
      // TODO: Implement join game logic
      // For now, just navigate to the game
      navigate(`/game/${roomCode}`);
    } catch (error) {
      console.error('Failed to join game:', error);
    } finally {
      setIsJoining(false);
    }
  };

  const handleJoinRecentGame = (gameId: string) => {
    navigate(`/game/${gameId}`);
  };

  return (
    <div className={styles.container}>
      <Panel variant="elevated" beveled padding="large" className={styles.mainPanel}>
        <div className={styles.panelHeader}>
          <h1 className={styles.brandTitle}>The Custodians Archive</h1>
          <p className={styles.brandSubtitle}>
            Your digital companion for Twilight Imperium 4th Edition
          </p>
        </div>

        <div className={styles.actions}>
          <Button
            variant="primary"
            size="large"
            onClick={handleCreateGame}
            className={styles.primaryButton}
          >
            Create New Game
          </Button>

          <Button
            variant="secondary"
            size="large"
            onClick={() => setShowJoinModal(true)}
          >
            Join Existing Game
          </Button>

          <Button
            variant="secondary"
            size="large"
            onClick={() => setShowOptionsModal(true)}
          >
            Options
          </Button>
        </div>

        <div className={styles.features}>
          <div className={styles.feature}>
            <h3>Track Everything</h3>
            <p>Victory points, objectives, technologies, and more</p>
          </div>
          <div className={styles.feature}>
            <h3>Real-time Sync</h3>
            <p>All players stay in sync automatically</p>
          </div>
          <div className={styles.feature}>
            <h3>Game History</h3>
            <p>Review every action and decision made during the game</p>
          </div>
        </div>
      </Panel>

      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Game"
      >
        <div className={styles.joinModal}>
          {/* Tabs */}
          <div className={styles.joinTabs}>
            <button
              className={`${styles.joinTab} ${joinView === 'code' ? styles.active : ''}`}
              onClick={() => setJoinView('code')}
            >
              Join by Code
            </button>
            <button
              className={`${styles.joinTab} ${joinView === 'recent' ? styles.active : ''}`}
              onClick={() => setJoinView('recent')}
            >
              Recent Games
            </button>
          </div>

          {/* Join by Code View */}
          {joinView === 'code' && (
            <>
              <p className={styles.modalDescription}>
                Enter the room code shared by your game host
              </p>
              <Input
                type="text"
                placeholder="Enter 6-character room code"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                maxLength={6}
                className={styles.roomCodeInput}
              />
              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={handleJoinGame}
                  disabled={roomCode.length !== 6 || isJoining}
                >
                  {isJoining ? 'Joining...' : 'Join Game'}
                </Button>
              </div>
            </>
          )}

          {/* Recent Games View */}
          {joinView === 'recent' && (
            <>
              <p className={styles.modalDescription}>
                Select a game to rejoin
              </p>
              {isLoadingGames ? (
                <div className={styles.loadingState}>
                  <div className={styles.spinner} />
                  <p>Loading your recent games...</p>
                </div>
              ) : recentGames.length === 0 ? (
                <div className={styles.emptyState}>
                  <p>No recent games found</p>
                  <p className={styles.emptyStateHint}>Games you join will appear here</p>
                </div>
              ) : (
                <div className={styles.recentGamesList}>
                  {recentGames.map((game) => (
                    <div
                      key={game.gameId}
                      className={styles.recentGameItem}
                      onClick={() => handleJoinRecentGame(game.roomCode)}
                      role="button"
                      tabIndex={0}
                    >
                      <div className={styles.recentGameHeader}>
                        <span className={styles.recentGameCode}>{game.roomCode}</span>
                        <span className={styles.recentGameDate}>
                          {new Date(game.lastUpdated).toLocaleDateString()}
                        </span>
                      </div>
                      <div className={styles.recentGamePlayers}>
                        {game.players.map((player, index) => (
                          <div key={index} className={styles.recentGamePlayer}>
                            <img
                              src={getFactionImage(player.factionId, 'color')}
                              alt={player.factionName}
                              className={styles.recentGameFactionIcon}
                            />
                            <span className={styles.recentGamePlayerName} style={{ color: player.color }}>
                              {player.displayName || player.factionName}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <div className={styles.modalActions}>
                <Button
                  variant="secondary"
                  onClick={() => setShowJoinModal(false)}
                >
                  Cancel
                </Button>
              </div>
            </>
          )}
        </div>
      </Modal>

      <Modal
        isOpen={showOptionsModal}
        onClose={() => setShowOptionsModal(false)}
        title="Options"
      >
        <div className={styles.optionsModal}>
          <h3>Background</h3>
          <p className={styles.modalDescription}>
            Choose your preferred background style
          </p>
          <div className={styles.backgroundOptions}>
            <div
              className={`${styles.backgroundOption} ${background === 'solid' ? styles.selected : ''}`}
              onClick={() => setBackground('solid')}
              role="button"
              tabIndex={0}
            >
              <div className={styles.backgroundPreview} style={{ background: 'var(--color-bg-primary)' }} />
              <span>Solid Color</span>
            </div>
            <div
              className={`${styles.backgroundOption} ${background === 'space-1' ? styles.selected : ''}`}
              onClick={() => setBackground('space-1')}
              role="button"
              tabIndex={0}
            >
              <div
                className={styles.backgroundPreview}
                style={{ backgroundImage: "url('/src/assets/backgrounds/space-1.jpg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
              />
              <span>Space</span>
            </div>
          </div>
          <div className={styles.modalActions}>
            <Button
              variant="primary"
              onClick={() => setShowOptionsModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
