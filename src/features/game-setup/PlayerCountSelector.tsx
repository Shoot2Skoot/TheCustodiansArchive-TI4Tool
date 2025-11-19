import { useState } from 'react';
import { Button } from '@/components/common';
import styles from './PlayerCountSelector.module.css';

interface PlayerCountSelectorProps {
  onSelect: (count: number) => void;
  onCancel: () => void;
}

// Generate polygon points based on number of sides
function getPolygonPoints(sides: number, radius: number = 90): string {
  const coords: { x: number; y: number }[] = [];

  // Adjust starting angle for visual balance
  let rotationOffset = -Math.PI / 2; // Start from top by default

  if (sides === 4 || sides === 8) {
    // For squares and octagons, rotate so flat edge is on top
    rotationOffset = -Math.PI / 2 + Math.PI / sides;
  }

  // Calculate raw coordinates
  for (let i = 0; i < sides; i++) {
    const angle = (i * 2 * Math.PI) / sides + rotationOffset;
    const x = radius * Math.cos(angle);
    const y = radius * Math.sin(angle);
    coords.push({ x, y });
  }

  // The geometric center of a regular polygon is at (0, 0)
  // Just translate all points to center at (100, 100) in the viewBox
  const points = coords.map(c => `${c.x + 100},${c.y + 100}`);

  return points.join(' ');
}

export function PlayerCountSelector({ onSelect, onCancel }: PlayerCountSelectorProps) {
  const [selectedCount, setSelectedCount] = useState<number>(6);

  const handleSelect = () => {
    onSelect(selectedCount);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>How many players?</h2>
        <p className={styles.description}>
          Select the number of players for your game
        </p>
      </div>

      <div className={styles.sliderSection}>
        <div className={styles.polygonContainer}>
          <svg className={styles.polygon} viewBox="0 0 200 200">
            <polygon
              points={getPolygonPoints(selectedCount, 90)}
              className={styles.polygonShapeOuter}
            />
            <polygon
              points={getPolygonPoints(selectedCount, selectedCount === 3 ? 65 : 70)}
              className={styles.polygonShapeInner}
            />
          </svg>
        </div>

        <div className={styles.sliderControls}>
          <div className={styles.sliderLabels}>
            {[3, 4, 5, 6, 7, 8].map((num) => (
              <button
                key={num}
                className={`${styles.label} ${selectedCount === num ? styles.activeLabel : ''}`}
                onClick={() => setSelectedCount(num)}
              >
                {num}
              </button>
            ))}
          </div>

          <div className={styles.sliderContainer}>
            <div className={styles.sliderTrack}>
              <div
                className={styles.sliderFill}
                style={{ width: `${((selectedCount - 3) / 5) * 100}%` }}
              />
              <div className={styles.tickMarks}>
                {[3, 4, 5, 6, 7, 8].map((num) => (
                  <div
                    key={num}
                    className={`${styles.tick} ${selectedCount >= num ? styles.active : ''}`}
                  />
                ))}
              </div>
            </div>
            <input
              type="range"
              min="3"
              max="8"
              step="1"
              value={selectedCount}
              onChange={(e) => setSelectedCount(parseInt(e.target.value))}
              className={styles.slider}
            />
          </div>
        </div>
      </div>

      <div className={styles.actions}>
        <Button variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button variant="primary" size="large" onClick={handleSelect}>
          Continue
        </Button>
      </div>
    </div>
  );
}
