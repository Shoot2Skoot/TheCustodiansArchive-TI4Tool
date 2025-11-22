/**
 * Voice Settings Service
 *
 * Manages voice selection for the audio system
 */

export type VoiceOption = 'cornelius' | 'random' | string;

export interface VoiceSettings {
  selectedVoice: VoiceOption;
  availableVoices: string[];
  audioEnabled: boolean;
  volume: number; // 0.0 to 1.0
}

const STORAGE_KEY = 'ti4_voice_settings';

class VoiceSettingsService {
  private settings: VoiceSettings = {
    selectedVoice: 'cornelius',
    availableVoices: ['cornelius'],
    audioEnabled: true,
    volume: 1.0,
  };
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.loadSettings();
  }

  /**
   * Load settings from localStorage
   */
  private loadSettings() {
    if (typeof window === 'undefined') return;

    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.settings = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load voice settings:', error);
    }
  }

  /**
   * Save settings to localStorage
   */
  private saveSettings() {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
      this.notifyListeners();
    } catch (error) {
      console.warn('Failed to save voice settings:', error);
    }
  }

  /**
   * Notify all listeners of settings change
   */
  private notifyListeners() {
    this.listeners.forEach(listener => listener());
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get current voice (resolves 'random' to an actual voice)
   */
  getCurrentVoice(): string {
    if (this.settings.selectedVoice === 'random') {
      // Pick a random voice from available voices
      const voices = this.settings.availableVoices.filter(v => v !== 'random');
      return voices[Math.floor(Math.random() * voices.length)] || 'cornelius';
    }
    return this.settings.selectedVoice;
  }

  /**
   * Get selected voice option (may be 'random')
   */
  getSelectedVoice(): VoiceOption {
    return this.settings.selectedVoice;
  }

  /**
   * Set the selected voice
   */
  setVoice(voice: VoiceOption) {
    this.settings.selectedVoice = voice;
    this.saveSettings();
  }

  /**
   * Get list of available voices
   */
  getAvailableVoices(): string[] {
    return this.settings.availableVoices;
  }

  /**
   * Add a new voice to available voices
   */
  addVoice(voice: string) {
    if (!this.settings.availableVoices.includes(voice)) {
      this.settings.availableVoices.push(voice);
      this.saveSettings();
    }
  }

  /**
   * Remove a voice from available voices
   */
  removeVoice(voice: string) {
    this.settings.availableVoices = this.settings.availableVoices.filter(v => v !== voice);

    // If the removed voice was selected, switch to first available or cornelius
    if (this.settings.selectedVoice === voice) {
      this.settings.selectedVoice = this.settings.availableVoices[0] || 'cornelius';
    }

    this.saveSettings();
  }

  /**
   * Set the list of available voices
   */
  setAvailableVoices(voices: string[]) {
    this.settings.availableVoices = voices;

    // Ensure selected voice is still valid
    if (!voices.includes(this.settings.selectedVoice) && this.settings.selectedVoice !== 'random') {
      this.settings.selectedVoice = voices[0] || 'cornelius';
    }

    this.saveSettings();
  }

  /**
   * Check if audio is enabled
   */
  isAudioEnabled(): boolean {
    return this.settings.audioEnabled;
  }

  /**
   * Enable or disable audio
   */
  setAudioEnabled(enabled: boolean) {
    this.settings.audioEnabled = enabled;
    this.saveSettings();
  }

  /**
   * Toggle audio enabled/disabled
   */
  toggleAudio(): boolean {
    this.settings.audioEnabled = !this.settings.audioEnabled;
    this.saveSettings();
    return this.settings.audioEnabled;
  }

  /**
   * Get current volume (0.0 to 1.0)
   */
  getVolume(): number {
    return this.settings.volume;
  }

  /**
   * Set volume (0.0 to 1.0)
   */
  setVolume(volume: number) {
    this.settings.volume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }

  /**
   * Get all settings
   */
  getSettings(): VoiceSettings {
    return { ...this.settings };
  }
}

// Singleton instance
export const voiceSettings = new VoiceSettingsService();
