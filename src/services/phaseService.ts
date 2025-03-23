/**
 * Phase Service
 * Manages game phase transitions and phase-specific logic
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useLogStore } from '@/stores/logStore';
import { GamePhase } from '@/models/enums/phases';
import { BaseService } from '@/services/core/BaseService';
import { StoreRegistry } from '@/services/core/StoreRegistry'; // Import StoreRegistry

class PhaseService extends BaseService {
  // Use private properties with null initialization instead of direct store access
  private _gameStoreInstance: any = null;
  private _playerStoreInstance: any = null;
  private _logStoreInstance: any = null;
  
  // Lazy getters for stores
  private get _gameStore(): any {
    if (!this._gameStoreInstance) {
      this._gameStoreInstance = useGameStore();
    }
    return this._gameStoreInstance;
  }
  
  private get _playerStore(): any {
    if (!this._playerStoreInstance) {
      this._playerStoreInstance = usePlayerStore();
    }
    return this._playerStoreInstance;
  }
  
  private get _logStore(): any {
    if (!this._logStoreInstance) {
      this._logStoreInstance = useLogStore();
    }
    return this._logStoreInstance;
  }
  
  /**
   * Advances the game to the next phase
   * @returns The new game phase
   */
  public advancePhase(): GamePhase {
    const currentPhase = this._gameStore.currentPhase;
    let nextPhase: GamePhase;
    
    // Define phase progression based on current phase
    switch (currentPhase) {
      case GamePhase.SETUP:
        nextPhase = GamePhase.CHARACTER_SELECTION;
        break;
      case GamePhase.CHARACTER_SELECTION:
        nextPhase = GamePhase.SEASONAL_ASSESSMENT;
        break;
      case GamePhase.SEASONAL_ASSESSMENT:
        nextPhase = GamePhase.THREAT_LEVEL_CHECK;
        break;
      case GamePhase.THREAT_LEVEL_CHECK:
        nextPhase = GamePhase.LANDSCAPE_CHALLENGE;
        break;
      case GamePhase.LANDSCAPE_CHALLENGE:
        nextPhase = GamePhase.CHALLENGE_RESOLUTION;
        break;
      case GamePhase.CHALLENGE_RESOLUTION:
        nextPhase = GamePhase.RESOURCE_MANAGEMENT;
        break;
      case GamePhase.RESOURCE_MANAGEMENT:
        nextPhase = GamePhase.ANIMAL_COMPANION;
        break;
      case GamePhase.ANIMAL_COMPANION:
        nextPhase = GamePhase.CRAFTING;
        break;
      case GamePhase.CRAFTING:
        nextPhase = GamePhase.JOURNEY_PROGRESSION;
        break;
      case GamePhase.JOURNEY_PROGRESSION:
        nextPhase = GamePhase.EXPLORATION;
        break;
      case GamePhase.EXPLORATION:
        // Loop back to seasonal assessment for next turn
        nextPhase = GamePhase.SEASONAL_ASSESSMENT;
        break;
      default:
        nextPhase = GamePhase.SEASONAL_ASSESSMENT;
    }
    
    // Set the new phase
    this._gameStore.setPhase(nextPhase);
    
    // Log the phase transition
    this._logStore.addToGameLog(`Advanced to ${this.formatPhase(nextPhase)} phase.`, false, 'phase');
    
    return nextPhase;
  }
  
  /**
   * Directly advance to the Exploration phase
   * @returns The new game phase (Exploration)
   */
  public advanceToExploration(): GamePhase {
    const nextPhase = GamePhase.EXPLORATION;
    
    // Set the new phase
    this._gameStore.setPhase(nextPhase);
    
    // Log the phase transition
    this._logStore.addToGameLog(`Advanced to ${this.formatPhase(nextPhase)} phase.`, false, 'phase');
    
    return nextPhase;
  }
  
  /**
   * Force advance to the Exploration phase regardless of current state
   * This is a fallback method to ensure the game can continue when normal progression fails
   * @returns The new game phase (Exploration)
   */
  public forceAdvanceToExploration(): GamePhase {
    const nextPhase = GamePhase.EXPLORATION;
    
    // Force set the phase to exploration
    this._gameStore.setPhase(nextPhase);
    
    // Log the forced phase transition
    this._logStore.addToGameLog(`Continuing adventure in ${this.formatPhase(nextPhase)} phase.`, false, 'phase');
    
    return nextPhase;
  }
  
  /**
   * Gets the current phase
   * @returns The current game phase
   */
  public getCurrentPhase(): GamePhase {
    return this._gameStore.currentPhase;
  }
  
  /**
   * Sets the game phase to a specific value
   * @param phase The phase to set
   * @returns The new game phase
   */
  public setPhase(phase: GamePhase): GamePhase {
    this._gameStore.setPhase(phase);
    this._logStore.addToGameLog(`Moved to ${this.formatPhase(phase)} phase.`, false, 'phase');
    return phase;
  }
  
  /**
   * Handles initial setup for a phase
   * @param phase The phase to setup
   */
  public setupPhase(phase: GamePhase): void {
    // Initialize phase-specific state
    switch (phase) {
      case GamePhase.SEASONAL_ASSESSMENT:
        // Handle season progression
        break;
      case GamePhase.THREAT_LEVEL_CHECK:
        // Initialize threat state
        break;
      // Add other phases as needed
    }
  }
  
  /**
   * Format phase name for display
   * @param phase The phase to format
   * @returns Formatted phase name
   */
  public formatPhase(phase: GamePhase): string {
    return phase.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
  
  /**
   * Check if player can advance to a specific phase
   * @param targetPhase The phase to check eligibility for
   * @returns Whether the player can advance to the phase
   */
  public canAdvanceToPhase(targetPhase: GamePhase): boolean {
    // Add conditions for advancing to specific phases
    // Example: Can't advance to journey if health is zero
    if (targetPhase === GamePhase.JOURNEY_PROGRESSION && this._playerStore.health <= 0) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Reset this service to its initial state
   */
  public reset(): void {
    // Reset any service state here
  }
  
  // Add constructor to accept StoreRegistry instance
  constructor(storeRegistry: StoreRegistry) {
    super(storeRegistry);
  }
}

// Create and export lazy initialized singleton
let _phaseServiceInstance: PhaseService | null = null;

export function getPhaseService(): PhaseService {
  if (!_phaseServiceInstance) {
    _phaseServiceInstance = new PhaseService(new StoreRegistry());
  }
  return _phaseServiceInstance;
}

// For backward compatibility with existing code
export const phaseService = {
  get instance() {
    return getPhaseService();
  }
};
