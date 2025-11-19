import { useEffect, useState, useCallback } from 'react';
import { Toast, useToast } from './ToastContext';
import { Button } from '../Button';
import styles from './Toast.module.css';

interface ToastItemProps {
  toast: Toast;
}

export function ToastItem({ toast }: ToastItemProps) {
  const { hideToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const handleClose = useCallback(() => {
    setIsExiting(true);
    setTimeout(() => {
      hideToast(toast.id);
    }, 200); // Match animation duration
  }, [hideToast, toast.id]);

  // Auto-dismiss after duration
  useEffect(() => {
    if (!toast.duration || toast.duration <= 0) return;

    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration);

    return () => clearTimeout(timer);
  }, [toast.duration, handleClose]);

  return (
    <div
      className={`${styles.toast} ${styles[toast.type]} ${isExiting ? styles.exiting : ''}`}
      role="alert"
    >
      <div className={styles.message}>{toast.message}</div>
      <Button
        iconOnly
        icon="✕"
        size="small"
        onClick={handleClose}
        variant="ghost"
        aria-label="Close"
        style={
          {
            '--background-color': 'var(--color-bg-elevated)',
            '--border-color': 'var(--color-bg-elevated)',
          } as React.CSSProperties
        }
      />
    </div>
  );
}
