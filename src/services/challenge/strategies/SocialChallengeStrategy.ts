/**
 * Social Challenge Strategy
 * Implements strategy for social challenges
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
 * Strategy for handling social challenges
 */
export class SocialChallengeStrategy implements ChallengeStrategy {
  /**
   * Calculate difficulty of a social challenge
   * @param challenge The social challenge
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number {
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    const baseDifficulty = challenge.difficulty;
    
    // Get seasonal modifiers for social challenges
    let seasonalModifier = 0;
    
    // Different seasons have different effects on social challenges
    switch (seasonStore.currentSeason) {
      case Season.BELTANE:
        // Beltane - time of community and celebration - social challenges easier
        seasonalModifier = -1;
        break;
      case Season.WINTERS_DEPTH:
        // Winter - isolation makes social challenges harder
        seasonalModifier = 1;
        break;
      // Other seasons have no specific effect on social challenges
    }
    
    // Apply threat level modifier
    const threatModifier = challengeStore.threatLevel;
    
    return baseDifficulty + seasonalModifier + threatModifier;
  }
  
  /**
   * Calculate player's bonus for a social challenge
   * @param challenge The social challenge
   * @returns The calculated player bonus
   */
  calculatePlayerBonus(challenge: Challenge): number {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    
    // Character ability bonus
    const character = cardStore.getCharacterById(playerStore.characterId);
    let bonus = (character?.challengeBonuses?.social || 0);
    
    // Item bonuses - only count items that provide social challenge bonuses
    for (const itemId of playerStore.craftedItems) {
      const item = cardStore.getCraftedItemById(itemId);
      if (item?.challengeBonuses?.social) {
        bonus += item.challengeBonuses.social;
      }
    }
    
    // Companion bonuses - only count companions that help with social challenges
    for (const companionId of playerStore.animalCompanions) {
      const companion = cardStore.getCompanionById(companionId);
      if (companion?.challengeBonuses?.social) {
        bonus += companion.challengeBonuses.social;
        
        // Apply seasonal companion bonuses if applicable
        if (companion.seasonalBonuses?.[seasonStore.currentSeason]?.social) {
          bonus += companion.seasonalBonuses[seasonStore.currentSeason].social;
        }
      }
    }
    
    // Blessing tokens
    bonus += challengeStore.blessingTokens;
    
    return bonus;
  }
  
  /**
   * Apply specific effects for social challenges
   * @param outcome The challenge outcome
   * @param challenge The social challenge that was attempted
   */
  applyOutcomeEffects(outcome: ChallengeOutcome, challenge: Challenge): void {
    const logStore = useLogStore();
    const playerStore = usePlayerStore();
    
    // Common outcome handling
    if (outcome.success === true) {
      // Handle social success - may lead to allies or community support
      if (challenge.resourceReward) {
        // Social challenges might yield community resources or allies
        this._collectSocialResources(2);
      }
      
      if (outcome.exceptional) {
        // Exceptional social success - might gain a special ally or information
        logStore.addToGameLog('Your exceptional social skills have earned you a valuable friendship!');
      }
    } else if (outcome.success === 'partial') {
      // Partial success
      if (challenge.resourceReward) {
        this._collectSocialResources(1);
      }
    } else {
      // Failure
      if (outcome.exceptional) {
        // Exceptional social failure might damage reputation
        logStore.addToGameLog('Your exceptional failure has damaged your standing with the local community.');
      }
    }
  }
  
  /**
   * Collect resources from social challenge
   * @param count Number of resources to collect
   */
  private _collectSocialResources(count: number): void {
    const playerStore = usePlayerStore();
    const logStore = useLogStore();
    
    // Social challenges might yield favors or special items from locals
    for (let i = 0; i < count; i++) {
      playerStore.addResource('herbs');
    }
    
    logStore.addToGameLog(`Your social connections helped you gather ${count} herbs from locals.`);
  }
}
