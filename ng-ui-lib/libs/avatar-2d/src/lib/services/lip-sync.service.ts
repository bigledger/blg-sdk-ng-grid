import { Injectable, signal } from '@angular/core';
import { 
  LipSyncData, 
  PhonemeData, 
  VisemeShape, 
  FacialExpression,
  MouthState 
} from '../interfaces/avatar.interfaces';

/**
 * Service for lip sync functionality with phoneme-to-viseme mapping
 */
@Injectable({
  providedIn: 'root'
})
export class LipSyncService {
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private dataArray: Uint8Array | null = null;
  private animationFrame: number | null = null;
  private startTime = 0;

  private readonly _isPlaying = signal(false);
  private readonly _currentPhoneme = signal<PhonemeData | null>(null);
  private readonly _currentAmplitude = signal(0);

  readonly isPlaying = this._isPlaying.asReadonly();
  readonly currentPhoneme = this._currentPhoneme.asReadonly();
  readonly currentAmplitude = this._currentAmplitude.asReadonly();

  // Phoneme to viseme mapping based on international standards
  private readonly phonemeToVisemeMap: Map<string, VisemeShape> = new Map([
    // Vowels
    ['A', 'A'], ['AE', 'A'], ['AH', 'A'], ['AO', 'O'], ['AW', 'O'],
    ['AY', 'A'], ['E', 'E'], ['EH', 'E'], ['ER', 'E'], ['EY', 'E'],
    ['I', 'I'], ['IH', 'I'], ['IY', 'I'], ['O', 'O'], ['OW', 'O'],
    ['OY', 'O'], ['U', 'U'], ['UH', 'U'], ['UW', 'U'],
    
    // Consonants - Bilabials (lips together)
    ['B', 'B'], ['P', 'B'], ['M', 'M'],
    
    // Labiodentals (lip to teeth)
    ['F', 'F'], ['V', 'F'],
    
    // Dentals and Alveolars (tongue to teeth/alveolar ridge)
    ['TH', 'T'], ['DH', 'T'], ['T', 'T'], ['D', 'T'], ['N', 'N'],
    ['S', 'S'], ['Z', 'S'], ['L', 'L'], ['R', 'R'],
    
    // Palatals and Velars
    ['SH', 'S'], ['ZH', 'S'], ['CH', 'S'], ['JH', 'S'],
    ['K', 'K'], ['G', 'K'], ['NG', 'N'],
    
    // Glottals
    ['H', 'neutral'], ['HH', 'neutral'],
    
    // Approximants
    ['W', 'W'], ['Y', 'Y'],
    
    // Silence
    ['SIL', 'neutral'], ['SP', 'neutral'], ['', 'neutral']
  ]);

  constructor() {
    this.initializeAudioContext();
  }

  /**
   * Initialize Web Audio API context
   */
  private initializeAudioContext(): void {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 256;
      this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    } catch (error) {
      console.warn('Web Audio API not supported:', error);
    }
  }

  /**
   * Start lip sync with audio file
   */
  async startLipSync(audioElement: HTMLAudioElement, lipSyncData: LipSyncData): Promise<void> {
    if (!this.audioContext || !this.analyser) {
      throw new Error('Audio context not available');
    }

    // Connect audio element to analyser
    const source = this.audioContext.createMediaElementSource(audioElement);
    source.connect(this.analyser);
    this.analyser.connect(this.audioContext.destination);

    this.startTime = performance.now();
    this._isPlaying.set(true);

    // Start audio
    await audioElement.play();

    // Start animation loop
    this.startLipSyncAnimation(lipSyncData);
  }

  /**
   * Start lip sync animation loop
   */
  private startLipSyncAnimation(lipSyncData: LipSyncData): void {
    const animate = () => {
      if (!this._isPlaying()) return;

      const currentTime = (performance.now() - this.startTime) / 1000; // Convert to seconds
      
      // Find current phoneme
      const currentPhoneme = this.getCurrentPhoneme(lipSyncData, currentTime);
      this._currentPhoneme.set(currentPhoneme);

      // Update amplitude from audio analysis
      if (this.analyser && this.dataArray) {
        this.analyser.getByteFrequencyData(this.dataArray);
        const amplitude = this.calculateAmplitude(this.dataArray);
        this._currentAmplitude.set(amplitude);
      }

      // Check if lip sync is complete
      if (currentTime >= lipSyncData.totalDuration) {
        this.stopLipSync();
        return;
      }

      this.animationFrame = requestAnimationFrame(animate);
    };

    this.animationFrame = requestAnimationFrame(animate);
  }

  /**
   * Stop lip sync
   */
  stopLipSync(): void {
    this._isPlaying.set(false);
    this._currentPhoneme.set(null);
    this._currentAmplitude.set(0);

    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Get current phoneme based on time
   */
  private getCurrentPhoneme(lipSyncData: LipSyncData, currentTime: number): PhonemeData | null {
    return lipSyncData.phonemes.find(phoneme => 
      currentTime >= phoneme.startTime && currentTime <= phoneme.endTime
    ) || null;
  }

  /**
   * Calculate amplitude from frequency data
   */
  private calculateAmplitude(frequencyData: Uint8Array): number {
    let sum = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      sum += frequencyData[i];
    }
    return sum / (frequencyData.length * 255); // Normalize to 0-1
  }

  /**
   * Generate mouth state from phoneme and amplitude
   */
  generateMouthState(phoneme: PhonemeData | null, amplitude: number, baseExpression: FacialExpression): MouthState {
    const baseMouth = baseExpression.mouthState;
    
    if (!phoneme) {
      return {
        ...baseMouth,
        openness: amplitude * 0.3, // Subtle movement based on audio
        shape: 'neutral'
      };
    }

    const viseme = this.phonemeToVisemeMap.get(phoneme.phoneme.toUpperCase()) || 'neutral';
    const phonemeAmplitude = Math.max(phoneme.amplitude, amplitude);

    return {
      ...baseMouth,
      shape: viseme,
      openness: this.getVisemeOpenness(viseme, phonemeAmplitude),
      width: this.getVisemeWidth(viseme, phonemeAmplitude),
      corners: baseMouth.corners // Keep expression's corner position
    };
  }

  /**
   * Get mouth openness for a viseme
   */
  private getVisemeOpenness(viseme: VisemeShape, amplitude: number): number {
    const baseOpenness: Record<VisemeShape, number> = {
      'neutral': 0,
      'A': 0.8, 'E': 0.4, 'I': 0.2, 'O': 0.7, 'U': 0.3,
      'B': 0, 'C': 0.3, 'D': 0.2, 'F': 0.1, 'G': 0.3,
      'K': 0.2, 'L': 0.3, 'M': 0, 'N': 0.1, 'P': 0,
      'R': 0.4, 'S': 0.1, 'T': 0.2, 'V': 0.1, 'W': 0.4,
      'Y': 0.3, 'Z': 0.1
    };

    return (baseOpenness[viseme] || 0) * amplitude;
  }

  /**
   * Get mouth width for a viseme
   */
  private getVisemeWidth(viseme: VisemeShape, amplitude: number): number {
    const baseWidth: Record<VisemeShape, number> = {
      'neutral': 1,
      'A': 1.2, 'E': 1.1, 'I': 0.9, 'O': 0.8, 'U': 0.7,
      'B': 1, 'C': 1, 'D': 1, 'F': 1, 'G': 1,
      'K': 1, 'L': 1, 'M': 1, 'N': 1, 'P': 1,
      'R': 1, 'S': 0.9, 'T': 1, 'V': 1, 'W': 0.8,
      'Y': 1, 'Z': 0.9
    };

    return baseWidth[viseme] || 1;
  }

  /**
   * Parse phoneme data from text with timestamps
   */
  parsePhonemeData(text: string, duration: number): LipSyncData {
    // Simple word-based phoneme generation
    // In a real implementation, this would use a phoneme analysis library
    const words = text.split(' ');
    const phonemes: PhonemeData[] = [];
    const timePerWord = duration / words.length;

    words.forEach((word, index) => {
      const startTime = index * timePerWord;
      const endTime = (index + 1) * timePerWord;
      
      // Generate phonemes for the word (simplified)
      const wordPhonemes = this.wordToPhonemes(word);
      const timePerPhoneme = (endTime - startTime) / wordPhonemes.length;
      
      wordPhonemes.forEach((phoneme, phonemeIndex) => {
        phonemes.push({
          phoneme,
          startTime: startTime + (phonemeIndex * timePerPhoneme),
          endTime: startTime + ((phonemeIndex + 1) * timePerPhoneme),
          viseme: this.phonemeToVisemeMap.get(phoneme) || 'neutral',
          amplitude: 0.7 // Default amplitude
        });
      });
    });

    return {
      phonemes,
      totalDuration: duration
    };
  }

  /**
   * Simple word to phoneme conversion (basic implementation)
   */
  private wordToPhonemes(word: string): string[] {
    // This is a very simplified phoneme generation
    // A real implementation would use a proper phonetic dictionary
    const vowels = new Set(['A', 'E', 'I', 'O', 'U']);
    const phonemes: string[] = [];
    
    for (let i = 0; i < word.length; i++) {
      const char = word[i].toUpperCase();
      
      if (vowels.has(char)) {
        phonemes.push(char);
      } else {
        // Map consonants to basic phonemes
        switch (char) {
          case 'B': case 'P': phonemes.push('B'); break;
          case 'F': case 'V': phonemes.push('F'); break;
          case 'T': case 'D': phonemes.push('T'); break;
          case 'K': case 'G': phonemes.push('K'); break;
          case 'S': case 'Z': phonemes.push('S'); break;
          case 'M': phonemes.push('M'); break;
          case 'N': phonemes.push('N'); break;
          case 'L': phonemes.push('L'); break;
          case 'R': phonemes.push('R'); break;
          case 'W': phonemes.push('W'); break;
          case 'Y': phonemes.push('Y'); break;
          case 'H': phonemes.push('H'); break;
          default: phonemes.push('neutral');
        }
      }
    }
    
    return phonemes;
  }

  /**
   * Create lip sync data from audio analysis
   */
  async analyzeLipSyncFromAudio(audioBuffer: AudioBuffer): Promise<LipSyncData> {
    if (!this.audioContext) {
      throw new Error('Audio context not available');
    }

    // Basic amplitude analysis to generate phoneme-like data
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration;
    
    // Analyze in 50ms windows
    const windowSize = Math.floor(sampleRate * 0.05);
    const phonemes: PhonemeData[] = [];
    
    for (let i = 0; i < channelData.length; i += windowSize) {
      const window = channelData.slice(i, i + windowSize);
      const amplitude = this.calculateRMSAmplitude(window);
      const startTime = i / sampleRate;
      const endTime = Math.min((i + windowSize) / sampleRate, duration);
      
      if (amplitude > 0.01) { // Only add phonemes for significant audio
        // Determine viseme based on frequency analysis (simplified)
        const dominantFrequency = this.getDominantFrequency(window, sampleRate);
        const viseme = this.frequencyToViseme(dominantFrequency);
        
        phonemes.push({
          phoneme: viseme,
          startTime,
          endTime,
          viseme,
          amplitude
        });
      }
    }

    return {
      phonemes,
      totalDuration: duration
    };
  }

  /**
   * Calculate RMS amplitude of audio window
   */
  private calculateRMSAmplitude(window: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < window.length; i++) {
      sum += window[i] * window[i];
    }
    return Math.sqrt(sum / window.length);
  }

  /**
   * Get dominant frequency from audio window (simplified)
   */
  private getDominantFrequency(window: Float32Array, sampleRate: number): number {
    // This is a simplified implementation
    // A proper implementation would use FFT
    return 500; // Default frequency
  }

  /**
   * Map frequency to viseme (simplified)
   */
  private frequencyToViseme(frequency: number): VisemeShape {
    // Basic frequency-to-viseme mapping
    if (frequency < 300) return 'U';
    if (frequency < 600) return 'O';
    if (frequency < 1000) return 'A';
    if (frequency < 1500) return 'E';
    return 'I';
  }

  /**
   * Get phoneme to viseme mapping
   */
  getPhonemeMapping(): Map<string, VisemeShape> {
    return new Map(this.phonemeToVisemeMap);
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    this.stopLipSync();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
    
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
  }
}