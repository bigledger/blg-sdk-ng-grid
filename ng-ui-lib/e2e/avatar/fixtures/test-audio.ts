/**
 * Test audio utilities and data for avatar testing
 */

/**
 * Generate test audio data in various formats
 */
export class TestAudioGenerator {
  /**
   * Generate silence audio data
   */
  static generateSilence(durationMs: number, sampleRate = 22050): ArrayBuffer {
    const samples = Math.floor(durationMs * sampleRate / 1000);
    const buffer = new ArrayBuffer(samples * 2); // 16-bit samples
    const view = new Int16Array(buffer);
    
    // Fill with silence (zeros)
    view.fill(0);
    
    return buffer;
  }

  /**
   * Generate sine wave audio data
   */
  static generateSineWave(
    durationMs: number, 
    frequency = 440, 
    sampleRate = 22050, 
    amplitude = 0.5
  ): ArrayBuffer {
    const samples = Math.floor(durationMs * sampleRate / 1000);
    const buffer = new ArrayBuffer(samples * 2);
    const view = new Int16Array(buffer);
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      const sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;
      view[i] = Math.floor(sample * 32767); // Convert to 16-bit
    }
    
    return buffer;
  }

  /**
   * Generate white noise audio data
   */
  static generateWhiteNoise(durationMs: number, sampleRate = 22050, amplitude = 0.1): ArrayBuffer {
    const samples = Math.floor(durationMs * sampleRate / 1000);
    const buffer = new ArrayBuffer(samples * 2);
    const view = new Int16Array(buffer);
    
    for (let i = 0; i < samples; i++) {
      const sample = (Math.random() * 2 - 1) * amplitude;
      view[i] = Math.floor(sample * 32767);
    }
    
    return buffer;
  }

  /**
   * Generate speech-like audio data with varying frequencies
   */
  static generateSpeechLike(durationMs: number, sampleRate = 22050): ArrayBuffer {
    const samples = Math.floor(durationMs * sampleRate / 1000);
    const buffer = new ArrayBuffer(samples * 2);
    const view = new Int16Array(buffer);
    
    // Create formants typical of human speech
    const formants = [800, 1200, 2400]; // Typical vowel formants
    const amplitudes = [0.3, 0.2, 0.1];
    
    for (let i = 0; i < samples; i++) {
      const t = i / sampleRate;
      let sample = 0;
      
      // Add formants with slight frequency modulation
      for (let f = 0; f < formants.length; f++) {
        const freq = formants[f] * (1 + 0.1 * Math.sin(2 * Math.PI * 5 * t)); // 5Hz modulation
        sample += Math.sin(2 * Math.PI * freq * t) * amplitudes[f];
      }
      
      // Add envelope (fade in/out)
      const envelope = Math.min(t * 10, (durationMs/1000 - t) * 10, 1);
      sample *= envelope;
      
      view[i] = Math.floor(sample * 32767 / formants.length);
    }
    
    return buffer;
  }

  /**
   * Convert audio buffer to WAV format
   */
  static toWav(audioBuffer: ArrayBuffer, sampleRate = 22050): Uint8Array {
    const samples = audioBuffer.byteLength / 2;
    const wavHeader = new ArrayBuffer(44);
    const view = new DataView(wavHeader);
    
    // WAV header
    const writeString = (offset: number, string: string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + samples * 2, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, 1, true);
    view.setUint16(22, 1, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * 2, true);
    view.setUint16(32, 2, true);
    view.setUint16(34, 16, true);
    writeString(36, 'data');
    view.setUint32(40, samples * 2, true);
    
    // Combine header and audio data
    const wavData = new Uint8Array(44 + audioBuffer.byteLength);
    wavData.set(new Uint8Array(wavHeader), 0);
    wavData.set(new Uint8Array(audioBuffer), 44);
    
    return wavData;
  }

  /**
   * Convert audio buffer to base64 data URL
   */
  static toDataUrl(audioBuffer: ArrayBuffer, format = 'wav', sampleRate = 22050): string {
    const wavData = this.toWav(audioBuffer, sampleRate);
    const base64 = btoa(String.fromCharCode(...wavData));
    return `data:audio/${format};base64,${base64}`;
  }

  /**
   * Generate test phonemes for lip sync testing
   */
  static generatePhonemeSequence(): Array<{ timestamp: number; phoneme: string; amplitude: number }> {
    const phonemes = [
      'SIL', 'AH', 'EH', 'IH', 'OH', 'UH', 'AA', 'EY', 'AY', 'OW', 'AW',
      'B', 'CH', 'D', 'DH', 'F', 'G', 'HH', 'JH', 'K', 'L', 'M', 'N',
      'NG', 'P', 'R', 'S', 'SH', 'T', 'TH', 'V', 'W', 'Y', 'Z', 'ZH'
    ];
    
    const sequence = [];
    let timestamp = 0;
    
    for (let i = 0; i < 50; i++) {
      const phoneme = phonemes[Math.floor(Math.random() * phonemes.length)];
      const duration = 50 + Math.random() * 200; // 50-250ms per phoneme
      const amplitude = phoneme === 'SIL' ? 0 : 0.2 + Math.random() * 0.6;
      
      sequence.push({
        timestamp,
        phoneme,
        amplitude
      });
      
      timestamp += duration;
    }
    
    return sequence;
  }

  /**
   * Generate test visemes (visual mouth shapes) for lip sync
   */
  static generateVisemeSequence(): Array<{ timestamp: number; viseme: string; weight: number }> {
    const visemes = [
      'sil', 'PP', 'FF', 'TH', 'DD', 'kk', 'CH', 'SS', 'nn', 'RR',
      'aa', 'E', 'I', 'O', 'U'
    ];
    
    const sequence = [];
    let timestamp = 0;
    
    for (let i = 0; i < 30; i++) {
      const viseme = visemes[Math.floor(Math.random() * visemes.length)];
      const duration = 100 + Math.random() * 300; // 100-400ms per viseme
      const weight = viseme === 'sil' ? 0 : 0.3 + Math.random() * 0.7;
      
      sequence.push({
        timestamp,
        viseme,
        weight
      });
      
      timestamp += duration;
    }
    
    return sequence;
  }
}

/**
 * Pre-generated test audio files metadata
 */
export const TEST_AUDIO_FILES = {
  short: {
    name: 'short-speech.wav',
    duration: 2000,
    text: 'Hello world',
    language: 'en-US',
    phonemes: 12,
    visemes: 8
  },
  medium: {
    name: 'medium-speech.wav',
    duration: 5000,
    text: 'This is a test of the avatar speech synthesis system',
    language: 'en-US',
    phonemes: 45,
    visemes: 28
  },
  long: {
    name: 'long-speech.wav',
    duration: 15000,
    text: 'Welcome to our comprehensive avatar demonstration. This longer audio clip will test the lip synchronization accuracy over an extended period of time.',
    language: 'en-US',
    phonemes: 120,
    visemes: 85
  },
  multilingual: {
    name: 'multilingual.wav',
    duration: 8000,
    text: 'Hello, Hola, Bonjour, Hallo, こんにちは',
    language: 'multi',
    phonemes: 35,
    visemes: 25
  },
  numbers: {
    name: 'numbers.wav',
    duration: 6000,
    text: 'One, two, three, four, five, six, seven, eight, nine, ten',
    language: 'en-US',
    phonemes: 42,
    visemes: 30
  },
  punctuation: {
    name: 'punctuation.wav',
    duration: 4000,
    text: 'Hello! How are you? I am fine. Thank you.',
    language: 'en-US',
    phonemes: 28,
    visemes: 22
  },
  singing: {
    name: 'singing.wav',
    duration: 10000,
    text: 'La la la la la',
    language: 'en-US',
    phonemes: 15,
    visemes: 10,
    musical: true
  },
  whisper: {
    name: 'whisper.wav',
    duration: 3000,
    text: 'This is a whisper',
    language: 'en-US',
    phonemes: 18,
    visemes: 14,
    amplitude: 0.2
  },
  loud: {
    name: 'loud.wav',
    duration: 2500,
    text: 'THIS IS LOUD!',
    language: 'en-US',
    phonemes: 12,
    visemes: 9,
    amplitude: 0.9
  },
  silence: {
    name: 'silence.wav',
    duration: 1000,
    text: '',
    language: 'en-US',
    phonemes: 0,
    visemes: 0
  }
};

/**
 * Audio test scenarios for different testing needs
 */
export const AUDIO_TEST_SCENARIOS = {
  basic: {
    name: 'Basic Lip Sync',
    description: 'Test basic lip synchronization with simple phrases',
    files: ['short', 'medium'],
    expectedAccuracy: 0.85
  },
  performance: {
    name: 'Performance Test',
    description: 'Test performance with longer audio clips',
    files: ['long'],
    expectedAccuracy: 0.80,
    maxLatency: 100
  },
  multilingual: {
    name: 'Multilingual Support',
    description: 'Test support for different languages',
    files: ['multilingual'],
    expectedAccuracy: 0.75
  },
  edge_cases: {
    name: 'Edge Cases',
    description: 'Test edge cases like silence, whispers, and loud speech',
    files: ['silence', 'whisper', 'loud'],
    expectedAccuracy: 0.70
  },
  musical: {
    name: 'Musical Content',
    description: 'Test with singing and musical content',
    files: ['singing'],
    expectedAccuracy: 0.65
  },
  punctuation: {
    name: 'Punctuation Handling',
    description: 'Test proper handling of punctuation and pauses',
    files: ['punctuation', 'numbers'],
    expectedAccuracy: 0.80
  }
};

/**
 * Generate audio test files for E2E testing
 */
export async function generateTestAudioFiles(): Promise<void> {
  const fs = await import('fs');
  const path = await import('path');
  
  const audioDir = path.join(__dirname, '../fixtures/audio');
  
  // Ensure audio directory exists
  if (!fs.existsSync(audioDir)) {
    fs.mkdirSync(audioDir, { recursive: true });
  }

  // Generate test audio files
  for (const [key, fileInfo] of Object.entries(TEST_AUDIO_FILES)) {
    const audioBuffer = key === 'silence' 
      ? TestAudioGenerator.generateSilence(fileInfo.duration)
      : key === 'singing'
      ? TestAudioGenerator.generateSineWave(fileInfo.duration, 220) // A3 note
      : TestAudioGenerator.generateSpeechLike(fileInfo.duration);

    const wavData = TestAudioGenerator.toWav(audioBuffer);
    const filePath = path.join(audioDir, fileInfo.name);
    
    fs.writeFileSync(filePath, wavData);
    console.log(`Generated test audio file: ${filePath}`);
  }

  // Generate lip sync data files
  for (const [key, fileInfo] of Object.entries(TEST_AUDIO_FILES)) {
    if (fileInfo.phonemes > 0) {
      const phonemeData = TestAudioGenerator.generatePhonemeSequence();
      const visemeData = TestAudioGenerator.generateVisemeSequence();
      
      const lipSyncData = {
        duration: fileInfo.duration,
        text: fileInfo.text,
        language: fileInfo.language,
        phonemes: phonemeData,
        visemes: visemeData,
        metadata: {
          generatedAt: new Date().toISOString(),
          version: '1.0',
          testFile: true
        }
      };
      
      const jsonPath = path.join(audioDir, `${key}-lipsync.json`);
      fs.writeFileSync(jsonPath, JSON.stringify(lipSyncData, null, 2));
      console.log(`Generated lip sync data: ${jsonPath}`);
    }
  }
}

/**
 * Audio file utilities for tests
 */
export class AudioTestUtils {
  /**
   * Load test audio file
   */
  static async loadTestAudio(filename: string): Promise<ArrayBuffer> {
    const fs = await import('fs');
    const path = await import('path');
    
    const filePath = path.join(__dirname, '../fixtures/audio', filename);
    const buffer = fs.readFileSync(filePath);
    return buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength);
  }

  /**
   * Create blob URL for test audio
   */
  static createBlobUrl(audioBuffer: ArrayBuffer, mimeType = 'audio/wav'): string {
    const blob = new Blob([audioBuffer], { type: mimeType });
    return URL.createObjectURL(blob);
  }

  /**
   * Validate audio format
   */
  static validateAudioFormat(audioBuffer: ArrayBuffer, expectedFormat: string): boolean {
    const view = new DataView(audioBuffer);
    
    switch (expectedFormat) {
      case 'wav':
        return (
          String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)) === 'RIFF' &&
          String.fromCharCode(view.getUint8(8), view.getUint8(9), view.getUint8(10), view.getUint8(11)) === 'WAVE'
        );
      default:
        return true; // Assume valid for other formats
    }
  }

  /**
   * Calculate audio duration from buffer
   */
  static calculateDuration(audioBuffer: ArrayBuffer, sampleRate = 22050): number {
    // Assume 16-bit mono WAV
    const samples = (audioBuffer.byteLength - 44) / 2; // Subtract WAV header
    return (samples / sampleRate) * 1000; // Return in milliseconds
  }

  /**
   * Compare audio buffers for similarity
   */
  static compareAudioBuffers(buffer1: ArrayBuffer, buffer2: ArrayBuffer, threshold = 0.1): number {
    const view1 = new Int16Array(buffer1);
    const view2 = new Int16Array(buffer2);
    
    const minLength = Math.min(view1.length, view2.length);
    let totalDiff = 0;
    
    for (let i = 0; i < minLength; i++) {
      const diff = Math.abs(view1[i] - view2[i]) / 32767; // Normalize to 0-1
      totalDiff += diff;
    }
    
    return 1 - (totalDiff / minLength); // Return similarity (0-1)
  }

  /**
   * Extract audio features for testing
   */
  static extractFeatures(audioBuffer: ArrayBuffer): {
    rms: number;
    peak: number;
    zeroCrossings: number;
    spectralCentroid: number;
  } {
    const view = new Int16Array(audioBuffer);
    let rms = 0;
    let peak = 0;
    let zeroCrossings = 0;
    let spectralCentroid = 0;

    // Calculate RMS and peak
    for (let i = 0; i < view.length; i++) {
      const sample = Math.abs(view[i]) / 32767;
      rms += sample * sample;
      peak = Math.max(peak, sample);
      
      // Count zero crossings
      if (i > 0 && ((view[i] >= 0) !== (view[i-1] >= 0))) {
        zeroCrossings++;
      }
    }

    rms = Math.sqrt(rms / view.length);
    
    // Simple spectral centroid approximation
    spectralCentroid = zeroCrossings / view.length;

    return { rms, peak, zeroCrossings, spectralCentroid };
  }
}