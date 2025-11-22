/**
 * Audio Service for TI4 Game Assistant - Updated with Voice Support
 *
 * Manages loading, playing, and queueing of voice-over sound effects.
 * Supports multiple voices and multiple variants per sound type.
 */

import { voiceSettings } from './voiceSettings';

// ============================================================================
// Types and Enums
// ============================================================================

export enum SoundCategory {
  // Faction names
  FACTION = 'faction',

  // Phase transitions
  PHASE_ENTER = 'phase_enter',
  PHASE_EXIT = 'phase_exit',

  // Player prompts
  PROMPT = 'prompt',

  // Strategy cards
  STRATEGY_CARD = 'strategy_card',

  // Game events
  EVENT = 'event',

  // Time warnings
  TIME_WARNING = 'time_warning',
  TIME_EXPIRED = 'time_expired',

  // Round management
  ROUND_BEGIN = 'round_begin',
  ROUND_END = 'round_end',

  // Objectives
  OBJECTIVES = 'objectives',

  // Agenda voting
  AGENDA_VOTING = 'agenda_voting',
}

export enum PhaseType {
  STRATEGY = 'strategy',
  ACTION = 'action',
  STATUS = 'status',
  AGENDA = 'agenda',
}

export enum StrategyCardType {
  LEADERSHIP = 'leadership',
  DIPLOMACY = 'diplomacy',
  POLITICS = 'politics',
  CONSTRUCTION = 'construction',
  TRADE = 'trade',
  WARFARE = 'warfare',
  TECHNOLOGY = 'technology',
  IMPERIAL = 'imperial',
}

export enum EventType {
  COMBAT = 'combat',
  MECATOL_REX_TAKEN = 'mecatol_rex_taken',
  SPEAKER_CHANGE = 'speaker_change',
}

export enum PromptType {
  CHOOSE_STRATEGY = 'choose_strategy',
  CHOOSE_ACTION = 'choose_action',
}

export enum ObjectiveType {
  SCORE_OBJECTIVES = 'score_objectives',
}

export enum AgendaVotingType {
  PREPARE_VOTE = 'prepare_vote',
  CAST_VOTES = 'cast_votes',
  VOTING_CONCLUDED = 'voting_concluded',
  AGENDA_RESOLVED = 'agenda_resolved',
}

export interface ChainedSound {
  category: SoundCategory;
  id: string;
  useSpecificVariant?: number; // Optional: use specific variant instead of random
}

// ============================================================================
// Variant Count Configuration
// ============================================================================

/**
 * Configuration for how many variants exist for each sound type
 * Update these as you add more audio files
 */
export const VARIANT_COUNTS = {
  // Phase transitions - 6 variants each
  phase_enter: {
    strategy: 6,
    action: 6,
    status: 6,
    agenda: 6,
  },
  phase_exit: {
    strategy: 6,
    action: 6,
    status: 6,
    agenda: 6,
  },

  // Prompts
  prompt: {
    choose_strategy: 14,
    choose_action: 10, // Estimate - update when recorded
  },

  // Strategy cards - 3 variants each
  strategy_card: {
    leadership: 3,
    diplomacy: 3,
    politics: 3,
    construction: 3,
    trade: 3,
    warfare: 3,
    technology: 3,
    imperial: 3,
  },

  // Events
  event: {
    combat: 4,
    mecatol_rex_taken: 3,
    speaker_change: 3,
  },

  // Time warnings
  time_warning: 5,
  time_expired: 5,

  // Round management
  round_begin: 4,
  round_end: 4,

  // Objectives
  objectives: 4,

  // Agenda voting
  agenda_voting: {
    prepare_vote: 1,
    cast_votes: 1,
    voting_concluded: 1,
    agenda_resolved: 1,
  },
};

// ============================================================================
// Audio Service Class
// ============================================================================

class AudioService {
  private audioContext: AudioContext | null = null;
  private loadedSounds: Map<string, ArrayBuffer> = new Map();
  private playQueue: Array<() => Promise<void>> = [];
  private isPlaying = false;
  private currentAudio: HTMLAudioElement | null = null;

  // Configuration
  private minTimeBetweenSounds = 100; // ms - minimum gap between sounds
  private maxQueueSize = 10; // Maximum number of queued sounds

  // Base path for audio files (can be configured)
  private basePath = '/audio';

  constructor() {
    // Initialize on first user interaction (required by browsers)
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext() {
    if (typeof window !== 'undefined' && !this.audioContext) {
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        this.audioContext = new AudioContextClass();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }

  /**
   * Set the base path for audio files
   */
  setBasePath(path: string) {
    this.basePath = path;
  }

  /**
   * Get the current voice folder
   */
  private getCurrentVoiceFolder(): string {
    return voiceSettings.getCurrentVoice();
  }

  /**
   * Get the full path for a sound file
   */
  private getSoundPath(category: SoundCategory, id: string, variant?: number): string {
    const voice = this.getCurrentVoiceFolder();
    const variantSuffix = variant !== undefined && variant > 0 ? `_${variant}` : '';
    return `${this.basePath}/${voice}/${category}/${id}${variantSuffix}.mp3`;
  }

  /**
   * Generate a cache key for a sound
   */
  private getCacheKey(voice: string, category: SoundCategory, id: string, variant?: number): string {
    const variantSuffix = variant !== undefined && variant > 0 ? `_${variant}` : '';
    return `${voice}:${category}:${id}${variantSuffix}`;
  }

  /**
   * Get the number of variants for a sound
   */
  private getVariantCount(category: SoundCategory, id: string): number {
    // Factions have no variants (single file)
    if (category === SoundCategory.FACTION) {
      return 1;
    }

    // Check configuration
    switch (category) {
      case SoundCategory.PHASE_ENTER:
        return (VARIANT_COUNTS.phase_enter as any)[id] || 1;
      case SoundCategory.PHASE_EXIT:
        return (VARIANT_COUNTS.phase_exit as any)[id] || 1;
      case SoundCategory.PROMPT:
        return (VARIANT_COUNTS.prompt as any)[id] || 1;
      case SoundCategory.STRATEGY_CARD:
        return (VARIANT_COUNTS.strategy_card as any)[id] || 1;
      case SoundCategory.EVENT:
        return (VARIANT_COUNTS.event as any)[id] || 1;
      case SoundCategory.TIME_WARNING:
        return VARIANT_COUNTS.time_warning;
      case SoundCategory.TIME_EXPIRED:
        return VARIANT_COUNTS.time_expired;
      case SoundCategory.ROUND_BEGIN:
        return VARIANT_COUNTS.round_begin;
      case SoundCategory.ROUND_END:
        return VARIANT_COUNTS.round_end;
      case SoundCategory.OBJECTIVES:
        return VARIANT_COUNTS.objectives;
      case SoundCategory.AGENDA_VOTING:
        return (VARIANT_COUNTS.agenda_voting as any)[id] || 1;
      default:
        return 1;
    }
  }

  /**
   * Preload a single sound file
   */
  async preloadSound(category: SoundCategory, id: string, variant?: number): Promise<void> {
    const voice = this.getCurrentVoiceFolder();
    const cacheKey = this.getCacheKey(voice, category, id, variant);

    // Skip if already loaded
    if (this.loadedSounds.has(cacheKey)) {
      return;
    }

    const path = this.getSoundPath(category, id, variant);

    try {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`Failed to load sound: ${path}`);
      }

      const arrayBuffer = await response.arrayBuffer();

      // Store the ArrayBuffer - we'll convert to blob URL when playing
      this.loadedSounds.set(cacheKey, arrayBuffer);

      console.log(`Preloaded sound: ${cacheKey}`);
    } catch (error) {
      console.error(`Error preloading sound ${cacheKey}:`, error);
      throw error;
    }
  }

  /**
   * Preload multiple sounds
   */
  async preloadSounds(sounds: Array<{ category: SoundCategory; id: string; variant?: number }>): Promise<void> {
    const promises = sounds.map(({ category, id, variant }) =>
      this.preloadSound(category, id, variant).catch(err => {
        console.error(`Failed to preload ${category}:${id}`, err);
      })
    );

    await Promise.all(promises);
  }

  /**
   * Preload all variants of a sound
   */
  async preloadSoundWithAllVariants(category: SoundCategory, id: string): Promise<void> {
    const variantCount = this.getVariantCount(category, id);

    if (variantCount === 1) {
      // No variants, just load the base sound
      return this.preloadSound(category, id);
    }

    // Load all variants
    const promises = Array.from({ length: variantCount }, (_, i) =>
      this.preloadSound(category, id, i + 1)
    );

    await Promise.all(promises);
  }

  /**
   * Unload a single sound from memory
   */
  unloadSound(category: SoundCategory, id: string, variant?: number): void {
    const voice = this.getCurrentVoiceFolder();
    const cacheKey = this.getCacheKey(voice, category, id, variant);
    this.loadedSounds.delete(cacheKey);
    console.log(`Unloaded sound: ${cacheKey}`);
  }

  /**
   * Unload multiple sounds
   */
  unloadSounds(sounds: Array<{ category: SoundCategory; id: string; variant?: number }>): void {
    sounds.forEach(({ category, id, variant }) => {
      this.unloadSound(category, id, variant);
    });
  }

  /**
   * Unload all sounds from memory
   */
  unloadAllSounds(): void {
    this.loadedSounds.clear();
    console.log('Unloaded all sounds');
  }

  /**
   * Play a single sound immediately or add to queue
   */
  private async playSoundInternal(category: SoundCategory, id: string, variant?: number): Promise<void> {
    const voice = this.getCurrentVoiceFolder();
    const cacheKey = this.getCacheKey(voice, category, id, variant);
    const path = this.getSoundPath(category, id, variant);

    // Check if sound is preloaded
    const preloadedBuffer = this.loadedSounds.get(cacheKey);
    let audioSrc: string;

    if (preloadedBuffer) {
      // Use preloaded audio - convert ArrayBuffer to Blob URL
      const blob = new Blob([preloadedBuffer], { type: 'audio/mpeg' });
      audioSrc = URL.createObjectURL(blob);
    } else {
      // Load from network
      console.warn(`Sound not preloaded: ${cacheKey}. Loading on demand...`);
      audioSrc = path;
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(audioSrc);

      audio.addEventListener('ended', () => {
        // Clean up blob URL if we created one
        if (preloadedBuffer && audioSrc.startsWith('blob:')) {
          URL.revokeObjectURL(audioSrc);
        }
        this.currentAudio = null;
        resolve();
      });

      audio.addEventListener('error', (e) => {
        console.error(`Error playing sound ${cacheKey}:`, e);
        // Clean up blob URL if we created one
        if (preloadedBuffer && audioSrc.startsWith('blob:')) {
          URL.revokeObjectURL(audioSrc);
        }
        this.currentAudio = null;
        reject(e);
      });

      this.currentAudio = audio;
      audio.play().catch(reject);
    });
  }

  /**
   * Process the play queue
   */
  private async processQueue(): Promise<void> {
    if (this.isPlaying || this.playQueue.length === 0) {
      return;
    }

    this.isPlaying = true;

    while (this.playQueue.length > 0) {
      const playFn = this.playQueue.shift();

      if (playFn) {
        try {
          await playFn();

          // Small delay between sounds to prevent audio overlap
          if (this.playQueue.length > 0) {
            await new Promise(resolve => setTimeout(resolve, this.minTimeBetweenSounds));
          }
        } catch (error) {
          console.error('Error playing queued sound:', error);
        }
      }
    }

    this.isPlaying = false;
  }

  /**
   * Play a sound with a random variant
   */
  async playSound(category: SoundCategory, id: string): Promise<void> {
    // Check if audio is enabled
    if (!voiceSettings.isAudioEnabled()) {
      return;
    }

    // Check queue size to prevent spam
    if (this.playQueue.length >= this.maxQueueSize) {
      console.warn('Audio queue is full. Skipping sound:', id);
      return;
    }

    // Get variant count and pick random variant
    const variantCount = this.getVariantCount(category, id);
    const variant = variantCount > 1 ? Math.floor(Math.random() * variantCount) + 1 : undefined;

    // Add to queue
    this.playQueue.push(() => this.playSoundInternal(category, id, variant));

    // Start processing if not already processing
    this.processQueue();
  }

  /**
   * Play a specific variant of a sound
   */
  async playSoundVariant(category: SoundCategory, id: string, variant: number): Promise<void> {
    // Check if audio is enabled
    if (!voiceSettings.isAudioEnabled()) {
      return;
    }

    // Check queue size to prevent spam
    if (this.playQueue.length >= this.maxQueueSize) {
      console.warn('Audio queue is full. Skipping sound:', id);
      return;
    }

    // Add to queue
    this.playQueue.push(() => this.playSoundInternal(category, id, variant));

    // Start processing
    this.processQueue();
  }

  /**
   * Play multiple sounds in sequence (chained)
   */
  async playChainedSounds(sounds: ChainedSound[]): Promise<void> {
    // Check if audio is enabled
    if (!voiceSettings.isAudioEnabled()) {
      return;
    }

    // Check queue size
    if (this.playQueue.length >= this.maxQueueSize) {
      console.warn('Audio queue is full. Skipping chained sounds');
      return;
    }

    // Add all sounds as a single queue item
    this.playQueue.push(async () => {
      for (const sound of sounds) {
        // Use specific variant if provided, otherwise pick random
        const variant = sound.useSpecificVariant !== undefined
          ? sound.useSpecificVariant
          : (() => {
              const variantCount = this.getVariantCount(sound.category, sound.id);
              return variantCount > 1 ? Math.floor(Math.random() * variantCount) + 1 : undefined;
            })();

        await this.playSoundInternal(sound.category, sound.id, variant);

        // Small delay between chained sounds
        if (sounds.indexOf(sound) < sounds.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.minTimeBetweenSounds));
        }
      }
    });

    // Start processing
    this.processQueue();
  }

  /**
   * Stop currently playing sound
   */
  stopCurrentSound(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
    }
  }

  /**
   * Clear the queue and stop playback
   */
  clearQueue(): void {
    this.playQueue = [];
    this.stopCurrentSound();
    this.isPlaying = false;
  }

  /**
   * Get queue length
   */
  getQueueLength(): number {
    return this.playQueue.length;
  }

  /**
   * Check if a sound is loaded
   */
  isSoundLoaded(category: SoundCategory, id: string, variant?: number): boolean {
    const voice = this.getCurrentVoiceFolder();
    const cacheKey = this.getCacheKey(voice, category, id, variant);
    return this.loadedSounds.has(cacheKey);
  }

  /**
   * Get all loaded sound keys
   */
  getLoadedSounds(): string[] {
    return Array.from(this.loadedSounds.keys());
  }

  /**
   * Get count of loaded sounds
   */
  getLoadedSoundCount(): number {
    return this.loadedSounds.size;
  }
}

// ============================================================================
// Singleton Instance
// ============================================================================

export const audioService = new AudioService();

// ============================================================================
// Convenience Functions
// ============================================================================

/**
 * Play a faction name
 */
export async function playFactionName(factionId: string): Promise<void> {
  return audioService.playSound(SoundCategory.FACTION, factionId);
}

/**
 * Play phase enter sound
 */
export async function playPhaseEnter(phase: PhaseType): Promise<void> {
  return audioService.playSound(SoundCategory.PHASE_ENTER, phase);
}

/**
 * Play phase exit sound
 */
export async function playPhaseExit(phase: PhaseType): Promise<void> {
  return audioService.playSound(SoundCategory.PHASE_EXIT, phase);
}

/**
 * Play a prompt
 */
export async function playPrompt(promptType: PromptType): Promise<void> {
  return audioService.playSound(SoundCategory.PROMPT, promptType);
}

/**
 * Play a strategy card sound (random variant)
 */
export async function playStrategyCard(cardType: StrategyCardType): Promise<void> {
  return audioService.playSound(SoundCategory.STRATEGY_CARD, cardType);
}

/**
 * Play an event sound
 */
export async function playEvent(eventType: EventType): Promise<void> {
  return audioService.playSound(SoundCategory.EVENT, eventType);
}

/**
 * Play time warning
 */
export async function playTimeWarning(): Promise<void> {
  return audioService.playSound(SoundCategory.TIME_WARNING, 'time_warning');
}

/**
 * Play time expired
 */
export async function playTimeExpired(): Promise<void> {
  return audioService.playSound(SoundCategory.TIME_EXPIRED, 'time_expired');
}

/**
 * Play round begin
 */
export async function playRoundBegin(): Promise<void> {
  return audioService.playSound(SoundCategory.ROUND_BEGIN, 'round_begin');
}

/**
 * Play round end
 */
export async function playRoundEnd(): Promise<void> {
  return audioService.playSound(SoundCategory.ROUND_END, 'round_end');
}

/**
 * Play objectives prompt
 */
export async function playObjectives(type: ObjectiveType = ObjectiveType.SCORE_OBJECTIVES): Promise<void> {
  return audioService.playSound(SoundCategory.OBJECTIVES, type);
}

/**
 * Play agenda voting prompt
 */
export async function playAgendaVoting(type: AgendaVotingType): Promise<void> {
  return audioService.playSound(SoundCategory.AGENDA_VOTING, type);
}

/**
 * Play faction name + prompt in sequence
 * Example: "The Arborec, choose your strategy"
 */
export async function playFactionPrompt(
  factionId: string,
  promptType: PromptType,
  factionFirst: boolean = true
): Promise<void> {
  const sounds: ChainedSound[] = factionFirst
    ? [
        { category: SoundCategory.FACTION, id: factionId },
        { category: SoundCategory.PROMPT, id: promptType },
      ]
    : [
        { category: SoundCategory.PROMPT, id: promptType },
        { category: SoundCategory.FACTION, id: factionId },
      ];

  return audioService.playChainedSounds(sounds);
}

// ============================================================================
// Preload Helpers
// ============================================================================

/**
 * Preload all faction sounds
 */
export async function preloadAllFactions(factionIds: string[]): Promise<void> {
  const sounds = factionIds.map(id => ({
    category: SoundCategory.FACTION,
    id,
  }));
  return audioService.preloadSounds(sounds);
}

/**
 * Preload all phase sounds with all variants
 */
export async function preloadPhaseSounds(): Promise<void> {
  const phases = Object.values(PhaseType);
  const promises: Promise<void>[] = [];

  phases.forEach(phase => {
    promises.push(audioService.preloadSoundWithAllVariants(SoundCategory.PHASE_ENTER, phase));
    promises.push(audioService.preloadSoundWithAllVariants(SoundCategory.PHASE_EXIT, phase));
  });

  await Promise.all(promises);
}

/**
 * Preload all strategy card sounds with variants
 */
export async function preloadStrategyCards(): Promise<void> {
  const cards = Object.values(StrategyCardType);
  const promises = cards.map(card =>
    audioService.preloadSoundWithAllVariants(SoundCategory.STRATEGY_CARD, card)
  );
  await Promise.all(promises);
}

/**
 * Preload all event sounds
 */
export async function preloadEventSounds(): Promise<void> {
  const events = Object.values(EventType);
  const promises = events.map(event =>
    audioService.preloadSoundWithAllVariants(SoundCategory.EVENT, event)
  );
  await Promise.all(promises);
}

/**
 * Preload all prompt sounds
 */
export async function preloadPromptSounds(): Promise<void> {
  const prompts = Object.values(PromptType);
  const promises = prompts.map(prompt =>
    audioService.preloadSoundWithAllVariants(SoundCategory.PROMPT, prompt)
  );
  await Promise.all(promises);
}

/**
 * Preload common game sounds (phases, events, prompts)
 */
export async function preloadCommonSounds(): Promise<void> {
  await Promise.all([
    preloadPhaseSounds(),
    preloadEventSounds(),
    preloadPromptSounds(),
  ]);
}
