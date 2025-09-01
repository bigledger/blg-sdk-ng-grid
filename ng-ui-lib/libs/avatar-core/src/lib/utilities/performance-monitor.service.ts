import { Injectable, signal, computed, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval, Subject } from 'rxjs';
import { debounceTime, filter } from 'rxjs/operators';

/**
 * Performance metric types
 */
export interface PerformanceMetrics {
  // Rendering metrics
  fps: number;
  frameTime: number; // milliseconds
  renderTime: number; // milliseconds
  paintTime: number; // milliseconds
  
  // Memory metrics
  memoryUsage: number; // MB
  heapUsed: number; // MB
  heapTotal: number; // MB
  heapLimit: number; // MB
  
  // CPU metrics
  cpuUsage: number; // percentage
  gpuUsage?: number; // percentage (if available)
  
  // Network metrics
  networkLatency: number; // milliseconds
  bandwidthUsage: number; // KB/s
  
  // Avatar-specific metrics
  activeAvatars: number;
  processingQueue: number;
  audioBufferHealth: number; // 0-1
  gestureProcessingTime: number; // milliseconds
  lipSyncAccuracy: number; // 0-1
  
  // System metrics
  timestamp: number;
  devicePixelRatio: number;
  viewportSize: { width: number; height: number };
  batteryLevel?: number; // 0-1 (if available)
  thermalState?: 'normal' | 'fair' | 'serious' | 'critical';
}

/**
 * Performance alert levels
 */
export type AlertLevel = 'info' | 'warning' | 'critical';

/**
 * Performance alert
 */
export interface PerformanceAlert {
  id: string;
  level: AlertLevel;
  metric: keyof PerformanceMetrics;
  value: number;
  threshold: number;
  message: string;
  timestamp: number;
  suggestions: string[];
}

/**
 * Performance thresholds configuration
 */
export interface PerformanceThresholds {
  fps: { warning: number; critical: number };
  frameTime: { warning: number; critical: number };
  memoryUsage: { warning: number; critical: number };
  cpuUsage: { warning: number; critical: number };
  networkLatency: { warning: number; critical: number };
  audioBufferHealth: { warning: number; critical: number };
}

/**
 * Performance optimization settings
 */
export interface OptimizationSettings {
  enabled: boolean;
  autoReduce: boolean;
  adaptiveQuality: boolean;
  targetFps: number;
  memoryLimit: number; // MB
  cpuLimit: number; // percentage
  networkOptimization: boolean;
  batteryOptimization: boolean;
}

/**
 * Performance profile for different scenarios
 */
export interface PerformanceProfile {
  id: string;
  name: string;
  description: string;
  thresholds: PerformanceThresholds;
  optimizations: OptimizationSettings;
  conditions: {
    deviceType?: 'mobile' | 'tablet' | 'desktop';
    batteryLevel?: number; // Below this level
    thermalState?: 'fair' | 'serious' | 'critical';
    networkType?: 'slow-2g' | '2g' | '3g' | '4g' | '5g';
  };
}

/**
 * Performance monitoring service for avatar applications.
 * Tracks system performance and provides optimization recommendations.
 */
@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private destroyRef = inject(DestroyRef);

  // Performance state signals
  private _currentMetrics = signal<PerformanceMetrics | null>(null);
  private _metricsHistory = signal<PerformanceMetrics[]>([]);
  private _alerts = signal<PerformanceAlert[]>([]);
  private _isMonitoring = signal<boolean>(false);

  // Configuration signals
  private _monitoringInterval = signal<number>(1000); // milliseconds
  private _historyLimit = signal<number>(300); // Keep 5 minutes at 1s intervals
  private _activeProfile = signal<PerformanceProfile | null>(null);
  private _profiles = signal<Map<string, PerformanceProfile>>(new Map());
  private _customThresholds = signal<PerformanceThresholds | null>(null);

  // Performance tracking
  private _frameStats = signal<{ frames: number; startTime: number }>({ frames: 0, startTime: 0 });
  private _renderObserver: PerformanceObserver | null = null;
  private _memoryObserver: PerformanceObserver | null = null;

  // Event subjects
  private metricsUpdated$ = new Subject<PerformanceMetrics>();
  private alertTriggered$ = new Subject<PerformanceAlert>();
  private optimizationApplied$ = new Subject<{ optimization: string; reason: string }>();
  private profileChanged$ = new Subject<{ old: PerformanceProfile | null; new: PerformanceProfile | null }>();

  // Computed values
  readonly currentMetrics = this._currentMetrics.asReadonly();
  readonly isMonitoring = this._isMonitoring.asReadonly();
  readonly activeProfile = this._activeProfile.asReadonly();
  readonly alerts = this._alerts.asReadonly();

  readonly averageMetrics = computed(() => {
    const history = this._metricsHistory();
    if (history.length === 0) return null;

    const sums: Partial<PerformanceMetrics> = {};
    const keys = Object.keys(history[0]) as (keyof PerformanceMetrics)[];
    
    keys.forEach(key => {
      if (typeof history[0][key] === 'number') {
        sums[key] = history.reduce((sum, metric) => 
          sum + (metric[key] as number || 0), 0
        ) / history.length;
      }
    });

    return sums as PerformanceMetrics;
  });

  readonly performanceScore = computed(() => {
    const current = this._currentMetrics();
    if (!current) return 100;

    let score = 100;
    const thresholds = this.getCurrentThresholds();

    // FPS score (30% weight)
    if (current.fps < thresholds.fps.critical) score -= 30;
    else if (current.fps < thresholds.fps.warning) score -= 15;

    // Memory score (25% weight)
    if (current.memoryUsage > thresholds.memoryUsage.critical) score -= 25;
    else if (current.memoryUsage > thresholds.memoryUsage.warning) score -= 12;

    // CPU score (25% weight)
    if (current.cpuUsage > thresholds.cpuUsage.critical) score -= 25;
    else if (current.cpuUsage > thresholds.cpuUsage.warning) score -= 12;

    // Network score (10% weight)
    if (current.networkLatency > thresholds.networkLatency.critical) score -= 10;
    else if (current.networkLatency > thresholds.networkLatency.warning) score -= 5;

    // Audio buffer score (10% weight)
    if (current.audioBufferHealth < thresholds.audioBufferHealth.critical) score -= 10;
    else if (current.audioBufferHealth < thresholds.audioBufferHealth.warning) score -= 5;

    return Math.max(0, Math.min(100, score));
  });

  readonly recentAlerts = computed(() => {
    const now = Date.now();
    const recentThreshold = now - 60000; // Last minute
    return this._alerts().filter(alert => alert.timestamp > recentThreshold);
  });

  // Public observables
  readonly metricsUpdated = this.metricsUpdated$.asObservable();
  readonly alertTriggered = this.alertTriggered$.asObservable();
  readonly optimizationApplied = this.optimizationApplied$.asObservable();
  readonly profileChanged = this.profileChanged$.asObservable();

  constructor() {
    this.initializeDefaultProfiles();
    this.setupPerformanceObservers();
    this.detectDeviceCapabilities();
  }

  /**
   * Start performance monitoring
   */
  startMonitoring(intervalMs: number = 1000): void {
    if (this._isMonitoring()) return;

    this._monitoringInterval.set(intervalMs);
    this._isMonitoring.set(true);

    // Reset frame counting
    this._frameStats.set({ frames: 0, startTime: performance.now() });

    // Start metric collection interval
    interval(intervalMs)
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        filter(() => this._isMonitoring())
      )
      .subscribe(() => {
        this.collectMetrics();
      });
  }

  /**
   * Stop performance monitoring
   */
  stopMonitoring(): void {
    this._isMonitoring.set(false);
    
    if (this._renderObserver) {
      this._renderObserver.disconnect();
    }
    
    if (this._memoryObserver) {
      this._memoryObserver.disconnect();
    }
  }

  /**
   * Set custom performance thresholds
   */
  setThresholds(thresholds: Partial<PerformanceThresholds>): void {
    const current = this.getCurrentThresholds();
    this._customThresholds.set({ ...current, ...thresholds });
  }

  /**
   * Set active performance profile
   */
  setProfile(profileId: string): void {
    const profile = this._profiles().get(profileId);
    const oldProfile = this._activeProfile();
    
    this._activeProfile.set(profile || null);
    
    if (profile) {
      // Apply profile thresholds
      this.setThresholds(profile.thresholds);
      
      // Apply optimization settings
      this.applyOptimizationSettings(profile.optimizations);
    }

    this.profileChanged$.next({ old: oldProfile, new: profile || null });
  }

  /**
   * Add custom performance profile
   */
  addProfile(profile: PerformanceProfile): void {
    this._profiles.update(profiles => {
      const newProfiles = new Map(profiles);
      newProfiles.set(profile.id, profile);
      return newProfiles;
    });
  }

  /**
   * Get performance metrics history
   */
  getMetricsHistory(duration: number = 60000): PerformanceMetrics[] {
    const now = Date.now();
    const cutoff = now - duration;
    return this._metricsHistory().filter(metric => metric.timestamp > cutoff);
  }

  /**
   * Get specific metric trend
   */
  getMetricTrend(metric: keyof PerformanceMetrics, duration: number = 60000): number[] {
    const history = this.getMetricsHistory(duration);
    return history.map(m => m[metric] as number).filter(v => typeof v === 'number');
  }

  /**
   * Generate performance report
   */
  generateReport(duration: number = 300000): {
    summary: {
      averageScore: number;
      alertCount: number;
      criticalAlerts: number;
      uptime: number;
    };
    metrics: {
      fps: { avg: number; min: number; max: number };
      memory: { avg: number; min: number; max: number };
      cpu: { avg: number; min: number; max: number };
    };
    recommendations: string[];
    alerts: PerformanceAlert[];
  } {
    const history = this.getMetricsHistory(duration);
    const now = Date.now();
    const alerts = this._alerts().filter(a => a.timestamp > now - duration);
    
    if (history.length === 0) {
      return {
        summary: { averageScore: 0, alertCount: 0, criticalAlerts: 0, uptime: 0 },
        metrics: { 
          fps: { avg: 0, min: 0, max: 0 },
          memory: { avg: 0, min: 0, max: 0 },
          cpu: { avg: 0, min: 0, max: 0 }
        },
        recommendations: [],
        alerts: []
      };
    }

    // Calculate summary statistics
    const fpsValues = history.map(h => h.fps);
    const memoryValues = history.map(h => h.memoryUsage);
    const cpuValues = history.map(h => h.cpuUsage);

    const fps = {
      avg: this.average(fpsValues),
      min: Math.min(...fpsValues),
      max: Math.max(...fpsValues)
    };

    const memory = {
      avg: this.average(memoryValues),
      min: Math.min(...memoryValues),
      max: Math.max(...memoryValues)
    };

    const cpu = {
      avg: this.average(cpuValues),
      min: Math.min(...cpuValues),
      max: Math.max(...cpuValues)
    };

    // Calculate average performance score
    const scores = history.map(h => this.calculatePerformanceScore(h));
    const averageScore = this.average(scores);

    const summary = {
      averageScore,
      alertCount: alerts.length,
      criticalAlerts: alerts.filter(a => a.level === 'critical').length,
      uptime: history.length * this._monitoringInterval() / 1000 // seconds
    };

    const recommendations = this.generateRecommendations(history, alerts);

    return {
      summary,
      metrics: { fps, memory, cpu },
      recommendations,
      alerts: alerts.slice(-10) // Last 10 alerts
    };
  }

  /**
   * Clear performance data
   */
  clearData(): void {
    this._metricsHistory.set([]);
    this._alerts.set([]);
    this._currentMetrics.set(null);
  }

  /**
   * Export performance data
   */
  exportData(format: 'json' | 'csv' = 'json'): string {
    const data = {
      metrics: this._metricsHistory(),
      alerts: this._alerts(),
      profile: this._activeProfile(),
      timestamp: Date.now()
    };

    if (format === 'json') {
      return JSON.stringify(data, null, 2);
    } else {
      // Convert to CSV format
      const metrics = this._metricsHistory();
      if (metrics.length === 0) return '';

      const headers = Object.keys(metrics[0]).join(',');
      const rows = metrics.map(metric => 
        Object.values(metric).map(v => 
          typeof v === 'object' ? JSON.stringify(v) : v
        ).join(',')
      );

      return [headers, ...rows].join('\n');
    }
  }

  /**
   * Collect current performance metrics
   */
  private async collectMetrics(): Promise<void> {
    try {
      const metrics: PerformanceMetrics = {
        // Rendering metrics
        fps: this.calculateFPS(),
        frameTime: this.calculateFrameTime(),
        renderTime: this.calculateRenderTime(),
        paintTime: this.calculatePaintTime(),

        // Memory metrics
        memoryUsage: this.getMemoryUsage(),
        heapUsed: this.getHeapUsed(),
        heapTotal: this.getHeapTotal(),
        heapLimit: this.getHeapLimit(),

        // CPU metrics
        cpuUsage: await this.getCPUUsage(),
        gpuUsage: this.getGPUUsage(),

        // Network metrics
        networkLatency: await this.measureNetworkLatency(),
        bandwidthUsage: this.getBandwidthUsage(),

        // Avatar-specific metrics
        activeAvatars: this.getActiveAvatarCount(),
        processingQueue: this.getProcessingQueueLength(),
        audioBufferHealth: this.getAudioBufferHealth(),
        gestureProcessingTime: this.getGestureProcessingTime(),
        lipSyncAccuracy: this.getLipSyncAccuracy(),

        // System metrics
        timestamp: Date.now(),
        devicePixelRatio: window.devicePixelRatio || 1,
        viewportSize: {
          width: window.innerWidth,
          height: window.innerHeight
        },
        batteryLevel: await this.getBatteryLevel(),
        thermalState: this.getThermalState()
      };

      // Update current metrics
      this._currentMetrics.set(metrics);

      // Add to history
      this._metricsHistory.update(history => {
        const newHistory = [...history, metrics];
        const limit = this._historyLimit();
        return newHistory.slice(-limit);
      });

      // Check for alerts
      this.checkAlerts(metrics);

      // Auto-apply optimizations if enabled
      this.checkAutoOptimizations(metrics);

      // Emit update event
      this.metricsUpdated$.next(metrics);

    } catch (error) {
      console.error('Failed to collect performance metrics:', error);
    }
  }

  /**
   * Calculate current FPS
   */
  private calculateFPS(): number {
    const stats = this._frameStats();
    const now = performance.now();
    const elapsed = now - stats.startTime;
    
    if (elapsed < 1000) return 0; // Need at least 1 second of data

    const fps = (stats.frames * 1000) / elapsed;
    
    // Reset frame counting
    this._frameStats.set({ frames: 0, startTime: now });
    
    return Math.round(fps);
  }

  /**
   * Increment frame count (called by animation loop)
   */
  incrementFrameCount(): void {
    if (this._isMonitoring()) {
      this._frameStats.update(stats => ({
        ...stats,
        frames: stats.frames + 1
      }));
    }
  }

  /**
   * Calculate frame time
   */
  private calculateFrameTime(): number {
    if (!window.performance.getEntriesByType) return 0;

    const entries = window.performance.getEntriesByType('measure')
      .filter(entry => entry.name.includes('frame'))
      .slice(-10); // Last 10 frames

    if (entries.length === 0) return 0;

    const avgDuration = entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;
    return Math.round(avgDuration * 100) / 100;
  }

  /**
   * Calculate render time
   */
  private calculateRenderTime(): number {
    if (!window.performance.getEntriesByType) return 0;

    const entries = window.performance.getEntriesByType('measure')
      .filter(entry => entry.name.includes('render'))
      .slice(-5); // Last 5 renders

    if (entries.length === 0) return 0;

    const avgDuration = entries.reduce((sum, entry) => sum + entry.duration, 0) / entries.length;
    return Math.round(avgDuration * 100) / 100;
  }

  /**
   * Calculate paint time
   */
  private calculatePaintTime(): number {
    if (!window.performance.getEntriesByType) return 0;

    const entries = window.performance.getEntriesByType('paint') as PerformancePaintTiming[];
    const lastPaint = entries[entries.length - 1];
    
    return lastPaint ? Math.round(lastPaint.startTime * 100) / 100 : 0;
  }

  /**
   * Get memory usage
   */
  private getMemoryUsage(): number {
    if ('memory' in window.performance) {
      const memory = (window.performance as any).memory;
      return Math.round(memory.usedJSHeapSize / (1024 * 1024) * 100) / 100; // MB
    }
    return 0;
  }

  /**
   * Get heap used
   */
  private getHeapUsed(): number {
    if ('memory' in window.performance) {
      const memory = (window.performance as any).memory;
      return Math.round(memory.usedJSHeapSize / (1024 * 1024) * 100) / 100; // MB
    }
    return 0;
  }

  /**
   * Get heap total
   */
  private getHeapTotal(): number {
    if ('memory' in window.performance) {
      const memory = (window.performance as any).memory;
      return Math.round(memory.totalJSHeapSize / (1024 * 1024) * 100) / 100; // MB
    }
    return 0;
  }

  /**
   * Get heap limit
   */
  private getHeapLimit(): number {
    if ('memory' in window.performance) {
      const memory = (window.performance as any).memory;
      return Math.round(memory.jsHeapSizeLimit / (1024 * 1024) * 100) / 100; // MB
    }
    return 0;
  }

  /**
   * Get CPU usage estimate
   */
  private async getCPUUsage(): Promise<number> {
    // Simplified CPU usage estimation
    // In a real implementation, this would measure actual CPU usage
    const startTime = performance.now();
    
    // Perform some CPU-intensive work
    let iterations = 0;
    const targetTime = 10; // 10ms test
    
    while (performance.now() - startTime < targetTime) {
      iterations++;
      Math.random();
    }
    
    const actualTime = performance.now() - startTime;
    const efficiency = targetTime / actualTime;
    
    // Convert to rough CPU usage percentage
    return Math.max(0, Math.min(100, 100 - (efficiency * 100)));
  }

  /**
   * Get GPU usage (if available)
   */
  private getGPUUsage(): number | undefined {
    // GPU usage is not easily available in web browsers
    // This would require WebGL extensions or browser-specific APIs
    return undefined;
  }

  /**
   * Measure network latency
   */
  private async measureNetworkLatency(): Promise<number> {
    try {
      const start = performance.now();
      
      // Use a lightweight request to measure latency
      const response = await fetch(window.location.origin, {
        method: 'HEAD',
        cache: 'no-cache'
      });
      
      const end = performance.now();
      return Math.round((end - start) * 100) / 100;
      
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get bandwidth usage estimate
   */
  private getBandwidthUsage(): number {
    // This would track actual network usage
    // For now, return a placeholder value
    return 0;
  }

  /**
   * Get active avatar count (placeholder)
   */
  private getActiveAvatarCount(): number {
    // This would integrate with the avatar state service
    return 1;
  }

  /**
   * Get processing queue length (placeholder)
   */
  private getProcessingQueueLength(): number {
    // This would integrate with message queue service
    return 0;
  }

  /**
   * Get audio buffer health (placeholder)
   */
  private getAudioBufferHealth(): number {
    // This would integrate with audio processor service
    return 1.0;
  }

  /**
   * Get gesture processing time (placeholder)
   */
  private getGestureProcessingTime(): number {
    // This would integrate with gesture generator service
    return 0;
  }

  /**
   * Get lip sync accuracy (placeholder)
   */
  private getLipSyncAccuracy(): number {
    // This would integrate with audio analyzer service
    return 1.0;
  }

  /**
   * Get battery level
   */
  private async getBatteryLevel(): Promise<number | undefined> {
    try {
      if ('getBattery' in navigator) {
        const battery = await (navigator as any).getBattery();
        return battery.level;
      }
    } catch (error) {
      // Battery API not available
    }
    return undefined;
  }

  /**
   * Get thermal state (placeholder)
   */
  private getThermalState(): 'normal' | 'fair' | 'serious' | 'critical' | undefined {
    // Thermal state is not easily available in web browsers
    return undefined;
  }

  /**
   * Check for performance alerts
   */
  private checkAlerts(metrics: PerformanceMetrics): void {
    const thresholds = this.getCurrentThresholds();
    const alerts: PerformanceAlert[] = [];

    // Check each metric against thresholds
    Object.entries(thresholds).forEach(([metricName, threshold]) => {
      const metricKey = metricName as keyof PerformanceMetrics;
      const value = metrics[metricKey] as number;
      
      if (typeof value !== 'number') return;

      let level: AlertLevel | null = null;
      let thresholdValue: number;

      if (metricName === 'audioBufferHealth' && value < threshold.critical) {
        level = 'critical';
        thresholdValue = threshold.critical;
      } else if (metricName === 'audioBufferHealth' && value < threshold.warning) {
        level = 'warning';
        thresholdValue = threshold.warning;
      } else if (value > threshold.critical) {
        level = 'critical';
        thresholdValue = threshold.critical;
      } else if (value > threshold.warning) {
        level = 'warning';
        thresholdValue = threshold.warning;
      }

      if (level) {
        const alert: PerformanceAlert = {
          id: this.generateAlertId(),
          level,
          metric: metricKey,
          value,
          threshold: thresholdValue,
          message: this.generateAlertMessage(metricKey, level, value, thresholdValue),
          timestamp: Date.now(),
          suggestions: this.generateSuggestions(metricKey, level, value)
        };

        alerts.push(alert);
      }
    });

    if (alerts.length > 0) {
      this._alerts.update(currentAlerts => [...currentAlerts, ...alerts]);
      alerts.forEach(alert => this.alertTriggered$.next(alert));
    }
  }

  /**
   * Check and apply auto-optimizations
   */
  private checkAutoOptimizations(metrics: PerformanceMetrics): void {
    const profile = this._activeProfile();
    if (!profile?.optimizations.enabled) return;

    const optimizations: Array<{ name: string; reason: string; action: () => void }> = [];

    // FPS optimization
    if (metrics.fps < profile.optimizations.targetFps * 0.8) {
      optimizations.push({
        name: 'Reduce Quality',
        reason: `FPS (${metrics.fps}) below target (${profile.optimizations.targetFps})`,
        action: () => this.applyQualityReduction()
      });
    }

    // Memory optimization
    if (metrics.memoryUsage > profile.optimizations.memoryLimit) {
      optimizations.push({
        name: 'Memory Cleanup',
        reason: `Memory usage (${metrics.memoryUsage}MB) exceeds limit (${profile.optimizations.memoryLimit}MB)`,
        action: () => this.applyMemoryCleanup()
      });
    }

    // Apply optimizations
    optimizations.forEach(opt => {
      opt.action();
      this.optimizationApplied$.next({
        optimization: opt.name,
        reason: opt.reason
      });
    });
  }

  /**
   * Get current performance thresholds
   */
  private getCurrentThresholds(): PerformanceThresholds {
    return this._customThresholds() || this._activeProfile()?.thresholds || this.getDefaultThresholds();
  }

  /**
   * Get default performance thresholds
   */
  private getDefaultThresholds(): PerformanceThresholds {
    return {
      fps: { warning: 25, critical: 15 },
      frameTime: { warning: 33, critical: 50 }, // milliseconds
      memoryUsage: { warning: 100, critical: 200 }, // MB
      cpuUsage: { warning: 70, critical: 90 }, // percentage
      networkLatency: { warning: 500, critical: 1000 }, // milliseconds
      audioBufferHealth: { warning: 0.3, critical: 0.1 } // 0-1
    };
  }

  /**
   * Calculate performance score for historical metrics
   */
  private calculatePerformanceScore(metrics: PerformanceMetrics): number {
    // Same logic as the computed performanceScore but for historical data
    let score = 100;
    const thresholds = this.getCurrentThresholds();

    if (metrics.fps < thresholds.fps.critical) score -= 30;
    else if (metrics.fps < thresholds.fps.warning) score -= 15;

    if (metrics.memoryUsage > thresholds.memoryUsage.critical) score -= 25;
    else if (metrics.memoryUsage > thresholds.memoryUsage.warning) score -= 12;

    if (metrics.cpuUsage > thresholds.cpuUsage.critical) score -= 25;
    else if (metrics.cpuUsage > thresholds.cpuUsage.warning) score -= 12;

    if (metrics.networkLatency > thresholds.networkLatency.critical) score -= 10;
    else if (metrics.networkLatency > thresholds.networkLatency.warning) score -= 5;

    if (metrics.audioBufferHealth < thresholds.audioBufferHealth.critical) score -= 10;
    else if (metrics.audioBufferHealth < thresholds.audioBufferHealth.warning) score -= 5;

    return Math.max(0, Math.min(100, score));
  }

  /**
   * Apply optimization settings
   */
  private applyOptimizationSettings(settings: OptimizationSettings): void {
    console.log('Applying optimization settings:', settings);
    // Implementation would apply various optimizations based on settings
  }

  /**
   * Apply quality reduction optimization
   */
  private applyQualityReduction(): void {
    console.log('Applying quality reduction optimization');
    // Implementation would reduce rendering quality, effects, etc.
  }

  /**
   * Apply memory cleanup optimization
   */
  private applyMemoryCleanup(): void {
    console.log('Applying memory cleanup optimization');
    // Implementation would clean up unused resources, cache, etc.
  }

  /**
   * Setup performance observers
   */
  private setupPerformanceObservers(): void {
    try {
      // Observe rendering performance
      if (window.PerformanceObserver) {
        this._renderObserver = new PerformanceObserver((list) => {
          // Process performance entries
        });
        
        this._renderObserver.observe({ entryTypes: ['measure', 'paint'] });

        // Observe memory usage
        this._memoryObserver = new PerformanceObserver((list) => {
          // Process memory entries
        });
        
        // Note: 'memory' entry type may not be available
        try {
          this._memoryObserver.observe({ entryTypes: ['memory'] });
        } catch (error) {
          // Memory observation not supported
        }
      }
    } catch (error) {
      console.warn('Performance observers not fully supported:', error);
    }
  }

  /**
   * Detect device capabilities
   */
  private detectDeviceCapabilities(): void {
    // Auto-select appropriate profile based on device
    const deviceType = this.detectDeviceType();
    const defaultProfile = deviceType === 'mobile' ? 'mobile_optimized' : 'desktop_standard';
    
    if (this._profiles().has(defaultProfile)) {
      this.setProfile(defaultProfile);
    }
  }

  /**
   * Detect device type
   */
  private detectDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const userAgent = navigator.userAgent.toLowerCase();
    const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent);
    const isTablet = /ipad|android(?!.*mobile)/i.test(userAgent);
    
    if (isTablet) return 'tablet';
    if (isMobile) return 'mobile';
    return 'desktop';
  }

  /**
   * Initialize default performance profiles
   */
  private initializeDefaultProfiles(): void {
    const profiles: PerformanceProfile[] = [
      {
        id: 'desktop_standard',
        name: 'Desktop Standard',
        description: 'Standard performance settings for desktop computers',
        thresholds: {
          fps: { warning: 25, critical: 15 },
          frameTime: { warning: 33, critical: 50 },
          memoryUsage: { warning: 200, critical: 400 },
          cpuUsage: { warning: 70, critical: 90 },
          networkLatency: { warning: 500, critical: 1000 },
          audioBufferHealth: { warning: 0.3, critical: 0.1 }
        },
        optimizations: {
          enabled: true,
          autoReduce: false,
          adaptiveQuality: true,
          targetFps: 30,
          memoryLimit: 300,
          cpuLimit: 80,
          networkOptimization: false,
          batteryOptimization: false
        },
        conditions: {
          deviceType: 'desktop'
        }
      },
      
      {
        id: 'mobile_optimized',
        name: 'Mobile Optimized',
        description: 'Optimized settings for mobile devices',
        thresholds: {
          fps: { warning: 20, critical: 12 },
          frameTime: { warning: 50, critical: 83 },
          memoryUsage: { warning: 50, critical: 100 },
          cpuUsage: { warning: 60, critical: 80 },
          networkLatency: { warning: 1000, critical: 2000 },
          audioBufferHealth: { warning: 0.4, critical: 0.2 }
        },
        optimizations: {
          enabled: true,
          autoReduce: true,
          adaptiveQuality: true,
          targetFps: 20,
          memoryLimit: 75,
          cpuLimit: 70,
          networkOptimization: true,
          batteryOptimization: true
        },
        conditions: {
          deviceType: 'mobile',
          batteryLevel: 0.2
        }
      }
    ];

    const profileMap = new Map<string, PerformanceProfile>();
    profiles.forEach(profile => profileMap.set(profile.id, profile));
    this._profiles.set(profileMap);
  }

  // Helper methods
  private average(values: number[]): number {
    return values.length > 0 ? values.reduce((sum, v) => sum + v, 0) / values.length : 0;
  }

  private generateAlertId(): string {
    return `alert_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  private generateAlertMessage(
    metric: keyof PerformanceMetrics,
    level: AlertLevel,
    value: number,
    threshold: number
  ): string {
    const metricName = metric.replace(/([A-Z])/g, ' $1').toLowerCase();
    return `${level.toUpperCase()}: ${metricName} (${Math.round(value * 100) / 100}) ${
      metric === 'audioBufferHealth' ? 'below' : 'above'
    } ${level} threshold (${threshold})`;
  }

  private generateSuggestions(
    metric: keyof PerformanceMetrics,
    level: AlertLevel,
    value: number
  ): string[] {
    const suggestions: Record<string, string[]> = {
      fps: [
        'Reduce visual effects quality',
        'Decrease animation complexity',
        'Lower render resolution',
        'Optimize gesture animations'
      ],
      memoryUsage: [
        'Clear audio buffer cache',
        'Reduce background quality',
        'Limit concurrent avatars',
        'Cleanup unused resources'
      ],
      cpuUsage: [
        'Reduce audio processing quality',
        'Simplify gesture generation',
        'Lower update frequency',
        'Pause background animations'
      ],
      networkLatency: [
        'Switch to local processing',
        'Reduce streaming quality',
        'Enable compression',
        'Use CDN resources'
      ],
      audioBufferHealth: [
        'Increase buffer size',
        'Reduce audio quality',
        'Check network connection',
        'Restart audio system'
      ]
    };

    return suggestions[metric as string] || ['Contact support for assistance'];
  }

  private generateRecommendations(
    history: PerformanceMetrics[],
    alerts: PerformanceAlert[]
  ): string[] {
    const recommendations: string[] = [];
    
    if (alerts.filter(a => a.metric === 'fps').length > 3) {
      recommendations.push('Consider reducing visual quality settings for better performance');
    }
    
    if (alerts.filter(a => a.metric === 'memoryUsage').length > 2) {
      recommendations.push('Memory usage is consistently high - enable automatic cleanup');
    }
    
    const avgCpu = this.average(history.map(h => h.cpuUsage));
    if (avgCpu > 60) {
      recommendations.push('Average CPU usage is high - consider mobile optimizations');
    }
    
    return recommendations;
  }
}