/**
 * Challenge Service
 * Centralized service for all challenge resolution logic using strategy pattern
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useChallenge } from '@/stores/challengeStore';
import { useLogStore } from '@/stores/logStore';
import { diceService } from '@/services/diceService';
import { ChallengeOutcome, Challenge } from '@/models/types/game';
import { ChallengeType } from '@/models/enums/cardTypes';
import { ChallengeStrategy } from './ChallengeStrategy';
import { PhysicalChallengeStrategy } from './strategies/PhysicalChallengeStrategy';
import { MentalChallengeStrategy } from './strategies/MentalChallengeStrategy';
import { SpiritualChallengeStrategy } from './strategies/SpiritualChallengeStrategy';
import { SocialChallengeStrategy } from './strategies/SocialChallengeStrategy';

/**
 * Centralized service for handling all challenge-related operations
 */
class ChallengeService {
  // Private properties with consistent naming
  private _lastChallengeId: string | null = null;
  private _lastChallengeOutcome: ChallengeOutcome | null = null;
  private _strategies: Record<string, ChallengeStrategy>;
  
  /**
   * Initialize challenge service with strategies for different challenge types
   */
  constructor() {
    // Initialize strategies for different challenge types
    // Map physical, mental, spiritual, social strategies to appropriate challenge types
    this._strategies = {
      [ChallengeType.STRENGTH]: new PhysicalChallengeStrategy(),
      [ChallengeType.WISDOM]: new MentalChallengeStrategy(),
      [ChallengeType.SURVIVAL]: new SpiritualChallengeStrategy(),
      [ChallengeType.DIPLOMACY]: new SocialChallengeStrategy(),
      [ChallengeType.AGILITY]: new PhysicalChallengeStrategy() // Fallback to physical for agility
    };
  }
  
  /**
   * Calculate challenge difficulty based on challenge type and other factors
   * @param challenge The challenge to calculate difficulty for
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number {
    // Delegate to appropriate strategy based on challenge type
    return this._getStrategyForChallenge(challenge).calculateDifficulty(challenge);
  }
  
  /**
   * Calculate player's bonus for a challenge based on its type
   * @param challenge The challenge to calculate bonus for
   * @returns The calculated player bonus
   */
  calculatePlayerBonus(challenge: Challenge): number {
    // Delegate to appropriate strategy based on challenge type
    return this._getStrategyForChallenge(challenge).calculatePlayerBonus(challenge);
  }
  
  /**
   * Determine challenge outcome using unified formula
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
    
    // Determine outcome based on unified formula
    let success: boolean | 'partial' = false;
    let exceptional = false;
    
    // Natural 8 always succeeds
    if (diceRoll === 8) {
      success = true;
      exceptional = true;
    }
    // Success: total >= difficulty
    else if (total >= difficulty) {
      success = true;
      exceptional = total >= difficulty + 2;
    }
    // Partial success: total = difficulty - 1
    else if (total === difficulty - 1) {
      success = 'partial';
      exceptional = false;
    }
    // Failure
    else {
      success = false;
      exceptional = total <= difficulty - 3;
    }
    
    // Create outcome object
    const outcome: ChallengeOutcome = {
      success,
      exceptional,
      roll: diceRoll,
      total,
      difficulty
    };
    
    // Store the outcome
    this._lastChallengeOutcome = outcome;
    
    return outcome;
  }
  
  /**
   * Apply challenge outcomes using appropriate strategy
   * @param outcome The challenge outcome
   * @param challenge The challenge that was attempted
   */
  applyOutcome(outcome: ChallengeOutcome, challenge: Challenge): void {
    // Common outcome handling
    const logStore = useLogStore();
    const challengeStore = useChallenge();
    
    // Log the outcome
    const outcomeText = outcome.success === true 
      ? 'Success' 
      : outcome.success === 'partial' 
        ? 'Partial Success' 
        : 'Failure';
    
    logStore.addToGameLog(`Challenge ${outcomeText}: ${challenge.name} (Roll: ${outcome.roll}, Total: ${outcome.total}, Difficulty: ${outcome.difficulty})`, false);
    
    // Delegate to strategy for type-specific effects
    this._getStrategyForChallenge(challenge).applyOutcomeEffects(outcome, challenge);
    
    // Additional common handling based on outcome type
    if (outcome.success === true && outcome.exceptional) {
      // All exceptional successes get a blessing token
      challengeStore.blessingTokens++;
    } else if (outcome.success === false && outcome.exceptional) {
      // All exceptional failures add a threat token
      challengeStore.addThreatTokens(1);
    }
  }
  
  /**
   * Handle a landscape challenge
   * Complete process from challenge resolution to outcome application
   */
  resolveLandscapeChallenge(): void {
    const gameStore = useGameStore();
    const cardStore = useCardStore();
    const challengeStore = useChallenge();
    const logStore = useLogStore();
    
    // Get the current landscape and its challenge
    const landscape = cardStore.getLandscapeById(gameStore.currentLandscapeId);
    
    if (!landscape || !landscape.challenge) {
      logStore.addToGameLog('No landscape challenge found', true);
      return;
    }
    
    // Need to handle the fact that landscape.challenge might be a string ID or an actual Challenge object
    const challengeObj = typeof landscape.challenge === 'string' 
      ? { type: ChallengeType.STRENGTH, difficulty: 5, name: landscape.challenge } as Challenge 
      : landscape.challenge as Challenge;
      
    const outcome = this.resolveChallenge(challengeObj);
    
    // Apply the outcome
    this.applyOutcome(outcome, challengeObj);
    
    // Progress the game state based on the outcome
    if (outcome.success === true) {
      // Full success - advance journey track
      gameStore.currentTurn++; // Simple way to progress the game
    } else if (outcome.success === 'partial') {
      // Partial success - may have some benefit but no journey advancement
    } else {
      // Failure - add threat
      challengeStore.addThreatTokens(1);
    }
  }
  
  /**
   * Allow player to avoid a landscape challenge by spending resources
   */
  avoidLandscapeChallenge(): void {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    const logStore = useLogStore();
    
    // Check if player has enough resources
    const requiredResources = 2;
    const resourceCount = playerStore.resourceCount;
    
    if (resourceCount >= requiredResources) {
      // Spend resources to avoid challenge
      // In a real implementation, we would select specific resources to spend
      for (let i = 0; i < requiredResources; i++) {
        if (playerStore.resources.length > 0) {
          const resourceToSpend = playerStore.resources[0];
          playerStore.removeResource(resourceToSpend);
        }
      }
      
      logStore.addToGameLog(`You spent ${requiredResources} resources to avoid the challenge.`, false);
      // Continue journey without challenge penalties
      gameStore.currentTurn++;
    } else {
      logStore.addToGameLog(`You don't have enough resources to avoid the challenge. You need at least ${requiredResources}.`, true);
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
   * Get the last challenge result - alias for getLastOutcome for backwards compatibility
   * @returns The last challenge outcome or null if no challenge has been resolved
   */
  getLastChallengeResult(): ChallengeOutcome | null {
    return this.getLastOutcome();
  }

  /**
   * Resolve a challenge in the current landscape
   * This is a convenience method that handles all the steps for landscape challenges
   */
  resolveChallengeLandscape(): void {
    const gameStore = useGameStore();
    const cardStore = useCardStore();
    const logStore = useLogStore();
    
    // Get the current landscape's challenge
    const currentLandscape = gameStore.currentLandscape;
    if (!currentLandscape || !currentLandscape.challenges || currentLandscape.challenges.length === 0) {
      logStore.addToGameLog('No challenge found for the current landscape', true);
      return;
    }
    
    // Use the first challenge for simplicity
    const challenge = currentLandscape.challenges[0];
    
    // Resolve the challenge
    const outcome = this.resolveChallenge(challenge);
    
    // Handle landscape-specific outcomes
    if (outcome.success === true) {
      logStore.addToGameLog(`You successfully navigated through ${currentLandscape.name}!`, false);
      gameStore.currentTurn++;
    } else {
      logStore.addToGameLog(`You struggled with the challenges of ${currentLandscape.name}.`, true);
      
      // Apply penalties based on challenge type
      const playerStore = usePlayerStore();
      
      if (challenge.type === ChallengeType.STRENGTH || challenge.type === ChallengeType.AGILITY) {
        playerStore.health--;
        logStore.addToGameLog('You lost 1 Health from the physical strain.', true);
      } else if (challenge.type === ChallengeType.WISDOM) {
        playerStore.loseRandomResources(1);
        logStore.addToGameLog('You lost a resource while trying to solve the problem.', true);
      }
      
      gameStore.currentTurn++;
    }
  }
  
  /**
   * Avoid the challenge in the current landscape by spending resources
   */
  avoidChallengeLandscape(): void {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    const logStore = useLogStore();
    
    // Check if player has enough resources
    const requiredResources = 2;
    const resourceCount = playerStore.resourceCount;
    
    if (resourceCount >= requiredResources) {
      // Spend resources to avoid challenge
      // In a real implementation, we would select specific resources to spend
      for (let i = 0; i < requiredResources; i++) {
        if (playerStore.resources.length > 0) {
          const resourceToSpend = playerStore.resources[0];
          playerStore.removeResource(resourceToSpend);
        }
      }
      
      logStore.addToGameLog(`You spent ${requiredResources} resources to avoid the challenge.`, false);
      // Continue journey without challenge penalties
      gameStore.currentTurn++;
    } else {
      logStore.addToGameLog(`You don't have enough resources to avoid the challenge. You need at least ${requiredResources}.`, true);
    }
  }
  
  /**
   * Reset the service state
   */
  reset(): void {
    this._lastChallengeId = null;
    this._lastChallengeOutcome = null;
  }
  
  /**
   * Get the appropriate strategy for a challenge type
   * @param challenge The challenge to get strategy for
   * @returns The challenge strategy
   */
  private _getStrategyForChallenge(challenge: Challenge): ChallengeStrategy {
    return this._strategies[challenge.type] || this._strategies[ChallengeType.STRENGTH];
  }
  
  /**
   * Record details of a challenge attempt for historical reference
   * @param attempt The challenge attempt details
   */
  private _recordChallengeAttempt(attempt: {
    challengeType: string;
    difficulty: number;
    diceRoll: number;
    playerBonus: number;
    total: number;
  }): void {
    const challengeStore = useChallenge();
    
    challengeStore.addChallengeHistory(attempt.challengeType, 
      `Roll: ${attempt.diceRoll}, Player Bonus: ${attempt.playerBonus}, Total: ${attempt.total}, Difficulty: ${attempt.difficulty}`
    );
    
    this._lastChallengeOutcome = {
      roll: attempt.diceRoll,
      total: attempt.total,
      difficulty: attempt.difficulty,
      success: attempt.total >= attempt.difficulty,
      exceptional: (attempt.total >= attempt.difficulty + 2) || (attempt.diceRoll === 8)
    };
  }
}

// Export as a singleton instance for consistent access pattern
export const challengeService = new ChallengeService();
