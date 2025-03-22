/**
 * Companion Service
 * Handles animal companion bonding and management
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { CompanionState } from '@/models/types/player';
import { ExtendedGameStore, ExtendedPlayerStore } from '@/types/store-extensions';
import { AnimalCompanionCard } from '@/models/types/cards';

class CompanionService {
  private _lastBondedCompanionId: string | null = null;

  /**
   * Bond with a new companion
   * @param companionId The ID of the companion to bond with
   * @param resourceId The ID of the resource used for bonding
   * @returns True if bonding was successful
   */
  bondWithCompanion(companionId: string, resourceId: string): boolean {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    const cardStore = useCardStore();
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
    
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
   * Feed a companion to increase loyalty
   * @param companionId ID of the companion
   * @param resourceId ID of the resource to feed
   * @returns True if feeding was successful
   */
  feedCompanion(companionId: string, resourceId: string): boolean {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Check if player has the resource
    if (!playerStore.resources.includes(resourceId)) {
      return false;
    }
    
    // Use feedAnimalCompanion from playerStore
    return playerStore.feedAnimalCompanion(companionId, resourceId);
  }

  /**
   * Get the loyalty level of a companion
   * @param companionId ID of the companion
   * @returns The loyalty level (0-5) or -1 if not found
   */
  getLoyalty(companionId: string): number {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return -1;
    }
    
    return playerStore.companionLoyalty(companionId);
  }

  /**
   * Increase the loyalty of a companion by 1
   * @param companionId ID of the companion
   * @returns New loyalty level
   */
  increaseLoyalty(companionId: string): number {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return -1;
    }
    
    // Get current loyalty
    const currentLoyalty = playerStore.companionLoyalty(companionId);
    
    // Max loyalty is 5
    if (currentLoyalty >= 5) {
      return currentLoyalty;
    }
    
    // Set new loyalty
    const newLoyalty = currentLoyalty + 1;
    playerStore.setCompanionLoyalty(companionId, newLoyalty);
    
    // Apply effects for reaching new loyalty level
    this.applyLoyaltyEffects(companionId, newLoyalty);
    
    return newLoyalty;
  }

  /**
   * Decrease the loyalty of a companion by 1
   * @param companionId ID of the companion
   * @returns New loyalty level
   */
  decreaseLoyalty(companionId: string): number {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return -1;
    }
    
    // Get current loyalty
    const currentLoyalty = playerStore.companionLoyalty(companionId);
    
    // Min loyalty is 0 (companion leaves when it hits 0)
    if (currentLoyalty <= 0) {
      // Remove companion
      playerStore.removeCompanion(companionId);
      return -1;
    }
    
    // Set new loyalty
    const newLoyalty = currentLoyalty - 1;
    playerStore.setCompanionLoyalty(companionId, newLoyalty);
    
    return newLoyalty;
  }

  /**
   * Get a list of companions that provide bonuses for a challenge type
   * @param challengeType Type of challenge to check
   * @returns Array of companion IDs that provide bonuses
   */
  getCompanionsForChallengeType(challengeType: string): string[] {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    const cardStore = useCardStore();
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
    
    return playerStore.animalCompanions.filter(companionId => {
      const companion = cardStore.getCompanionById(companionId);
      // Companion must exist and provide a bonus for this challenge type
      return companion && 
             companion.challengeBonuses && 
             companion.challengeBonuses[challengeType] > 0;
    });
  }

  /**
   * Select a random companion based on current location and season
   */
  selectRandomCompanion(): string {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    const gameStore = useGameStore() as unknown as ExtendedGameStore;

    // Get current location ID and season
    const locationId = gameStore.currentLandscapeId;
    const season = gameStore.currentSeason;
    
    // Get all available companions for this location/season
    const availableCompanions = cardStore.animalCompanions.filter(companion => {
      // Filter by season
      if (companion.affinitySeasons && companion.affinitySeasons.length > 0) {
        if (!companion.affinitySeasons.includes(season)) {
          return false;
        }
      }
      
      // Player doesn't already have this companion
      return !playerStore.animalCompanions.includes(companion.id);
    });
    
    // No available companions
    if (availableCompanions.length === 0) {
      return '';
    }
    
    // Select random companion
    const randomIndex = Math.floor(Math.random() * availableCompanions.length);
    const selectedCompanion = availableCompanions[randomIndex];
    
    this._lastBondedCompanionId = selectedCompanion.id;
    
    return selectedCompanion.id;
  }

  /**
   * Check if a companion is in a wary state (loyalty < 3)
   * @param companionId ID of the companion
   * @returns True if the companion is wary
   */
  isCompanionWary(companionId: string): boolean {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Get loyalty
    const loyalty = playerStore.companionLoyalty(companionId);
    
    // Wary if loyalty < 3
    return loyalty < 3;
  }

  /**
   * Apply effects when bonding with a companion
   * @param companionId ID of the companion
   */
  private applyBondingEffects(companionId: string): void {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    const companion = cardStore.getCompanionById(companionId);
    if (!companion || !companion.bondingEffect) {
      return;
    }
    
    // Apply bonding effect (which is a function)
    companion.bondingEffect(playerStore);
  }

  /**
   * Apply effects when reaching a new loyalty level
   * @param companionId ID of the companion
   * @param loyaltyLevel New loyalty level reached
   */
  private applyLoyaltyEffects(companionId: string, loyaltyLevel: number): void {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    const companion = cardStore.getCompanionById(companionId);
    if (!companion || !companion.loyaltyEffects) {
      return;
    }
    
    // Get the loyalty effect for this level (using object access)
    const effect = companion.loyaltyEffects[loyaltyLevel];
    
    // Apply effect if it exists
    if (effect) {
      effect(playerStore);
    }
  }

  /**
   * Get a list of resources from the player's inventory that
   * are compatible with a specific companion
   * @param companionId ID of the companion
   * @returns Array of resource objects
   */
  getCompatibleResources(companionId: string): any[] {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    // Get all player resources
    const playerResourceIds = playerStore.resources;
    
    // Get the companion
    const companion = cardStore.getCompanionById(companionId);
    if (!companion || !companion.preferredResources) {
      return [];
    }
    
    // Filter resources that match companion's preferred resources
    return playerResourceIds
      .map(id => cardStore.getResourceById(id))
      .filter(resource => {
        if (!resource) return false;
        
        // Extract base resource type from the resourceId
        const resourceType = resource.id.split('_').slice(0, -1).join('_');
        
        // Check if resource type is in companion's preferred resources
        return companion.preferredResources.some(prefResource => 
          resourceType === prefResource || resource.id === prefResource
        );
      });
  }

  /**
   * Get the best food resource for a companion from player inventory
   * @param companionId ID of the companion
   * @returns Resource ID or null if none available
   */
  getBestFoodResource(companionId: string): string | null {
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    // Get compatible resources
    const compatibleResources = this.getCompatibleResources(companionId);
    
    // No compatible resources
    if (compatibleResources.length === 0) {
      return null;
    }
    
    // Return the first one (could be improved to return best match)
    return compatibleResources[0].id;
  }
  
  /**
   * Check if a resource is suitable for bonding with a specific companion
   * @param resourceId ID of the resource
   * @param companionId ID of the companion
   * @returns True if the resource is suitable
   */
  isResourceSuitableForBonding(resourceId: string, companionId: string): boolean {
    const cardStore = useCardStore();
    
    // Get companion and resource cards
    const companion = cardStore.getCompanionById(companionId);
    const resource = cardStore.getResourceById(resourceId);
    
    if (!companion || !resource) {
      return false;
    }
    
    // Extract base resource type from the resourceId
    const resourceType = resource.id.split('_').slice(0, -1).join('_');
    
    // Check if resource type is in companion's preferred resources
    return companion.preferredResources && companion.preferredResources.some(prefResource => 
      resourceType === prefResource || resource.id === prefResource
    );
  }
  
  /**
   * Get all potential companions for the current location and season
   * @returns Array of companion cards
   */
  getPotentialCompanions(): AnimalCompanionCard[] {
    const cardStore = useCardStore();
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
    
    // Get current location ID and season
    const locationId = gameStore.currentLandscapeId;
    const season = gameStore.currentSeason;
    
    // Filter companions based on season only
    return cardStore.animalCompanions.filter(companion => {
      // Match season
      if (companion.affinitySeasons && companion.affinitySeasons.length > 0) {
        if (!companion.affinitySeasons.includes(season)) {
          return false;
        }
      }
      
      return true;
    });
  }
  
  /**
   * Check if a player can potentially bond with any companions
   * in the current location/season
   * @returns True if potential companions are available
   */
  hasPotentialCompanions(): boolean {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
    
    // Get all potential companions for current location and season
    const potentialCompanions = this.getPotentialCompanions();
    
    // No potential companions
    if (potentialCompanions.length === 0) {
      return false;
    }
    
    // Check if player has any compatible resources for bonding
    for (const companion of potentialCompanions) {
      for (const resourceId of playerStore.resources) {
        const resource = cardStore.getResourceById(resourceId);
        if (resource && companion.preferredResources && companion.preferredResources.some(prefResource => {
          const resourceType = resource.id.split('_').slice(0, -1).join('_');
          return resourceType === prefResource || resource.id === prefResource;
        })) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Reset the service state
   */
  reset(): void {
    this._lastBondedCompanionId = null;
  }

  /**
   * Get all available companions
   * @returns Array of available companion cards
   */
  getAvailableCompanions(): AnimalCompanionCard[] {
    const cardStore = useCardStore();
    return cardStore.animalCompanions;
  }

  /**
   * Get a companion by ID
   * @param companionId ID of the companion
   * @returns The companion card or null if not found
   */
  getCompanion(companionId: string): AnimalCompanionCard | null {
    const cardStore = useCardStore();
    return cardStore.getCompanionById(companionId);
  }
}

export const companionService = new CompanionService();
