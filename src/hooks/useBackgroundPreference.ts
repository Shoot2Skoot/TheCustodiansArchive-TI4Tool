import { useEffect, useState } from 'react';

export type BackgroundType = 'solid' | 'space-1' | 'space-2' | 'space-3' | 'space-4' | 'ti-1';

const BACKGROUND_STORAGE_KEY = 'ti4-background-preference';
const DEFAULT_BACKGROUND: BackgroundType = 'space-1';

export function useBackgroundPreference() {
  const [background, setBackgroundState] = useState<BackgroundType>(() => {
    const stored = localStorage.getItem(BACKGROUND_STORAGE_KEY);
    return (stored as BackgroundType) || DEFAULT_BACKGROUND;
  });

  const setBackground = (bg: BackgroundType) => {
    setBackgroundState(bg);
    localStorage.setItem(BACKGROUND_STORAGE_KEY, bg);
  };

  useEffect(() => {
    // Apply background to body element
    const body = document.body;

    if (background === 'solid') {
      body.style.background = 'var(--color-bg-primary)';
      body.style.backgroundAttachment = '';
    } else if (background === 'space-1') {
      body.style.background = "url('/src/assets/backgrounds/space-1.jpg') center center / cover no-repeat fixed";
      body.style.backgroundColor = 'var(--color-bg-primary)';
    } else if (background === 'space-2') {
      body.style.background = "url('/src/assets/backgrounds/space-2.jpg') center center / cover no-repeat fixed";
      body.style.backgroundColor = 'var(--color-bg-primary)';
    } else if (background === 'space-3') {
      body.style.background = "url('/src/assets/backgrounds/space-3.jpg') center center / cover no-repeat fixed";
      body.style.backgroundColor = 'var(--color-bg-primary)';
    } else if (background === 'space-4') {
      body.style.background = "url('/src/assets/backgrounds/space-4.jpg') center center / cover no-repeat fixed";
      body.style.backgroundColor = 'var(--color-bg-primary)';
    } else if (background === 'ti-1') {
      body.style.background = "url('/src/assets/backgrounds/ti-1.jpg') center center / cover no-repeat fixed";
      body.style.backgroundColor = 'var(--color-bg-primary)';
    }
  }, [background]);

  return { background, setBackground };
}
