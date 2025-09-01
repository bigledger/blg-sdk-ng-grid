import { Injectable, signal, computed } from '@angular/core';
import * as THREE from 'three';
import { AvatarModel } from '../interfaces/model-loading.interface';

/**
 * Customization options interface
 */
export interface CustomizationOptions {
  // Material properties
  materials: {
    skin: {
      baseColor: THREE.Color;
      roughness: number;
      metalness: number;
      subsurfaceScattering: boolean;
      subsurfaceColor: THREE.Color;
      subsurfaceIntensity: number;
    };
    hair: {
      baseColor: THREE.Color;
      tipColor: THREE.Color;
      roughness: number;
      opacity: number;
      style: 'straight' | 'wavy' | 'curly' | 'braided';
    };
    eyes: {
      irisColor: THREE.Color;
      scleraColor: THREE.Color;
      pupilSize: number;
    };
    clothing: {
      [clothingPiece: string]: {
        baseColor: THREE.Color;
        roughness: number;
        metalness: number;
        normalScale: number;
      };
    };
  };
  
  // Morph targets for facial features
  morphTargets: {
    face: {
      jawWidth: number;
      cheekboneHeight: number;
      eyeSize: number;
      noseSize: number;
      lipFullness: number;
      browHeight: number;
    };
    body: {
      height: number;
      muscleDefinition: number;
      bodyFat: number;
    };
  };
  
  // Accessories
  accessories: {
    [accessoryName: string]: {
      enabled: boolean;
      position: THREE.Vector3;
      rotation: THREE.Euler;
      scale: THREE.Vector3;
      color?: THREE.Color;
      material?: string;
    };
  };
  
  // Clothing system
  clothing: {
    [clothingPiece: string]: {
      model: string; // URL or ID
      size: 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';
      fit: 'tight' | 'regular' | 'loose';
      color: THREE.Color;
      pattern?: string;
      material: 'cotton' | 'leather' | 'silk' | 'denim' | 'wool' | 'synthetic';
    };
  };
}

/**
 * Presets interface for quick customization
 */
export interface CustomizationPreset {
  name: string;
  category: 'ethnicity' | 'age' | 'style' | 'occupation' | 'fantasy';
  description: string;
  thumbnail: string;
  options: Partial<CustomizationOptions>;
}

/**
 * Avatar Customization Service
 * Handles real-time avatar customization with materials, morph targets, and accessories
 */
@Injectable({
  providedIn: 'root'
})
export class CustomizationService {
  // Core state
  private _currentModel = signal<AvatarModel | null>(null);
  private _customizationOptions = signal<CustomizationOptions | null>(null);
  private _availablePresets = signal<CustomizationPreset[]>([]);
  private _activePreset = signal<string | null>(null);
  
  // Material caches
  private _materialCache = new Map<string, THREE.Material>();
  private _textureCache = new Map<string, THREE.Texture>();
  
  // Accessory system
  private _availableAccessories = signal<Map<string, THREE.Object3D>>(new Map());
  private _activeAccessories = signal<Map<string, THREE.Object3D>>(new Map());
  
  // Clothing system
  private _availableClothing = signal<Map<string, THREE.Object3D>>(new Map());
  private _activeClothing = signal<Map<string, THREE.Object3D>>(new Map());
  
  // Public readonly signals
  readonly currentModel = this._currentModel.asReadonly();
  readonly customizationOptions = this._customizationOptions.asReadonly();
  readonly availablePresets = this._availablePresets.asReadonly();
  readonly activePreset = this._activePreset.asReadonly();
  readonly availableAccessories = this._availableAccessories.asReadonly();
  readonly activeAccessories = this._activeAccessories.asReadonly();
  
  // Computed properties
  readonly hasCustomizations = computed(() => {
    return this._customizationOptions() !== null;
  });
  
  readonly customizationProgress = computed(() => {
    const options = this._customizationOptions();
    if (!options) return 0;
    
    let completed = 0;
    let total = 0;
    
    // Count material customizations
    if (options.materials.skin.baseColor) completed++;
    total++;
    
    if (options.materials.hair.baseColor) completed++;
    total++;
    
    // Count morph target customizations
    Object.values(options.morphTargets.face).forEach(value => {
      if (value !== 0) completed++;
      total++;
    });
    
    return total > 0 ? completed / total : 0;
  });

  constructor() {
    this.initializeDefaultPresets();
  }

  /**
   * Initialize with avatar model
   */
  initializeWithModel(model: AvatarModel): void {
    this._currentModel.set(model);
    this.setupDefaultCustomizations();
    this.loadAvailableAccessories();
    this.loadAvailableClothing();
  }

  /**
   * Set up default customization options
   */
  private setupDefaultCustomizations(): void {
    const defaultOptions: CustomizationOptions = {
      materials: {
        skin: {
          baseColor: new THREE.Color(0xFFDBB3),
          roughness: 0.8,
          metalness: 0.0,
          subsurfaceScattering: true,
          subsurfaceColor: new THREE.Color(0xFF6B35),
          subsurfaceIntensity: 0.5
        },
        hair: {
          baseColor: new THREE.Color(0x8B4513),
          tipColor: new THREE.Color(0xDEB887),
          roughness: 0.9,
          opacity: 0.95,
          style: 'straight'
        },
        eyes: {
          irisColor: new THREE.Color(0x4A90E2),
          scleraColor: new THREE.Color(0xFFFFFF),
          pupilSize: 0.3
        },
        clothing: {}
      },
      morphTargets: {
        face: {
          jawWidth: 0,
          cheekboneHeight: 0,
          eyeSize: 0,
          noseSize: 0,
          lipFullness: 0,
          browHeight: 0
        },
        body: {
          height: 0,
          muscleDefinition: 0,
          bodyFat: 0
        }
      },
      accessories: {},
      clothing: {}
    };
    
    this._customizationOptions.set(defaultOptions);
  }

  /**
   * Initialize default presets
   */
  private initializeDefaultPresets(): void {
    const presets: CustomizationPreset[] = [
      {
        name: 'Caucasian Male',
        category: 'ethnicity',
        description: 'Light skin tone with European features',
        thumbnail: '/assets/presets/caucasian-male.jpg',
        options: {
          materials: {
            skin: {
              baseColor: new THREE.Color(0xFFDBB3),
              roughness: 0.7,
              metalness: 0.0,
              subsurfaceScattering: true,
              subsurfaceColor: new THREE.Color(0xFF8A65),
              subsurfaceIntensity: 0.4
            },
            hair: {
              baseColor: new THREE.Color(0x8B4513),
              tipColor: new THREE.Color(0xA0522D),
              roughness: 0.8,
              opacity: 0.95,
              style: 'straight'
            }
          }
        }
      },
      {
        name: 'African American Female',
        category: 'ethnicity',
        description: 'Darker skin tone with African features',
        thumbnail: '/assets/presets/african-female.jpg',
        options: {
          materials: {
            skin: {
              baseColor: new THREE.Color(0x8D5524),
              roughness: 0.6,
              metalness: 0.0,
              subsurfaceScattering: true,
              subsurfaceColor: new THREE.Color(0xD2691E),
              subsurfaceIntensity: 0.6
            },
            hair: {
              baseColor: new THREE.Color(0x2F1B14),
              tipColor: new THREE.Color(0x4A4A4A),
              roughness: 0.9,
              opacity: 0.98,
              style: 'curly'
            }
          }
        }
      },
      {
        name: 'Asian Male',
        category: 'ethnicity',
        description: 'East Asian features and skin tone',
        thumbnail: '/assets/presets/asian-male.jpg',
        options: {
          materials: {
            skin: {
              baseColor: new THREE.Color(0xF1C27D),
              roughness: 0.75,
              metalness: 0.0,
              subsurfaceScattering: true,
              subsurfaceColor: new THREE.Color(0xFFAB91),
              subsurfaceIntensity: 0.45
            },
            hair: {
              baseColor: new THREE.Color(0x1A1A1A),
              tipColor: new THREE.Color(0x2C2C2C),
              roughness: 0.7,
              opacity: 0.97,
              style: 'straight'
            }
          }
        }
      },
      {
        name: 'Business Professional',
        category: 'occupation',
        description: 'Professional business attire',
        thumbnail: '/assets/presets/business.jpg',
        options: {
          clothing: {
            suit: {
              model: 'business_suit_01',
              size: 'M',
              fit: 'regular',
              color: new THREE.Color(0x2C3E50),
              material: 'wool'
            },
            shirt: {
              model: 'dress_shirt_01',
              size: 'M',
              fit: 'regular',
              color: new THREE.Color(0xFFFFFF),
              material: 'cotton'
            }
          },
          accessories: {
            tie: {
              enabled: true,
              position: new THREE.Vector3(0, 0.8, 0.05),
              rotation: new THREE.Euler(0, 0, 0),
              scale: new THREE.Vector3(1, 1, 1),
              color: new THREE.Color(0x8B0000)
            }
          }
        }
      },
      {
        name: 'Casual Street Style',
        category: 'style',
        description: 'Relaxed casual clothing',
        thumbnail: '/assets/presets/casual.jpg',
        options: {
          clothing: {
            tshirt: {
              model: 'tshirt_01',
              size: 'M',
              fit: 'regular',
              color: new THREE.Color(0x4A90E2),
              material: 'cotton'
            },
            jeans: {
              model: 'jeans_01',
              size: 'M',
              fit: 'regular',
              color: new THREE.Color(0x1E3A8A),
              material: 'denim'
            }
          },
          accessories: {
            cap: {
              enabled: true,
              position: new THREE.Vector3(0, 1.8, 0),
              rotation: new THREE.Euler(0, 0, 0),
              scale: new THREE.Vector3(1, 1, 1),
              color: new THREE.Color(0x2C3E50)
            }
          }
        }
      }
    ];
    
    this._availablePresets.set(presets);
  }

  /**
   * Apply customization preset
   */
  applyPreset(presetName: string): boolean {
    const presets = this._availablePresets();
    const preset = presets.find(p => p.name === presetName);
    
    if (!preset) {
      console.warn(`Preset '${presetName}' not found`);
      return false;
    }
    
    const currentOptions = this._customizationOptions();
    if (!currentOptions) return false;
    
    // Deep merge preset options with current options
    const mergedOptions = this.deepMergeOptions(currentOptions, preset.options);
    this._customizationOptions.set(mergedOptions);
    this._activePreset.set(presetName);
    
    // Apply the customizations
    this.applyCustomizations();
    
    return true;
  }

  /**
   * Deep merge customization options
   */
  private deepMergeOptions(current: CustomizationOptions, preset: Partial<CustomizationOptions>): CustomizationOptions {
    const merged = { ...current };
    
    if (preset.materials) {
      merged.materials = {
        ...merged.materials,
        ...preset.materials
      };
    }
    
    if (preset.morphTargets) {
      merged.morphTargets = {
        ...merged.morphTargets,
        ...preset.morphTargets
      };
    }
    
    if (preset.accessories) {
      merged.accessories = {
        ...merged.accessories,
        ...preset.accessories
      };
    }
    
    if (preset.clothing) {
      merged.clothing = {
        ...merged.clothing,
        ...preset.clothing
      };
    }
    
    return merged;
  }

  /**
   * Update skin material properties
   */
  updateSkinMaterial(properties: Partial<CustomizationOptions['materials']['skin']>): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    const updatedOptions = {
      ...options,
      materials: {
        ...options.materials,
        skin: {
          ...options.materials.skin,
          ...properties
        }
      }
    };
    
    this._customizationOptions.set(updatedOptions);
    this.applySkinMaterial();
  }

  /**
   * Update hair material properties
   */
  updateHairMaterial(properties: Partial<CustomizationOptions['materials']['hair']>): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    const updatedOptions = {
      ...options,
      materials: {
        ...options.materials,
        hair: {
          ...options.materials.hair,
          ...properties
        }
      }
    };
    
    this._customizationOptions.set(updatedOptions);
    this.applyHairMaterial();
  }

  /**
   * Update facial morph targets
   */
  updateFacialMorphs(morphs: Partial<CustomizationOptions['morphTargets']['face']>): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    const updatedOptions = {
      ...options,
      morphTargets: {
        ...options.morphTargets,
        face: {
          ...options.morphTargets.face,
          ...morphs
        }
      }
    };
    
    this._customizationOptions.set(updatedOptions);
    this.applyFacialMorphs();
  }

  /**
   * Update body morph targets
   */
  updateBodyMorphs(morphs: Partial<CustomizationOptions['morphTargets']['body']>): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    const updatedOptions = {
      ...options,
      morphTargets: {
        ...options.morphTargets,
        body: {
          ...options.morphTargets.body,
          ...morphs
        }
      }
    };
    
    this._customizationOptions.set(updatedOptions);
    this.applyBodyMorphs();
  }

  /**
   * Add or update accessory
   */
  addAccessory(name: string, config: CustomizationOptions['accessories'][string]): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    const updatedOptions = {
      ...options,
      accessories: {
        ...options.accessories,
        [name]: config
      }
    };
    
    this._customizationOptions.set(updatedOptions);
    this.applyAccessory(name, config);
  }

  /**
   * Remove accessory
   */
  removeAccessory(name: string): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    const updatedOptions = { ...options };
    delete updatedOptions.accessories[name];
    
    this._customizationOptions.set(updatedOptions);
    
    // Remove from scene
    const activeAccessories = this._activeAccessories();
    const accessory = activeAccessories.get(name);
    if (accessory) {
      const model = this._currentModel();
      if (model) {
        model.root.remove(accessory);
      }
      const newActiveAccessories = new Map(activeAccessories);
      newActiveAccessories.delete(name);
      this._activeAccessories.set(newActiveAccessories);
    }
  }

  /**
   * Apply all customizations
   */
  private applyCustomizations(): void {
    this.applySkinMaterial();
    this.applyHairMaterial();
    this.applyFacialMorphs();
    this.applyBodyMorphs();
    this.applyAllAccessories();
    this.applyAllClothing();
  }

  /**
   * Apply skin material
   */
  private applySkinMaterial(): void {
    const model = this._currentModel();
    const options = this._customizationOptions();
    
    if (!model || !options) return;
    
    const skinProps = options.materials.skin;
    
    model.root.traverse((object) => {
      if (object instanceof THREE.Mesh && object.name.includes('skin')) {
        const material = object.material as THREE.MeshStandardMaterial;
        if (material) {
          material.color.copy(skinProps.baseColor);
          material.roughness = skinProps.roughness;
          material.metalness = skinProps.metalness;
          material.needsUpdate = true;
        }
      }
    });
  }

  /**
   * Apply hair material
   */
  private applyHairMaterial(): void {
    const model = this._currentModel();
    const options = this._customizationOptions();
    
    if (!model || !options) return;
    
    const hairProps = options.materials.hair;
    
    model.root.traverse((object) => {
      if (object instanceof THREE.Mesh && object.name.includes('hair')) {
        const material = object.material as THREE.MeshStandardMaterial;
        if (material) {
          material.color.copy(hairProps.baseColor);
          material.roughness = hairProps.roughness;
          material.opacity = hairProps.opacity;
          material.transparent = hairProps.opacity < 1.0;
          material.needsUpdate = true;
        }
      }
    });
  }

  /**
   * Apply facial morph targets
   */
  private applyFacialMorphs(): void {
    const model = this._currentModel();
    const options = this._customizationOptions();
    
    if (!model || !options) return;
    
    const faceMorphs = options.morphTargets.face;
    
    // Apply morph targets to appropriate meshes
    model.morphTargetMeshes.forEach(mesh => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      
      // Map customization properties to morph target names
      const morphMapping: Record<keyof typeof faceMorphs, string> = {
        jawWidth: 'jawWide',
        cheekboneHeight: 'cheekPuff',
        eyeSize: 'eyeWide',
        noseSize: 'noseSneer',
        lipFullness: 'mouthPucker',
        browHeight: 'browUp'
      };
      
      Object.entries(faceMorphs).forEach(([property, value]) => {
        const morphName = morphMapping[property as keyof typeof faceMorphs];
        const index = mesh.morphTargetDictionary[morphName];
        
        if (index !== undefined) {
          mesh.morphTargetInfluences[index] = value;
        }
      });
    });
  }

  /**
   * Apply body morph targets
   */
  private applyBodyMorphs(): void {
    const model = this._currentModel();
    const options = this._customizationOptions();
    
    if (!model || !options) return;
    
    const bodyMorphs = options.morphTargets.body;
    
    // Apply scale transformations for body morphs
    if (bodyMorphs.height !== 0) {
      const heightScale = 1 + (bodyMorphs.height * 0.2); // ±20% height variation
      model.root.scale.y = heightScale;
    }
    
    // Apply muscle definition and body fat through morph targets if available
    model.morphTargetMeshes.forEach(mesh => {
      if (!mesh.morphTargetDictionary || !mesh.morphTargetInfluences) return;
      
      if (mesh.name.includes('body') || mesh.name.includes('torso')) {
        const muscleIndex = mesh.morphTargetDictionary['muscleDefinition'];
        if (muscleIndex !== undefined) {
          mesh.morphTargetInfluences[muscleIndex] = bodyMorphs.muscleDefinition;
        }
        
        const fatIndex = mesh.morphTargetDictionary['bodyFat'];
        if (fatIndex !== undefined) {
          mesh.morphTargetInfluences[fatIndex] = bodyMorphs.bodyFat;
        }
      }
    });
  }

  /**
   * Apply single accessory
   */
  private applyAccessory(name: string, config: CustomizationOptions['accessories'][string]): void {
    if (!config.enabled) return;
    
    const availableAccessories = this._availableAccessories();
    const accessoryTemplate = availableAccessories.get(name);
    
    if (!accessoryTemplate) {
      console.warn(`Accessory template '${name}' not found`);
      return;
    }
    
    const model = this._currentModel();
    if (!model) return;
    
    // Clone the accessory
    const accessory = accessoryTemplate.clone();
    
    // Apply transformations
    accessory.position.copy(config.position);
    accessory.rotation.copy(config.rotation);
    accessory.scale.copy(config.scale);
    
    // Apply color if specified
    if (config.color) {
      accessory.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const material = object.material as THREE.MeshStandardMaterial;
          if (material) {
            material.color.copy(config.color);
          }
        }
      });
    }
    
    // Add to model
    model.root.add(accessory);
    
    // Track active accessory
    const activeAccessories = this._activeAccessories();
    const newActiveAccessories = new Map(activeAccessories);
    newActiveAccessories.set(name, accessory);
    this._activeAccessories.set(newActiveAccessories);
  }

  /**
   * Apply all accessories
   */
  private applyAllAccessories(): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    Object.entries(options.accessories).forEach(([name, config]) => {
      this.applyAccessory(name, config);
    });
  }

  /**
   * Apply all clothing
   */
  private applyAllClothing(): void {
    const options = this._customizationOptions();
    if (!options) return;
    
    Object.entries(options.clothing).forEach(([piece, config]) => {
      this.applyClothingPiece(piece, config);
    });
  }

  /**
   * Apply clothing piece
   */
  private applyClothingPiece(piece: string, config: CustomizationOptions['clothing'][string]): void {
    // Implementation would depend on the clothing system
    // This is a simplified version
    console.log(`Applying clothing piece: ${piece}`, config);
  }

  /**
   * Load available accessories (would typically load from server/assets)
   */
  private loadAvailableAccessories(): void {
    // This would typically load accessory models from the server
    // For now, we'll create some simple placeholder accessories
    const accessories = new Map<string, THREE.Object3D>();
    
    // Hat placeholder
    const hat = new THREE.Mesh(
      new THREE.CylinderGeometry(0.3, 0.35, 0.2, 8),
      new THREE.MeshStandardMaterial({ color: 0x2C3E50 })
    );
    accessories.set('hat', hat);
    
    // Glasses placeholder
    const glasses = new THREE.Group();
    const leftLens = new THREE.Mesh(
      new THREE.RingGeometry(0.04, 0.06, 8),
      new THREE.MeshStandardMaterial({ color: 0x333333, transparent: true, opacity: 0.3 })
    );
    leftLens.position.set(-0.06, 0, 0);
    
    const rightLens = leftLens.clone();
    rightLens.position.set(0.06, 0, 0);
    
    glasses.add(leftLens, rightLens);
    accessories.set('glasses', glasses);
    
    this._availableAccessories.set(accessories);
  }

  /**
   * Load available clothing (would typically load from server/assets)
   */
  private loadAvailableClothing(): void {
    // This would typically load clothing models from the server
    const clothing = new Map<string, THREE.Object3D>();
    // Implementation would add actual clothing models
    this._availableClothing.set(clothing);
  }

  /**
   * Export current customizations as JSON
   */
  exportCustomizations(): string {
    const options = this._customizationOptions();
    if (!options) return '{}';
    
    // Convert Three.js objects to serializable format
    const serializable = this.makeSerializable(options);
    return JSON.stringify(serializable, null, 2);
  }

  /**
   * Import customizations from JSON
   */
  importCustomizations(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      const options = this.makeThreeJSObjects(data);
      this._customizationOptions.set(options);
      this.applyCustomizations();
      return true;
    } catch (error) {
      console.error('Failed to import customizations:', error);
      return false;
    }
  }

  /**
   * Convert Three.js objects to serializable format
   */
  private makeSerializable(options: CustomizationOptions): any {
    return {
      ...options,
      materials: {
        skin: {
          ...options.materials.skin,
          baseColor: options.materials.skin.baseColor.getHex(),
          subsurfaceColor: options.materials.skin.subsurfaceColor.getHex()
        },
        hair: {
          ...options.materials.hair,
          baseColor: options.materials.hair.baseColor.getHex(),
          tipColor: options.materials.hair.tipColor.getHex()
        },
        eyes: {
          ...options.materials.eyes,
          irisColor: options.materials.eyes.irisColor.getHex(),
          scleraColor: options.materials.eyes.scleraColor.getHex()
        }
      }
    };
  }

  /**
   * Convert serializable format back to Three.js objects
   */
  private makeThreeJSObjects(data: any): CustomizationOptions {
    return {
      ...data,
      materials: {
        skin: {
          ...data.materials.skin,
          baseColor: new THREE.Color(data.materials.skin.baseColor),
          subsurfaceColor: new THREE.Color(data.materials.skin.subsurfaceColor)
        },
        hair: {
          ...data.materials.hair,
          baseColor: new THREE.Color(data.materials.hair.baseColor),
          tipColor: new THREE.Color(data.materials.hair.tipColor)
        },
        eyes: {
          ...data.materials.eyes,
          irisColor: new THREE.Color(data.materials.eyes.irisColor),
          scleraColor: new THREE.Color(data.materials.eyes.scleraColor)
        }
      }
    };
  }

  /**
   * Reset all customizations to defaults
   */
  resetToDefaults(): void {
    this.setupDefaultCustomizations();
    this._activePreset.set(null);
    this.applyCustomizations();
  }

  /**
   * Get available customization categories
   */
  getCustomizationCategories(): string[] {
    return ['materials', 'morphTargets', 'accessories', 'clothing'];
  }

  /**
   * Dispose of resources
   */
  dispose(): void {
    // Clean up material cache
    this._materialCache.forEach(material => {
      material.dispose();
    });
    this._materialCache.clear();
    
    // Clean up texture cache
    this._textureCache.forEach(texture => {
      texture.dispose();
    });
    this._textureCache.clear();
    
    // Clean up active accessories
    const activeAccessories = this._activeAccessories();
    activeAccessories.forEach(accessory => {
      accessory.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          if (object.geometry) object.geometry.dispose();
          if (object.material) {
            if (Array.isArray(object.material)) {
              object.material.forEach(mat => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        }
      });
    });
    
    this._currentModel.set(null);
    this._customizationOptions.set(null);
  }
}