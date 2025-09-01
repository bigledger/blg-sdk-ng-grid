# Gesture System Features

Advanced gesture recognition, animation, and generation system for natural avatar communication in the BigLedger Avatar Library.

## Overview

The Gesture System provides comprehensive support for avatar body language, hand gestures, facial expressions, and contextual animations. It combines pre-defined gesture libraries with AI-powered gesture generation, real-time recognition, and cultural adaptation for natural, engaging avatar interactions.

## Core Gesture Categories

### Hand and Arm Gestures

#### Communication Gestures

```typescript
interface CommunicativeGestures {
  pointing_gestures: {
    index_point: {
      description: 'Point with index finger';
      variations: ['direct_point', 'polite_point', 'open_palm_point'];
      cultural_adaptations: {
        western: 'direct_index_pointing_acceptable';
        eastern: 'open_palm_pointing_preferred';
        middle_eastern: 'avoid_single_finger_pointing';
      };
      timing: {
        preparation: 300; // milliseconds
        stroke: 200;
        hold: 500;
        retraction: 400;
      };
    };
    
    directional_pointing: {
      variations: ['point_left', 'point_right', 'point_up', 'point_down'];
      spatial_accuracy: 'precise_directional_indication';
      eye_coordination: 'gaze_follows_point_direction';
    };
  };
  
  emblematic_gestures: {
    thumbs_up: {
      meaning: 'approval, agreement, good';
      cultural_safety: 'universally_positive';
      intensity_levels: ['subtle', 'moderate', 'enthusiastic'];
      animation_curve: 'quick_up_slow_down';
    };
    
    ok_sign: {
      meaning: 'okay, perfect, agreement';
      cultural_warnings: ['offensive_in_brazil_turkey'];
      alternative_regions: 'thumbs_up_safer_alternative';
      precision: 'finger_circle_formation';
    };
    
    peace_sign: {
      variations: ['palm_forward', 'palm_backward'];
      cultural_meanings: {
        palm_forward: 'peace_victory_universally_positive';
        palm_backward: 'offensive_in_uk_australia';
      };
    };
    
    stop_gesture: {
      variations: ['open_palm_stop', 'both_hands_stop', 'traffic_stop'];
      urgency_levels: ['polite_request', 'firm_stop', 'urgent_halt'];
      body_coordination: 'forward_lean_for_emphasis';
    };
  };
  
  numerical_gestures: {
    counting: {
      finger_counting: {
        western_style: 'thumb_last, start_with_index';
        eastern_style: 'thumb_first, traditional_counting';
        german_style: 'thumb_for_one, cultural_specific';
      };
      
      both_hands: {
        range: [1, 10];
        clear_display: 'hands_positioned_for_visibility';
        sequential_reveal: 'progressive_finger_extension';
      };
    };
  };
  
  regulatory_gestures: {
    come_here: {
      variations: ['palm_up_beckoning', 'finger_wave', 'full_arm_wave'];
      cultural_adaptations: {
        western: 'palm_up_fingers_curl';
        asian: 'palm_down_wave_motion';
      };
      distance_appropriate: 'gesture_size_scales_with_distance';
    };
    
    go_away: {
      variations: ['palm_push', 'dismissive_wave', 'shooing_motion'];
      politeness_levels: ['gentle_redirect', 'firm_dismiss', 'urgent_removal'];
    };
    
    wait_gesture: {
      variations: ['raised_palm', 'index_finger_up', 'both_hands_calm'];
      patience_indication: 'calm_controlled_movement';
      eye_contact: 'reassuring_gaze_maintenance';
    };
  };
}
```

#### Descriptive Gestures

```typescript
interface DescriptiveGestures {
  size_indication: {
    small: {
      gestures: ['pinch_fingers', 'tiny_gap', 'miniature_hold'];
      precision: 'millimeter_level_indication';
      facial_expression: 'concentrated_focus';
    };
    
    medium: {
      gestures: ['cupped_hands', 'moderate_spread', 'bowling_ball_hold'];
      proportional: 'hands_match_described_size';
      stability: 'steady_hold_position';
    };
    
    large: {
      gestures: ['wide_arm_spread', 'embrace_size', 'overhead_reach'];
      expansiveness: 'full_body_engagement';
      emphasis: 'dramatic_size_demonstration';
    };
    
    huge: {
      gestures: ['maximum_arm_extension', 'whole_body_spread', 'infinity_gesture'];
      exaggeration: 'theatrical_size_indication';
      awe_expression: 'amazement_facial_coordination';
    };
  };
  
  shape_description: {
    round: {
      gestures: ['circular_trace', 'sphere_hold', 'round_outline'];
      smoothness: 'fluid_circular_motion';
      completion: 'full_circle_trace';
    };
    
    square_rectangular: {
      gestures: ['corner_trace', 'box_outline', 'frame_gesture'];
      precision: 'sharp_corner_definition';
      systematic: 'methodical_edge_tracing';
    };
    
    linear: {
      gestures: ['straight_line_trace', 'horizon_sweep', 'edge_follow'];
      directness: 'clean_straight_movement';
      length_variation: 'short_medium_long_lines';
    };
  };
  
  movement_indication: {
    up_down: {
      gestures: ['vertical_motion', 'elevator_movement', 'bounce_indicate'];
      rhythm: 'consistent_vertical_rhythm';
      range: 'appropriate_movement_extent';
    };
    
    side_to_side: {
      gestures: ['horizontal_sweep', 'pendulum_motion', 'side_indication'];
      smoothness: 'fluid_horizontal_movement';
      symmetry: 'balanced_left_right_motion';
    };
    
    circular_motion: {
      gestures: ['stirring_motion', 'wheel_turning', 'orbital_movement'];
      direction_options: ['clockwise', 'counterclockwise', 'alternating'];
      speed_variation: 'slow_medium_fast_circles';
    };
    
    complex_paths: {
      gestures: ['zigzag_trace', 'spiral_motion', 'wave_pattern'];
      precision: 'accurate_path_recreation';
      repeatability: 'consistent_complex_patterns';
    };
  };
  
  texture_quality: {
    smooth: {
      gestures: ['gentle_stroke', 'silk_touch', 'flowing_caress'];
      delicacy: 'light_smooth_movement';
      appreciation: 'tactile_pleasure_expression';
    };
    
    rough: {
      gestures: ['scraping_motion', 'sandpaper_feel', 'bumpy_trace'];
      contrast: 'irregular_jerky_movement';
      texture_emphasis: 'tactile_discomfort_indication';
    };
    
    soft: {
      gestures: ['pillow_squeeze', 'cotton_touch', 'marshmallow_press'];
      gentleness: 'careful_soft_handling';
      comfort_expression: 'pleasant_tactile_reaction';
    };
    
    hard: {
      gestures: ['knocking_motion', 'firm_tap', 'solid_press'];
      solidity: 'confident_firm_contact';
      resistance_indication: 'immovable_object_gesture';
    };
  };
}
```

### Head and Facial Gestures

#### Affirmative and Negative Responses

```typescript
interface HeadGestures {
  nodding_patterns: {
    agreement_nod: {
      pattern: 'vertical_head_movement';
      repetitions: [1, 3]; // single nod to triple nod
      intensity: {
        subtle: { angle: 15, speed: 'slow' };
        moderate: { angle: 25, speed: 'medium' };
        emphatic: { angle: 35, speed: 'quick' };
      };
      
      cultural_variations: {
        western: 'up_down_vertical_nod';
        bulgarian: 'side_to_side_for_yes';
        indian: 'head_wobble_agreement';
      };
      
      timing_coordination: {
        with_speech: 'align_with_affirmative_words';
        listening: 'encouraging_understanding_nods';
        thinking: 'contemplative_slow_nods';
      };
    };
    
    disagreement_shake: {
      pattern: 'horizontal_head_movement';
      speed: 'quick_decisive_movement';
      angle: [20, 40]; // degrees left-right
      
      intensity_levels: {
        polite_disagreement: 'gentle_single_shake';
        firm_no: 'multiple_quick_shakes';
        strong_refusal: 'wide_emphatic_shakes';
      };
      
      facial_coordination: {
        eyebrows: 'slight_furrow_for_emphasis';
        mouth: 'closed_firm_expression';
        eyes: 'direct_serious_gaze';
      };
    };
  };
  
  directional_head_movement: {
    head_tilt: {
      curiosity_tilt: {
        angle: [10, 25]; // degrees
        direction: 'typically_right_for_right_handed';
        duration: 'sustained_during_question';
        facial_expression: 'raised_eyebrow_interest';
      };
      
      confusion_tilt: {
        pattern: 'slight_back_and_forth';
        angle: 15;
        facial_coordination: 'furrowed_brow_puzzled_expression';
      };
      
      affection_tilt: {
        angle: [20, 35];
        direction: 'toward_subject_of_affection';
        gentleness: 'slow_caring_movement';
        eye_coordination: 'soft_warm_gaze';
      };
    };
    
    head_turn: {
      attention_shift: {
        speed: 'natural_tracking_movement';
        range: [30, 90]; // degrees
        eye_coordination: 'eyes_lead_head_follows';
      };
      
      presentation_turn: {
        pattern: 'systematic_audience_engagement';
        timing: 'coordinated_with_speech_sections';
        return_to_center: 'natural_neutral_position';
      };
      
      dismissive_turn: {
        speed: 'quick_sharp_movement';
        angle: [45, 90];
        body_coordination: 'possible_shoulder_turn';
      };
    };
  };
  
  thinking_gestures: {
    contemplation: {
      head_position: 'slight_downward_gaze';
      hand_coordination: 'chin_stroke_or_temple_touch';
      eye_movement: 'unfocused_internal_processing';
      duration: 'sustained_thoughtful_pause';
    };
    
    problem_solving: {
      pattern: 'alternating_head_positions';
      movement: 'slight_side_to_side_consideration';
      facial_expression: 'concentrated_analysis';
      tempo: 'rhythmic_thinking_pattern';
    };
  };
}
```

### Body Language and Posture

#### Postural Communication

```typescript
interface PosturalCommunication {
  engagement_postures: {
    high_engagement: {
      torso: 'forward_lean_15_degrees';
      shoulders: 'square_open_position';
      arms: 'uncrossed_available';
      head: 'upright_alert_position';
      
      variations: {
        listening: 'slight_forward_lean_with_nod_readiness';
        speaking: 'confident_upright_with_gesture_support';
        collaborative: 'open_welcoming_body_position';
      };
    };
    
    moderate_engagement: {
      torso: 'neutral_upright_position';
      shoulders: 'relaxed_natural_position';
      arms: 'comfortable_at_sides_or_folded';
      head: 'natural_forward_gaze';
      
      adaptability: 'ready_to_shift_to_higher_engagement';
      sustainability: 'comfortable_for_extended_periods';
    };
    
    low_engagement: {
      torso: 'slight_backward_lean_or_slouch';
      shoulders: 'relaxed_possibly_rounded';
      arms: 'crossed_or_hands_in_pockets';
      head: 'possible_downward_gaze';
      
      appropriate_contexts: ['casual_conversation', 'break_time', 'informal_settings'];
    };
  };
  
  authority_postures: {
    confident_authority: {
      stance: 'feet_shoulder_width_apart';
      torso: 'upright_expanded_chest';
      shoulders: 'back_squared_position';
      arms: 'hands_on_hips_or_behind_back';
      head: 'chin_slightly_raised';
      
      gesture_coordination: 'decisive_purposeful_movements';
      voice_coordination: 'clear_projection_support';
    };
    
    approachable_authority: {
      stance: 'stable_but_relaxed';
      arms: 'open_welcoming_position';
      facial_expression: 'confident_but_warm';
      gesture_style: 'inclusive_inviting_movements';
      
      balance: 'authority_with_accessibility';
    };
  };
  
  receptive_postures: {
    active_listening: {
      torso: 'slight_forward_lean';
      head: 'tilted_toward_speaker';
      arms: 'open_uncrossed';
      hands: 'visible_relaxed';
      
      micro_movements: 'subtle_encouraging_nods';
      eye_contact: 'attentive_not_staring';
    };
    
    empathetic_receiving: {
      overall_posture: 'open_vulnerable_position';
      facial_expression: 'soft_understanding';
      gesture_readiness: 'prepared_for_comforting_gestures';
      
      emotional_mirroring: 'subtle_posture_matching';
    };
  };
  
  defensive_postures: {
    mild_defense: {
      arms: 'crossed_chest_level';
      stance: 'weight_on_back_foot';
      head: 'neutral_or_slight_tilt_away';
      
      transition_ready: 'can_quickly_open_to_receptive';
    };
    
    strong_defense: {
      arms: 'tightly_crossed_high_on_chest';
      stance: 'weight_shifted_back';
      head: 'turned_slightly_away';
      shoulders: 'raised_tensed';
      
      de_escalation_path: 'gradual_softening_sequence';
    };
  };
}
```

## AI-Powered Gesture Generation

### Contextual Gesture Selection

```typescript
interface ContextualGestureGeneration {
  text_analysis: {
    semantic_analysis: {
      key_concepts: 'extract_main_ideas_for_gesture_mapping';
      emotional_tone: 'determine_overall_emotional_context';
      emphasis_points: 'identify_words_needing_gestural_support';
      narrative_structure: 'understand_story_flow_for_pacing';
    };
    
    linguistic_features: {
      adjectives: {
        size_descriptors: 'map_to_size_indication_gestures';
        quality_descriptors: 'map_to_texture_quality_gestures';
        emotional_descriptors: 'map_to_emotional_expressions';
      };
      
      verbs: {
        action_verbs: 'map_to_movement_gestures';
        state_verbs: 'map_to_postural_adjustments';
        directional_verbs: 'map_to_pointing_indicating_gestures';
      };
      
      intensifiers: {
        very_extremely: 'increase_gesture_intensity';
        somewhat_slightly: 'reduce_gesture_intensity';
        absolutely_definitely: 'add_emphatic_gestures';
      };
    };
  };
  
  contextual_adaptation: {
    conversation_type: {
      presentation: {
        gesture_frequency: 'high_for_audience_engagement';
        gesture_size: 'larger_for_visibility';
        directional_gestures: 'frequent_for_content_reference';
        authority_posture: 'maintained_throughout';
      };
      
      casual_conversation: {
        gesture_frequency: 'moderate_natural_flow';
        gesture_size: 'intimate_appropriate';
        relaxed_posture: 'comfortable_sustainable';
        responsive_gestures: 'reactive_to_conversation_partner';
      };
      
      customer_service: {
        gesture_frequency: 'moderate_professional';
        helping_gestures: 'supportive_guiding_movements';
        calming_posture: 'reassuring_stable';
        problem_solving_indicators: 'thinking_processing_gestures';
      };
      
      educational: {
        explanatory_gestures: 'high_frequency_for_clarity';
        size_and_concept_gestures: 'frequent_descriptive';
        encouraging_posture: 'supportive_patient';
        checking_understanding: 'questioning_receptive_gestures';
      };
    };
    
    audience_adaptation: {
      age_groups: {
        children: {
          gesture_exaggeration: 'increased_for_engagement';
          playful_movements: 'fun_energetic_gestures';
          safety_gestures: 'clear_warning_indication';
        };
        
        adults: {
          professional_gestures: 'business_appropriate';
          respect_indicators: 'formal_courtesy_gestures';
          efficiency_focus: 'purposeful_minimal_waste';
        };
        
        elderly: {
          respectful_gestures: 'honor_showing_movements';
          patience_indicators: 'slow_deliberate_pacing';
          assistance_ready: 'helpful_supportive_positioning';
        };
      };
      
      cultural_groups: {
        western: {
          directness: 'straightforward_gesture_meaning';
          personal_space: 'arm_length_gesture_boundaries';
          eye_contact: 'maintained_during_gestures';
        };
        
        eastern: {
          indirect_communication: 'subtle_respectful_gestures';
          hierarchy_awareness: 'status_appropriate_movements';
          group_harmony: 'inclusive_non_dominant_gestures';
        };
        
        latin: {
          expressiveness: 'animated_emotional_gestures';
          warmth: 'friendly_welcoming_movements';
          personal_connection: 'closer_intimate_gestures';
        };
      };
    };
  };
  
  emotion_driven_generation: {
    detected_emotions: {
      happiness: {
        gesture_characteristics: 'open_expansive_upward_movements';
        facial_coordination: 'smile_support_gestures';
        energy_level: 'increased_animation_speed';
      };
      
      sadness: {
        gesture_characteristics: 'closed_downward_inward_movements';
        restraint: 'reduced_gesture_frequency';
        comfort_seeking: 'self_soothing_positions';
      };
      
      anger: {
        gesture_characteristics: 'sharp_controlled_powerful_movements';
        tension_indicators: 'clenched_fist_rigid_posture';
        space_claiming: 'expanded_territorial_gestures';
      };
      
      surprise: {
        gesture_characteristics: 'sudden_open_questioning_movements';
        startle_response: 'backward_movement_wide_gestures';
        investigation: 'reaching_exploring_gestures';
      };
      
      fear: {
        gesture_characteristics: 'protective_withdrawal_closed_movements';
        size_reduction: 'self_minimizing_positions';
        escape_readiness: 'flight_preparation_postures';
      };
    };
  };
}
```

### Real-time Gesture Adaptation

```typescript
interface RealTimeGestureAdaptation {
  performance_monitoring: {
    gesture_effectiveness: {
      audience_response: 'monitor_engagement_levels';
      comprehension_indicators: 'track_understanding_signals';
      attention_metrics: 'measure_focus_maintenance';
    };
    
    adaptation_triggers: {
      low_engagement: 'increase_gesture_frequency_and_size';
      confusion_detected: 'add_clarifying_descriptive_gestures';
      impatience_signals: 'reduce_gesture_duration_increase_pace';
      interest_peak: 'maintain_current_gesture_pattern';
    };
  };
  
  feedback_integration: {
    verbal_feedback: {
      'i_dont_understand': 'add_explanatory_gestures';
      'can_you_repeat': 'slow_down_emphasize_key_gestures';
      'thats_interesting': 'maintain_engagement_level';
      'i_get_it': 'reduce_explanatory_continue_narrative';
    };
    
    non_verbal_feedback: {
      head_nods: 'continue_current_pattern';
      confused_expressions: 'add_clarifying_gestures';
      leaning_forward: 'maintain_or_increase_engagement';
      leaning_back: 'reduce_intensity_give_space';
      crossed_arms: 'open_welcoming_gestures';
    };
  };
  
  dynamic_adjustment: {
    pacing_adaptation: {
      fast_talker: 'quick_precise_gestures';
      slow_talker: 'sustained_deliberate_movements';
      variable_pace: 'adaptive_gesture_timing';
    };
    
    content_complexity: {
      simple_concepts: 'basic_clear_gestures';
      complex_ideas: 'layered_explanatory_gesture_sequences';
      technical_content: 'precise_specific_movements';
      abstract_concepts: 'metaphorical_representational_gestures';
    };
  };
}
```

## Cultural Gesture Adaptation

### Regional Gesture Variations

```typescript
interface CulturalGestureAdaptation {
  regional_libraries: {
    north_american: {
      safe_gestures: [
        'thumbs_up', 'ok_sign', 'peace_sign_palm_out',
        'handshake', 'high_five', 'fist_bump', 'wave'
      ];
      
      avoid_gestures: [
        'fig_sign', 'horn_fingers', 'middle_finger'
      ];
      
      context_sensitive: [
        'pointing_finger // acceptable_in_business_contexts',
        'come_here_gesture // palm_up_preferred'
      ];
    };
    
    european: {
      variations_by_country: {
        uk: {
          avoid: ['peace_sign_palm_inward', 'two_finger_tap'];
          preferred: ['polite_point_with_open_hand'];
        };
        
        germany: {
          counting_style: 'thumb_represents_one';
          formality: 'reserved_professional_gestures';
        };
        
        italy: {
          expressive: 'animated_hand_gestures_common';
          specific_meanings: 'pinched_fingers_for_questioning';
        };
      };
    };
    
    asian: {
      general_principles: {
        respect_focus: 'avoid_pointing_with_single_finger';
        hierarchy_awareness: 'bow_instead_of_handshake_when_appropriate';
        indirect_communication: 'subtle_gentle_gestures';
      };
      
      country_specific: {
        japan: {
          bowing: 'depth_indicates_respect_level';
          gift_receiving: 'both_hands_always';
          pointing: 'open_hand_never_single_finger';
        };
        
        china: {
          number_gestures: 'specific_finger_counting_method';
          gift_protocol: 'both_hands_giving_receiving';
          respect_indicators: 'appropriate_deference_gestures';
        };
        
        india: {
          namaste: 'prayer_hands_respectful_greeting';
          head_gestures: 'wobble_indicates_agreement';
          left_hand: 'avoid_for_giving_or_pointing';
        };
      };
    };
    
    middle_eastern: {
      general_guidelines: {
        hand_preference: 'right_hand_for_positive_actions';
        shoe_sensitivity: 'never_point_feet_or_show_soles';
        religious_respect: 'avoid_gestures_during_prayer_times';
      };
      
      regional_specifics: {
        arab_countries: {
          thumbs_up: 'generally_positive_but_verify_locally';
          ok_sign: 'can_be_offensive_use_thumbs_up_instead';
          come_here: 'palm_down_wave_preferred';
        };
      };
    };
  };
  
  adaptation_system: {
    user_location_detection: {
      ip_based: 'determine_likely_cultural_context';
      user_preference: 'allow_manual_cultural_selection';
      learning_system: 'adapt_based_on_user_feedback';
    };
    
    gesture_filtering: {
      offensive_gesture_removal: 'exclude_culturally_inappropriate';
      safe_alternative_suggestion: 'provide_culturally_safe_alternatives';
      context_warning: 'alert_when_gesture_may_be_misunderstood';
    };
    
    localization_engine: {
      gesture_meaning_translation: 'adapt_meanings_to_local_context';
      intensity_adjustment: 'modify_expression_level_for_culture';
      frequency_adaptation: 'adjust_gesture_rate_for_cultural_norms';
    };
  };
}
```

## Implementation Examples

### Basic Gesture System Integration

```typescript
@Component({
  selector: 'app-gesture-demo',
  template: `
    <div class="gesture-demo-container">
      <!-- Avatar with Gesture Support -->
      <ng-ui-avatar-2d
        [configuration]="avatarConfig"
        [gestureEnabled]="true"
        [culturalSettings]="culturalSettings"
        (gestureStarted)="onGestureStarted($event)"
        (gestureCompleted)="onGestureCompleted($event)"
        (gestureError)="onGestureError($event)">
      </ng-ui-avatar-2d>

      <!-- Gesture Controls -->
      <div class="gesture-controls">
        <div class="control-section">
          <h3>Manual Gesture Control</h3>
          
          <div class="gesture-categories">
            <div class="category" *ngFor="let category of gestureCategories">
              <h4>{{ category.name }}</h4>
              <div class="gesture-buttons">
                <button 
                  *ngFor="let gesture of category.gestures"
                  class="gesture-btn"
                  [class.playing]="isGestureActive(gesture.id)"
                  (click)="playGesture(gesture)"
                  [disabled]="!isGestureSupported(gesture)"
                  [title]="gesture.description">
                  {{ gesture.name }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="control-section">
          <h3>Contextual Gesture Generation</h3>
          
          <div class="text-input-section">
            <label>Enter text to generate gestures:</label>
            <textarea 
              [(ngModel)]="inputText"
              placeholder="Type something and watch gestures be generated automatically..."
              rows="4">
            </textarea>
            
            <div class="generation-options">
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="enableEmotionGestures">
                Enable Emotion-based Gestures
              </label>
              
              <label>
                <input 
                  type="checkbox" 
                  [(ngModel)]="enableContextualGestures">
                Enable Contextual Gestures
              </label>
              
              <label>
                Gesture Intensity:
                <select [(ngModel)]="gestureIntensity">
                  <option value="subtle">Subtle</option>
                  <option value="moderate">Moderate</option>
                  <option value="expressive">Expressive</option>
                </select>
              </label>
            </div>
            
            <button 
              (click)="generateGesturesFromText()"
              [disabled]="!inputText.trim()">
              Generate Gestures
            </button>
          </div>
        </div>

        <div class="control-section">
          <h3>Cultural Settings</h3>
          
          <div class="cultural-controls">
            <label>
              Cultural Context:
              <select 
                [(ngModel)]="culturalContext"
                (ngModelChange)="updateCulturalSettings()">
                <option value="western">Western</option>
                <option value="eastern">Eastern</option>
                <option value="middle_eastern">Middle Eastern</option>
                <option value="latin">Latin American</option>
                <option value="universal">Universal (Safe)</option>
              </select>
            </label>
            
            <label>
              Formality Level:
              <select 
                [(ngModel)]="formalityLevel"
                (ngModelChange)="updateCulturalSettings()">
                <option value="casual">Casual</option>
                <option value="business">Business</option>
                <option value="formal">Formal</option>
              </select>
            </label>
            
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="enableCulturalWarnings">
              Show Cultural Warnings
            </label>
          </div>
        </div>

        <div class="control-section">
          <h3>Gesture Timing & Coordination</h3>
          
          <div class="timing-controls">
            <label>
              Gesture Speed:
              <input 
                type="range" 
                min="0.5" 
                max="2.0" 
                step="0.1"
                [(ngModel)]="gestureSpeed"
                (ngModelChange)="updateGestureSpeed($event)">
              <span>{{ gestureSpeed }}x</span>
            </label>
            
            <label>
              Gesture Frequency:
              <input 
                type="range" 
                min="0.1" 
                max="2.0" 
                step="0.1"
                [(ngModel)]="gestureFrequency"
                (ngModelChange)="updateGestureFrequency($event)">
              <span>{{ gestureFrequency }} per sentence</span>
            </label>
            
            <label>
              <input 
                type="checkbox" 
                [(ngModel)]="enableGestureTiming">
              Coordinate with Speech
            </label>
          </div>
        </div>
      </div>

      <!-- Gesture Analysis Display -->
      <div class="gesture-analysis" *ngIf="showAnalysis">
        <h3>Gesture Analysis</h3>
        
        <div class="analysis-content">
          <div class="current-gesture" *ngIf="currentGesture">
            <h4>Current Gesture</h4>
            <div class="gesture-details">
              <span><strong>Name:</strong> {{ currentGesture.name }}</span>
              <span><strong>Type:</strong> {{ currentGesture.type }}</span>
              <span><strong>Duration:</strong> {{ currentGesture.duration }}ms</span>
              <span><strong>Cultural Context:</strong> {{ currentGesture.culturalContext }}</span>
            </div>
            
            <div class="gesture-progress">
              <div class="progress-bar">
                <div 
                  class="progress-fill" 
                  [style.width.%]="gestureProgress">
                </div>
              </div>
              <span>{{ gestureProgress }}% complete</span>
            </div>
          </div>
          
          <div class="generated-gestures" *ngIf="generatedGestureSequence.length > 0">
            <h4>Generated Gesture Sequence</h4>
            <div class="gesture-timeline">
              <div 
                *ngFor="let gesture of generatedGestureSequence; trackBy: trackGesture"
                class="timeline-item"
                [class.completed]="gesture.completed"
                [class.active]="gesture.active"
                [class.pending]="gesture.pending">
                <div class="timeline-marker"></div>
                <div class="timeline-content">
                  <strong>{{ gesture.name }}</strong>
                  <span>{{ gesture.timing }}ms</span>
                  <small>{{ gesture.trigger }}</small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .gesture-demo-container {
      display: flex;
      gap: 30px;
      padding: 20px;
      max-width: 1400px;
      margin: 0 auto;
    }
    
    .gesture-controls {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }
    
    .control-section {
      background: white;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ddd;
    }
    
    .control-section h3 {
      margin-top: 0;
      color: #333;
      border-bottom: 2px solid #007bff;
      padding-bottom: 10px;
    }
    
    .gesture-categories {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .category h4 {
      margin: 0 0 10px 0;
      color: #555;
    }
    
    .gesture-buttons {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }
    
    .gesture-btn {
      padding: 8px 16px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 5px;
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 13px;
    }
    
    .gesture-btn:hover {
      background: #f0f8ff;
      border-color: #007bff;
    }
    
    .gesture-btn.playing {
      background: #007bff;
      color: white;
      border-color: #0056b3;
    }
    
    .gesture-btn:disabled {
      background: #f5f5f5;
      color: #999;
      cursor: not-allowed;
      border-color: #ddd;
    }
    
    .text-input-section textarea {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      resize: vertical;
      margin: 10px 0;
    }
    
    .generation-options {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin: 15px 0;
    }
    
    .generation-options label {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .cultural-controls {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }
    
    .cultural-controls label {
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .timing-controls {
      display: flex;
      flex-direction: column;
      gap: 15px;
    }
    
    .timing-controls label {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .timing-controls input[type="range"] {
      flex: 1;
    }
    
    .gesture-analysis {
      background: #f8f9fa;
      padding: 20px;
      border-radius: 8px;
      margin-top: 20px;
    }
    
    .gesture-details {
      display: flex;
      flex-direction: column;
      gap: 5px;
      margin: 10px 0;
    }
    
    .gesture-details span {
      font-size: 14px;
    }
    
    .progress-bar {
      width: 100%;
      height: 8px;
      background: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin: 10px 0;
    }
    
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #007bff, #28a745);
      transition: width 0.3s ease;
    }
    
    .gesture-timeline {
      display: flex;
      flex-direction: column;
      gap: 10px;
      margin-top: 10px;
    }
    
    .timeline-item {
      display: flex;
      align-items: center;
      gap: 15px;
      padding: 10px;
      border-radius: 5px;
      transition: all 0.3s ease;
    }
    
    .timeline-item.completed {
      background: #d4edda;
      border-left: 4px solid #28a745;
    }
    
    .timeline-item.active {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
    }
    
    .timeline-item.pending {
      background: #f8f9fa;
      border-left: 4px solid #6c757d;
    }
    
    .timeline-marker {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .timeline-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .timeline-content small {
      color: #666;
      font-style: italic;
    }
  `]
})
export class GestureDemoComponent implements OnInit, OnDestroy {
  // Configuration
  avatarConfig = {
    character: {
      name: 'Gesture Demo Avatar',
      model: 'young-woman',
      skinTone: 'medium',
      hair: { style: 'professional', color: '#654321' },
      clothing: { top: 'business-casual' }
    },
    gestureSystem: {
      enabled: true,
      culturalAdaptation: true,
      contextualGeneration: true
    }
  };

  culturalSettings = {
    context: 'western',
    formalityLevel: 'business',
    enableWarnings: true
  };

  // Control states
  inputText = '';
  enableEmotionGestures = true;
  enableContextualGestures = true;
  gestureIntensity = 'moderate';
  culturalContext = 'western';
  formalityLevel = 'business';
  enableCulturalWarnings = true;
  gestureSpeed = 1.0;
  gestureFrequency = 1.0;
  enableGestureTiming = true;
  showAnalysis = true;

  // State tracking
  currentGesture: any = null;
  gestureProgress = 0;
  generatedGestureSequence: any[] = [];
  activeGestures = new Set<string>();

  // Gesture library
  gestureCategories = [
    {
      name: 'Communication',
      gestures: [
        { id: 'point', name: 'Point', description: 'Point to indicate direction', type: 'communicative' },
        { id: 'wave', name: 'Wave', description: 'Friendly greeting wave', type: 'social' },
        { id: 'thumbs_up', name: 'Thumbs Up', description: 'Show approval', type: 'emblematic' },
        { id: 'ok_sign', name: 'OK Sign', description: 'Everything is okay', type: 'emblematic' },
        { id: 'stop', name: 'Stop', description: 'Stop gesture with open palm', type: 'regulatory' },
        { id: 'come_here', name: 'Come Here', description: 'Beckoning gesture', type: 'regulatory' }
      ]
    },
    {
      name: 'Descriptive',
      gestures: [
        { id: 'small', name: 'Small Size', description: 'Indicate small size', type: 'descriptive' },
        { id: 'large', name: 'Large Size', description: 'Indicate large size', type: 'descriptive' },
        { id: 'round', name: 'Round Shape', description: 'Trace circular shape', type: 'descriptive' },
        { id: 'square', name: 'Square Shape', description: 'Outline square shape', type: 'descriptive' },
        { id: 'up_down', name: 'Up/Down', description: 'Vertical movement indication', type: 'directional' },
        { id: 'side_to_side', name: 'Side to Side', description: 'Horizontal movement', type: 'directional' }
      ]
    },
    {
      name: 'Emotional',
      gestures: [
        { id: 'applause', name: 'Applause', description: 'Clapping hands', type: 'emotional' },
        { id: 'heart_hands', name: 'Heart Hands', description: 'Make heart shape with hands', type: 'emotional' },
        { id: 'shrug', name: 'Shrug', description: 'Shoulder shrug - I don\'t know', type: 'emotional' },
        { id: 'face_palm', name: 'Face Palm', description: 'Hand to face - embarrassment', type: 'emotional' },
        { id: 'thinking', name: 'Thinking', description: 'Hand to chin - contemplation', type: 'cognitive' }
      ]
    },
    {
      name: 'Head Gestures',
      gestures: [
        { id: 'nod_yes', name: 'Nod Yes', description: 'Vertical head nod agreement', type: 'head' },
        { id: 'shake_no', name: 'Shake No', description: 'Horizontal head shake disagreement', type: 'head' },
        { id: 'tilt_curious', name: 'Curious Tilt', description: 'Head tilt showing curiosity', type: 'head' },
        { id: 'look_around', name: 'Look Around', description: 'Survey surroundings', type: 'head' },
        { id: 'look_up', name: 'Look Up', description: 'Upward gaze - thinking', type: 'head' }
      ]
    }
  ];

  // Services
  private gestureService = new GestureGenerationService();
  private culturalAdapter = new CulturalGestureAdapter();
  private subscriptions = new Subscription();

  @ViewChild(Avatar2d) avatar!: Avatar2d;

  ngOnInit() {
    this.initializeGestureSystem();
    this.setupGestureMonitoring();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  // Gesture Control Methods
  playGesture(gesture: any) {
    if (!this.isGestureSupported(gesture)) {
      alert(`Gesture "${gesture.name}" is not supported in current cultural context.`);
      return;
    }

    this.activeGestures.add(gesture.id);
    this.currentGesture = { ...gesture, startTime: Date.now(), duration: 2000 };
    
    // Play gesture on avatar
    this.avatar.playGesture({
      id: gesture.id,
      name: gesture.name,
      type: gesture.type,
      frames: this.getGestureFrames(gesture),
      duration: 2000,
      loop: false
    });

    this.startGestureProgress(gesture.id, 2000);
  }

  generateGesturesFromText() {
    if (!this.inputText.trim()) return;

    const analysisOptions = {
      enableEmotionGestures: this.enableEmotionGestures,
      enableContextualGestures: this.enableContextualGestures,
      intensity: this.gestureIntensity,
      culturalContext: this.culturalContext,
      formalityLevel: this.formalityLevel
    };

    this.gestureService.generateFromText(this.inputText, analysisOptions)
      .subscribe(generatedSequence => {
        this.generatedGestureSequence = generatedSequence.map((gesture, index) => ({
          ...gesture,
          completed: false,
          active: false,
          pending: true
        }));

        if (this.enableGestureTiming) {
          this.executeGestureSequence();
        }
      });
  }

  updateCulturalSettings() {
    this.culturalSettings = {
      context: this.culturalContext,
      formalityLevel: this.formalityLevel,
      enableWarnings: this.enableCulturalWarnings
    };

    // Update cultural adapter
    this.culturalAdapter.updateSettings(this.culturalSettings);
    
    // Filter gestures based on cultural appropriateness
    this.filterGesturesByContext();
  }

  updateGestureSpeed(speed: number) {
    this.gestureSpeed = speed;
    // Apply speed to avatar gesture system
    this.avatar.setGestureSpeed(speed);
  }

  updateGestureFrequency(frequency: number) {
    this.gestureFrequency = frequency;
    // Update gesture generation frequency
    this.gestureService.setFrequency(frequency);
  }

  // State Checking Methods
  isGestureActive(gestureId: string): boolean {
    return this.activeGestures.has(gestureId);
  }

  isGestureSupported(gesture: any): boolean {
    return this.culturalAdapter.isGestureAppropriate(gesture, this.culturalSettings);
  }

  // Event Handlers
  onGestureStarted(event: any) {
    console.log('Gesture started:', event.gesture.name);
    this.currentGesture = event.gesture;
  }

  onGestureCompleted(event: any) {
    console.log('Gesture completed:', event.gesture.name);
    this.activeGestures.delete(event.gesture.id);
    this.currentGesture = null;
    this.gestureProgress = 0;

    // Mark as completed in sequence
    const sequenceItem = this.generatedGestureSequence.find(g => g.id === event.gesture.id);
    if (sequenceItem) {
      sequenceItem.completed = true;
      sequenceItem.active = false;
    }
  }

  onGestureError(event: any) {
    console.error('Gesture error:', event.error);
    this.activeGestures.delete(event.gesture?.id);
  }

  // Private Methods
  private initializeGestureSystem() {
    this.gestureService.initialize({
      culturalAdapter: this.culturalAdapter,
      defaultIntensity: this.gestureIntensity,
      enableContextualGeneration: true
    });
  }

  private setupGestureMonitoring() {
    // Monitor gesture progress
    this.subscriptions.add(
      this.gestureService.gestureProgress$.subscribe(progress => {
        this.gestureProgress = progress.percentage;
      })
    );

    // Monitor cultural warnings
    this.subscriptions.add(
      this.culturalAdapter.culturalWarnings$.subscribe(warning => {
        if (this.enableCulturalWarnings) {
          console.warn('Cultural warning:', warning);
          // Could show toast notification
        }
      })
    );
  }

  private executeGestureSequence() {
    let currentTime = 0;

    this.generatedGestureSequence.forEach((gesture, index) => {
      setTimeout(() => {
        // Mark previous as completed
        if (index > 0) {
          this.generatedGestureSequence[index - 1].active = false;
          this.generatedGestureSequence[index - 1].completed = true;
        }

        // Mark current as active
        gesture.pending = false;
        gesture.active = true;

        // Execute gesture
        this.playGesture(gesture);

      }, currentTime);

      currentTime += gesture.duration + 200; // 200ms gap between gestures
    });
  }

  private getGestureFrames(gesture: any): any[] {
    // Return appropriate animation frames based on gesture type
    // This would normally be loaded from a gesture library
    return [
      { timestamp: 0, bodyParts: {} },
      { timestamp: 500, bodyParts: {} },
      { timestamp: 1000, bodyParts: {} }
    ];
  }

  private startGestureProgress(gestureId: string, duration: number) {
    const startTime = Date.now();
    const updateProgress = () => {
      if (!this.activeGestures.has(gestureId)) return;

      const elapsed = Date.now() - startTime;
      this.gestureProgress = Math.min(100, (elapsed / duration) * 100);

      if (this.gestureProgress < 100) {
        requestAnimationFrame(updateProgress);
      }
    };

    updateProgress();
  }

  private filterGesturesByContext() {
    this.gestureCategories.forEach(category => {
      category.gestures.forEach(gesture => {
        gesture.supported = this.isGestureSupported(gesture);
      });
    });
  }

  trackGesture(index: number, gesture: any): string {
    return gesture.id;
  }
}

// Supporting services (simplified interfaces)
class GestureGenerationService {
  gestureProgress$ = new Subject<{gestureId: string; percentage: number}>();

  initialize(config: any) {
    // Initialize gesture generation AI
  }

  generateFromText(text: string, options: any) {
    // Analyze text and generate appropriate gestures
    return new Observable(subscriber => {
      // Simulate gesture generation
      setTimeout(() => {
        const gestures = this.analyzeTextForGestures(text, options);
        subscriber.next(gestures);
        subscriber.complete();
      }, 1000);
    });
  }

  setFrequency(frequency: number) {
    // Update gesture generation frequency
  }

  private analyzeTextForGestures(text: string, options: any): any[] {
    // Mock implementation - would use NLP and gesture mapping
    return [
      {
        id: 'wave',
        name: 'Wave',
        type: 'greeting',
        timing: 0,
        duration: 1500,
        trigger: 'Hello',
        confidence: 0.85
      },
      {
        id: 'point',
        name: 'Point',
        type: 'directional',
        timing: 3000,
        duration: 1200,
        trigger: 'over there',
        confidence: 0.92
      }
    ];
  }
}

class CulturalGestureAdapter {
  culturalWarnings$ = new Subject<{gesture: string; warning: string; severity: string}>();

  updateSettings(settings: any) {
    // Update cultural adaptation settings
  }

  isGestureAppropriate(gesture: any, settings: any): boolean {
    // Check if gesture is culturally appropriate
    const inappropriateGestures = {
      western: [],
      eastern: ['ok_sign'], // Example: OK sign can be offensive in some contexts
      middle_eastern: ['thumbs_up'], // Example: Thumbs up can be offensive
      universal: ['ok_sign', 'thumbs_up'] // Only universally safe gestures
    };

    const inappropriate = inappropriateGestures[settings.context] || [];
    return !inappropriate.includes(gesture.id);
  }
}
```

The Gesture System provides a comprehensive framework for natural avatar communication through sophisticated gesture recognition, cultural adaptation, and AI-powered generation. The system ensures culturally appropriate, contextually relevant, and emotionally aligned gestures that enhance avatar interactions across diverse global audiences.