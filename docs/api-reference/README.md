# API Reference

Complete reference for all BlgGrid components, interfaces, and services.

## Core Components

- [Grid Component](./grid-component.md) - Main grid component
- [GridStateService](./grid-state-service.md) - State management service

## Interfaces

- [GridConfig](./interfaces/grid-config.md) - Grid configuration options
- [ColumnDefinition](./interfaces/column-definition.md) - Column configuration
- [GridEvent Types](./interfaces/grid-events.md) - Event interfaces

## Services

- [GridStateService](./services/grid-state-service.md) - Grid state management
- [ThemeService](./services/theme-service.md) - Theme management

## Types

- [Data Types](./types/data-types.md) - Supported column data types
- [Event Types](./types/event-types.md) - Grid event type definitions

## Quick Reference

### Basic Usage

```typescript
import { Grid } from '@blg-grid/grid';
import { ColumnDefinition, GridConfig } from '@blg-grid/core';

@Component({
  template: `
    <blg-grid 
      [data]="data" 
      [columns]="columns" 
      [config]="config">
    </blg-grid>
  `
})
```

### Essential Interfaces

```typescript
interface GridConfig {
  rowHeight?: number;
  virtualScrolling?: boolean;
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  selectionMode?: 'single' | 'multiple';
  resizable?: boolean;
  reorderable?: boolean;
  theme?: string;
  showFooter?: boolean;
}

interface ColumnDefinition {
  id: string;
  field: string;
  header: string;
  width?: number;
  type?: 'string' | 'number' | 'date' | 'boolean';
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  visible?: boolean;
  align?: 'left' | 'center' | 'right';
  pinned?: 'left' | 'right';
}
```

### Key Events

```typescript
// Grid events
(gridEvent)="handleGridEvent($event)"
(cellClick)="handleCellClick($event)"
(rowSelect)="handleRowSelect($event)"
(columnSort)="handleColumnSort($event)"
(columnResize)="handleColumnResize($event)"
```