/**
 * Color options for customization
 */
export interface ColorOption {
  /** Color identifier */
  id: string;
  /** Display name */
  name: string;
  /** Hex color value */
  value: string;
  /** Whether this is a premium color */
  isPremium?: boolean;
}

/**
 * Texture/pattern options
 */
export interface TextureOption {
  /** Texture identifier */
  id: string;
  /** Display name */
  name: string;
  /** Texture image URL or pattern */
  value: string;
  /** Texture type */
  type: 'solid' | 'pattern' | 'gradient' | 'image';
  /** Whether this is a premium texture */
  isPremium?: boolean;
}

/**
 * Hair customization options
 */
export interface HairCustomization {
  /** Hair style options */
  styles: Array<{
    id: string;
    name: string;
    category: 'short' | 'medium' | 'long' | 'bald' | 'special';
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Hair color options */
  colors: ColorOption[];
  
  /** Hair texture/curl options */
  textures: Array<{
    id: string;
    name: string;
    type: 'straight' | 'wavy' | 'curly' | 'kinky';
    intensity: number; // 0-100
  }>;
  
  /** Hair accessories */
  accessories: Array<{
    id: string;
    name: string;
    type: 'headband' | 'hat' | 'bow' | 'clip' | 'scarf';
    previewUrl: string;
    colors?: ColorOption[];
    isPremium?: boolean;
  }>;
}

/**
 * Facial feature customization
 */
export interface FacialCustomization {
  /** Eye options */
  eyes: {
    shapes: Array<{
      id: string;
      name: string;
      previewUrl: string;
    }>;
    colors: ColorOption[];
    makeup?: Array<{
      id: string;
      name: string;
      type: 'eyeliner' | 'eyeshadow' | 'mascara';
      colors: ColorOption[];
      isPremium?: boolean;
    }>;
  };
  
  /** Eyebrow options */
  eyebrows: {
    shapes: Array<{
      id: string;
      name: string;
      thickness: 'thin' | 'medium' | 'thick';
      previewUrl: string;
    }>;
    colors: ColorOption[];
  };
  
  /** Nose options */
  nose: {
    shapes: Array<{
      id: string;
      name: string;
      size: 'small' | 'medium' | 'large';
      previewUrl: string;
    }>;
  };
  
  /** Lip options */
  lips: {
    shapes: Array<{
      id: string;
      name: string;
      fullness: 'thin' | 'medium' | 'full';
      previewUrl: string;
    }>;
    colors: ColorOption[];
    lipstick?: Array<{
      id: string;
      name: string;
      finish: 'matte' | 'glossy' | 'metallic';
      colors: ColorOption[];
      isPremium?: boolean;
    }>;
  };
  
  /** Facial hair options */
  facialHair?: {
    styles: Array<{
      id: string;
      name: string;
      type: 'none' | 'mustache' | 'beard' | 'goatee' | 'stubble';
      previewUrl: string;
    }>;
    colors: ColorOption[];
  };
}

/**
 * Clothing customization options
 */
export interface ClothingCustomization {
  /** Top clothing options */
  tops: Array<{
    id: string;
    name: string;
    category: 'casual' | 'formal' | 'business' | 'sporty' | 'trendy';
    style: 'shirt' | 'blouse' | 'sweater' | 'jacket' | 'dress' | 't-shirt';
    colors: ColorOption[];
    patterns?: TextureOption[];
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Bottom clothing options */
  bottoms?: Array<{
    id: string;
    name: string;
    category: 'casual' | 'formal' | 'business' | 'sporty';
    style: 'pants' | 'skirt' | 'shorts' | 'jeans';
    colors: ColorOption[];
    patterns?: TextureOption[];
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Outerwear options */
  outerwear?: Array<{
    id: string;
    name: string;
    style: 'jacket' | 'blazer' | 'coat' | 'vest';
    colors: ColorOption[];
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Footwear options */
  footwear?: Array<{
    id: string;
    name: string;
    style: 'shoes' | 'boots' | 'sneakers' | 'sandals';
    colors: ColorOption[];
    previewUrl: string;
    isPremium?: boolean;
  }>;
}

/**
 * Accessory customization options
 */
export interface AccessoryCustomization {
  /** Jewelry options */
  jewelry: Array<{
    id: string;
    name: string;
    type: 'earrings' | 'necklace' | 'bracelet' | 'ring' | 'watch';
    material: 'gold' | 'silver' | 'bronze' | 'pearl' | 'diamond';
    colors?: ColorOption[];
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Glasses options */
  glasses?: Array<{
    id: string;
    name: string;
    type: 'prescription' | 'sunglasses' | 'reading';
    frameStyle: 'round' | 'square' | 'rectangular' | 'cat-eye' | 'aviator';
    frameColors: ColorOption[];
    lensColors?: ColorOption[];
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Bags and purses */
  bags?: Array<{
    id: string;
    name: string;
    type: 'handbag' | 'backpack' | 'briefcase' | 'clutch';
    colors: ColorOption[];
    materials: TextureOption[];
    previewUrl: string;
    isPremium?: boolean;
  }>;
}

/**
 * Background customization options
 */
export interface BackgroundCustomization {
  /** Solid color backgrounds */
  solidColors: ColorOption[];
  
  /** Gradient backgrounds */
  gradients: Array<{
    id: string;
    name: string;
    colors: string[];
    direction: 'horizontal' | 'vertical' | 'diagonal' | 'radial';
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Image backgrounds */
  images: Array<{
    id: string;
    name: string;
    category: 'office' | 'home' | 'outdoor' | 'abstract' | 'professional';
    url: string;
    thumbnailUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Video backgrounds */
  videos?: Array<{
    id: string;
    name: string;
    category: 'animated' | 'nature' | 'abstract' | 'professional';
    url: string;
    thumbnailUrl: string;
    duration: number;
    loop: boolean;
    isPremium?: boolean;
  }>;
  
  /** Custom upload support */
  customUpload: {
    enabled: boolean;
    maxFileSize: number; // bytes
    supportedFormats: string[];
    dimensions: {
      minWidth: number;
      minHeight: number;
      maxWidth: number;
      maxHeight: number;
    };
  };
}

/**
 * Animation and pose customization
 */
export interface AnimationCustomization {
  /** Idle poses */
  idlePoses: Array<{
    id: string;
    name: string;
    category: 'professional' | 'casual' | 'friendly' | 'confident';
    previewUrl: string;
    duration: number;
  }>;
  
  /** Gesture styles */
  gestureStyles: Array<{
    id: string;
    name: string;
    intensity: 'subtle' | 'moderate' | 'expressive';
    culturalContext?: string;
  }>;
  
  /** Facial expressions */
  expressions: Array<{
    id: string;
    name: string;
    emotion: string;
    intensity: number; // 0-100
    previewUrl: string;
  }>;
  
  /** Movement patterns */
  movementPatterns: Array<{
    id: string;
    name: string;
    type: 'static' | 'subtle' | 'dynamic';
    description: string;
  }>;
}

/**
 * Preset configuration bundles
 */
export interface CustomizationPreset {
  /** Preset identifier */
  id: string;
  
  /** Display name */
  name: string;
  
  /** Preset description */
  description: string;
  
  /** Preset category */
  category: 'professional' | 'casual' | 'creative' | 'formal' | 'trendy';
  
  /** Preview image */
  previewUrl: string;
  
  /** Whether this is a premium preset */
  isPremium: boolean;
  
  /** Complete customization settings */
  settings: {
    appearance: {
      model: string;
      skinTone: string;
    };
    hair: {
      styleId: string;
      colorId: string;
      textureId?: string;
      accessoryIds?: string[];
    };
    facial: {
      eyeShapeId: string;
      eyeColorId: string;
      eyebrowShapeId: string;
      noseShapeId: string;
      lipShapeId: string;
      lipColorId?: string;
      facialHairId?: string;
    };
    clothing: {
      topId: string;
      bottomId?: string;
      outerwearId?: string;
      footwearId?: string;
    };
    accessories: {
      jewelryIds?: string[];
      glassesId?: string;
      bagId?: string;
    };
    background: {
      type: 'solid' | 'gradient' | 'image' | 'video';
      id: string;
    };
    animation: {
      idlePoseId: string;
      gestureStyleId: string;
      expressionIds: string[];
    };
  };
}

/**
 * Complete customization options interface
 */
export interface CustomizationOptions {
  /** Hair customization */
  hair: HairCustomization;
  
  /** Facial feature customization */
  facial: FacialCustomization;
  
  /** Clothing customization */
  clothing: ClothingCustomization;
  
  /** Accessory customization */
  accessories: AccessoryCustomization;
  
  /** Background customization */
  background: BackgroundCustomization;
  
  /** Animation customization */
  animation: AnimationCustomization;
  
  /** Pre-defined presets */
  presets: CustomizationPreset[];
  
  /** Skin tone options */
  skinTones: ColorOption[];
  
  /** Available avatar models */
  models: Array<{
    id: string;
    name: string;
    gender: 'male' | 'female' | 'neutral';
    ageGroup: 'young' | 'middle' | 'elderly';
    bodyType: 'slim' | 'average' | 'athletic' | 'plus';
    ethnicity?: string;
    previewUrl: string;
    isPremium?: boolean;
  }>;
  
  /** Customization limits */
  limits: {
    /** Maximum number of saved customizations per user */
    maxSavedCustomizations: number;
    /** Maximum file size for custom uploads */
    maxUploadSize: number;
    /** Premium feature access */
    premiumAccess: boolean;
  };
  
  /** Customization categories organization */
  categories: Array<{
    id: string;
    name: string;
    icon: string;
    order: number;
    subcategories?: Array<{
      id: string;
      name: string;
      order: number;
    }>;
  }>;
}