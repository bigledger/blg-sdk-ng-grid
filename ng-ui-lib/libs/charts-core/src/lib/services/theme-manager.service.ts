/**
 * Theme Manager Service - Handles chart theming and styling
 */

import { Injectable } from '@angular/core';
import { ThemeConfig } from '../interfaces';

@Injectable({
  providedIn: 'root'
})
export class ThemeManager {
  private appliedThemes = new Map<HTMLElement, string>();
  
  applyTheme(theme: string | ThemeConfig, container: HTMLElement): void {
    // Remove existing theme classes
    const existingTheme = this.appliedThemes.get(container);
    if (existingTheme) {
      container.classList.remove(`blg-theme-${existingTheme}`);
    }
    
    if (typeof theme === 'string') {
      container.classList.add(`blg-theme-${theme}`);
      this.appliedThemes.set(container, theme);
    } else {
      container.classList.add(`blg-theme-${theme.name}`);
      this.appliedThemes.set(container, theme.name);
      this.applyCustomTheme(theme, container);
    }
  }
  
  private applyCustomTheme(theme: ThemeConfig, container: HTMLElement): void {
    const style = container.style;
    
    // Apply CSS custom properties
    style.setProperty('--blg-chart-bg', theme.colors.background);
    style.setProperty('--blg-chart-text-color', theme.colors.text);
    style.setProperty('--blg-chart-axis-color', theme.colors.axis);
    style.setProperty('--blg-chart-grid-color', theme.colors.grid);
    style.setProperty('--blg-chart-primary-font', theme.fonts.primary);
    
    // Apply primary colors
    theme.colors.primary.forEach((color, index) => {
      style.setProperty(`--blg-chart-color-${index}`, color);
    });
  }
}