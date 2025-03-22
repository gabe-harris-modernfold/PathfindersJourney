import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { TempEffect } from '@/models/types/game';
import { PlayerEffect } from '@/models/types/player';
import { Season } from '@/models/enums/seasons';
import { ExtendedGameStore, ExtendedPlayerStore } from '@/types/store-extensions';

// Threat manifestation types
export enum ThreatManifestationType {
  RESOURCE_LOSS = 'RESOURCE_LOSS',
  HEALTH_LOSS = 'HEALTH_LOSS',
  CHALLENGE_DIFFICULTY = 'CHALLENGE_DIFFICULTY',
  COMPANION_EFFECT = 'COMPANION_EFFECT',
  LANDSCAPE_EFFECT = 'LANDSCAPE_EFFECT',
  SEASONAL_SHIFT = 'SEASONAL_SHIFT'
}

// Threat event types
export enum ThreatEventType {
  MINOR = 'MINOR',
  MODERATE = 'MODERATE',
  MAJOR = 'MAJOR'
}

// Otherworldly manifestation types - Aligned with game requirements
export enum OtherworldlyManifestationType {
  MIST_WRAITH = 'MIST_WRAITH',
  BARROW_WIGHT = 'BARROW_WIGHT',
  FAERIE_ENTICEMENT = 'FAERIE_ENTICEMENT',
  WILD_HUNT = 'WILD_HUNT',
  ANCIENT_GUARDIAN = 'ANCIENT_GUARDIAN',
  BOUNDARY_COLLAPSE = 'BOUNDARY_COLLAPSE',
  SPIRIT_POSSESSION = 'SPIRIT_POSSESSION',
  COSMIC_IMBALANCE = 'COSMIC_IMBALANCE'
}

// Interface for threat events
export interface ThreatEvent {
  id: string;
  name: string;
  description: string;
  type: ThreatEventType;
  manifestation: ThreatManifestationType;
  strength: number;
  duration: number;
}

/**
 * Service for managing threat tokens and their effects in the game
 */
export class ThreatService {
  private gameStore = useGameStore() as unknown as ExtendedGameStore;
  private playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
  private cardStore = useCardStore();
  
  // Track threat reduction per turn
  private threatReductionThisTurn = 0;
  
  // Maximum threat reduction allowed per turn
  private readonly MAX_THREAT_REDUCTION_PER_TURN = 3;
  
  // Sacred sites for threat reduction
  private readonly SACRED_SITES = {
    MOONLIT_LOCH: 'moonlit_loch',
    DRUIDS_SANCTUARY: 'druids_sanctuary'
  };
  
  // Resources that can affect threat
  private readonly THREAT_RESOURCES = {
    SACRED_WATER: 'sacred_water',
    ROWAN_WOOD: 'rowan_wood'
  };
  
  // Track if seasonal ritual has been performed
  private hasPerformedSeasonalRitual = false;
  
  // Predefined threat events
  private threatEvents: ThreatEvent[] = [
    // Minor threat events
    {
      id: 'threat_event_1',
      name: 'Unsettling Whispers',
      description: 'Strange whispers echo through the landscape, causing unease.',
      type: ThreatEventType.MINOR,
      manifestation: ThreatManifestationType.CHALLENGE_DIFFICULTY,
      strength: 1,
      duration: 2
    },
    {
      id: 'threat_event_2',
      name: 'Sudden Chill',
      description: 'A bone-deep chill sets in, making it harder to perform tasks.',
      type: ThreatEventType.MINOR,
      manifestation: ThreatManifestationType.HEALTH_LOSS,
      strength: 1,
      duration: 1
    },
    {
      id: 'threat_event_3',
      name: 'Misplaced Supplies',
      description: 'Some of your resources have mysteriously gone missing.',
      type: ThreatEventType.MINOR,
      manifestation: ThreatManifestationType.RESOURCE_LOSS,
      strength: 1,
      duration: 1
    },
    
    // Moderate threat events
    {
      id: 'threat_event_4',
      name: 'Otherworldly Fog',
      description: 'A thick, unnatural fog descends, obscuring paths and hiding dangers.',
      type: ThreatEventType.MODERATE,
      manifestation: ThreatManifestationType.LANDSCAPE_EFFECT,
      strength: 2,
      duration: 3
    },
    {
      id: 'threat_event_5',
      name: 'Animal Unrest',
      description: 'Animals in the area become agitated and difficult to approach.',
      type: ThreatEventType.MODERATE,
      manifestation: ThreatManifestationType.COMPANION_EFFECT,
      strength: 2,
      duration: 2
    },
    {
      id: 'threat_event_6',
      name: 'Weakening Boundaries',
      description: 'The veil between worlds thins, allowing strange energies to seep through.',
      type: ThreatEventType.MODERATE,
      manifestation: ThreatManifestationType.CHALLENGE_DIFFICULTY,
      strength: 2,
      duration: 3
    },
    
    // Major threat events
    {
      id: 'threat_event_7',
      name: 'Seasonal Disruption',
      description: 'The natural cycle of seasons is disrupted, causing environmental chaos.',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.SEASONAL_SHIFT,
      strength: 3,
      duration: 4
    },
    {
      id: 'threat_event_8',
      name: 'Otherworldly Manifestation',
      description: 'A powerful entity from beyond manifests, draining life force from all it encounters.',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.HEALTH_LOSS,
      strength: 3,
      duration: 3
    },
    {
      id: 'threat_event_9',
      name: 'Resource Blight',
      description: 'A mysterious blight affects resources in the area, causing them to wither or spoil.',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.RESOURCE_LOSS,
      strength: 3,
      duration: 4
    }
  ];
  
  // Predefined otherworldly manifestations - Aligned with game requirements
  private otherworldlyManifestations: (ThreatEvent & {
    counterResource?: string;
    requiresChallenge?: boolean;
    challengeType?: string;
    requiresOffering?: boolean;
  })[] = [
    {
      id: 'manifestation_1',
      name: 'Mist Wraith',
      description: 'Obscures path, requires Amber Shards to banish',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.LANDSCAPE_EFFECT,
      strength: 2,
      duration: 3,
      counterResource: 'amber_shards'
    },
    {
      id: 'manifestation_2',
      name: 'Barrow Wight',
      description: 'Drains health each turn, must outrun or confront',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.HEALTH_LOSS,
      strength: 2,
      duration: 3,
      requiresChallenge: true
    },
    {
      id: 'manifestation_3',
      name: 'Faerie Enticement',
      description: 'Attempts to lead you astray, requires willpower challenge',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.CHALLENGE_DIFFICULTY,
      strength: 2,
      duration: 2,
      challengeType: 'mental'
    },
    {
      id: 'manifestation_4',
      name: 'Wild Hunt',
      description: 'Pursues you for 1d4 turns, must hide or join the hunt',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.CHALLENGE_DIFFICULTY,
      strength: 3,
      duration: Math.floor(Math.random() * 4) + 1, // 1d4 turns
      challengeType: 'physical'
    },
    {
      id: 'manifestation_5',
      name: 'Ancient Guardian',
      description: 'Blocks path, requires specific offering or riddling',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.LANDSCAPE_EFFECT,
      strength: 3,
      duration: 2,
      requiresOffering: true
    },
    {
      id: 'manifestation_6',
      name: 'Boundary Collapse',
      description: 'Seasons blur, unpredictable effects each turn',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.SEASONAL_SHIFT,
      strength: 3,
      duration: 4
    },
    {
      id: 'manifestation_7',
      name: 'Spirit Possession',
      description: 'Animal Companion turns against you',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.COMPANION_EFFECT,
      strength: 3,
      duration: 3
    },
    {
      id: 'manifestation_8',
      name: 'Cosmic Imbalance',
      description: 'All challenges +2 difficulty until balance restored',
      type: ThreatEventType.MAJOR,
      manifestation: ThreatManifestationType.CHALLENGE_DIFFICULTY,
      strength: 2,
      duration: 4
    }
  ];
  
  /**
   * Add threat tokens to the game state
   * @param amount Number of threat tokens to add
   * @returns Current number of threat tokens
   */
  public addThreatTokens(amount: number): number {
    return this.gameStore.addThreatTokens(amount);
  }
  
  /**
   * Remove threat tokens from the game state
   * @param amount Number of threat tokens to remove
   * @returns Current number of threat tokens
   */
  public removeThreatTokens(amount: number): number {
    // Enforce maximum threat reduction per turn
    const remainingReduction = this.MAX_THREAT_REDUCTION_PER_TURN - this.threatReductionThisTurn;
    if (remainingReduction <= 0) {
      this.gameStore.addToGameLog('Maximum threat reduction reached for this turn.', true);
      return this.gameStore.threatTokens;
    }
    
    // Adjust amount if it would exceed the maximum
    const actualAmount = Math.min(amount, remainingReduction);
    
    // Update the reduction tracker
    this.threatReductionThisTurn += actualAmount;
    
    // Log the reduction
    if (actualAmount < amount) {
      this.gameStore.addToGameLog(`Reduced ${actualAmount} threat tokens (limit reached for this turn).`, true);
    }
    
    return this.gameStore.removeThreatTokens(actualAmount);
  }
  
  /**
   * Reset the threat reduction tracker for a new turn
   */
  public resetThreatReductionTracker(): void {
    this.threatReductionThisTurn = 0;
  }
  
  /**
   * Get the current threat level (1 level per 3 tokens)
   * @returns Current threat level
   */
  public getThreatLevel(): number {
    return Math.floor(this.gameStore.threatTokens / 3);
  }
  
  /**
   * Check if the player has an effect that prevents threat
   * @returns True if player has threat prevention effect
   */
  public hasThreatPrevention(): boolean {
    return this.playerStore.hasEffect('threat_prevention');
  }
  
  /**
   * Generate a random threat event based on current threat level
   * @returns A random threat event
   */
  public generateRandomThreatEvent(): ThreatEvent | null {
    const threatLevel = this.getThreatLevel();
    
    // No events if threat level is 0
    if (threatLevel === 0) {
      return null;
    }
    
    // Filter events based on threat level
    let eligibleEvents: ThreatEvent[] = [];
    
    if (threatLevel === 1) {
      eligibleEvents = this.threatEvents.filter(event => event.type === ThreatEventType.MINOR);
    } else if (threatLevel === 2) {
      eligibleEvents = this.threatEvents.filter(event => 
        event.type === ThreatEventType.MINOR || event.type === ThreatEventType.MODERATE
      );
    } else {
      // All events are eligible at threat level 3+
      eligibleEvents = this.threatEvents;
    }
    
    // Return random event from eligible events
    if (eligibleEvents.length > 0) {
      const randomIndex = Math.floor(Math.random() * eligibleEvents.length);
      return eligibleEvents[randomIndex];
    }
    
    return null;
  }
  
  /**
   * Apply a threat event to the game state
   * @param event The threat event to apply
   */
  public applyThreatEvent(event: ThreatEvent): void {
    // Skip if player has threat prevention
    if (this.hasThreatPrevention()) {
      this.gameStore.addToGameLog(`${event.name} was prevented by your protective effects!`, true);
      return;
    }
    
    // Add effect to game state
    this.gameStore.addToGameLog(`Threat manifests: ${event.name} - ${event.description}`, true);
    
    // Apply immediate effects based on manifestation type
    switch (event.manifestation) {
      case ThreatManifestationType.HEALTH_LOSS:
        this.playerStore.takeDamage(event.strength);
        this.gameStore.addToGameLog(`You lose ${event.strength} health from the threat.`);
        break;
        
      case ThreatManifestationType.RESOURCE_LOSS:
        this.playerStore.loseRandomResources(event.strength);
        this.gameStore.addToGameLog(`You lose ${event.strength} random resources from the threat.`);
        break;
        
      case ThreatManifestationType.CHALLENGE_DIFFICULTY:
        // Add temporary effect to increase challenge difficulty
        this.gameStore.addTempEffect(
          'threat_challenge_difficulty',
          'Increased Challenge Difficulty',
          `Challenges are ${event.strength} points more difficult due to threat.`,
          event.strength,
          event.duration
        );
        break;
        
      case ThreatManifestationType.COMPANION_EFFECT:
        // Add temporary effect to reduce companion effectiveness
        this.gameStore.addTempEffect(
          'threat_companion_effect',
          'Companion Unrest',
          `Animal companions are less effective due to threat.`,
          event.strength,
          event.duration
        );
        break;
        
      case ThreatManifestationType.LANDSCAPE_EFFECT:
        // Add temporary effect to reduce resource gathering
        this.gameStore.addTempEffect(
          'threat_landscape_effect',
          'Landscape Disruption',
          `Resource gathering is reduced due to threat.`,
          event.strength,
          event.duration
        );
        break;
        
      case ThreatManifestationType.SEASONAL_SHIFT:
        // Add temporary effect to disrupt seasonal benefits
        this.gameStore.addTempEffect(
          'threat_seasonal_shift',
          'Seasonal Disruption',
          `Seasonal benefits are reduced due to threat.`,
          event.strength,
          event.duration
        );
        
        // Advance the season if this is a major event
        if (event.type === ThreatEventType.MAJOR) {
          this.gameStore.advanceSeason();
        }
        break;
    }
  }
  
  /**
   * Generate and apply a random threat manifestation based on current threat level
   * @returns The applied threat event, or null if none was applied
   */
  public manifestThreat(): ThreatEvent | null {
    // Check if player has threat prevention
    if (this.hasThreatPrevention()) {
      this.gameStore.addToGameLog('Your protective effects prevented a threat manifestation!', true);
      return null;
    }
    
    // Generate random event
    const event = this.generateRandomThreatEvent();
    
    // Apply the event if one was generated
    if (event) {
      this.applyThreatEvent(event);
      return event;
    }
    
    return null;
  }
  
  /**
   * Check if a threat manifestation should occur based on current threat level
   * Higher threat levels have higher chance of manifestation
   * @returns True if a manifestation should occur
   */
  public shouldManifestThreat(): boolean {
    const threatLevel = this.getThreatLevel();
    
    // No manifestations at threat level 0
    if (threatLevel === 0) {
      return false;
    }
    
    // Probability increases with threat level
    const manifestationChance = threatLevel * 0.15; // 15% per threat level
    return Math.random() < manifestationChance;
  }
  
  /**
   * Add a threat prevention effect to the player
   * @param duration Duration of the effect in turns
   * @param strength Strength of the effect (higher values prevent stronger threats)
   */
  public addThreatPreventionEffect(duration: number, strength: number = 1): void {
    const effect: PlayerEffect = {
      id: 'threat_prevention',
      name: 'Threat Prevention',
      description: 'Prevents threat manifestations from affecting you.',
      magnitude: strength,
      duration,
      type: 'protection',
      target: 'player'
    };
    
    this.playerStore.addEffect(effect);
    this.gameStore.addToGameLog(`You are now protected from threats for ${duration} turns.`, true);
  }
  
  /**
   * Process threat-related effects at the end of a turn
   * This includes checking for new manifestations and updating existing effects
   */
  public processThreatEffects(): void {
    // Reset threat reduction tracker for the new turn
    this.resetThreatReductionTracker();
    
    // Check if a new threat should manifest
    if (this.shouldManifestThreat()) {
      this.manifestThreat();
    }
    
    // Roll for otherworldly manifestation if threat is high
    if (this.gameStore.threatTokens >= 10) {
      this.rollForOtherworldlyManifestation();
    }
    
    // Process existing effects (already handled by game and player stores)
  }
  
  /**
   * Use a sacred site to reduce threat
   * @param landscapeId ID of the current landscape
   * @returns Number of threat tokens removed, or 0 if not a sacred site
   */
  public useSacredSiteForThreatReduction(landscapeId: string): number {
    if (landscapeId === this.SACRED_SITES.MOONLIT_LOCH) {
      // Moonlit Loch: Remove 1-3 tokens through purification ritual
      const reduction = Math.floor(Math.random() * 3) + 1; // 1-3 tokens
      this.gameStore.addToGameLog(`You performed a purification ritual at the Moonlit Loch, reducing threat by ${reduction}.`, true);
      return this.removeThreatTokens(reduction);
    } 
    else if (landscapeId === this.SACRED_SITES.DRUIDS_SANCTUARY) {
      // Druid's Sanctuary: Remove 2 tokens through meditation
      this.gameStore.addToGameLog('You meditated at the Druid\'s Sanctuary, reducing threat by 2.', true);
      return this.removeThreatTokens(2);
    }
    
    return 0;
  }
  
  /**
   * Use a resource to reduce or prevent threat
   * @param resourceId ID of the resource to use
   * @returns True if the resource was used successfully for threat reduction
   */
  public useResourceForThreatReduction(resourceId: string): boolean {
    const playerStore = usePlayerStore();
    
    if (resourceId === this.THREAT_RESOURCES.SACRED_WATER) {
      // Sacred Water: Remove 1 token when used
      if (this.removeThreatTokens(1) > 0) {
        playerStore.removeResource(resourceId);
        this.gameStore.addToGameLog('You used Sacred Water to purify and reduce threat by 1.', true);
        return true;
      }
    } 
    else if (resourceId === this.THREAT_RESOURCES.ROWAN_WOOD) {
      // Rowan Wood: Prevent 1 token accumulation when used
      playerStore.removeResource(resourceId);
      
      // Add a temporary effect to prevent the next threat token accumulation
      this.gameStore.addTempEffect(
        'threat_prevention_rowan',
        'Rowan Protection',
        'Protected from threat accumulation by Rowan Wood.',
        1,
        1
      );
      
      this.gameStore.addToGameLog('You used Rowan Wood to ward against the next threat accumulation.', true);
      return true;
    }
    
    return false;
  }
  
  /**
   * Perform a seasonal purification ritual
   * @returns Number of threat tokens removed
   */
  public performSeasonalPurificationRitual(): number {
    const gameStore = this.gameStore;
    const currentSeason = gameStore.currentSeason;
    
    // Check if ritual already performed this season
    if (this.hasPerformedSeasonalRitual) {
      gameStore.addToGameLog('You have already performed a purification ritual this season.', true);
      return 0;
    }
    
    // Different ritual effectiveness based on season
    let reduction = 1;
    let ritualName = '';
    
    switch (currentSeason) {
      case Season.IMBOLC:
        ritualName = 'Imbolc Purification';
        reduction = 3;
        break;
      case Season.BELTANE:
        ritualName = 'Spring Renewal Ritual';
        reduction = 2;
        break;
      case Season.LUGHNASADH:
        ritualName = 'Summer Solstice Ceremony';
        reduction = 3;
        break;
      case Season.SAMHAIN:
        ritualName = 'Autumn Harvest Offering';
        reduction = 2;
        break;
      case Season.WINTERS_DEPTH:
        ritualName = 'Winter Solstice Vigil';
        reduction = 1;
        break;
    }
    
    // Mark ritual as performed this season
    this.hasPerformedSeasonalRitual = true;
    
    gameStore.addToGameLog(`You performed the ${ritualName}, reducing threat by ${reduction}.`, true);
    return this.removeThreatTokens(reduction);
  }
  
  /**
   * Reset the seasonal ritual tracker when season changes
   */
  public resetSeasonalRitualTracker(): void {
    this.hasPerformedSeasonalRitual = false;
  }
  
  /** 
   * Roll for an otherworldly manifestation (when threat is high)
   * @returns The manifestation that occurred, or null if none
   */
  public rollForOtherworldlyManifestation(): any {
    if (this.gameStore.threatTokens < 10) {
      return null;
    }
    
    // Roll 1d8 for manifestation type
    const roll = Math.floor(Math.random() * 8) + 1;
    const manifestation = this.otherworldlyManifestations[roll - 1];
    
    this.gameStore.addToGameLog(`Otherworldly Manifestation: ${manifestation.name} - ${manifestation.description}`, true);
    
    // Apply the manifestation effects
    this.applyThreatEvent(manifestation);
    
    return manifestation;
  }
  
  /**
   * Check if the current landscape is a sacred site for threat reduction
   * @param landscapeId ID of the landscape to check
   * @returns True if the landscape is a sacred site
   */
  public isSacredSite(landscapeId: string): boolean {
    return landscapeId === this.SACRED_SITES.MOONLIT_LOCH || 
           landscapeId === this.SACRED_SITES.DRUIDS_SANCTUARY;
  }
  
  /**
   * Check if a resource can be used for threat reduction
   * @param resourceId ID of the resource to check
   * @returns True if the resource can reduce threat
   */
  public isResourceUsefulForThreat(resourceId: string): boolean {
    return resourceId === this.THREAT_RESOURCES.SACRED_WATER || 
           resourceId === this.THREAT_RESOURCES.ROWAN_WOOD;
  }
  
  /**
   * Get threat accumulation for crafting a powerful item
   * @param itemId ID of the crafted item
   * @returns Number of threat tokens to add (0 if none)
   */
  public getThreatForCraftedItem(itemId: string): number {
    const item = this.cardStore.getCraftedItemById(itemId);
    
    if (!item) return 0;
    
    // Default threat costs based on complexity
    if (item.complexity) {
      const complexityValue = typeof item.complexity === 'number' 
        ? item.complexity 
        : this.getComplexityValue(item.complexity);
        
      // Higher complexity means more threat
      if (complexityValue >= 4) {
        return 3; // LEGENDARY
      } else if (complexityValue >= 3) {
        return 2; // ADVANCED
      } else if (complexityValue >= 2) {
        return 1; // COMPLEX
      }
    }
    
    return 0;
  }
  
  /**
   * Get numeric value for complexity string
   * @param complexity Complexity as string
   * @returns Numeric value
   */
  private getComplexityValue(complexity: string): number {
    switch (complexity) {
      case 'LEGENDARY': return 4;
      case 'ADVANCED': return 3;
      case 'COMPLEX': return 2;
      case 'SIMPLE': 
      default: return 1;
    }
  }
  
  /**
   * Add threat for seasonal crossing
   * @returns Number of threat tokens added
   */
  public addThreatForSeasonalCrossing(): number {
    return this.addThreatTokens(2);
  }
  
  /**
   * Add threat for disrespecting a sacred site
   * @param landscapeId ID of the landscape
   * @param severity How severe the disrespect was (1-3)
   * @returns Number of threat tokens added
   */
  public addThreatForSacredSiteDisrespect(landscapeId: string, severity: number = 1): number {
    // Only add threat if it's a sacred site
    if (this.isSacredSite(landscapeId)) {
      // Ensure severity is within bounds
      const threatAmount = Math.max(1, Math.min(3, severity));
      this.gameStore.addToGameLog(`Your actions have disrespected a sacred site, increasing threat by ${threatAmount}.`, true);
      return this.addThreatTokens(threatAmount);
    }
    
    return 0;
  }
  
  /**
   * Process threat system on season change
   * @param oldSeason Previous season
   * @param newSeason Current season
   */
  public handleSeasonChange(oldSeason: Season, newSeason: Season): void {
    // Reset the seasonal ritual tracker
    this.resetSeasonalRitualTracker();
    
    // Add threat for seasonal crossing if player is unprepared
    const playerStore = this.playerStore;
    
    // Check if player has necessary preparation for the season
    let isPrepared = false;
    
    // Check for seasonal preparation items or effects
    if (newSeason === Season.WINTERS_DEPTH) {
      isPrepared = playerStore.resources.some(r => ['woven_reeds', 'forge_cinders'].includes(r));
    } else if (newSeason === Season.IMBOLC) {
      isPrepared = playerStore.resources.some(r => ['rowan_wood', 'silver_mistletoe'].includes(r));
    } else if (newSeason === Season.BELTANE) {
      isPrepared = playerStore.resources.some(r => ['oak_galls', 'amber_shards'].includes(r));
    } else if (newSeason === Season.LUGHNASADH) {
      isPrepared = playerStore.resources.some(r => ['sacred_water', 'horse_hair'].includes(r));
    } else if (newSeason === Season.SAMHAIN) {
      isPrepared = playerStore.resources.some(r => ['barrow_dust', 'ogham_sticks'].includes(r));
    }
    
    // Add threat if unprepared
    if (!isPrepared) {
      this.addThreatForSeasonalCrossing();
      this.gameStore.addToGameLog(`You were unprepared for the transition to ${newSeason}, increasing threat by 2.`, true);
    } else {
      this.gameStore.addToGameLog(`Your preparations have eased the transition to ${newSeason}.`, true);
    }
  }
  
  /**
   * Process threat system at the end of a turn
   * Handles threat accumulation, manifestations, and other threat-related effects
   */
  public processEndOfTurn(): void {
    // Process threat effects
    this.processThreatEffects();
    
    // Check current landscape for any threat-related effects
    const currentLandscapeId = this.gameStore.currentLandscapeId;
    if (this.isSacredSite(currentLandscapeId)) {
      this.gameStore.addToGameLog(`You are at a sacred site (${currentLandscapeId}). You may perform a ritual to reduce threat.`, false);
    }
    
    // Apply any pending threat effects from crafted items
    // This would be handled elsewhere when crafting occurs
  }
  
  /**
   * Integrate with the resource service to handle resource usage for threat reduction
   * @param resourceId ID of the resource to use
   * @returns True if the resource was used for threat reduction
   */
  public processResourceUse(resourceId: string): boolean {
    if (this.isResourceUsefulForThreat(resourceId)) {
      return this.useResourceForThreatReduction(resourceId);
    }
    return false;
  }
}

// Export singleton instance
export const threatService = new ThreatService();
