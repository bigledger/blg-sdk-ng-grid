import { Injectable, signal } from '@angular/core';
import { BehaviorSubject, Observable, timer } from 'rxjs';
import { map, takeWhile } from 'rxjs/operators';

export interface ProgressInfo {
  /** Current progress percentage (0-100) */
  percentage: number;
  /** Current step description */
  step: string;
  /** Current operation */
  operation: string;
  /** Estimated time remaining in seconds */
  estimatedTimeRemaining?: number;
  /** Export start time */
  startTime: number;
  /** Bytes processed */
  bytesProcessed?: number;
  /** Total bytes to process */
  totalBytes?: number;
  /** Current speed (bytes per second) */
  speed?: number;
}

/**
 * Service for tracking export progress and providing estimates
 */
@Injectable({
  providedIn: 'root'
})
export class ProgressTrackingService {
  private readonly _currentProgress = signal<ProgressInfo | null>(null);
  private readonly progressSubject = new BehaviorSubject<ProgressInfo | null>(null);
  private readonly operationStartTimes = new Map<string, number>();
  private readonly operationHistory = new Map<string, number[]>();

  readonly currentProgress = this._currentProgress.asReadonly();
  readonly progress$ = this.progressSubject.asObservable();

  /**
   * Start tracking progress for an operation
   */
  startProgress(operation: string, step: string, totalBytes?: number): void {
    const startTime = Date.now();
    this.operationStartTimes.set(operation, startTime);

    const progress: ProgressInfo = {
      percentage: 0,
      step,
      operation,
      startTime,
      bytesProcessed: 0,
      totalBytes,
      estimatedTimeRemaining: undefined,
      speed: 0
    };

    this._currentProgress.set(progress);
    this.progressSubject.next(progress);
  }

  /**
   * Update progress for an ongoing operation
   */
  updateProgress(
    operation: string,
    percentage: number,
    step?: string,
    bytesProcessed?: number
  ): void {
    const currentProgress = this._currentProgress();
    if (!currentProgress || currentProgress.operation !== operation) {
      return;
    }

    const now = Date.now();
    const elapsed = (now - currentProgress.startTime) / 1000; // seconds
    let estimatedTimeRemaining: number | undefined;
    let speed: number | undefined;

    // Calculate estimated time remaining
    if (percentage > 0 && percentage < 100) {
      const totalEstimatedTime = (elapsed * 100) / percentage;
      estimatedTimeRemaining = Math.max(0, totalEstimatedTime - elapsed);
    }

    // Calculate speed if we have byte information
    if (bytesProcessed !== undefined && currentProgress.bytesProcessed !== undefined) {
      const bytesDelta = bytesProcessed - currentProgress.bytesProcessed;
      if (elapsed > 0) {
        speed = bytesDelta / elapsed;
      }
    }

    const updatedProgress: ProgressInfo = {
      ...currentProgress,
      percentage: Math.min(100, Math.max(0, percentage)),
      step: step || currentProgress.step,
      bytesProcessed: bytesProcessed ?? currentProgress.bytesProcessed,
      estimatedTimeRemaining,
      speed
    };

    this._currentProgress.set(updatedProgress);
    this.progressSubject.next(updatedProgress);
  }

  /**
   * Complete progress tracking for an operation
   */
  completeProgress(operation: string): void {
    const currentProgress = this._currentProgress();
    if (!currentProgress || currentProgress.operation !== operation) {
      return;
    }

    const completedProgress: ProgressInfo = {
      ...currentProgress,
      percentage: 100,
      step: 'Completed',
      estimatedTimeRemaining: 0
    };

    this._currentProgress.set(completedProgress);
    this.progressSubject.next(completedProgress);

    // Record operation time for future estimates
    const startTime = this.operationStartTimes.get(operation);
    if (startTime) {
      const duration = Date.now() - startTime;
      this.recordOperationTime(operation, duration);
      this.operationStartTimes.delete(operation);
    }

    // Clear progress after a short delay
    setTimeout(() => {
      if (this._currentProgress()?.operation === operation) {
        this._currentProgress.set(null);
        this.progressSubject.next(null);
      }
    }, 1000);
  }

  /**
   * Cancel progress tracking for an operation
   */
  cancelProgress(operation: string): void {
    const currentProgress = this._currentProgress();
    if (currentProgress?.operation === operation) {
      this._currentProgress.set(null);
      this.progressSubject.next(null);
    }
    
    this.operationStartTimes.delete(operation);
  }

  /**
   * Get estimated duration for an operation based on history
   */
  getEstimatedDuration(operation: string): number | undefined {
    const history = this.operationHistory.get(operation);
    if (!history || history.length === 0) {
      return undefined;
    }

    // Calculate average duration from recent operations
    const recentHistory = history.slice(-10); // Last 10 operations
    const averageDuration = recentHistory.reduce((sum, duration) => sum + duration, 0) / recentHistory.length;
    
    return Math.round(averageDuration / 1000); // Convert to seconds
  }

  /**
   * Create a progress observable that emits updates at regular intervals
   */
  createProgressStream(
    operation: string,
    totalSteps: number,
    stepDuration: number = 1000
  ): Observable<ProgressInfo> {
    return timer(0, stepDuration).pipe(
      map(tick => {
        const percentage = Math.min(100, (tick / totalSteps) * 100);
        const step = `Step ${Math.min(tick + 1, totalSteps)} of ${totalSteps}`;
        
        return {
          percentage,
          step,
          operation,
          startTime: Date.now() - (tick * stepDuration),
          estimatedTimeRemaining: Math.max(0, (totalSteps - tick - 1) * (stepDuration / 1000))
        } as ProgressInfo;
      }),
      takeWhile(progress => progress.percentage < 100, true)
    );
  }

  /**
   * Create a progress tracker for file operations
   */
  createFileProgressTracker(operation: string, totalSize: number) {
    return {
      update: (processedBytes: number) => {
        const percentage = (processedBytes / totalSize) * 100;
        const step = `Processing ${this.formatBytes(processedBytes)} of ${this.formatBytes(totalSize)}`;
        this.updateProgress(operation, percentage, step, processedBytes);
      },
      
      complete: () => {
        this.completeProgress(operation);
      },
      
      cancel: () => {
        this.cancelProgress(operation);
      }
    };
  }

  /**
   * Get progress statistics
   */
  getProgressStats() {
    const currentProgress = this._currentProgress();
    if (!currentProgress) {
      return null;
    }

    const elapsed = (Date.now() - currentProgress.startTime) / 1000;
    const remainingTime = currentProgress.estimatedTimeRemaining || 0;
    const totalEstimatedTime = elapsed + remainingTime;

    return {
      elapsed,
      remainingTime,
      totalEstimatedTime,
      speed: currentProgress.speed || 0,
      bytesProcessed: currentProgress.bytesProcessed || 0,
      totalBytes: currentProgress.totalBytes || 0,
      efficiency: currentProgress.percentage / Math.max(1, elapsed) // percentage per second
    };
  }

  /**
   * Format bytes for display
   */
  formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Format time duration for display
   */
  formatDuration(seconds: number): string {
    if (seconds < 60) {
      return `${Math.round(seconds)}s`;
    } else if (seconds < 3600) {
      const minutes = Math.floor(seconds / 60);
      const remainingSeconds = Math.round(seconds % 60);
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      const hours = Math.floor(seconds / 3600);
      const remainingMinutes = Math.floor((seconds % 3600) / 60);
      return `${hours}h ${remainingMinutes}m`;
    }
  }

  /**
   * Record operation time for future estimates
   */
  private recordOperationTime(operation: string, duration: number): void {
    if (!this.operationHistory.has(operation)) {
      this.operationHistory.set(operation, []);
    }

    const history = this.operationHistory.get(operation)!;
    history.push(duration);

    // Keep only the last 20 records
    if (history.length > 20) {
      history.splice(0, history.length - 20);
    }
  }

  /**
   * Clear all progress history
   */
  clearHistory(): void {
    this.operationHistory.clear();
    this.operationStartTimes.clear();
  }

  /**
   * Get operation history
   */
  getOperationHistory(): Record<string, number[]> {
    const result: Record<string, number[]> = {};
    for (const [operation, times] of this.operationHistory) {
      result[operation] = [...times];
    }
    return result;
  }
}