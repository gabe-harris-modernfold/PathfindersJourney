/**
 * Companion Service
 * Handles animal companion bonding and management
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { CompanionState } from '@/models/types/player';
import { AnimalCompanionCard } from '@/models/types/cards';
import { Season } from '@/models/enums/seasons';

class CompanionService {
  private _lastBondedCompanionId: string | null = null;

  /**
   * Bond with a new companion
   * @param companionId The ID of the companion to bond with
   * @param resourceId The ID of the resource used for bonding
   * @returns True if bonding was successful
   */
  bondWithCompanion(companionId: string, resourceId: string): boolean {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    
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
    const playerStore = usePlayerStore();
    
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Check if player has the resource
    if (!playerStore.resources.includes(resourceId)) {
      return false;
    }
    
    // Use the feedCompanion method from playerStore
    return playerStore.feedCompanion(companionId, resourceId);
  }

  /**
   * Get the loyalty level of a companion
   * @param companionId ID of the companion
   * @returns The loyalty level (0-5) or null if not found
   */
  getLoyalty(companionId: string): number | null {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return null;
    }
    
    return playerStore.companionLoyalty[companionId]?.loyalty || 0;
  }

  /**
   * Increase the loyalty of a companion by 1
   * @param companionId ID of the companion
   * @returns New loyalty level or null if companion not found
   */
  increaseLoyalty(companionId: string): number | null {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return null;
    }
    
    // Check if companion loyalty data exists
    if (!playerStore.companionLoyalty[companionId]) {
      playerStore.companionLoyalty[companionId] = {
        loyalty: 1,
        state: CompanionState.LOYAL,
        turnsSinceLastFed: 0,
        turnsWary: 0
      };
    }
    
    // Increase loyalty and cap at 10
    const currentLoyalty = playerStore.companionLoyalty[companionId].loyalty;
    const newLoyalty = Math.min(10, currentLoyalty + 1);
    playerStore.companionLoyalty[companionId].loyalty = newLoyalty;
    
    // Apply effects for reaching new loyalty level
    this.applyLoyaltyEffects(companionId, newLoyalty);
    
    return newLoyalty;
  }

  /**
   * Decrease the loyalty of a companion by 1
   * @param companionId ID of the companion
   * @returns New loyalty level or null if companion not found
   */
  decreaseLoyalty(companionId: string): number | null {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return null;
    }
    
    // Check if companion loyalty data exists
    if (!playerStore.companionLoyalty[companionId]) {
      playerStore.companionLoyalty[companionId] = {
        loyalty: 5,
        state: CompanionState.LOYAL,
        turnsSinceLastFed: 0,
        turnsWary: 0
      };
    }
    
    // Decrease loyalty and ensure it doesn't go below 0
    const currentLoyalty = playerStore.companionLoyalty[companionId].loyalty;
    const newLoyalty = Math.max(0, currentLoyalty - 1);
    playerStore.companionLoyalty[companionId].loyalty = newLoyalty;
    
    // Remove companion if loyalty reaches 0
    if (newLoyalty === 0) {
      playerStore.removeCompanion(companionId);
    }
    
    return newLoyalty;
  }

  /**
   * Get a list of companions that provide bonuses for a challenge type
   * @param challengeType Type of challenge to check
   * @returns Array of companion IDs that provide bonuses
   */
  getCompanionsForChallengeType(challengeType: string): string[] {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    
    return playerStore.animalCompanions.filter(companionId => {
      const companion = cardStore.getCompanionById(companionId);
      // Companion must exist and provide a bonus for this challenge type
      return companion && 
             companion.challengeBonuses && 
             companion.challengeBonuses[challengeType] > 0;
    });
  }

  /**
   * Get the loyalty status of a companion
   * @param companionId ID of the companion
   * @returns True if the companion is wary
   */
  isCompanionWary(companionId: string): boolean {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Check loyalty status
    const status = playerStore.companionLoyalty[companionId];
    if (!status) {
      return false;
    }
    
    return status.state === CompanionState.WARY;
  }

  /**
   * Select a random companion based on current location and season
   * @returns The companion id or null if none available
   */
  selectRandomCompanion(): string | null {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();

    // Get current location ID and season
    const locationId = gameStore.currentLandscapeId;
    const season = gameStore.currentSeason as keyof typeof Season;
    
    // Get all available companions for this location/season
    const availableCompanions = cardStore.animalCompanions.filter(companion => {
      // Filter by season
      if (companion.affinitySeasons && Array.isArray(companion.affinitySeasons)) {
        // If the companion has specific seasons, check if current season is included
        if (!companion.affinitySeasons.some(s => s.toString().toLowerCase() === season.toLowerCase())) {
          return false;
        }
      }
      
      // Player doesn't already have this companion
      return !playerStore.animalCompanions.includes(companion.id);
    });
    
    // No available companions
    if (availableCompanions.length === 0) {
      return null;
    }
    
    // Select random companion
    const randomIndex = Math.floor(Math.random() * availableCompanions.length);
    const selectedCompanion = availableCompanions[randomIndex];
    
    this._lastBondedCompanionId = selectedCompanion.id;
    
    return selectedCompanion.id;
  }

  /**
   * Apply effects when bonding with a companion
   * @param companionId ID of the companion
   */
  private applyBondingEffects(companionId: string): void {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    
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
    const playerStore = usePlayerStore();
    
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
    const playerStore = usePlayerStore();
    
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
    const playerStore = usePlayerStore();
    
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
    const gameStore = useGameStore();
    
    // Get current location ID and season
    const locationId = gameStore.currentLandscapeId;
    const season = gameStore.currentSeason as keyof typeof Season;
    
    // Filter companions based on season only
    return cardStore.animalCompanions.filter(companion => {
      // Filter by season
      if (companion.affinitySeasons && Array.isArray(companion.affinitySeasons)) {
        // If the companion has specific seasons, check if current season is included
        if (!companion.affinitySeasons.some(s => s.toString().toLowerCase() === season.toLowerCase())) {
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
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
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
    const playerStore = usePlayerStore();
    
    return cardStore.animalCompanions.filter(companion => {
      // If companion has no preferred resources, don't show it
      if (!companion.preferredResources || companion.preferredResources.length === 0) {
        return false;
      }
      
      // Check if player has any of the preferred resources
      return playerStore.resources.some(resourceId => {
        const resource = cardStore.getResourceById(resourceId);
        if (!resource) return false;
        
        // Check if this resource is preferred by the companion
        return companion.preferredResources.some(prefResource => {
          // Check both exact match and resource type match
          const resourceType = resource.id.split('_').slice(0, -1).join('_');
          return resourceType === prefResource || resource.id === prefResource;
        });
      });
    });
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
