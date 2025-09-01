import { Injectable, signal, computed, effect } from '@angular/core';
import { Observable, Subject, BehaviorSubject, merge, from, throwError } from 'rxjs';
import { map, catchError, switchMap, tap, finalize } from 'rxjs/operators';
import { TTSConfig, VoiceConfig, TTSProvider } from '../interfaces/tts-config.interface';

/**
 * Main Text-to-Speech Service
 * Supports Web Speech API, Google Cloud TTS, and Amazon Polly
 */
@Injectable({
  providedIn: 'root'
})
export class TTSService {
  private readonly _isInitialized = signal(false);
  private readonly _isSupported = signal(false);
  private readonly _isSpeaking = signal(false);
  private readonly _config = signal<TTSConfig | null>(null);
  private readonly _availableVoices = signal<SpeechSynthesisVoice[]>([]);
  private readonly _currentProvider = signal<TTSProvider>('webSpeech');
  
  // Computed signals
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isSupported = this._isSupported.asReadonly();
  readonly isSpeaking = this._isSpeaking.asReadonly();
  readonly config = this._config.asReadonly();
  readonly availableVoices = this._availableVoices.asReadonly();
  readonly currentProvider = this._currentProvider.asReadonly();
  
  // Event subjects
  private readonly speechStart$ = new Subject<TTSSpeechEvent>();
  private readonly speechEnd$ = new Subject<TTSSpeechEvent>();
  private readonly speechError$ = new Subject<TTSErrorEvent>();
  private readonly speechPause$ = new Subject<TTSSpeechEvent>();
  private readonly speechResume$ = new Subject<TTSSpeechEvent>();
  private readonly speechBoundary$ = new Subject<TTSBoundaryEvent>();
  
  // Public observables
  readonly onSpeechStart$ = this.speechStart$.asObservable();
  readonly onSpeechEnd$ = this.speechEnd$.asObservable();
  readonly onSpeechError$ = this.speechError$.asObservable();
  readonly onSpeechPause$ = this.speechPause$.asObservable();
  readonly onSpeechResume$ = this.speechResume$.asObservable();
  readonly onSpeechBoundary$ = this.speechBoundary$.asObservable();
  
  // Provider-specific services
  private webSpeechService?: WebSpeechTTSService;
  private googleCloudService?: GoogleCloudTTSService;
  private amazonPollyService?: AmazonPollyTTSService;
  
  // Current utterance
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private currentAudioContext: AudioContext | null = null;
  
  constructor() {
    this.initializeWebSpeech();
    this.setupVoiceChangeListener();
  }
  
  /**
   * Initialize the TTS service with configuration
   */
  async initialize(config: TTSConfig): Promise<void> {
    try {
      this._config.set(config);
      this._currentProvider.set(config.provider);
      
      // Initialize the selected provider
      await this.initializeProvider(config.provider);
      
      this._isInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize TTS service:', error);
      throw error;
    }
  }
  
  /**
   * Speak text with optional SSML support
   */
  async speak(text: string, options?: Partial<VoiceConfig>): Promise<TTSSpeechResult> {
    if (!this._isInitialized()) {
      throw new Error('TTS service not initialized');
    }
    
    if (!this._isSupported()) {
      throw new Error('TTS not supported in this browser');
    }
    
    const config = this._config();
    if (!config) {
      throw new Error('No configuration provided');
    }
    
    const voiceConfig = { ...config.voice, ...options };
    
    try {
      this._isSpeaking.set(true);
      
      let result: TTSSpeechResult;
      
      switch (this._currentProvider()) {
        case 'webSpeech':
          result = await this.speakWithWebSpeech(text, voiceConfig);
          break;
        case 'googleCloud':
          result = await this.speakWithGoogleCloud(text, voiceConfig);
          break;
        case 'amazonPolly':
          result = await this.speakWithAmazonPolly(text, voiceConfig);
          break;
        default:
          throw new Error(`Unsupported TTS provider: ${this._currentProvider()}`);
      }
      
      return result;
    } catch (error) {
      this._isSpeaking.set(false);
      this.speechError$.next({
        type: 'error',
        error: error as Error,
        timestamp: Date.now()
      });
      throw error;
    }
  }
  
  /**
   * Stop current speech
   */
  stop(): void {
    if (this.currentUtterance && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    
    if (this.currentAudioContext) {
      this.currentAudioContext.close();
      this.currentAudioContext = null;
    }
    
    this._isSpeaking.set(false);
  }
  
  /**
   * Pause current speech
   */
  pause(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.pause();
      this.speechPause$.next({
        type: 'pause',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Resume paused speech
   */
  resume(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.resume();
      this.speechResume$.next({
        type: 'resume',
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Get available voices for current provider
   */
  getAvailableVoices(): SpeechSynthesisVoice[] {
    return this._availableVoices();
  }
  
  /**
   * Find best voice match for language
   */
  findBestVoice(language: string, gender?: string): SpeechSynthesisVoice | null {
    const voices = this._availableVoices();
    
    // Exact language and gender match
    let match = voices.find(voice => 
      voice.lang === language && 
      (gender ? voice.name.toLowerCase().includes(gender.toLowerCase()) : true)
    );
    
    // Fallback to language match only
    if (!match) {
      match = voices.find(voice => voice.lang.startsWith(language.substring(0, 2)));
    }
    
    // Fallback to default voice
    if (!match && voices.length > 0) {
      match = voices.find(voice => voice.default) || voices[0];
    }
    
    return match || null;
  }
  
  /**
   * Switch TTS provider
   */
  async switchProvider(provider: TTSProvider): Promise<void> {
    if (this._isSpeaking()) {
      this.stop();
    }
    
    this._currentProvider.set(provider);
    await this.initializeProvider(provider);
  }
  
  // Private methods
  
  private async initializeProvider(provider: TTSProvider): Promise<void> {
    switch (provider) {
      case 'webSpeech':
        this.webSpeechService = new WebSpeechTTSService();
        await this.webSpeechService.initialize();
        break;
      case 'googleCloud':
        this.googleCloudService = new GoogleCloudTTSService();
        await this.googleCloudService.initialize();
        break;
      case 'amazonPolly':
        this.amazonPollyService = new AmazonPollyTTSService();
        await this.amazonPollyService.initialize();
        break;
      default:
        throw new Error(`Unsupported provider: ${provider}`);
    }
  }
  
  private initializeWebSpeech(): void {
    if ('speechSynthesis' in window) {
      this._isSupported.set(true);
      this.loadVoices();
    } else {
      this._isSupported.set(false);
    }
  }
  
  private loadVoices(): void {
    if (!window.speechSynthesis) return;
    
    const voices = window.speechSynthesis.getVoices();
    this._availableVoices.set(voices);
  }
  
  private setupVoiceChangeListener(): void {
    if (!window.speechSynthesis) return;
    
    window.speechSynthesis.onvoiceschanged = () => {
      this.loadVoices();
    };
  }
  
  private async speakWithWebSpeech(text: string, config: VoiceConfig): Promise<TTSSpeechResult> {
    return new Promise((resolve, reject) => {
      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure utterance
      if (config.rate) utterance.rate = config.rate;
      if (config.pitch) utterance.pitch = config.pitch;
      if (config.volume) utterance.volume = config.volume;
      
      // Find and set voice
      const voice = this.findBestVoice(config.language, config.gender);
      if (voice) {
        utterance.voice = voice;
        utterance.lang = voice.lang;
      } else {
        utterance.lang = config.language;
      }
      
      // Set up event handlers
      utterance.onstart = () => {
        this.speechStart$.next({
          type: 'start',
          text,
          timestamp: Date.now()
        });
      };
      
      utterance.onend = () => {
        this._isSpeaking.set(false);
        this.currentUtterance = null;
        
        this.speechEnd$.next({
          type: 'end',
          text,
          timestamp: Date.now()
        });
        
        resolve({
          success: true,
          duration: 0, // Web Speech API doesn't provide duration
          audioBuffer: null,
          visemeData: null
        });
      };
      
      utterance.onerror = (event) => {
        this._isSpeaking.set(false);
        this.currentUtterance = null;
        
        const error = new Error(`Speech synthesis error: ${event.error}`);
        this.speechError$.next({
          type: 'error',
          error,
          timestamp: Date.now()
        });
        
        reject(error);
      };
      
      utterance.onboundary = (event) => {
        this.speechBoundary$.next({
          type: 'boundary',
          name: event.name,
          charIndex: event.charIndex,
          charLength: event.charLength || 0,
          elapsedTime: event.elapsedTime,
          timestamp: Date.now()
        });
      };
      
      // Store current utterance
      this.currentUtterance = utterance;
      
      // Start speaking
      window.speechSynthesis.speak(utterance);
    });
  }
  
  private async speakWithGoogleCloud(text: string, config: VoiceConfig): Promise<TTSSpeechResult> {
    if (!this.googleCloudService) {
      throw new Error('Google Cloud TTS service not initialized');
    }
    
    return this.googleCloudService.synthesize(text, config);
  }
  
  private async speakWithAmazonPolly(text: string, config: VoiceConfig): Promise<TTSSpeechResult> {
    if (!this.amazonPollyService) {
      throw new Error('Amazon Polly TTS service not initialized');
    }
    
    return this.amazonPollyService.synthesize(text, config);
  }
}

/**
 * Web Speech API TTS Service
 */
class WebSpeechTTSService {
  async initialize(): Promise<void> {
    // Web Speech API is initialized by the browser
  }
}

/**
 * Google Cloud TTS Service
 */
class GoogleCloudTTSService {
  async initialize(): Promise<void> {
    // Initialize Google Cloud TTS SDK
    console.log('Initializing Google Cloud TTS service');
  }
  
  async synthesize(text: string, config: VoiceConfig): Promise<TTSSpeechResult> {
    // Implement Google Cloud TTS synthesis
    // This would require the Google Cloud TTS API key and endpoint
    throw new Error('Google Cloud TTS not implemented - requires API credentials');
  }
}

/**
 * Amazon Polly TTS Service
 */
class AmazonPollyTTSService {
  async initialize(): Promise<void> {
    // Initialize Amazon Polly SDK
    console.log('Initializing Amazon Polly TTS service');
  }
  
  async synthesize(text: string, config: VoiceConfig): Promise<TTSSpeechResult> {
    // Implement Amazon Polly synthesis
    // This would require AWS credentials and SDK
    throw new Error('Amazon Polly TTS not implemented - requires AWS credentials');
  }
}

// Event interfaces
interface TTSSpeechEvent {
  type: 'start' | 'end' | 'pause' | 'resume';
  text?: string;
  timestamp: number;
}

interface TTSErrorEvent {
  type: 'error';
  error: Error;
  timestamp: number;
}

interface TTSBoundaryEvent {
  type: 'boundary';
  name: string;
  charIndex: number;
  charLength: number;
  elapsedTime: number;
  timestamp: number;
}

interface TTSSpeechResult {
  success: boolean;
  duration: number;
  audioBuffer: AudioBuffer | null;
  visemeData: any[] | null;
}