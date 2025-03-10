/**
 * Challenge Service
 * Handles challenge difficulty calculation and resolution
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { diceService } from '@/services/diceService';
import { ChallengeOutcome, Challenge } from '@/models/types/game';
import { ChallengeType } from '@/models/enums/cardTypes';

class ChallengeService {
  /**
   * Calculate challenge difficulty based on multiple factors
   * @param challenge The challenge to calculate difficulty for
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number {
    const gameStore = useGameStore();
    const baseDifficulty = challenge.difficulty;
    
    // Apply seasonal modifiers
    const seasonModifier = this.getSeasonalModifier(challenge.type, gameStore.currentSeason);
    
    // Apply threat level modifier
    const threatModifier = Math.floor(gameStore.threatTokens / 3);
    
    return baseDifficulty + seasonModifier + threatModifier;
  }
  
  /**
   * Calculate player's bonus for a challenge
   * @param challenge The challenge to calculate bonus for
   * @returns The calculated player bonus
   */
  calculatePlayerBonus(challenge: Challenge): number {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    // Character ability bonus
    let bonus = this.getCharacterBonus(playerStore.characterId, challenge.type);
    
    // Item bonuses
    bonus += this.getItemBonuses(playerStore.craftedItems, challenge.type);
    
    // Companion bonuses
    bonus += this.getCompanionBonuses(playerStore.animalCompanions, challenge.type);
    
    // Blessing tokens
    const gameStore = useGameStore();
    bonus += gameStore.blessingTokens;
    
    return bonus;
  }
  
  /**
   * Determine challenge outcome
   * @param challenge The challenge to resolve
   * @returns The challenge outcome
   */
  resolveChallenge(challenge: Challenge): ChallengeOutcome {
    const difficulty = this.calculateDifficulty(challenge);
    const playerBonus = this.calculatePlayerBonus(challenge);
    
    const diceRoll = diceService.rollD8();
    const total = diceRoll + playerBonus;
    
    // Record the challenge attempt
    this.recordChallengeAttempt({
      challengeType: challenge.type,
      difficulty,
      diceRoll,
      playerBonus,
      total
    });
    
    // Natural 8 always succeeds
    if (diceRoll === 8) {
      return {
        success: true,
        exceptional: true,
        roll: diceRoll,
        total,
        difficulty
      };
    }
    
    // Success: total >= difficulty
    if (total >= difficulty) {
      return {
        success: true,
        exceptional: total >= difficulty + 2,
        roll: diceRoll,
        total,
        difficulty
      };
    }
    
    // Partial success: total = difficulty - 1
    if (total === difficulty - 1) {
      return {
        success: 'partial',
        exceptional: false,
        roll: diceRoll,
        total,
        difficulty
      };
    }
    
    // Failure
    return {
      success: false,
      exceptional: total <= difficulty - 3,
      roll: diceRoll,
      total,
      difficulty
    };
  }
  
  /**
   * Apply challenge outcomes
   * @param outcome The challenge outcome
   * @param challenge The challenge that was attempted
   */
  applyOutcome(outcome: ChallengeOutcome, challenge: Challenge): void {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    if (outcome.success === true) {
      // Full success
      if (outcome.exceptional) {
        // Exceptional success (e.g., gain blessing token)
        gameStore.blessingTokens++;
      }
      
      // Collect resources if applicable
      if (challenge.resourceReward) {
        this.collectResources(2);
      }
      
      // Apply any specific success effects
      if (challenge.successEffect) {
        // Instead of calling the effect, just log it
        gameStore.addToGameLog(`Success effect: ${challenge.successEffect.description}`, false);
      }
    } else if (outcome.success === 'partial') {
      // Partial success
      if (challenge.resourceReward) {
        this.collectResources(1);
      }
      
      // Apply any specific partial success effects
      if (challenge.partialSuccessEffect) {
        // Instead of calling the effect, just log it
        gameStore.addToGameLog(`Partial success effect: ${challenge.partialSuccessEffect.description}`, false);
      }
    } else {
      // Failure
      if (outcome.exceptional) {
        // Exceptional failure (e.g., add threat token)
        gameStore.addThreatTokens(1);
      }
      
      // Apply any specific failure effects
      if (challenge.failureEffect) {
        // Instead of calling the effect, just log it
        gameStore.addToGameLog(`Failure effect: ${challenge.failureEffect.description}`, false);
      }
    }
  }
  
  /**
   * Record a challenge attempt for history tracking
   * @param attempt The challenge attempt details
   */
  recordChallengeAttempt(attempt: {
    challengeType: ChallengeType;
    difficulty: number;
    diceRoll: number;
    playerBonus: number;
    total: number;
  }): void {
    const gameStore = useGameStore();
    
    // Create a record with the required properties
    const record = {
      id: `challenge_${gameStore.currentTurn}_${Date.now()}`,
      outcome: attempt.total >= attempt.difficulty ? 'success' : 'failure',
      turn: gameStore.currentTurn
    };
    
    gameStore.challengeHistory.push(record);
  }
  
  /**
   * Get seasonal modifier for a challenge type
   * @param challengeType The type of challenge
   * @param season The current season
   * @returns The seasonal modifier value
   */
  private getSeasonalModifier(challengeType: ChallengeType, season: string): number {
    // Define seasonal challenge modifiers
    const seasonalModifiers = {
      'SAMHAIN': {
        'spiritual': -1,
        'physical': 1
      },
      'WINTERS_DEPTH': {
        'physical': 1,
        'mental': 0
      },
      'IMBOLC': {
        'spiritual': -1,
        'social': -1
      },
      'BELTANE': {
        'social': -1,
        'mental': 0
      },
      'LUGHNASADH': {
        'physical': -1,
        'spiritual': 0
      }
    };
    
    // If no modifiers for this season or challenge type, return 0
    if (!seasonalModifiers[season] || !seasonalModifiers[season][challengeType]) {
      return 0;
    }
    
    return seasonalModifiers[season][challengeType];
  }
  
  /**
   * Get character bonus for a challenge type
   * @param characterId The character ID
   * @param challengeType The type of challenge
   * @returns The character bonus value
   */
  private getCharacterBonus(characterId: string, challengeType: ChallengeType): number {
    const cardStore = useCardStore();
    const character = cardStore.getCharacterById(characterId);
    
    if (!character || !character.challengeBonuses) {
      return 0;
    }
    
    return character.challengeBonuses[challengeType] || 0;
  }
  
  /**
   * Get item bonuses for a challenge type
   * @param itemIds Array of crafted item IDs
   * @param challengeType The type of challenge
   * @returns The total item bonuses
   */
  private getItemBonuses(itemIds: string[], challengeType: ChallengeType): number {
    const cardStore = useCardStore();
    let totalBonus = 0;
    
    for (const itemId of itemIds) {
      const item = cardStore.getCraftedItemById(itemId);
      if (item && item.challengeBonuses && item.challengeBonuses[challengeType]) {
        totalBonus += item.challengeBonuses[challengeType];
      }
    }
    
    return totalBonus;
  }
  
  /**
   * Get companion bonuses for a challenge type
   * @param companionIds Array of companion IDs
   * @param challengeType The type of challenge
   * @returns The total companion bonuses
   */
  private getCompanionBonuses(companionIds: string[], challengeType: ChallengeType): number {
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    let totalBonus = 0;
    
    for (const companionId of companionIds) {
      const companion = cardStore.getCompanionById(companionId);
      if (companion && companion.challengeBonuses) {
        // Base bonus
        if (companion.challengeBonuses[challengeType]) {
          totalBonus += companion.challengeBonuses[challengeType];
        }
        
        // Seasonal bonus
        if (companion.seasonalBonuses && 
            companion.seasonalBonuses[gameStore.currentSeason] && 
            companion.seasonalBonuses[gameStore.currentSeason][challengeType]) {
          totalBonus += companion.seasonalBonuses[gameStore.currentSeason][challengeType];
        }
      }
    }
    
    return totalBonus;
  }
  
  /**
   * Collect resources as a reward
   * @param count Number of resources to collect
   */
  private collectResources(count: number): void {
    // This would typically call resourceService.collectLandscapeResources
    // For now, we'll just log it
    console.log(`Collecting ${count} resources`);
  }
}

export const challengeService = new ChallengeService();
