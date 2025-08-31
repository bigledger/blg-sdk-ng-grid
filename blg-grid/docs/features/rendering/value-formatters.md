# Value Formatters

## Overview

Value formatters in BLG Grid transform raw data values into formatted display text without changing the underlying data. They provide consistent data presentation across the application while maintaining data integrity for sorting and filtering.

## Use Cases

- Currency and number formatting
- Date and time display formatting
- Custom text transformations
- Conditional formatting based on values
- Internationalization and localization

## Basic Value Formatters

### Currency Formatting

```typescript
export class CurrencyFormatterComponent {
  columnDefs = [
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: this.currencyFormatter,
      cellStyle: this.getCurrencyStyle
    },
    {
      field: 'revenue',
      headerName: 'Revenue',
      valueFormatter: (params) => this.formatCurrency(params.value, 'USD'),
      type: 'numericColumn'
    },
    {
      field: 'cost',
      headerName: 'Cost',
      valueFormatter: (params) => this.formatCurrency(params.value, 'EUR'),
      type: 'numericColumn'
    }
  ];

  private currencyFormatter = (params: any): string => {
    const value = params.value;
    if (value == null || isNaN(value)) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value);
  };

  private formatCurrency(value: number, currency: string): string {
    if (value == null || isNaN(value)) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  }

  private getCurrencyStyle = (params: any): any => {
    const value = params.value;
    if (value < 0) {
      return { color: '#dc3545', fontWeight: 'bold' };
    } else if (value > 1000) {
      return { color: '#28a745', fontWeight: 'bold' };
    }
    return {};
  };
}
```

### Date and Time Formatting

```typescript
export class DateTimeFormatterComponent {
  columnDefs = [
    {
      field: 'createdDate',
      headerName: 'Created',
      valueFormatter: this.dateFormatter,
      width: 120
    },
    {
      field: 'lastModified',
      headerName: 'Last Modified',
      valueFormatter: this.dateTimeFormatter,
      width: 180
    },
    {
      field: 'expireDate',
      headerName: 'Expires',
      valueFormatter: this.relativeDateFormatter,
      width: 140
    },
    {
      field: 'timestamp',
      headerName: 'Timestamp',
      valueFormatter: this.customDateFormatter,
      width: 160
    }
  ];

  private dateFormatter = (params: any): string => {
    const value = params.value;
    if (!value) return '';
    
    const date = new Date(value);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  private dateTimeFormatter = (params: any): string => {
    const value = params.value;
    if (!value) return '';
    
    const date = new Date(value);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  private relativeDateFormatter = (params: any): string => {
    const value = params.value;
    if (!value) return '';
    
    const date = new Date(value);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `Expired ${Math.abs(diffDays)} days ago`;
    } else if (diffDays === 0) {
      return 'Expires today';
    } else if (diffDays === 1) {
      return 'Expires tomorrow';
    } else if (diffDays < 30) {
      return `Expires in ${diffDays} days`;
    } else {
      return date.toLocaleDateString();
    }
  };

  private customDateFormatter = (params: any): string => {
    const value = params.value;
    if (!value) return '';
    
    const date = new Date(value);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) {
      return 'Just now';
    } else if (diffMinutes < 60) {
      return `${diffMinutes} minutes ago`;
    } else if (diffMinutes < 1440) {
      const hours = Math.floor(diffMinutes / 60);
      return `${hours} ${hours === 1 ? 'hour' : 'hours'} ago`;
    } else {
      return date.toLocaleDateString();
    }
  };
}
```

### Number and Percentage Formatting

```typescript
export class NumberFormatterComponent {
  columnDefs = [
    {
      field: 'quantity',
      headerName: 'Quantity',
      valueFormatter: this.integerFormatter,
      type: 'numericColumn'
    },
    {
      field: 'percentage',
      headerName: 'Percentage',
      valueFormatter: this.percentageFormatter,
      type: 'numericColumn'
    },
    {
      field: 'rating',
      headerName: 'Rating',
      valueFormatter: this.ratingFormatter,
      type: 'numericColumn'
    },
    {
      field: 'fileSize',
      headerName: 'File Size',
      valueFormatter: this.fileSizeFormatter
    }
  ];

  private integerFormatter = (params: any): string => {
    const value = params.value;
    if (value == null || isNaN(value)) return '';
    
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0
    }).format(value);
  };

  private percentageFormatter = (params: any): string => {
    const value = params.value;
    if (value == null || isNaN(value)) return '';
    
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(value / 100);
  };

  private ratingFormatter = (params: any): string => {
    const value = params.value;
    if (value == null || isNaN(value)) return '';
    
    const stars = '★'.repeat(Math.floor(value)) + '☆'.repeat(5 - Math.floor(value));
    return `${stars} (${value.toFixed(1)})`;
  };

  private fileSizeFormatter = (params: any): string => {
    const bytes = params.value;
    if (bytes == null || isNaN(bytes)) return '';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    
    return `${size} ${sizes[i]}`;
  };
}
```

## Advanced Value Formatters

### Conditional and Complex Formatting

```typescript
export class ConditionalFormatterComponent {
  columnDefs = [
    {
      field: 'status',
      headerName: 'Status',
      valueFormatter: this.statusFormatter,
      cellStyle: this.getStatusStyle
    },
    {
      field: 'priority',
      headerName: 'Priority',
      valueFormatter: this.priorityFormatter,
      cellClass: this.getPriorityClass
    },
    {
      field: 'tags',
      headerName: 'Tags',
      valueFormatter: this.tagsFormatter
    },
    {
      field: 'score',
      headerName: 'Score',
      valueFormatter: this.scoreFormatter,
      cellStyle: this.getScoreStyle
    }
  ];

  private statusFormatter = (params: any): string => {
    const value = params.value;
    if (!value) return '';
    
    const statusMap = {
      'active': '🟢 Active',
      'inactive': '🔴 Inactive', 
      'pending': '🟡 Pending',
      'suspended': '⚫ Suspended',
      'archived': '📁 Archived'
    };
    
    return statusMap[value.toLowerCase()] || value;
  };

  private priorityFormatter = (params: any): string => {
    const value = params.value;
    if (!value) return '';
    
    const priorityMap = {
      'low': '🔽 Low',
      'medium': '🔶 Medium',
      'high': '🔺 High',
      'critical': '🚨 Critical'
    };
    
    return priorityMap[value.toLowerCase()] || value;
  };

  private tagsFormatter = (params: any): string => {
    const tags = params.value;
    if (!Array.isArray(tags) || tags.length === 0) return '';
    
    if (tags.length <= 3) {
      return tags.join(', ');
    } else {
      return `${tags.slice(0, 2).join(', ')} +${tags.length - 2} more`;
    }
  };

  private scoreFormatter = (params: any): string => {
    const value = params.value;
    if (value == null || isNaN(value)) return '';
    
    let grade = '';
    if (value >= 90) grade = 'A';
    else if (value >= 80) grade = 'B';
    else if (value >= 70) grade = 'C';
    else if (value >= 60) grade = 'D';
    else grade = 'F';
    
    return `${value.toFixed(1)}% (${grade})`;
  };

  private getStatusStyle = (params: any): any => {
    const value = params.value?.toLowerCase();
    const styles = {
      'active': { backgroundColor: '#d4edda', color: '#155724' },
      'inactive': { backgroundColor: '#f8d7da', color: '#721c24' },
      'pending': { backgroundColor: '#fff3cd', color: '#856404' },
      'suspended': { backgroundColor: '#d1ecf1', color: '#0c5460' }
    };
    return styles[value] || {};
  };

  private getPriorityClass = (params: any): string => {
    const value = params.value?.toLowerCase();
    return `priority-${value}`;
  };

  private getScoreStyle = (params: any): any => {
    const value = params.value;
    if (value == null || isNaN(value)) return {};
    
    if (value >= 90) return { backgroundColor: '#d4edda', color: '#155724' };
    if (value >= 80) return { backgroundColor: '#cce7ff', color: '#004085' };
    if (value >= 70) return { backgroundColor: '#fff3cd', color: '#856404' };
    if (value >= 60) return { backgroundColor: '#ffeaa7', color: '#6c5ce7' };
    return { backgroundColor: '#f8d7da', color: '#721c24' };
  };
}
```

### Internationalization Formatters

```typescript
@Injectable()
export class LocalizationService {
  private currentLocale = 'en-US';
  private currency = 'USD';
  private timezone = 'America/New_York';

  setLocale(locale: string, currency?: string, timezone?: string): void {
    this.currentLocale = locale;
    if (currency) this.currency = currency;
    if (timezone) this.timezone = timezone;
  }

  formatCurrency(value: number): string {
    if (value == null || isNaN(value)) return '';
    
    return new Intl.NumberFormat(this.currentLocale, {
      style: 'currency',
      currency: this.currency
    }).format(value);
  }

  formatDate(value: Date | string): string {
    if (!value) return '';
    
    const date = new Date(value);
    return new Intl.DateTimeFormat(this.currentLocale, {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: this.timezone
    }).format(date);
  }

  formatNumber(value: number, options?: Intl.NumberFormatOptions): string {
    if (value == null || isNaN(value)) return '';
    
    return new Intl.NumberFormat(this.currentLocale, options).format(value);
  }
}

export class InternationalFormatterComponent {
  constructor(private localizationService: LocalizationService) {}

  columnDefs = [
    {
      field: 'price',
      headerName: 'Price',
      valueFormatter: (params) => this.localizationService.formatCurrency(params.value)
    },
    {
      field: 'date',
      headerName: 'Date',
      valueFormatter: (params) => this.localizationService.formatDate(params.value)
    },
    {
      field: 'quantity',
      headerName: 'Quantity',
      valueFormatter: (params) => this.localizationService.formatNumber(params.value, {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      })
    }
  ];
}
```

### Dynamic Formatters

```typescript
export class DynamicFormatterComponent {
  private formatterCache = new Map<string, Function>();

  columnDefs = [
    {
      field: 'value',
      headerName: 'Dynamic Value',
      valueFormatter: this.getDynamicFormatter.bind(this)
    }
  ];

  private getDynamicFormatter = (params: any): string => {
    const dataType = params.data?.valueType || 'text';
    const cacheKey = `formatter-${dataType}`;
    
    if (!this.formatterCache.has(cacheKey)) {
      const formatter = this.createFormatter(dataType);
      this.formatterCache.set(cacheKey, formatter);
    }
    
    const formatter = this.formatterCache.get(cacheKey);
    return formatter ? formatter(params.value) : params.value;
  };

  private createFormatter(type: string): Function {
    switch (type) {
      case 'currency':
        return (value: number) => new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(value || 0);
        
      case 'percentage':
        return (value: number) => `${((value || 0) * 100).toFixed(1)}%`;
        
      case 'date':
        return (value: string) => value ? new Date(value).toLocaleDateString() : '';
        
      case 'boolean':
        return (value: boolean) => value ? '✅ Yes' : '❌ No';
        
      case 'array':
        return (value: any[]) => Array.isArray(value) ? value.join(', ') : '';
        
      default:
        return (value: any) => value?.toString() || '';
    }
  }

  // Method to update formatter for specific rows
  updateFormatterType(rowData: any, newType: string): void {
    rowData.valueType = newType;
    
    // Refresh affected cells
    const rowNode = this.gridApi.getRowNode(rowData.id);
    if (rowNode) {
      this.gridApi.refreshCells({ rowNodes: [rowNode], columns: ['value'] });
    }
  }
}
```

## Formatter Utilities

### Reusable Formatter Service

```typescript
@Injectable({
  providedIn: 'root'
})
export class ValueFormatterService {
  // Currency formatters
  currency(value: number, currency = 'USD', locale = 'en-US'): string {
    if (value == null || isNaN(value)) return '';
    return new Intl.NumberFormat(locale, { style: 'currency', currency }).format(value);
  }

  // Number formatters
  integer(value: number, locale = 'en-US'): string {
    if (value == null || isNaN(value)) return '';
    return new Intl.NumberFormat(locale, { maximumFractionDigits: 0 }).format(value);
  }

  decimal(value: number, decimals = 2, locale = 'en-US'): string {
    if (value == null || isNaN(value)) return '';
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value);
  }

  percentage(value: number, decimals = 1): string {
    if (value == null || isNaN(value)) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'percent',
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(value / 100);
  }

  // Date formatters
  date(value: Date | string, options?: Intl.DateTimeFormatOptions): string {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleDateString('en-US', options);
  }

  dateTime(value: Date | string, options?: Intl.DateTimeFormatOptions): string {
    if (!value) return '';
    const date = new Date(value);
    return date.toLocaleString('en-US', options);
  }

  relativeDate(value: Date | string): string {
    if (!value) return '';
    const date = new Date(value);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
    return `${Math.floor(diffDays / 365)} years ago`;
  }

  // Text formatters
  truncate(value: string, maxLength = 50): string {
    if (!value) return '';
    return value.length > maxLength ? value.substring(0, maxLength) + '...' : value;
  }

  capitalize(value: string): string {
    if (!value) return '';
    return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
  }

  titleCase(value: string): string {
    if (!value) return '';
    return value.replace(/\w\S*/g, (txt) => 
      txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    );
  }

  // Array formatters
  arrayToString(value: any[], separator = ', ', maxItems?: number): string {
    if (!Array.isArray(value) || value.length === 0) return '';
    
    const items = maxItems ? value.slice(0, maxItems) : value;
    let result = items.join(separator);
    
    if (maxItems && value.length > maxItems) {
      result += ` +${value.length - maxItems} more`;
    }
    
    return result;
  }

  // File size formatter
  fileSize(bytes: number): string {
    if (bytes == null || isNaN(bytes)) return '';
    
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 B';
    
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    
    return `${size} ${sizes[i]}`;
  }

  // Status formatter with emojis
  status(value: string): string {
    if (!value) return '';
    
    const statusMap = {
      'active': '🟢 Active',
      'inactive': '🔴 Inactive',
      'pending': '🟡 Pending',
      'completed': '✅ Completed',
      'cancelled': '❌ Cancelled',
      'draft': '📝 Draft'
    };
    
    return statusMap[value.toLowerCase()] || value;
  }
}
```

## API Reference

### ValueFormatter Interface

```typescript
interface ValueFormatterParams {
  value: any;           // The value to be formatted
  data: any;           // The full row data object
  node: RowNode;       // The row node
  column: Column;      // The column being formatted
  colDef: ColDef;     // The column definition
  context: any;        // Grid context
  api: GridApi;        // Grid API
}

type ValueFormatter = (params: ValueFormatterParams) => string;
```

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `valueFormatter` | function \| string | Value formatting function |
| `cellStyle` | object \| function | Cell styling based on formatted value |
| `cellClass` | string \| function | CSS class based on formatted value |

## Best Practices

1. **Keep formatters pure** - don't modify the original data
2. **Handle null/undefined values** gracefully
3. **Use consistent formatting** across similar columns
4. **Cache expensive formatters** for better performance
5. **Consider internationalization** from the start
6. **Test with edge cases** like very large/small numbers
7. **Use TypeScript** for better type safety
8. **Document custom formatters** for team consistency