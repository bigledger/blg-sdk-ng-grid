import { Injectable, signal, computed } from '@angular/core';

/**
 * Gesture types and categories
 */
export type GestureType = 
  | 'wave' | 'point' | 'nod' | 'shake-head' | 'shrug' | 'thumbs-up' | 'thumbs-down'
  | 'clap' | 'thinking' | 'explaining' | 'emphasizing' | 'greeting' | 'goodbye'
  | 'yes' | 'no' | 'maybe' | 'stop' | 'come-here' | 'go-away';

export type GestureCategory = 
  | 'communicative' | 'emotional' | 'descriptive' | 'interactive' | 'cultural';

/**
 * Gesture definition with timing and animation data
 */
export interface GestureDefinition {
  id: string;
  name: string;
  type: GestureType;
  category: GestureCategory;
  duration: number; // milliseconds
  intensity: 'subtle' | 'moderate' | 'strong';
  keyframes: GestureKeyframe[];
  description: string;
  culturalContext?: string[];
  emotionalContext?: string[];
  prerequisites?: string[]; // Required body parts or conditions
}

/**
 * Individual keyframe in a gesture animation
 */
export interface GestureKeyframe {
  time: number; // 0-1 relative to gesture duration
  bodyPart: string;
  position: { x: number; y: number; z: number };
  rotation?: { x: number; y: number; z: number };
  scale?: number;
  easing?: 'linear' | 'ease-in' | 'ease-out' | 'ease-in-out';
}

/**
 * Generated gesture with context and timing
 */
export interface GeneratedGesture {
  gesture: GestureDefinition;
  startTime: number; // milliseconds from start of speech
  confidence: number; // 0-1
  reason: string; // Why this gesture was selected
  adaptations?: GestureAdaptation[];
}

/**
 * Gesture adaptation for context
 */
export interface GestureAdaptation {
  type: 'intensity' | 'timing' | 'position' | 'cultural';
  reason: string;
  modification: any;
}

/**
 * Text analysis context for gesture generation
 */
interface TextAnalysisContext {
  words: string[];
  sentences: string[];
  emotions: Array<{ emotion: string; confidence: number; position: number }>;
  emphasisWords: Array<{ word: string; position: number; type: string }>;
  questionWords: string[];
  actionWords: string[];
  descriptiveWords: string[];
  sentiment: number; // -1 to 1
  topics: string[];
  speakingStyle: 'formal' | 'casual' | 'enthusiastic' | 'calm';
}

/**
 * Gesture generation rules
 */
interface GestureRule {
  id: string;
  name: string;
  condition: (context: TextAnalysisContext, position: number) => boolean;
  gestureSelector: (context: TextAnalysisContext) => GestureType[];
  confidence: number;
  priority: number;
  cooldown?: number; // Minimum time between applications (ms)
}

/**
 * Service for generating contextual gestures from text and emotional cues.
 * Creates natural-looking avatar animations synchronized with speech.
 */
@Injectable({
  providedIn: 'root'
})
export class GestureGeneratorService {
  // Configuration signals
  private _gestureIntensity = signal<'subtle' | 'moderate' | 'strong'>('moderate');
  private _culturalContext = signal<string[]>(['western', 'neutral']);
  private _personalityTraits = signal<Record<string, number>>({
    expressiveness: 0.7,
    formality: 0.5,
    enthusiasm: 0.6,
    calmness: 0.5
  });

  // Gesture database
  private _gestureDatabase = signal<Map<GestureType, GestureDefinition>>(new Map());
  private _gestureRules = signal<GestureRule[]>([]);
  private _recentGestures = signal<Array<{ gesture: GestureType; time: number }>>();

  // Computed values
  readonly gestureIntensity = this._gestureIntensity.asReadonly();
  readonly culturalContext = this._culturalContext.asReadonly();
  readonly personalityTraits = this._personalityTraits.asReadonly();
  readonly availableGestures = computed(() => Array.from(this._gestureDatabase().keys()));

  constructor() {
    this.initializeGestureDatabase();
    this.initializeGestureRules();
  }

  /**
   * Configure gesture generation parameters
   */
  configure(config: {
    intensity?: 'subtle' | 'moderate' | 'strong';
    culturalContext?: string[];
    personalityTraits?: Record<string, number>;
  }): void {
    if (config.intensity) this._gestureIntensity.set(config.intensity);
    if (config.culturalContext) this._culturalContext.set(config.culturalContext);
    if (config.personalityTraits) {
      this._personalityTraits.update(traits => ({ ...traits, ...config.personalityTraits }));
    }
  }

  /**
   * Generate gestures from text input
   */
  generateGesturesFromText(
    text: string,
    options: {
      duration?: number; // Total duration in milliseconds
      maxGestures?: number;
      emotionalContext?: string[];
      speakingStyle?: 'formal' | 'casual' | 'enthusiastic' | 'calm';
    } = {}
  ): GeneratedGesture[] {
    const context = this.analyzeText(text, options.speakingStyle);
    const duration = options.duration || this.estimateSpeechDuration(text);
    const maxGestures = options.maxGestures || Math.max(1, Math.floor(duration / 3000)); // Max 1 gesture per 3 seconds

    const generatedGestures: GeneratedGesture[] = [];
    const rules = this._gestureRules();
    
    // Analyze text for gesture opportunities
    const words = text.toLowerCase().split(/\s+/);
    let currentTime = 0;
    const timePerWord = duration / words.length;

    for (let i = 0; i < words.length && generatedGestures.length < maxGestures; i++) {
      const wordPosition = i / words.length;
      
      // Check gesture rules
      for (const rule of rules.sort((a, b) => b.priority - a.priority)) {
        if (this.shouldApplyRule(rule, context, i, generatedGestures)) {
          const gestureTypes = rule.gestureSelector(context);
          
          if (gestureTypes.length > 0) {
            const selectedType = this.selectBestGesture(gestureTypes, context, currentTime);
            const gesture = this._gestureDatabase().get(selectedType);
            
            if (gesture) {
              const adaptedGesture = this.adaptGestureToContext(gesture, context);
              
              generatedGestures.push({
                gesture: adaptedGesture,
                startTime: currentTime,
                confidence: rule.confidence,
                reason: rule.name,
                adaptations: []
              });
              
              // Add cooldown
              this._recentGestures.update(recent => [
                ...recent || [],
                { gesture: selectedType, time: currentTime }
              ]);
              
              break; // Only apply first matching rule per position
            }
          }
        }
      }
      
      currentTime += timePerWord;
    }

    return this.optimizeGestureSequence(generatedGestures);
  }

  /**
   * Generate gesture from emotion
   */
  generateGestureFromEmotion(
    emotion: string,
    intensity: number = 0.5,
    duration?: number
  ): GeneratedGesture | null {
    const emotionGestureMap: Record<string, GestureType[]> = {
      'happy': ['thumbs-up', 'clap', 'wave'],
      'excited': ['clap', 'emphasizing', 'wave'],
      'sad': ['shrug', 'thinking'],
      'angry': ['stop', 'emphasizing', 'no'],
      'surprised': ['point', 'thinking'],
      'confused': ['shrug', 'thinking', 'maybe'],
      'confident': ['thumbs-up', 'yes', 'explaining'],
      'neutral': ['nod', 'explaining']
    };

    const gestureTypes = emotionGestureMap[emotion.toLowerCase()] || ['nod'];
    const selectedType = gestureTypes[Math.floor(Math.random() * gestureTypes.length)];
    const gesture = this._gestureDatabase().get(selectedType);

    if (!gesture) return null;

    // Adapt intensity
    const adaptedGesture = {
      ...gesture,
      intensity: intensity > 0.7 ? 'strong' : intensity > 0.4 ? 'moderate' : 'subtle'
    };

    return {
      gesture: adaptedGesture,
      startTime: 0,
      confidence: intensity,
      reason: `Emotion-based: ${emotion}`,
      adaptations: [{
        type: 'intensity',
        reason: `Adapted for ${emotion} intensity`,
        modification: { originalIntensity: gesture.intensity, newIntensity: adaptedGesture.intensity }
      }]
    };
  }

  /**
   * Generate contextual idle gestures
   */
  generateIdleGestures(
    context: {
      emotion?: string;
      energy?: number; // 0-1
      personality?: Record<string, number>;
    } = {}
  ): GeneratedGesture[] {
    const energy = context.energy || 0.3;
    const personality = { ...this._personalityTraits(), ...context.personality };
    
    const idleGestureTypes: GestureType[] = ['thinking', 'nod', 'explaining'];
    
    // Add more gestures based on energy and personality
    if (energy > 0.6) {
      idleGestureTypes.push('emphasizing', 'wave');
    }
    
    if (personality.expressiveness > 0.6) {
      idleGestureTypes.push('shrug', 'point');
    }

    const selectedType = idleGestureTypes[Math.floor(Math.random() * idleGestureTypes.length)];
    const gesture = this._gestureDatabase().get(selectedType);

    if (!gesture) return [];

    return [{
      gesture: {
        ...gesture,
        duration: gesture.duration * (0.5 + energy * 0.5), // Vary duration with energy
        intensity: energy > 0.7 ? 'strong' : energy > 0.4 ? 'moderate' : 'subtle'
      },
      startTime: 0,
      confidence: 0.6,
      reason: 'Idle animation',
      adaptations: []
    }];
  }

  /**
   * Get gesture definition by type
   */
  getGestureDefinition(type: GestureType): GestureDefinition | null {
    return this._gestureDatabase().get(type) || null;
  }

  /**
   * Add custom gesture definition
   */
  addCustomGesture(gesture: GestureDefinition): void {
    this._gestureDatabase.update(db => {
      const newDb = new Map(db);
      newDb.set(gesture.type, gesture);
      return newDb;
    });
  }

  /**
   * Analyze text for context
   */
  private analyzeText(text: string, speakingStyle?: string): TextAnalysisContext {
    const words = text.toLowerCase().split(/\s+/);
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    
    // Simple emotion detection based on keywords
    const emotions = this.detectEmotionsInText(text);
    
    // Find emphasis words (all caps, repeated punctuation, etc.)
    const emphasisWords = this.findEmphasisWords(text);
    
    // Categorize words
    const questionWords = words.filter(w => ['what', 'when', 'where', 'why', 'how', 'who'].includes(w));
    const actionWords = words.filter(w => this.isActionWord(w));
    const descriptiveWords = words.filter(w => this.isDescriptiveWord(w));
    
    // Calculate sentiment
    const sentiment = this.calculateSentiment(text);
    
    // Extract topics (simplified)
    const topics = this.extractTopics(text);

    return {
      words,
      sentences,
      emotions,
      emphasisWords,
      questionWords,
      actionWords,
      descriptiveWords,
      sentiment,
      topics,
      speakingStyle: speakingStyle || 'neutral' as any
    };
  }

  /**
   * Estimate speech duration from text
   */
  private estimateSpeechDuration(text: string): number {
    const words = text.split(/\s+/).length;
    const averageWPM = 150; // Words per minute
    return (words / averageWPM) * 60 * 1000; // Convert to milliseconds
  }

  /**
   * Check if gesture rule should be applied
   */
  private shouldApplyRule(
    rule: GestureRule,
    context: TextAnalysisContext,
    position: number,
    existingGestures: GeneratedGesture[]
  ): boolean {
    // Check cooldown
    if (rule.cooldown) {
      const recentGestures = this._recentGestures() || [];
      const recentTime = Date.now() - rule.cooldown;
      if (recentGestures.some(g => g.time > recentTime)) {
        return false;
      }
    }

    // Check minimum distance from other gestures
    const currentTime = position * 1000; // Approximate time
    const tooClose = existingGestures.some(g => 
      Math.abs(g.startTime - currentTime) < 1000 // 1 second minimum
    );
    
    if (tooClose) return false;

    // Apply rule condition
    return rule.condition(context, position);
  }

  /**
   * Select best gesture from available types
   */
  private selectBestGesture(
    gestureTypes: GestureType[],
    context: TextAnalysisContext,
    currentTime: number
  ): GestureType {
    // Score each gesture based on context
    const scores = gestureTypes.map(type => {
      const gesture = this._gestureDatabase().get(type);
      if (!gesture) return { type, score: 0 };

      let score = 1.0;
      
      // Adjust for cultural context
      if (gesture.culturalContext) {
        const culturalMatch = gesture.culturalContext.some(c => 
          this._culturalContext().includes(c)
        );
        score *= culturalMatch ? 1.2 : 0.8;
      }

      // Adjust for emotional context
      if (gesture.emotionalContext && context.emotions.length > 0) {
        const emotionalMatch = gesture.emotionalContext.some(e =>
          context.emotions.some(ce => ce.emotion === e)
        );
        score *= emotionalMatch ? 1.3 : 0.9;
      }

      // Adjust for speaking style
      if (context.speakingStyle === 'formal' && gesture.category === 'emotional') {
        score *= 0.7;
      } else if (context.speakingStyle === 'enthusiastic' && gesture.intensity === 'subtle') {
        score *= 0.8;
      }

      return { type, score };
    });

    // Select highest scoring gesture
    const best = scores.reduce((best, current) => 
      current.score > best.score ? current : best
    );

    return best.type;
  }

  /**
   * Adapt gesture to current context
   */
  private adaptGestureToContext(
    gesture: GestureDefinition,
    context: TextAnalysisContext
  ): GestureDefinition {
    let adapted = { ...gesture };
    
    // Adapt intensity based on sentiment and speaking style
    if (context.sentiment > 0.5 || context.speakingStyle === 'enthusiastic') {
      adapted.intensity = 'strong';
    } else if (context.sentiment < -0.3 || context.speakingStyle === 'formal') {
      adapted.intensity = 'subtle';
    }

    // Adapt duration based on speaking style
    if (context.speakingStyle === 'calm') {
      adapted.duration *= 1.3;
    } else if (context.speakingStyle === 'enthusiastic') {
      adapted.duration *= 0.8;
    }

    return adapted;
  }

  /**
   * Optimize gesture sequence for natural flow
   */
  private optimizeGestureSequence(gestures: GeneratedGesture[]): GeneratedGesture[] {
    // Sort by start time
    gestures.sort((a, b) => a.startTime - b.startTime);

    // Remove overlapping gestures (keep higher confidence)
    const optimized: GeneratedGesture[] = [];
    
    for (const gesture of gestures) {
      const overlapping = optimized.find(g => 
        Math.abs(g.startTime - gesture.startTime) < g.gesture.duration
      );

      if (overlapping) {
        // Keep gesture with higher confidence
        if (gesture.confidence > overlapping.confidence) {
          const index = optimized.indexOf(overlapping);
          optimized[index] = gesture;
        }
      } else {
        optimized.push(gesture);
      }
    }

    return optimized;
  }

  /**
   * Initialize gesture database with predefined gestures
   */
  private initializeGestureDatabase(): void {
    const gestures: GestureDefinition[] = [
      {
        id: 'wave_basic',
        name: 'Basic Wave',
        type: 'wave',
        category: 'communicative',
        duration: 2000,
        intensity: 'moderate',
        keyframes: [
          { time: 0, bodyPart: 'right_hand', position: { x: 0, y: 0, z: 0 } },
          { time: 0.2, bodyPart: 'right_hand', position: { x: 0.3, y: 0.5, z: 0 }, easing: 'ease-out' },
          { time: 0.4, bodyPart: 'right_hand', position: { x: 0.2, y: 0.5, z: 0 } },
          { time: 0.6, bodyPart: 'right_hand', position: { x: 0.3, y: 0.5, z: 0 } },
          { time: 0.8, bodyPart: 'right_hand', position: { x: 0.2, y: 0.5, z: 0 } },
          { time: 1, bodyPart: 'right_hand', position: { x: 0, y: 0, z: 0 }, easing: 'ease-in' }
        ],
        description: 'A friendly wave gesture',
        culturalContext: ['western', 'universal'],
        emotionalContext: ['happy', 'friendly', 'greeting']
      },
      
      {
        id: 'nod_agreement',
        name: 'Agreeing Nod',
        type: 'nod',
        category: 'communicative',
        duration: 1500,
        intensity: 'subtle',
        keyframes: [
          { time: 0, bodyPart: 'head', rotation: { x: 0, y: 0, z: 0 } },
          { time: 0.3, bodyPart: 'head', rotation: { x: 15, y: 0, z: 0 }, easing: 'ease-out' },
          { time: 0.7, bodyPart: 'head', rotation: { x: -5, y: 0, z: 0 } },
          { time: 1, bodyPart: 'head', rotation: { x: 0, y: 0, z: 0 }, easing: 'ease-in' }
        ],
        description: 'A subtle nod indicating agreement',
        culturalContext: ['universal'],
        emotionalContext: ['agreement', 'understanding', 'positive']
      },

      {
        id: 'point_direction',
        name: 'Pointing',
        type: 'point',
        category: 'descriptive',
        duration: 2500,
        intensity: 'moderate',
        keyframes: [
          { time: 0, bodyPart: 'right_hand', position: { x: 0, y: 0, z: 0 } },
          { time: 0.3, bodyPart: 'right_hand', position: { x: 0.4, y: 0.3, z: 0.2 }, easing: 'ease-out' },
          { time: 0.8, bodyPart: 'right_hand', position: { x: 0.4, y: 0.3, z: 0.2 } },
          { time: 1, bodyPart: 'right_hand', position: { x: 0, y: 0, z: 0 }, easing: 'ease-in' }
        ],
        description: 'Pointing to indicate direction or emphasis',
        culturalContext: ['western', 'neutral'],
        emotionalContext: ['explanatory', 'directive']
      },

      {
        id: 'shrug_uncertainty',
        name: 'Shoulder Shrug',
        type: 'shrug',
        category: 'emotional',
        duration: 2000,
        intensity: 'moderate',
        keyframes: [
          { time: 0, bodyPart: 'shoulders', position: { x: 0, y: 0, z: 0 } },
          { time: 0.4, bodyPart: 'shoulders', position: { x: 0, y: 0.2, z: 0 }, easing: 'ease-out' },
          { time: 0.6, bodyPart: 'shoulders', position: { x: 0, y: 0.2, z: 0 } },
          { time: 1, bodyPart: 'shoulders', position: { x: 0, y: 0, z: 0 }, easing: 'ease-in' }
        ],
        description: 'Expressing uncertainty or indifference',
        culturalContext: ['western', 'universal'],
        emotionalContext: ['uncertain', 'confused', 'indifferent']
      },

      {
        id: 'thinking_pose',
        name: 'Thinking Gesture',
        type: 'thinking',
        category: 'descriptive',
        duration: 3000,
        intensity: 'subtle',
        keyframes: [
          { time: 0, bodyPart: 'right_hand', position: { x: 0, y: 0, z: 0 } },
          { time: 0.3, bodyPart: 'right_hand', position: { x: 0.1, y: 0.6, z: 0.3 }, easing: 'ease-out' },
          { time: 0.8, bodyPart: 'right_hand', position: { x: 0.1, y: 0.6, z: 0.3 } },
          { time: 1, bodyPart: 'right_hand', position: { x: 0, y: 0, z: 0 }, easing: 'ease-in' }
        ],
        description: 'Hand to chin thinking pose',
        culturalContext: ['universal'],
        emotionalContext: ['thoughtful', 'contemplative', 'considering']
      }
    ];

    const gestureMap = new Map<GestureType, GestureDefinition>();
    gestures.forEach(g => gestureMap.set(g.type, g));
    this._gestureDatabase.set(gestureMap);
  }

  /**
   * Initialize gesture generation rules
   */
  private initializeGestureRules(): void {
    const rules: GestureRule[] = [
      {
        id: 'greeting_detection',
        name: 'Greeting Detection',
        condition: (context, position) => {
          const greetingWords = ['hello', 'hi', 'hey', 'greetings', 'welcome'];
          return position < context.words.length * 0.2 && // First 20% of speech
                 context.words.some(w => greetingWords.includes(w));
        },
        gestureSelector: () => ['wave', 'nod'],
        confidence: 0.8,
        priority: 9,
        cooldown: 5000
      },

      {
        id: 'question_detection',
        name: 'Question Detection',
        condition: (context, position) => {
          return context.questionWords.length > 0 &&
                 position >= context.words.findIndex(w => context.questionWords.includes(w)) - 2;
        },
        gestureSelector: (context) => 
          context.questionWords.includes('what') || context.questionWords.includes('how') 
            ? ['thinking', 'shrug'] : ['point', 'thinking'],
        confidence: 0.7,
        priority: 7
      },

      {
        id: 'emphasis_detection',
        name: 'Emphasis Detection',
        condition: (context, position) => {
          return context.emphasisWords.some(e => 
            Math.abs(e.position - position) <= 2 // Within 2 words
          );
        },
        gestureSelector: () => ['emphasizing', 'point'],
        confidence: 0.6,
        priority: 6
      },

      {
        id: 'action_word_detection',
        name: 'Action Word Detection',
        condition: (context, position) => {
          return context.actionWords.length > 0 &&
                 context.actionWords.includes(context.words[position]);
        },
        gestureSelector: (context) => {
          const word = context.words[context.actionWords.findIndex(w => 
            context.actionWords.includes(w)
          )];
          
          if (['stop', 'wait', 'halt'].includes(word)) return ['stop'];
          if (['come', 'here', 'approach'].includes(word)) return ['come-here'];
          if (['go', 'leave', 'away'].includes(word)) return ['go-away'];
          
          return ['explaining', 'point'];
        },
        confidence: 0.5,
        priority: 5
      },

      {
        id: 'emotional_context',
        name: 'Emotional Context',
        condition: (context, position) => {
          return context.emotions.some(e => 
            Math.abs(e.position - position / context.words.length) <= 0.1 // Within 10% of text
          );
        },
        gestureSelector: (context) => {
          const emotion = context.emotions[0]?.emotion;
          const emotionGestures: Record<string, GestureType[]> = {
            'happy': ['thumbs-up', 'clap'],
            'sad': ['shrug'],
            'excited': ['emphasizing', 'clap'],
            'confused': ['thinking', 'shrug']
          };
          
          return emotionGestures[emotion] || ['nod'];
        },
        confidence: 0.4,
        priority: 4
      }
    ];

    this._gestureRules.set(rules);
  }

  // Helper methods for text analysis
  private detectEmotionsInText(text: string): Array<{ emotion: string; confidence: number; position: number }> {
    const emotionKeywords: Record<string, string[]> = {
      'happy': ['happy', 'joy', 'great', 'wonderful', 'amazing', 'excited'],
      'sad': ['sad', 'terrible', 'awful', 'disappointed', 'sorry'],
      'angry': ['angry', 'mad', 'furious', 'outraged', 'annoyed'],
      'surprised': ['surprised', 'wow', 'amazing', 'incredible', 'unbelievable'],
      'confused': ['confused', 'unclear', 'what', 'how', 'why']
    };

    const emotions: Array<{ emotion: string; confidence: number; position: number }> = [];
    const words = text.toLowerCase().split(/\s+/);

    Object.entries(emotionKeywords).forEach(([emotion, keywords]) => {
      keywords.forEach(keyword => {
        const index = words.indexOf(keyword);
        if (index !== -1) {
          emotions.push({
            emotion,
            confidence: 0.7,
            position: index / words.length
          });
        }
      });
    });

    return emotions;
  }

  private findEmphasisWords(text: string): Array<{ word: string; position: number; type: string }> {
    const words = text.split(/\s+/);
    const emphasisWords: Array<{ word: string; position: number; type: string }> = [];

    words.forEach((word, index) => {
      if (word.toUpperCase() === word && word.length > 2) {
        emphasisWords.push({ word, position: index, type: 'caps' });
      }
      if (word.includes('!') && word.length > 1) {
        emphasisWords.push({ word, position: index, type: 'exclamation' });
      }
    });

    return emphasisWords;
  }

  private isActionWord(word: string): boolean {
    const actionWords = [
      'go', 'come', 'stop', 'start', 'move', 'run', 'walk', 'jump', 'sit', 'stand',
      'take', 'give', 'put', 'get', 'make', 'do', 'create', 'build', 'show', 'tell'
    ];
    return actionWords.includes(word);
  }

  private isDescriptiveWord(word: string): boolean {
    const descriptiveWords = [
      'big', 'small', 'large', 'tiny', 'huge', 'beautiful', 'ugly', 'good', 'bad',
      'fast', 'slow', 'hot', 'cold', 'new', 'old', 'young', 'strong', 'weak'
    ];
    return descriptiveWords.includes(word);
  }

  private calculateSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'excellent', 'wonderful', 'amazing', 'happy', 'love'];
    const negativeWords = ['bad', 'terrible', 'awful', 'hate', 'sad', 'angry', 'disappointed'];
    
    const words = text.toLowerCase().split(/\s+/);
    
    let score = 0;
    words.forEach(word => {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    });

    return Math.max(-1, Math.min(1, score / words.length * 10));
  }

  private extractTopics(text: string): string[] {
    // Simplified topic extraction
    const topicKeywords: Record<string, string[]> = {
      'business': ['business', 'company', 'market', 'sales', 'profit', 'customer'],
      'technology': ['technology', 'computer', 'software', 'digital', 'internet'],
      'health': ['health', 'medical', 'doctor', 'medicine', 'treatment'],
      'education': ['education', 'school', 'learn', 'teach', 'student', 'university']
    };

    const words = text.toLowerCase().split(/\s+/);
    const topics: string[] = [];

    Object.entries(topicKeywords).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => words.includes(keyword))) {
        topics.push(topic);
      }
    });

    return topics;
  }
}