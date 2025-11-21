/**
 * Audio System Test Page
 *
 * This component allows you to test all aspects of the audio system:
 * - Individual sound playback
 * - Sound chaining
 * - Queue behavior
 * - Preloading status
 * - Variants
 */

import { useState, useEffect } from 'react';
import { Panel, Button } from '@/components/common';
import { useAudio } from '@/hooks/useAudio';
import {
  audioService,
  SoundCategory,
  PhaseType,
  StrategyCardType,
  EventType,
  playFactionPrompt,
} from '@/lib/audio';
import { getStrategyCardAudioType } from '@/lib/audioHelpers';
import styles from './AudioTestPage.module.css';

// Sample faction IDs for testing
const TEST_FACTIONS = [
  'arborec',
  'barony_of_letnev',
  'winnu',
  'xxcha_kingdom',
  'yssaril_tribes',
];

export function AudioTestPage() {
  const audio = useAudio();
  const [queueLength, setQueueLength] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [lastPlayed, setLastPlayed] = useState<string>('');
  const [loadedSounds, setLoadedSounds] = useState<string[]>([]);
  const [selectedFaction, setSelectedFaction] = useState(TEST_FACTIONS[0]);
  const [log, setLog] = useState<string[]>([]);

  // Update queue length periodically
  useEffect(() => {
    const interval = setInterval(() => {
      const length = audio.getQueueLength();
      setQueueLength(length);
      setIsPlaying(length > 0);
    }, 100);

    return () => clearInterval(interval);
  }, [audio]);

  // Helper to add to log
  const addLog = (message: string) => {
    setLog(prev => [...prev.slice(-9), `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Test individual faction name
  const testFactionName = (factionId: string) => {
    setLastPlayed(`Faction: ${factionId}`);
    addLog(`Playing faction: ${factionId}`);
    audio.playFactionName(factionId);
  };

  // Test phase sounds
  const testPhaseEnter = (phase: PhaseType) => {
    setLastPlayed(`Phase Enter: ${phase}`);
    addLog(`Playing phase enter: ${phase}`);
    audio.playPhaseEnter(phase);
  };

  const testPhaseExit = (phase: PhaseType) => {
    setLastPlayed(`Phase Exit: ${phase}`);
    addLog(`Playing phase exit: ${phase}`);
    audio.playPhaseExit(phase);
  };

  // Test strategy card
  const testStrategyCard = (cardId: number) => {
    const cardType = getStrategyCardAudioType(cardId);
    if (cardType) {
      setLastPlayed(`Strategy Card: ${cardType}`);
      addLog(`Playing strategy card: ${cardType} (random variant)`);
      audio.playStrategyCard(cardType, 3);
    }
  };

  // Test event
  const testEvent = (eventType: EventType) => {
    setLastPlayed(`Event: ${eventType}`);
    addLog(`Playing event: ${eventType}`);
    audio.playEvent(eventType);
  };

  // Test chained sound (faction + prompt)
  const testChainedSound = (factionFirst: boolean) => {
    const promptId = factionFirst ? 'choose_strategy' : 'choose_action_prefix';
    setLastPlayed(`Chained: ${selectedFaction} + ${promptId}`);
    addLog(`Playing chained: ${selectedFaction} + ${promptId}`);
    playFactionPrompt(selectedFaction, promptId, factionFirst);
  };

  // Test rapid fire (queue system)
  const testRapidFire = () => {
    addLog('Testing rapid fire (queue system)...');
    TEST_FACTIONS.forEach((faction, i) => {
      setTimeout(() => {
        audio.playFactionName(faction);
      }, i * 50); // Fire every 50ms
    });
  };

  // Preload test sounds
  const preloadTestSounds = async () => {
    addLog('Preloading test sounds...');
    try {
      await audio.preloadSounds([
        { category: SoundCategory.FACTION, id: selectedFaction },
        { category: SoundCategory.PHASE_ENTER, id: PhaseType.ACTION },
        { category: SoundCategory.PHASE_EXIT, id: PhaseType.ACTION },
        { category: SoundCategory.EVENT, id: EventType.COMBAT },
      ]);

      // Check what's loaded
      const loaded: string[] = [];
      if (audio.isSoundLoaded(SoundCategory.FACTION, selectedFaction)) {
        loaded.push(`faction:${selectedFaction}`);
      }
      if (audio.isSoundLoaded(SoundCategory.PHASE_ENTER, PhaseType.ACTION)) {
        loaded.push('phase_enter:action');
      }
      if (audio.isSoundLoaded(SoundCategory.PHASE_EXIT, PhaseType.ACTION)) {
        loaded.push('phase_exit:action');
      }
      if (audio.isSoundLoaded(SoundCategory.EVENT, EventType.COMBAT)) {
        loaded.push('event:combat');
      }

      setLoadedSounds(loaded);
      addLog(`Preloaded ${loaded.length} sounds`);
    } catch (error) {
      addLog(`Preload failed: ${error}`);
    }
  };

  // Preload all test factions
  const preloadAllFactions = async () => {
    addLog('Preloading all test factions...');
    try {
      await audio.preloadAllFactions(TEST_FACTIONS);
      addLog('All factions preloaded');
    } catch (error) {
      addLog(`Preload failed: ${error}`);
    }
  };

  // Clear queue
  const handleClearQueue = () => {
    audio.clearQueue();
    addLog('Queue cleared');
  };

  // Stop current
  const handleStopCurrent = () => {
    audio.stopCurrentSound();
    addLog('Stopped current sound');
  };

  return (
    <div className={styles.container}>
      <h1>Audio System Test Page</h1>

      {/* Status Panel */}
      <Panel className={styles.statusPanel}>
        <h2>Status</h2>
        <div className={styles.statusGrid}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Queue Length:</span>
            <span className={styles.statusValue}>{queueLength}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Playing:</span>
            <span className={`${styles.statusValue} ${isPlaying ? styles.active : ''}`}>
              {isPlaying ? 'Yes' : 'No'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Last Played:</span>
            <span className={styles.statusValue}>{lastPlayed || 'None'}</span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Loaded Sounds:</span>
            <span className={styles.statusValue}>{loadedSounds.length}</span>
          </div>
        </div>
        <div className={styles.controls}>
          <Button onClick={handleClearQueue} variant="secondary" size="small">
            Clear Queue
          </Button>
          <Button onClick={handleStopCurrent} variant="secondary" size="small">
            Stop Current
          </Button>
        </div>
      </Panel>

      {/* Preloading Panel */}
      <Panel className={styles.panel}>
        <h2>Preloading</h2>
        <div className={styles.buttonGroup}>
          <Button onClick={preloadTestSounds} variant="primary">
            Preload Test Sounds
          </Button>
          <Button onClick={preloadAllFactions} variant="primary">
            Preload All Factions
          </Button>
        </div>
        {loadedSounds.length > 0 && (
          <div className={styles.loadedList}>
            <h3>Loaded:</h3>
            <ul>
              {loadedSounds.map(sound => (
                <li key={sound}>{sound}</li>
              ))}
            </ul>
          </div>
        )}
      </Panel>

      {/* Faction Tests */}
      <Panel className={styles.panel}>
        <h2>Faction Names</h2>
        <div className={styles.factionSelector}>
          <label>Selected Faction:</label>
          <select
            value={selectedFaction}
            onChange={(e) => setSelectedFaction(e.target.value)}
            className={styles.select}
          >
            {TEST_FACTIONS.map(faction => (
              <option key={faction} value={faction}>
                {faction}
              </option>
            ))}
          </select>
          <Button onClick={() => testFactionName(selectedFaction)} variant="primary">
            Play Selected
          </Button>
        </div>
        <div className={styles.buttonGrid}>
          {TEST_FACTIONS.map(faction => (
            <Button
              key={faction}
              onClick={() => testFactionName(faction)}
              variant="secondary"
              size="small"
            >
              {faction}
            </Button>
          ))}
        </div>
      </Panel>

      {/* Phase Tests */}
      <Panel className={styles.panel}>
        <h2>Phase Sounds</h2>
        <div className={styles.phaseGrid}>
          <div>
            <h3>Enter Phase</h3>
            <div className={styles.buttonGroup}>
              <Button onClick={() => testPhaseEnter(PhaseType.STRATEGY)} size="small">
                Strategy
              </Button>
              <Button onClick={() => testPhaseEnter(PhaseType.ACTION)} size="small">
                Action
              </Button>
              <Button onClick={() => testPhaseEnter(PhaseType.STATUS)} size="small">
                Status
              </Button>
              <Button onClick={() => testPhaseEnter(PhaseType.AGENDA)} size="small">
                Agenda
              </Button>
            </div>
          </div>
          <div>
            <h3>Exit Phase</h3>
            <div className={styles.buttonGroup}>
              <Button onClick={() => testPhaseExit(PhaseType.STRATEGY)} size="small">
                Strategy
              </Button>
              <Button onClick={() => testPhaseExit(PhaseType.ACTION)} size="small">
                Action
              </Button>
              <Button onClick={() => testPhaseExit(PhaseType.STATUS)} size="small">
                Status
              </Button>
              <Button onClick={() => testPhaseExit(PhaseType.AGENDA)} size="small">
                Agenda
              </Button>
            </div>
          </div>
        </div>
      </Panel>

      {/* Strategy Card Tests */}
      <Panel className={styles.panel}>
        <h2>Strategy Cards (Random Variants)</h2>
        <div className={styles.buttonGrid}>
          {[1, 2, 3, 4, 5, 6, 7, 8].map(cardId => {
            const cardType = getStrategyCardAudioType(cardId);
            return (
              <Button
                key={cardId}
                onClick={() => testStrategyCard(cardId)}
                variant="secondary"
                size="small"
              >
                {cardId}. {cardType}
              </Button>
            );
          })}
        </div>
      </Panel>

      {/* Event Tests */}
      <Panel className={styles.panel}>
        <h2>Events</h2>
        <div className={styles.buttonGroup}>
          <Button onClick={() => testEvent(EventType.COMBAT)}>
            Combat
          </Button>
          <Button onClick={() => testEvent(EventType.MECATOL_REX_TAKEN)}>
            Mecatol Rex Taken
          </Button>
          <Button onClick={() => testEvent(EventType.SPEAKER_CHANGE)}>
            Speaker Change
          </Button>
        </div>
      </Panel>

      {/* Chained Sound Tests */}
      <Panel className={styles.panel}>
        <h2>Chained Sounds (Faction + Prompt)</h2>
        <p>Uses selected faction: <strong>{selectedFaction}</strong></p>
        <div className={styles.buttonGroup}>
          <Button onClick={() => testChainedSound(true)} variant="primary">
            "The [Faction], choose your strategy"
          </Button>
          <Button onClick={() => testChainedSound(false)} variant="primary">
            "Choose your action, The [Faction]"
          </Button>
        </div>
      </Panel>

      {/* Queue Tests */}
      <Panel className={styles.panel}>
        <h2>Queue System Tests</h2>
        <div className={styles.buttonGroup}>
          <Button onClick={testRapidFire} variant="primary">
            Rapid Fire Test (5 sounds in 250ms)
          </Button>
        </div>
        <p className={styles.hint}>
          This tests the queue system by firing 5 sounds rapidly. They should play in sequence without overlap.
        </p>
      </Panel>

      {/* Log Panel */}
      <Panel className={styles.logPanel}>
        <h2>Activity Log</h2>
        <div className={styles.log}>
          {log.length === 0 && <div className={styles.logEmpty}>No activity yet...</div>}
          {log.map((entry, i) => (
            <div key={i} className={styles.logEntry}>
              {entry}
            </div>
          ))}
        </div>
      </Panel>
    </div>
  );
}
