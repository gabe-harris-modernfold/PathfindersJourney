/**
 * Challenge Service Index
 * Exports all challenge-related services and types
 */

// Export the main challenge service
export { challengeService } from './ChallengeService';

// Export the strategy interface for extensions
export type { ChallengeStrategy } from './ChallengeStrategy';

// Export individual strategies for direct access if needed
export { PhysicalChallengeStrategy } from './strategies/PhysicalChallengeStrategy';
export { MentalChallengeStrategy } from './strategies/MentalChallengeStrategy';
export { SpiritualChallengeStrategy } from './strategies/SpiritualChallengeStrategy';
export { SocialChallengeStrategy } from './strategies/SocialChallengeStrategy';
