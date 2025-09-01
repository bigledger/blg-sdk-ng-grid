import { Injectable, signal, computed } from '@angular/core';

/**
 * Emotion categories and intensities
 */
export type EmotionType = 
  | 'neutral' | 'happy' | 'sad' | 'angry' | 'surprised' | 'fearful' | 'disgusted'
  | 'excited' | 'calm' | 'frustrated' | 'confused' | 'confident' | 'anxious'
  | 'enthusiastic' | 'bored' | 'curious' | 'sympathetic' | 'proud' | 'embarrassed';

export type EmotionIntensity = 'very_low' | 'low' | 'moderate' | 'high' | 'very_high';

/**
 * Detected emotion with metadata
 */
export interface DetectedEmotion {
  emotion: EmotionType;
  intensity: EmotionIntensity;
  confidence: number; // 0-1
  timestamp: number;
  source: 'text' | 'audio' | 'context' | 'combined';
  features: EmotionFeatures;
  duration?: number; // For audio-based emotions
}

/**
 * Features used for emotion detection
 */
export interface EmotionFeatures {
  // Text features
  textual?: {
    sentiment: number; // -1 to 1
    subjectivity: number; // 0 to 1
    keywords: string[];
    punctuationIntensity: number;
    capsUsage: number;
    emoticons: string[];
    exclamationCount: number;
    questionCount: number;
  };
  
  // Audio features
  acoustic?: {
    pitch: number;
    pitchVariance: number;
    energy: number;
    tempo: number;
    voiceQuality: number;
    spectralCentroid: number;
    jitter: number;
    shimmer: number;
  };
  
  // Contextual features
  contextual?: {
    topic: string[];
    conversationHistory: string[];
    userProfile: Record<string, any>;
    timeOfDay: string;
    interactionLength: number;
  };
}

/**
 * Emotion transition information
 */
export interface EmotionTransition {
  fromEmotion: EmotionType;
  toEmotion: EmotionType;
  transitionSpeed: number; // 0-1, how quickly to transition
  blendFactor: number; // 0-1, how much to blend vs hard switch
  reason: string;
  timestamp: number;
}

/**
 * Emotion detection configuration
 */
export interface EmotionDetectionConfig {
  sensitivity: number; // 0-1, how sensitive to emotion changes
  textWeight: number; // Weight for text-based detection
  audioWeight: number; // Weight for audio-based detection
  contextWeight: number; // Weight for contextual detection
  smoothingWindow: number; // Milliseconds to smooth emotion changes
  minimumConfidence: number; // Minimum confidence to trigger emotion
  enableEmotionHistory: boolean;
  enableTransitionSmoothing: boolean;
}

/**
 * Service for detecting emotions from text, audio, and contextual cues.
 * Provides multi-modal emotion analysis for natural avatar responses.
 */
@Injectable({
  providedIn: 'root'
})
export class EmotionDetectorService {
  // Configuration signals
  private _config = signal<EmotionDetectionConfig>({
    sensitivity: 0.7,
    textWeight: 0.4,
    audioWeight: 0.4,
    contextWeight: 0.2,
    smoothingWindow: 2000,
    minimumConfidence: 0.3,
    enableEmotionHistory: true,
    enableTransitionSmoothing: true
  });

  // Emotion state
  private _currentEmotion = signal<DetectedEmotion | null>(null);
  private _emotionHistory = signal<DetectedEmotion[]>([]);
  private _emotionTransitions = signal<EmotionTransition[]>([]);

  // Detection models and data
  private _emotionKeywords = signal<Map<EmotionType, string[]>>(new Map());
  private _emotionPatterns = signal<Map<EmotionType, RegExp[]>>(new Map());
  private _contextualRules = signal<Array<{
    condition: (features: EmotionFeatures) => boolean;
    emotion: EmotionType;
    confidence: number;
  }>>([]);

  // Computed values
  readonly config = this._config.asReadonly();
  readonly currentEmotion = this._currentEmotion.asReadonly();
  readonly emotionHistory = this._emotionHistory.asReadonly();
  readonly recentEmotions = computed(() => {
    const now = Date.now();
    const windowMs = this._config().smoothingWindow;
    return this._emotionHistory().filter(e => now - e.timestamp <= windowMs);
  });

  readonly dominantEmotion = computed(() => {
    const recent = this.recentEmotions();
    if (recent.length === 0) return null;

    // Count emotions weighted by confidence
    const emotionCounts = new Map<EmotionType, number>();
    recent.forEach(e => {
      const current = emotionCounts.get(e.emotion) || 0;
      emotionCounts.set(e.emotion, current + e.confidence);
    });

    // Find most dominant
    let maxEmotion: EmotionType = 'neutral';
    let maxScore = 0;
    emotionCounts.forEach((score, emotion) => {
      if (score > maxScore) {
        maxScore = score;
        maxEmotion = emotion;
      }
    });

    return maxEmotion;
  });

  constructor() {
    this.initializeEmotionModels();
    this.initializeContextualRules();
  }

  /**
   * Configure emotion detection parameters
   */
  configure(config: Partial<EmotionDetectionConfig>): void {
    this._config.update(current => ({ ...current, ...config }));
  }

  /**
   * Detect emotion from text input
   */
  detectFromText(text: string, context?: any): DetectedEmotion {
    const features = this.extractTextualFeatures(text);
    const emotions = this.analyzeTextualEmotions(features, text);
    
    // Get the highest confidence emotion
    const detectedEmotion = emotions.reduce((best, current) => 
      current.confidence > best.confidence ? current : best
    );

    const emotion: DetectedEmotion = {
      ...detectedEmotion,
      timestamp: Date.now(),
      source: 'text',
      features: { textual: features }
    };

    this.updateEmotionState(emotion);
    return emotion;
  }

  /**
   * Detect emotion from audio features
   */
  detectFromAudio(audioFeatures: any): DetectedEmotion {
    const acousticFeatures = this.extractAcousticFeatures(audioFeatures);
    const { emotion, intensity, confidence } = this.analyzeAcousticEmotions(acousticFeatures);

    const detectedEmotion: DetectedEmotion = {
      emotion,
      intensity,
      confidence,
      timestamp: Date.now(),
      source: 'audio',
      features: { acoustic: acousticFeatures }
    };

    this.updateEmotionState(detectedEmotion);
    return detectedEmotion;
  }

  /**
   * Detect emotion from combined text and audio
   */
  detectFromMultimodal(
    text: string, 
    audioFeatures?: any, 
    context?: any
  ): DetectedEmotion {
    const textual = this.extractTextualFeatures(text);
    const acoustic = audioFeatures ? this.extractAcousticFeatures(audioFeatures) : undefined;
    const contextual = context ? this.extractContextualFeatures(context) : undefined;

    const features: EmotionFeatures = { textual, acoustic, contextual };
    
    // Analyze each modality
    const textEmotions = this.analyzeTextualEmotions(textual, text);
    const audioEmotions = acoustic ? this.analyzeAcousticEmotions(acoustic) : null;
    const contextEmotions = contextual ? this.analyzeContextualEmotions(contextual) : [];

    // Combine results using weighted fusion
    const combinedEmotion = this.fuseEmotionResults({
      text: textEmotions,
      audio: audioEmotions,
      context: contextEmotions
    });

    const detectedEmotion: DetectedEmotion = {
      ...combinedEmotion,
      timestamp: Date.now(),
      source: 'combined',
      features
    };

    this.updateEmotionState(detectedEmotion);
    return detectedEmotion;
  }

  /**
   * Get emotion intensity from text patterns
   */
  analyzeEmotionIntensity(text: string, emotion: EmotionType): EmotionIntensity {
    const intensityIndicators = {
      very_high: ['extremely', 'incredibly', 'absolutely', '!!!', 'CAPS_HEAVY'],
      high: ['very', 'really', 'quite', '!!', 'CAPS_MODERATE'],
      moderate: ['somewhat', 'fairly', '!', 'caps_light'],
      low: ['a bit', 'slightly', 'kind of'],
      very_low: ['barely', 'hardly', 'scarcely']
    };

    const normalizedText = text.toLowerCase();
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length;
    const exclamationCount = (text.match(/!/g) || []).length;

    // Score intensity based on indicators
    let intensityScore = 0;

    Object.entries(intensityIndicators).forEach(([level, indicators]) => {
      const levelValue = ['very_low', 'low', 'moderate', 'high', 'very_high'].indexOf(level);
      
      indicators.forEach(indicator => {
        if (indicator === 'CAPS_HEAVY' && capsRatio > 0.3) intensityScore = Math.max(intensityScore, levelValue);
        else if (indicator === 'CAPS_MODERATE' && capsRatio > 0.15) intensityScore = Math.max(intensityScore, levelValue);
        else if (indicator === 'caps_light' && capsRatio > 0.05) intensityScore = Math.max(intensityScore, levelValue);
        else if (indicator.includes('!') && exclamationCount >= indicator.length) intensityScore = Math.max(intensityScore, levelValue);
        else if (normalizedText.includes(indicator.toLowerCase())) intensityScore = Math.max(intensityScore, levelValue);
      });
    });

    const intensityLevels: EmotionIntensity[] = ['very_low', 'low', 'moderate', 'high', 'very_high'];
    return intensityLevels[Math.max(0, Math.min(4, intensityScore))];
  }

  /**
   * Predict emotion transition
   */
  predictEmotionTransition(
    currentEmotion: EmotionType,
    newEmotion: EmotionType,
    confidence: number
  ): EmotionTransition | null {
    if (currentEmotion === newEmotion) return null;

    // Define transition compatibility matrix
    const transitionMatrix: Record<string, { speed: number; blend: number }> = {
      'neutral->happy': { speed: 0.8, blend: 0.3 },
      'neutral->sad': { speed: 0.6, blend: 0.4 },
      'happy->excited': { speed: 0.9, blend: 0.2 },
      'happy->sad': { speed: 0.4, blend: 0.6 },
      'sad->angry': { speed: 0.7, blend: 0.3 },
      'angry->calm': { speed: 0.3, blend: 0.7 },
      // Add more transitions as needed
    };

    const transitionKey = `${currentEmotion}->${newEmotion}`;
    const transitionData = transitionMatrix[transitionKey] || { speed: 0.5, blend: 0.5 };

    return {
      fromEmotion: currentEmotion,
      toEmotion: newEmotion,
      transitionSpeed: transitionData.speed * confidence,
      blendFactor: transitionData.blend,
      reason: `Transition from ${currentEmotion} to ${newEmotion}`,
      timestamp: Date.now()
    };
  }

  /**
   * Get emotion history for analysis
   */
  getEmotionAnalysis(windowMs: number = 30000): {
    emotions: DetectedEmotion[];
    transitions: EmotionTransition[];
    patterns: { emotion: EmotionType; frequency: number; avgIntensity: number }[];
    stability: number; // 0-1, how stable emotions have been
  } {
    const now = Date.now();
    const emotions = this._emotionHistory().filter(e => now - e.timestamp <= windowMs);
    const transitions = this._emotionTransitions().filter(t => now - t.timestamp <= windowMs);

    // Analyze emotion patterns
    const emotionCounts = new Map<EmotionType, { count: number; totalIntensity: number }>();
    emotions.forEach(e => {
      const current = emotionCounts.get(e.emotion) || { count: 0, totalIntensity: 0 };
      const intensityValue = ['very_low', 'low', 'moderate', 'high', 'very_high'].indexOf(e.intensity);
      emotionCounts.set(e.emotion, {
        count: current.count + 1,
        totalIntensity: current.totalIntensity + intensityValue
      });
    });

    const patterns = Array.from(emotionCounts.entries()).map(([emotion, data]) => ({
      emotion,
      frequency: data.count / emotions.length,
      avgIntensity: data.totalIntensity / data.count
    }));

    // Calculate stability (fewer transitions = more stable)
    const stability = emotions.length > 0 ? 1 - (transitions.length / emotions.length) : 1;

    return { emotions, transitions, patterns, stability };
  }

  /**
   * Clear emotion history
   */
  clearHistory(): void {
    this._emotionHistory.set([]);
    this._emotionTransitions.set([]);
    this._currentEmotion.set(null);
  }

  /**
   * Extract textual features from text
   */
  private extractTextualFeatures(text: string): EmotionFeatures['textual'] {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // Calculate sentiment using simple word counting
    const sentiment = this.calculateSentiment(text);
    const subjectivity = this.calculateSubjectivity(text);
    
    // Find emotional keywords
    const keywords = this.findEmotionalKeywords(text);
    
    // Analyze punctuation and formatting
    const punctuationIntensity = this.analyzePunctuationIntensity(text);
    const capsUsage = (text.match(/[A-Z]/g) || []).length / text.length;
    const emoticons = this.extractEmoticons(text);
    const exclamationCount = (text.match(/!/g) || []).length;
    const questionCount = (text.match(/\?/g) || []).length;

    return {
      sentiment,
      subjectivity,
      keywords,
      punctuationIntensity,
      capsUsage,
      emoticons,
      exclamationCount,
      questionCount
    };
  }

  /**
   * Extract acoustic features from audio analysis
   */
  private extractAcousticFeatures(audioFeatures: any): EmotionFeatures['acoustic'] {
    return {
      pitch: audioFeatures.fundamentalFrequency || 0,
      pitchVariance: audioFeatures.pitchVariance || 0,
      energy: audioFeatures.energy || 0,
      tempo: audioFeatures.tempo || 0,
      voiceQuality: audioFeatures.voiceQuality || 0,
      spectralCentroid: audioFeatures.spectralCentroid || 0,
      jitter: audioFeatures.jitter || 0,
      shimmer: audioFeatures.shimmer || 0
    };
  }

  /**
   * Extract contextual features
   */
  private extractContextualFeatures(context: any): EmotionFeatures['contextual'] {
    return {
      topic: context.topic || [],
      conversationHistory: context.history || [],
      userProfile: context.userProfile || {},
      timeOfDay: context.timeOfDay || 'unknown',
      interactionLength: context.interactionLength || 0
    };
  }

  /**
   * Analyze emotions from textual features
   */
  private analyzeTextualEmotions(
    features: EmotionFeatures['textual'], 
    text: string
  ): Array<{ emotion: EmotionType; intensity: EmotionIntensity; confidence: number }> {
    const emotions: Array<{ emotion: EmotionType; intensity: EmotionIntensity; confidence: number }> = [];
    
    // Keyword-based detection
    this._emotionKeywords().forEach((keywords, emotion) => {
      const matchCount = keywords.filter(keyword => 
        features?.keywords.includes(keyword)
      ).length;
      
      if (matchCount > 0) {
        const confidence = Math.min(1, matchCount / keywords.length * 2);
        const intensity = this.analyzeEmotionIntensity(text, emotion);
        emotions.push({ emotion, intensity, confidence });
      }
    });

    // Pattern-based detection
    this._emotionPatterns().forEach((patterns, emotion) => {
      const matchCount = patterns.filter(pattern => pattern.test(text)).length;
      
      if (matchCount > 0) {
        const confidence = Math.min(1, matchCount / patterns.length * 1.5);
        const intensity = this.analyzeEmotionIntensity(text, emotion);
        emotions.push({ emotion, intensity, confidence });
      }
    });

    // Sentiment-based detection
    if (features?.sentiment) {
      if (features.sentiment > 0.3) {
        emotions.push({ emotion: 'happy', intensity: 'moderate', confidence: features.sentiment });
      } else if (features.sentiment < -0.3) {
        emotions.push({ emotion: 'sad', intensity: 'moderate', confidence: Math.abs(features.sentiment) });
      }
    }

    // Default to neutral if no emotions detected
    if (emotions.length === 0) {
      emotions.push({ emotion: 'neutral', intensity: 'moderate', confidence: 0.5 });
    }

    return emotions.filter(e => e.confidence >= this._config().minimumConfidence);
  }

  /**
   * Analyze emotions from acoustic features
   */
  private analyzeAcousticEmotions(features: EmotionFeatures['acoustic']): {
    emotion: EmotionType;
    intensity: EmotionIntensity;
    confidence: number;
  } {
    let emotion: EmotionType = 'neutral';
    let confidence = 0.5;
    let intensity: EmotionIntensity = 'moderate';

    // High energy + high pitch variance = excited/happy
    if (features.energy > 0.1 && features.pitchVariance > 50) {
      emotion = 'excited';
      confidence = 0.7;
      intensity = 'high';
    }
    // Low energy + low pitch = sad
    else if (features.energy < 0.05 && features.pitch < 120) {
      emotion = 'sad';
      confidence = 0.6;
      intensity = 'moderate';
    }
    // High energy + high pitch + high spectral centroid = angry
    else if (features.energy > 0.15 && features.pitch > 200 && features.spectralCentroid > 2000) {
      emotion = 'angry';
      confidence = 0.8;
      intensity = 'high';
    }
    // High jitter + high shimmer = anxious
    else if (features.jitter > 0.05 && features.shimmer > 0.1) {
      emotion = 'anxious';
      confidence = 0.6;
      intensity = 'moderate';
    }

    return { emotion, intensity, confidence };
  }

  /**
   * Analyze emotions from contextual features
   */
  private analyzeContextualEmotions(features: EmotionFeatures['contextual']): Array<{
    emotion: EmotionType;
    intensity: EmotionIntensity;
    confidence: number;
  }> {
    const emotions: Array<{ emotion: EmotionType; intensity: EmotionIntensity; confidence: number }> = [];

    // Apply contextual rules
    this._contextualRules().forEach(rule => {
      if (rule.condition({ contextual: features })) {
        emotions.push({
          emotion: rule.emotion,
          intensity: 'moderate',
          confidence: rule.confidence
        });
      }
    });

    return emotions;
  }

  /**
   * Fuse emotion results from multiple modalities
   */
  private fuseEmotionResults(results: {
    text: Array<{ emotion: EmotionType; intensity: EmotionIntensity; confidence: number }>;
    audio: { emotion: EmotionType; intensity: EmotionIntensity; confidence: number } | null;
    context: Array<{ emotion: EmotionType; intensity: EmotionIntensity; confidence: number }>;
  }): { emotion: EmotionType; intensity: EmotionIntensity; confidence: number } {
    const config = this._config();
    const emotionScores = new Map<EmotionType, number>();

    // Weight text emotions
    results.text.forEach(e => {
      const current = emotionScores.get(e.emotion) || 0;
      emotionScores.set(e.emotion, current + e.confidence * config.textWeight);
    });

    // Weight audio emotion
    if (results.audio) {
      const current = emotionScores.get(results.audio.emotion) || 0;
      emotionScores.set(results.audio.emotion, current + results.audio.confidence * config.audioWeight);
    }

    // Weight contextual emotions
    results.context.forEach(e => {
      const current = emotionScores.get(e.emotion) || 0;
      emotionScores.set(e.emotion, current + e.confidence * config.contextWeight);
    });

    // Find highest scoring emotion
    let bestEmotion: EmotionType = 'neutral';
    let bestScore = 0;
    emotionScores.forEach((score, emotion) => {
      if (score > bestScore) {
        bestScore = score;
        bestEmotion = emotion;
      }
    });

    // Calculate combined intensity and confidence
    const allResults = [
      ...results.text,
      ...(results.audio ? [results.audio] : []),
      ...results.context
    ].filter(r => r.emotion === bestEmotion);

    const avgIntensityValue = allResults.reduce((sum, r) => 
      sum + ['very_low', 'low', 'moderate', 'high', 'very_high'].indexOf(r.intensity), 0
    ) / allResults.length;

    const intensityLevels: EmotionIntensity[] = ['very_low', 'low', 'moderate', 'high', 'very_high'];
    const intensity = intensityLevels[Math.round(avgIntensityValue)] || 'moderate';

    const confidence = Math.min(1, bestScore);

    return { emotion: bestEmotion, intensity, confidence };
  }

  /**
   * Update emotion state with new detection
   */
  private updateEmotionState(newEmotion: DetectedEmotion): void {
    const currentEmotion = this._currentEmotion();
    const config = this._config();

    // Check if we should transition
    if (currentEmotion && config.enableTransitionSmoothing) {
      const transition = this.predictEmotionTransition(
        currentEmotion.emotion,
        newEmotion.emotion,
        newEmotion.confidence
      );
      
      if (transition) {
        this._emotionTransitions.update(transitions => [...transitions, transition]);
      }
    }

    // Update current emotion
    this._currentEmotion.set(newEmotion);

    // Add to history
    if (config.enableEmotionHistory) {
      this._emotionHistory.update(history => {
        const newHistory = [...history, newEmotion];
        // Keep only recent history (last 100 items)
        return newHistory.slice(-100);
      });
    }
  }

  /**
   * Initialize emotion detection models
   */
  private initializeEmotionModels(): void {
    // Initialize emotion keywords
    const emotionKeywords = new Map<EmotionType, string[]>([
      ['happy', ['happy', 'joy', 'delighted', 'pleased', 'cheerful', 'glad', 'elated', 'content']],
      ['sad', ['sad', 'depressed', 'melancholy', 'sorrowful', 'dejected', 'despondent', 'downhearted']],
      ['angry', ['angry', 'furious', 'rage', 'mad', 'irate', 'livid', 'outraged', 'incensed']],
      ['surprised', ['surprised', 'astonished', 'amazed', 'shocked', 'stunned', 'bewildered']],
      ['fearful', ['afraid', 'scared', 'frightened', 'terrified', 'anxious', 'worried', 'nervous']],
      ['disgusted', ['disgusted', 'revolted', 'repulsed', 'sickened', 'nauseated']],
      ['excited', ['excited', 'thrilled', 'exhilarated', 'energetic', 'enthusiastic', 'eager']],
      ['calm', ['calm', 'peaceful', 'serene', 'tranquil', 'relaxed', 'composed']],
      ['frustrated', ['frustrated', 'annoyed', 'irritated', 'vexed', 'exasperated']],
      ['confused', ['confused', 'puzzled', 'perplexed', 'baffled', 'bewildered', 'unclear']],
      ['confident', ['confident', 'assured', 'certain', 'sure', 'self-assured', 'positive']],
      ['curious', ['curious', 'interested', 'intrigued', 'wondering', 'inquisitive']]
    ]);

    this._emotionKeywords.set(emotionKeywords);

    // Initialize emotion patterns
    const emotionPatterns = new Map<EmotionType, RegExp[]>([
      ['happy', [/\b(haha|hehe|lol)\b/i, /:\)|:D|:-\)/g, /\b(awesome|great|wonderful)\b/i]],
      ['sad', [/:\(|:-\(/g, /\b(terrible|awful|horrible)\b/i, /\b(cry|tears)\b/i]],
      ['angry', [/!{2,}/g, /\b(damn|hell|stupid)\b/i, /\b[A-Z]{3,}\b/g]],
      ['surprised', [/\bwow\b/i, /\b(omg|oh my god)\b/i, /!+\?+/g]],
      ['confused', [/\?\?\?+/g, /\b(what|huh|how)\b.*\?/i, /\b(unclear|confusing)\b/i]]
    ]);

    this._emotionPatterns.set(emotionPatterns);
  }

  /**
   * Initialize contextual emotion rules
   */
  private initializeContextualRules(): void {
    const rules = [
      {
        condition: (features: EmotionFeatures) => 
          features.contextual?.timeOfDay === 'morning' && 
          features.contextual?.interactionLength < 60000, // First minute
        emotion: 'happy' as EmotionType,
        confidence: 0.3
      },
      {
        condition: (features: EmotionFeatures) =>
          features.contextual?.topic.includes('problem') ||
          features.contextual?.topic.includes('issue'),
        emotion: 'concerned' as EmotionType,
        confidence: 0.4
      },
      {
        condition: (features: EmotionFeatures) =>
          features.contextual?.topic.includes('celebration') ||
          features.contextual?.topic.includes('achievement'),
        emotion: 'proud' as EmotionType,
        confidence: 0.6
      }
    ];

    this._contextualRules.set(rules);
  }

  // Helper methods for text analysis
  private calculateSentiment(text: string): number {
    const positiveWords = [
      'good', 'great', 'excellent', 'amazing', 'wonderful', 'fantastic', 'awesome',
      'love', 'like', 'enjoy', 'happy', 'pleased', 'delighted', 'perfect', 'best'
    ];
    
    const negativeWords = [
      'bad', 'terrible', 'awful', 'horrible', 'disgusting', 'hate', 'dislike',
      'sad', 'angry', 'frustrated', 'disappointed', 'worst', 'fail', 'wrong'
    ];

    const words = text.toLowerCase().split(/\s+/);
    let positiveCount = 0;
    let negativeCount = 0;

    words.forEach(word => {
      if (positiveWords.includes(word)) positiveCount++;
      if (negativeWords.includes(word)) negativeCount++;
    });

    const totalEmotionalWords = positiveCount + negativeCount;
    if (totalEmotionalWords === 0) return 0;

    return (positiveCount - negativeCount) / totalEmotionalWords;
  }

  private calculateSubjectivity(text: string): number {
    const subjectiveWords = [
      'feel', 'think', 'believe', 'opinion', 'personally', 'i think', 'i feel',
      'seems', 'appears', 'probably', 'maybe', 'perhaps', 'likely', 'assume'
    ];

    const words = text.toLowerCase().split(/\s+/);
    const subjectiveCount = subjectiveWords.filter(sw => 
      words.some(w => w.includes(sw))
    ).length;

    return Math.min(1, subjectiveCount / 10); // Normalize to 0-1
  }

  private findEmotionalKeywords(text: string): string[] {
    const keywords: string[] = [];
    const normalizedText = text.toLowerCase();

    this._emotionKeywords().forEach(emotionWords => {
      emotionWords.forEach(word => {
        if (normalizedText.includes(word)) {
          keywords.push(word);
        }
      });
    });

    return keywords;
  }

  private analyzePunctuationIntensity(text: string): number {
    const exclamations = (text.match(/!/g) || []).length;
    const questions = (text.match(/\?/g) || []).length;
    const ellipsis = (text.match(/\.\.\./g) || []).length;
    const multiPunct = (text.match(/[!?]{2,}/g) || []).length;

    return (exclamations * 0.3 + questions * 0.2 + ellipsis * 0.1 + multiPunct * 0.5) / text.length * 100;
  }

  private extractEmoticons(text: string): string[] {
    const emoticonPatterns = [
      /:\)|:-\)|:D|:-D|;\)|;-\)/g, // Happy
      /:\(|:-\(|:'\(/g, // Sad
      /:P|:-P|:p|:-p/g, // Playful
      /:o|:-o|:O|:-O/g, // Surprised
      /:\||:-\|/g, // Neutral
      /<3/g // Love
    ];

    const emoticons: string[] = [];
    emoticonPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) emoticons.push(...matches);
    });

    return emoticons;
  }
}