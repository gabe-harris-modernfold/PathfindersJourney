/**
 * Companion Service
 * Handles animal companion bonding and management
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { CompanionState } from '@/models/types/player';

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
    
    if (!resource || !companion || !companion.preferredResources) {
      return false;
    }
    
    // Extract base resource type from the resourceId
    const resourceType = resource.id.split('_').slice(0, -1).join('_');
    
    // Check if resource type is in companion's preferred resources
    return companion.preferredResources.some(prefResource => 
      resourceType === prefResource || resource.id === prefResource
    );
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
    this.increaseLoyalty(companionId);
    
    return true;
  }
  
  /**
   * Get the current loyalty level of a companion
   * @param companionId The ID of the companion
   * @returns The loyalty level (0-5) or -1 if not found
   */
  getLoyalty(companionId: string): number {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return 0;
    }

    // Get loyalty from player state
    const status = playerStore.companionLoyalty[companionId];
    return status && typeof status === 'object' && 'loyalty' in status ? status.loyalty : 0;
  }
  
  /**
   * Increase companion loyalty
   * @param companionId Companion identifier
   * @returns New loyalty level
   */
  increaseLoyalty(companionId: string): number {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return 0;
    }

    // Get current loyalty
    const status = playerStore.companionLoyalty[companionId];
    const currentLoyalty = status && typeof status === 'object' && 'loyalty' in status ? status.loyalty : 0;

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
   * @param companionId Companion identifier
   * @returns New loyalty level
   */
  decreaseLoyalty(companionId: string): number {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return 0;
    }

    // Get current loyalty
    const status = playerStore.companionLoyalty[companionId];
    const currentLoyalty = status && typeof status === 'object' && 'loyalty' in status ? status.loyalty : 0;

    // Min loyalty is 0
    const newLoyalty = Math.max(currentLoyalty - 1, 0);

    // Update loyalty
    playerStore.setCompanionLoyalty(companionId, newLoyalty);

    // If loyalty reaches 0, companion leaves
    if (newLoyalty === 0) {
      playerStore.removeCompanion(companionId);
      return -1;
    }
    
    // Apply loyalty effects
    this.applyLoyaltyEffects(companionId, newLoyalty);
    
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
   * Select a random companion from the available ones for the current landscape
   * @returns A random companion ID or empty string if none available
   */
  selectRandomCompanion(): string {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();

    // Get current location ID and season
    const locationId = gameStore.currentLandscapeId;
    const currentSeason = gameStore.currentSeason;
    
    if (!locationId || !currentSeason) {
      return '';
    }
    
    // Define which companions are available at which landscapes
    const landscapeCompanions: { [key: string]: string[] } = {
      'sacred_oak_grove': ['wolf', 'deer', 'bear', 'boar'],
      'faerie_knoll': ['fox', 'hare'],
      'moonlit_loch': ['salmon', 'owl'],
      'whispering_heath': ['raven'],
      'wild_horse_plain': ['horse']
    };
    
    // Check if current landscape has any companions available
    if (!landscapeCompanions[locationId]) {
      return ''; // No companions available at this landscape
    }
    
    // Get the companion IDs available at this landscape
    const availableCompanionTypes = landscapeCompanions[locationId];
    
    // Get companions that match the landscape and the player doesn't already have
    const availableCompanions = cardStore.animalCompanions.filter(companion => {
      // Skip companions the player already has
      if (playerStore.animalCompanions.includes(companion.id)) {
        return false;
      }
      
      // Check if companion type is available at this landscape
      // Assuming companion IDs contain the animal type (e.g., "wolf_companion")
      const companionType = companion.id.split('_')[0].toLowerCase();
      return availableCompanionTypes.includes(companionType);
    });
    
    // Return a random companion ID or empty string if none available
    return availableCompanions.length > 0 
      ? availableCompanions[Math.floor(Math.random() * availableCompanions.length)].id 
      : '';
  }

  /**
   * Check if a companion is in a wary state
   * @param companionId The ID of the companion
   * @returns True if the companion is wary
   */
  isCompanionWary(companionId: string): boolean {
    const playerStore = usePlayerStore();
    
    // Check if the companion exists
    if (!playerStore.animalCompanions.includes(companionId)) {
      return false;
    }

    // Get companion state
    const status = playerStore.companionLoyalty[companionId];
    return status && 
           typeof status === 'object' && 
           'state' in status && 
           status.state === CompanionState.WARY;
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

  /**
   * Get the loyalty bar style for UI display
   * @param companionId The ID of the companion or a loyalty value
   * @returns CSS style object for the loyalty bar
   */
  getLoyaltyBarStyle(companionIdOrValue: string | number): Record<string, string> {
    let loyaltyValue: number;
    
    // If a companionId is provided, get the loyalty value
    if (typeof companionIdOrValue === 'string') {
      loyaltyValue = this.getLoyalty(companionIdOrValue);
    } else {
      loyaltyValue = companionIdOrValue;
    }
    
    const percentage = (loyaltyValue / 5) * 100;
    return {
      width: `${percentage}%`,
      backgroundColor: this.getLoyaltyColor(loyaltyValue)
    };
  }
  
  /**
   * Get color based on loyalty level
   * @param loyalty The loyalty level
   * @returns CSS color value
   */
  getLoyaltyColor(loyalty: number): string {
    if (loyalty <= 1) return '#FF5252'; // Danger - Red
    if (loyalty <= 3) return '#FFC107'; // Warning - Yellow
    return '#4CAF50'; // Success - Green
  }
  
  /**
   * Format season name for display
   * @param season The season name/id
   * @returns Formatted season name
   */
  formatSeasonName(season: string): string {
    return season.replace('_', ' ').split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Get compatible resources for feeding a companion
   * @param companionId The ID of the companion
   * @returns Array of resource objects suitable for the companion
   */
  getCompatibleResources(companionId: string): any[] {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    
    // Get all player resources
    const playerResourceIds = cardStore.getPlayerResources();
    
    // Filter resources that are suitable for the companion
    return playerResourceIds
      .map(id => cardStore.getResourceById(id))
      .filter(resource => resource && 
        this.isResourceSuitableForBonding(resource.id, companionId));
  }
}

export const companionService = new CompanionService();
