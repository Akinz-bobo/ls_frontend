/**
 * AudioContext Manager
 * Handles AudioContext initialization with proper user gesture handling
 */

class AudioContextManager {
  private static instance: AudioContextManager;
  private audioContext: AudioContext | null = null;
  private initialized = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  static getInstance(): AudioContextManager {
    if (!AudioContextManager.instance) {
      AudioContextManager.instance = new AudioContextManager();
    }
    return AudioContextManager.instance;
  }

  /**
   * Initialize AudioContext with user gesture
   * This should be called on user interaction (click, touch, etc.)
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private async _doInitialize(): Promise<void> {
    try {
      if (typeof window === 'undefined' || !window.AudioContext) {
        console.warn('⚠️ AudioContext not available');
        return;
      }

      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
        console.log('✅ AudioContext resumed successfully');
      }
      
      this.initialized = true;
    } catch (error) {
      // Silently fail - this is expected without user gesture
      // Don't log error to avoid console spam
    }
  }

  /**
   * Get the current AudioContext state
   */
  getState(): AudioContextState | null {
    return this.audioContext?.state || null;
  }

  /**
   * Check if AudioContext is ready
   */
  isReady(): boolean {
    return this.initialized && this.audioContext?.state === 'running';
  }
}

export const audioContextManager = AudioContextManager.getInstance();