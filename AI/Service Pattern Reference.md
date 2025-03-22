# Service Pattern Reference

## Key Principles
1. Extend `BaseService` abstract class
2. Use `StoreRegistry` for store access
3. Export as singleton: `export const serviceName = new ServiceName()`
4. Clear method naming with JSDoc comments
5. Implement `initialize()` and `reset()` lifecycle methods
6. Use private properties with underscore: `_propertyName`

## Implementation Example

```typescript
import { BaseService } from '@/services/core/BaseService';
import { StoreRegistry } from '@/services/core/StoreRegistry';
import { ExtendedGameStore, ExtendedPlayerStore } from '@/types/store-extensions';
import { GamePhase } from '@/models/enums/phases';

class ExampleService extends BaseService {
  private _stateVariable: number = 0;
  private _lastUsedItemId: string | null = null;
  
  public initialize(): void {
    this._stateVariable = 0;
    this._lastUsedItemId = null;
  }
  
  public processItem(itemId: string): boolean {
    const gameStore = this.storeRegistry.getStore('game') as unknown as ExtendedGameStore;
    const playerStore = this.storeRegistry.getStore('player') as unknown as ExtendedPlayerStore;
    const cardStore = this.storeRegistry.getStore('card');
    
    if (gameStore.currentPhase !== GamePhase.EXPLORATION) return false;
    
    const item = cardStore.getResourceById(itemId);
    if (!item) return false;
    
    this._lastUsedItemId = itemId;
    gameStore.addToGameLog(`Processed item: ${item.name}`);
    
    return true;
  }
  
  private _helperMethod(param1: string): boolean {
    // Implementation logic
    return true;
  }
  
  public reset(): void {
    this._stateVariable = 0;
    this._lastUsedItemId = null;
  }
}

const storeRegistry = new StoreRegistry();
export const exampleService = new ExampleService(storeRegistry);
```

## Service Registration
Services should be registered in `src/services/index.ts` for central access.

## Best Practices
- Reset state when game resets
- Access stores via StoreRegistry, not direct imports
- Cast stores to extended interfaces when needed
- Keep services focused on specific game mechanics
- Use strategy pattern for variant behaviors
