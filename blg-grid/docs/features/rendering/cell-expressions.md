# Cell Expressions

## Overview

Cell expressions in BLG Grid provide a powerful way to create computed values, conditional logic, and dynamic content within cells using JavaScript expressions and functions. This enables complex data transformations and calculations without modifying the source data.

## Use Cases

- Calculated fields and formulas
- Conditional display logic
- Data aggregation and summaries
- Cross-column computations
- Dynamic styling and formatting

## Basic Cell Expressions

### Simple Calculated Fields

```typescript
export class BasicExpressionsComponent {
  columnDefs = [
    { field: 'firstName', headerName: 'First Name' },
    { field: 'lastName', headerName: 'Last Name' },
    {
      headerName: 'Full Name',
      valueGetter: 'data.firstName + " " + data.lastName',
      minWidth: 200
    },
    { field: 'price', headerName: 'Price', type: 'numericColumn' },
    { field: 'quantity', headerName: 'Quantity', type: 'numericColumn' },
    {
      headerName: 'Total',
      valueGetter: 'data.price * data.quantity',
      valueFormatter: this.currencyFormatter,
      type: 'numericColumn'
    },
    {
      headerName: 'Discount %',
      valueGetter: this.calculateDiscount,
      valueFormatter: (params) => `${params.value.toFixed(1)}%`
    }
  ];

  private currencyFormatter = (params: any): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(params.value || 0);
  };

  private calculateDiscount = (params: any): number => {
    const { price, quantity } = params.data;
    const total = price * quantity;
    
    if (total > 1000) return 15;
    if (total > 500) return 10;
    if (total > 100) return 5;
    return 0;
  };
}
```

### Conditional Expressions

```typescript
export class ConditionalExpressionsComponent {
  columnDefs = [
    { field: 'score', headerName: 'Score', type: 'numericColumn' },
    {
      headerName: 'Grade',
      valueGetter: this.calculateGrade,
      cellStyle: this.getGradeStyle
    },
    { field: 'age', headerName: 'Age', type: 'numericColumn' },
    {
      headerName: 'Category',
      valueGetter: `
        data.age < 18 ? 'Minor' :
        data.age < 65 ? 'Adult' :
        'Senior'
      `
    },
    { field: 'status', headerName: 'Status' },
    { field: 'lastLogin', headerName: 'Last Login' },
    {
      headerName: 'Account Status',
      valueGetter: this.getAccountStatus,
      cellClass: this.getAccountStatusClass
    }
  ];

  private calculateGrade = (params: any): string => {
    const score = params.data.score;
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  private getGradeStyle = (params: any): any => {
    const grade = params.value;
    const styles = {
      'A': { backgroundColor: '#d4edda', color: '#155724' },
      'B': { backgroundColor: '#cce7ff', color: '#004085' },
      'C': { backgroundColor: '#fff3cd', color: '#856404' },
      'D': { backgroundColor: '#ffeaa7', color: '#6c5ce7' },
      'F': { backgroundColor: '#f8d7da', color: '#721c24' }
    };
    return styles[grade] || {};
  };

  private getAccountStatus = (params: any): string => {
    const { status, lastLogin } = params.data;
    
    if (status === 'suspended') return 'Suspended';
    if (status === 'inactive') return 'Inactive';
    
    if (lastLogin) {
      const daysSinceLogin = Math.floor(
        (Date.now() - new Date(lastLogin).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      if (daysSinceLogin > 90) return 'Dormant';
      if (daysSinceLogin > 30) return 'Inactive';
    }
    
    return 'Active';
  };

  private getAccountStatusClass = (params: any): string => {
    return `account-status-${params.value.toLowerCase()}`;
  };
}
```

## Advanced Expressions

### Complex Calculations

```typescript
export class ComplexExpressionsComponent {
  columnDefs = [
    { field: 'sales', headerName: 'Sales', type: 'numericColumn' },
    { field: 'target', headerName: 'Target', type: 'numericColumn' },
    { field: 'expenses', headerName: 'Expenses', type: 'numericColumn' },
    {
      headerName: 'Performance %',
      valueGetter: this.calculatePerformance,
      valueFormatter: (params) => `${params.value.toFixed(1)}%`,
      cellStyle: this.getPerformanceStyle
    },
    {
      headerName: 'Profit Margin',
      valueGetter: this.calculateProfitMargin,
      valueFormatter: (params) => `${params.value.toFixed(2)}%`
    },
    {
      headerName: 'Status Summary',
      valueGetter: this.getStatusSummary,
      width: 300
    },
    {
      headerName: 'Trend Indicator',
      valueGetter: this.getTrendIndicator,
      cellRenderer: this.trendRenderer
    }
  ];

  private calculatePerformance = (params: any): number => {
    const { sales, target } = params.data;
    if (!target || target === 0) return 0;
    return (sales / target) * 100;
  };

  private calculateProfitMargin = (params: any): number => {
    const { sales, expenses } = params.data;
    if (!sales || sales === 0) return 0;
    return ((sales - expenses) / sales) * 100;
  };

  private getPerformanceStyle = (params: any): any => {
    const performance = params.value;
    if (performance >= 100) return { backgroundColor: '#d4edda', color: '#155724' };
    if (performance >= 80) return { backgroundColor: '#cce7ff', color: '#004085' };
    if (performance >= 60) return { backgroundColor: '#fff3cd', color: '#856404' };
    return { backgroundColor: '#f8d7da', color: '#721c24' };
  };

  private getStatusSummary = (params: any): string => {
    const { sales, target, expenses } = params.data;
    const performance = target ? (sales / target) * 100 : 0;
    const profit = sales - expenses;
    const profitMargin = sales ? (profit / sales) * 100 : 0;
    
    const performanceText = performance >= 100 ? '✅ Target Met' : 
                           performance >= 80 ? '⚠️ Close to Target' : '❌ Below Target';
    
    const profitText = profit > 0 ? `💰 Profit: $${profit.toLocaleString()}` :
                      `💸 Loss: $${Math.abs(profit).toLocaleString()}`;
    
    return `${performanceText} | ${profitText} (${profitMargin.toFixed(1)}% margin)`;
  };

  private getTrendIndicator = (params: any): string => {
    // Simulate historical data for trend calculation
    const currentValue = params.data.sales || 0;
    const previousValue = params.data.previousSales || 0;
    
    if (currentValue > previousValue * 1.1) return 'up-strong';
    if (currentValue > previousValue) return 'up';
    if (currentValue < previousValue * 0.9) return 'down-strong';
    if (currentValue < previousValue) return 'down';
    return 'stable';
  };

  private trendRenderer = (params: any): string => {
    const trend = params.value;
    const icons = {
      'up-strong': '📈',
      'up': '📊',
      'stable': '➡️',
      'down': '📉',
      'down-strong': '⬇️'
    };
    
    const colors = {
      'up-strong': '#28a745',
      'up': '#6f9c3d',
      'stable': '#6c757d',
      'down': '#fd7e14',
      'down-strong': '#dc3545'
    };
    
    return `<span style="color: ${colors[trend]}">${icons[trend]} ${trend.replace('-', ' ')}</span>`;
  };
}
```

### Date and Time Expressions

```typescript
export class DateTimeExpressionsComponent {
  columnDefs = [
    { field: 'startDate', headerName: 'Start Date' },
    { field: 'endDate', headerName: 'End Date' },
    {
      headerName: 'Duration',
      valueGetter: this.calculateDuration,
      width: 120
    },
    {
      headerName: 'Days Remaining',
      valueGetter: this.calculateDaysRemaining,
      cellStyle: this.getDaysRemainingStyle
    },
    { field: 'createdDate', headerName: 'Created' },
    {
      headerName: 'Age',
      valueGetter: this.calculateAge,
      width: 100
    },
    {
      headerName: 'Working Days',
      valueGetter: this.calculateWorkingDays,
      width: 120
    }
  ];

  private calculateDuration = (params: any): string => {
    const { startDate, endDate } = params.data;
    if (!startDate || !endDate) return '';
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 30) return `${diffDays} days`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} months`;
    return `${Math.floor(diffDays / 365)} years`;
  };

  private calculateDaysRemaining = (params: any): number => {
    const endDate = params.data.endDate;
    if (!endDate) return 0;
    
    const end = new Date(endDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  private getDaysRemainingStyle = (params: any): any => {
    const days = params.value;
    if (days < 0) return { backgroundColor: '#f8d7da', color: '#721c24' };
    if (days < 7) return { backgroundColor: '#fff3cd', color: '#856404' };
    if (days < 30) return { backgroundColor: '#cce7ff', color: '#004085' };
    return { backgroundColor: '#d4edda', color: '#155724' };
  };

  private calculateAge = (params: any): string => {
    const createdDate = params.data.createdDate;
    if (!createdDate) return '';
    
    const created = new Date(createdDate);
    const now = new Date();
    const diffTime = now.getTime() - created.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 1) return 'Today';
    if (diffDays < 7) return `${diffDays}d`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}w`;
    if (diffDays < 365) return `${Math.floor(diffDays / 30)}m`;
    return `${Math.floor(diffDays / 365)}y`;
  };

  private calculateWorkingDays = (params: any): number => {
    const { startDate, endDate } = params.data;
    if (!startDate || !endDate) return 0;
    
    const start = new Date(startDate);
    const end = new Date(endDate);
    let workingDays = 0;
    
    const currentDate = new Date(start);
    while (currentDate <= end) {
      const dayOfWeek = currentDate.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) { // Not Sunday or Saturday
        workingDays++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return workingDays;
  };
}
```

### Array and Object Expressions

```typescript
export class ArrayObjectExpressionsComponent {
  columnDefs = [
    { field: 'name', headerName: 'Name' },
    { field: 'tags', headerName: 'Tags' },
    {
      headerName: 'Tag Count',
      valueGetter: 'data.tags ? data.tags.length : 0',
      width: 100
    },
    {
      headerName: 'Primary Tags',
      valueGetter: this.getPrimaryTags,
      width: 200
    },
    { field: 'metadata', headerName: 'Metadata' },
    {
      headerName: 'Properties',
      valueGetter: this.getMetadataProperties,
      width: 250
    },
    { field: 'scores', headerName: 'Scores' },
    {
      headerName: 'Average Score',
      valueGetter: this.calculateAverageScore,
      valueFormatter: (params) => params.value.toFixed(2)
    },
    {
      headerName: 'Score Range',
      valueGetter: this.getScoreRange,
      width: 150
    }
  ];

  private getPrimaryTags = (params: any): string => {
    const tags = params.data.tags;
    if (!Array.isArray(tags) || tags.length === 0) return '';
    
    // Get first 3 tags
    const primaryTags = tags.slice(0, 3);
    let result = primaryTags.join(', ');
    
    if (tags.length > 3) {
      result += ` (+${tags.length - 3} more)`;
    }
    
    return result;
  };

  private getMetadataProperties = (params: any): string => {
    const metadata = params.data.metadata;
    if (!metadata || typeof metadata !== 'object') return '';
    
    const properties = Object.entries(metadata)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
    
    return properties;
  };

  private calculateAverageScore = (params: any): number => {
    const scores = params.data.scores;
    if (!Array.isArray(scores) || scores.length === 0) return 0;
    
    const sum = scores.reduce((acc, score) => acc + (Number(score) || 0), 0);
    return sum / scores.length;
  };

  private getScoreRange = (params: any): string => {
    const scores = params.data.scores;
    if (!Array.isArray(scores) || scores.length === 0) return 'N/A';
    
    const numericScores = scores.map(s => Number(s) || 0);
    const min = Math.min(...numericScores);
    const max = Math.max(...numericScores);
    
    return `${min} - ${max}`;
  };
}
```

## Dynamic Expressions

### User-Defined Expressions

```typescript
export class DynamicExpressionsComponent {
  private customExpressions = new Map<string, Function>();
  
  columnDefs = [
    { field: 'value1', headerName: 'Value 1', type: 'numericColumn' },
    { field: 'value2', headerName: 'Value 2', type: 'numericColumn' },
    {
      headerName: 'Custom Formula',
      valueGetter: this.evaluateCustomExpression.bind(this),
      editable: false
    }
  ];

  // Allow users to define custom expressions
  setCustomExpression(columnId: string, expression: string): void {
    try {
      // Create function from expression string
      const func = new Function('data', 'params', `
        try {
          return ${expression};
        } catch (e) {
          return 'Error: ' + e.message;
        }
      `);
      
      this.customExpressions.set(columnId, func);
      this.refreshColumn(columnId);
    } catch (error) {
      console.error('Invalid expression:', error);
    }
  }

  private evaluateCustomExpression = (params: any): any => {
    const columnId = params.column.getColId();
    const expression = this.customExpressions.get(columnId);
    
    if (!expression) {
      return this.getDefaultExpression(params);
    }
    
    try {
      return expression(params.data, params);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  };

  private getDefaultExpression(params: any): number {
    return (params.data.value1 || 0) + (params.data.value2 || 0);
  }

  // Predefined expression library
  private expressionLibrary = {
    sum: (data: any) => (data.value1 || 0) + (data.value2 || 0),
    difference: (data: any) => (data.value1 || 0) - (data.value2 || 0),
    product: (data: any) => (data.value1 || 0) * (data.value2 || 0),
    ratio: (data: any) => (data.value2 || 0) !== 0 ? (data.value1 || 0) / data.value2 : 0,
    average: (data: any) => ((data.value1 || 0) + (data.value2 || 0)) / 2,
    max: (data: any) => Math.max(data.value1 || 0, data.value2 || 0),
    min: (data: any) => Math.min(data.value1 || 0, data.value2 || 0)
  };

  applyPredefinedExpression(columnId: string, expressionName: string): void {
    const expression = this.expressionLibrary[expressionName];
    if (expression) {
      this.customExpressions.set(columnId, expression);
      this.refreshColumn(columnId);
    }
  }

  private refreshColumn(columnId: string): void {
    this.gridApi.refreshCells({ columns: [columnId] });
  }
}
```

### Expression Builder Service

```typescript
@Injectable()
export class ExpressionBuilderService {
  // Built-in functions available in expressions
  private builtInFunctions = {
    // Math functions
    abs: Math.abs,
    ceil: Math.ceil,
    floor: Math.floor,
    round: Math.round,
    max: Math.max,
    min: Math.min,
    pow: Math.pow,
    sqrt: Math.sqrt,
    
    // String functions
    upper: (str: string) => str?.toUpperCase() || '',
    lower: (str: string) => str?.toLowerCase() || '',
    trim: (str: string) => str?.trim() || '',
    length: (str: string) => str?.length || 0,
    
    // Date functions
    now: () => new Date(),
    dateAdd: (date: Date, days: number) => {
      const result = new Date(date);
      result.setDate(result.getDate() + days);
      return result;
    },
    dateDiff: (date1: Date, date2: Date) => {
      return Math.floor((date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24));
    },
    
    // Conditional functions
    if: (condition: any, trueValue: any, falseValue: any) => condition ? trueValue : falseValue,
    isNull: (value: any) => value == null,
    isEmpty: (value: any) => !value || (typeof value === 'string' && value.trim() === ''),
    
    // Array functions
    count: (arr: any[]) => Array.isArray(arr) ? arr.length : 0,
    sum: (arr: number[]) => Array.isArray(arr) ? arr.reduce((sum, val) => sum + (val || 0), 0) : 0,
    avg: (arr: number[]) => {
      if (!Array.isArray(arr) || arr.length === 0) return 0;
      const sum = arr.reduce((sum, val) => sum + (val || 0), 0);
      return sum / arr.length;
    }
  };

  createValueGetter(expression: string): Function {
    return (params: any) => {
      try {
        return this.evaluateExpression(expression, params);
      } catch (error) {
        console.error('Expression error:', error);
        return `Error: ${error.message}`;
      }
    };
  }

  private evaluateExpression(expression: string, params: any): any {
    // Create a safe evaluation context
    const context = {
      data: params.data,
      node: params.node,
      value: params.value,
      ...this.builtInFunctions
    };

    // Use Function constructor for safer evaluation
    const func = new Function(...Object.keys(context), `return ${expression}`);
    return func(...Object.values(context));
  }

  validateExpression(expression: string): { valid: boolean; error?: string } {
    try {
      // Test with sample data
      const testData = { value1: 10, value2: 20, name: 'test' };
      const testParams = { data: testData, node: {}, value: null };
      
      this.evaluateExpression(expression, testParams);
      return { valid: true };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  }

  getAvailableFunctions(): string[] {
    return Object.keys(this.builtInFunctions);
  }

  getFunctionDocumentation(functionName: string): string {
    const docs = {
      abs: 'abs(number) - Returns absolute value',
      ceil: 'ceil(number) - Rounds up to nearest integer',
      floor: 'floor(number) - Rounds down to nearest integer',
      round: 'round(number) - Rounds to nearest integer',
      max: 'max(a, b, ...) - Returns maximum value',
      min: 'min(a, b, ...) - Returns minimum value',
      upper: 'upper(string) - Converts to uppercase',
      lower: 'lower(string) - Converts to lowercase',
      trim: 'trim(string) - Removes whitespace',
      length: 'length(string) - Returns string length',
      if: 'if(condition, trueValue, falseValue) - Conditional expression',
      count: 'count(array) - Returns array length',
      sum: 'sum(array) - Returns sum of array values',
      avg: 'avg(array) - Returns average of array values'
    };
    
    return docs[functionName] || 'No documentation available';
  }
}
```

## API Reference

### ValueGetter Interface

```typescript
interface ValueGetterParams {
  data: any;           // The row data object
  node: RowNode;       // The row node
  column: Column;      // The column
  colDef: ColDef;     // The column definition
  context: any;        // Grid context
  api: GridApi;        // Grid API
  getValue: (field: string) => any; // Function to get other field values
}

type ValueGetter = (params: ValueGetterParams) => any;
```

### Column Definition Options

| Option | Type | Description |
|--------|------|-------------|
| `valueGetter` | function \| string | Expression for computed values |
| `valueSetter` | function | Function to set computed values |
| `equals` | function | Custom equality function for change detection |

## Best Practices

1. **Keep expressions simple** and readable
2. **Handle null/undefined values** gracefully
3. **Use meaningful variable names** in expressions
4. **Test expressions** with edge cases
5. **Document complex expressions** for maintainability
6. **Consider performance** for frequently evaluated expressions
7. **Validate user inputs** for dynamic expressions
8. **Use TypeScript** for better type safety in functions