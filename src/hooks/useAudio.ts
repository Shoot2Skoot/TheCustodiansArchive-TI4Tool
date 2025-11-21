/**
 * React Hook for Audio Service
 *
 * Provides a convenient interface for using the audio service in React components.
 * Handles cleanup on unmount.
 */

import { useEffect, useCallback, useRef } from 'react';
import {
  audioService,
  SoundCategory,
  PhaseType,
  PromptType,
  playFactionName,
  playPhaseEnter,
  playPhaseExit,
  playStrategyCard,
  playEvent,
  playFactionPrompt,
  preloadAllFactions,
  preloadPhaseSounds,
  preloadStrategyCards,
  preloadEventSounds,
  preloadCommonSounds,
  type ChainedSound,
} from '@/lib/audio';

export interface UseAudioOptions {
  /**
   * Automatically preload sounds on mount
   */
  autoPreload?: boolean;

  /**
   * Sounds to preload on mount
   */
  preloadSounds?: Array<{
    category: SoundCategory;
    id: string;
    variant?: number;
  }>;

  /**
   * Unload sounds on unmount
   */
  unloadOnUnmount?: boolean;
}

export function useAudio(options: UseAudioOptions = {}) {
  const {
    autoPreload = false,
    preloadSounds = [],
    unloadOnUnmount = false,
  } = options;

  const isLoadingRef = useRef(false);

  // Preload sounds on mount
  useEffect(() => {
    if (autoPreload && preloadSounds.length > 0 && !isLoadingRef.current) {
      isLoadingRef.current = true;
      audioService.preloadSounds(preloadSounds).catch(err => {
        console.error('Failed to preload sounds:', err);
      });
    }
  }, [autoPreload, preloadSounds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (unloadOnUnmount && preloadSounds.length > 0) {
        audioService.unloadSounds(preloadSounds);
      }
    };
  }, [unloadOnUnmount, preloadSounds]);

  // Play a sound
  const playSound = useCallback(
    async (category: SoundCategory, id: string) => {
      try {
        await audioService.playSound(category, id);
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    },
    []
  );

  // Play chained sounds
  const playChainedSounds = useCallback(async (sounds: ChainedSound[]) => {
    try {
      await audioService.playChainedSounds(sounds);
    } catch (error) {
      console.error('Error playing chained sounds:', error);
    }
  }, []);

  // Clear queue
  const clearQueue = useCallback(() => {
    audioService.clearQueue();
  }, []);

  // Stop current sound
  const stopCurrentSound = useCallback(() => {
    audioService.stopCurrentSound();
  }, []);

  return {
    // Core methods
    playSound,
    playChainedSounds,
    clearQueue,
    stopCurrentSound,

    // Convenience methods
    playFactionName: useCallback(playFactionName, []),
    playPhaseEnter: useCallback(playPhaseEnter, []),
    playPhaseExit: useCallback(playPhaseExit, []),
    playStrategyCard: useCallback(playStrategyCard, []),
    playEvent: useCallback(playEvent, []),
    playFactionPrompt: useCallback(playFactionPrompt, []),

    // Preload methods
    preloadSounds: useCallback(audioService.preloadSounds.bind(audioService), []),
    preloadAllFactions: useCallback(preloadAllFactions, []),
    preloadPhaseSounds: useCallback(preloadPhaseSounds, []),
    preloadStrategyCards: useCallback(preloadStrategyCards, []),
    preloadEventSounds: useCallback(preloadEventSounds, []),
    preloadCommonSounds: useCallback(preloadCommonSounds, []),

    // Utility methods
    getQueueLength: useCallback(() => audioService.getQueueLength(), []),
    isSoundLoaded: useCallback(
      (category: SoundCategory, id: string, variant?: number) =>
        audioService.isSoundLoaded(category, id, variant),
      []
    ),
  };
}

// ============================================================================
// Specialized Hooks
// ============================================================================

/**
 * Hook for Action Phase audio
 */
export function useActionPhaseAudio(factionIds: string[]) {
  const audio = useAudio({
    autoPreload: true,
    preloadSounds: [
      // Phase sounds
      { category: SoundCategory.PHASE_ENTER, id: PhaseType.ACTION },
      { category: SoundCategory.PHASE_EXIT, id: PhaseType.ACTION },
      // Prompts
      { category: SoundCategory.PROMPT, id: PromptType.CHOOSE_ACTION },
      // Factions in this game
      ...factionIds.map(id => ({ category: SoundCategory.FACTION, id })),
    ],
    unloadOnUnmount: true,
  });

  // Play "choose your action" for a faction
  const playChooseActionPrompt = useCallback(
    (factionId: string, factionFirst: boolean = false) => {
      return playFactionPrompt(
        factionId,
        PromptType.CHOOSE_ACTION,
        factionFirst
      );
    },
    []
  );

  return {
    ...audio,
    playChooseActionPrompt,
  };
}

/**
 * Hook for Strategy Phase audio
 */
export function useStrategyPhaseAudio(factionIds: string[]) {
  const audio = useAudio({
    autoPreload: true,
    preloadSounds: [
      // Phase sounds
      { category: SoundCategory.PHASE_ENTER, id: PhaseType.STRATEGY },
      { category: SoundCategory.PHASE_EXIT, id: PhaseType.STRATEGY },
      // Prompts
      { category: SoundCategory.PROMPT, id: PromptType.CHOOSE_STRATEGY },
      // Factions in this game
      ...factionIds.map(id => ({ category: SoundCategory.FACTION, id })),
    ],
    unloadOnUnmount: true,
  });

  // Play "choose your strategy" for a faction
  const playChooseStrategyPrompt = useCallback(
    (factionId: string, factionFirst: boolean = true) => {
      return playFactionPrompt(
        factionId,
        PromptType.CHOOSE_STRATEGY,
        factionFirst
      );
    },
    []
  );

  return {
    ...audio,
    playChooseStrategyPrompt,
  };
}

/**
 * Hook for Status Phase audio
 */
export function useStatusPhaseAudio() {
  return useAudio({
    autoPreload: true,
    preloadSounds: [
      { category: SoundCategory.PHASE_ENTER, id: PhaseType.STATUS },
      { category: SoundCategory.PHASE_EXIT, id: PhaseType.STATUS },
    ],
    unloadOnUnmount: true,
  });
}

/**
 * Hook for Agenda Phase audio
 */
export function useAgendaPhaseAudio() {
  return useAudio({
    autoPreload: true,
    preloadSounds: [
      { category: SoundCategory.PHASE_ENTER, id: PhaseType.AGENDA },
      { category: SoundCategory.PHASE_EXIT, id: PhaseType.AGENDA },
    ],
    unloadOnUnmount: true,
  });
}

/**
 * Hook for preloading all game audio at app initialization
 */
export function usePreloadGameAudio(factionIds: string[]) {
  const isLoadedRef = useRef(false);

  useEffect(() => {
    if (!isLoadedRef.current) {
      isLoadedRef.current = true;

      // Preload all common sounds
      Promise.all([
        preloadCommonSounds(),
        preloadAllFactions(factionIds),
        preloadStrategyCards(),
      ])
        .then(() => {
          console.log('All game audio preloaded successfully');
        })
        .catch(err => {
          console.error('Failed to preload game audio:', err);
        });
    }
  }, [factionIds]);
}
