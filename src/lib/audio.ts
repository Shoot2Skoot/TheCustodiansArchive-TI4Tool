/**
 * Audio Service for TI4 Game Assistant
 *
 * Manages loading, playing, and queueing of voice-over sound effects.
 * Supports sound chaining for compound messages like "The Arborec, choose your strategy"
 */

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

export interface SoundConfig {
  category: SoundCategory;
  id: string;
  path: string;
  variants?: number; // Number of variant sounds (e.g., multiple versions of the same card)
}

export interface ChainedSound {
  category: SoundCategory;
  id: string;
  variant?: number;
}

// ============================================================================
// Audio Service Class
// ============================================================================

class AudioService {
  private audioContext: AudioContext | null = null;
  private loadedSounds: Map<string, AudioBuffer> = new Map();
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
   * Get the full path for a sound file
   */
  private getSoundPath(category: SoundCategory, id: string, variant?: number): string {
    const variantSuffix = variant !== undefined ? `_${variant}` : '';
    return `${this.basePath}/${category}/${id}${variantSuffix}.mp3`;
  }

  /**
   * Generate a cache key for a sound
   */
  private getCacheKey(category: SoundCategory, id: string, variant?: number): string {
    const variantSuffix = variant !== undefined ? `_${variant}` : '';
    return `${category}:${id}${variantSuffix}`;
  }

  /**
   * Preload a single sound file
   */
  async preloadSound(category: SoundCategory, id: string, variant?: number): Promise<void> {
    const cacheKey = this.getCacheKey(category, id, variant);

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

      // We'll use HTML5 Audio for playback, so just mark as loaded
      this.loadedSounds.set(cacheKey, arrayBuffer as any);

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
  async preloadSoundVariants(category: SoundCategory, id: string, variantCount: number): Promise<void> {
    const promises = Array.from({ length: variantCount }, (_, i) =>
      this.preloadSound(category, id, i + 1)
    );

    await Promise.all(promises);
  }

  /**
   * Unload a single sound from memory
   */
  unloadSound(category: SoundCategory, id: string, variant?: number): void {
    const cacheKey = this.getCacheKey(category, id, variant);
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
    const cacheKey = this.getCacheKey(category, id, variant);
    const path = this.getSoundPath(category, id, variant);

    // Check if sound is preloaded
    const isPreloaded = this.loadedSounds.has(cacheKey);
    if (!isPreloaded) {
      console.warn(`Sound not preloaded: ${cacheKey}. Loading on demand...`);
    }

    return new Promise((resolve, reject) => {
      const audio = new Audio(path);

      audio.addEventListener('ended', () => {
        this.currentAudio = null;
        resolve();
      });

      audio.addEventListener('error', (e) => {
        console.error(`Error playing sound ${cacheKey}:`, e);
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
   * Play a sound (queued if another sound is playing)
   */
  async playSound(category: SoundCategory, id: string, variant?: number): Promise<void> {
    // Check queue size to prevent spam
    if (this.playQueue.length >= this.maxQueueSize) {
      console.warn('Audio queue is full. Skipping sound:', id);
      return;
    }

    // Add to queue
    this.playQueue.push(() => this.playSoundInternal(category, id, variant));

    // Start processing if not already processing
    this.processQueue();
  }

  /**
   * Play a random variant of a sound
   */
  async playRandomVariant(category: SoundCategory, id: string, variantCount: number): Promise<void> {
    const variant = Math.floor(Math.random() * variantCount) + 1;
    return this.playSound(category, id, variant);
  }

  /**
   * Play multiple sounds in sequence (chained)
   */
  async playChainedSounds(sounds: ChainedSound[]): Promise<void> {
    // Check queue size
    if (this.playQueue.length >= this.maxQueueSize) {
      console.warn('Audio queue is full. Skipping chained sounds');
      return;
    }

    // Add all sounds as a single queue item
    this.playQueue.push(async () => {
      for (const sound of sounds) {
        await this.playSoundInternal(sound.category, sound.id, sound.variant);

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
    const cacheKey = this.getCacheKey(category, id, variant);
    return this.loadedSounds.has(cacheKey);
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
 * Play a strategy card sound (random variant)
 */
export async function playStrategyCard(cardType: StrategyCardType, variantCount: number = 1): Promise<void> {
  if (variantCount > 1) {
    return audioService.playRandomVariant(SoundCategory.STRATEGY_CARD, cardType, variantCount);
  }
  return audioService.playSound(SoundCategory.STRATEGY_CARD, cardType);
}

/**
 * Play an event sound
 */
export async function playEvent(eventType: EventType): Promise<void> {
  return audioService.playSound(SoundCategory.EVENT, eventType);
}

/**
 * Play faction name + prompt in sequence
 * Example: "The Arborec, choose your strategy"
 */
export async function playFactionPrompt(
  factionId: string,
  promptId: string,
  factionFirst: boolean = true
): Promise<void> {
  const sounds: ChainedSound[] = factionFirst
    ? [
        { category: SoundCategory.FACTION, id: factionId },
        { category: SoundCategory.PROMPT, id: promptId },
      ]
    : [
        { category: SoundCategory.PROMPT, id: promptId },
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
 * Preload all phase sounds
 */
export async function preloadPhaseSounds(): Promise<void> {
  const phases = Object.values(PhaseType);
  const sounds: Array<{ category: SoundCategory; id: string }> = [];

  phases.forEach(phase => {
    sounds.push(
      { category: SoundCategory.PHASE_ENTER, id: phase },
      { category: SoundCategory.PHASE_EXIT, id: phase }
    );
  });

  return audioService.preloadSounds(sounds);
}

/**
 * Preload all strategy card sounds with variants
 */
export async function preloadStrategyCards(variantsPerCard: number = 3): Promise<void> {
  const cards = Object.values(StrategyCardType);
  const promises = cards.map(card =>
    audioService.preloadSoundVariants(SoundCategory.STRATEGY_CARD, card, variantsPerCard)
  );
  return Promise.all(promises).then(() => {});
}

/**
 * Preload all event sounds
 */
export async function preloadEventSounds(): Promise<void> {
  const events = Object.values(EventType);
  const sounds = events.map(event => ({
    category: SoundCategory.EVENT,
    id: event,
  }));
  return audioService.preloadSounds(sounds);
}

/**
 * Preload common game sounds (phases, events, prompts)
 */
export async function preloadCommonSounds(): Promise<void> {
  await Promise.all([
    preloadPhaseSounds(),
    preloadEventSounds(),
  ]);
}
