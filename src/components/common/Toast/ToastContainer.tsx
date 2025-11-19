import { createPortal } from 'react-dom';
import { useToast } from './ToastContext';
import { ToastItem } from './ToastItem';
import styles from './Toast.module.css';

export function ToastContainer() {
  const { toasts } = useToast();

  if (toasts.length === 0) return null;

  return createPortal(
    <div className={styles.container}>
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>,
    document.body
  );
}
