import { ButtonHTMLAttributes, ReactNode } from 'react';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost';
export type ButtonSize = 'small' | 'medium' | 'large';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  icon?: ReactNode;
  iconOnly?: boolean;
  children?: ReactNode;
  customColor?: string;
}

export function Button({
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  iconOnly = false,
  className = '',
  children,
  disabled,
  customColor,
  style,
  ...props
}: ButtonProps) {
  const classNames = [
    styles.button,
    styles[variant],
    styles[size],
    fullWidth && styles.fullWidth,
    iconOnly && styles.iconOnly,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const buttonStyle = customColor
    ? {
        ...style,
        '--background-color': customColor,
        '--border-color': customColor,
      } as React.CSSProperties
    : style;

  return (
    <button className={classNames} disabled={disabled} style={buttonStyle} {...props}>
      {icon && <span className={styles.icon}>{icon}</span>}
      {!iconOnly && children}
    </button>
  );
}
