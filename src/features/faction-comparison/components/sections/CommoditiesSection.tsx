import styles from './CommoditiesSection.module.css';

interface CommoditiesSectionProps {
  commodityValue: number;
}

export function CommoditiesSection({ commodityValue }: CommoditiesSectionProps) {
  return (
    <div className={styles.content}>
      <div className={styles.value}>{commodityValue}</div>
    </div>
  );
}
