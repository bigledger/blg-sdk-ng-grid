# WebSocket Streaming Features

Real-time streaming capabilities for the BigLedger Avatar Library, enabling low-latency communication, live audio streaming, and bi-directional avatar interactions.

## Overview

The WebSocket Streaming system provides real-time communication between avatars and backend services, enabling live audio streaming, instant text processing, collaborative interactions, and server-side AI integration. Built for enterprise-scale applications with high availability and low latency requirements.

## Core Features

### WebSocket Connection Management

#### Connection Architecture

```typescript
interface StreamingArchitecture {
  connection_types: {
    direct_websocket: {
      description: 'Direct WebSocket connection to avatar service';
      latency: '10-50ms';
      reliability: 'high';
      scalability: 'medium';
      use_cases: ['single_user_interactions', 'demo_applications'];
    };
    
    load_balanced: {
      description: 'Load-balanced WebSocket with sticky sessions';
      latency: '20-80ms';
      reliability: 'very_high';
      scalability: 'high';
      use_cases: ['production_applications', 'multi_user_systems'];
    };
    
    message_queue: {
      description: 'WebSocket with message queue backend (Redis/RabbitMQ)';
      latency: '30-100ms';
      reliability: 'very_high';
      scalability: 'very_high';
      use_cases: ['enterprise_applications', 'multi_tenant_systems'];
    };
    
    hybrid: {
      description: 'HTTP long-polling fallback with WebSocket primary';
      latency: '50-200ms';
      reliability: 'high';
      scalability: 'high';
      use_cases: ['unreliable_networks', 'corporate_firewalls'];
    };
  };
  
  protocol_layers: {
    transport: 'WebSocket (RFC 6455)';
    sub_protocol: 'avatar-stream-v1';
    message_format: 'JSON with binary frame support';
    compression: 'permessage-deflate extension';
    heartbeat: 'ping/pong frames every 30 seconds';
  };
}
```

#### Connection Configuration

```typescript
interface ConnectionConfig {
  websocket: {
    url: string;
    protocols?: string[];
    headers?: Record<string, string>;
    
    connection_options: {
      connect_timeout: number; // milliseconds
      handshake_timeout: number;
      max_redirects: number;
      enable_compression: boolean;
      binary_type: 'blob' | 'arraybuffer';
    };
    
    reconnection: {
      enabled: boolean;
      max_attempts: number;
      initial_delay: number; // milliseconds
      max_delay: number;
      backoff_factor: number; // exponential backoff multiplier
      randomization_factor: number; // jitter to prevent thundering herd
    };
    
    keep_alive: {
      enabled: boolean;
      ping_interval: number; // milliseconds
      pong_timeout: number;
      missed_pongs_threshold: number;
    };
  };
  
  authentication: {
    method: 'bearer_token' | 'api_key' | 'oauth2' | 'jwt';
    credentials: {
      token?: string;
      api_key?: string;
      client_id?: string;
      client_secret?: string;
    };
    
    refresh: {
      enabled: boolean;
      threshold: number; // seconds before expiry to refresh
      endpoint?: string;
    };
  };
  
  quality_of_service: {
    message_priority: boolean;
    guaranteed_delivery: boolean;
    ordered_delivery: boolean;
    duplicate_detection: boolean;
  };
}
```

### Message Protocol

#### Message Structure

```typescript
interface StreamingMessage {
  header: {
    message_id: string;
    timestamp: number;
    message_type: MessageType;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    sequence_number?: number;
    correlation_id?: string;
    content_type: 'text/plain' | 'application/json' | 'audio/wav' | 'video/webm';
    content_encoding?: 'gzip' | 'deflate' | 'br';
    content_length: number;
  };
  
  payload: {
    data: any;
    metadata?: Record<string, any>;
    checksum?: string;
  };
  
  routing: {
    source: string;
    destination: string;
    reply_to?: string;
    expires_at?: number;
  };
}

type MessageType = 
  | 'text_input'
  | 'audio_stream'
  | 'video_stream'
  | 'avatar_command'
  | 'system_event'
  | 'heartbeat'
  | 'acknowledgment'
  | 'error'
  | 'status_update';
```

#### Message Types and Handlers

```typescript
interface MessageHandlers {
  text_input: {
    structure: {
      text: string;
      language?: string;
      context?: string;
      user_id?: string;
      session_id: string;
    };
    
    processing: {
      immediate_response: boolean;
      emotion_analysis: boolean;
      intent_recognition: boolean;
      response_generation: 'local' | 'server' | 'hybrid';
    };
    
    response: {
      text: string;
      emotions?: Array<{ emotion: string; confidence: number }>;
      gestures?: Array<{ gesture: string; timing: number }>;
      expressions?: Array<{ expression: string; duration: number }>;
      audio_url?: string;
    };
  };
  
  audio_stream: {
    structure: {
      audio_data: ArrayBuffer;
      format: 'wav' | 'opus' | 'aac' | 'mp3';
      sample_rate: number;
      channels: number;
      bit_depth: number;
      chunk_sequence: number;
      is_final: boolean;
    };
    
    processing: {
      real_time_transcription: boolean;
      noise_reduction: boolean;
      voice_activity_detection: boolean;
      speaker_identification: boolean;
      emotion_recognition: boolean;
    };
    
    response: {
      transcription?: string;
      confidence?: number;
      emotions?: Array<{ emotion: string; confidence: number }>;
      lip_sync_data?: LipSyncTimelineEntry[];
      processing_latency: number;
    };
  };
  
  avatar_command: {
    structure: {
      command: AvatarCommand;
      parameters: Record<string, any>;
      execution_time?: number;
      duration?: number;
    };
    
    commands: {
      change_expression: { expression: string; intensity: number; duration: number };
      play_gesture: { gesture: string; loop: boolean };
      speak_text: { text: string; voice_settings: VoiceConfig };
      change_pose: { pose: string; transition_time: number };
      update_appearance: { changes: Partial<AvatarAppearance> };
      start_animation: { animation: string; loop: boolean };
      stop_animation: { animation?: string };
      set_mood: { mood: string; intensity: number };
    };
  };
  
  system_event: {
    structure: {
      event_type: SystemEventType;
      severity: 'info' | 'warning' | 'error' | 'critical';
      message: string;
      additional_data?: any;
    };
    
    events: {
      connection_established: { client_info: any };
      connection_lost: { reason: string; retry_in: number };
      authentication_failed: { error: string };
      rate_limit_exceeded: { limit: number; reset_time: number };
      server_overload: { estimated_delay: number };
      service_maintenance: { scheduled_downtime: number };
      feature_disabled: { feature: string; reason: string };
      quota_exceeded: { quota_type: string; reset_time: number };
    };
  };
}
```

### Audio Streaming

#### Real-time Audio Processing

```typescript
interface AudioStreamingConfig {
  capture: {
    source: 'microphone' | 'file' | 'synthetic';
    constraints: {
      sample_rate: number;
      channel_count: number;
      bit_depth: number;
      auto_gain_control: boolean;
      noise_suppression: boolean;
      echo_cancellation: boolean;
    };
    
    buffer_settings: {
      buffer_size: number; // samples
      overlap: number; // percentage
      windowing: 'hanning' | 'hamming' | 'blackman';
    };
  };
  
  encoding: {
    codec: 'opus' | 'aac' | 'wav' | 'flac';
    bitrate: number; // kbps
    compression_level: number; // 0-10
    vbr: boolean; // variable bitrate
    
    opus_settings?: {
      application: 'voip' | 'audio' | 'restricted_lowdelay';
      complexity: number; // 0-10
      packet_loss_perc: number; // 0-100
      use_inband_fec: boolean; // forward error correction
      use_dtx: boolean; // discontinuous transmission
    };
  };
  
  streaming: {
    chunk_duration: number; // milliseconds
    max_chunk_size: number; // bytes
    send_interval: number; // milliseconds
    queue_threshold: number; // chunks
    
    adaptive_bitrate: {
      enabled: boolean;
      min_bitrate: number;
      max_bitrate: number;
      adaptation_interval: number; // milliseconds
      quality_threshold: number; // packet loss percentage
    };
  };
  
  processing: {
    voice_activity_detection: {
      enabled: boolean;
      threshold: number; // -60 to 0 dB
      min_speech_duration: number; // milliseconds
      max_silence_duration: number;
    };
    
    noise_gate: {
      enabled: boolean;
      threshold: number; // dB
      attack_time: number; // milliseconds
      release_time: number;
    };
    
    automatic_gain_control: {
      enabled: boolean;
      target_level: number; // dB
      max_gain: number; // dB
      attack_time: number;
      release_time: number;
    };
  };
}
```

#### Audio Processing Pipeline

```typescript
interface AudioProcessingPipeline {
  input_stage: {
    capture: 'getUserMedia API';
    format_conversion: 'Float32Array to target format';
    resampling: 'to target sample rate';
    channel_mixing: 'mono/stereo conversion';
  };
  
  preprocessing: {
    noise_reduction: {
      algorithm: 'spectral_subtraction' | 'wiener_filter' | 'neural_network';
      aggressiveness: number; // 0-3
      preserve_speech: boolean;
    };
    
    echo_cancellation: {
      algorithm: 'adaptive_filter' | 'neural_network';
      tail_length: number; // milliseconds
      learning_rate: number;
    };
    
    automatic_gain_control: {
      mode: 'adaptive_analog' | 'adaptive_digital' | 'fixed_digital';
      target_level_dbov: number; // dB below overload
      compression_gain_db: number;
    };
  };
  
  feature_extraction: {
    voice_activity_detection: {
      features: ['energy', 'zero_crossing_rate', 'spectral_centroid'];
      classifier: 'gmm' | 'neural_network' | 'svm';
      smoothing: 'median_filter';
    };
    
    speech_enhancement: {
      spectral_subtraction: boolean;
      wiener_filtering: boolean;
      post_filtering: boolean;
    };
  };
  
  encoding_stage: {
    pre_emphasis: 'high_frequency_boost';
    windowing: 'overlap_add_processing';
    encoding: 'codec_specific_compression';
    packetization: 'rtp_like_framing';
  };
  
  transmission: {
    error_correction: 'forward_error_correction';
    packet_loss_concealment: 'interpolation_based';
    adaptive_buffering: 'jitter_compensation';
    congestion_control: 'bandwidth_adaptation';
  };
}
```

### Video Streaming (Avatar Visual Stream)

#### Avatar Video Streaming

```typescript
interface AvatarVideoStreaming {
  rendering_capture: {
    source: 'canvas_element' | 'webgl_context' | 'offscreen_canvas';
    frame_rate: number; // fps
    resolution: {
      width: number;
      height: number;
      pixel_format: 'rgba' | 'yuv420p' | 'nv12';
    };
    
    capture_options: {
      alpha: boolean; // include alpha channel
      color_space: 'srgb' | 'rec2020' | 'display-p3';
      latency_hint: 'interaction' | 'balanced' | 'quality';
    };
  };
  
  encoding: {
    codec: 'h264' | 'h265' | 'vp8' | 'vp9' | 'av1';
    profile: string; // codec-specific profile
    level: string; // codec-specific level
    
    rate_control: {
      mode: 'cbr' | 'vbr' | 'crf';
      target_bitrate: number; // kbps
      max_bitrate: number;
      buffer_size: number; // kbits
    };
    
    quality: {
      keyframe_interval: number; // frames
      b_frames: number;
      reference_frames: number;
      motion_estimation: 'fast' | 'medium' | 'slow';
      entropy_coding: 'cavlc' | 'cabac';
    };
    
    hardware_acceleration: {
      enabled: boolean;
      preferred_api: 'nvenc' | 'qsv' | 'amf' | 'videotoolbox';
      fallback_to_software: boolean;
    };
  };
  
  streaming: {
    transport: 'webrtc' | 'websocket' | 'hls' | 'dash';
    
    webrtc_config?: {
      ice_servers: RTCIceServer[];
      ice_candidate_pool_size: number;
      bundle_policy: 'balanced' | 'max-bundle' | 'max-compat';
      rtcp_mux_policy: 'negotiate' | 'require';
    };
    
    adaptive_streaming: {
      enabled: boolean;
      quality_levels: Array<{
        width: number;
        height: number;
        bitrate: number;
        framerate: number;
      }>;
      
      switching_criteria: {
        bandwidth_threshold: number; // percentage
        cpu_threshold: number;
        frame_drop_threshold: number;
        latency_threshold: number; // milliseconds
      };
    };
  };
}
```

### Bi-directional Communication

#### Real-time Interaction Patterns

```typescript
interface InteractionPatterns {
  request_response: {
    pattern: 'client_request -> server_processing -> client_response';
    timeout: number; // milliseconds
    retry_policy: {
      max_retries: number;
      retry_delays: number[]; // milliseconds
      retry_conditions: string[];
    };
    
    examples: [
      'text_to_speech_request',
      'emotion_analysis_request',
      'avatar_command_execution',
      'configuration_update'
    ];
  };
  
  publish_subscribe: {
    pattern: 'event_publisher -> message_broker -> event_subscribers';
    topics: string[];
    quality_of_service: 'at_most_once' | 'at_least_once' | 'exactly_once';
    
    examples: [
      'avatar_state_changes',
      'user_presence_updates',
      'system_announcements',
      'collaborative_interactions'
    ];
  };
  
  streaming: {
    pattern: 'continuous_data_flow';
    flow_control: 'backpressure_handling';
    buffering: 'adaptive_buffer_sizing';
    
    examples: [
      'audio_input_stream',
      'video_output_stream',
      'real_time_lip_sync_data',
      'performance_metrics_stream'
    ];
  };
  
  collaborative: {
    pattern: 'multi_client_synchronization';
    consistency_model: 'eventual_consistency' | 'strong_consistency';
    conflict_resolution: 'last_writer_wins' | 'operational_transform';
    
    examples: [
      'shared_avatar_control',
      'multi_user_conversations',
      'collaborative_customization',
      'audience_interaction'
    ];
  };
}
```

### Server-side Integration

#### Backend Service Architecture

```typescript
interface ServerSideIntegration {
  service_types: {
    avatar_engine: {
      responsibilities: [
        'avatar_state_management',
        'animation_processing',
        'appearance_updates',
        'behavior_coordination'
      ];
      scaling: 'horizontal_with_state_sharding';
      persistence: 'redis_for_sessions, postgres_for_configs';
    };
    
    speech_services: {
      responsibilities: [
        'text_to_speech_synthesis',
        'speech_to_text_conversion',
        'voice_cloning',
        'emotion_analysis'
      ];
      scaling: 'auto_scaling_based_on_queue_length';
      caching: 'aggressive_audio_caching';
    };
    
    ai_processing: {
      responsibilities: [
        'natural_language_understanding',
        'response_generation',
        'emotion_detection',
        'context_management'
      ];
      scaling: 'gpu_based_horizontal_scaling';
      optimization: 'model_quantization_and_caching';
    };
    
    media_processing: {
      responsibilities: [
        'audio_transcoding',
        'video_encoding',
        'real_time_processing',
        'quality_adaptation'
      ];
      scaling: 'cpu_intensive_dedicated_workers';
      hardware: 'hardware_acceleration_preferred';
    };
  };
  
  api_patterns: {
    rest_api: {
      use_cases: ['configuration_management', 'batch_operations', 'reporting'];
      authentication: 'jwt_bearer_tokens';
      rate_limiting: 'per_client_rate_limits';
    };
    
    websocket_api: {
      use_cases: ['real_time_interactions', 'streaming_data', 'live_updates'];
      authentication: 'connection_time_auth_with_refresh';
      message_routing: 'topic_based_routing';
    };
    
    graphql_api: {
      use_cases: ['complex_queries', 'data_aggregation', 'client_customization'];
      subscriptions: 'websocket_based_subscriptions';
      caching: 'query_level_caching';
    };
  };
}
```

### Implementation Examples

#### Basic WebSocket Streaming Setup

```typescript
@Component({
  selector: 'app-streaming-avatar',
  template: `
    <div class="streaming-container">
      <!-- Connection Status -->
      <div class="connection-status" [ngClass]="connectionStatus()">
        <div class="status-indicator"></div>
        <span>{{ getStatusText() }}</span>
        <div class="connection-metrics" *ngIf="isConnected()">
          <span>Latency: {{ latency() }}ms</span>
          <span>Quality: {{ connectionQuality() }}%</span>
        </div>
      </div>

      <!-- Avatar Display -->
      <ng-ui-avatar-2d
        [configuration]="avatarConfig"
        [size]="{width: 400, height: 500}"
        [lipSyncEnabled]="true"
        (expressionChanged)="onAvatarExpressionChanged($event)"
        (gestureStarted)="onAvatarGestureStarted($event)">
      </ng-ui-avatar-2d>

      <!-- Streaming Controls -->
      <div class="streaming-controls">
        <div class="connection-controls">
          <button 
            (click)="connect()" 
            [disabled]="isConnected() || isConnecting()">
            {{ isConnecting() ? 'Connecting...' : 'Connect' }}
          </button>
          
          <button 
            (click)="disconnect()" 
            [disabled]="!isConnected()">
            Disconnect
          </button>
          
          <button 
            (click)="reconnect()" 
            [disabled]="isConnecting()">
            Reconnect
          </button>
        </div>

        <div class="audio-controls">
          <button 
            (click)="toggleMicrophone()"
            [class.active]="isMicrophoneEnabled()">
            <i class="icon-microphone"></i>
            {{ isMicrophoneEnabled() ? 'Mute' : 'Unmute' }}
          </button>
          
          <button 
            (click)="toggleSpeaker()"
            [class.active]="isSpeakerEnabled()">
            <i class="icon-speaker"></i>
            {{ isSpeakerEnabled() ? 'Mute Speaker' : 'Unmute Speaker' }}
          </button>
          
          <div class="volume-control">
            <label>Volume:</label>
            <input 
              type="range" 
              min="0" 
              max="100"
              [(ngModel)]="speakerVolume"
              (ngModelChange)="updateSpeakerVolume($event)">
          </div>
        </div>

        <div class="interaction-controls">
          <div class="text-input">
            <input 
              type="text" 
              [(ngModel)]="textInput"
              placeholder="Type a message..."
              (keyup.enter)="sendTextMessage()"
              [disabled]="!isConnected()">
            <button 
              (click)="sendTextMessage()"
              [disabled]="!isConnected() || !textInput.trim()">
              Send
            </button>
          </div>
          
          <div class="quick-actions">
            <button (click)="sendCommand('wave')">Wave</button>
            <button (click)="sendCommand('nod')">Nod</button>
            <button (click)="sendCommand('smile')">Smile</button>
            <button (click)="sendCommand('think')">Think</button>
          </div>
        </div>
      </div>

      <!-- Stream Monitoring -->
      <div class="stream-monitoring" *ngIf="showMonitoring">
        <h4>Stream Monitoring</h4>
        
        <div class="metrics-grid">
          <div class="metric">
            <label>Latency:</label>
            <span>{{ latency() }}ms</span>
            <div class="latency-indicator" [ngClass]="getLatencyClass()"></div>
          </div>
          
          <div class="metric">
            <label>Packet Loss:</label>
            <span>{{ packetLoss() }}%</span>
            <div class="packet-loss-indicator" [ngClass]="getPacketLossClass()"></div>
          </div>
          
          <div class="metric">
            <label>Audio Quality:</label>
            <span>{{ audioQuality() }}/10</span>
            <div class="quality-bar">
              <div 
                class="quality-fill" 
                [style.width.%]="audioQuality() * 10">
              </div>
            </div>
          </div>
          
          <div class="metric">
            <label>Connection Type:</label>
            <span>{{ connectionType() }}</span>
          </div>
        </div>

        <div class="stream-logs">
          <h5>Recent Events</h5>
          <div class="log-entries">
            <div 
              *ngFor="let log of recentLogs(); trackBy: trackLogEntry"
              class="log-entry"
              [ngClass]="log.level">
              <span class="timestamp">{{ formatTime(log.timestamp) }}</span>
              <span class="message">{{ log.message }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Audio Visualizer -->
      <div class="audio-visualizer" *ngIf="showAudioVisualizer && isConnected()">
        <canvas 
          #audioVisualizerCanvas 
          width="400" 
          height="100">
        </canvas>
      </div>
    </div>
  `,
  styles: [`
    .streaming-container {
      display: flex;
      flex-direction: column;
      gap: 20px;
      padding: 20px;
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .connection-status {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 10px;
      border-radius: 5px;
      font-weight: bold;
    }
    
    .connection-status.connected {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }
    
    .connection-status.connecting {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
    }
    
    .connection-status.disconnected {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }
    
    .status-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background: currentColor;
    }
    
    .connection-metrics {
      margin-left: auto;
      display: flex;
      gap: 15px;
      font-size: 14px;
    }
    
    .streaming-controls {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .connection-controls,
    .audio-controls,
    .interaction-controls {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .connection-controls button,
    .audio-controls button {
      padding: 8px 16px;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      background: #007bff;
      color: white;
    }
    
    .connection-controls button:disabled,
    .audio-controls button:disabled {
      background: #6c757d;
      cursor: not-allowed;
    }
    
    .audio-controls button.active {
      background: #28a745;
    }
    
    .volume-control {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .text-input {
      display: flex;
      gap: 8px;
    }
    
    .text-input input {
      flex: 1;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }
    
    .quick-actions {
      display: flex;
      gap: 5px;
      flex-wrap: wrap;
    }
    
    .quick-actions button {
      padding: 6px 12px;
      border: 1px solid #ddd;
      background: white;
      border-radius: 4px;
      cursor: pointer;
      font-size: 12px;
    }
    
    .quick-actions button:hover {
      background: #e9ecef;
    }
    
    .stream-monitoring {
      background: white;
      border: 1px solid #ddd;
      border-radius: 8px;
      padding: 20px;
    }
    
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .metric {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    
    .metric label {
      font-weight: bold;
      min-width: 100px;
    }
    
    .latency-indicator,
    .packet-loss-indicator {
      width: 12px;
      height: 12px;
      border-radius: 50%;
    }
    
    .latency-indicator.good,
    .packet-loss-indicator.good {
      background: #28a745;
    }
    
    .latency-indicator.medium,
    .packet-loss-indicator.medium {
      background: #ffc107;
    }
    
    .latency-indicator.poor,
    .packet-loss-indicator.poor {
      background: #dc3545;
    }
    
    .quality-bar {
      width: 100px;
      height: 8px;
      background: #e9ecef;
      border-radius: 4px;
      overflow: hidden;
    }
    
    .quality-fill {
      height: 100%;
      background: linear-gradient(to right, #dc3545, #ffc107, #28a745);
      transition: width 0.3s ease;
    }
    
    .log-entries {
      max-height: 150px;
      overflow-y: auto;
      font-family: monospace;
      font-size: 12px;
      background: #f8f9fa;
      padding: 10px;
      border-radius: 4px;
    }
    
    .log-entry {
      display: flex;
      gap: 10px;
      margin-bottom: 2px;
    }
    
    .log-entry.error {
      color: #dc3545;
    }
    
    .log-entry.warning {
      color: #ffc107;
    }
    
    .log-entry.info {
      color: #17a2b8;
    }
    
    .timestamp {
      color: #6c757d;
      min-width: 80px;
    }
    
    .audio-visualizer {
      text-align: center;
      padding: 20px;
      background: #f8f9fa;
      border-radius: 8px;
    }
    
    .audio-visualizer canvas {
      border: 1px solid #ddd;
      border-radius: 4px;
    }
  `]
})
export class StreamingAvatarComponent implements OnInit, OnDestroy {
  // Connection state
  private streamService = new StreamService();
  private audioProcessor = new AudioProcessorService();
  
  // Reactive state
  private _connectionStatus = signal<'disconnected' | 'connecting' | 'connected'>('disconnected');
  private _latency = signal(0);
  private _packetLoss = signal(0);
  private _audioQuality = signal(10);
  private _connectionQuality = signal(100);
  private _recentLogs = signal<LogEntry[]>([]);
  
  // Settings
  textInput = '';
  speakerVolume = 75;
  showMonitoring = true;
  showAudioVisualizer = true;
  
  // Read-only state
  readonly connectionStatus = this._connectionStatus.asReadonly();
  readonly latency = this._latency.asReadonly();
  readonly packetLoss = this._packetLoss.asReadonly();
  readonly audioQuality = this._audioQuality.asReadonly();
  readonly connectionQuality = this._connectionQuality.asReadonly();
  readonly recentLogs = this._recentLogs.asReadonly();
  
  // Computed states
  readonly isConnected = computed(() => this.connectionStatus() === 'connected');
  readonly isConnecting = computed(() => this.connectionStatus() === 'connecting');
  readonly isMicrophoneEnabled = signal(false);
  readonly isSpeakerEnabled = signal(true);
  readonly connectionType = signal('WebSocket');

  avatarConfig = {
    character: {
      name: 'Streaming Assistant',
      model: 'young-woman',
      skinTone: 'medium',
      hair: { style: 'professional', color: '#654321' },
      clothing: { top: 'business-casual' }
    },
    animations: {
      blinkFrequency: 3000,
      idleAnimations: true
    }
  };

  @ViewChild('audioVisualizerCanvas') audioVisualizerCanvas!: ElementRef<HTMLCanvasElement>;

  private subscriptions = new Subscription();
  private audioContext?: AudioContext;
  private mediaStream?: MediaStream;

  async ngOnInit() {
    await this.initializeServices();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
    this.disconnect();
    this.cleanup();
  }

  // Connection Management
  async connect() {
    try {
      this._connectionStatus.set('connecting');
      this.addLog('info', 'Attempting to connect to streaming server...');

      const config: ConnectionConfig = {
        websocket: {
          url: environment.streamingServerUrl,
          protocols: ['avatar-stream-v1'],
          connection_options: {
            connect_timeout: 10000,
            handshake_timeout: 5000,
            max_redirects: 3,
            enable_compression: true,
            binary_type: 'arraybuffer'
          },
          reconnection: {
            enabled: true,
            max_attempts: 5,
            initial_delay: 1000,
            max_delay: 30000,
            backoff_factor: 2.0,
            randomization_factor: 0.1
          },
          keep_alive: {
            enabled: true,
            ping_interval: 30000,
            pong_timeout: 5000,
            missed_pongs_threshold: 3
          }
        },
        authentication: {
          method: 'bearer_token',
          credentials: {
            token: environment.authToken
          }
        }
      };

      await this.streamService.connect(config);
      
      // Initialize audio streaming if microphone is enabled
      if (this.isMicrophoneEnabled()) {
        await this.initializeAudioCapture();
      }

      this._connectionStatus.set('connected');
      this.addLog('info', 'Successfully connected to streaming server');

    } catch (error) {
      this._connectionStatus.set('disconnected');
      this.addLog('error', `Connection failed: ${error}`);
      console.error('Connection failed:', error);
    }
  }

  disconnect() {
    this.streamService.disconnect();
    this.stopAudioCapture();
    this._connectionStatus.set('disconnected');
    this.addLog('info', 'Disconnected from streaming server');
  }

  async reconnect() {
    this.disconnect();
    // Wait a bit before reconnecting
    setTimeout(() => this.connect(), 1000);
  }

  // Audio Management
  async toggleMicrophone() {
    if (this.isMicrophoneEnabled()) {
      this.stopAudioCapture();
      this.isMicrophoneEnabled.set(false);
      this.addLog('info', 'Microphone disabled');
    } else {
      try {
        await this.initializeAudioCapture();
        this.isMicrophoneEnabled.set(true);
        this.addLog('info', 'Microphone enabled');
      } catch (error) {
        this.addLog('error', `Failed to enable microphone: ${error}`);
      }
    }
  }

  toggleSpeaker() {
    this.isSpeakerEnabled.set(!this.isSpeakerEnabled());
    this.addLog('info', `Speaker ${this.isSpeakerEnabled() ? 'enabled' : 'disabled'}`);
  }

  updateSpeakerVolume(volume: number) {
    this.speakerVolume = volume;
    // Update audio output volume
    this.audioProcessor.setOutputVolume(volume / 100);
  }

  // Communication
  sendTextMessage() {
    if (!this.textInput.trim() || !this.isConnected()) return;

    const message: StreamingMessage = {
      header: {
        message_id: this.generateMessageId(),
        timestamp: Date.now(),
        message_type: 'text_input',
        priority: 'normal',
        content_type: 'application/json',
        content_length: 0
      },
      payload: {
        data: {
          text: this.textInput,
          language: 'en-US',
          session_id: this.streamService.getSessionId(),
          context: 'user_interaction'
        }
      },
      routing: {
        source: 'client',
        destination: 'avatar_engine'
      }
    };

    this.streamService.sendMessage(message);
    this.addLog('info', `Sent: ${this.textInput}`);
    this.textInput = '';
  }

  sendCommand(command: string) {
    if (!this.isConnected()) return;

    const message: StreamingMessage = {
      header: {
        message_id: this.generateMessageId(),
        timestamp: Date.now(),
        message_type: 'avatar_command',
        priority: 'high',
        content_type: 'application/json',
        content_length: 0
      },
      payload: {
        data: {
          command: command,
          parameters: {},
          execution_time: Date.now()
        }
      },
      routing: {
        source: 'client',
        destination: 'avatar_engine'
      }
    };

    this.streamService.sendMessage(message);
    this.addLog('info', `Command sent: ${command}`);
  }

  // Event Handlers
  onAvatarExpressionChanged(expression: any) {
    this.addLog('info', `Avatar expression changed to: ${expression.name}`);
  }

  onAvatarGestureStarted(gesture: any) {
    this.addLog('info', `Avatar gesture started: ${gesture.name}`);
  }

  // Private Methods
  private async initializeServices() {
    // Initialize audio processor
    await this.audioProcessor.initialize({
      sampleRate: 16000,
      channelCount: 1,
      bufferSize: 4096
    });

    // Initialize stream service
    await this.streamService.initialize();
  }

  private setupEventListeners() {
    // Stream service events
    this.subscriptions.add(
      this.streamService.onConnectionStatusChanged.subscribe(status => {
        this._connectionStatus.set(status);
      })
    );

    this.subscriptions.add(
      this.streamService.onLatencyUpdate.subscribe(latency => {
        this._latency.set(latency);
      })
    );

    this.subscriptions.add(
      this.streamService.onMessageReceived.subscribe(message => {
        this.handleIncomingMessage(message);
      })
    );

    this.subscriptions.add(
      this.streamService.onError.subscribe(error => {
        this.addLog('error', `Stream error: ${error.message}`);
      })
    );

    // Audio processor events
    this.subscriptions.add(
      this.audioProcessor.onAudioData.subscribe(audioData => {
        this.sendAudioData(audioData);
      })
    );

    this.subscriptions.add(
      this.audioProcessor.onVoiceActivityDetected.subscribe(isActive => {
        this.addLog('info', `Voice activity: ${isActive ? 'detected' : 'stopped'}`);
      })
    );
  }

  private async initializeAudioCapture() {
    try {
      this.mediaStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: 1,
          sampleRate: 16000,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      this.audioContext = new AudioContext({ sampleRate: 16000 });
      await this.audioProcessor.startCapture(this.mediaStream, this.audioContext);
      
      this.startAudioVisualization();

    } catch (error) {
      throw new Error(`Failed to initialize audio capture: ${error}`);
    }
  }

  private stopAudioCapture() {
    this.audioProcessor.stopCapture();
    
    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = undefined;
    }

    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = undefined;
    }
  }

  private sendAudioData(audioData: ArrayBuffer) {
    if (!this.isConnected()) return;

    const message: StreamingMessage = {
      header: {
        message_id: this.generateMessageId(),
        timestamp: Date.now(),
        message_type: 'audio_stream',
        priority: 'high',
        content_type: 'audio/wav',
        content_length: audioData.byteLength
      },
      payload: {
        data: {
          audio_data: audioData,
          format: 'wav',
          sample_rate: 16000,
          channels: 1,
          bit_depth: 16,
          chunk_sequence: this.audioProcessor.getSequenceNumber(),
          is_final: false
        }
      },
      routing: {
        source: 'client',
        destination: 'speech_services'
      }
    };

    this.streamService.sendMessage(message);
  }

  private handleIncomingMessage(message: StreamingMessage) {
    switch (message.header.message_type) {
      case 'text_input':
        this.handleTextResponse(message.payload.data);
        break;
      
      case 'audio_stream':
        this.handleAudioResponse(message.payload.data);
        break;
      
      case 'avatar_command':
        this.handleAvatarCommand(message.payload.data);
        break;
      
      case 'system_event':
        this.handleSystemEvent(message.payload.data);
        break;
      
      default:
        console.log('Unknown message type:', message.header.message_type);
    }
  }

  private handleTextResponse(data: any) {
    this.addLog('info', `Received response: ${data.text}`);
    
    // Update avatar with emotions and gestures
    if (data.emotions) {
      data.emotions.forEach((emotion: any) => {
        // Apply emotion to avatar
        console.log(`Applying emotion: ${emotion.emotion} (${emotion.confidence})`);
      });
    }

    if (data.gestures) {
      data.gestures.forEach((gesture: any) => {
        // Schedule gesture
        setTimeout(() => {
          console.log(`Playing gesture: ${gesture.gesture}`);
        }, gesture.timing);
      });
    }
  }

  private handleAudioResponse(data: any) {
    // Play received audio
    if (data.audio_url && this.isSpeakerEnabled()) {
      this.audioProcessor.playAudioFromUrl(data.audio_url);
    }

    // Update lip sync
    if (data.lip_sync_data) {
      // Apply lip sync data to avatar
      console.log('Applying lip sync data:', data.lip_sync_data);
    }
  }

  private handleAvatarCommand(data: any) {
    console.log('Executing avatar command:', data.command, data.parameters);
    // Execute command on avatar
  }

  private handleSystemEvent(data: any) {
    this.addLog(data.severity, `System: ${data.message}`);
    
    // Handle specific system events
    switch (data.event_type) {
      case 'rate_limit_exceeded':
        this.addLog('warning', `Rate limit exceeded. Reset in ${data.reset_time}ms`);
        break;
      
      case 'server_overload':
        this.addLog('warning', `Server overloaded. Estimated delay: ${data.estimated_delay}ms`);
        break;
      
      case 'connection_lost':
        this.addLog('error', `Connection lost: ${data.reason}`);
        // Attempt reconnection
        setTimeout(() => this.reconnect(), data.retry_in || 5000);
        break;
    }
  }

  private startPerformanceMonitoring() {
    // Update performance metrics every second
    setInterval(() => {
      this.updatePerformanceMetrics();
    }, 1000);
  }

  private updatePerformanceMetrics() {
    if (!this.isConnected()) return;

    // Get metrics from stream service
    const metrics = this.streamService.getPerformanceMetrics();
    
    this._latency.set(metrics.latency);
    this._packetLoss.set(metrics.packetLoss);
    this._audioQuality.set(metrics.audioQuality);
    this._connectionQuality.set(metrics.connectionQuality);
  }

  private startAudioVisualization() {
    const canvas = this.audioVisualizerCanvas?.nativeElement;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = () => {
      if (!this.isMicrophoneEnabled()) return;

      const audioData = this.audioProcessor.getVisualizationData();
      this.drawAudioVisualization(ctx, audioData, canvas.width, canvas.height);
      
      requestAnimationFrame(animate);
    };

    animate();
  }

  private drawAudioVisualization(ctx: CanvasRenderingContext2D, audioData: Uint8Array, width: number, height: number) {
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#007bff';
    const barWidth = width / audioData.length;

    for (let i = 0; i < audioData.length; i++) {
      const barHeight = (audioData[i] / 255) * height;
      ctx.fillRect(i * barWidth, height - barHeight, barWidth - 1, barHeight);
    }
  }

  private addLog(level: 'info' | 'warning' | 'error', message: string) {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: Date.now(),
      level,
      message
    };

    this._recentLogs.update(logs => {
      const newLogs = [newLog, ...logs];
      return newLogs.slice(0, 50); // Keep only recent 50 logs
    });
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private cleanup() {
    this.stopAudioCapture();
    this.streamService.cleanup();
    this.audioProcessor.cleanup();
  }

  // UI Helper Methods
  getStatusText(): string {
    const statusMap = {
      'connected': 'Connected',
      'connecting': 'Connecting...',
      'disconnected': 'Disconnected'
    };
    
    return statusMap[this.connectionStatus()];
  }

  getLatencyClass(): string {
    const latency = this.latency();
    if (latency < 100) return 'good';
    if (latency < 300) return 'medium';
    return 'poor';
  }

  getPacketLossClass(): string {
    const loss = this.packetLoss();
    if (loss < 1) return 'good';
    if (loss < 5) return 'medium';
    return 'poor';
  }

  formatTime(timestamp: number): string {
    return new Date(timestamp).toLocaleTimeString();
  }

  trackLogEntry(index: number, log: LogEntry): string {
    return log.id;
  }
}

interface LogEntry {
  id: string;
  timestamp: number;
  level: 'info' | 'warning' | 'error';
  message: string;
}
```

#### Advanced Streaming Configuration

```typescript
// Advanced streaming service with multiple protocols and adaptive quality
@Injectable({
  providedIn: 'root'
})
export class AdvancedStreamService {
  private connections = new Map<string, WebSocket>();
  private messageQueues = new Map<string, StreamingMessage[]>();
  private performanceMetrics = signal({
    latency: 0,
    packetLoss: 0,
    audioQuality: 10,
    connectionQuality: 100,
    bandwidth: 0
  });

  private adaptiveQuality = {
    enabled: true,
    levels: [
      { name: 'ultra', audioQuality: 320, videoQuality: '1080p', frameRate: 60 },
      { name: 'high', audioQuality: 256, videoQuality: '720p', frameRate: 30 },
      { name: 'medium', audioQuality: 128, videoQuality: '480p', frameRate: 30 },
      { name: 'low', audioQuality: 64, videoQuality: '360p', frameRate: 15 }
    ],
    currentLevel: 1
  };

  async connectWithFailover(primaryConfig: ConnectionConfig, fallbackConfigs: ConnectionConfig[]) {
    try {
      await this.connect(primaryConfig);
      console.log('Connected to primary server');
    } catch (primaryError) {
      console.warn('Primary connection failed, trying fallbacks:', primaryError);
      
      for (let i = 0; i < fallbackConfigs.length; i++) {
        try {
          await this.connect(fallbackConfigs[i]);
          console.log(`Connected to fallback server ${i + 1}`);
          return;
        } catch (fallbackError) {
          console.warn(`Fallback ${i + 1} failed:`, fallbackError);
        }
      }
      
      throw new Error('All connection attempts failed');
    }
  }

  async setupMultiplexedStreams(configs: { [streamName: string]: ConnectionConfig }) {
    const connectionPromises = Object.entries(configs).map(async ([streamName, config]) => {
      try {
        const ws = new WebSocket(config.websocket.url, config.websocket.protocols);
        await this.waitForConnection(ws);
        this.connections.set(streamName, ws);
        this.setupStreamHandlers(streamName, ws);
        console.log(`Stream '${streamName}' connected`);
      } catch (error) {
        console.error(`Failed to connect stream '${streamName}':`, error);
        throw error;
      }
    });

    await Promise.all(connectionPromises);
    console.log('All streams connected successfully');
  }

  private setupAdaptiveQualityMonitoring() {
    setInterval(() => {
      const metrics = this.performanceMetrics();
      
      if (metrics.latency > 200 || metrics.packetLoss > 2) {
        this.degradeQuality();
      } else if (metrics.latency < 50 && metrics.packetLoss < 0.1) {
        this.upgradeQuality();
      }
    }, 5000);
  }

  private degradeQuality() {
    if (this.adaptiveQuality.currentLevel < this.adaptiveQuality.levels.length - 1) {
      this.adaptiveQuality.currentLevel++;
      const newLevel = this.adaptiveQuality.levels[this.adaptiveQuality.currentLevel];
      console.log(`Quality degraded to: ${newLevel.name}`);
      this.applyQualitySettings(newLevel);
    }
  }

  private upgradeQuality() {
    if (this.adaptiveQuality.currentLevel > 0) {
      this.adaptiveQuality.currentLevel--;
      const newLevel = this.adaptiveQuality.levels[this.adaptiveQuality.currentLevel];
      console.log(`Quality upgraded to: ${newLevel.name}`);
      this.applyQualitySettings(newLevel);
    }
  }

  private applyQualitySettings(level: any) {
    // Apply audio quality settings
    this.updateAudioQuality(level.audioQuality);
    
    // Apply video quality settings
    this.updateVideoQuality(level.videoQuality, level.frameRate);
    
    // Notify clients of quality change
    this.notifyQualityChange(level);
  }

  private updateAudioQuality(bitrate: number) {
    const message: StreamingMessage = {
      header: {
        message_id: this.generateMessageId(),
        timestamp: Date.now(),
        message_type: 'system_event',
        priority: 'high',
        content_type: 'application/json',
        content_length: 0
      },
      payload: {
        data: {
          event_type: 'quality_change',
          audio_settings: {
            bitrate: bitrate,
            codec: bitrate > 128 ? 'opus' : 'aac',
            sample_rate: bitrate > 64 ? 48000 : 16000
          }
        }
      },
      routing: {
        source: 'client',
        destination: 'audio_processor'
      }
    };

    this.broadcastToAllStreams(message);
  }
}
```

The WebSocket Streaming system provides enterprise-grade real-time communication capabilities with comprehensive connection management, adaptive quality control, and robust error handling. The architecture supports high-availability deployments with automatic failover and performance optimization to ensure smooth avatar interactions across various network conditions.