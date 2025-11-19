import { useEffect, useState } from 'react';
import { ensureAnonymousSession } from '@/lib/auth';

/**
 * Hook to ensure user has an anonymous session on app load
 * This prevents delays when creating games
 */
export function useEnsureSession() {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureAnonymousSession()
      .then(() => {
        setIsReady(true);
      })
      .catch((err) => {
        console.error('Failed to ensure session:', err);
        setError(err.message);
        setIsReady(true); // Still set ready to avoid blocking the app
      });
  }, []);

  return { isReady, error };
}
