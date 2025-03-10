/**
 * Crafting Service
 * Handles crafting mechanics and resource requirements
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { ThreatService } from '@/services/threatService';

// Define interfaces to extend existing types
interface ExtendedLandscape {
  hasCraftingFacilities?: boolean;
  craftingBonuses?: Record<string, number>;
  specialCraftingCapabilities?: number;
}

// Complexity tiers with their numeric values for difficulty calculation
const COMPLEXITY_TIERS = {
  SIMPLE: 1,
  COMPLEX: 2,
  ADVANCED: 3,
  LEGENDARY: 4
};

// Map string complexity values to numeric tier values
const getComplexityValue = (complexity: string | number): number => {
  // If it's already a number, return it
  if (typeof complexity === 'number') {
    return complexity;
  }
  
  switch(complexity.toLowerCase()) {
    case 'simple': return COMPLEXITY_TIERS.SIMPLE;
    case 'complex': return COMPLEXITY_TIERS.COMPLEX;
    case 'advanced': return COMPLEXITY_TIERS.ADVANCED;
    case 'legendary': return COMPLEXITY_TIERS.LEGENDARY;
    default: return COMPLEXITY_TIERS.SIMPLE;
  }
};

class CraftingService {
  private gameStore = useGameStore();
  private playerStore = usePlayerStore();
  private cardStore = useCardStore();
  private threatService = new ThreatService();
  
  /**
   * Check if player can craft an item
   * @param itemId The ID of the item to craft
   * @returns Object with canCraft flag and missing resources
   */
  canCraftItem(itemId: string): {
    canCraft: boolean;
    missingResources: string[];
    landscapeSupported: boolean;
    playerSkill: boolean;
  } {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    
    // Get crafted item
    const item = cardStore.getCraftedItemById(itemId);
    if (!item) {
      return { canCraft: false, missingResources: [], landscapeSupported: false, playerSkill: false };
    }
    
    // Check if player already has this item
    if (playerStore.craftedItems.includes(itemId)) {
      return { canCraft: false, missingResources: [], landscapeSupported: false, playerSkill: false };
    }
    
    // Check required resources
    const missingResources = [];
    for (const resourceId of item.requiredResources) {
      if (!playerStore.resources.includes(resourceId)) {
        missingResources.push(resourceId);
      }
    }
    
    // Check if current landscape supports crafting this item complexity
    const landscapeSupported = this.isComplexitySupportedByLandscape(
      getComplexityValue(item.complexity),
      gameStore.currentLandscapeId
    );
    
    // Check if player has sufficient skill level for this item
    const playerSkill = this.playerHasSkillForComplexity(
      getComplexityValue(item.complexity)
    );
    
    return {
      canCraft: missingResources.length === 0 && landscapeSupported && playerSkill,
      missingResources,
      landscapeSupported,
      playerSkill
    };
  }
  
  /**
   * Check if the current landscape supports crafting at the given complexity tier
   * @param complexityTier The numeric complexity tier value
   * @param landscapeId The current landscape ID
   * @returns True if the landscape supports this complexity
   */
  isComplexitySupportedByLandscape(complexityTier: number, landscapeId: string): boolean {
    const cardStore = useCardStore();
    const landscape = cardStore.getLandscapeById(landscapeId) as unknown as ExtendedLandscape;
    
    if (!landscape) {
      return false;
    }
    
    // Basic landscapes may only support simple crafting
    if (!landscape.hasCraftingFacilities && complexityTier > COMPLEXITY_TIERS.SIMPLE) {
      return false;
    }
    
    // Specialized crafting landscapes (with facilities) support up to complex items
    if (landscape.hasCraftingFacilities && complexityTier <= COMPLEXITY_TIERS.COMPLEX) {
      return true;
    }
    
    // Check for special crafting landscapes that support advanced or legendary
    if (landscape.specialCraftingCapabilities) {
      return complexityTier <= landscape.specialCraftingCapabilities;
    }
    
    // Default case: simple items can be crafted anywhere
    return complexityTier === COMPLEXITY_TIERS.SIMPLE;
  }
  
  /**
   * Check if player has sufficient skill for crafting at the given complexity tier
   * @param complexityTier The numeric complexity tier value
   * @returns True if player has the necessary skill
   */
  playerHasSkillForComplexity(complexityTier: number): boolean {
    const playerStore = usePlayerStore();
    
    // Number of crafted items can indicate skill level
    const craftedItemCount = playerStore.craftedItemCount;
    
    // Simple items require no prior crafting
    if (complexityTier === COMPLEXITY_TIERS.SIMPLE) {
      return true;
    }
    
    // Complex items require at least 1 prior crafted item
    if (complexityTier === COMPLEXITY_TIERS.COMPLEX) {
      return craftedItemCount >= 1;
    }
    
    // Advanced items require at least 3 prior crafted items
    if (complexityTier === COMPLEXITY_TIERS.ADVANCED) {
      return craftedItemCount >= 3;
    }
    
    // Legendary items require at least 5 prior crafted items
    if (complexityTier === COMPLEXITY_TIERS.LEGENDARY) {
      return craftedItemCount >= 5;
    }
    
    return false;
  }
  
  /**
   * Craft an item if possible
   * @param itemId ID of the item to craft
   * @returns True if the item was crafted, false otherwise
   */
  public craftItem(itemId: string): boolean {
    const { canCraft, missingResources, landscapeSupported, playerSkill } = this.canCraftItem(itemId);
    
    if (!canCraft) {
      if (missingResources.length > 0) {
        this.gameStore.addToGameLog(`Cannot craft item: missing resources - ${missingResources.join(', ')}`, true);
      } else if (!landscapeSupported) {
        this.gameStore.addToGameLog('Cannot craft item: current landscape does not support this complexity of crafting', true);
      } else if (!playerSkill) {
        this.gameStore.addToGameLog('Cannot craft item: insufficient crafting experience', true);
      } else {
        this.gameStore.addToGameLog('Cannot craft item: unknown reason', true);
      }
      return false;
    }
    
    const item = this.cardStore.getCraftedItemById(itemId);
    if (!item) {
      this.gameStore.addToGameLog(`Cannot craft item: item with ID ${itemId} not found`, true);
      return false;
    }
    
    // Validate each required resource exists in the game data
    const invalidResources = [];
    for (const resourceId of item.requiredResources) {
      if (!this.cardStore.getResourceById(resourceId)) {
        invalidResources.push(resourceId);
      }
    }
    
    if (invalidResources.length > 0) {
      this.gameStore.addToGameLog(`Crafting failed: invalid resource references - ${invalidResources.join(', ')}`, true);
      return false;
    }
    
    // Remove required resources
    for (const resourceId of item.requiredResources) {
      this.playerStore.removeResource(resourceId);
    }
    
    // Add the crafted item to inventory
    this.playerStore.addCraftedItem(itemId);
    
    // Update unique crafted items count for skill progression
    if (!this.playerStore.craftedItems.includes(itemId)) {
      this.playerStore.uniqueCraftedItemsCount++;
    }
    
    // Check for legendary item
    if (item.isLegendary) {
      this.playerStore.hasCraftedLegendaryItem = true;
    }
    
    // Apply threat cost based on item complexity
    const threatCost = this.threatService.getThreatForCraftedItem(itemId);
    if (threatCost > 0) {
      this.threatService.addThreatTokens(threatCost);
      this.gameStore.addToGameLog(`Crafting this powerful item has increased threat by ${threatCost}.`, true);
    }
    
    this.gameStore.addToGameLog(`Successfully crafted ${item.name}!`, true);
    return true;
  }
  
  /**
   * Calculate crafting difficulty for an item
   * @param itemId The ID of the item to craft
   * @returns The calculated difficulty
   */
  calculateCraftingDifficulty(itemId: string): number {
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    
    // Get crafted item
    const item = cardStore.getCraftedItemById(itemId);
    if (!item) {
      return 0;
    }
    
    // Get the complexity tier numeric value
    const complexityValue = getComplexityValue(item.complexity);
    
    // Base difficulty from item
    // Use item complexity as the base if no specific difficulty is defined
    const baseDifficulty = typeof item['difficulty'] === 'number' ? item['difficulty'] : 3;
    let difficulty = baseDifficulty * complexityValue;
    
    // Apply location bonus/penalty
    const locationBonus = this.getLocationCraftingBonus(itemId, gameStore.currentLandscapeId);
    difficulty -= locationBonus * 2; // Increase the impact of location bonuses
    
    // Apply seasonal effects
    const seasonalModifier = this.getSeasonalCraftingModifier(gameStore.currentSeason);
    difficulty += seasonalModifier;
    
    // Apply threat level effects
    const threatLevel = Math.floor(gameStore.threatTokens / 3);
    difficulty += threatLevel;
    
    // Apply player's crafting experience bonus
    const playerStore = usePlayerStore();
    const experienceBonus = Math.floor(playerStore.craftedItemCount / 2);
    difficulty -= experienceBonus;
    
    // Ensure minimum difficulty of 1
    return Math.max(1, difficulty);
  }
  
  /**
   * Get crafting bonus for current location
   * @param itemId The ID of the item to craft
   * @param locationId The ID of the current location
   * @returns The location bonus (positive is beneficial)
   */
  getLocationCraftingBonus(itemId: string, locationId: string): number {
    const cardStore = useCardStore();
    
    const item = cardStore.getCraftedItemById(itemId);
    const landscape = cardStore.getLandscapeById(locationId) as unknown as ExtendedLandscape;
    
    if (!item || !landscape) {
      return 0;
    }
    
    // Check if location has crafting facilities
    if (landscape.hasCraftingFacilities) {
      return 1;
    }
    
    // Check if location has special bonus for this item type
    if (landscape.craftingBonuses && item.type && landscape.craftingBonuses[item.type]) {
      return landscape.craftingBonuses[item.type];
    }
    
    // Check if landscape has special affinity for the item's complexity
    if (landscape.specialCraftingCapabilities && 
        getComplexityValue(item.complexity) <= landscape.specialCraftingCapabilities) {
      return 2; // Bigger bonus for specialized crafting locations
    }
    
    return 0;
  }
  
  /**
   * Get seasonal modifier for crafting
   * @param season The current season
   * @returns The seasonal modifier (negative is beneficial)
   */
  getSeasonalCraftingModifier(season: string): number {
    // Define seasonal crafting modifiers
    const seasonalModifiers: Record<string, number> = {
      'SAMHAIN': 0,
      'WINTERS_DEPTH': 1, // Harder to craft in winter
      'IMBOLC': 0,
      'BELTANE': -1, // Easier to craft in spring
      'LUGHNASADH': -1 // Easier to craft in harvest season
    };
    
    return seasonalModifiers[season] || 0;
  }
  
  /**
   * Get recipe suggestions based on available resources
   * @returns Array of craftable item IDs
   */
  getRecipeSuggestions(): string[] {
    const cardStore = useCardStore();
    const craftableItems = cardStore.getAllCraftedItemCards();
    
    // Filter to items that can be crafted
    return craftableItems
      .filter(item => this.canCraftItem(item.id).canCraft)
      .map(item => item.id);
  }
  
  /**
   * Get recipe suggestions filtered by complexity tier
   * @param maxComplexity Maximum complexity tier to include
   * @returns Array of craftable item IDs matching the complexity requirement
   */
  getRecipeSuggestionsByComplexity(maxComplexity: number): string[] {
    const cardStore = useCardStore();
    const craftableItems = cardStore.getAllCraftedItemCards();
    
    // Filter to items that can be crafted and match complexity
    return craftableItems
      .filter(item => {
        const complexityValue = getComplexityValue(item.complexity);
        return complexityValue <= maxComplexity && this.canCraftItem(item.id).canCraft;
      })
      .map(item => item.id);
  }
  
  /**
   * Get detailed crafting requirements and restrictions for an item
   * @param itemId The ID of the item to check
   * @returns Detailed crafting requirements object
   */
  getCraftingRequirements(itemId: string): {
    item: any,
    requiredResources: string[],
    missingResources: string[],
    landscapeSupported: boolean,
    playerSkill: boolean,
    difficulty: number,
    locationBonus: number,
    seasonalModifier: number
  } | null {
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    const item = cardStore.getCraftedItemById(itemId);
    if (!item) {
      return null;
    }
    
    const { missingResources, landscapeSupported, playerSkill } = this.canCraftItem(itemId);
    const difficulty = this.calculateCraftingDifficulty(itemId);
    const locationBonus = this.getLocationCraftingBonus(itemId, gameStore.currentLandscapeId);
    const seasonalModifier = this.getSeasonalCraftingModifier(gameStore.currentSeason);
    
    return {
      item,
      requiredResources: item.requiredResources,
      missingResources,
      landscapeSupported,
      playerSkill,
      difficulty,
      locationBonus,
      seasonalModifier
    };
  }
  
  /**
   * Apply effects when an item is crafted
   * @param itemId The ID of the crafted item
   */
  private applyCraftingEffects(itemId: string): void {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    
    const item = cardStore.getCraftedItemById(itemId);
    if (!item || !item.ability || typeof item.ability !== 'object' || !item.ability.effect) {
      return;
    }
    
    // Apply item ability effect
    // This would typically be a function call
    console.log(`Applying crafting effect for ${item.name}`);
    
    // If item has a drawback, apply it
    if (item.drawback && typeof item.drawback === 'object' && item.drawback.effect) {
      console.log(`Applying drawback for ${item.name}`);
    }
  }
  
  /**
   * Check if crafting this item satisfies any victory conditions
   */
  private checkCraftingVictoryConditions(): void {
    const playerStore = usePlayerStore();
    
    // Example: Check if player has crafted a legendary item
    const cardStore = useCardStore();
    const hasLegendaryItem = playerStore.craftedItems.some(itemId => {
      const item = cardStore.getCraftedItemById(itemId);
      return item && item.isLegendary;
    });
    
    if (hasLegendaryItem) {
      playerStore.hasCraftedLegendaryItem = true;
    }
    
    // Check for number of unique crafted items
    const uniqueItemTypes = new Set(
      playerStore.craftedItems.map(itemId => {
        const item = cardStore.getCraftedItemById(itemId);
        return item ? item.type : null;
      }).filter(Boolean)
    );
    
    playerStore.uniqueCraftedItemsCount = uniqueItemTypes.size;
  }
}

export const craftingService = new CraftingService();
