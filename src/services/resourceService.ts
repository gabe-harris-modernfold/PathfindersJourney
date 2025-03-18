/**
 * Resource Service
 * Handles resource collection and management
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { Season } from '@/models/enums/seasons';

class ResourceService {
  /**
   * Check if player can collect a resource
   * @param resourceId The ID of the resource to collect
   * @returns True if the resource can be collected
   */
  canCollectResource(resourceId: string): boolean {
    const playerStore = usePlayerStore();
    
    // Check capacity limits
    if (playerStore.isResourceCapacityReached) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Collect a specific resource
   * @param resourceId The ID of the resource to collect
   * @returns True if the resource was collected successfully
   */
  collectResource(resourceId: string): boolean {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    if (!this.canCollectResource(resourceId)) {
      return false;
    }
    
    // Get resource card
    const resource = cardStore.getResourceById(resourceId);
    if (!resource) {
      return false;
    }
    
    // Add to player resources
    playerStore.addResource(resourceId);
    return true;
  }
  
  /**
   * Collect random resources from current landscape
   * @param count Number of resources to collect
   * @returns Array of collected resource IDs
   */
  collectLandscapeResources(count: number): string[] {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    const landscape = cardStore.getLandscapeById(gameStore.currentLandscapeId);
    if (!landscape || !landscape.availableResources) {
      return [];
    }
    
    // Get available resources at this landscape
    const availableResources = landscape.availableResources;
    
    // Apply seasonal abundance/scarcity
    const seasonallyAdjusted = this.applySeasonalResourceEffects(
      availableResources,
      gameStore.currentSeason as Season
    );
    
    // Randomly select resources up to count
    const shuffled = [...seasonallyAdjusted].sort(() => 0.5 - Math.random());
    const selectedResources = shuffled.slice(0, count);
    
    // Add to player inventory
    const collected = [];
    for (const resourceId of selectedResources) {
      if (this.collectResource(resourceId)) {
        collected.push(resourceId);
      }
    }
    
    return collected;
  }
  
  /**
   * Use a resource
   * @param resourceId The ID of the resource to use
   * @returns True if the resource was used successfully
   */
  useResource(resourceId: string): boolean {
    const playerStore = usePlayerStore();
    return playerStore.removeResource(resourceId);
  }
  
  /**
   * Get resources by type
   * @param type The type of resources to get
   * @returns Array of resource IDs of the specified type
   */
  getResourcesByType(type: string): string[] {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    return playerStore.resources.filter(resourceId => {
      const resource = cardStore.getResourceById(resourceId);
      return resource && resource.type === type;
    });
  }
  
  /**
   * Apply seasonal abundance/scarcity effects
   * @param resourceIds Array of resource IDs
   * @param season The current season
   * @returns Modified array of resource IDs
   */
  applySeasonalResourceEffects(resourceIds: string[], season: Season): string[] {
    // Define seasonal abundance/scarcity
    const seasonalEffects = {
      [Season.SAMHAIN]: {
        abundant: ['barrow_dust', 'standing_stone_chips'],
        scarce: ['woven_reeds', 'rowan_wood']
      },
      [Season.WINTERS_DEPTH]: {
        abundant: ['forge_cinders', 'bog_iron'],
        scarce: ['sacred_water', 'horse_hair']
      },
      [Season.IMBOLC]: {
        abundant: ['silver_mistletoe', 'sacred_water'],
        scarce: ['barrow_dust', 'forge_cinders']
      },
      [Season.BELTANE]: {
        abundant: ['rowan_wood', 'oak_galls'],
        scarce: ['standing_stone_chips', 'amber_shards']
      },
      [Season.LUGHNASADH]: {
        abundant: ['horse_hair', 'woven_reeds', 'ogham_sticks'],
        scarce: ['bog_iron', 'silver_mistletoe']
      }
    };
    
    // If no seasonal effects for current season, return original
    if (!seasonalEffects[season]) {
      return resourceIds;
    }
    
    // Make abundant resources more likely, scarce less likely
    let adjusted = [...resourceIds];
    
    // Double abundant resources (increase probability)
    for (const resourceId of resourceIds) {
      if (seasonalEffects[season].abundant.includes(resourceId)) {
        adjusted.push(resourceId);
      }
    }
    
    // Remove scarce resources (decrease probability)
    adjusted = adjusted.filter(resourceId => 
      !seasonalEffects[season].scarce.includes(resourceId)
    );
    
    return adjusted;
  }

  /**
   * Format season name for display
   * @param season The season name/id
   * @returns Formatted season name
   */
  formatSeasonName(season: string | null): string {
    if (!season) return '';
    
    return season.replace('_', ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  }
  
  /**
   * Convert season value to a CSS class name
   * @param season The season name/id
   * @returns CSS class name
   */
  getSeasonClassName(season: string): string {
    if (typeof season === 'string') {
      return season.toLowerCase().replace(/_/g, '-');
    }
    return '';
  }
  
  /**
   * Truncate description to keep card content concise
   * @param text The text to truncate
   * @param maxLength Maximum length before truncation
   * @returns Truncated text
   */
  truncateDescription(text: string, maxLength = 60): string {
    if (!text) return '';
    return text.length > maxLength 
      ? text.substring(0, maxLength) + '...' 
      : text;
  }
}

export const resourceService = new ResourceService();
