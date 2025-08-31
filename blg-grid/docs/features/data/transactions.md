# Transactions

## Overview

Transactions in BLG Grid provide atomic data operations, allowing you to group multiple changes together and apply them as a single unit. This ensures data consistency and enables efficient bulk operations with rollback capabilities.

## Use Cases

- Bulk data import/export operations
- Multi-step data modifications
- Undo/redo functionality
- Data synchronization with rollback
- Batch processing with error recovery

## Basic Transaction Operations

### Simple Transactions

```typescript
// Single transaction with multiple operations
const transaction = {
  add: [newRow1, newRow2],
  update: [updatedRow1, updatedRow2],
  remove: [rowToDelete1, rowToDelete2]
};

gridApi.applyTransaction(transaction);
```

### Transaction Results

```typescript
const result = gridApi.applyTransaction(transaction);
console.log('Transaction result:', {
  addResults: result.add,
  updateResults: result.update,
  removeResults: result.remove
});
```

## Advanced Transaction Features

### Transaction Batching

```typescript
export class TransactionBatchingService {
  startBatchTransaction(): void {
    this.gridApi.startBatchTransaction();
  }

  endBatchTransaction(): void {
    this.gridApi.endBatchTransaction();
  }

  performBatchOperations(): void {
    this.startBatchTransaction();
    
    try {
      // Multiple operations batched together
      this.gridApi.applyTransaction({ add: newRows });
      this.gridApi.applyTransaction({ update: updatedRows });
      this.gridApi.applyTransaction({ remove: removedRows });
    } finally {
      this.endBatchTransaction();
    }
  }
}
```

### Transaction History and Undo/Redo

```typescript
export class TransactionHistoryService {
  private history: any[] = [];
  private currentIndex = -1;
  private maxHistorySize = 50;

  executeTransaction(transaction: any): void {
    // Execute transaction
    const result = this.gridApi.applyTransaction(transaction);
    
    // Store in history
    this.addToHistory({
      transaction,
      result,
      timestamp: Date.now(),
      reverseTransaction: this.createReverseTransaction(transaction, result)
    });
  }

  undo(): boolean {
    if (!this.canUndo()) return false;

    const historyItem = this.history[this.currentIndex];
    this.gridApi.applyTransaction(historyItem.reverseTransaction);
    this.currentIndex--;
    
    return true;
  }

  redo(): boolean {
    if (!this.canRedo()) return false;

    this.currentIndex++;
    const historyItem = this.history[this.currentIndex];
    this.gridApi.applyTransaction(historyItem.transaction);
    
    return true;
  }

  canUndo(): boolean {
    return this.currentIndex >= 0;
  }

  canRedo(): boolean {
    return this.currentIndex < this.history.length - 1;
  }
}
```

## API Reference

### Transaction Methods
- `applyTransaction(transaction)` - Apply data transaction
- `startBatchTransaction()` - Start transaction batching
- `endBatchTransaction()` - End transaction batching

### Transaction Interface
```typescript
interface RowDataTransaction {
  add?: any[];
  update?: any[];
  remove?: any[];
  addIndex?: number;
}
```

## Best Practices

1. **Group related operations** into single transactions
2. **Implement proper error handling** with rollback capabilities
3. **Use batch transactions** for multiple sequential operations
4. **Keep transaction history** for undo/redo functionality
5. **Monitor transaction performance** for large datasets