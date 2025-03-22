/**
 * Spiritual Challenge Strategy
 * Implements strategy for spiritual challenges
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
 * Strategy for handling spiritual challenges
 */
export class SpiritualChallengeStrategy implements ChallengeStrategy {
  /**
   * Calculate difficulty of a spiritual challenge
   * @param challenge The spiritual challenge
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number {
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    const baseDifficulty = challenge.difficulty;
    
    // Get seasonal modifiers for spiritual challenges
    let seasonalModifier = 0;
    
    // Different seasons have different effects on spiritual challenges
    switch (seasonStore.currentSeason) {
      case Season.SAMHAIN:
        // Samhain - veil between worlds is thin - spiritual challenges easier
        seasonalModifier = -1;
        break;
      case Season.BELTANE:
        // Beltane - time of life and growth, not introspection - spiritual challenges harder
        seasonalModifier = 1;
        break;
      // Other seasons have no specific effect on spiritual challenges
    }
    
    // Apply threat level modifier
    const threatModifier = challengeStore.threatLevel;
    
    return baseDifficulty + seasonalModifier + threatModifier;
  }
  
  /**
   * Calculate player's bonus for a spiritual challenge
   * @param challenge The spiritual challenge
   * @returns The calculated player bonus
   */
  calculatePlayerBonus(challenge: Challenge): number {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    const seasonStore = useSeasonStore();
    const challengeStore = useChallenge();
    
    // Character ability bonus
    const character = cardStore.getCharacterById(playerStore.characterId);
    let bonus = (character?.challengeBonuses?.spiritual || 0);
    
    // Item bonuses - only count items that provide spiritual challenge bonuses
    for (const itemId of playerStore.craftedItems) {
      const item = cardStore.getCraftedItemById(itemId);
      if (item?.challengeBonuses?.spiritual) {
        bonus += item.challengeBonuses.spiritual;
      }
    }
    
    // Companion bonuses - only count companions that help with spiritual challenges
    for (const companionId of playerStore.animalCompanions) {
      const companion = cardStore.getCompanionById(companionId);
      if (companion?.challengeBonuses?.spiritual) {
        bonus += companion.challengeBonuses.spiritual;
        
        // Apply seasonal companion bonuses if applicable
        if (companion.seasonalBonuses?.[seasonStore.currentSeason]?.spiritual) {
          bonus += companion.seasonalBonuses[seasonStore.currentSeason].spiritual;
        }
      }
    }
    
    // Blessing tokens
    bonus += challengeStore.blessingTokens;
    
    return bonus;
  }
  
  /**
   * Apply specific effects for spiritual challenges
   * @param outcome The challenge outcome
   * @param challenge The spiritual challenge that was attempted
   */
  applyOutcomeEffects(outcome: ChallengeOutcome, challenge: Challenge): void {
    const logStore = useLogStore();
    const challengeStore = useChallenge();
    
    // Common outcome handling
    if (outcome.success === true) {
      // Handle spiritual success
      if (challenge.resourceReward) {
        // Spiritual challenges might reduce threat by connecting with nature
        const threatReduction = 1;
        challengeStore.removeThreatTokens(threatReduction);
        logStore.addToGameLog(`Your spiritual connection with nature reduces threat by ${threatReduction}.`);
      }
      
      if (outcome.exceptional) {
        // Exceptional spiritual success - might gain blessing token
        logStore.addToGameLog('Your exceptional spiritual connection has blessed your journey!');
      }
    } else if (outcome.success === 'partial') {
      // Partial success
      if (challenge.resourceReward) {
        logStore.addToGameLog('Your spiritual connection is maintained, but yields no additional benefits.');
      }
    } else {
      // Failure
      if (outcome.exceptional) {
        // Exceptional spiritual failure might increase threat
        challengeStore.addThreatTokens(1);
        logStore.addToGameLog('Your exceptional failure has disturbed the spiritual balance, increasing threat.');
      }
    }
  }
}
