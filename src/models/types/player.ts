import { PlayerAction } from '@/models/enums/actions';

export interface PlayerEffect {
  id: string;
  name: string;
  description: string;
  duration: number;
  magnitude: number;
  type: string;
  target: string;
}

export enum CompanionState {
  LOYAL = 'LOYAL',
  WARY = 'WARY',
  LEAVING = 'LEAVING'
}

export interface CompanionStatus {
  loyalty: number;
  state: CompanionState;
  turnsSinceLastFed: number;
  turnsWary: number;
}

export interface PlayerState {
  characterId: string;
  health: number;
  maxHealth: number;
  resources: string[];
  resourceCapacity: number;
  animalCompanions: string[];
  craftedItems: string[];
  experience: number;
  knowledgeDiscovered: string[];
  specialAbilityUsed: boolean;
  activeEffects: PlayerEffect[];
  hasCraftedLegendaryItem: boolean;
  uniqueCraftedItemsCount: number;
  companionLoyalty: { [companionId: string]: CompanionStatus };
  wisdom: number;
  equippedItems?: string[];
  selectedCharacter?: any;
}

export interface PlayerActionResult {
  success: boolean;
  message: string;
  type: PlayerAction;
  data?: any;
}
