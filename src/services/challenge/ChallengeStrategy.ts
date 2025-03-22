/**
 * Challenge Strategy Interface
 * Defines strategy pattern for handling different challenge types
 */
import { Challenge, ChallengeOutcome } from '@/models/types/game';

/**
 * Interface for challenge resolution strategies
 */
export interface ChallengeStrategy {
  /**
   * Calculate difficulty of a specific challenge type
   * @param challenge The challenge to calculate difficulty for
   * @returns The calculated difficulty value
   */
  calculateDifficulty(challenge: Challenge): number;
  
  /**
   * Calculate player's bonus for a specific challenge type
   * @param challenge The challenge to calculate bonus for
   * @returns The calculated player bonus
   */
  calculatePlayerBonus(challenge: Challenge): number;
  
  /**
   * Apply specific effects for this challenge type
   * @param outcome The challenge outcome
   * @param challenge The challenge that was attempted
   */
  applyOutcomeEffects(outcome: ChallengeOutcome, challenge: Challenge): void;
}
