import { ChallengeType } from '@/models/enums/cardTypes';

/**
 * Maps legacy challenge type strings from data files to ChallengeType enum values
 * This helps ensure consistent lookup across the application
 */
export const challengeTypeMapping: Record<string, ChallengeType> = {
  // Map from data file values to enum values
  'mental': ChallengeType.WISDOM,
  'spiritual': ChallengeType.SURVIVAL,
  'knowledge': ChallengeType.WISDOM,
  'physical': ChallengeType.STRENGTH,
  'social': ChallengeType.DIPLOMACY,
  'wilderness': ChallengeType.SURVIVAL,
  'agility': ChallengeType.AGILITY,
  'strength': ChallengeType.STRENGTH,
  'diplomacy': ChallengeType.DIPLOMACY,
  'survival': ChallengeType.SURVIVAL,
  'wisdom': ChallengeType.WISDOM,
  
  // Also include direct mappings for case-insensitive lookups
  'WISDOM': ChallengeType.WISDOM,
  'STRENGTH': ChallengeType.STRENGTH,
  'AGILITY': ChallengeType.AGILITY,
  'DIPLOMACY': ChallengeType.DIPLOMACY,
  'SURVIVAL': ChallengeType.SURVIVAL
};

/**
 * Safely gets the standardized ChallengeType from any challenge type string
 * @param challengeType The challenge type string from data files or other sources
 * @returns The corresponding ChallengeType enum value or WISDOM as fallback
 */
export function getStandardizedChallengeType(challengeType: string): ChallengeType {
  if (!challengeType) {
    console.warn('Missing challenge type, defaulting to WISDOM');
    return ChallengeType.WISDOM;
  }
  
  const standardType = challengeTypeMapping[challengeType];
  
  if (!standardType) {
    console.warn(`Unknown challenge type: ${challengeType}, defaulting to WISDOM`);
    return ChallengeType.WISDOM;
  }
  
  return standardType;
}

/**
 * Helper function to check if an ability matches a challenge type
 * Considers different ability structures and handles type inconsistencies
 */
export function abilityMatchesChallenge(ability: any, challengeType: string | ChallengeType): boolean {
  if (!ability) return false;
  
  // Standardize the challenge type
  const standardChallengeType = typeof challengeType === 'string' 
    ? getStandardizedChallengeType(challengeType)
    : challengeType;
  
  // Try different ways to match the ability to the challenge type
  return (
    // Check if ability has a type property that matches directly
    (ability.type && getStandardizedChallengeType(ability.type) === standardChallengeType) ||
    // Check if ability has a type property in the more free-form structure
    (ability.type && ability.type.toUpperCase() === standardChallengeType) ||
    // Check if ability name includes the challenge type string
    (ability.name && typeof ability.name === 'string' && 
     ability.name.toUpperCase().includes(standardChallengeType.toString()))
  );
}
