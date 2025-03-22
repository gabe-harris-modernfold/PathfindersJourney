/**
 * Mental Challenge Strategy
 * Implements strategy for mental challenges
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
 * Strategy for handling mental challenges
 */
export class MentalChallengeStrategy implements ChallengeStrategy {
  /**
   * Calculate difficulty of a mental challenge
   * @param challenge The mental challenge
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number {
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    const baseDifficulty = challenge.difficulty;
    
    // Get seasonal modifiers for mental challenges
    let seasonalModifier = 0;
    
    // Different seasons have different effects on mental challenges
    switch (seasonStore.currentSeason) {
      case Season.IMBOLC:
        // Imbolc - time of inspiration - mental challenges easier
        seasonalModifier = -1;
        break;
      case Season.SAMHAIN:
        // Thin veil between worlds makes mental challenges more difficult
        seasonalModifier = 1;
        break;
      // Other seasons have no specific effect on mental challenges
    }
    
    // Apply threat level modifier
    const threatModifier = challengeStore.threatLevel;
    
    return baseDifficulty + seasonalModifier + threatModifier;
  }
  
  /**
   * Calculate player's bonus for a mental challenge
   * @param challenge The mental challenge
   * @returns The calculated player bonus
   */
  calculatePlayerBonus(challenge: Challenge): number {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    
    // Character ability bonus
    const character = cardStore.getCharacterById(playerStore.characterId);
    let bonus = (character?.challengeBonuses?.mental || 0);
    
    // Item bonuses - only count items that provide mental challenge bonuses
    for (const itemId of playerStore.craftedItems) {
      const item = cardStore.getCraftedItemById(itemId);
      if (item?.challengeBonuses?.mental) {
        bonus += item.challengeBonuses.mental;
      }
    }
    
    // Companion bonuses - only count companions that help with mental challenges
    for (const companionId of playerStore.animalCompanions) {
      const companion = cardStore.getCompanionById(companionId);
      if (companion?.challengeBonuses?.mental) {
        bonus += companion.challengeBonuses.mental;
        
        // Apply seasonal companion bonuses if applicable
        if (companion.seasonalBonuses?.[seasonStore.currentSeason]?.mental) {
          bonus += companion.seasonalBonuses[seasonStore.currentSeason].mental;
        }
      }
    }
    
    // Blessing tokens
    bonus += challengeStore.blessingTokens;
    
    return bonus;
  }
  
  /**
   * Apply specific effects for mental challenges
   * @param outcome The challenge outcome
   * @param challenge The mental challenge that was attempted
   */
  applyOutcomeEffects(outcome: ChallengeOutcome, challenge: Challenge): void {
    const logStore = useLogStore();
    const playerStore = usePlayerStore();
    
    // Common outcome handling
    if (outcome.success === true) {
      // Handle mental success - may gain insight
      if (challenge.resourceReward) {
        // Mental challenges yield insight which can be used to gain experience
        playerStore.addExperience(1);
        logStore.addToGameLog('Your keen insight has led to greater understanding. You gain 1 experience point.');
      }
      
      if (outcome.exceptional) {
        // Exceptional mental success - might reveal hidden information
        logStore.addToGameLog('Your exceptional mental prowess has revealed a deeper understanding!');
        playerStore.addExperience(1);
      }
    } else if (outcome.success === 'partial') {
      // Partial success - might gain a little insight
      if (challenge.resourceReward) {
        // Some small benefit
        logStore.addToGameLog('You gain a partial understanding from this challenge.');
      }
    } else {
      // Failure
      if (outcome.exceptional) {
        // Exceptional mental failure might cause temporary mental fatigue
        logStore.addToGameLog('Your exceptional failure leaves your mind clouded and confused.');
      }
    }
  }
}
