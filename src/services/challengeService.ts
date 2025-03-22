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
import { ExtendedGameStore, ExtendedPlayerStore } from '@/types/store-extensions';
import { Season } from '@/models/enums/seasons';

class ChallengeService {
  // Private properties with consistent naming
  private _lastChallengeId: string | null = null;
  private _lastChallengeOutcome: ChallengeOutcome | null = null;
  
  /**
   * Calculate challenge difficulty based on multiple factors
   * @param challenge The challenge to calculate difficulty for
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number {
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
    const baseDifficulty = challenge.difficulty;
    
    // Apply seasonal modifiers
    const seasonModifier = this._getSeasonalModifier(challenge.type, gameStore.currentSeason);
    
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
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    const cardStore = useCardStore();
    
    // Character ability bonus
    let bonus = this._getCharacterBonus(playerStore.characterId, challenge.type);
    
    // Item bonuses
    bonus += this._getItemBonuses(playerStore.craftedItems, challenge.type);
    
    // Companion bonuses
    bonus += this._getCompanionBonuses(playerStore.animalCompanions, challenge.type);
    
    // Blessing tokens
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
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
    this._recordChallengeAttempt({
      challengeType: challenge.type,
      difficulty,
      diceRoll,
      playerBonus,
      total
    });
    
    // Natural 8 always succeeds
    if (diceRoll === 8) {
      const outcome = {
        success: true,
        exceptional: true,
        roll: diceRoll,
        total,
        difficulty
      };
      
      this._lastChallengeOutcome = outcome;
      return outcome;
    }
    
    // Success: total >= difficulty
    if (total >= difficulty) {
      const outcome = {
        success: true,
        exceptional: total >= difficulty + 2,
        roll: diceRoll,
        total,
        difficulty
      };
      
      this._lastChallengeOutcome = outcome;
      return outcome;
    }
    
    // Partial success: total = difficulty - 1
    if (total === difficulty - 1) {
      const outcome: ChallengeOutcome = {
        success: 'partial' as const,
        exceptional: false,
        roll: diceRoll,
        total,
        difficulty
      };
      
      this._lastChallengeOutcome = outcome;
      return outcome;
    }
    
    // Failure
    const outcome = {
      success: false,
      exceptional: total <= difficulty - 3,
      roll: diceRoll,
      total,
      difficulty
    };
    
    this._lastChallengeOutcome = outcome;
    return outcome;
  }
  
  /**
   * Apply challenge outcomes
   * @param outcome The challenge outcome
   * @param challenge The challenge that was attempted
   */
  applyOutcome(outcome: ChallengeOutcome, challenge: Challenge): void {
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
    const playerStore = usePlayerStore() as unknown as ExtendedPlayerStore;
    
    if (outcome.success === true) {
      // Full success
      if (outcome.exceptional) {
        // Exceptional success (e.g., gain blessing token)
        gameStore.blessingTokens++;
      }
      
      // Collect resources if applicable
      if (challenge.resourceReward) {
        this._collectResources(2);
      }
      
      // Apply any specific success effects
      if (challenge.successEffect) {
        // Instead of calling the effect, just log it
        gameStore.addToGameLog(`Success effect: ${challenge.successEffect.description}`, false);
      }
    } else if (outcome.success === 'partial') {
      // Partial success
      if (challenge.resourceReward) {
        this._collectResources(1);
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
   * Get the last challenge outcome
   * @returns The last challenge outcome or null if no challenge has been resolved
   */
  getLastOutcome(): ChallengeOutcome | null {
    return this._lastChallengeOutcome;
  }
  
  /**
   * Reset the service state
   */
  reset(): void {
    this._lastChallengeId = null;
    this._lastChallengeOutcome = null;
  }
  
  /**
   * Record a challenge attempt for history tracking
   * @param attempt The challenge attempt details
   */
  private _recordChallengeAttempt(attempt: {
    challengeType: ChallengeType;
    difficulty: number;
    diceRoll: number;
    playerBonus: number;
    total: number;
  }): void {
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
    
    // Create a record with the required properties
    const record = {
      id: `challenge_${gameStore.currentTurn}_${Date.now()}`,
      outcome: attempt.total >= attempt.difficulty ? 'success' : 'failure',
      turn: gameStore.currentTurn
    };
    
    this._lastChallengeId = record.id;
    gameStore.challengeHistory.push(record);
  }
  
  /**
   * Get seasonal modifier for a challenge type
   * @param challengeType The type of challenge
   * @param season The current season
   * @returns The seasonal modifier value
   */
  private _getSeasonalModifier(challengeType: ChallengeType, season: Season): number {
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
  private _getCharacterBonus(characterId: string, challengeType: ChallengeType): number {
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
  private _getItemBonuses(itemIds: string[], challengeType: ChallengeType): number {
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
  private _getCompanionBonuses(companionIds: string[], challengeType: ChallengeType): number {
    const cardStore = useCardStore();
    const gameStore = useGameStore() as unknown as ExtendedGameStore;
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
  private _collectResources(count: number): void {
    // This would typically call resourceService.collectLandscapeResources
    // For now, we'll just log it
    console.log(`Collecting ${count} resources`);
  }
}

// Export as a singleton instance for consistent access pattern
export const challengeService = new ChallengeService();
