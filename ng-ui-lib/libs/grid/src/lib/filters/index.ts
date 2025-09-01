/**
 * Grid Filter Components
 * 
 * This module exports all the filter components available for the BLG Grid.
 * Each component provides specialized filtering functionality for different data types.
 */

import { TextFilterComponent } from './text-filter.component';
import { NumberFilterComponent, type NumberFilterValue } from './number-filter.component';
import { DateFilterComponent, type DateFilterValue } from './date-filter.component';
import { BooleanFilterComponent } from './boolean-filter.component';

export { TextFilterComponent } from './text-filter.component';
export { NumberFilterComponent } from './number-filter.component';
export { DateFilterComponent } from './date-filter.component';
export { BooleanFilterComponent } from './boolean-filter.component';

export type { NumberFilterValue } from './number-filter.component';
export type { DateFilterValue } from './date-filter.component';

/**
 * Filter component mapping for dynamic instantiation
 */
export const FILTER_COMPONENTS = {
  text: TextFilterComponent,
  string: TextFilterComponent,
  number: NumberFilterComponent,
  date: DateFilterComponent,
  boolean: BooleanFilterComponent
} as const;

/**
 * Type for supported filter types
 */
export type FilterType = keyof typeof FILTER_COMPONENTS;

/**
 * Union type for all possible filter values
 */
export type FilterValue = string | NumberFilterValue | DateFilterValue | boolean | null;