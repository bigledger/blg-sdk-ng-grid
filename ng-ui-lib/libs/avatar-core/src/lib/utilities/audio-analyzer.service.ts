import { Injectable, signal, computed } from '@angular/core';

/**
 * Audio frequency bands for analysis
 */
interface FrequencyBand {
  name: string;
  minFreq: number;
  maxFreq: number;
  energy: number;
}

/**
 * Voice characteristics extracted from audio
 */
interface VoiceCharacteristics {
  fundamentalFrequency: number;
  pitch: number;
  formants: number[];
  spectralCentroid: number;
  spectralRolloff: number;
  zeroCrossingRate: number;
  mfccs: number[];
  energy: number;
  voicedProbability: number;
}

/**
 * Lip sync viseme data
 */
interface VisemeData {
  viseme: string;
  confidence: number;
  duration: number;
  intensity: number;
}

/**
 * Audio emotion analysis result
 */
interface EmotionAnalysis {
  emotion: string;
  confidence: number;
  arousal: number; // -1 (calm) to 1 (excited)
  valence: number; // -1 (negative) to 1 (positive)
  features: {
    pitchVariance: number;
    tempoVariance: number;
    energyLevel: number;
    spectralFeatures: number[];
  };
}

/**
 * Audio analysis service for speech processing and lip synchronization.
 * Provides advanced audio analysis capabilities for avatar animation.
 */
@Injectable({
  providedIn: 'root'
})
export class AudioAnalyzerService {
  // Configuration signals
  private _sampleRate = signal<number>(22050);
  private _windowSize = signal<number>(1024);
  private _hopSize = signal<number>(512);
  private _melFilters = signal<number>(26);
  private _mfccCoefficients = signal<number>(13);

  // Analysis state
  private _lastAnalysis = signal<Map<string, VoiceCharacteristics>>(new Map());
  private _emotionHistory = signal<Map<string, EmotionAnalysis[]>>(new Map());

  // Computed values
  readonly sampleRate = this._sampleRate.asReadonly();
  readonly windowSize = this._windowSize.asReadonly();
  readonly analysisFrameRate = computed(() => this._sampleRate() / this._hopSize());

  // Frequency bands for analysis
  private readonly frequencyBands: FrequencyBand[] = [
    { name: 'sub_bass', minFreq: 0, maxFreq: 60, energy: 0 },
    { name: 'bass', minFreq: 60, maxFreq: 250, energy: 0 },
    { name: 'low_mid', minFreq: 250, maxFreq: 500, energy: 0 },
    { name: 'mid', minFreq: 500, maxFreq: 2000, energy: 0 },
    { name: 'high_mid', minFreq: 2000, maxFreq: 4000, energy: 0 },
    { name: 'presence', minFreq: 4000, maxFreq: 6000, energy: 0 },
    { name: 'brilliance', minFreq: 6000, maxFreq: 11025, energy: 0 }
  ];

  // Viseme mapping for different phonemes
  private readonly phonemeVisemeMap: Record<string, string> = {
    'silence': 'sil',
    'p': 'p', 'b': 'p', 'm': 'p',
    'f': 'f', 'v': 'f',
    'th': 'th', 'dh': 'th',
    't': 't', 'd': 't', 'n': 't', 'l': 't', 's': 't', 'z': 't',
    'sh': 'sh', 'zh': 'sh', 'ch': 'sh', 'jh': 'sh',
    'k': 'k', 'g': 'k', 'ng': 'k',
    'r': 'r',
    'aa': 'aa', 'ao': 'aa',
    'ah': 'ah', 'ax': 'ah', 'ay': 'ah',
    'ae': 'ae',
    'eh': 'eh', 'ey': 'eh',
    'ih': 'ih', 'iy': 'ih',
    'ow': 'ow', 'oy': 'ow',
    'uh': 'uh', 'uw': 'uh',
    'er': 'er'
  };

  constructor() {}

  /**
   * Configure audio analysis parameters
   */
  configure(config: {
    sampleRate?: number;
    windowSize?: number;
    hopSize?: number;
    melFilters?: number;
    mfccCoefficients?: number;
  }): void {
    if (config.sampleRate) this._sampleRate.set(config.sampleRate);
    if (config.windowSize) this._windowSize.set(config.windowSize);
    if (config.hopSize) this._hopSize.set(config.hopSize);
    if (config.melFilters) this._melFilters.set(config.melFilters);
    if (config.mfccCoefficients) this._mfccCoefficients.set(config.mfccCoefficients);
  }

  /**
   * Analyze audio buffer for voice characteristics
   */
  analyzeVoiceCharacteristics(
    audioBuffer: AudioBuffer, 
    audioId?: string
  ): VoiceCharacteristics {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;

    // Extract features
    const fundamentalFrequency = this.extractFundamentalFrequency(channelData, sampleRate);
    const pitch = this.frequencyToPitch(fundamentalFrequency);
    const formants = this.extractFormants(channelData, sampleRate);
    const spectralCentroid = this.calculateSpectralCentroid(channelData, sampleRate);
    const spectralRolloff = this.calculateSpectralRolloff(channelData, sampleRate);
    const zeroCrossingRate = this.calculateZeroCrossingRate(channelData);
    const mfccs = this.extractMFCCs(channelData, sampleRate);
    const energy = this.calculateEnergy(channelData);
    const voicedProbability = this.calculateVoicedProbability(channelData, sampleRate);

    const characteristics: VoiceCharacteristics = {
      fundamentalFrequency,
      pitch,
      formants,
      spectralCentroid,
      spectralRolloff,
      zeroCrossingRate,
      mfccs,
      energy,
      voicedProbability
    };

    // Store analysis if ID provided
    if (audioId) {
      this._lastAnalysis.update(analyses => {
        const newAnalyses = new Map(analyses);
        newAnalyses.set(audioId, characteristics);
        return newAnalyses;
      });
    }

    return characteristics;
  }

  /**
   * Generate lip sync data from audio
   */
  generateLipSyncData(audioBuffer: AudioBuffer, granularity = 50): VisemeData[] {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const duration = audioBuffer.duration * 1000; // Convert to milliseconds
    
    const frameSize = Math.floor(sampleRate * granularity / 1000); // Samples per frame
    const visemeData: VisemeData[] = [];

    for (let i = 0; i < channelData.length; i += frameSize) {
      const frameData = channelData.slice(i, Math.min(i + frameSize, channelData.length));
      const timeMs = (i / sampleRate) * 1000;

      // Analyze frame for phoneme/viseme
      const energy = this.calculateEnergy(frameData);
      const spectralCentroid = this.calculateSpectralCentroid(frameData, sampleRate);
      const zeroCrossingRate = this.calculateZeroCrossingRate(frameData);
      
      // Simple phoneme classification based on features
      const phoneme = this.classifyPhoneme(energy, spectralCentroid, zeroCrossingRate);
      const viseme = this.phonemeVisemeMap[phoneme] || 'sil';
      const confidence = this.calculateVisemeConfidence(frameData, viseme);
      const intensity = Math.min(1, energy * 10); // Normalize intensity

      visemeData.push({
        viseme,
        confidence,
        duration: granularity,
        intensity
      });
    }

    return this.smoothVisemeTransitions(visemeData);
  }

  /**
   * Analyze audio for emotional content
   */
  analyzeEmotion(audioBuffer: AudioBuffer, audioId?: string): EmotionAnalysis {
    const characteristics = this.analyzeVoiceCharacteristics(audioBuffer);
    
    // Extract emotional features
    const pitchVariance = this.calculatePitchVariance(audioBuffer);
    const tempoVariance = this.calculateTempoVariance(audioBuffer);
    const energyLevel = characteristics.energy;
    const spectralFeatures = this.extractSpectralFeatures(audioBuffer);

    // Simple emotion classification based on features
    const { emotion, confidence } = this.classifyEmotion({
      pitchVariance,
      tempoVariance,
      energyLevel,
      spectralFeatures,
      fundamentalFrequency: characteristics.fundamentalFrequency,
      voicedProbability: characteristics.voicedProbability
    });

    // Calculate arousal and valence
    const arousal = this.calculateArousal(pitchVariance, tempoVariance, energyLevel);
    const valence = this.calculateValence(spectralFeatures, characteristics.spectralCentroid);

    const emotionAnalysis: EmotionAnalysis = {
      emotion,
      confidence,
      arousal,
      valence,
      features: {
        pitchVariance,
        tempoVariance,
        energyLevel,
        spectralFeatures
      }
    };

    // Store in history if ID provided
    if (audioId) {
      this._emotionHistory.update(history => {
        const newHistory = new Map(history);
        const audioHistory = newHistory.get(audioId) || [];
        newHistory.set(audioId, [...audioHistory, emotionAnalysis].slice(-10)); // Keep last 10
        return newHistory;
      });
    }

    return emotionAnalysis;
  }

  /**
   * Analyze frequency bands
   */
  analyzeFrequencyBands(audioBuffer: AudioBuffer): FrequencyBand[] {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    
    // Perform FFT
    const fftSize = this._windowSize();
    const fftResult = this.performFFT(channelData, fftSize);
    
    // Calculate energy for each frequency band
    const bands = this.frequencyBands.map(band => ({
      ...band,
      energy: this.calculateBandEnergy(fftResult, band, sampleRate, fftSize)
    }));

    return bands;
  }

  /**
   * Extract fundamental frequency using autocorrelation
   */
  private extractFundamentalFrequency(data: Float32Array, sampleRate: number): number {
    const minPeriod = Math.floor(sampleRate / 800); // Max 800 Hz
    const maxPeriod = Math.floor(sampleRate / 50);  // Min 50 Hz
    
    let bestPeriod = 0;
    let maxCorrelation = 0;

    for (let period = minPeriod; period <= maxPeriod; period++) {
      let correlation = 0;
      let count = 0;

      for (let i = 0; i < data.length - period; i++) {
        correlation += data[i] * data[i + period];
        count++;
      }

      correlation /= count;

      if (correlation > maxCorrelation) {
        maxCorrelation = correlation;
        bestPeriod = period;
      }
    }

    return bestPeriod > 0 ? sampleRate / bestPeriod : 0;
  }

  /**
   * Convert frequency to musical pitch
   */
  private frequencyToPitch(frequency: number): number {
    if (frequency <= 0) return 0;
    return 69 + 12 * Math.log2(frequency / 440);
  }

  /**
   * Extract formant frequencies
   */
  private extractFormants(data: Float32Array, sampleRate: number): number[] {
    // Simplified formant extraction using peak picking in spectrum
    const fftResult = this.performFFT(data, this._windowSize());
    const spectrum = fftResult.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));
    
    // Find peaks in spectrum
    const peaks = this.findSpectralPeaks(spectrum, sampleRate);
    
    // Return first 3 formants
    return peaks.slice(0, 3);
  }

  /**
   * Calculate spectral centroid
   */
  private calculateSpectralCentroid(data: Float32Array, sampleRate: number): number {
    const fftResult = this.performFFT(data, this._windowSize());
    const spectrum = fftResult.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));
    
    let numerator = 0;
    let denominator = 0;

    for (let i = 0; i < spectrum.length / 2; i++) {
      const frequency = (i * sampleRate) / spectrum.length;
      const magnitude = spectrum[i];
      
      numerator += frequency * magnitude;
      denominator += magnitude;
    }

    return denominator > 0 ? numerator / denominator : 0;
  }

  /**
   * Calculate spectral rolloff
   */
  private calculateSpectralRolloff(data: Float32Array, sampleRate: number): number {
    const fftResult = this.performFFT(data, this._windowSize());
    const spectrum = fftResult.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));
    
    const totalEnergy = spectrum.reduce((sum, mag) => sum + mag * mag, 0);
    const threshold = totalEnergy * 0.85; // 85% rolloff point

    let cumulativeEnergy = 0;
    for (let i = 0; i < spectrum.length / 2; i++) {
      cumulativeEnergy += spectrum[i] * spectrum[i];
      
      if (cumulativeEnergy >= threshold) {
        return (i * sampleRate) / spectrum.length;
      }
    }

    return sampleRate / 2; // Nyquist frequency
  }

  /**
   * Calculate zero crossing rate
   */
  private calculateZeroCrossingRate(data: Float32Array): number {
    let crossings = 0;
    
    for (let i = 1; i < data.length; i++) {
      if (Math.sign(data[i]) !== Math.sign(data[i - 1])) {
        crossings++;
      }
    }

    return crossings / (data.length - 1);
  }

  /**
   * Extract MFCCs (simplified implementation)
   */
  private extractMFCCs(data: Float32Array, sampleRate: number): number[] {
    const fftResult = this.performFFT(data, this._windowSize());
    const spectrum = fftResult.map(c => Math.sqrt(c.real * c.real + c.imag * c.imag));
    
    // Apply mel filter bank
    const melFilters = this.createMelFilterBank(spectrum.length, sampleRate, this._melFilters());
    const melEnergies = this.applyFilterBank(spectrum, melFilters);
    
    // Apply DCT to get MFCCs
    const mfccs = this.applyDCT(melEnergies.map(e => Math.log(Math.max(e, 1e-10))));
    
    return mfccs.slice(0, this._mfccCoefficients());
  }

  /**
   * Calculate energy (RMS)
   */
  private calculateEnergy(data: Float32Array): number {
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data[i] * data[i];
    }
    return Math.sqrt(sum / data.length);
  }

  /**
   * Calculate voiced probability
   */
  private calculateVoicedProbability(data: Float32Array, sampleRate: number): number {
    const f0 = this.extractFundamentalFrequency(data, sampleRate);
    const energy = this.calculateEnergy(data);
    const zcr = this.calculateZeroCrossingRate(data);
    
    // Simple heuristic for voiced/unvoiced classification
    let score = 0;
    
    if (f0 > 80 && f0 < 400) score += 0.4; // Typical speech F0 range
    if (energy > 0.01) score += 0.3;
    if (zcr < 0.1) score += 0.3;
    
    return Math.min(1, score);
  }

  /**
   * Classify phoneme based on acoustic features
   */
  private classifyPhoneme(energy: number, spectralCentroid: number, zcr: number): string {
    if (energy < 0.005) return 'silence';
    
    if (zcr < 0.05) {
      // Likely vowel
      if (spectralCentroid < 1000) return 'aa';
      if (spectralCentroid < 1500) return 'ah';
      if (spectralCentroid < 2000) return 'eh';
      return 'ih';
    } else {
      // Likely consonant
      if (spectralCentroid > 3000) return 's';
      if (spectralCentroid > 2000) return 'sh';
      if (spectralCentroid > 1000) return 't';
      return 'p';
    }
  }

  /**
   * Calculate viseme confidence
   */
  private calculateVisemeConfidence(data: Float32Array, viseme: string): number {
    // Simplified confidence calculation based on energy and consistency
    const energy = this.calculateEnergy(data);
    return Math.min(1, energy * 5); // Scale energy to confidence
  }

  /**
   * Smooth viseme transitions
   */
  private smoothVisemeTransitions(visemeData: VisemeData[]): VisemeData[] {
    // Apply simple smoothing to reduce rapid viseme changes
    const smoothed = [...visemeData];
    
    for (let i = 1; i < smoothed.length - 1; i++) {
      const prev = smoothed[i - 1];
      const curr = smoothed[i];
      const next = smoothed[i + 1];
      
      // If current viseme is different from neighbors and has low confidence
      if (curr.viseme !== prev.viseme && 
          curr.viseme !== next.viseme && 
          curr.confidence < 0.6) {
        // Use the more confident neighbor
        if (prev.confidence > next.confidence) {
          smoothed[i] = { ...prev };
        } else {
          smoothed[i] = { ...next };
        }
      }
    }
    
    return smoothed;
  }

  /**
   * Calculate pitch variance for emotion analysis
   */
  private calculatePitchVariance(audioBuffer: AudioBuffer): number {
    const channelData = audioBuffer.getChannelData(0);
    const sampleRate = audioBuffer.sampleRate;
    const frameSize = Math.floor(sampleRate * 0.025); // 25ms frames
    
    const pitches: number[] = [];
    
    for (let i = 0; i < channelData.length - frameSize; i += frameSize) {
      const frameData = channelData.slice(i, i + frameSize);
      const f0 = this.extractFundamentalFrequency(frameData, sampleRate);
      if (f0 > 0) pitches.push(f0);
    }
    
    if (pitches.length < 2) return 0;
    
    const mean = pitches.reduce((sum, p) => sum + p, 0) / pitches.length;
    const variance = pitches.reduce((sum, p) => sum + (p - mean) ** 2, 0) / pitches.length;
    
    return Math.sqrt(variance);
  }

  /**
   * Calculate tempo variance
   */
  private calculateTempoVariance(audioBuffer: AudioBuffer): number {
    // Simplified tempo analysis based on energy envelope
    const channelData = audioBuffer.getChannelData(0);
    const frameSize = Math.floor(audioBuffer.sampleRate * 0.1); // 100ms frames
    
    const energies: number[] = [];
    
    for (let i = 0; i < channelData.length - frameSize; i += frameSize) {
      const frameData = channelData.slice(i, i + frameSize);
      energies.push(this.calculateEnergy(frameData));
    }
    
    // Calculate energy differences
    const differences: number[] = [];
    for (let i = 1; i < energies.length; i++) {
      differences.push(Math.abs(energies[i] - energies[i - 1]));
    }
    
    return differences.length > 0 ? 
      differences.reduce((sum, d) => sum + d, 0) / differences.length : 0;
  }

  /**
   * Extract spectral features for emotion analysis
   */
  private extractSpectralFeatures(audioBuffer: AudioBuffer): number[] {
    const bands = this.analyzeFrequencyBands(audioBuffer);
    return bands.map(band => band.energy);
  }

  /**
   * Classify emotion from features
   */
  private classifyEmotion(features: any): { emotion: string; confidence: number } {
    // Simplified emotion classification
    const { pitchVariance, energyLevel, fundamentalFrequency } = features;
    
    let emotion = 'neutral';
    let confidence = 0.5;
    
    if (energyLevel > 0.1 && pitchVariance > 50) {
      emotion = 'excited';
      confidence = 0.8;
    } else if (energyLevel < 0.05 && fundamentalFrequency < 120) {
      emotion = 'sad';
      confidence = 0.7;
    } else if (pitchVariance > 100 && energyLevel > 0.05) {
      emotion = 'happy';
      confidence = 0.75;
    } else if (energyLevel > 0.15) {
      emotion = 'angry';
      confidence = 0.6;
    }
    
    return { emotion, confidence };
  }

  /**
   * Calculate arousal from features
   */
  private calculateArousal(pitchVariance: number, tempoVariance: number, energyLevel: number): number {
    const arousal = (pitchVariance / 200 + tempoVariance * 10 + energyLevel * 5) / 3;
    return Math.max(-1, Math.min(1, arousal * 2 - 1)); // Scale to [-1, 1]
  }

  /**
   * Calculate valence from features
   */
  private calculateValence(spectralFeatures: number[], spectralCentroid: number): number {
    // Higher spectral centroid often correlates with positive valence
    const centroidScore = spectralCentroid / 2000; // Normalize
    const energyBalance = spectralFeatures.slice(2, 4).reduce((sum, f) => sum + f, 0) / 
                          spectralFeatures.slice(0, 2).reduce((sum, f) => sum + f, 0);
    
    const valence = (centroidScore + Math.log(energyBalance)) / 2;
    return Math.max(-1, Math.min(1, valence * 2 - 1)); // Scale to [-1, 1]
  }

  /**
   * Perform FFT (simplified implementation)
   */
  private performFFT(data: Float32Array, size: number): { real: number; imag: number }[] {
    // This is a placeholder for actual FFT implementation
    // In a real implementation, you would use a proper FFT library
    const result: { real: number; imag: number }[] = [];
    
    for (let i = 0; i < size; i++) {
      result.push({ 
        real: i < data.length ? data[i] : 0, 
        imag: 0 
      });
    }
    
    return result;
  }

  /**
   * Find spectral peaks
   */
  private findSpectralPeaks(spectrum: number[], sampleRate: number): number[] {
    const peaks: number[] = [];
    
    for (let i = 1; i < spectrum.length - 1; i++) {
      if (spectrum[i] > spectrum[i - 1] && spectrum[i] > spectrum[i + 1]) {
        const frequency = (i * sampleRate) / spectrum.length;
        if (frequency > 200 && frequency < 4000) { // Formant range
          peaks.push(frequency);
        }
      }
    }
    
    return peaks.sort((a, b) => a - b);
  }

  /**
   * Create mel filter bank
   */
  private createMelFilterBank(spectrumLength: number, sampleRate: number, numFilters: number): number[][] {
    // Simplified mel filter bank creation
    const filters: number[][] = [];
    
    for (let i = 0; i < numFilters; i++) {
      const filter = new Array(spectrumLength).fill(0);
      // Triangular filters (simplified)
      const center = Math.floor((i + 1) * spectrumLength / (numFilters + 1));
      const width = Math.floor(spectrumLength / numFilters);
      
      for (let j = Math.max(0, center - width); j <= Math.min(spectrumLength - 1, center + width); j++) {
        filter[j] = 1 - Math.abs(j - center) / width;
      }
      
      filters.push(filter);
    }
    
    return filters;
  }

  /**
   * Apply filter bank to spectrum
   */
  private applyFilterBank(spectrum: number[], filters: number[][]): number[] {
    return filters.map(filter => 
      filter.reduce((sum, coeff, i) => sum + coeff * (spectrum[i] || 0), 0)
    );
  }

  /**
   * Apply DCT (Discrete Cosine Transform)
   */
  private applyDCT(data: number[]): number[] {
    const result: number[] = [];
    
    for (let k = 0; k < data.length; k++) {
      let sum = 0;
      for (let n = 0; n < data.length; n++) {
        sum += data[n] * Math.cos((Math.PI * k * (2 * n + 1)) / (2 * data.length));
      }
      result.push(sum);
    }
    
    return result;
  }

  /**
   * Calculate energy for frequency band
   */
  private calculateBandEnergy(
    fftResult: { real: number; imag: number }[], 
    band: FrequencyBand, 
    sampleRate: number, 
    fftSize: number
  ): number {
    const minBin = Math.floor(band.minFreq * fftSize / sampleRate);
    const maxBin = Math.floor(band.maxFreq * fftSize / sampleRate);
    
    let energy = 0;
    for (let i = minBin; i <= maxBin && i < fftResult.length; i++) {
      const magnitude = Math.sqrt(fftResult[i].real ** 2 + fftResult[i].imag ** 2);
      energy += magnitude ** 2;
    }
    
    return energy;
  }

  /**
   * Get last analysis for audio ID
   */
  getLastAnalysis(audioId: string): VoiceCharacteristics | null {
    return this._lastAnalysis().get(audioId) || null;
  }

  /**
   * Get emotion history for audio ID
   */
  getEmotionHistory(audioId: string): EmotionAnalysis[] {
    return this._emotionHistory().get(audioId) || [];
  }
}