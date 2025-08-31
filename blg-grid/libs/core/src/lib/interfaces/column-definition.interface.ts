export interface ColumnDefinition {
  /**
   * Unique identifier for the column
   */
  id: string;
  
  /**
   * Field name in the data object
   */
  field: string;
  
  /**
   * Display header text
   */
  header: string;
  
  /**
   * Column width in pixels
   */
  width?: number;
  
  /**
   * Minimum column width
   */
  minWidth?: number;
  
  /**
   * Maximum column width
   */
  maxWidth?: number;
  
  /**
   * Whether the column is sortable
   */
  sortable?: boolean;
  
  /**
   * Whether the column is filterable
   */
  filterable?: boolean;
  
  /**
   * Whether the column is resizable
   */
  resizable?: boolean;
  
  /**
   * Whether the column is visible
   */
  visible?: boolean;
  
  /**
   * Column data type
   */
  type?: 'string' | 'number' | 'date' | 'boolean' | 'custom';
  
  /**
   * Custom cell renderer template
   */
  cellRenderer?: string;
  
  /**
   * Custom cell editor template or boolean to enable/disable editing
   */
  cellEditor?: string | boolean;
  
  /**
   * Column alignment
   */
  align?: 'left' | 'center' | 'right';
  
  /**
   * Column pin position
   */
  pinned?: 'left' | 'right';
}