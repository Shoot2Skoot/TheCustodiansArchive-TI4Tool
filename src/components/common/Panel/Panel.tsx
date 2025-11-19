import { HTMLAttributes, ReactNode } from 'react';
import styles from './Panel.module.css';

export type PanelVariant = 'default' | 'elevated' | 'bordered';

export interface PanelProps extends HTMLAttributes<HTMLDivElement> {
  variant?: PanelVariant;
  beveled?: boolean;
  padding?: 'none' | 'small' | 'medium' | 'large';
  children: ReactNode;
}

export function Panel({
  variant = 'default',
  beveled = true,
  padding = 'medium',
  className = '',
  children,
  ...props
}: PanelProps) {
  const classNames = [
    styles.panel,
    styles[variant],
    beveled && styles.beveled,
    styles[`padding-${padding}`],
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={classNames} {...props}>
      {children}
    </div>
  );
}
