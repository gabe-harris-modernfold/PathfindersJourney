import { GamePhase } from '../enums/phases';
import { Season } from '../enums/seasons';
import { LandscapeCard, SeasonCard } from './cards';
import { ChallengeType } from '../enums/cardTypes';

export interface ChallengeOutcome {
  success: boolean | 'partial';
  exceptional: boolean;
  roll: number;
  total: number;
  difficulty: number;
}

export interface Challenge {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  difficulty: number;
  requiredSkill: string;
  reward: {
    resources?: string[];
    experience?: number;
    knowledge?: string;
  };
  resourceReward?: string[];
  successEffect?: {
    description: string;
    effect: string;
  };
  partialSuccessEffect?: {
    description: string;
    effect: string;
  };
  failureEffect?: {
    description: string;
    effect: string;
  };
}

export interface ChallengeResult {
  success: boolean;
  resourcesGained: string[];
  experienceGained: number;
  knowledgeGained: string | null;
  healthLost: number;
}

export interface VictoryConditions {
  journeyCompleted: boolean;
  balanceMaintained: boolean;
  knowledgeAcquired: boolean;
  bondsFormed: boolean;
  questFulfilled: boolean;
  landscapesTraversed: boolean;
  seasonsExperienced: boolean;
  challengesOvercome: boolean;
}

export interface GameState {
  currentTurn: number;
  currentSeason: Season;
  currentLandscapeId: string;
  currentChallenge: string | null;
  isVictory: boolean;
  gameOver: boolean;
  threatTokens: number;
  tempEffects: TempEffect[];
}

export interface TempEffect {
  id: string;
  name: string;
  description: string;
  strength: number;
  duration: number;
}

export interface ThreatEffect {
  name: string;
  description: string;
  resolution?: string;
  effect: (gameStore: any, playerStore: any) => void;
}

export interface GameLogEntry {
  message: string;
  timestamp: number;
  highlight?: boolean;
  type?: 'phase' | 'action' | 'challenge' | 'resource' | 'companion' | 'crafting' | 'system' | 'error' | 'debug';
  details?: {
    [key: string]: any;
  };
  turn?: number;
  season?: Season;
}
