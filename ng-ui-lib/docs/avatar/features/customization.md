# Avatar Customization Features

Complete guide to avatar appearance customization, behavior modification, and branding options in the BigLedger Avatar Library.

## Overview

The Avatar Customization system provides extensive options for personalizing avatar appearance, behavior, and branding. From detailed physical characteristics to personality traits and corporate branding, the system offers comprehensive customization while maintaining performance and visual quality.

## Appearance Customization

### Character Models and Demographics

#### Base Character Types

```typescript
interface CharacterModels {
  age_groups: {
    young_adult: {
      age_range: [18, 30];
      features: 'smooth_skin, bright_eyes, modern_styling';
      energy_level: 'high';
      default_expressions: ['confident', 'enthusiastic', 'friendly'];
    };
    
    middle_aged: {
      age_range: [35, 50];
      features: 'mature_features, professional_appearance';
      energy_level: 'moderate';
      default_expressions: ['professional', 'experienced', 'authoritative'];
    };
    
    senior: {
      age_range: [55, 70];
      features: 'distinguished_appearance, wisdom_lines';
      energy_level: 'calm';
      default_expressions: ['wise', 'patient', 'understanding'];
    };
  };
  
  gender_presentation: {
    masculine: {
      facial_structure: 'angular_features, strong_jawline';
      body_type: 'broader_shoulders, narrower_hips';
      default_clothing: 'masculine_professional';
    };
    
    feminine: {
      facial_structure: 'softer_features, refined_jawline';
      body_type: 'narrower_shoulders, defined_waist';
      default_clothing: 'feminine_professional';
    };
    
    non_binary: {
      facial_structure: 'balanced_features, neutral_styling';
      body_type: 'balanced_proportions';
      default_clothing: 'gender_neutral_professional';
    };
  };
  
  body_types: {
    slim: { build_modifier: 0.8, health_appearance: 'athletic' };
    average: { build_modifier: 1.0, health_appearance: 'healthy' };
    athletic: { build_modifier: 1.1, health_appearance: 'fit' };
    heavy: { build_modifier: 1.3, health_appearance: 'robust' };
  };
}
```

### Facial Feature Customization

#### Detailed Facial Controls

```typescript
interface FacialCustomization {
  face_shape: {
    overall: 'round' | 'oval' | 'square' | 'heart' | 'diamond' | 'long';
    jaw_width: { min: 0.7, max: 1.3, default: 1.0 };
    jaw_height: { min: 0.8, max: 1.2, default: 1.0 };
    cheekbone_prominence: { min: 0.5, max: 1.5, default: 1.0 };
    chin_shape: 'pointed' | 'rounded' | 'square' | 'cleft';
    forehead_height: { min: 0.8, max: 1.3, default: 1.0 };
  };
  
  eyes: {
    size: { min: 0.7, max: 1.4, default: 1.0 };
    shape: 'almond' | 'round' | 'hooded' | 'upturned' | 'downturned';
    spacing: { min: 0.8, max: 1.2, default: 1.0 };
    depth: { min: -0.5, max: 0.5, default: 0.0 };
    
    iris_color: {
      base_colors: ['brown', 'blue', 'green', 'hazel', 'gray', 'amber'];
      custom_rgb: 'rgb_color_picker';
      patterns: ['solid', 'flecked', 'central_heterochromia', 'sectoral'];
    };
    
    eyebrows: {
      thickness: { min: 0.5, max: 2.0, default: 1.0 };
      arch_height: { min: 0.0, max: 1.0, default: 0.5 };
      length: { min: 0.8, max: 1.3, default: 1.0 };
      color: 'matches_hair_or_custom';
      shape: 'straight' | 'arched' | 'angular' | 'rounded';
    };
    
    eyelashes: {
      length: { min: 0.5, max: 2.0, default: 1.0 };
      thickness: { min: 0.5, max: 1.5, default: 1.0 };
      curl: { min: 0.0, max: 1.0, default: 0.5 };
      color: 'black' | 'brown' | 'matches_hair';
    };
  };
  
  nose: {
    size: { min: 0.7, max: 1.4, default: 1.0 };
    width: { min: 0.7, max: 1.3, default: 1.0 };
    bridge_height: { min: -0.5, max: 0.8, default: 0.0 };
    tip_shape: 'pointed' | 'rounded' | 'bulbous' | 'upturned';
    nostril_size: { min: 0.7, max: 1.3, default: 1.0 };
  };
  
  mouth: {
    size: { min: 0.7, max: 1.4, default: 1.0 };
    upper_lip_thickness: { min: 0.5, max: 2.0, default: 1.0 };
    lower_lip_thickness: { min: 0.5, max: 2.0, default: 1.0 };
    lip_color: {
      natural: 'skin_tone_based';
      custom: 'rgb_color_picker';
      lipstick: 'makeup_colors';
    };
    corner_shape: 'neutral' | 'upturned' | 'downturned';
    cupids_bow: { min: 0.0, max: 1.0, default: 0.5 };
  };
  
  ears: {
    size: { min: 0.8, max: 1.3, default: 1.0 };
    protrusion: { min: 0.0, max: 1.0, default: 0.3 };
    lobe_type: 'attached' | 'detached';
    piercings: 'optional_jewelry';
  };
}
```

### Skin Customization

#### Advanced Skin System

```typescript
interface SkinCustomization {
  base_tone: {
    predefined_tones: [
      { name: 'very_light', hex: '#FDBCB4', undertone: 'pink' },
      { name: 'light', hex: '#EDBAA6', undertone: 'neutral' },
      { name: 'light_medium', hex: '#D08B5B', undertone: 'yellow' },
      { name: 'medium', hex: '#AE7242', undertone: 'olive' },
      { name: 'medium_dark', hex: '#8D5524', undertone: 'red' },
      { name: 'dark', hex: '#714A23', undertone: 'neutral' },
      { name: 'very_dark', hex: '#4A312C', undertone: 'cool' }
    ];
    
    custom_color: {
      hue: { min: 0, max: 360, default: 30 };
      saturation: { min: 0, max: 100, default: 45 };
      lightness: { min: 10, max: 90, default: 65 };
    };
    
    undertones: {
      warm: 'yellow_golden_peachy';
      cool: 'pink_red_blue';
      neutral: 'balanced_undertones';
      olive: 'green_yellow_mix';
    };
  };
  
  texture_details: {
    smoothness: { min: 0.0, max: 1.0, default: 0.8 };
    pore_visibility: { min: 0.0, max: 1.0, default: 0.2 };
    skin_clarity: { min: 0.5, max: 1.0, default: 0.9 };
    oil_level: { min: 0.0, max: 1.0, default: 0.3 };
  };
  
  facial_features: {
    freckles: {
      enabled: boolean;
      density: { min: 0.0, max: 1.0, default: 0.3 };
      size: { min: 0.5, max: 2.0, default: 1.0 };
      color: 'darker_than_base' | 'custom_color';
      pattern: 'natural' | 'concentrated_nose' | 'full_face';
    };
    
    beauty_marks: {
      enabled: boolean;
      positions: 'predefined_locations' | 'custom_placement';
      size: { min: 1, max: 5, unit: 'pixels' };
    };
    
    aging_details: {
      wrinkles: {
        crow_feet: { min: 0.0, max: 1.0, default: 0.0 };
        forehead_lines: { min: 0.0, max: 1.0, default: 0.0 };
        smile_lines: { min: 0.0, max: 1.0, default: 0.0 };
        frown_lines: { min: 0.0, max: 1.0, default: 0.0 };
      };
    };
  };
  
  makeup_options: {
    foundation: {
      enabled: boolean;
      coverage: 'sheer' | 'medium' | 'full';
      finish: 'matte' | 'satin' | 'dewy';
      color_match: 'automatic' | 'custom';
    };
    
    eyeshadow: {
      enabled: boolean;
      colors: 'color_palette_selection';
      style: 'natural' | 'smoky' | 'dramatic' | 'colorful';
      finish: 'matte' | 'shimmer' | 'metallic';
    };
    
    eyeliner: {
      enabled: boolean;
      style: 'thin' | 'medium' | 'thick' | 'winged';
      color: 'black' | 'brown' | 'colored';
    };
    
    mascara: {
      enabled: boolean;
      style: 'natural' | 'volumizing' | 'lengthening';
      color: 'black' | 'brown';
    };
    
    blush: {
      enabled: boolean;
      color: 'coral' | 'pink' | 'peach' | 'berry';
      intensity: { min: 0.1, max: 1.0, default: 0.4 };
      placement: 'cheeks' | 'temples' | 'nose_bridge';
    };
    
    lipstick: {
      enabled: boolean;
      color: 'extensive_color_palette';
      finish: 'matte' | 'satin' | 'glossy' | 'metallic';
      intensity: { min: 0.2, max: 1.0, default: 0.7 };
    };
  };
}
```

### Hair System

#### Comprehensive Hair Customization

```typescript
interface HairCustomization {
  hair_styles: {
    length_categories: {
      very_short: ['buzz_cut', 'pixie', 'crew_cut', 'fade'];
      short: ['bob', 'lob', 'chin_length', 'short_layered'];
      medium: ['shoulder_length', 'layered_medium', 'wavy_medium'];
      long: ['long_straight', 'long_wavy', 'long_curly', 'very_long'];
    };
    
    texture_types: {
      straight: {
        type_1a: 'very_straight_fine';
        type_1b: 'straight_medium';
        type_1c: 'straight_coarse';
      };
      
      wavy: {
        type_2a: 'loose_waves';
        type_2b: 'moderate_waves';
        type_2c: 'strong_waves';
      };
      
      curly: {
        type_3a: 'loose_curls';
        type_3b: 'springy_curls';
        type_3c: 'tight_curls';
      };
      
      coily: {
        type_4a: 'soft_coils';
        type_4b: 'z_pattern_coils';
        type_4c: 'tight_coils';
      };
    };
    
    styling_options: {
      straight_hair: [
        'sleek_straight', 'side_part', 'center_part',
        'layered', 'blunt_cut', 'asymmetrical'
      ];
      
      wavy_hair: [
        'beach_waves', 'loose_waves', 'defined_waves',
        'scrunched', 'air_dried', 'finger_waves'
      ];
      
      curly_hair: [
        'defined_curls', 'twist_out', 'wash_and_go',
        'pineapple', 'curly_updo', 'protective_style'
      ];
    };
  };
  
  color_system: {
    natural_colors: {
      black: { base: '#1C1C1C', highlights: 'blue_undertones' };
      dark_brown: { base: '#2C1810', highlights: 'chocolate_tones' };
      medium_brown: { base: '#6F4E37', highlights: 'caramel_tones' };
      light_brown: { base: '#8B7355', highlights: 'honey_tones' };
      dark_blonde: { base: '#B5A476', highlights: 'golden_tones' };
      blonde: { base: '#D4B46A', highlights: 'platinum_tones' };
      light_blonde: { base: '#F2E6B1', highlights: 'ash_tones' };
      red: { base: '#A0522D', highlights: 'copper_tones' };
      auburn: { base: '#8B4513', highlights: 'mahogany_tones' };
      strawberry_blonde: { base: '#C9A961', highlights: 'rose_gold' };
      gray: { base: '#808080', highlights: 'silver_tones' };
      white: { base: '#F5F5F5', highlights: 'platinum' };
    };
    
    fashion_colors: {
      vibrant: ['electric_blue', 'hot_pink', 'purple', 'green', 'orange'];
      pastel: ['lavender', 'mint', 'rose', 'peach', 'sky_blue'];
      ombre: 'gradient_color_combinations';
      balayage: 'natural_painted_highlights';
      rainbow: 'multiple_color_sections';
    };
    
    coloring_techniques: {
      solid_color: 'uniform_color_throughout';
      highlights: 'lighter_streaks';
      lowlights: 'darker_streaks';
      balayage: 'hand_painted_natural';
      ombre: 'gradient_light_to_dark';
      color_melt: 'blended_multiple_tones';
      root_touch_up: 'natural_root_color';
    };
  };
  
  hair_accessories: {
    headbands: ['fabric', 'metal', 'embellished', 'sports'];
    hair_clips: ['bobby_pins', 'barrettes', 'decorative_clips'];
    scrunchies: ['fabric', 'silk', 'velvet', 'pattern'];
    hair_ties: ['elastic', 'spiral', 'no_damage'];
    headwraps: ['silk_scarves', 'bandanas', 'turbans'];
    hats: ['beanies', 'caps', 'fedoras', 'berets'];
  };
  
  physics_simulation: {
    hair_movement: {
      wind_response: true;
      gravity_simulation: true;
      collision_detection: true;
      natural_sway: true;
    };
    
    performance_settings: {
      strand_count: { low: 500, medium: 2000, high: 8000, ultra: 20000 };
      physics_quality: 'low' | 'medium' | 'high';
      real_time_updates: boolean;
    };
  };
}
```

### Clothing and Style

#### Professional Wardrobe System

```typescript
interface ClothingCustomization {
  professional_attire: {
    business_formal: {
      tops: {
        men: ['dress_shirt', 'french_cuff_shirt', 'tuxedo_shirt'];
        women: ['blouse', 'shell_top', 'wrap_blouse', 'button_down'];
        colors: ['white', 'light_blue', 'light_pink', 'cream', 'subtle_patterns'];
      };
      
      jackets: {
        men: ['suit_jacket', 'blazer', 'tuxedo_jacket', 'vest'];
        women: ['blazer', 'suit_jacket', 'cardigan_jacket', 'wrap_jacket'];
        colors: ['navy', 'charcoal', 'black', 'gray', 'pinstripe'];
      };
      
      bottoms: {
        men: ['dress_pants', 'suit_trousers', 'tuxedo_pants'];
        women: ['pencil_skirt', 'a_line_skirt', 'dress_pants', 'suit_skirt'];
        colors: 'matching_jacket_or_complementary';
      };
    };
    
    business_casual: {
      tops: {
        men: ['polo_shirt', 'casual_button_down', 'sweater', 'pullover'];
        women: ['blouse', 'sweater', 'cardigan', 'casual_top'];
        colors: 'expanded_color_palette';
      };
      
      bottoms: {
        men: ['khakis', 'chinos', 'dress_pants', 'nice_jeans'];
        women: ['dress_pants', 'skirt', 'nice_jeans', 'culottes'];
      };
      
      layers: ['cardigans', 'blazers', 'light_jackets', 'vests'];
    };
    
    casual: {
      tops: ['t_shirts', 'casual_shirts', 'hoodies', 'tank_tops'];
      bottoms: ['jeans', 'shorts', 'casual_pants', 'leggings'];
      dresses: ['casual_dresses', 'sundresses', 'maxi_dresses'];
    };
  };
  
  industry_specific: {
    medical: {
      scrubs: ['tops', 'bottoms', 'lab_coats', 'medical_jackets'];
      colors: ['traditional_blue', 'green', 'purple', 'patterns'];
      accessories: ['stethoscope', 'badge', 'pen_light'];
    };
    
    tech: {
      casual_professional: ['hoodies', 'polo_shirts', 'jeans', 'sneakers'];
      startup_style: ['graphic_tees', 'blazer_jeans_combo', 'casual_dress'];
    };
    
    education: {
      professional_casual: ['cardigans', 'blouses', 'dress_pants', 'skirts'];
      comfortable_professional: ['sweaters', 'flats', 'comfortable_fabrics'];
    };
    
    finance: {
      conservative_formal: ['dark_suits', 'white_shirts', 'conservative_ties'];
      traditional_colors: ['navy', 'charcoal', 'black', 'white'];
    };
  };
  
  fabric_simulation: {
    material_properties: {
      cotton: { drape: 'moderate', wrinkle: 'high', texture: 'matte' };
      silk: { drape: 'flowing', wrinkle: 'low', texture: 'smooth_shiny' };
      wool: { drape: 'structured', wrinkle: 'medium', texture: 'textured' };
      polyester: { drape: 'varies', wrinkle: 'low', texture: 'smooth' };
      linen: { drape: 'relaxed', wrinkle: 'very_high', texture: 'textured' };
    };
    
    physics_simulation: {
      cloth_movement: true;
      wind_effects: true;
      collision_detection: true;
      wrinkle_formation: 'realistic_creasing';
    };
  };
  
  accessories: {
    jewelry: {
      earrings: ['studs', 'hoops', 'dangles', 'ear_cuffs'];
      necklaces: ['chain', 'pendant', 'choker', 'statement'];
      bracelets: ['chain', 'bangle', 'tennis', 'charm'];
      rings: ['simple_band', 'statement', 'cocktail'];
      watches: ['analog', 'digital', 'smartwatch', 'luxury'];
    };
    
    eyewear: {
      glasses: {
        frame_shapes: ['rectangle', 'round', 'cat_eye', 'aviator', 'wayfarer'];
        frame_materials: ['metal', 'plastic', 'acetate', 'titanium'];
        lens_types: ['clear', 'tinted', 'blue_light', 'progressive'];
      };
      
      sunglasses: {
        styles: ['aviator', 'wayfarer', 'round', 'cat_eye', 'sport'];
        lens_colors: ['black', 'brown', 'blue', 'mirrored', 'gradient'];
      };
    };
  };
}
```

## Behavior Customization

### Personality Traits

#### Behavioral Characteristics

```typescript
interface PersonalityCustomization {
  personality_dimensions: {
    extraversion: {
      range: [0, 1];
      behaviors: {
        high: 'outgoing, talkative, energetic, assertive';
        medium: 'balanced_social_interaction';
        low: 'reserved, quiet, thoughtful, introspective';
      };
      animation_effects: {
        high: 'expansive_gestures, frequent_eye_contact, animated_expressions';
        low: 'subtle_movements, occasional_eye_contact, calm_demeanor';
      };
    };
    
    agreeableness: {
      range: [0, 1];
      behaviors: {
        high: 'cooperative, trusting, helpful, empathetic';
        medium: 'balanced_consideration_for_others';
        low: 'competitive, skeptical, direct, independent';
      };
      animation_effects: {
        high: 'warm_expressions, open_posture, nodding_encouragement';
        low: 'neutral_expressions, closed_posture, analytical_looks';
      };
    };
    
    conscientiousness: {
      range: [0, 1];
      behaviors: {
        high: 'organized, responsible, disciplined, goal_oriented';
        medium: 'moderately_organized_and_focused';
        low: 'flexible, spontaneous, casual, adaptable';
      };
      animation_effects: {
        high: 'precise_movements, structured_gestures, attentive_posture';
        low: 'relaxed_movements, casual_gestures, comfortable_posture';
      };
    };
    
    neuroticism: {
      range: [0, 1];
      behaviors: {
        high: 'anxious, sensitive, reactive, emotional';
        medium: 'moderate_emotional_responses';
        low: 'calm, stable, resilient, even_tempered';
      };
      animation_effects: {
        high: 'fidgeting, quick_movements, variable_expressions';
        low: 'steady_movements, calm_expressions, stable_demeanor';
      };
    };
    
    openness: {
      range: [0, 1];
      behaviors: {
        high: 'creative, curious, adventurous, imaginative';
        medium: 'balanced_openness_to_experience';
        low: 'practical, traditional, focused, conventional';
      };
      animation_effects: {
        high: 'varied_expressions, creative_gestures, engaged_curiosity';
        low: 'consistent_expressions, practical_gestures, focused_attention';
      };
    };
  };
  
  communication_style: {
    formality_level: {
      very_formal: {
        language: 'proper_grammar, formal_vocabulary, titles';
        tone: 'respectful, professional, measured';
        gestures: 'controlled, minimal, purposeful';
      };
      
      formal: {
        language: 'correct_grammar, professional_vocabulary';
        tone: 'polite, clear, structured';
        gestures: 'moderate, appropriate, business_like';
      };
      
      casual: {
        language: 'relaxed_grammar, conversational_vocabulary';
        tone: 'friendly, approachable, natural';
        gestures: 'expressive, natural, comfortable';
      };
      
      informal: {
        language: 'colloquial, contractions, casual_phrases';
        tone: 'relaxed, buddy_like, spontaneous';
        gestures: 'animated, frequent, expressive';
      };
    };
    
    response_patterns: {
      thinking_time: {
        quick_responder: { delay: [100, 300] }; // milliseconds
        moderate_responder: { delay: [300, 800] };
        thoughtful_responder: { delay: [800, 1500] };
        deliberate_responder: { delay: [1500, 3000] };
      };
      
      verbal_patterns: {
        concise: 'brief, to_the_point, efficient';
        detailed: 'thorough, explanatory, comprehensive';
        conversational: 'natural_flow, back_and_forth, engaging';
        storytelling: 'narrative_approach, examples, analogies';
      };
    };
  };
  
  emotional_responsiveness: {
    empathy_level: {
      high: {
        recognition: 'quickly_identifies_emotions';
        response: 'mirrors_and_validates_feelings';
        expressions: 'matches_emotional_tone';
      };
      
      moderate: {
        recognition: 'notices_obvious_emotional_cues';
        response: 'appropriate_but_measured';
        expressions: 'subtle_emotional_mirroring';
      };
      
      low: {
        recognition: 'focuses_on_content_over_emotion';
        response: 'rational_and_logical';
        expressions: 'neutral_professional_demeanor';
      };
    };
    
    mood_adaptation: {
      dynamic: 'adjusts_to_conversation_emotional_flow';
      stable: 'maintains_consistent_pleasant_demeanor';
      contextual: 'adapts_based_on_conversation_topic';
    };
  };
}
```

### Animation Behavior

#### Movement and Gesture Patterns

```typescript
interface AnimationBehaviorCustomization {
  gesture_frequency: {
    minimal: {
      frequency: 0.1; // gestures per minute
      types: ['essential_pointing', 'basic_acknowledgment'];
      intensity: 'subtle';
    };
    
    moderate: {
      frequency: 0.5;
      types: ['illustrative', 'emphatic', 'descriptive'];
      intensity: 'balanced';
    };
    
    expressive: {
      frequency: 1.2;
      types: ['illustrative', 'emblematic', 'regulatory', 'adaptive'];
      intensity: 'animated';
    };
    
    very_expressive: {
      frequency: 2.0;
      types: 'full_gesture_repertoire';
      intensity: 'highly_animated';
    };
  };
  
  idle_behaviors: {
    micro_movements: {
      breathing: {
        enabled: true;
        rate: [12, 20]; // breaths per minute
        depth: { min: 0.3, max: 0.8 };
        natural_variation: true;
      };
      
      blinking: {
        rate: [15, 25]; // blinks per minute
        duration: [100, 200]; // milliseconds
        double_blink_chance: 0.1;
        context_awareness: true; // less blinking when surprised
      };
      
      subtle_head_movement: {
        enabled: true;
        frequency: 'very_low';
        amplitude: 'minimal';
        patterns: ['slight_tilt', 'micro_nod', 'gaze_shift'];
      };
      
      posture_adjustments: {
        enabled: true;
        frequency: [30, 120]; // seconds between adjustments
        types: ['shoulder_shift', 'weight_redistribution', 'slight_lean'];
      };
    };
    
    attention_patterns: {
      eye_contact: {
        direct_gaze_percentage: { min: 0.4, max: 0.9, default: 0.7 };
        break_patterns: ['look_away_thinking', 'glance_down_processing', 'side_glance'];
        return_timing: [2, 8]; // seconds
      };
      
      listening_behavior: {
        active_listening_cues: ['nodding', 'leaning_forward', 'eyebrow_flash'];
        processing_indicators: ['slight_frown', 'head_tilt', 'pause_reflection'];
        understanding_signals: ['nod', 'smile', 'eye_brightening'];
      };
    };
  };
  
  contextual_adaptations: {
    speaking_vs_listening: {
      speaking: {
        gesture_increase: 1.5;
        eye_contact: 0.6;
        facial_animation: 'increased';
        posture: 'slightly_forward_engaged';
      };
      
      listening: {
        gesture_decrease: 0.3;
        eye_contact: 0.8;
        facial_animation: 'reactive';
        posture: 'attentive_upright';
      };
    };
    
    topic_sensitivity: {
      serious_topics: {
        gesture_reduction: 'appropriate_restraint';
        expression: 'focused_concerned';
        posture: 'formal_attentive';
      };
      
      light_topics: {
        gesture_increase: 'natural_expressiveness';
        expression: 'relaxed_pleasant';
        posture: 'comfortable_open';
      };
    };
  };
  
  cultural_adaptations: {
    western: {
      eye_contact: 'direct_appropriate';
      personal_space: 'arm_length_professional';
      gestures: 'open_expressive';
      touch: 'minimal_professional_handshake';
    };
    
    eastern: {
      eye_contact: 'respectful_moderate';
      personal_space: 'greater_distance';
      gestures: 'controlled_formal';
      bowing: 'appropriate_acknowledgment';
    };
    
    latin: {
      eye_contact: 'warm_direct';
      personal_space: 'closer_comfortable';
      gestures: 'expressive_animated';
      warmth: 'friendly_approachable';
    };
  };
}
```

## Branding and Corporate Customization

### Corporate Identity Integration

```typescript
interface CorporateBrandingCustomization {
  visual_branding: {
    color_schemes: {
      primary_colors: {
        corporate_blue: '#003366';
        corporate_red: '#CC0000';
        corporate_green: '#006600';
        custom_palette: 'brand_specific_colors';
      };
      
      application: {
        clothing_accents: 'tie, scarf, shirt_trim, accessories';
        background_elements: 'logo_placement, branded_backgrounds';
        ui_elements: 'control_panels, progress_bars, buttons';
      };
    };
    
    logo_integration: {
      placement_options: [
        'background_subtle_watermark',
        'clothing_embroidery',
        'badge_pin',
        'screen_corner',
        'business_card_display'
      ];
      
      size_guidelines: {
        subtle: 'barely_visible_professional';
        moderate: 'clearly_visible_not_distracting';
        prominent: 'brand_focused_presentation';
      };
    };
    
    typography: {
      font_families: 'corporate_approved_fonts';
      application: 'subtitles, ui_text, name_badges';
      consistency: 'brand_guideline_compliance';
    };
  };
  
  industry_specific_customization: {
    financial_services: {
      appearance: 'conservative_professional_trustworthy';
      behavior: 'formal_knowledgeable_stable';
      environment: 'office_boardroom_banking_hall';
      props: 'documents, calculator, professional_briefcase';
    };
    
    healthcare: {
      appearance: 'clean_professional_approachable';
      behavior: 'caring_knowledgeable_calm';
      environment: 'medical_office_hospital_clinic';
      props: 'stethoscope, medical_chart, white_coat';
    };
    
    technology: {
      appearance: 'modern_casual_professional_innovative';
      behavior: 'enthusiastic_knowledgeable_forward_thinking';
      environment: 'modern_office_lab_co_working_space';
      props: 'laptop, tablet, tech_gadgets';
    };
    
    education: {
      appearance: 'professional_approachable_scholarly';
      behavior: 'patient_explanatory_encouraging';
      environment: 'classroom_library_academic_office';
      props: 'books, whiteboard, academic_materials';
    };
    
    retail: {
      appearance: 'friendly_stylish_helpful';
      behavior: 'enthusiastic_helpful_customer_focused';
      environment: 'store_showroom_service_counter';
      props: 'products, shopping_bags, price_tags';
    };
  };
  
  role_based_customization: {
    customer_service: {
      personality: 'helpful_patient_empathetic_solution_oriented';
      communication: 'clear_supportive_professional_friendly';
      responses: 'apologetic_when_needed, proactive_problem_solving';
    };
    
    sales: {
      personality: 'confident_enthusiastic_persuasive_goal_oriented';
      communication: 'engaging_benefit_focused_closing_oriented';
      responses: 'objection_handling, value_proposition_focused';
    };
    
    technical_support: {
      personality: 'analytical_patient_detail_oriented_systematic';
      communication: 'clear_step_by_step_technical_but_accessible';
      responses: 'troubleshooting_focused, educational_explanations';
    };
    
    executive_assistant: {
      personality: 'organized_professional_discreet_efficient';
      communication: 'formal_clear_concise_respectful';
      responses: 'schedule_focused, priority_aware, confidential';
    };
    
    trainer_educator: {
      personality: 'patient_encouraging_knowledgeable_motivational';
      communication: 'clear_explanatory_interactive_supportive';
      responses: 'learning_focused, progress_encouraging, adaptive';
    };
  };
}
```

### Implementation Examples

#### Custom Avatar Builder Component

```typescript
@Component({
  selector: 'app-avatar-builder',
  template: `
    <div class="avatar-builder-container">
      <!-- Avatar Preview -->
      <div class="avatar-preview">
        <ng-ui-avatar-2d
          [configuration]="currentAvatarConfig()"
          [size]="{width: 400, height: 500}"
          [showPerformanceStats]="false"
          (configurationChanged)="onAvatarConfigChanged($event)">
        </ng-ui-avatar-2d>
        
        <div class="preview-controls">
          <button (click)="testExpression('happy')">Test Happy</button>
          <button (click)="testExpression('professional')">Test Professional</button>
          <button (click)="testGesture('wave')">Test Wave</button>
          <button (click)="previewAnimation()">Preview Animation</button>
        </div>
      </div>

      <!-- Customization Panel -->
      <div class="customization-panel">
        <div class="customization-tabs">
          <button 
            *ngFor="let tab of customizationTabs"
            [class.active]="activeTab === tab.id"
            (click)="setActiveTab(tab.id)">
            {{ tab.name }}
          </button>
        </div>

        <div class="tab-content">
          <!-- Basic Info Tab -->
          <div *ngIf="activeTab === 'basic'" class="tab-panel">
            <div class="form-group">
              <label>Avatar Name:</label>
              <input 
                type="text" 
                [(ngModel)]="basicSettings.name"
                (ngModelChange)="updateBasicSettings()">
            </div>
            
            <div class="form-group">
              <label>Gender Presentation:</label>
              <select 
                [(ngModel)]="basicSettings.genderPresentation"
                (ngModelChange)="updateBasicSettings()">
                <option value="feminine">Feminine</option>
                <option value="masculine">Masculine</option>
                <option value="non-binary">Non-binary</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Age Group:</label>
              <select 
                [(ngModel)]="basicSettings.ageGroup"
                (ngModelChange)="updateBasicSettings()">
                <option value="young_adult">Young Adult (18-30)</option>
                <option value="middle_aged">Middle Aged (35-50)</option>
                <option value="senior">Senior (55-70)</option>
              </select>
            </div>
            
            <div class="form-group">
              <label>Body Type:</label>
              <select 
                [(ngModel)]="basicSettings.bodyType"
                (ngModelChange)="updateBasicSettings()">
                <option value="slim">Slim</option>
                <option value="average">Average</option>
                <option value="athletic">Athletic</option>
                <option value="heavy">Heavy</option>
              </select>
            </div>
          </div>

          <!-- Facial Features Tab -->
          <div *ngIf="activeTab === 'facial'" class="tab-panel">
            <div class="feature-section">
              <h4>Face Shape</h4>
              <div class="slider-group">
                <label>Jaw Width</label>
                <input 
                  type="range" 
                  min="0.7" 
                  max="1.3" 
                  step="0.1"
                  [(ngModel)]="facialSettings.jawWidth"
                  (ngModelChange)="updateFacialSettings()">
                <span>{{ facialSettings.jawWidth }}</span>
              </div>
              
              <div class="slider-group">
                <label>Cheekbone Prominence</label>
                <input 
                  type="range" 
                  min="0.5" 
                  max="1.5" 
                  step="0.1"
                  [(ngModel)]="facialSettings.cheekboneProminence"
                  (ngModelChange)="updateFacialSettings()">
                <span>{{ facialSettings.cheekboneProminence }}</span>
              </div>
            </div>
            
            <div class="feature-section">
              <h4>Eyes</h4>
              <div class="slider-group">
                <label>Eye Size</label>
                <input 
                  type="range" 
                  min="0.7" 
                  max="1.4" 
                  step="0.1"
                  [(ngModel)]="facialSettings.eyeSize"
                  (ngModelChange)="updateFacialSettings()">
                <span>{{ facialSettings.eyeSize }}</span>
              </div>
              
              <div class="form-group">
                <label>Eye Shape:</label>
                <select 
                  [(ngModel)]="facialSettings.eyeShape"
                  (ngModelChange)="updateFacialSettings()">
                  <option value="almond">Almond</option>
                  <option value="round">Round</option>
                  <option value="hooded">Hooded</option>
                  <option value="upturned">Upturned</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Iris Color:</label>
                <div class="color-picker">
                  <div 
                    *ngFor="let color of eyeColors"
                    class="color-option"
                    [style.background-color]="color.hex"
                    [class.selected]="facialSettings.irisColor === color.name"
                    (click)="setIrisColor(color.name)">
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Skin & Hair Tab -->
          <div *ngIf="activeTab === 'skin-hair'" class="tab-panel">
            <div class="feature-section">
              <h4>Skin Tone</h4>
              <div class="skin-tone-grid">
                <div 
                  *ngFor="let tone of skinTones"
                  class="skin-tone-option"
                  [style.background-color]="tone.hex"
                  [class.selected]="skinSettings.baseTone === tone.name"
                  (click)="setSkinTone(tone.name)"
                  [title]="tone.name">
                </div>
              </div>
              
              <div class="slider-group">
                <label>Skin Smoothness</label>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.1"
                  [(ngModel)]="skinSettings.smoothness"
                  (ngModelChange)="updateSkinSettings()">
              </div>
            </div>
            
            <div class="feature-section">
              <h4>Hair Style</h4>
              <div class="hair-style-grid">
                <div 
                  *ngFor="let style of hairStyles"
                  class="hair-style-option"
                  [class.selected]="hairSettings.style === style.id"
                  (click)="setHairStyle(style.id)">
                  <img [src]="style.thumbnail" [alt]="style.name">
                  <span>{{ style.name }}</span>
                </div>
              </div>
              
              <div class="form-group">
                <label>Hair Color:</label>
                <div class="color-picker">
                  <div 
                    *ngFor="let color of hairColors"
                    class="color-option"
                    [style.background-color]="color.hex"
                    [class.selected]="hairSettings.color === color.name"
                    (click)="setHairColor(color.name)">
                  </div>
                  <input 
                    type="color" 
                    [(ngModel)]="hairSettings.customColor"
                    (ngModelChange)="setCustomHairColor($event)"
                    class="custom-color-picker">
                </div>
              </div>
            </div>
          </div>

          <!-- Clothing Tab -->
          <div *ngIf="activeTab === 'clothing'" class="tab-panel">
            <div class="form-group">
              <label>Clothing Category:</label>
              <select 
                [(ngModel)]="clothingSettings.category"
                (ngModelChange)="updateClothingCategory()">
                <option value="business_formal">Business Formal</option>
                <option value="business_casual">Business Casual</option>
                <option value="casual">Casual</option>
                <option value="industry_specific">Industry Specific</option>
              </select>
            </div>
            
            <div class="clothing-options">
              <div class="clothing-section">
                <h4>Top</h4>
                <div class="clothing-grid">
                  <div 
                    *ngFor="let top of availableTops"
                    class="clothing-option"
                    [class.selected]="clothingSettings.top === top.id"
                    (click)="setClothingItem('top', top.id)">
                    <img [src]="top.thumbnail" [alt]="top.name">
                    <span>{{ top.name }}</span>
                  </div>
                </div>
              </div>
              
              <div class="clothing-section" *ngIf="availableBottoms.length > 0">
                <h4>Bottom</h4>
                <div class="clothing-grid">
                  <div 
                    *ngFor="let bottom of availableBottoms"
                    class="clothing-option"
                    [class.selected]="clothingSettings.bottom === bottom.id"
                    (click)="setClothingItem('bottom', bottom.id)">
                    <img [src]="bottom.thumbnail" [alt]="bottom.name">
                    <span>{{ bottom.name }}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="accessories-section">
              <h4>Accessories</h4>
              <div class="accessory-checkboxes">
                <label *ngFor="let accessory of availableAccessories">
                  <input 
                    type="checkbox" 
                    [checked]="clothingSettings.accessories.includes(accessory.id)"
                    (change)="toggleAccessory(accessory.id)">
                  {{ accessory.name }}
                </label>
              </div>
            </div>
          </div>

          <!-- Personality Tab -->
          <div *ngIf="activeTab === 'personality'" class="tab-panel">
            <div class="personality-section">
              <h4>Personality Traits</h4>
              
              <div *ngFor="let trait of personalityTraits" class="trait-slider">
                <label>{{ trait.name }}</label>
                <div class="trait-scale">
                  <span class="scale-label">{{ trait.lowLabel }}</span>
                  <input 
                    type="range" 
                    min="0" 
                    max="1" 
                    step="0.1"
                    [(ngModel)]="personalitySettings[trait.key]"
                    (ngModelChange)="updatePersonality()">
                  <span class="scale-label">{{ trait.highLabel }}</span>
                </div>
                <div class="trait-description">
                  {{ getTraitDescription(trait.key, personalitySettings[trait.key]) }}
                </div>
              </div>
            </div>
            
            <div class="communication-section">
              <h4>Communication Style</h4>
              
              <div class="form-group">
                <label>Formality Level:</label>
                <select 
                  [(ngModel)]="personalitySettings.formalityLevel"
                  (ngModelChange)="updatePersonality()">
                  <option value="very_formal">Very Formal</option>
                  <option value="formal">Formal</option>
                  <option value="casual">Casual</option>
                  <option value="informal">Informal</option>
                </select>
              </div>
              
              <div class="form-group">
                <label>Response Speed:</label>
                <select 
                  [(ngModel)]="personalitySettings.responseSpeed"
                  (ngModelChange)="updatePersonality()">
                  <option value="quick">Quick Responder</option>
                  <option value="moderate">Moderate</option>
                  <option value="thoughtful">Thoughtful</option>
                  <option value="deliberate">Deliberate</option>
                </select>
              </div>
            </div>
          </div>

          <!-- Branding Tab -->
          <div *ngIf="activeTab === 'branding'" class="tab-panel">
            <div class="branding-section">
              <h4>Corporate Colors</h4>
              <div class="color-inputs">
                <div class="color-input-group">
                  <label>Primary Color:</label>
                  <input 
                    type="color" 
                    [(ngModel)]="brandingSettings.primaryColor"
                    (ngModelChange)="updateBranding()">
                </div>
                <div class="color-input-group">
                  <label>Secondary Color:</label>
                  <input 
                    type="color" 
                    [(ngModel)]="brandingSettings.secondaryColor"
                    (ngModelChange)="updateBranding()">
                </div>
              </div>
            </div>
            
            <div class="logo-section">
              <h4>Logo Integration</h4>
              <div class="form-group">
                <label>Logo Upload:</label>
                <input 
                  type="file" 
                  accept="image/*"
                  (change)="uploadLogo($event)">
              </div>
              
              <div class="form-group" *ngIf="brandingSettings.logoUrl">
                <label>Logo Placement:</label>
                <select 
                  [(ngModel)]="brandingSettings.logoPlacement"
                  (ngModelChange)="updateBranding()">
                  <option value="background">Background Watermark</option>
                  <option value="clothing">Clothing Embroidery</option>
                  <option value="badge">Badge/Pin</option>
                  <option value="none">None</option>
                </select>
              </div>
            </div>
            
            <div class="industry-section">
              <h4>Industry Template</h4>
              <div class="form-group">
                <label>Industry:</label>
                <select 
                  [(ngModel)]="brandingSettings.industry"
                  (ngModelChange)="applyIndustryTemplate($event)">
                  <option value="">Custom</option>
                  <option value="financial">Financial Services</option>
                  <option value="healthcare">Healthcare</option>
                  <option value="technology">Technology</option>
                  <option value="education">Education</option>
                  <option value="retail">Retail</option>
                </select>
              </div>
              
              <div class="form-group" *ngIf="brandingSettings.industry">
                <label>Role:</label>
                <select 
                  [(ngModel)]="brandingSettings.role"
                  (ngModelChange)="updateBranding()">
                  <option *ngFor="let role of getIndustryRoles(brandingSettings.industry)" 
                          [value]="role.id">
                    {{ role.name }}
                  </option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="action-buttons">
          <button class="btn-secondary" (click)="resetToDefaults()">
            Reset to Defaults
          </button>
          <button class="btn-secondary" (click)="saveAsPreset()">
            Save as Preset
          </button>
          <button class="btn-primary" (click)="exportConfiguration()">
            Export Configuration
          </button>
          <button class="btn-primary" (click)="applyConfiguration()">
            Apply Changes
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .avatar-builder-container {
      display: flex;
      height: 100vh;
      background: #f5f5f5;
    }
    
    .avatar-preview {
      flex: 0 0 450px;
      background: white;
      padding: 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    
    .preview-controls {
      margin-top: 20px;
      display: flex;
      gap: 10px;
      flex-wrap: wrap;
    }
    
    .customization-panel {
      flex: 1;
      background: white;
      display: flex;
      flex-direction: column;
    }
    
    .customization-tabs {
      display: flex;
      border-bottom: 1px solid #ddd;
      background: #f8f9fa;
    }
    
    .customization-tabs button {
      padding: 15px 20px;
      border: none;
      background: transparent;
      cursor: pointer;
      border-bottom: 3px solid transparent;
    }
    
    .customization-tabs button.active {
      background: white;
      border-bottom-color: #007bff;
      color: #007bff;
    }
    
    .tab-content {
      flex: 1;
      padding: 20px;
      overflow-y: auto;
    }
    
    .form-group {
      margin-bottom: 20px;
    }
    
    .form-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    
    .slider-group {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }
    
    .slider-group label {
      min-width: 120px;
      margin-bottom: 0;
    }
    
    .slider-group input[type="range"] {
      flex: 1;
    }
    
    .color-picker {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
    
    .color-option {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      border: 2px solid transparent;
    }
    
    .color-option.selected {
      border-color: #007bff;
    }
    
    .skin-tone-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
      margin-bottom: 20px;
    }
    
    .skin-tone-option {
      width: 50px;
      height: 50px;
      border-radius: 10px;
      cursor: pointer;
      border: 3px solid transparent;
    }
    
    .skin-tone-option.selected {
      border-color: #007bff;
    }
    
    .hair-style-grid, .clothing-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 15px;
      margin-bottom: 20px;
    }
    
    .hair-style-option, .clothing-option {
      text-align: center;
      cursor: pointer;
      padding: 10px;
      border: 2px solid transparent;
      border-radius: 8px;
    }
    
    .hair-style-option.selected, .clothing-option.selected {
      border-color: #007bff;
      background: #f0f8ff;
    }
    
    .hair-style-option img, .clothing-option img {
      width: 60px;
      height: 60px;
      object-fit: cover;
      border-radius: 5px;
      margin-bottom: 5px;
    }
    
    .trait-slider {
      margin-bottom: 25px;
    }
    
    .trait-scale {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .trait-scale input[type="range"] {
      flex: 1;
    }
    
    .scale-label {
      font-size: 12px;
      color: #666;
      min-width: 80px;
      text-align: center;
    }
    
    .trait-description {
      font-size: 14px;
      color: #666;
      margin-top: 5px;
      font-style: italic;
    }
    
    .action-buttons {
      padding: 20px;
      border-top: 1px solid #ddd;
      display: flex;
      gap: 10px;
      justify-content: flex-end;
    }
    
    .btn-primary {
      background: #007bff;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }
    
    .btn-secondary {
      background: #6c757d;
      color: white;
      border: none;
      padding: 10px 20px;
      border-radius: 5px;
      cursor: pointer;
    }
  `]
})
export class AvatarBuilderComponent implements OnInit {
  activeTab = 'basic';
  
  customizationTabs = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'facial', name: 'Facial Features' },
    { id: 'skin-hair', name: 'Skin & Hair' },
    { id: 'clothing', name: 'Clothing' },
    { id: 'personality', name: 'Personality' },
    { id: 'branding', name: 'Branding' }
  ];

  // Settings objects
  basicSettings = {
    name: 'My Avatar',
    genderPresentation: 'feminine',
    ageGroup: 'young_adult',
    bodyType: 'average'
  };

  facialSettings = {
    jawWidth: 1.0,
    cheekboneProminence: 1.0,
    eyeSize: 1.0,
    eyeShape: 'almond',
    irisColor: 'brown'
  };

  skinSettings = {
    baseTone: 'medium',
    smoothness: 0.8
  };

  hairSettings = {
    style: 'shoulder_length',
    color: 'brown',
    customColor: '#8B4513'
  };

  clothingSettings = {
    category: 'business_casual',
    top: 'blouse',
    bottom: 'dress_pants',
    accessories: ['earrings']
  };

  personalitySettings = {
    extraversion: 0.7,
    agreeableness: 0.8,
    conscientiousness: 0.6,
    neuroticism: 0.3,
    openness: 0.7,
    formalityLevel: 'formal',
    responseSpeed: 'moderate'
  };

  brandingSettings = {
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
    logoUrl: '',
    logoPlacement: 'none',
    industry: '',
    role: ''
  };

  // Data arrays
  eyeColors = [
    { name: 'brown', hex: '#8B4513' },
    { name: 'blue', hex: '#4169E1' },
    { name: 'green', hex: '#228B22' },
    { name: 'hazel', hex: '#DAA520' },
    { name: 'gray', hex: '#708090' }
  ];

  skinTones = [
    { name: 'very_light', hex: '#FDBCB4' },
    { name: 'light', hex: '#EDBAA6' },
    { name: 'light_medium', hex: '#D08B5B' },
    { name: 'medium', hex: '#AE7242' },
    { name: 'medium_dark', hex: '#8D5524' },
    { name: 'dark', hex: '#714A23' }
  ];

  hairStyles = [
    { id: 'short_professional', name: 'Short Professional', thumbnail: '/assets/hair/short-prof.jpg' },
    { id: 'medium_wavy', name: 'Medium Wavy', thumbnail: '/assets/hair/med-wavy.jpg' },
    { id: 'long_straight', name: 'Long Straight', thumbnail: '/assets/hair/long-straight.jpg' }
  ];

  hairColors = [
    { name: 'black', hex: '#1C1C1C' },
    { name: 'brown', hex: '#8B4513' },
    { name: 'blonde', hex: '#D4B46A' },
    { name: 'red', hex: '#A0522D' }
  ];

  personalityTraits = [
    {
      key: 'extraversion',
      name: 'Extraversion',
      lowLabel: 'Reserved',
      highLabel: 'Outgoing'
    },
    {
      key: 'agreeableness',
      name: 'Agreeableness',
      lowLabel: 'Competitive',
      highLabel: 'Cooperative'
    },
    {
      key: 'conscientiousness',
      name: 'Conscientiousness',
      lowLabel: 'Flexible',
      highLabel: 'Organized'
    },
    {
      key: 'neuroticism',
      name: 'Emotional Stability',
      lowLabel: 'Calm',
      highLabel: 'Reactive'
    },
    {
      key: 'openness',
      name: 'Openness',
      lowLabel: 'Practical',
      highLabel: 'Creative'
    }
  ];

  // Dynamic properties
  availableTops: any[] = [];
  availableBottoms: any[] = [];
  availableAccessories: any[] = [];

  // Signal for reactive avatar config
  currentAvatarConfig = signal<AvatarConfiguration>({
    character: {
      name: this.basicSettings.name,
      model: 'young-woman',
      skinTone: 'medium',
      hair: { style: 'shoulder_length', color: '#8B4513' },
      clothing: { top: 'blouse', bottom: 'dress_pants' }
    },
    layers: [],
    customizations: {},
    animations: {
      blinkFrequency: 3000,
      idleAnimations: true
    }
  });

  @ViewChild(Avatar2d) avatar!: Avatar2d;

  ngOnInit() {
    this.updateClothingOptions();
    this.buildAvatarConfiguration();
  }

  setActiveTab(tabId: string) {
    this.activeTab = tabId;
  }

  // Update methods
  updateBasicSettings() {
    this.buildAvatarConfiguration();
  }

  updateFacialSettings() {
    this.buildAvatarConfiguration();
  }

  updateSkinSettings() {
    this.buildAvatarConfiguration();
  }

  updateClothingCategory() {
    this.updateClothingOptions();
    this.buildAvatarConfiguration();
  }

  updatePersonality() {
    this.buildAvatarConfiguration();
  }

  updateBranding() {
    this.buildAvatarConfiguration();
  }

  // Specific setters
  setIrisColor(color: string) {
    this.facialSettings.irisColor = color;
    this.updateFacialSettings();
  }

  setSkinTone(tone: string) {
    this.skinSettings.baseTone = tone;
    this.updateSkinSettings();
  }

  setHairStyle(style: string) {
    this.hairSettings.style = style;
    this.buildAvatarConfiguration();
  }

  setHairColor(color: string) {
    this.hairSettings.color = color;
    this.buildAvatarConfiguration();
  }

  setCustomHairColor(color: string) {
    this.hairSettings.customColor = color;
    this.hairSettings.color = 'custom';
    this.buildAvatarConfiguration();
  }

  setClothingItem(type: string, itemId: string) {
    this.clothingSettings[type as keyof typeof this.clothingSettings] = itemId;
    this.buildAvatarConfiguration();
  }

  toggleAccessory(accessoryId: string) {
    const index = this.clothingSettings.accessories.indexOf(accessoryId);
    if (index === -1) {
      this.clothingSettings.accessories.push(accessoryId);
    } else {
      this.clothingSettings.accessories.splice(index, 1);
    }
    this.buildAvatarConfiguration();
  }

  // Helper methods
  private updateClothingOptions() {
    // Update available clothing based on category
    const clothingOptions = {
      business_formal: {
        tops: [
          { id: 'dress_shirt', name: 'Dress Shirt', thumbnail: '/assets/clothing/dress-shirt.jpg' },
          { id: 'blouse', name: 'Blouse', thumbnail: '/assets/clothing/blouse.jpg' }
        ],
        bottoms: [
          { id: 'dress_pants', name: 'Dress Pants', thumbnail: '/assets/clothing/dress-pants.jpg' },
          { id: 'pencil_skirt', name: 'Pencil Skirt', thumbnail: '/assets/clothing/pencil-skirt.jpg' }
        ]
      },
      // Add more categories...
    };

    const category = clothingOptions[this.clothingSettings.category as keyof typeof clothingOptions];
    this.availableTops = category?.tops || [];
    this.availableBottoms = category?.bottoms || [];
    
    this.availableAccessories = [
      { id: 'earrings', name: 'Earrings' },
      { id: 'necklace', name: 'Necklace' },
      { id: 'watch', name: 'Watch' },
      { id: 'glasses', name: 'Glasses' }
    ];
  }

  private buildAvatarConfiguration() {
    const config: AvatarConfiguration = {
      character: {
        name: this.basicSettings.name,
        model: this.getModelFromSettings(),
        skinTone: this.skinSettings.baseTone,
        hair: {
          style: this.hairSettings.style,
          color: this.hairSettings.color === 'custom' ? 
                 this.hairSettings.customColor : this.getHairColorHex()
        },
        clothing: {
          top: this.clothingSettings.top,
          bottom: this.clothingSettings.bottom,
          accessories: this.clothingSettings.accessories
        }
      },
      layers: this.generateLayers(),
      customizations: this.generateCustomizations(),
      animations: this.generateAnimationSettings()
    };

    this.currentAvatarConfig.set(config);
  }

  private getModelFromSettings(): string {
    const { genderPresentation, ageGroup } = this.basicSettings;
    
    if (ageGroup === 'young_adult') {
      return genderPresentation === 'masculine' ? 'young-man' : 'young-woman';
    } else if (ageGroup === 'middle_aged') {
      return genderPresentation === 'masculine' ? 'middle-aged-man' : 'middle-aged-woman';
    }
    
    return 'young-woman'; // default
  }

  private getHairColorHex(): string {
    const colorMap = {
      black: '#1C1C1C',
      brown: '#8B4513',
      blonde: '#D4B46A',
      red: '#A0522D'
    };
    
    return colorMap[this.hairSettings.color as keyof typeof colorMap] || '#8B4513';
  }

  private generateLayers(): any[] {
    // Generate layer configuration based on settings
    return [];
  }

  private generateCustomizations(): any {
    return {
      skinColor: this.getSkinColorRGBA(),
      hairColor: this.getHairColorRGBA(),
      eyeColor: this.getEyeColorRGBA(),
      facialAdjustments: {
        jawWidth: this.facialSettings.jawWidth,
        cheekboneProminence: this.facialSettings.cheekboneProminence,
        eyeSize: this.facialSettings.eyeSize
      }
    };
  }

  private generateAnimationSettings(): any {
    return {
      blinkFrequency: 3000,
      idleAnimations: true,
      personality: this.personalitySettings,
      gestureFrequency: this.personalitySettings.extraversion,
      expressiveness: this.personalitySettings.openness
    };
  }

  private getSkinColorRGBA(): any {
    // Convert skin tone to RGBA
    const tone = this.skinTones.find(t => t.name === this.skinSettings.baseTone);
    return this.hexToRGBA(tone?.hex || '#AE7242');
  }

  private getHairColorRGBA(): any {
    const color = this.hairSettings.color === 'custom' ? 
                 this.hairSettings.customColor : this.getHairColorHex();
    return this.hexToRGBA(color);
  }

  private getEyeColorRGBA(): any {
    const color = this.eyeColors.find(c => c.name === this.facialSettings.irisColor);
    return this.hexToRGBA(color?.hex || '#8B4513');
  }

  private hexToRGBA(hex: string): any {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b, a: 1 };
  }

  // Event handlers
  testExpression(expression: string) {
    if (this.avatar) {
      this.avatar.changeExpression({ 
        id: expression, 
        name: expression,
        eyeState: {} as any,
        eyebrowState: {} as any,
        mouthState: {} as any
      });
    }
  }

  testGesture(gesture: string) {
    if (this.avatar) {
      this.avatar.playGesture({
        id: gesture,
        name: gesture,
        type: gesture as any,
        frames: [],
        duration: 1000,
        loop: false
      });
    }
  }

  previewAnimation() {
    this.testExpression('happy');
    setTimeout(() => this.testGesture('wave'), 500);
    setTimeout(() => this.testExpression('neutral'), 2000);
  }

  onAvatarConfigChanged(config: AvatarConfiguration) {
    // Handle configuration changes from avatar component
    console.log('Avatar configuration changed:', config);
  }

  getTraitDescription(trait: string, value: number): string {
    const descriptions = {
      extraversion: value > 0.7 ? 'Very outgoing and energetic' : 
                   value > 0.3 ? 'Balanced social interaction' : 'Reserved and thoughtful',
      agreeableness: value > 0.7 ? 'Very cooperative and trusting' :
                    value > 0.3 ? 'Moderately agreeable' : 'Independent and analytical',
      // Add more descriptions...
    };
    
    return descriptions[trait as keyof typeof descriptions] || 'Balanced approach';
  }

  uploadLogo(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.brandingSettings.logoUrl = e.target?.result as string;
        this.updateBranding();
      };
      reader.readAsDataURL(file);
    }
  }

  applyIndustryTemplate(industry: string) {
    // Apply industry-specific defaults
    const templates = {
      financial: {
        clothing: { category: 'business_formal', top: 'dress_shirt' },
        personality: { formalityLevel: 'formal', conscientiousness: 0.8 }
      },
      healthcare: {
        clothing: { category: 'medical', top: 'scrubs' },
        personality: { agreeableness: 0.9, conscientiousness: 0.8 }
      },
      // Add more templates...
    };

    const template = templates[industry as keyof typeof templates];
    if (template) {
      Object.assign(this.clothingSettings, template.clothing);
      Object.assign(this.personalitySettings, template.personality);
      this.updateClothingOptions();
      this.buildAvatarConfiguration();
    }
  }

  getIndustryRoles(industry: string): any[] {
    const roles = {
      financial: [
        { id: 'advisor', name: 'Financial Advisor' },
        { id: 'analyst', name: 'Analyst' },
        { id: 'manager', name: 'Account Manager' }
      ],
      healthcare: [
        { id: 'nurse', name: 'Nurse' },
        { id: 'doctor', name: 'Doctor' },
        { id: 'receptionist', name: 'Receptionist' }
      ],
      // Add more roles...
    };

    return roles[industry as keyof typeof roles] || [];
  }

  // Action methods
  resetToDefaults() {
    // Reset all settings to defaults
    this.basicSettings = {
      name: 'My Avatar',
      genderPresentation: 'feminine',
      ageGroup: 'young_adult',
      bodyType: 'average'
    };
    
    // Reset other settings...
    this.buildAvatarConfiguration();
  }

  saveAsPreset() {
    const preset = {
      name: prompt('Enter preset name:'),
      configuration: this.currentAvatarConfig()
    };
    
    if (preset.name) {
      // Save to localStorage or send to backend
      const presets = JSON.parse(localStorage.getItem('avatarPresets') || '[]');
      presets.push(preset);
      localStorage.setItem('avatarPresets', JSON.stringify(presets));
      
      alert('Preset saved successfully!');
    }
  }

  exportConfiguration() {
    const config = this.currentAvatarConfig();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.basicSettings.name}-avatar-config.json`;
    a.click();
    
    URL.revokeObjectURL(url);
  }

  applyConfiguration() {
    // Apply the configuration to the main avatar system
    const config = this.currentAvatarConfig();
    console.log('Applying avatar configuration:', config);
    
    // Emit configuration or call parent component method
    // this.configurationApplied.emit(config);
    
    alert('Configuration applied successfully!');
  }
}
```

The Avatar Customization system provides comprehensive control over every aspect of avatar appearance, behavior, and branding. From detailed facial features to personality traits and corporate identity, the system ensures that each avatar can be perfectly tailored to specific use cases and brand requirements while maintaining high performance and visual quality.