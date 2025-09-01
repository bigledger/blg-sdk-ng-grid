import { Component, input, output, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { 
  AvatarConfiguration, 
  CharacterTemplate, 
  ColorRGBA, 
  BodyLayer,
  FacialExpression,
  Gesture
} from '../interfaces/avatar.interfaces';
import { CharacterTemplatesService } from '../services/character-templates.service';

/**
 * Comprehensive customization interface for 2D avatars
 */
@Component({
  selector: 'ng-ui-avatar-customizer',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="avatar-customizer">
      <!-- Template Selection -->
      <div class="customizer-section">
        <h3>Character Template</h3>
        <div class="template-grid">
          @for (template of templates(); track template.id) {
            <div 
              class="template-card"
              [class.selected]="selectedTemplate()?.id === template.id"
              (click)="selectTemplate(template)">
              <div class="template-preview">
                <div class="mini-avatar" [attr.data-template]="template.id"></div>
              </div>
              <div class="template-info">
                <div class="template-name">{{ template.name }}</div>
                <div class="template-details">{{ template.gender }} • {{ template.ageGroup }}</div>
              </div>
            </div>
          }
        </div>
      </div>

      <!-- Color Customization -->
      <div class="customizer-section">
        <h3>Colors</h3>
        
        <!-- Skin Color -->
        <div class="color-group">
          <label>Skin Color</label>
          <div class="color-picker-container">
            <input 
              type="color" 
              [value]="skinColorHex()"
              (input)="updateSkinColor($event)"
              class="color-picker">
            <div class="color-presets">
              @for (preset of skinColorPresets; track preset.name) {
                <button 
                  class="color-preset"
                  [style.background-color]="rgbaToHex(preset.color)"
                  (click)="applySkinColorPreset(preset.color)"
                  [title]="preset.name">
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Hair Color -->
        <div class="color-group">
          <label>Hair Color</label>
          <div class="color-picker-container">
            <input 
              type="color" 
              [value]="hairColorHex()"
              (input)="updateHairColor($event)"
              class="color-picker">
            <div class="color-presets">
              @for (preset of hairColorPresets; track preset.name) {
                <button 
                  class="color-preset"
                  [style.background-color]="rgbaToHex(preset.color)"
                  (click)="applyHairColorPreset(preset.color)"
                  [title]="preset.name">
                </button>
              }
            </div>
          </div>
        </div>

        <!-- Eye Color -->
        <div class="color-group">
          <label>Eye Color</label>
          <div class="color-picker-container">
            <input 
              type="color" 
              [value]="eyeColorHex()"
              (input)="updateEyeColor($event)"
              class="color-picker">
            <div class="color-presets">
              @for (preset of eyeColorPresets; track preset.name) {
                <button 
                  class="color-preset"
                  [style.background-color]="rgbaToHex(preset.color)"
                  (click)="applyEyeColorPreset(preset.color)"
                  [title]="preset.name">
                </button>
              }
            </div>
          </div>
        </div>
      </div>

      <!-- Style Customization -->
      <div class="customizer-section">
        <h3>Styles</h3>
        
        <!-- Hair Style -->
        <div class="style-group">
          <label>Hair Style</label>
          <div class="style-options">
            @for (style of hairStyles; track style.id) {
              <button 
                class="style-option"
                [class.selected]="selectedHairStyle() === style.id"
                (click)="selectHairStyle(style.id)">
                {{ style.name }}
              </button>
            }
          </div>
        </div>

        <!-- Clothing Style -->
        <div class="style-group">
          <label>Clothing Style</label>
          <div class="style-options">
            @for (style of clothingStyles; track style.id) {
              <button 
                class="style-option"
                [class.selected]="selectedClothingStyle() === style.id"
                (click)="selectClothingStyle(style.id)">
                {{ style.name }}
              </button>
            }
          </div>
        </div>
      </div>

      <!-- Accessories -->
      <div class="customizer-section">
        <h3>Accessories</h3>
        <div class="accessory-list">
          @for (accessory of accessories; track accessory.id) {
            <div class="accessory-item">
              <label class="accessory-label">
                <input 
                  type="checkbox"
                  [checked]="isAccessoryEnabled(accessory.id)"
                  (change)="toggleAccessory(accessory.id, $event)">
                <span>{{ accessory.name }}</span>
              </label>
              @if (isAccessoryEnabled(accessory.id) && accessory.hasColorOptions) {
                <input 
                  type="color"
                  [value]="getAccessoryColor(accessory.id)"
                  (input)="updateAccessoryColor(accessory.id, $event)"
                  class="accessory-color">
              }
            </div>
          }
        </div>
      </div>

      <!-- Expression Testing -->
      <div class="customizer-section">
        <h3>Test Expressions</h3>
        <div class="expression-controls">
          @for (expression of expressions(); track expression.id) {
            <button 
              class="expression-btn"
              (click)="testExpression(expression)">
              {{ expression.name }}
            </button>
          }
        </div>
      </div>

      <!-- Gesture Testing -->
      <div class="customizer-section">
        <h3>Test Gestures</h3>
        <div class="gesture-controls">
          @for (gesture of gestures(); track gesture.id) {
            <button 
              class="gesture-btn"
              (click)="testGesture(gesture)">
              {{ gesture.name }}
            </button>
          }
        </div>
      </div>

      <!-- Actions -->
      <div class="customizer-actions">
        <button 
          class="action-btn primary"
          (click)="saveConfiguration()">
          Save Configuration
        </button>
        <button 
          class="action-btn secondary"
          (click)="loadConfiguration()">
          Load Configuration
        </button>
        <button 
          class="action-btn secondary"
          (click)="resetToDefault()">
          Reset to Default
        </button>
        <button 
          class="action-btn secondary"
          (click)="exportConfiguration()">
          Export
        </button>
      </div>
    </div>
  `,
  styleUrl: './avatar-customizer.component.scss'
})
export class AvatarCustomizerComponent {
  // Inputs
  config = input<AvatarConfiguration | null>(null);

  // Outputs
  configurationChanged = output<AvatarConfiguration>();
  expressionTest = output<FacialExpression>();
  gestureTest = output<Gesture>();
  configurationSaved = output<AvatarConfiguration>();
  configurationLoaded = output<AvatarConfiguration>();

  // Internal state
  private readonly _selectedTemplate = signal<CharacterTemplate | null>(null);
  private readonly _selectedHairStyle = signal<string>('default');
  private readonly _selectedClothingStyle = signal<string>('casual');
  private readonly _enabledAccessories = signal<Set<string>>(new Set());
  private readonly _customColors = signal<{
    skin?: ColorRGBA;
    hair?: ColorRGBA;
    eye?: ColorRGBA;
    accessories: Map<string, ColorRGBA>;
  }>({ accessories: new Map() });

  // Services
  private templatesService = new CharacterTemplatesService();

  // Computed properties
  readonly selectedTemplate = this._selectedTemplate.asReadonly();
  readonly selectedHairStyle = this._selectedHairStyle.asReadonly();
  readonly selectedClothingStyle = this._selectedClothingStyle.asReadonly();
  readonly templates = this.templatesService.templates;
  readonly expressions = this.templatesService.baseExpressions;
  readonly gestures = this.templatesService.baseGestures;

  readonly skinColorHex = computed(() => {
    const color = this._customColors().skin || this._selectedTemplate()?.skinTone || { r: 255, g: 220, b: 177 };
    return this.rgbaToHex(color);
  });

  readonly hairColorHex = computed(() => {
    const color = this._customColors().hair || { r: 101, g: 67, b: 33 };
    return this.rgbaToHex(color);
  });

  readonly eyeColorHex = computed(() => {
    const color = this._customColors().eye || { r: 70, g: 130, b: 180 };
    return this.rgbaToHex(color);
  });

  // Color presets
  readonly skinColorPresets = [
    { name: 'Light', color: { r: 255, g: 220, b: 177 } },
    { name: 'Medium Light', color: { r: 240, g: 200, b: 165 } },
    { name: 'Medium', color: { r: 205, g: 170, b: 125 } },
    { name: 'Medium Dark', color: { r: 160, g: 120, b: 90 } },
    { name: 'Dark', color: { r: 115, g: 85, b: 60 } },
    { name: 'Very Dark', color: { r: 80, g: 60, b: 40 } }
  ];

  readonly hairColorPresets = [
    { name: 'Black', color: { r: 40, g: 40, b: 40 } },
    { name: 'Brown', color: { r: 101, g: 67, b: 33 } },
    { name: 'Dark Blonde', color: { r: 139, g: 119, b: 101 } },
    { name: 'Blonde', color: { r: 218, g: 165, b: 32 } },
    { name: 'Light Blonde', color: { r: 250, g: 240, b: 190 } },
    { name: 'Red', color: { r: 165, g: 42, b: 42 } },
    { name: 'Auburn', color: { r: 139, g: 69, b: 19 } },
    { name: 'Gray', color: { r: 128, g: 128, b: 128 } },
    { name: 'White', color: { r: 245, g: 245, b: 245 } }
  ];

  readonly eyeColorPresets = [
    { name: 'Brown', color: { r: 101, g: 67, b: 33 } },
    { name: 'Blue', color: { r: 70, g: 130, b: 180 } },
    { name: 'Green', color: { r: 34, g: 139, b: 34 } },
    { name: 'Hazel', color: { r: 139, g: 119, b: 101 } },
    { name: 'Gray', color: { r: 128, g: 128, b: 128 } },
    { name: 'Amber', color: { r: 255, g: 191, b: 0 } }
  ];

  // Style options
  readonly hairStyles = [
    { id: 'default', name: 'Default' },
    { id: 'short', name: 'Short' },
    { id: 'medium', name: 'Medium' },
    { id: 'long', name: 'Long' },
    { id: 'curly', name: 'Curly' },
    { id: 'wavy', name: 'Wavy' },
    { id: 'straight', name: 'Straight' },
    { id: 'bald', name: 'Bald' }
  ];

  readonly clothingStyles = [
    { id: 'casual', name: 'Casual' },
    { id: 'formal', name: 'Formal' },
    { id: 'business', name: 'Business' },
    { id: 'sports', name: 'Sports' },
    { id: 'elegant', name: 'Elegant' }
  ];

  readonly accessories = [
    { id: 'glasses', name: 'Glasses', hasColorOptions: true },
    { id: 'hat', name: 'Hat', hasColorOptions: true },
    { id: 'earrings', name: 'Earrings', hasColorOptions: true },
    { id: 'necklace', name: 'Necklace', hasColorOptions: true },
    { id: 'watch', name: 'Watch', hasColorOptions: false },
    { id: 'tie', name: 'Tie', hasColorOptions: true }
  ];

  constructor() {
    // Initialize with first template
    const firstTemplate = this.templates()[0];
    if (firstTemplate) {
      this._selectedTemplate.set(firstTemplate);
    }
  }

  selectTemplate(template: CharacterTemplate): void {
    this._selectedTemplate.set(template);
    this.emitConfiguration();
  }

  updateSkinColor(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    const color = this.hexToRgba(hex);
    this._customColors.update(colors => ({ ...colors, skin: color }));
    this.emitConfiguration();
  }

  applySkinColorPreset(color: ColorRGBA): void {
    this._customColors.update(colors => ({ ...colors, skin: color }));
    this.emitConfiguration();
  }

  updateHairColor(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    const color = this.hexToRgba(hex);
    this._customColors.update(colors => ({ ...colors, hair: color }));
    this.emitConfiguration();
  }

  applyHairColorPreset(color: ColorRGBA): void {
    this._customColors.update(colors => ({ ...colors, hair: color }));
    this.emitConfiguration();
  }

  updateEyeColor(event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    const color = this.hexToRgba(hex);
    this._customColors.update(colors => ({ ...colors, eye: color }));
    this.emitConfiguration();
  }

  applyEyeColorPreset(color: ColorRGBA): void {
    this._customColors.update(colors => ({ ...colors, eye: color }));
    this.emitConfiguration();
  }

  selectHairStyle(styleId: string): void {
    this._selectedHairStyle.set(styleId);
    this.emitConfiguration();
  }

  selectClothingStyle(styleId: string): void {
    this._selectedClothingStyle.set(styleId);
    this.emitConfiguration();
  }

  toggleAccessory(accessoryId: string, event: Event): void {
    const isChecked = (event.target as HTMLInputElement).checked;
    this._enabledAccessories.update(accessories => {
      const newSet = new Set(accessories);
      if (isChecked) {
        newSet.add(accessoryId);
      } else {
        newSet.delete(accessoryId);
      }
      return newSet;
    });
    this.emitConfiguration();
  }

  isAccessoryEnabled(accessoryId: string): boolean {
    return this._enabledAccessories().has(accessoryId);
  }

  updateAccessoryColor(accessoryId: string, event: Event): void {
    const hex = (event.target as HTMLInputElement).value;
    const color = this.hexToRgba(hex);
    this._customColors.update(colors => {
      const newAccessories = new Map(colors.accessories);
      newAccessories.set(accessoryId, color);
      return { ...colors, accessories: newAccessories };
    });
    this.emitConfiguration();
  }

  getAccessoryColor(accessoryId: string): string {
    const color = this._customColors().accessories.get(accessoryId) || { r: 100, g: 100, b: 100 };
    return this.rgbaToHex(color);
  }

  testExpression(expression: FacialExpression): void {
    this.expressionTest.emit(expression);
  }

  testGesture(gesture: Gesture): void {
    this.gestureTest.emit(gesture);
  }

  saveConfiguration(): void {
    const config = this.generateConfiguration();
    // Save to localStorage
    localStorage.setItem('avatar-config', JSON.stringify(config));
    this.configurationSaved.emit(config);
  }

  loadConfiguration(): void {
    const saved = localStorage.getItem('avatar-config');
    if (saved) {
      try {
        const config: AvatarConfiguration = JSON.parse(saved);
        this.applyConfiguration(config);
        this.configurationLoaded.emit(config);
      } catch (error) {
        console.error('Failed to load configuration:', error);
      }
    }
  }

  resetToDefault(): void {
    const firstTemplate = this.templates()[0];
    if (firstTemplate) {
      this._selectedTemplate.set(firstTemplate);
      this._selectedHairStyle.set('default');
      this._selectedClothingStyle.set('casual');
      this._enabledAccessories.set(new Set());
      this._customColors.set({ accessories: new Map() });
      this.emitConfiguration();
    }
  }

  exportConfiguration(): void {
    const config = this.generateConfiguration();
    const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'avatar-configuration.json';
    a.click();
    
    URL.revokeObjectURL(url);
  }

  private applyConfiguration(config: AvatarConfiguration): void {
    // Apply template
    const template = this.templates().find(t => t.id === config.character.id);
    if (template) {
      this._selectedTemplate.set(template);
    }

    // Apply customizations
    this._customColors.set({
      skin: config.customizations.skinColor,
      hair: config.customizations.hairColor,
      eye: config.customizations.eyeColor,
      accessories: new Map(Object.entries(config.customizations.clothingColors || {}))
    });

    this.emitConfiguration();
  }

  private generateConfiguration(): AvatarConfiguration {
    const template = this._selectedTemplate();
    if (!template) {
      throw new Error('No template selected');
    }

    const colors = this._customColors();
    const clothingColors: { [layerId: string]: ColorRGBA } = {};
    colors.accessories.forEach((color, id) => {
      clothingColors[id] = color;
    });

    return {
      character: template,
      layers: [...template.baseLayers], // TODO: Apply style modifications
      customizations: {
        skinColor: colors.skin,
        hairColor: colors.hair,
        eyeColor: colors.eye,
        clothingColors
      },
      animations: {
        blinkFrequency: 3000
      }
    };
  }

  private emitConfiguration(): void {
    try {
      const config = this.generateConfiguration();
      this.configurationChanged.emit(config);
    } catch (error) {
      console.error('Failed to generate configuration:', error);
    }
  }

  private rgbaToHex(color: ColorRGBA): string {
    const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
    return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
  }

  private hexToRgba(hex: string): ColorRGBA {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16),
      a: 1
    } : { r: 0, g: 0, b: 0, a: 1 };
  }
}