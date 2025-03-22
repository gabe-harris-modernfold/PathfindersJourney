/**
 * StoreRegistry
 * 
 * Registry for accessing stores consistently across services.
 * Centralizes store access and dependency injection.
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';

export class StoreRegistry {
  /**
   * Get the game store instance
   * @returns The game store instance
   */
  public getGameStore() {
    return useGameStore();
  }

  /**
   * Get the player store instance
   * @returns The player store instance
   */
  public getPlayerStore() {
    return usePlayerStore();
  }

  /**
   * Get the card store instance
   * @returns The card store instance
   */
  public getCardStore() {
    return useCardStore();
  }
}
