/**
 * Animation Controller Service - Handles chart animations and transitions
 */

import { Injectable } from '@angular/core';
import { ChartDataset, AnimationEasing } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class AnimationController {
  private activeAnimations = new Map<string, number>();
  
  animateDataUpdate(renderer: any, data: ChartDataset, duration: number, callback: () => void): void {
    // Cancel existing animations
    this.cancelAnimation('data-update');
    
    // Simple animation implementation
    let startTime: number;
    
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Apply easing
      const easedProgress = this.easeInOutCubic(progress);
      
      if (progress < 1) {
        const animationId = requestAnimationFrame(animate);
        this.activeAnimations.set('data-update', animationId);
      } else {
        callback();
        this.activeAnimations.delete('data-update');
      }
    };
    
    const animationId = requestAnimationFrame(animate);
    this.activeAnimations.set('data-update', animationId);
  }
  
  animateZoom(renderer: any, domain: { x?: [any, any]; y?: [any, any] }): void {
    // Implementation for zoom animation
    console.log('Animate zoom to:', domain);
  }
  
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  private cancelAnimation(key: string): void {
    const animationId = this.activeAnimations.get(key);
    if (animationId) {
      cancelAnimationFrame(animationId);
      this.activeAnimations.delete(key);
    }
  }
  
  destroy(): void {
    this.activeAnimations.forEach(animationId => {
      cancelAnimationFrame(animationId);
    });
    this.activeAnimations.clear();
  }
}