import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Input, Modal } from '@/components/common';
import styles from './HomePage.module.css';

export function HomePage() {
  const navigate = useNavigate();
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);

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

  return (
    <div className={styles.container}>
      <div className={styles.hero}>
        <h1 className={styles.title}>The Custodians Archive</h1>
        <p className={styles.subtitle}>
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

      <Modal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        title="Join Game"
      >
        <div className={styles.joinModal}>
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
        </div>
      </Modal>
    </div>
  );
}
