import { defineStore } from 'pinia';
import { PlayerState, PlayerEffect, CompanionState } from '@/models/types/player';
import { CharacterCard } from '@/models/types/cards';
import { useCardStore } from './cardStore';
import { useGameStore } from './gameStore';
import { victoryService } from '@/services/victoryService';

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    characterId: '',
    health: 10,
    maxHealth: 10,
    resources: [],
    resourceCapacity: 5,
    animalCompanions: [],
    craftedItems: [],
    experience: 0,
    knowledgeDiscovered: [],
    specialAbilityUsed: false,
    activeEffects: [],
    hasCraftedLegendaryItem: false,
    uniqueCraftedItemsCount: 0,
    companionLoyalty: {}
  }),
  
  getters: {
    character(): CharacterCard | null {
      const cardStore = useCardStore();
      const character = cardStore.getCharacterById(this.characterId);
      return character || null;
    },
    
    resourceCount(): number {
      return this.resources.length;
    },
    
    isResourceCapacityReached(): boolean {
      return this.resources.length >= this.resourceCapacity;
    },
    
    companionCount(): number {
      return this.animalCompanions.length;
    },
    
    craftedItemCount(): number {
      return this.craftedItems.length;
    },
    
    experienceLevel(): number {
      // Calculate level based on experience points
      // Every 3 experience points = 1 level
      return Math.floor(this.experience / 3) + 1;
    },
    
    hasEffect(): (effectId: string) => boolean {
      return (effectId: string) => {
        return this.activeEffects.some(effect => effect.id === effectId && effect.duration > 0);
      };
    },
    
    getEffectStrength(): (effectId: string) => number {
      return (effectId: string) => {
        const effect = this.activeEffects.find(effect => effect.id === effectId && effect.duration > 0);
        return effect ? effect.magnitude : 0;
      };
    }
  },
  
  actions: {
    selectCharacter(characterId: string) {
      const cardStore = useCardStore();
      const character = cardStore.getCharacterById(characterId);
      
      if (character) {
        this.characterId = characterId;
        this.health = character.health;
        this.maxHealth = character.health;
        this.resourceCapacity = character.resourceCapacity;
        
        // Add starting resources if any
        if (character.startingResources && character.startingResources.length > 0) {
          character.startingResources.forEach(resourceId => {
            this.addResource(resourceId);
          });
        }
        
        // Add starting companion if any
        if (character.startingCompanion) {
          this.animalCompanions = [character.startingCompanion];
          this.companionLoyalty = {
            [character.startingCompanion]: 1
          };
        }
        
        return true;
      }
      
      return false;
    },
    
    addResource(resourceId: string) {
      if (this.resources.length < this.resourceCapacity) {
        this.resources.push(resourceId);
        return true;
      }
      return false;
    },
    
    removeResource(resourceId: string) {
      const index = this.resources.indexOf(resourceId);
      if (index !== -1) {
        this.resources.splice(index, 1);
        return true;
      }
      return false;
    },
    
    addAnimalCompanion(companionId: string) {
      if (!this.animalCompanions.includes(companionId)) {
        this.animalCompanions.push(companionId);
        
        // Initialize companion loyalty status
        this.companionLoyalty[companionId] = {
          loyalty: 5, // Initial loyalty level (1-10 scale)
          state: CompanionState.LOYAL,
          turnsSinceLastFed: 0,
          turnsWary: 0
        };
        
        return true;
      }
      return false;
    },
    
    removeAnimalCompanion(companionId: string) {
      const index = this.animalCompanions.indexOf(companionId);
      if (index !== -1) {
        this.animalCompanions.splice(index, 1);
        
        // Clean up companion loyalty data
        if (this.companionLoyalty[companionId]) {
          delete this.companionLoyalty[companionId];
        }
        
        return true;
      }
      return false;
    },
    
    // Feed an animal companion
    feedCompanion(companionId: string, resourceId: string): boolean {
      // Check if the companion exists
      if (!this.animalCompanions.includes(companionId)) {
        return false;
      }
      
      // Check if the player has the resource
      if (!this.resources.includes(resourceId)) {
        return false;
      }
      
      // Remove the resource
      this.removeResource(resourceId);
      
      // Get companion status
      const status = this.companionLoyalty[companionId];
      if (!status) {
        // Initialize if missing
        this.companionLoyalty[companionId] = {
          loyalty: 5,
          state: CompanionState.LOYAL,
          turnsSinceLastFed: 0,
          turnsWary: 0
        };
      }
      
      // Update companion status
      const updatedStatus = this.companionLoyalty[companionId];
      
      // Reset feeding counter
      updatedStatus.turnsSinceLastFed = 0;
      
      // Increase loyalty (max 10)
      updatedStatus.loyalty = Math.min(10, updatedStatus.loyalty + 1);
      
      // If companion was wary, restore to loyal state
      if (updatedStatus.state === CompanionState.WARY) {
        updatedStatus.state = CompanionState.LOYAL;
        updatedStatus.turnsWary = 0;
      }
      
      const gameStore = useGameStore();
      gameStore.addToGameLog(`You fed your animal companion with ${gameStore.formatResourceName(resourceId)}.`, true, 'companion');
      
      return true;
    },
    
    // Handle companions at end of turn
    updateCompanionStatus(): void {
      const gameStore = useGameStore();
      const cardStore = useCardStore();
      
      // Iterate through all companions
      this.animalCompanions.forEach(companionId => {
        const status = this.companionLoyalty[companionId];
        
        // Skip if no status is recorded
        if (!status) return;
        
        // Increment turns since last fed
        status.turnsSinceLastFed++;
        
        // Get companion card for better logging
        const companion = cardStore.getAnimalCompanionById(companionId);
        const companionName = companion ? companion.name : 'Animal companion';
        
        // Check if companion should become wary (3 turns without food)
        if (status.state === CompanionState.LOYAL && status.turnsSinceLastFed >= 3) {
          status.state = CompanionState.WARY;
          status.turnsWary = 0;
          gameStore.addToGameLog(`${companionName} has become wary due to lack of food.`, true, 'companion');
        }
        
        // If already wary, update wary counter
        if (status.state === CompanionState.WARY) {
          status.turnsWary++;
          
          // If wary for 2 turns, mark as leaving
          if (status.turnsWary >= 2) {
            status.state = CompanionState.LEAVING;
            gameStore.addToGameLog(`${companionName} is leaving you due to continued neglect.`, true, 'companion');
          }
        }
        
        // If companion is marked as leaving, remove it
        if (status.state === CompanionState.LEAVING) {
          this.removeAnimalCompanion(companionId);
          gameStore.addToGameLog(`${companionName} has left you.`, true, 'companion');
        }
      });
    },
    
    // Check if a companion is in a specific state
    isCompanionInState(companionId: string, state: CompanionState): boolean {
      if (!this.animalCompanions.includes(companionId)) {
        return false;
      }
      
      const status = this.companionLoyalty[companionId];
      return status ? status.state === state : false;
    },
    
    // Get all companions in a specific state
    getCompanionsInState(state: CompanionState): string[] {
      return this.animalCompanions.filter(id => {
        const status = this.companionLoyalty[id];
        return status && status.state === state;
      });
    },
    
    addCraftedItem(itemId: string) {
      if (!this.craftedItems.includes(itemId)) {
        this.craftedItems.push(itemId);
        return true;
      }
      return false;
    },
    
    removeCraftedItem(itemId: string) {
      const index = this.craftedItems.indexOf(itemId);
      if (index !== -1) {
        this.craftedItems.splice(index, 1);
        return true;
      }
      return false;
    },
    
    gainExperience(amount: number) {
      this.experience += amount;
      return this.experience;
    },
    
    loseHealth(amount: number) {
      this.health = Math.max(0, this.health - amount);
      
      // Check if player has died
      if (this.health <= 0) {
        // Check defeat conditions and get the reason
        const defeatResult = victoryService.checkDefeatConditions();
        
        // Process defeat using the victory service
        if (defeatResult.isDefeat) {
          victoryService.processDefeat(defeatResult.reason || 'Your health has reached zero.');
        }
      }
      
      return this.health > 0;
    },
    
    healHealth(amount: number) {
      this.health = Math.min(this.maxHealth, this.health + amount);
      return this.health;
    },
    
    discoverKnowledge(knowledgeId: string) {
      if (!this.knowledgeDiscovered.includes(knowledgeId)) {
        this.knowledgeDiscovered.push(knowledgeId);
        return true;
      }
      return false;
    },
    
    useSpecialAbility() {
      if (!this.specialAbilityUsed) {
        this.specialAbilityUsed = true;
        return true;
      }
      return false;
    },
    
    resetSpecialAbility() {
      this.specialAbilityUsed = false;
      return true;
    },
    
    resetPlayer() {
      this.characterId = '';
      this.health = 10;
      this.maxHealth = 10;
      this.resources = [];
      this.resourceCapacity = 5;
      this.animalCompanions = [];
      this.craftedItems = [];
      this.experience = 0;
      this.knowledgeDiscovered = [];
      this.specialAbilityUsed = false;
      this.activeEffects = [];
      this.hasCraftedLegendaryItem = false;
      this.uniqueCraftedItemsCount = 0;
      this.companionLoyalty = {};
    },
    
    addCompanion(companionId: string) {
      if (!this.animalCompanions.includes(companionId)) {
        this.animalCompanions.push(companionId);
        if (!this.companionLoyalty) {
          this.companionLoyalty = {};
        }
        this.companionLoyalty[companionId] = 1;
      }
    },
    
    removeCompanion(companionId: string) {
      this.animalCompanions = this.animalCompanions.filter(id => id !== companionId);
      if (this.companionLoyalty && this.companionLoyalty[companionId]) {
        delete this.companionLoyalty[companionId];
      }
    },
    
    setCompanionLoyalty(companionId: string, loyalty: number) {
      if (!this.companionLoyalty) {
        this.companionLoyalty = {};
      }
      this.companionLoyalty[companionId] = loyalty;
    },
    
    // New methods for threat management
    takeDamage(amount: number) {
      const gameStore = useGameStore();
      const alive = this.loseHealth(amount);
      
      gameStore.addToGameLog(`You take ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
      
      if (!alive) {
        gameStore.addToGameLog('You have been defeated!', true);
        gameStore.endGame(false);
      }
      
      return alive;
    },
    
    loseRandomResources(amount: number) {
      const gameStore = useGameStore();
      let lostCount = 0;
      
      // Don't try to remove more resources than the player has
      amount = Math.min(amount, this.resources.length);
      
      for (let i = 0; i < amount; i++) {
        if (this.resources.length > 0) {
          // Get a random resource index
          const randomIndex = Math.floor(Math.random() * this.resources.length);
          const resourceId = this.resources[randomIndex];
          
          // Get resource name for logging
          const cardStore = useCardStore();
          const resource = cardStore.getResourceById(resourceId);
          
          // Remove the resource
          this.resources.splice(randomIndex, 1);
          lostCount++;
          
          gameStore.addToGameLog(`You lost ${resource ? resource.name : 'a resource'}.`);
        }
      }
      
      return lostCount;
    },
    
    addEffect(effect: PlayerEffect) {
      const gameStore = useGameStore();
      
      // Check if effect already exists
      const existingEffectIndex = this.activeEffects.findIndex(e => e.id === effect.id);
      
      if (existingEffectIndex !== -1) {
        // Update existing effect
        this.activeEffects[existingEffectIndex].magnitude = effect.magnitude;
        this.activeEffects[existingEffectIndex].duration = effect.duration;
        gameStore.addToGameLog(`Effect renewed: ${effect.name}`, true);
      } else {
        // Add new effect
        this.activeEffects.push(effect);
        gameStore.addToGameLog(`New effect gained: ${effect.name} - ${effect.description}`, true);
      }
      
      return true;
    },
    
    removeEffect(effectId: string) {
      const gameStore = useGameStore();
      const index = this.activeEffects.findIndex(effect => effect.id === effectId);
      
      if (index !== -1) {
        const effect = this.activeEffects[index];
        gameStore.addToGameLog(`Effect ended: ${effect.name}`, true);
        this.activeEffects.splice(index, 1);
        return true;
      }
      
      return false;
    },
    
    processEffects() {
      // Reduce duration of all effects
      this.activeEffects.forEach((effect, index) => {
        if (effect.duration > 0) {
          effect.duration--;
          
          if (effect.duration === 0) {
            const gameStore = useGameStore();
            gameStore.addToGameLog(`Effect ended: ${effect.name}`, true);
            this.activeEffects.splice(index, 1);
          }
        }
      });
    }
  }
});
