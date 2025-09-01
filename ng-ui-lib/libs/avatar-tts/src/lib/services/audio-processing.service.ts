import { Injectable, signal, computed } from '@angular/core';
import { Observable, Subject, BehaviorSubject, fromEvent } from 'rxjs';
import { map, filter, throttleTime } from 'rxjs/operators';
import {
  AudioAnalysisData,
  AudioBufferConfig,
  FFTConfig,
  AudioFeatures,
  PhonemeAnalysisResult,
  RealTimeAudioConfig,
  VADResult,
  WindowFunction,
  PhonemeDetectionConfig
} from '../interfaces/audio-processing.interface';

/**
 * Advanced Audio Processing Service
 * Handles real-time audio analysis, FFT, phoneme detection, and feature extraction
 */
@Injectable({
  providedIn: 'root'
})
export class AudioProcessingService {
  private readonly _isInitialized = signal(false);
  private readonly _isProcessing = signal(false);
  private readonly _isRecording = signal(false);
  private readonly _sampleRate = signal(44100);
  private readonly _bufferSize = signal(2048);
  
  // Computed signals
  readonly isInitialized = this._isInitialized.asReadonly();
  readonly isProcessing = this._isProcessing.asReadonly();
  readonly isRecording = this._isRecording.asReadonly();
  readonly sampleRate = this._sampleRate.asReadonly();
  readonly bufferSize = this._bufferSize.asReadonly();
  
  // Audio context and nodes
  private audioContext: AudioContext | null = null;
  private analyserNode: AnalyserNode | null = null;
  private scriptProcessorNode: ScriptProcessorNode | null = null;
  private mediaStreamSource: MediaStreamAudioSourceNode | null = null;
  private mediaStream: MediaStream | null = null;
  
  // FFT and analysis
  private fftSize = 2048;
  private frequencyData: Float32Array = new Float32Array();
  private timeData: Float32Array = new Float32Array();
  private windowFunction: Float32Array = new Float32Array();
  
  // Event subjects
  private readonly audioData$ = new Subject<AudioAnalysisData>();
  private readonly phonemeDetected$ = new Subject<PhonemeAnalysisResult>();
  private readonly voiceActivity$ = new Subject<VADResult>();
  private readonly audioFeatures$ = new Subject<AudioFeatures>();
  
  // Public observables
  readonly onAudioData$ = this.audioData$.asObservable();
  readonly onPhonemeDetected$ = this.phonemeDetected$.asObservable();
  readonly onVoiceActivity$ = this.voiceActivity$.asObservable();
  readonly onAudioFeatures$ = this.audioFeatures$.asObservable();
  
  // Configuration
  private config: RealTimeAudioConfig = {
    frameSize: 2048,
    hopSize: 1024,
    latencyTarget: 20,
    qualityMode: 'balanced'
  };
  
  private phonemeConfig: PhonemeDetectionConfig = {
    method: 'hybrid',
    confidenceThreshold: 0.7,
    maxDuration: 300,
    minDuration: 50
  };
  
  // Processing buffers
  private inputBuffer: Float32Array = new Float32Array();
  private outputBuffer: Float32Array = new Float32Array();
  private featureBuffer: number[][] = [];
  
  // Phoneme detection
  private phonemeDetector: PhonemeDetector | null = null;
  private voiceActivityDetector: VoiceActivityDetector | null = null;
  
  constructor() {
    this.initializeAudioContext();
  }
  
  /**
   * Initialize audio processing with configuration
   */
  async initialize(config?: Partial<RealTimeAudioConfig>): Promise<void> {
    try {
      if (config) {
        this.config = { ...this.config, ...config };
      }
      
      await this.setupAudioContext();
      this.setupAnalysis();
      this.initializeDetectors();
      
      this._isInitialized.set(true);
    } catch (error) {
      console.error('Failed to initialize audio processing:', error);
      throw error;
    }
  }
  
  /**
   * Start processing audio from microphone
   */
  async startMicrophoneProcessing(): Promise<void> {
    if (!this._isInitialized()) {
      throw new Error('Audio processing not initialized');
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: this._sampleRate(),
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.mediaStream = stream;
      this.connectMicrophoneStream(stream);
      this._isRecording.set(true);
      this._isProcessing.set(true);
    } catch (error) {
      console.error('Failed to start microphone processing:', error);
      throw error;
    }
  }
  
  /**
   * Process audio buffer directly
   */
  async processAudioBuffer(audioBuffer: AudioBuffer): Promise<AudioAnalysisData> {
    if (!this._isInitialized()) {
      throw new Error('Audio processing not initialized');
    }
    
    const channelData = audioBuffer.getChannelData(0);
    return this.analyzeAudioData(channelData);
  }
  
  /**
   * Process audio data from TTS
   */
  async processTTSAudio(audioData: Float32Array): Promise<PhonemeAnalysisResult[]> {
    if (!this.phonemeDetector) {
      throw new Error('Phoneme detector not initialized');
    }
    
    const phonemes: PhonemeAnalysisResult[] = [];
    const frameSize = this.config.frameSize;
    const hopSize = this.config.hopSize;
    
    for (let i = 0; i < audioData.length - frameSize; i += hopSize) {
      const frame = audioData.slice(i, i + frameSize);
      const analysisData = this.analyzeAudioData(frame);
      const phoneme = await this.phonemeDetector.detectPhoneme(analysisData, i / this._sampleRate() * 1000);
      
      if (phoneme) {
        phonemes.push(phoneme);
      }
    }
    
    return phonemes;
  }
  
  /**
   * Stop audio processing
   */
  stop(): void {
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }
    
    if (this.mediaStreamSource) {
      this.mediaStreamSource.disconnect();
      this.mediaStreamSource = null;
    }
    
    if (this.scriptProcessorNode) {
      this.scriptProcessorNode.disconnect();
      this.scriptProcessorNode = null;
    }
    
    this._isRecording.set(false);
    this._isProcessing.set(false);
  }
  
  /**
   * Get current audio features
   */
  getCurrentAudioFeatures(): AudioFeatures | null {
    if (!this.frequencyData || !this.timeData) {
      return null;
    }
    
    return this.extractAudioFeatures(this.frequencyData, this.timeData);
  }
  
  /**
   * Configure FFT parameters
   */
  setFFTConfig(config: Partial<FFTConfig>): void {
    if (config.size && this.analyserNode) {
      this.fftSize = config.size;
      this.analyserNode.fftSize = config.size;
      this.setupAnalysisBuffers();
    }
    
    if (config.windowFunction) {
      this.generateWindowFunction(config.windowFunction);
    }
  }
  
  // Private methods
  
  private async initializeAudioContext(): Promise<void> {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.audioContext = new AudioContextClass({
        sampleRate: this._sampleRate(),
        latencyHint: 'interactive'
      });
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Failed to create AudioContext:', error);
      throw error;
    }
  }
  
  private async setupAudioContext(): Promise<void> {
    if (!this.audioContext) {
      await this.initializeAudioContext();
    }
    
    if (!this.audioContext) {
      throw new Error('Failed to create AudioContext');
    }
    
    // Create analyser node
    this.analyserNode = this.audioContext.createAnalyser();
    this.analyserNode.fftSize = this.fftSize;
    this.analyserNode.smoothingTimeConstant = 0.8;
    
    // Create script processor node
    this.scriptProcessorNode = this.audioContext.createScriptProcessor(this._bufferSize(), 1, 1);
    this.scriptProcessorNode.onaudioprocess = (event) => {
      this.processAudioFrame(event);
    };
    
    // Connect nodes
    this.analyserNode.connect(this.scriptProcessorNode);
    this.scriptProcessorNode.connect(this.audioContext.destination);
  }
  
  private setupAnalysis(): void {
    this.setupAnalysisBuffers();
    this.generateWindowFunction('hanning');
  }
  
  private setupAnalysisBuffers(): void {
    const frequencyBinCount = this.fftSize / 2;
    this.frequencyData = new Float32Array(frequencyBinCount);
    this.timeData = new Float32Array(this.fftSize);
    this.inputBuffer = new Float32Array(this.fftSize);
    this.outputBuffer = new Float32Array(this.fftSize);
  }
  
  private generateWindowFunction(type: WindowFunction): void {
    this.windowFunction = new Float32Array(this.fftSize);
    
    for (let i = 0; i < this.fftSize; i++) {
      switch (type) {
        case 'hanning':
          this.windowFunction[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (this.fftSize - 1)));
          break;
        case 'hamming':
          this.windowFunction[i] = 0.54 - 0.46 * Math.cos(2 * Math.PI * i / (this.fftSize - 1));
          break;
        case 'blackman':
          this.windowFunction[i] = 0.42 - 0.5 * Math.cos(2 * Math.PI * i / (this.fftSize - 1)) + 
                                  0.08 * Math.cos(4 * Math.PI * i / (this.fftSize - 1));
          break;
        case 'rectangular':
          this.windowFunction[i] = 1.0;
          break;
        case 'kaiser':
          // Simplified Kaiser window (beta = 6)
          const beta = 6;
          const arg = beta * Math.sqrt(1 - Math.pow(2 * i / (this.fftSize - 1) - 1, 2));
          this.windowFunction[i] = this.modifiedBesselI0(arg) / this.modifiedBesselI0(beta);
          break;
      }
    }
  }
  
  private modifiedBesselI0(x: number): number {
    let result = 1.0;
    let term = 1.0;
    let k = 1;
    
    while (Math.abs(term) > 1e-8) {
      term = term * (x * x) / (4 * k * k);
      result += term;
      k++;
    }
    
    return result;
  }
  
  private initializeDetectors(): void {
    this.phonemeDetector = new PhonemeDetector(this.phonemeConfig);
    this.voiceActivityDetector = new VoiceActivityDetector();
  }
  
  private connectMicrophoneStream(stream: MediaStream): void {
    if (!this.audioContext || !this.analyserNode) {
      throw new Error('Audio context not initialized');
    }
    
    this.mediaStreamSource = this.audioContext.createMediaStreamSource(stream);
    this.mediaStreamSource.connect(this.analyserNode);
  }
  
  private processAudioFrame(event: AudioProcessingEvent): void {
    const inputBuffer = event.inputBuffer;
    const inputData = inputBuffer.getChannelData(0);
    
    // Copy input data to analysis buffer
    this.inputBuffer.set(inputData);
    
    // Apply window function
    for (let i = 0; i < this.fftSize; i++) {
      this.inputBuffer[i] *= this.windowFunction[i];
    }
    
    // Get frequency and time domain data
    if (this.analyserNode) {
      this.analyserNode.getFloatFrequencyData(this.frequencyData);
      this.analyserNode.getFloatTimeDomainData(this.timeData);
    }
    
    // Analyze audio data
    const analysisData = this.analyzeAudioData(inputData);
    this.audioData$.next(analysisData);
    
    // Extract features
    const features = this.extractAudioFeatures(this.frequencyData, this.timeData);
    this.audioFeatures$.next(features);
    
    // Voice activity detection
    if (this.voiceActivityDetector) {
      const vadResult = this.voiceActivityDetector.detect(analysisData);
      this.voiceActivity$.next(vadResult);
    }
    
    // Phoneme detection
    if (this.phonemeDetector && vadResult?.isVoice) {
      this.phonemeDetector.detectPhoneme(analysisData, performance.now())
        .then(phoneme => {
          if (phoneme) {
            this.phonemeDetected$.next(phoneme);
          }
        });
    }
  }
  
  private analyzeAudioData(audioData: Float32Array): AudioAnalysisData {
    const amplitude = this.calculateAmplitude(audioData);
    const energy = this.calculateEnergy(audioData);
    const zeroCrossingRate = this.calculateZeroCrossingRate(audioData);
    const spectralCentroid = this.calculateSpectralCentroid(this.frequencyData);
    const fundamentalFreq = this.estimateFundamentalFrequency(audioData);
    
    return {
      timeDomain: new Float32Array(audioData),
      frequencyDomain: new Float32Array(this.frequencyData),
      amplitude,
      energy,
      zeroCrossingRate,
      spectralCentroid,
      fundamentalFreq,
      timestamp: performance.now()
    };
  }
  
  private calculateAmplitude(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += Math.abs(data[i]);
    }
    return sum / data.length;
  }
  
  private calculateEnergy(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return sum / data.length;
  }
  
  private calculateZeroCrossingRate(data: Float32Array): number {
    let crossings = 0;
    for (let i = 1; i < data.length; i++) {
      if ((data[i] >= 0) !== (data[i - 1] >= 0)) {
        crossings++;
      }
    }
    return crossings / (data.length - 1);
  }
  
  private calculateSpectralCentroid(frequencyData: Float32Array): number {
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20); // Convert dB to linear
      const frequency = i * this._sampleRate() / (2 * frequencyData.length);
      weightedSum += frequency * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;
  }
  
  private estimateFundamentalFrequency(data: Float32Array): number {
    // Simple autocorrelation-based pitch detection
    const autocorrelation = this.autocorrelate(data);
    const minPeriod = Math.floor(this._sampleRate() / 800); // 800 Hz max
    const maxPeriod = Math.floor(this._sampleRate() / 80);  // 80 Hz min
    
    let maxValue = 0;
    let bestPeriod = 0;
    
    for (let period = minPeriod; period < maxPeriod && period < autocorrelation.length; period++) {
      if (autocorrelation[period] > maxValue) {
        maxValue = autocorrelation[period];
        bestPeriod = period;
      }
    }
    
    return bestPeriod > 0 ? this._sampleRate() / bestPeriod : 0;
  }
  
  private autocorrelate(data: Float32Array): Float32Array {
    const result = new Float32Array(data.length);
    
    for (let lag = 0; lag < data.length; lag++) {
      let sum = 0;
      for (let i = 0; i < data.length - lag; i++) {
        sum += data[i] * data[i + lag];
      }
      result[lag] = sum / (data.length - lag);
    }
    
    return result;
  }
  
  private extractAudioFeatures(frequencyData: Float32Array, timeData: Float32Array): AudioFeatures {
    return {
      spectral: {
        centroid: this.calculateSpectralCentroid(frequencyData),
        bandwidth: this.calculateSpectralBandwidth(frequencyData),
        rolloff: this.calculateSpectralRolloff(frequencyData),
        flux: this.calculateSpectralFlux(frequencyData),
        flatness: this.calculateSpectralFlatness(frequencyData)
      },
      temporal: {
        zeroCrossingRate: this.calculateZeroCrossingRate(timeData),
        energy: this.calculateEnergy(timeData),
        rms: Math.sqrt(this.calculateEnergy(timeData)),
        autocorrelation: Array.from(this.autocorrelate(timeData).slice(0, 100))
      }
    };
  }
  
  private calculateSpectralBandwidth(frequencyData: Float32Array): number {
    const centroid = this.calculateSpectralCentroid(frequencyData);
    let weightedSum = 0;
    let magnitudeSum = 0;
    
    for (let i = 0; i < frequencyData.length; i++) {
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      const frequency = i * this._sampleRate() / (2 * frequencyData.length);
      const deviation = frequency - centroid;
      weightedSum += deviation * deviation * magnitude;
      magnitudeSum += magnitude;
    }
    
    return magnitudeSum > 0 ? Math.sqrt(weightedSum / magnitudeSum) : 0;
  }
  
  private calculateSpectralRolloff(frequencyData: Float32Array, threshold: number = 0.85): number {
    const magnitudes = frequencyData.map(db => Math.pow(10, db / 20));
    const totalEnergy = magnitudes.reduce((sum, mag) => sum + mag * mag, 0);
    const thresholdEnergy = totalEnergy * threshold;
    
    let cumulativeEnergy = 0;
    for (let i = 0; i < magnitudes.length; i++) {
      cumulativeEnergy += magnitudes[i] * magnitudes[i];
      if (cumulativeEnergy >= thresholdEnergy) {
        return i * this._sampleRate() / (2 * magnitudes.length);
      }
    }
    
    return this._sampleRate() / 2;
  }
  
  private calculateSpectralFlux(frequencyData: Float32Array): number {
    if (!this.previousFrequencyData) {
      this.previousFrequencyData = new Float32Array(frequencyData);
      return 0;
    }
    
    let flux = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      const current = Math.pow(10, frequencyData[i] / 20);
      const previous = Math.pow(10, this.previousFrequencyData[i] / 20);
      const diff = current - previous;
      flux += diff > 0 ? diff : 0;
    }
    
    this.previousFrequencyData.set(frequencyData);
    return flux / frequencyData.length;
  }
  
  private previousFrequencyData: Float32Array | null = null;
  
  private calculateSpectralFlatness(frequencyData: Float32Array): number {
    let geometricMean = 0;
    let arithmeticMean = 0;
    let count = 0;
    
    for (let i = 1; i < frequencyData.length; i++) { // Skip DC component
      const magnitude = Math.pow(10, frequencyData[i] / 20);
      if (magnitude > 0) {
        geometricMean += Math.log(magnitude);
        arithmeticMean += magnitude;
        count++;
      }
    }
    
    if (count === 0) return 0;
    
    geometricMean = Math.exp(geometricMean / count);
    arithmeticMean = arithmeticMean / count;
    
    return arithmeticMean > 0 ? geometricMean / arithmeticMean : 0;
  }
}

/**
 * Phoneme Detector
 */
class PhonemeDetector {
  constructor(private config: PhonemeDetectionConfig) {}
  
  async detectPhoneme(analysisData: AudioAnalysisData, timestamp: number): Promise<PhonemeAnalysisResult | null> {
    // Simplified phoneme detection based on spectral features
    // In a real implementation, this would use more sophisticated ML models
    
    const { amplitude, spectralCentroid, fundamentalFreq } = analysisData;
    
    if (amplitude < 0.01) {
      return null; // Too quiet
    }
    
    // Simple classification based on spectral features
    let phoneme = 'uh'; // Default
    let confidence = 0.5;
    
    if (fundamentalFreq && fundamentalFreq > 0) {
      // Vowel-like sounds
      if (spectralCentroid && spectralCentroid < 1000) {
        phoneme = 'aa'; // Low frequency vowel
        confidence = 0.7;
      } else if (spectralCentroid && spectralCentroid > 2000) {
        phoneme = 'ee'; // High frequency vowel
        confidence = 0.7;
      } else {
        phoneme = 'oh'; // Mid frequency vowel
        confidence = 0.6;
      }
    } else {
      // Consonant-like sounds
      if (amplitude > 0.1) {
        phoneme = 'k'; // Strong consonant
        confidence = 0.6;
      } else {
        phoneme = 's'; // Weak consonant
        confidence = 0.5;
      }
    }
    
    if (confidence < this.config.confidenceThreshold) {
      return null;
    }
    
    return {
      phoneme,
      confidence,
      startTime: timestamp,
      duration: 100, // Default duration
      intensity: amplitude,
      formants: fundamentalFreq ? [fundamentalFreq, fundamentalFreq * 2] : undefined
    };
  }
}

/**
 * Voice Activity Detector
 */
class VoiceActivityDetector {
  private energyThreshold = 0.001;
  private zeroCrossingThreshold = 0.3;
  
  detect(analysisData: AudioAnalysisData): VADResult {
    const { energy, zeroCrossingRate, amplitude } = analysisData;
    
    const energyScore = energy > this.energyThreshold ? 1 : 0;
    const zcrScore = zeroCrossingRate < this.zeroCrossingThreshold ? 1 : 0;
    const amplitudeScore = amplitude > 0.01 ? 1 : 0;
    
    const totalScore = (energyScore + zcrScore + amplitudeScore) / 3;
    const isVoice = totalScore > 0.5;
    
    return {
      isVoice,
      confidence: totalScore,
      energy,
      timestamp: analysisData.timestamp
    };
  }
}