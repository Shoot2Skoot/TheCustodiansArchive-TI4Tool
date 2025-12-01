import type { FactionData } from '@/data/factions/types';
import styles from './PromissorySection.module.css';

interface PromissorySectionProps {
  promissoryNote: FactionData['promissoryNote'];
  codex1Enabled: boolean;
}

export function PromissorySection({ promissoryNote, codex1Enabled }: PromissorySectionProps) {
  const activeNote = codex1Enabled && promissoryNote.omega
    ? promissoryNote.omega
    : promissoryNote.base;
  const isOmega = codex1Enabled && !!promissoryNote.omega;

  return (
    <div className={styles.content}>
      <div className={styles.name}>{activeNote.name}</div>
      <div className={styles.effect}>{activeNote.effect}</div>
      <div className={styles.returnCondition}>
        <span className={styles.label}>Return:</span> {activeNote.returnCondition}
      </div>
      {activeNote.placeFaceUp && (
        <div className={styles.faceUp}>Place face-up</div>
      )}
    </div>
  );
}
