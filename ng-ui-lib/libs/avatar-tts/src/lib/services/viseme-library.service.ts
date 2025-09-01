import { Injectable, signal, computed } from '@angular/core';
import {
  VisemeLibraryDefinition,
  Viseme,
  MouthShape,
  VisemeTransition,
  VisemeLibrary,
  TransitionCurve
} from '../interfaces/lip-sync.interface';

/**
 * Comprehensive Viseme Library Service
 * Manages multiple viseme libraries (Preston Blair, Disney, IPA-based, Custom)
 */
@Injectable({
  providedIn: 'root'
})
export class VisemeLibraryService {
  private readonly _currentLibrary = signal<VisemeLibraryDefinition | null>(null);
  private readonly _availableLibraries = signal<VisemeLibraryDefinition[]>([]);
  private readonly _customLibraries = signal<VisemeLibraryDefinition[]>([]);
  
  // Computed signals
  readonly currentLibrary = this._currentLibrary.asReadonly();
  readonly availableLibraries = this._availableLibraries.asReadonly();
  readonly customLibraries = this._customLibraries.asReadonly();
  
  // Current library visemes and mappings
  readonly currentVisemes = computed(() => 
    this._currentLibrary()?.visemes || []
  );
  
  readonly phonemeMapping = computed(() => 
    this._currentLibrary()?.phonemeMapping || {}
  );
  
  constructor() {
    this.initializeBuiltInLibraries();
  }
  
  /**
   * Initialize built-in viseme libraries
   */
  private initializeBuiltInLibraries(): void {
    const libraries = [
      this.createPrestonBlairLibrary(),
      this.createDisneyLibrary(),
      this.createIPALibrary(),
      this.createOculusLibrary()
    ];
    
    this._availableLibraries.set(libraries);
    this._currentLibrary.set(libraries[0]); // Default to Preston Blair
  }
  
  /**
   * Set active viseme library
   */
  setLibrary(libraryName: string): void {
    const library = this._availableLibraries().find(lib => lib.name === libraryName) ||
                   this._customLibraries().find(lib => lib.name === libraryName);
    
    if (library) {
      this._currentLibrary.set(library);
    } else {
      throw new Error(`Viseme library not found: ${libraryName}`);
    }
  }
  
  /**
   * Get viseme by ID
   */
  getViseme(id: string): Viseme | null {
    const visemes = this.currentVisemes();
    return visemes.find(v => v.id === id) || null;
  }
  
  /**
   * Get viseme for phoneme
   */
  getVisemeForPhoneme(phoneme: string): Viseme | null {
    const mapping = this.phonemeMapping();
    const visemeId = mapping[phoneme.toLowerCase()];
    return visemeId ? this.getViseme(visemeId) : null;
  }
  
  /**
   * Get mouth shape for viseme
   */
  getMouthShape(visemeId: string): MouthShape {
    const viseme = this.getViseme(visemeId);
    return viseme ? viseme.mouthShape : this.getNeutralMouthShape();
  }
  
  /**
   * Get interpolated mouth shape between two visemes
   */
  getInterpolatedMouthShape(
    fromVisemeId: string,
    toVisemeId: string,
    t: number,
    curve: TransitionCurve = 'easeInOut'
  ): MouthShape {
    const fromShape = this.getMouthShape(fromVisemeId);
    const toShape = this.getMouthShape(toVisemeId);
    
    const easedT = this.applyCurve(t, curve);
    
    return {
      jawOpen: this.interpolate(fromShape.jawOpen, toShape.jawOpen, easedT),
      lipWidth: this.interpolate(fromShape.lipWidth, toShape.lipWidth, easedT),
      lipHeight: this.interpolate(fromShape.lipHeight, toShape.lipHeight, easedT),
      lipProtrusion: this.interpolate(fromShape.lipProtrusion, toShape.lipProtrusion, easedT),
      upperLipRaise: this.interpolate(fromShape.upperLipRaise, toShape.upperLipRaise, easedT),
      lowerLipDepress: this.interpolate(fromShape.lowerLipDepress, toShape.lowerLipDepress, easedT),
      cornerLipPull: this.interpolate(fromShape.cornerLipPull, toShape.cornerLipPull, easedT),
      tonguePosition: this.interpolate(fromShape.tonguePosition, toShape.tonguePosition, easedT),
      teethVisibility: this.interpolate(fromShape.teethVisibility, toShape.teethVisibility, easedT),
      customShapes: this.interpolateCustomShapes(fromShape.customShapes, toShape.customShapes, easedT)
    };
  }
  
  /**
   * Blend multiple mouth shapes with weights
   */
  blendMouthShapes(shapes: Array<{ shape: MouthShape; weight: number }>): MouthShape {
    if (shapes.length === 0) return this.getNeutralMouthShape();
    if (shapes.length === 1) return shapes[0].shape;
    
    const result = this.getNeutralMouthShape();
    let totalWeight = 0;
    
    shapes.forEach(({ shape, weight }) => {
      totalWeight += weight;
      result.jawOpen += shape.jawOpen * weight;
      result.lipWidth += shape.lipWidth * weight;
      result.lipHeight += shape.lipHeight * weight;
      result.lipProtrusion += shape.lipProtrusion * weight;
      result.upperLipRaise += shape.upperLipRaise * weight;
      result.lowerLipDepress += shape.lowerLipDepress * weight;
      result.cornerLipPull += shape.cornerLipPull * weight;
      result.tonguePosition += shape.tonguePosition * weight;
      result.teethVisibility += shape.teethVisibility * weight;
      
      if (shape.customShapes) {
        result.customShapes = result.customShapes || {};
        Object.entries(shape.customShapes).forEach(([key, value]) => {
          result.customShapes![key] = (result.customShapes![key] || 0) + value * weight;
        });
      }
    });
    
    if (totalWeight > 0) {
      result.jawOpen /= totalWeight;
      result.lipWidth /= totalWeight;
      result.lipHeight /= totalWeight;
      result.lipProtrusion /= totalWeight;
      result.upperLipRaise /= totalWeight;
      result.lowerLipDepress /= totalWeight;
      result.cornerLipPull /= totalWeight;
      result.tonguePosition /= totalWeight;
      result.teethVisibility /= totalWeight;
      
      if (result.customShapes) {
        Object.keys(result.customShapes).forEach(key => {
          result.customShapes![key] /= totalWeight;
        });
      }
    }
    
    return result;
  }
  
  /**
   * Add custom viseme library
   */
  addCustomLibrary(library: VisemeLibraryDefinition): void {
    this.validateLibrary(library);
    
    const customLibraries = [...this._customLibraries()];
    const existingIndex = customLibraries.findIndex(lib => lib.name === library.name);
    
    if (existingIndex >= 0) {
      customLibraries[existingIndex] = library;
    } else {
      customLibraries.push(library);
    }
    
    this._customLibraries.set(customLibraries);
  }
  
  /**
   * Remove custom library
   */
  removeCustomLibrary(libraryName: string): void {
    const customLibraries = this._customLibraries().filter(lib => lib.name !== libraryName);
    this._customLibraries.set(customLibraries);
    
    // Switch to default if current library was removed
    if (this._currentLibrary()?.name === libraryName) {
      this._currentLibrary.set(this._availableLibraries()[0]);
    }
  }
  
  /**
   * Export library as JSON
   */
  exportLibrary(libraryName: string): string {
    const library = [...this._availableLibraries(), ...this._customLibraries()]
      .find(lib => lib.name === libraryName);
    
    if (!library) {
      throw new Error(`Library not found: ${libraryName}`);
    }
    
    return JSON.stringify(library, null, 2);
  }
  
  /**
   * Import library from JSON
   */
  importLibrary(jsonData: string): void {
    try {
      const library: VisemeLibraryDefinition = JSON.parse(jsonData);
      this.validateLibrary(library);
      this.addCustomLibrary(library);
    } catch (error) {
      throw new Error(`Failed to import library: ${error}`);
    }
  }
  
  // Private methods
  
  private getNeutralMouthShape(): MouthShape {
    return {
      jawOpen: 0.1,
      lipWidth: 0.5,
      lipHeight: 0.3,
      lipProtrusion: 0.0,
      upperLipRaise: 0.0,
      lowerLipDepress: 0.0,
      cornerLipPull: 0.0,
      tonguePosition: 0.5,
      teethVisibility: 0.1
    };
  }
  
  private interpolate(from: number, to: number, t: number): number {
    return from + (to - from) * t;
  }
  
  private interpolateCustomShapes(
    from?: Record<string, number>,
    to?: Record<string, number>,
    t: number
  ): Record<string, number> | undefined {
    if (!from && !to) return undefined;
    if (!from) return { ...to! };
    if (!to) return { ...from };
    
    const result: Record<string, number> = {};
    const allKeys = new Set([...Object.keys(from), ...Object.keys(to)]);
    
    allKeys.forEach(key => {
      const fromValue = from[key] || 0;
      const toValue = to[key] || 0;
      result[key] = this.interpolate(fromValue, toValue, t);
    });
    
    return result;
  }
  
  private applyCurve(t: number, curve: TransitionCurve): number {
    switch (curve) {
      case 'linear':
        return t;
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return 1 - (1 - t) * (1 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
      case 'cubic':
        return t * t * t;
      case 'bezier':
        // Cubic bezier approximation (0.25, 0.46, 0.45, 0.94)
        return t * t * (3 - 2 * t);
      default:
        return t;
    }
  }
  
  private validateLibrary(library: VisemeLibraryDefinition): void {
    if (!library.name) throw new Error('Library name is required');
    if (!library.version) throw new Error('Library version is required');
    if (!library.visemes || library.visemes.length === 0) {
      throw new Error('Library must contain at least one viseme');
    }
    if (!library.phonemeMapping) throw new Error('Phoneme mapping is required');
    
    // Validate visemes
    library.visemes.forEach(viseme => {
      if (!viseme.id) throw new Error('Viseme ID is required');
      if (!viseme.name) throw new Error('Viseme name is required');
      if (!viseme.mouthShape) throw new Error('Viseme mouth shape is required');
      this.validateMouthShape(viseme.mouthShape);
    });
  }
  
  private validateMouthShape(shape: MouthShape): void {
    const requiredParams = [
      'jawOpen', 'lipWidth', 'lipHeight', 'lipProtrusion',
      'upperLipRaise', 'lowerLipDepress', 'cornerLipPull',
      'tonguePosition', 'teethVisibility'
    ];
    
    requiredParams.forEach(param => {
      const value = (shape as any)[param];
      if (typeof value !== 'number' || value < 0 || value > 1) {
        throw new Error(`Invalid mouth shape parameter: ${param} must be between 0 and 1`);
      }
    });
  }
  
  // Built-in library creators
  
  private createPrestonBlairLibrary(): VisemeLibraryDefinition {
    const defaultTransition: VisemeTransition = {
      easeIn: 50,
      hold: 100,
      easeOut: 50,
      curve: 'easeInOut',
      blendWeight: 1.0
    };
    
    return {
      name: 'Preston Blair',
      version: '1.0',
      languages: ['en-US', 'en-GB'],
      visemes: [
        this.createViseme('neutral', 'Neutral/Rest', ['sil', ''], 
          { jawOpen: 0.1, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.1 }),
        
        // Vowels (8 visemes)
        this.createViseme('aa', 'Open back vowel (father)', ['aa', 'ah', 'ao'], 
          { jawOpen: 0.8, lipWidth: 0.6, lipHeight: 0.8, lipProtrusion: 0.0, upperLipRaise: 0.2, lowerLipDepress: 0.3, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.9 }),
        this.createViseme('ae', 'Near-open front vowel (cat)', ['ae', 'eh'], 
          { jawOpen: 0.6, lipWidth: 0.7, lipHeight: 0.6, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.2, cornerLipPull: 0.2, tonguePosition: 0.6, teethVisibility: 0.7 }),
        this.createViseme('er', 'Mid central vowel (bird)', ['er', 'ax'], 
          { jawOpen: 0.3, lipWidth: 0.4, lipHeight: 0.4, lipProtrusion: 0.2, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.3 }),
        this.createViseme('ee', 'Close front vowel (see)', ['iy', 'ih'], 
          { jawOpen: 0.2, lipWidth: 0.8, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.0, cornerLipPull: 0.7, tonguePosition: 0.8, teethVisibility: 0.6 }),
        this.createViseme('ih', 'Near-close front vowel (sit)', ['ih', 'ix'], 
          { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.4, tonguePosition: 0.7, teethVisibility: 0.5 }),
        this.createViseme('oh', 'Close-mid back vowel (go)', ['ow', 'oy'], 
          { jawOpen: 0.4, lipWidth: 0.3, lipHeight: 0.6, lipProtrusion: 0.6, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.2 }),
        this.createViseme('oo', 'Close back rounded vowel (boot)', ['uw', 'uh'], 
          { jawOpen: 0.2, lipWidth: 0.1, lipHeight: 0.4, lipProtrusion: 1.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.0 }),
        this.createViseme('ey', 'Close-mid front vowel (day)', ['ey'], 
          { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.3, tonguePosition: 0.6, teethVisibility: 0.4 }),
          
        // Consonants (13 visemes)
        this.createViseme('bmp', 'Bilabial stops (B, M, P)', ['b', 'm', 'p'], 
          { jawOpen: 0.0, lipWidth: 0.4, lipHeight: 0.1, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('fv', 'Labiodental fricatives (F, V)', ['f', 'v'], 
          { jawOpen: 0.2, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.6, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.8 }),
        this.createViseme('th', 'Dental fricatives (TH)', ['th', 'dh'], 
          { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.0, cornerLipPull: 0.2, tonguePosition: 0.9, teethVisibility: 0.7 }),
        this.createViseme('tdl', 'Alveolar consonants (T, D, L, N)', ['t', 'd', 'l', 'n'], 
          { jawOpen: 0.3, lipWidth: 0.5, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.1, tonguePosition: 0.8, teethVisibility: 0.5 }),
        this.createViseme('sz', 'Sibilant fricatives (S, Z)', ['s', 'z'], 
          { jawOpen: 0.1, lipWidth: 0.6, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.3, tonguePosition: 0.7, teethVisibility: 0.8 }),
        this.createViseme('sh', 'Postalveolar consonants (SH, CH, J)', ['sh', 'zh', 'ch', 'jh'], 
          { jawOpen: 0.2, lipWidth: 0.3, lipHeight: 0.5, lipProtrusion: 0.6, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.6, teethVisibility: 0.3 }),
        this.createViseme('kg', 'Velar consonants (K, G, NG)', ['k', 'g', 'ng'], 
          { jawOpen: 0.4, lipWidth: 0.5, lipHeight: 0.5, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.1, teethVisibility: 0.4 }),
        this.createViseme('r', 'Liquid R', ['r'], 
          { jawOpen: 0.3, lipWidth: 0.4, lipHeight: 0.4, lipProtrusion: 0.3, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.6, teethVisibility: 0.2 }),
        this.createViseme('w', 'Semivowel W', ['w'], 
          { jawOpen: 0.2, lipWidth: 0.2, lipHeight: 0.4, lipProtrusion: 0.8, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.1 }),
        this.createViseme('y', 'Semivowel Y', ['y'], 
          { jawOpen: 0.2, lipWidth: 0.7, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.5, tonguePosition: 0.8, teethVisibility: 0.4 }),
        this.createViseme('h', 'Glottal fricative H', ['h'], 
          { jawOpen: 0.4, lipWidth: 0.5, lipHeight: 0.5, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.4, teethVisibility: 0.3 })
      ],
      phonemeMapping: this.createPrestonBlairMapping(),
      defaultTransition,
      metadata: {
        author: 'NgUI Avatar TTS',
        description: 'Preston Blair inspired viseme library with 21 visemes for comprehensive lip sync',
        license: 'MIT',
        references: ['Preston Blair Animation Manual', 'Facial Animation Standards']
      }
    };
  }
  
  private createDisneyLibrary(): VisemeLibraryDefinition {
    // Disney-style viseme library (simplified, fewer visemes)
    return {
      name: 'Disney',
      version: '1.0',
      languages: ['en-US'],
      visemes: [
        this.createViseme('rest', 'Rest position', ['sil'], 
          { jawOpen: 0.05, lipWidth: 0.5, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('a', 'A sound', ['aa', 'ah'], 
          { jawOpen: 0.9, lipWidth: 0.7, lipHeight: 0.9, lipProtrusion: 0.0, upperLipRaise: 0.3, lowerLipDepress: 0.4, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 1.0 }),
        this.createViseme('e', 'E sound', ['eh', 'ae'], 
          { jawOpen: 0.5, lipWidth: 0.8, lipHeight: 0.5, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.1, cornerLipPull: 0.4, tonguePosition: 0.7, teethVisibility: 0.6 }),
        this.createViseme('i', 'I sound', ['iy', 'ih'], 
          { jawOpen: 0.1, lipWidth: 0.9, lipHeight: 0.1, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.8, tonguePosition: 0.9, teethVisibility: 0.5 }),
        this.createViseme('o', 'O sound', ['ow', 'ao'], 
          { jawOpen: 0.3, lipWidth: 0.2, lipHeight: 0.7, lipProtrusion: 0.7, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.1 }),
        this.createViseme('u', 'U sound', ['uw'], 
          { jawOpen: 0.1, lipWidth: 0.1, lipHeight: 0.3, lipProtrusion: 1.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.1, teethVisibility: 0.0 }),
        this.createViseme('mbp', 'M, B, P sounds', ['m', 'b', 'p'], 
          { jawOpen: 0.0, lipWidth: 0.3, lipHeight: 0.0, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('fv', 'F, V sounds', ['f', 'v'], 
          { jawOpen: 0.1, lipWidth: 0.4, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.7, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.9 }),
        this.createViseme('th', 'TH sound', ['th', 'dh'], 
          { jawOpen: 0.2, lipWidth: 0.6, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.1, tonguePosition: 1.0, teethVisibility: 0.8 }),
        this.createViseme('l', 'L sound', ['l'], 
          { jawOpen: 0.2, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.9, teethVisibility: 0.4 }),
        this.createViseme('wq', 'W, Q sounds', ['w'], 
          { jawOpen: 0.1, lipWidth: 0.1, lipHeight: 0.3, lipProtrusion: 0.9, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.0 })
      ],
      phonemeMapping: this.createDisneyMapping(),
      defaultTransition: {
        easeIn: 40,
        hold: 80,
        easeOut: 40,
        curve: 'easeInOut',
        blendWeight: 1.0
      },
      metadata: {
        author: 'NgUI Avatar TTS',
        description: 'Disney-inspired simplified viseme library with 11 core visemes',
        license: 'MIT',
        references: ['Disney Animation Principles', 'Character Animation Standards']
      }
    };
  }
  
  private createIPALibrary(): VisemeLibraryDefinition {
    // IPA-based viseme library (more phonetically accurate)
    return {
      name: 'IPA-Based',
      version: '1.0',
      languages: ['en-US', 'en-GB', 'es', 'fr', 'de'],
      visemes: [
        // IPA vowels
        this.createViseme('ɑ', 'Open back unrounded', ['aa'], 
          { jawOpen: 0.9, lipWidth: 0.6, lipHeight: 0.9, lipProtrusion: 0.0, upperLipRaise: 0.3, lowerLipDepress: 0.4, cornerLipPull: 0.0, tonguePosition: 0.1, teethVisibility: 1.0 }),
        this.createViseme('æ', 'Near-open front unrounded', ['ae'], 
          { jawOpen: 0.7, lipWidth: 0.8, lipHeight: 0.7, lipProtrusion: 0.0, upperLipRaise: 0.2, lowerLipDepress: 0.3, cornerLipPull: 0.3, tonguePosition: 0.7, teethVisibility: 0.8 }),
        this.createViseme('ə', 'Mid central', ['ax'], 
          { jawOpen: 0.3, lipWidth: 0.5, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.3 }),
        this.createViseme('ɪ', 'Near-close near-front unrounded', ['ih'], 
          { jawOpen: 0.3, lipWidth: 0.7, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.4, tonguePosition: 0.8, teethVisibility: 0.5 }),
        this.createViseme('i', 'Close front unrounded', ['iy'], 
          { jawOpen: 0.2, lipWidth: 0.9, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.0, cornerLipPull: 0.8, tonguePosition: 0.9, teethVisibility: 0.6 }),
        this.createViseme('ɔ', 'Open-mid back rounded', ['ao'], 
          { jawOpen: 0.6, lipWidth: 0.3, lipHeight: 0.7, lipProtrusion: 0.5, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.3 }),
        this.createViseme('o', 'Close-mid back rounded', ['ow'], 
          { jawOpen: 0.4, lipWidth: 0.2, lipHeight: 0.6, lipProtrusion: 0.7, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.2 }),
        this.createViseme('ʊ', 'Near-close near-back rounded', ['uh'], 
          { jawOpen: 0.3, lipWidth: 0.3, lipHeight: 0.4, lipProtrusion: 0.6, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.1 }),
        this.createViseme('u', 'Close back rounded', ['uw'], 
          { jawOpen: 0.2, lipWidth: 0.1, lipHeight: 0.4, lipProtrusion: 1.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.1, teethVisibility: 0.0 }),
        
        // IPA consonants
        this.createViseme('p', 'Voiceless bilabial plosive', ['p'], 
          { jawOpen: 0.0, lipWidth: 0.4, lipHeight: 0.0, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('b', 'Voiced bilabial plosive', ['b'], 
          { jawOpen: 0.0, lipWidth: 0.4, lipHeight: 0.0, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('m', 'Bilabial nasal', ['m'], 
          { jawOpen: 0.0, lipWidth: 0.4, lipHeight: 0.0, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('f', 'Voiceless labiodental fricative', ['f'], 
          { jawOpen: 0.2, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.7, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.9 }),
        this.createViseme('v', 'Voiced labiodental fricative', ['v'], 
          { jawOpen: 0.2, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.7, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.9 }),
        this.createViseme('θ', 'Voiceless dental fricative', ['th'], 
          { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.0, cornerLipPull: 0.2, tonguePosition: 1.0, teethVisibility: 0.8 }),
        this.createViseme('s', 'Voiceless alveolar fricative', ['s'], 
          { jawOpen: 0.1, lipWidth: 0.6, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.3, tonguePosition: 0.8, teethVisibility: 0.8 }),
        this.createViseme('ʃ', 'Voiceless postalveolar fricative', ['sh'], 
          { jawOpen: 0.2, lipWidth: 0.3, lipHeight: 0.5, lipProtrusion: 0.6, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.7, teethVisibility: 0.3 }),
        this.createViseme('t', 'Voiceless alveolar plosive', ['t'], 
          { jawOpen: 0.3, lipWidth: 0.5, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.1, tonguePosition: 0.9, teethVisibility: 0.5 }),
        this.createViseme('k', 'Voiceless velar plosive', ['k'], 
          { jawOpen: 0.4, lipWidth: 0.5, lipHeight: 0.5, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.0, teethVisibility: 0.4 }),
        this.createViseme('l', 'Alveolar lateral approximant', ['l'], 
          { jawOpen: 0.3, lipWidth: 0.5, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.1, tonguePosition: 0.9, teethVisibility: 0.5 }),
        this.createViseme('ɹ', 'Alveolar approximant', ['r'], 
          { jawOpen: 0.3, lipWidth: 0.4, lipHeight: 0.4, lipProtrusion: 0.3, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.6, teethVisibility: 0.2 }),
        this.createViseme('w', 'Labial-velar approximant', ['w'], 
          { jawOpen: 0.2, lipWidth: 0.2, lipHeight: 0.4, lipProtrusion: 0.8, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.1 })
      ],
      phonemeMapping: this.createIPAMapping(),
      defaultTransition: {
        easeIn: 60,
        hold: 120,
        easeOut: 60,
        curve: 'cubic',
        blendWeight: 1.0
      },
      metadata: {
        author: 'NgUI Avatar TTS',
        description: 'IPA-based phonetically accurate viseme library with 22 visemes',
        license: 'MIT',
        references: ['International Phonetic Alphabet', 'Phonetic Speech Recognition Standards']
      }
    };
  }
  
  private createOculusLibrary(): VisemeLibraryDefinition {
    // Oculus Audio SDK compatible viseme library
    return {
      name: 'Oculus',
      version: '1.0',
      languages: ['en-US'],
      visemes: [
        this.createViseme('sil', 'Silence', ['sil'], 
          { jawOpen: 0.0, lipWidth: 0.5, lipHeight: 0.2, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('PP', 'p, b, m', ['p', 'b', 'm'], 
          { jawOpen: 0.0, lipWidth: 0.4, lipHeight: 0.0, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.0 }),
        this.createViseme('FF', 'f, v', ['f', 'v'], 
          { jawOpen: 0.2, lipWidth: 0.5, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.6, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.8 }),
        this.createViseme('TH', 'th, dh', ['th', 'dh'], 
          { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.0, cornerLipPull: 0.2, tonguePosition: 0.9, teethVisibility: 0.7 }),
        this.createViseme('DD', 't, d, n, l, s, z', ['t', 'd', 'n', 'l', 's', 'z'], 
          { jawOpen: 0.3, lipWidth: 0.5, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.2, tonguePosition: 0.8, teethVisibility: 0.6 }),
        this.createViseme('kk', 'k, g, ng, y, h', ['k', 'g', 'ng', 'y', 'h'], 
          { jawOpen: 0.4, lipWidth: 0.5, lipHeight: 0.5, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.4 }),
        this.createViseme('CH', 'sh, ch, j, zh', ['sh', 'ch', 'jh', 'zh'], 
          { jawOpen: 0.2, lipWidth: 0.3, lipHeight: 0.5, lipProtrusion: 0.6, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.6, teethVisibility: 0.3 }),
        this.createViseme('aa', 'ah', ['aa', 'ah'], 
          { jawOpen: 0.8, lipWidth: 0.6, lipHeight: 0.8, lipProtrusion: 0.0, upperLipRaise: 0.2, lowerLipDepress: 0.3, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.9 }),
        this.createViseme('ao', 'aw', ['ao', 'aw'], 
          { jawOpen: 0.6, lipWidth: 0.4, lipHeight: 0.7, lipProtrusion: 0.4, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.4 }),
        this.createViseme('uw', 'uw', ['uw'], 
          { jawOpen: 0.2, lipWidth: 0.1, lipHeight: 0.4, lipProtrusion: 1.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.2, teethVisibility: 0.0 }),
        this.createViseme('er', 'er', ['er'], 
          { jawOpen: 0.3, lipWidth: 0.4, lipHeight: 0.4, lipProtrusion: 0.2, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.5, teethVisibility: 0.3 }),
        this.createViseme('ih', 'ih', ['ih'], 
          { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.3, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.4, tonguePosition: 0.7, teethVisibility: 0.5 }),
        this.createViseme('ey', 'ey', ['ey'], 
          { jawOpen: 0.3, lipWidth: 0.6, lipHeight: 0.4, lipProtrusion: 0.0, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.3, tonguePosition: 0.6, teethVisibility: 0.4 }),
        this.createViseme('ae', 'ae', ['ae'], 
          { jawOpen: 0.6, lipWidth: 0.7, lipHeight: 0.6, lipProtrusion: 0.0, upperLipRaise: 0.1, lowerLipDepress: 0.2, cornerLipPull: 0.2, tonguePosition: 0.6, teethVisibility: 0.7 }),
        this.createViseme('ow', 'ow', ['ow'], 
          { jawOpen: 0.4, lipWidth: 0.3, lipHeight: 0.6, lipProtrusion: 0.6, upperLipRaise: 0.0, lowerLipDepress: 0.0, cornerLipPull: 0.0, tonguePosition: 0.3, teethVisibility: 0.2 })
      ],
      phonemeMapping: this.createOculusMapping(),
      defaultTransition: {
        easeIn: 33,
        hold: 67,
        easeOut: 33,
        curve: 'linear',
        blendWeight: 1.0
      },
      metadata: {
        author: 'NgUI Avatar TTS',
        description: 'Oculus Audio SDK compatible viseme library with 15 visemes',
        license: 'MIT',
        references: ['Oculus Audio SDK Documentation', 'VR Lip Sync Standards']
      }
    };
  }
  
  private createViseme(id: string, name: string, phonemes: string[], mouthShape: MouthShape): Viseme {
    return {
      id,
      name,
      phonemes,
      mouthShape,
      transition: {
        easeIn: 50,
        hold: 100,
        easeOut: 50,
        curve: 'easeInOut',
        blendWeight: 1.0
      }
    };
  }
  
  // Phoneme mapping creators
  
  private createPrestonBlairMapping(): Record<string, string> {
    return {
      'sil': 'neutral', '': 'neutral',
      'aa': 'aa', 'ah': 'aa', 'ao': 'aa',
      'ae': 'ae', 'eh': 'ae',
      'er': 'er', 'ax': 'er',
      'iy': 'ee', 'ih': 'ih', 'ix': 'ih',
      'ey': 'ey',
      'ow': 'oh', 'oy': 'oh',
      'uw': 'oo', 'uh': 'oo',
      'b': 'bmp', 'm': 'bmp', 'p': 'bmp',
      'f': 'fv', 'v': 'fv',
      'th': 'th', 'dh': 'th',
      't': 'tdl', 'd': 'tdl', 'l': 'tdl', 'n': 'tdl',
      's': 'sz', 'z': 'sz',
      'sh': 'sh', 'zh': 'sh', 'ch': 'sh', 'jh': 'sh',
      'k': 'kg', 'g': 'kg', 'ng': 'kg',
      'r': 'r',
      'w': 'w',
      'y': 'y',
      'h': 'h'
    };
  }
  
  private createDisneyMapping(): Record<string, string> {
    return {
      'sil': 'rest', '': 'rest',
      'aa': 'a', 'ah': 'a', 'ao': 'a',
      'ae': 'e', 'eh': 'e',
      'iy': 'i', 'ih': 'i',
      'ow': 'o', 'oy': 'o',
      'uw': 'u', 'uh': 'u',
      'b': 'mbp', 'm': 'mbp', 'p': 'mbp',
      'f': 'fv', 'v': 'fv',
      'th': 'th', 'dh': 'th',
      'l': 'l',
      'w': 'wq',
      't': 'l', 'd': 'l', 'n': 'l', 'r': 'l', 's': 'l', 'z': 'l',
      'sh': 'wq', 'ch': 'wq', 'jh': 'wq',
      'k': 'l', 'g': 'l', 'ng': 'l', 'y': 'l', 'h': 'l'
    };
  }
  
  private createIPAMapping(): Record<string, string> {
    return {
      'sil': 'ə', '': 'ə',
      'aa': 'ɑ', 'ae': 'æ', 'ax': 'ə', 'ih': 'ɪ', 'iy': 'i',
      'ao': 'ɔ', 'ow': 'o', 'uh': 'ʊ', 'uw': 'u',
      'p': 'p', 'b': 'b', 'm': 'm',
      'f': 'f', 'v': 'v',
      'th': 'θ', 'dh': 'θ',
      's': 's', 'z': 's',
      'sh': 'ʃ', 'zh': 'ʃ', 'ch': 'ʃ', 'jh': 'ʃ',
      't': 't', 'd': 't', 'n': 't',
      'k': 'k', 'g': 'k', 'ng': 'k',
      'l': 'l',
      'r': 'ɹ',
      'w': 'w',
      'y': 'i', 'h': 'ə'
    };
  }
  
  private createOculusMapping(): Record<string, string> {
    return {
      'sil': 'sil', '': 'sil',
      'p': 'PP', 'b': 'PP', 'm': 'PP',
      'f': 'FF', 'v': 'FF',
      'th': 'TH', 'dh': 'TH',
      't': 'DD', 'd': 'DD', 'n': 'DD', 'l': 'DD', 's': 'DD', 'z': 'DD',
      'k': 'kk', 'g': 'kk', 'ng': 'kk', 'y': 'kk', 'h': 'kk',
      'sh': 'CH', 'ch': 'CH', 'jh': 'CH', 'zh': 'CH',
      'aa': 'aa', 'ah': 'aa',
      'ao': 'ao', 'aw': 'ao',
      'uw': 'uw',
      'er': 'er',
      'ih': 'ih',
      'ey': 'ey',
      'ae': 'ae',
      'ow': 'ow',
      'r': 'er', 'w': 'uw', 'oy': 'ow'
    };
  }
}