/**
 * Service Pattern Reference
 * 
 * This file provides a reference implementation for standardizing
 * service classes in the PathfindersJourney codebase.
 * 
 * Key aspects of the standardization:
 * 1. Consistent class implementation with proper JSDoc comments
 * 2. Consistent singleton pattern (export const serviceName = new ServiceName())
 * 3. Direct store access within methods (using useGameStore(), etc.)
 * 4. Consistent method naming and organization
 * 5. Addition of reset() method to all services for state management
 * 6. Private properties with consistent naming (_propertyName)
 */

// Mock store type declarations for reference purposes
// In real code, you would import from the actual modules
interface GameStore {
  currentPhase: string;
  currentTurn: number;
}

interface PlayerStore {
  health: number;
  resources: string[];
}

interface CardStore {
  getAllCards(): any[];
  getCardById(id: string): any;
}

// Mock functions to represent the store imports
const useGameStore = (): GameStore => ({ currentPhase: 'EXPLORATION', currentTurn: 1 });
const usePlayerStore = (): PlayerStore => ({ health: 10, resources: [] });
const useCardStore = (): CardStore => ({ 
  getAllCards: () => [], 
  getCardById: (id: string) => ({ id, name: 'Test Card' }) 
});

/**
 * Example Service class following standardized pattern
 */
class ExampleService {
  // Private properties with consistent naming using underscore prefix
  private _stateVariable1: number = 0;
  private _stateVariable2: boolean = false;
  
  /**
   * Public method with clear purpose
   * @param param1 Description of parameter
   * @returns Description of return value
   */
  public publicMethod(param1: string): number {
    // Direct store access
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // Implementation...
    return 0;
  }
  
  /**
   * Another public method
   */
  public anotherPublicMethod(): void {
    // Implementation...
  }
  
  /**
   * Private helper method with clear purpose
   * @param param1 Description of parameter
   * @returns Description of return value
   */
  private _helperMethod(param1: string): boolean {
    // Implementation...
    return true;
  }
  
  /**
   * Reset service state
   * All services should implement this method
   */
  public reset(): void {
    this._stateVariable1 = 0;
    this._stateVariable2 = false;
  }
}

// Export as singleton instance for consistent access pattern
export const exampleService = new ExampleService();
