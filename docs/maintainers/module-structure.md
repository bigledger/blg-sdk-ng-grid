# Module Structure

**Audience: Library Maintainers and Core Contributors**

This document provides an in-depth understanding of the BLG Grid library's module structure, dependencies, and architectural decisions. This information is essential for maintainers who need to understand how the library is organized and how changes in one module might affect others.

## Table of Contents

- [Module Overview](#module-overview)
- [Dependency Graph](#dependency-graph)
- [Module Responsibilities](#module-responsibilities)
- [Inter-Module Communication](#inter-module-communication)
- [Module Lifecycle](#module-lifecycle)
- [Public API Design](#public-api-design)
- [Internal APIs](#internal-apis)
- [Module Evolution Strategy](#module-evolution-strategy)
- [Breaking Change Management](#breaking-change-management)

## Module Overview

The BLG Grid library is organized into seven focused modules, each with specific responsibilities and clear boundaries. This modular architecture enables independent development, testing, and versioning while maintaining consistency across the library.

### Module Hierarchy

```
@blg-grid/core          (Foundation - No dependencies)
       ↑
   ┌───┴───┬───────┬───────┬───────┐
   ↑       ↑       ↑       ↑       ↑
@blg-grid/ @blg-grid/ @blg-grid/ @blg-grid/ @blg-grid/
  data     theme    column    row     cell
   ↑       ↑       ↑       ↑       ↑
   └───────┴───┬───┴───┬───┴───┬───┘
               ↑       ↑       ↑
            @blg-grid/grid (Top-level orchestration)
```

### Module Size and Complexity

```typescript
// Approximate module sizes (as of current version)
const moduleStats = {
  core: {
    files: 45,
    lines: 6500,
    exports: 120,
    complexity: 'Medium',
    role: 'Foundation services and types'
  },
  grid: {
    files: 35,
    lines: 4800,
    exports: 25,
    complexity: 'High',
    role: 'Main orchestration and integration'
  },
  column: {
    files: 20,
    lines: 2800,
    exports: 35,
    complexity: 'Medium',
    role: 'Column management and rendering'
  },
  row: {
    files: 18,
    lines: 2400,
    exports: 30,
    complexity: 'Medium',
    role: 'Row rendering and virtualization'
  },
  cell: {
    files: 25,
    lines: 3200,
    exports: 40,
    complexity: 'Medium',
    role: 'Cell rendering and editing'
  },
  data: {
    files: 22,
    lines: 3000,
    exports: 45,
    complexity: 'High',
    role: 'Data processing and transformation'
  },
  theme: {
    files: 15,
    lines: 1800,
    exports: 20,
    complexity: 'Low',
    role: 'Styling and theming system'
  }
};
```

## Dependency Graph

### External Dependencies

```typescript
// Core external dependencies shared across modules
const sharedDependencies = {
  '@angular/core': '^18.0.0',
  '@angular/common': '^18.0.0',
  '@angular/cdk': '^18.0.0',
  'rxjs': '~7.8.0',
  'tslib': '^2.3.0'
};

// Module-specific external dependencies
const moduleSpecificDeps = {
  data: {
    // Data processing utilities (if needed)
  },
  theme: {
    // No additional external dependencies
  },
  cell: {
    // No additional external dependencies beyond shared
  },
  // ... other modules
};
```

### Internal Dependencies

```typescript
// Dependency matrix (✓ = depends on, ✗ = no dependency)
const dependencyMatrix = {
  //        core  data  theme column row  cell  grid
  core:   [ '✗',  '✗',  '✗',  '✗',   '✗', '✗', '✗' ],
  data:   [ '✓',  '✗',  '✗',  '✗',   '✗', '✗', '✗' ],
  theme:  [ '✓',  '✗',  '✗',  '✗',   '✗', '✗', '✗' ],
  column: [ '✓',  '✓',  '✓',  '✗',   '✗', '✗', '✗' ],
  row:    [ '✓',  '✓',  '✓',  '✗',   '✗', '✗', '✗' ],
  cell:   [ '✓',  '✓',  '✓',  '✗',   '✗', '✗', '✗' ],
  grid:   [ '✓',  '✓',  '✓',  '✓',   '✓', '✓', '✗' ]
};
```

### Circular Dependency Prevention

```typescript
// ESLint rule to prevent circular dependencies
// eslint.config.js
{
  "rules": {
    "import/no-cycle": ["error", { "maxDepth": 3 }]
  }
}

// Nx dependency constraints
// nx.json
{
  "targetDefaults": {
    "lint": {
      "executor": "@nx/linter:eslint",
      "options": {
        "lintFilePatterns": ["libs/**/*.ts"],
        "rules": {
          "@nx/enforce-module-boundaries": [
            "error",
            {
              "allow": [],
              "depConstraints": [
                {
                  "sourceTag": "scope:core",
                  "onlyDependOnLibsWithTags": []
                },
                {
                  "sourceTag": "scope:feature",
                  "onlyDependOnLibsWithTags": ["scope:core", "scope:shared"]
                },
                {
                  "sourceTag": "scope:grid",
                  "onlyDependOnLibsWithTags": ["scope:core", "scope:feature"]
                }
              ]
            }
          ]
        }
      }
    }
  }
}
```

## Module Responsibilities

### @blg-grid/core

**Primary Responsibility**: Foundation services, interfaces, and utilities

```typescript
// Key exports from core module
export interface GridConfig<T = any> { /* ... */ }
export interface ColumnDefinition<T = any> { /* ... */ }
export interface DataSource<T = any> { /* ... */ }

export abstract class BlgDataSource<T = any> { /* ... */ }

export class GridStateService { /* ... */ }
export class EventBusService { /* ... */ }
export class ConfigurationService { /* ... */ }

export const GRID_CONFIG = new InjectionToken<GridConfig>('GRID_CONFIG');
export const GRID_FEATURES = new InjectionToken<GridFeatures>('GRID_FEATURES');
```

**Internal Structure:**
```
core/src/lib/
├── services/           # Core business logic services
│   ├── grid-state.service.ts
│   ├── event-bus.service.ts
│   └── configuration.service.ts
├── interfaces/         # TypeScript type definitions
│   ├── grid-config.interface.ts
│   ├── column-definition.interface.ts
│   └── data-source.interface.ts
├── models/            # Data models and classes
│   ├── grid-state.model.ts
│   └── data-source.model.ts
├── utilities/         # Pure utility functions
│   ├── validation.utilities.ts
│   ├── type-guards.utilities.ts
│   └── common.utilities.ts
├── constants/         # Application constants
│   └── grid.constants.ts
└── tokens/           # Dependency injection tokens
    └── grid.tokens.ts
```

### @blg-grid/data

**Primary Responsibility**: Data processing, transformation, and management

```typescript
// Key exports from data module
export class DataProcessingService {
  sortData<T>(data: T[], descriptors: SortDescriptor[]): T[];
  filterData<T>(data: T[], descriptors: FilterDescriptor[]): T[];
  groupData<T>(data: T[], descriptors: GroupDescriptor[]): GroupedData<T>;
  paginateData<T>(data: T[], config: PaginationConfig): PaginatedData<T>;
}

export class DataSourceManager {
  createClientSideDataSource<T>(data: T[]): BlgDataSource<T>;
  createServerSideDataSource<T>(config: ServerConfig): BlgDataSource<T>;
}

export class DataValidationService {
  validateRowData<T>(data: T, schema: DataSchema): ValidationResult;
  validateColumnData<T>(data: T[], column: ColumnDefinition<T>): ValidationResult;
}
```

**Processing Pipeline:**
```typescript
// Data processing pipeline architecture
export class DataPipeline<T> {
  private readonly stages: ProcessingStage<T>[] = [
    new ValidationStage<T>(),
    new FilteringStage<T>(),
    new SortingStage<T>(),
    new GroupingStage<T>(),
    new PaginationStage<T>()
  ];
  
  process(data: T[], config: ProcessingConfig): ProcessedData<T> {
    return this.stages.reduce(
      (result, stage) => stage.process(result, config),
      { data, metadata: {} }
    );
  }
}
```

### @blg-grid/theme

**Primary Responsibility**: Styling system and theme management

```typescript
// Key exports from theme module
export class ThemeService {
  setTheme(themeName: string): void;
  getTheme(themeName: string): Theme;
  createCustomTheme(config: ThemeConfig): Theme;
}

export interface Theme {
  name: string;
  colors: ColorPalette;
  typography: TypographyConfig;
  spacing: SpacingConfig;
  components: ComponentStyles;
}

export const BLG_THEMES = {
  light: LightTheme,
  dark: DarkTheme,
  compact: CompactTheme,
  comfortable: ComfortableTheme
};
```

**Theme Architecture:**
```typescript
// CSS-in-TS theme system
export interface ThemeConfig {
  colors: {
    primary: string;
    secondary: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    onBackground: string;
    onSurface: string;
  };
  
  spacing: {
    xs: string;  // 4px
    sm: string;  // 8px
    md: string;  // 16px
    lg: string;  // 24px
    xl: string;  // 32px
  };
  
  typography: {
    fontFamily: string;
    fontSize: {
      small: string;
      medium: string;
      large: string;
    };
  };
  
  components: {
    grid: GridComponentTheme;
    header: HeaderComponentTheme;
    cell: CellComponentTheme;
  };
}
```

### @blg-grid/column

**Primary Responsibility**: Column management, headers, and column-specific operations

```typescript
// Key exports from column module
export class BlgColumnHeaderComponent { /* ... */ }
export class BlgColumnResizerComponent { /* ... */ }
export class BlgColumnMenuComponent { /* ... */ }

export class ColumnService {
  updateColumnWidth(columnId: string, width: number): void;
  updateColumnVisibility(columnId: string, visible: boolean): void;
  reorderColumns(sourceIndex: number, targetIndex: number): void;
}

export class ColumnValidationService {
  validateColumnDefinition(column: ColumnDefinition): ValidationResult;
  validateColumnConstraints(columns: ColumnDefinition[]): ValidationResult;
}
```

### @blg-grid/row

**Primary Responsibility**: Row rendering, selection, and row-level operations

```typescript
// Key exports from row module
export class BlgRowComponent { /* ... */ }
export class BlgVirtualRowComponent { /* ... */ }
export class BlgRowSelectionComponent { /* ... */ }

export class RowService {
  selectRow(index: number): void;
  deselectRow(index: number): void;
  toggleRowSelection(index: number): void;
  selectRange(start: number, end: number): void;
}

export class RowRenderingService {
  renderRow<T>(data: T, columns: ColumnDefinition<T>[]): RowViewModel;
  calculateRowHeight(rowData: any, columns: ColumnDefinition[]): number;
}
```

### @blg-grid/cell

**Primary Responsibility**: Cell rendering, editing, and cell-level operations

```typescript
// Key exports from cell module
export class BlgCellComponent { /* ... */ }
export class BlgCellEditorComponent { /* ... */ }
export class BlgCellRendererComponent { /* ... */ }

export class CellService {
  getCellValue<T>(row: T, column: ColumnDefinition<T>): any;
  setCellValue<T>(row: T, column: ColumnDefinition<T>, value: any): void;
  validateCellValue(value: any, column: ColumnDefinition): ValidationResult;
}

export class CellRenderingService {
  renderCell(value: any, column: ColumnDefinition): CellViewModel;
  createCellEditor(column: ColumnDefinition): CellEditor;
}
```

### @blg-grid/grid

**Primary Responsibility**: Main grid orchestration and integration

```typescript
// Key exports from grid module
export class BlgGridComponent { /* ... */ }
export class BlgGridModule { /* ... */ }

export class GridOrchestrationService {
  initializeGrid(config: GridConfig): void;
  updateGridState(updates: Partial<GridState>): void;
  destroyGrid(): void;
}

// Main module that brings everything together
@NgModule({
  imports: [
    // All feature modules
    BlgCoreModule,
    BlgDataModule,
    BlgThemeModule,
    BlgColumnModule,
    BlgRowModule,
    BlgCellModule,
    
    // Angular dependencies
    CommonModule,
    ScrollingModule
  ],
  declarations: [
    BlgGridComponent
  ],
  exports: [
    BlgGridComponent,
    // Re-export key components from other modules
    BlgColumnHeaderComponent,
    BlgCellComponent,
    BlgRowComponent
  ]
})
export class BlgGridModule { }
```

## Inter-Module Communication

### Event-Driven Architecture

```typescript
// Core event bus for cross-module communication
@Injectable({ providedIn: 'root' })
export class GridEventBus {
  private readonly _events$ = new Subject<GridEvent>();
  
  readonly events$ = this._events$.asObservable();
  
  emit<T>(event: GridEvent<T>): void {
    this._events$.next(event);
  }
  
  on<T>(eventType: string): Observable<GridEvent<T>> {
    return this.events$.pipe(
      filter(event => event.type === eventType)
    );
  }
}

// Event types for different modules
export interface GridEvent<T = any> {
  type: string;
  source: string;
  data: T;
  timestamp: number;
}

// Column events
export const COLUMN_EVENTS = {
  COLUMN_RESIZED: 'column.resized',
  COLUMN_MOVED: 'column.moved',
  COLUMN_VISIBILITY_CHANGED: 'column.visibility.changed'
} as const;

// Row events
export const ROW_EVENTS = {
  ROW_SELECTED: 'row.selected',
  ROW_DESELECTED: 'row.deselected',
  SELECTION_CHANGED: 'selection.changed'
} as const;

// Data events
export const DATA_EVENTS = {
  DATA_LOADED: 'data.loaded',
  DATA_SORTED: 'data.sorted',
  DATA_FILTERED: 'data.filtered'
} as const;
```

### Service Dependencies and Injection

```typescript
// Service provider hierarchy
export const GRID_PROVIDERS = [
  // Core services (singleton)
  GridStateService,
  GridEventBus,
  ConfigurationService,
  
  // Feature services (scoped to grid instance)
  {
    provide: DataProcessingService,
    useFactory: (state: GridStateService) => new DataProcessingService(state),
    deps: [GridStateService]
  },
  
  {
    provide: ColumnService,
    useFactory: (state: GridStateService, eventBus: GridEventBus) => 
      new ColumnService(state, eventBus),
    deps: [GridStateService, GridEventBus]
  }
];
```

### API Boundaries

```typescript
// Clear API boundaries between modules
export interface ModuleAPI {
  core: {
    services: [GridStateService, EventBusService, ConfigurationService];
    interfaces: [GridConfig, ColumnDefinition, DataSource];
    utilities: [ValidationUtils, TypeGuards];
  };
  
  data: {
    services: [DataProcessingService, DataSourceManager];
    interfaces: [SortDescriptor, FilterDescriptor];
    utilities: [SortUtils, FilterUtils];
  };
  
  column: {
    components: [BlgColumnHeaderComponent, BlgColumnResizerComponent];
    services: [ColumnService];
    interfaces: [ColumnEvent];
  };
  
  // ... other modules
}
```

## Module Lifecycle

### Initialization Order

```typescript
// Module initialization sequence
export class GridModuleInitializer {
  private readonly initializationOrder = [
    'core',      // 1. Initialize core services and state
    'theme',     // 2. Set up theming system
    'data',      // 3. Initialize data processing
    'column',    // 4. Set up column management
    'row',       // 5. Set up row management
    'cell',      // 6. Set up cell management
    'grid'       // 7. Initialize main grid orchestration
  ];
  
  async initializeModules(config: GridConfig): Promise<void> {
    for (const module of this.initializationOrder) {
      await this.initializeModule(module, config);
    }
  }
  
  private async initializeModule(name: string, config: GridConfig): Promise<void> {
    const initializer = this.getModuleInitializer(name);
    await initializer.initialize(config);
  }
}
```

### Module State Management

```typescript
// Module state coordination
export interface ModuleState {
  name: string;
  status: 'uninitialized' | 'initializing' | 'ready' | 'error';
  dependencies: string[];
  exports: string[];
}

@Injectable({ providedIn: 'root' })
export class ModuleRegistry {
  private readonly modules = new Map<string, ModuleState>();
  
  registerModule(module: ModuleState): void {
    this.modules.set(module.name, module);
  }
  
  getModuleDependencies(name: string): string[] {
    const module = this.modules.get(name);
    return module?.dependencies || [];
  }
  
  areModuleDependenciesReady(name: string): boolean {
    const dependencies = this.getModuleDependencies(name);
    return dependencies.every(dep => 
      this.modules.get(dep)?.status === 'ready'
    );
  }
}
```

## Public API Design

### API Surface Management

```typescript
// Public API surface for each module
export const PUBLIC_API_SURFACE = {
  core: {
    // Interfaces (stable)
    interfaces: [
      'GridConfig',
      'ColumnDefinition', 
      'DataSource',
      'SortDescriptor',
      'FilterDescriptor'
    ],
    
    // Services (stable)
    services: [
      'GridStateService'
    ],
    
    // Tokens (stable)
    tokens: [
      'GRID_CONFIG',
      'GRID_FEATURES'
    ],
    
    // Utilities (semi-stable)
    utilities: [
      'ValidationUtils',
      'TypeGuards'
    ]
  },
  
  grid: {
    // Components (stable)
    components: [
      'BlgGridComponent'
    ],
    
    // Modules (stable)
    modules: [
      'BlgGridModule'
    ]
  }
};

// API stability markers
export type APIStability = 'stable' | 'experimental' | 'internal';

export interface APIExport {
  name: string;
  stability: APIStability;
  since: string;
  deprecatedSince?: string;
  removedIn?: string;
}
```

### Breaking Change Detection

```typescript
// API breaking change detection
export interface APIChangeReport {
  module: string;
  version: string;
  changes: APIChange[];
}

export interface APIChange {
  type: 'added' | 'removed' | 'modified';
  severity: 'major' | 'minor' | 'patch';
  element: string;
  description: string;
  migration?: string;
}

// Automated API diff generation
export class APIAnalyzer {
  static compareVersions(
    oldVersion: string, 
    newVersion: string
  ): APIChangeReport {
    // Implementation would analyze TypeScript AST
    // to detect breaking changes
    return {
      module: 'grid',
      version: newVersion,
      changes: []
    };
  }
}
```

## Internal APIs

### Module-Internal Communication

```typescript
// Internal APIs not exposed to consumers
export namespace Internal {
  export interface GridInternals {
    stateManager: InternalStateManager;
    eventCoordinator: InternalEventCoordinator;
    performanceMonitor: InternalPerformanceMonitor;
  }
  
  export class InternalStateManager {
    // Internal state management not exposed publicly
    private readonly internalState = new Map<string, any>();
    
    setInternalState(key: string, value: any): void {
      this.internalState.set(key, value);
    }
    
    getInternalState<T>(key: string): T | undefined {
      return this.internalState.get(key);
    }
  }
}

// Mark as internal
/** @internal */
export const INTERNAL_GRID_STATE = new InjectionToken<Internal.GridInternals>('INTERNAL_GRID_STATE');
```

## Module Evolution Strategy

### Versioning Strategy

```typescript
// Module versioning and compatibility
export interface ModuleVersion {
  major: number;
  minor: number; 
  patch: number;
  prerelease?: string;
}

export interface CompatibilityMatrix {
  [moduleName: string]: {
    [version: string]: {
      compatibleWith: string[];
      breakingChanges: string[];
    };
  };
}

// Example compatibility matrix
export const MODULE_COMPATIBILITY: CompatibilityMatrix = {
  core: {
    '1.0.0': {
      compatibleWith: ['data@1.0.0', 'theme@1.0.0'],
      breakingChanges: []
    },
    '2.0.0': {
      compatibleWith: ['data@2.0.0', 'theme@1.1.0'],
      breakingChanges: ['GridConfig interface changed']
    }
  }
};
```

### Future Module Planning

```typescript
// Planned module additions/changes
export interface ModuleRoadmap {
  planned: PlannedModule[];
  deprecated: DeprecatedModule[];
  experimental: ExperimentalModule[];
}

export interface PlannedModule {
  name: string;
  version: string;
  description: string;
  dependencies: string[];
  timeline: string;
  status: 'planning' | 'development' | 'testing';
}

// Example roadmap
export const MODULE_ROADMAP: ModuleRoadmap = {
  planned: [
    {
      name: '@blg-grid/export',
      version: '1.3.0',
      description: 'Advanced export functionality',
      dependencies: ['core@1.2.0', 'data@1.2.0'],
      timeline: 'Q2 2024',
      status: 'planning'
    }
  ],
  deprecated: [],
  experimental: [
    {
      name: '@blg-grid/ai',
      version: '0.1.0-alpha',
      description: 'AI-powered grid features',
      dependencies: ['core@1.2.0'],
      timeline: 'Q4 2024',
      status: 'development'
    }
  ]
};
```

## Breaking Change Management

### Change Impact Analysis

```typescript
// Breaking change impact assessment
export interface BreakingChange {
  module: string;
  version: string;
  change: string;
  impact: 'low' | 'medium' | 'high';
  affectedModules: string[];
  migrationPath: string;
  automatedMigration?: boolean;
}

export class BreakingChangeManager {
  assessChange(change: BreakingChange): ChangeImpactReport {
    return {
      change,
      affectedComponents: this.findAffectedComponents(change),
      migrationComplexity: this.assessMigrationComplexity(change),
      timeline: this.estimateMigrationTime(change)
    };
  }
  
  private findAffectedComponents(change: BreakingChange): string[] {
    // Analyze dependency graph to find affected components
    return [];
  }
}
```

This module structure documentation provides maintainers with the deep understanding needed to manage the BLG Grid library's architecture, plan future changes, and maintain the integrity of the module system over time.