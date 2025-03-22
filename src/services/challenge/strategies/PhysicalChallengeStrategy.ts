/**
 * Physical Challenge Strategy
 * Implements strategy for physical challenges
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useChallenge } from '@/stores/challengeStore';
import { useSeasonStore } from '@/stores/seasonStore';
import { useLogStore } from '@/stores/logStore';
import { Challenge, ChallengeOutcome } from '@/models/types/game';
import { ChallengeType } from '@/models/enums/cardTypes';
import { ChallengeStrategy } from '../ChallengeStrategy';
import { Season } from '@/models/enums/seasons';

/**
 * Strategy for handling physical challenges
 */
export class PhysicalChallengeStrategy implements ChallengeStrategy {
  /**
   * Calculate difficulty of a physical challenge
   * @param challenge The physical challenge
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number {
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    const baseDifficulty = challenge.difficulty;
    
    // Get seasonal modifiers for physical challenges
    let seasonalModifier = 0;
    
    // Different seasons have different effects on physical challenges
    switch (seasonStore.currentSeason) {
      case Season.WINTERS_DEPTH:
        // Winter makes physical challenges harder
        seasonalModifier = 1;
        break;
      case Season.LUGHNASADH:
        // Harvest season - physical challenges easier
        seasonalModifier = -1;
        break;
      // Other seasons have no specific effect on physical challenges
    }
    
    // Apply threat level modifier
    const threatModifier = challengeStore.threatLevel;
    
    return baseDifficulty + seasonalModifier + threatModifier;
  }
  
  /**
   * Calculate player's bonus for a physical challenge
   * @param challenge The physical challenge
   * @returns The calculated player bonus
   */
  calculatePlayerBonus(challenge: Challenge): number {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    
    // Character ability bonus
    const character = cardStore.getCharacterById(playerStore.characterId);
    let bonus = (character?.challengeBonuses?.physical || 0);
    
    // Item bonuses - only count items that provide physical challenge bonuses
    for (const itemId of playerStore.craftedItems) {
      const item = cardStore.getCraftedItemById(itemId);
      if (item?.challengeBonuses?.physical) {
        bonus += item.challengeBonuses.physical;
      }
    }
    
    // Companion bonuses - only count companions that help with physical challenges
    for (const companionId of playerStore.animalCompanions) {
      const companion = cardStore.getCompanionById(companionId);
      if (companion?.challengeBonuses?.physical) {
        bonus += companion.challengeBonuses.physical;
        
        // Apply seasonal companion bonuses if applicable
        if (companion.seasonalBonuses?.[seasonStore.currentSeason]?.physical) {
          bonus += companion.seasonalBonuses[seasonStore.currentSeason].physical;
        }
      }
    }
    
    // Blessing tokens
    bonus += challengeStore.blessingTokens;
    
    return bonus;
  }
  
  /**
   * Apply specific effects for physical challenges
   * @param outcome The challenge outcome
   * @param challenge The physical challenge that was attempted
   */
  applyOutcomeEffects(outcome: ChallengeOutcome, challenge: Challenge): void {
    const logStore = useLogStore();
    const playerStore = usePlayerStore();
    const challengeStore = useChallenge();
    
    // Common outcome handling
    if (outcome.success === true) {
      // Handle physical success - may have specific physical rewards
      if (challenge.resourceReward) {
        // Physical challenges might yield more raw materials
        this._collectPhysicalResources(2);
      }
      
      if (outcome.exceptional) {
        // Exceptional physical success - gain a strength token
        logStore.addToGameLog('You gained 1 strength token from your exceptional physical prowess!');
      }
    } else if (outcome.success === 'partial') {
      // Partial success
      if (challenge.resourceReward) {
        this._collectPhysicalResources(1);
      }
    } else {
      // Failure handling
      if (outcome.exceptional) {
        // Exceptional physical failure might cause injury
        logStore.addToGameLog('Your exceptional failure has left you weakened.');
      }
    }
  }
  
  /**
   * Collect resources from physical challenge
   * @param count Number of resources to collect
   */
  private _collectPhysicalResources(count: number): void {
    const playerStore = usePlayerStore();
    const logStore = useLogStore();
    
    // Physical challenges might yield specific types of resources
    for (let i = 0; i < Math.ceil(count / 2); i++) {
      playerStore.addResource('wood');
    }
    
    for (let i = 0; i < Math.floor(count / 2); i++) {
      playerStore.addResource('stone');
    }
    
    logStore.addToGameLog(`Collected ${count} physical resources (wood and stone).`);
  }
}
