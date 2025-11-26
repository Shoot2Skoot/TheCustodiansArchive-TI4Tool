import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Panel, useToast } from '@/components/common';
import { PlayerCountSelector } from './PlayerCountSelector';
import { MapPlayerConfiguration } from './MapPlayerConfiguration';
import { GameOptionsForm } from './GameOptionsForm';
import { ObjectiveSelection } from './ObjectiveSelection';
import { SpeakerSelection } from './SpeakerSelection';
import { useCreateGame } from './useCreateGame';
import type { GameConfig } from '@/types';
import type { PlayerColor } from '@/types/enums';
import styles from './GameSetupWizard.module.css';

interface PlayerSetup {
  position: number;
  color: PlayerColor | null;
  factionId: string | null;
  displayName: string;
}

type SetupStep = 'player-count' | 'player-config' | 'game-options' | 'objectives-selection' | 'speaker-selection';

export function GameSetupWizard() {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const { createNewGame, isCreating, error } = useCreateGame();
  const [currentStep, setCurrentStep] = useState<SetupStep>('player-count');
  const [playerCount, setPlayerCount] = useState<number>(6);
  const [players, setPlayers] = useState<PlayerSetup[]>([]);
  const [gameConfig, setGameConfig] = useState<Partial<GameConfig>>({
    playerCount: 6,
    victoryPointLimit: 10,
    timerEnabled: true,
    timerMode: 'per-turn',
    timerDurationMinutes: 5,
    showObjectives: true,
    showTechnologies: true,
    showStrategyCards: true,
  });
  const [selectedObjectives, setSelectedObjectives] = useState<string[]>([]);

  const handlePlayerCountSelect = (count: number) => {
    setPlayerCount(count);
    setGameConfig({ ...gameConfig, playerCount: count });

    // Initialize player slots
    const initialPlayers: PlayerSetup[] = Array.from({ length: count }, (_, i) => ({
      position: i + 1,
      color: null,
      factionId: null,
      displayName: `Player ${i + 1}`,
    }));
    setPlayers(initialPlayers);

    setCurrentStep('player-config');
  };

  const handlePlayerConfigComplete = (configuredPlayers: PlayerSetup[]) => {
    setPlayers(configuredPlayers);
    setCurrentStep('game-options');
  };

  const handleGameOptionsComplete = (config: Partial<GameConfig>) => {
    setGameConfig({ ...gameConfig, ...config });
    setCurrentStep('objectives-selection');
  };

  const handleObjectivesComplete = (objectiveIds: string[]) => {
    setSelectedObjectives(objectiveIds);
    setCurrentStep('speaker-selection');
  };

  const handleSpeakerSelect = async (speakerPosition: number) => {
    // Create game in database
    const gameId = await createNewGame({
      config: gameConfig,
      players,
      speakerPosition,
      initialObjectives: selectedObjectives,
    });

    if (gameId) {
      showToast('success', 'Game created successfully!');
      // Navigate to the game page
      navigate(`/game/${gameId}`);
    } else {
      showToast('error', error || 'Failed to create game');
    }
  };

  const handleBack = () => {
    switch (currentStep) {
      case 'player-config':
        setCurrentStep('player-count');
        break;
      case 'game-options':
        setCurrentStep('player-config');
        break;
      case 'objectives-selection':
        setCurrentStep('game-options');
        break;
      case 'speaker-selection':
        setCurrentStep('objectives-selection');
        break;
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Game Setup</h1>
        <div className={styles.stepIndicator}>
          <StepDot step={1} active={currentStep === 'player-count'} completed={currentStep !== 'player-count'} label="Players" />
          <StepLine completed={currentStep !== 'player-count'} />
          <StepDot step={2} active={currentStep === 'player-config'} completed={currentStep === 'game-options' || currentStep === 'objectives-selection' || currentStep === 'speaker-selection'} label="Config" />
          <StepLine completed={currentStep === 'game-options' || currentStep === 'objectives-selection' || currentStep === 'speaker-selection'} />
          <StepDot step={3} active={currentStep === 'game-options'} completed={currentStep === 'objectives-selection' || currentStep === 'speaker-selection'} label="Options" />
          <StepLine completed={currentStep === 'objectives-selection' || currentStep === 'speaker-selection'} />
          <StepDot step={4} active={currentStep === 'objectives-selection'} completed={currentStep === 'speaker-selection'} label="Objectives" />
          <StepLine completed={currentStep === 'speaker-selection'} />
          <StepDot step={5} active={currentStep === 'speaker-selection'} completed={false} label="Speaker" />
        </div>
      </div>

      <Panel className={styles.content}>
        {currentStep === 'player-count' && (
          <PlayerCountSelector
            onSelect={handlePlayerCountSelect}
            onCancel={handleCancel}
          />
        )}

        {currentStep === 'player-config' && (
          <MapPlayerConfiguration
            playerCount={playerCount}
            players={players}
            onComplete={handlePlayerConfigComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'game-options' && (
          <GameOptionsForm
            initialConfig={gameConfig}
            onComplete={handleGameOptionsComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'objectives-selection' && (
          <ObjectiveSelection
            onComplete={handleObjectivesComplete}
            onBack={handleBack}
          />
        )}

        {currentStep === 'speaker-selection' && (
          <SpeakerSelection
            players={players}
            onSelect={handleSpeakerSelect}
            onBack={handleBack}
            isCreating={isCreating}
          />
        )}
      </Panel>
    </div>
  );
}

interface StepDotProps {
  step: number;
  active: boolean;
  completed: boolean;
  label: string;
}

function StepDot({ step, active, completed, label }: StepDotProps) {
  return (
    <div className={styles.stepDotContainer}>
      <div
        className={`${styles.stepDot} ${active ? styles.active : ''} ${completed ? styles.completed : ''}`}
      >
        {completed ? '✓' : step}
      </div>
      <span className={styles.stepLabel}>{label}</span>
    </div>
  );
}

function StepLine({ completed }: { completed: boolean }) {
  return <div className={`${styles.stepLine} ${completed ? styles.completed : ''}`} />;
}
