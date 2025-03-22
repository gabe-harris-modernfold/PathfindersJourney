import { defineStore } from 'pinia';
import { CardType, ChallengeType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import { 
  CharacterCard, 
  LandscapeCard, 
  AnimalCompanionCard, 
  ResourceCard, 
  CraftedItemCard, 
  SeasonCard,
  ChallengeCard
} from '@/models/types/cards';
import { cardRepository } from '@/services/CardRepository';

interface CardStoreState {
  initialized: boolean;
}

export const useCardStore = defineStore('card', {
  state: (): CardStoreState => ({
    initialized: false
  }),
  
  getters: {
    characters: () => {
      return cardRepository.characters;
    },
    
    landscapes: () => {
      return cardRepository.landscapes;
    },
    
    animalCompanions: () => {
      return cardRepository.animalCompanions;
    },
    
    resources: () => {
      return cardRepository.resources;
    },
    
    craftedItems: () => {
      return cardRepository.craftedItems;
    },
    
    seasons: () => {
      return cardRepository.seasons;
    },
    
    getCharacterById: () => (id: string) => {
      return cardRepository.getCharacterById(id);
    },
    
    getLandscapeById: () => (id: string) => {
      return cardRepository.getLandscapeById(id);
    },
    
    getAnimalCompanionById: () => (id: string) => {
      return cardRepository.getAnimalCompanionById(id);
    },
    
    getCompanionById: () => (id: string) => {
      return cardRepository.getAnimalCompanionById(id);
    },
    
    getResourceById: () => (id: string) => {
      return cardRepository.getResourceById(id);
    },
    
    getCraftedItemById: () => (id: string) => {
      return cardRepository.getCraftedItemById(id);
    },
    
    getSeasonById: () => (id: string) => {
      return cardRepository.getSeasonById(id);
    },
    
    getChallengeById: () => (id: string) => {
      return cardRepository.getChallengeById(id);
    },
    
    getResourcesBySeason: () => (season: Season) => {
      return cardRepository.getResourcesBySeason(season);
    },
    
    getCompanionsBySeason: () => (season: Season) => {
      return cardRepository.getCompanionsBySeason(season);
    },
    
    getAllCraftedItems: () => () => {
      return cardRepository.craftedItems;
    },
    
    getCraftableItems: () => () => {
      return cardRepository.craftedItems.map(item => item.id);
    }
  },
  
  actions: {
    initializeCards() {
      // Card initialization is now handled by CardRepository
      // This method is kept for backward compatibility
      this.initialized = true;
    }
  }
});
