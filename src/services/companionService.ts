/**
 * Companion Service
 * Handles animal companion bonding and management
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';

class CompanionService {
  /**
   * Bond with a new companion
   * @param companionId The ID of the companion to bond with
   * @param resourceId The ID of the resource used for bonding
   * @returns True if bonding was successful
   */
  bondWithCompanion(companionId: string, resourceId: string): boolean {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    // Check if player already has this companion
    if (playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Get companion card
    const companion = cardStore.getCompanionById(companionId);
    if (!companion) {
      return false;
    }
    
    // Check if resource is appropriate for bonding
    if (!this.isResourceSuitableForBonding(resourceId, companionId)) {
      return false;
    }
    
    // Use the resource
    if (!playerStore.removeResource(resourceId)) {
      return false;
    }
    
    // Add companion to player
    playerStore.addCompanion(companionId);
    
    // Apply bonding effects
    this.applyBondingEffects(companionId);
    
    return true;
  }
  
  /**
   * Check if a resource is suitable for bonding with a companion
   * @param resourceId The ID of the resource
   * @param companionId The ID of the companion
   * @returns True if the resource is suitable
   */
  isResourceSuitableForBonding(resourceId: string, companionId: string): boolean {
    const cardStore = useCardStore();
    
    const resource = cardStore.getResourceById(resourceId);
    const companion = cardStore.getCompanionById(companionId);
    
    if (!resource || !companion) {
      return false;
    }
    
    // Check if resource is in companion's preferred resources
    return companion.preferredResources && companion.preferredResources.includes(resourceId);
  }
  
  /**
   * Feed a companion to maintain loyalty
   * @param companionId The ID of the companion to feed
   * @param resourceId The ID of the resource to use
   * @returns True if feeding was successful
   */
  feedCompanion(companionId: string, resourceId: string): boolean {
    const playerStore = usePlayerStore();
    
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Check if resource is suitable
    if (!this.isResourceSuitableForBonding(resourceId, companionId)) {
      return false;
    }
    
    // Use the resource
    if (!playerStore.removeResource(resourceId)) {
      return false;
    }
    
    // Increase companion loyalty
    this.increaseCompanionLoyalty(companionId);
    
    return true;
  }
  
  /**
   * Get the current loyalty level of a companion
   * @param companionId The ID of the companion
   * @returns The loyalty level (0-5) or -1 if not found
   */
  getCompanionLoyalty(companionId: string): number {
    const playerStore = usePlayerStore();
    
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return -1;
    }
    
    // Get loyalty from player state
    return playerStore.companionLoyalty[companionId] || 0;
  }
  
  /**
   * Increase companion loyalty
   * @param companionId The ID of the companion
   * @returns The new loyalty level
   */
  increaseCompanionLoyalty(companionId: string): number {
    const playerStore = usePlayerStore();
    
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return -1;
    }
    
    // Get current loyalty
    const currentLoyalty = playerStore.companionLoyalty[companionId] || 0;
    
    // Max loyalty is 5
    const newLoyalty = Math.min(currentLoyalty + 1, 5);
    
    // Update loyalty
    playerStore.setCompanionLoyalty(companionId, newLoyalty);
    
    // Apply loyalty effects
    this.applyLoyaltyEffects(companionId, newLoyalty);
    
    return newLoyalty;
  }
  
  /**
   * Decrease companion loyalty (e.g., when not fed)
   * @param companionId The ID of the companion
   * @returns The new loyalty level
   */
  decreaseCompanionLoyalty(companionId: string): number {
    const playerStore = usePlayerStore();
    
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return -1;
    }
    
    // Get current loyalty
    const currentLoyalty = playerStore.companionLoyalty[companionId] || 0;
    
    // Min loyalty is 0
    const newLoyalty = Math.max(currentLoyalty - 1, 0);
    
    // Update loyalty
    playerStore.setCompanionLoyalty(companionId, newLoyalty);
    
    // If loyalty reaches 0, companion leaves
    if (newLoyalty === 0) {
      playerStore.removeCompanion(companionId);
      return -1;
    }
    
    return newLoyalty;
  }
  
  /**
   * Get companions that provide bonuses for a specific challenge type
   * @param challengeType The type of challenge
   * @returns Array of companion IDs that provide bonuses
   */
  getCompanionsForChallengeType(challengeType: string): string[] {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    return playerStore.animalCompanions.filter(companionId => {
      const companion = cardStore.getCompanionById(companionId);
      return companion && 
             companion.challengeBonuses && 
             companion.challengeBonuses[challengeType] > 0;
    });
  }
  
  /**
   * Apply effects when bonding with a companion
   * @param companionId The ID of the companion
   */
  private applyBondingEffects(companionId: string): void {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    
    const companion = cardStore.getCompanionById(companionId);
    if (!companion || !companion.bondingEffect) {
      return;
    }
    
    // Apply bonding effect
    companion.bondingEffect(playerStore);
  }
  
  /**
   * Apply effects based on companion loyalty level
   * @param companionId The ID of the companion
   * @param loyaltyLevel The loyalty level
   */
  private applyLoyaltyEffects(companionId: string, loyaltyLevel: number): void {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    
    const companion = cardStore.getCompanionById(companionId);
    if (!companion || !companion.loyaltyEffects) {
      return;
    }
    
    // Apply loyalty effect for this level
    const effect = companion.loyaltyEffects[loyaltyLevel];
    if (effect) {
      effect(playerStore);
    }
  }
}

export const companionService = new CompanionService();
