import { useState } from 'react';
import type { UnitType } from '@/data/combatConfig';
import { getUnitImage } from '@/data/shipImages';
import styles from './UnitImageSelector.module.css';

interface UnitImageSelectorProps {
  unitType: UnitType;
  unitName: string;
  count: number;
  onChange: (newCount: number) => void;
  maxCount?: number;
}

export function UnitImageSelector({
  unitType,
  unitName,
  count,
  onChange,
  maxCount = 20,
}: UnitImageSelectorProps) {
  const [isPressed, setIsPressed] = useState(false);
  const imageUrl = getUnitImage(unitType);

  const handleLeftClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(true);
    setTimeout(() => setIsPressed(false), 150);
    onChange(Math.min(maxCount, count + 1));
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (count > 0) {
      setIsPressed(true);
      setTimeout(() => setIsPressed(false), 150);
      onChange(count - 1);
    }
  };

  return (
    <div className={styles.unitSelector}>
      <div
        className={`${styles.imageContainer} ${isPressed ? styles.pressed : ''}`}
        onClick={handleLeftClick}
        onContextMenu={handleRightClick}
        title={`Left click to add ${unitName}, Right click to remove`}
      >
        <img src={imageUrl} alt={unitName} className={styles.unitImage} />
        {count > 0 && (
          <div className={styles.countBadge}>
            {count}
          </div>
        )}
      </div>
      <div className={styles.unitLabel}>{unitName}</div>
    </div>
  );
}
