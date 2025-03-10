import { CardType, ChallengeType } from '../enums/cardTypes';
import { Season } from '../enums/seasons';

interface BaseCard {
  id: string;
  name: string;
  description: string;
  type: CardType;
}

interface GameCard extends BaseCard {
  image: string;
}

export interface CharacterCard extends GameCard {
  type: CardType.CHARACTER;
  healthPoints: number;
  strength: number;
  wisdom: number;
  agility: number;
  diplomacy: number;
  survival: number;
  resourceCapacity: number;
  specialAbility: {
    name: string;
    description: string;
  };
  startingResources: string[];
  startingCompanion?: string;
  startingCompanions?: string[];
  challengeBonuses?: {
    [key: string]: number;
  };
}

export interface LandscapeCard extends GameCard {
  type: CardType.LANDSCAPE;
  challenge: string;
  challengeType: string;
  difficulty: number;
  description: string;
  availableResources: string[];
  animalCompanions?: string[];
  challenges?: Array<{
    type: string;
    difficulty: number;
  }>;
  specialFeature?: {
    name: string;
    description: string;
    effect: string;
  };
  providesShelter?: boolean;
  entryEffect?: {
    description: string;
    effect: string;
  };
  craftingBonuses?: {
    [key: string]: number;
  };
  hasCraftingFacilities?: boolean;
}

export interface AnimalCompanionCard extends GameCard {
  type: CardType.ANIMAL_COMPANION;
  description: string;
  ability: {
    name: string;
    description: string;
  };
  affinitySeasons: Season[];
  preferredResources?: string[];
  challengeBonuses?: {
    [key: string]: number;
  };
  seasonalBonuses?: {
    [key: string]: {
      [key: string]: number;
    };
  };
  bondingEffect?: (playerStore: any) => void;
  loyaltyEffects?: {
    [key: number]: (playerStore: any) => void;
  };
}

export interface ResourceCard extends GameCard {
  type: CardType.RESOURCE;
  description: string;
  resourceType: string;
  effect: {
    name: string;
    description: string;
  };
  season: string;
  rarity: 'common' | 'uncommon' | 'rare';
  seasonalAbundance: Season[];
  specialEffect?: {
    name: string;
    description: string;
    effect: string;
  };
}

export interface ChallengeCard {
  id: string;
  name: string;
  description: string;
  type: ChallengeType;
  difficulty: number;
  rewards: {
    resources?: string[];
    experience?: number;
    knowledge?: string;
  };
}

export interface CraftedItemCard extends GameCard {
  type: CardType.CRAFTED_ITEM;
  description: string;
  requiredResources: string[];
  ability: {
    name: string;
    description: string;
    type?: string;
  };
  complexity: number;
  drawback?: {
    description: string;
    effect: string;
  };
  isLegendary?: boolean;
  challengeBonuses?: {
    [key: string]: number;
  };
}

export interface SeasonCard extends GameCard {
  type: CardType.SEASON;
  description: string;
  effect: string;
  benefit: string;
  resourceAbundance?: string[];
  resourceScarcity?: string[];
  animalAffinity?: string[];
  animalAffinities?: string[];
  season: Season;
  abundantResources: string[];
  scarceResources: string[];
  modifiers?: {
    spiritual: number;
    physical: number;
    mental: number;
    social: number;
  };
  effects?: Array<{
    name: string;
    effect: string | number;
  }>;
  quest?: {
    name: string;
    location: string;
    requirement: string;
    reward: string;
  };
}
