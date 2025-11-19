import { useState } from 'react';
import { Button } from '@/components/common';
import type { GameConfig } from '@/types';
import type { TimerMode } from '@/types/enums';
import styles from './GameOptionsForm.module.css';

interface GameOptionsFormProps {
  initialConfig: Partial<GameConfig>;
  onComplete: (config: Partial<GameConfig>) => void;
  onBack: () => void;
}

export function GameOptionsForm({ initialConfig, onComplete, onBack }: GameOptionsFormProps) {
  const [config, setConfig] = useState<Partial<GameConfig>>(initialConfig);

  const handleSubmit = () => {
    onComplete(config);
  };

  const updateConfig = <K extends keyof GameConfig>(key: K, value: GameConfig[K]) => {
    setConfig({ ...config, [key]: value });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>Game Options</h2>
        <p className={styles.description}>
          Configure your game settings
        </p>
      </div>

      <div className={styles.form}>
        {/* Victory Points */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Victory Conditions</h3>
          <div className={styles.field}>
            <label className={styles.label}>
              Victory Point Limit
              <span className={styles.labelDescription}>Points needed to win</span>
            </label>
            <div className={styles.vpButtons}>
              {[10, 12, 14].map((vp) => (
                <button
                  key={vp}
                  className={`${styles.vpButton} ${config.victoryPointLimit === vp ? styles.selected : ''}`}
                  onClick={() => updateConfig('victoryPointLimit', vp)}
                >
                  {vp} VP
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timer Settings */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Timer Settings</h3>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={config.timerEnabled || false}
                onChange={(e) => updateConfig('timerEnabled', e.target.checked)}
                className={styles.checkbox}
              />
              <span>Enable Turn Timer</span>
            </label>
          </div>

          {config.timerEnabled && (
            <>
              <div className={styles.field}>
                <label className={styles.label}>Timer Mode</label>
                <div className={styles.radioGroup}>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="timerMode"
                      value="per-turn"
                      checked={config.timerMode === 'per-turn'}
                      onChange={(e) => updateConfig('timerMode', e.target.value as TimerMode)}
                      className={styles.radio}
                    />
                    <div>
                      <div className={styles.radioTitle}>Per Turn</div>
                      <div className={styles.radioDescription}>Timer resets each turn</div>
                    </div>
                  </label>
                  <label className={styles.radioLabel}>
                    <input
                      type="radio"
                      name="timerMode"
                      value="cumulative"
                      checked={config.timerMode === 'cumulative'}
                      onChange={(e) => updateConfig('timerMode', e.target.value as TimerMode)}
                      className={styles.radio}
                    />
                    <div>
                      <div className={styles.radioTitle}>Cumulative</div>
                      <div className={styles.radioDescription}>Total time per player tracked</div>
                    </div>
                  </label>
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>
                  Timer Duration (minutes)
                  <span className={styles.labelValue}>{config.timerDurationMinutes || 5} min</span>
                </label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={config.timerDurationMinutes || 5}
                  onChange={(e) => updateConfig('timerDurationMinutes', parseInt(e.target.value))}
                  className={styles.slider}
                />
                <div className={styles.sliderLabels}>
                  <span>1 min</span>
                  <span>30 min</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Display Options */}
        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>Display Options</h3>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={config.showObjectives ?? true}
                onChange={(e) => updateConfig('showObjectives', e.target.checked)}
                className={styles.checkbox}
              />
              <span>Show Public Objectives</span>
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={config.showTechnologies ?? true}
                onChange={(e) => updateConfig('showTechnologies', e.target.checked)}
                className={styles.checkbox}
              />
              <span>Show Technology Tree</span>
            </label>
          </div>

          <div className={styles.field}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={config.showStrategyCards ?? true}
                onChange={(e) => updateConfig('showStrategyCards', e.target.checked)}
                className={styles.checkbox}
              />
              <span>Show Strategy Cards</span>
            </label>
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onBack}>
          Back
        </Button>
        <Button variant="primary" size="large" onClick={handleSubmit}>
          Continue to Speaker Selection
        </Button>
      </div>
    </div>
  );
}
