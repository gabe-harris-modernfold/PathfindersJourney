import { Season } from '@/models/enums/seasons';
import { Store } from 'pinia';
import { GameState } from '@/stores/gameStore';
import { PlayerState } from '@/stores/playerStore';
import { GamePhase } from '@/models/enums/phases';

/**
 * Extended GameStore interface to expose all properties and methods
 * used across the codebase but not explicitly defined in the store type
 */
export interface ExtendedGameStore extends Store<'game', GameState> {
  // Journey properties
  journeyPath: string[];
  visitedLandscapes: string[];
  currentLandscapeId: string;
  currentTurn: number;
  
  // Season properties
  currentSeason: Season;
  advanceSeason(): void;
  
  // Threat properties
  threatTokens: number;
  addThreatTokens(amount: number): number;
  removeThreatTokens(amount: number): number;
  blessingTokens: number;
  
  // Challenge properties
  challengeHistory: any[];
  setCurrentChallenge(challengeId: string): void;
  
  // Victory properties
  victoryConditions: Record<string, boolean>;
  endGame(isVictory: boolean): void;
  setPhase(phase: GamePhase): void;
  
  // Effect properties
  addTempEffect(
    id: string,
    name?: string, 
    description?: string, 
    strength?: number, 
    duration?: number
  ): void;
  
  // Logging
  addToGameLog(message: string, important?: boolean, category?: string): void;
  formatResourceName(resourceId: string): string;
}

/**
 * Extended PlayerStore interface to expose all properties and methods
 * used across the codebase but not explicitly defined in the store type
 */
export interface ExtendedPlayerStore extends Store<'player', PlayerState> {
  // Character properties
  characterId: string;
  
  // Health properties
  health: number;
  maxHealth: number;
  hasResourceForagingAction: boolean;
  hasPerformedCrafting: boolean;
  loseHealth(amount: number): boolean;
  healHealth(amount: number): number;
  activeEffects: any[];
  removeResource(resourceId: string): boolean;
  removeAnimalCompanion(companionId: string): void;
  loseRandomResources(count: number): void;
  addEffect(effect: any): boolean;
  
  // Player health methods
  takeDamage(amount: number): boolean;
  
  // Effect methods
  hasEffect(effectId: string): boolean;
  getEffectStrength(effectId: string): number;
  
  // Resource properties
  resources: string[];
  resourceCapacity: number;
  isResourceCapacityReached: boolean;
  addResource(resourceId: string): void;
  
  // Companion properties
  animalCompanions: any[];
  companionCount(): number;
  feedAnimalCompanion(companionId: string, resourceId: string): boolean;
  addCompanion(companionId: string): void;
  removeCompanion(companionId: string): void;
  companionLoyalty(companionId: string): number;
  setCompanionLoyalty(companionId: string, loyalty: number): void;
  
  // Crafting properties
  craftedItems: string[];
  craftedItemCount: number;
  uniqueCraftedItemsCount: number;
  hasCraftedLegendaryItem: boolean;
  addCraftedItem(itemId: string): void;
}
