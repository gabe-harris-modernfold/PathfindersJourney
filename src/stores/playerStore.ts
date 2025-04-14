import { defineStore } from 'pinia';
import { PlayerState, PlayerEffect, CompanionState } from '@/models/types/player';
import { CharacterCard } from '@/models/types/cards';
import { useCardStore } from './cardStore';
import { useGameStore } from './gameStore';
import { useLogStore } from './logStore';
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
    companionLoyalty: {},
    wisdom: 0,
    equippedItems: [], 
    selectedCharacter: null, 
    hasResourceForagingAction: true, 
    hasPerformedCrafting: false, 
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
    setCharacter(characterId: string): void {
      const cardStore = useCardStore();
      const character = cardStore.getCharacterById(characterId);
      
      if (character) {
        this.characterId = characterId;
        // Use health or healthPoints property, with a fallback default value
        const healthValue = character.health || character.healthPoints || 10;
        this.health = healthValue;
        this.maxHealth = healthValue;
        this.resourceCapacity = character.resourceCapacity;
        
        // Add starting resources if any
        if (character.startingResources) {
          character.startingResources.forEach(resourceId => {
            this.addResource(resourceId);
          });
        }
        
        // Also check for startingItems (used in character model)
        if (character.startingItems) {
          character.startingItems.forEach(resourceId => {
            this.addResource(resourceId);
          });
        }
        
        // Add starting companions if any
        if (character.startingCompanion) {
          this.addAnimalCompanion(character.startingCompanion);
        }
        
        if (character.startingCompanions) {
          character.startingCompanions.forEach(companionId => {
            this.addAnimalCompanion(companionId);
          });
        }
      }
    },
    
    selectCharacter(characterId: string): boolean {
      this.setCharacter(characterId);
      return true;
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
      // Validate inputs
      if (!this.animalCompanions.includes(companionId)) {
        return false;
      }
      
      if (!this.resources.includes(resourceId)) {
        return false;
      }
      
      // Remove the resource (consumed by feeding)
      this.removeResource(resourceId);
      
      // Initialize companion loyalty data if it doesn't exist or is just a number
      if (!this.companionLoyalty[companionId] || typeof this.companionLoyalty[companionId] === 'number') {
        const currentLoyalty = typeof this.companionLoyalty[companionId] === 'number' 
          ? this.companionLoyalty[companionId] 
          : 1;
          
        this.companionLoyalty[companionId] = {
          loyalty: currentLoyalty,
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
      
      const logStore = useLogStore();
      const cardStore = useCardStore();
      
      // Log the feeding action
      const companion = cardStore.getAnimalCompanionById(companionId);
      const resource = cardStore.getResourceById(resourceId);
      
      if (companion && resource) {
        logStore.addToGameLog(
          `You offered ${resource.name} to your ${companion.name}. Their loyalty has increased!`,
          true,
          'companion'
        );
      }
      
      return true;
    },
    
    updateCompanionStatus(): void {
      const logStore = useLogStore();
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
          logStore.addToGameLog(`${companionName} has become wary due to lack of food.`, true, 'companion');
        }
        
        // If already wary, update wary counter
        if (status.state === CompanionState.WARY) {
          status.turnsWary++;
          
          // If wary for 2 turns, mark as leaving
          if (status.turnsWary >= 2) {
            status.state = CompanionState.LEAVING;
            logStore.addToGameLog(`${companionName} is leaving you due to continued neglect.`, true, 'companion');
          }
        }
        
        // If companion is marked as leaving, remove it
        if (status.state === CompanionState.LEAVING) {
          this.removeAnimalCompanion(companionId);
          logStore.addToGameLog(`${companionName} has left you.`, true, 'companion');
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
    
    // Add experience points to the player
    addExperience(amount: number): number {
      this.experience += amount;
      return this.experience;
    },
    
    // For backward compatibility with tests
    gainExperience(amount: number): number {
      return this.addExperience(amount);
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
      const logStore = useLogStore();
      const alive = this.loseHealth(amount);
      
      logStore.addToGameLog(`You take ${amount} damage. Health: ${this.health}/${this.maxHealth}`);
      
      if (!alive) {
        logStore.addToGameLog('You have been defeated!', true);
        gameStore.endGame(false);
      }
      
      return alive;
    },
    
    loseRandomResources(amount: number) {
      const gameStore = useGameStore();
      const logStore = useLogStore();
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
          
          logStore.addToGameLog(`You lost ${resource ? resource.name : 'a resource'}.`);
        }
      }
      
      return lostCount;
    },
    
    addEffect(effect: PlayerEffect) {
      const logStore = useLogStore();
      
      // Check if effect already exists
      const existingEffectIndex = this.activeEffects.findIndex(e => e.id === effect.id);
      
      if (existingEffectIndex !== -1) {
        // Update existing effect
        this.activeEffects[existingEffectIndex].magnitude = effect.magnitude;
        this.activeEffects[existingEffectIndex].duration = effect.duration;
        logStore.addToGameLog(`Effect renewed: ${effect.name}`, true);
      } else {
        // Add new effect
        this.activeEffects.push(effect);
        logStore.addToGameLog(`New effect gained: ${effect.name} - ${effect.description}`, true);
      }
      
      return true;
    },
    
    removeEffect(effectId: string) {
      const logStore = useLogStore();
      const index = this.activeEffects.findIndex(effect => effect.id === effectId);
      
      if (index !== -1) {
        const effect = this.activeEffects[index];
        logStore.addToGameLog(`Effect ended: ${effect.name}`, true);
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
            const logStore = useLogStore();
            logStore.addToGameLog(`Effect ended: ${effect.name}`, true);
            this.activeEffects.splice(index, 1);
          }
        }
      });
    },
    
    // Use a companion's special ability
    useCompanionAbility(companionId: string): boolean {
      // Check if the companion exists and is in a loyal state
      if (!this.animalCompanions.includes(companionId)) {
        return false;
      }
      
      const status = this.companionLoyalty[companionId];
      if (!status || status.state !== CompanionState.LOYAL) {
        return false;
      }
      
      // Get companion info from card store to perform ability
      const cardStore = useCardStore();
      const logStore = useLogStore();
      const companion = cardStore.getCompanionById(companionId);
      
      if (!companion) {
        return false;
      }
      
      logStore.addToGameLog(`You use ${companion.name}'s special ability: ${companion.ability.description}`, true, 'companion');
      
      // Apply ability effects based on companion type
      // (In a real implementation, this would have specific logic for each companion)
      
      return true;
    },
    
    // Get the loyalty status of a companion
    getCompanionStatus(companionId: string): CompanionState {
      if (!this.animalCompanions.includes(companionId)) {
        return CompanionState.LEAVING;
      }
      
      const status = this.companionLoyalty[companionId];
      if (!status) {
        return CompanionState.LOYAL; // Default to loyal if no status is found
      }
      
      return status.state;
    },
    
    // Use a crafted item's effect
    useCraftedItem(itemId: string): boolean {
      // Check if the player has the item
      if (!this.craftedItems.includes(itemId)) {
        return false;
      }
      
      // Get item details from card store
      const cardStore = useCardStore();
      const logStore = useLogStore();
      const item = cardStore.getCraftedItemById(itemId);
      
      if (!item) {
        return false;
      }
      
      logStore.addToGameLog(`You use ${item.name}: ${item.description}`, true, 'crafting');
      
      // Apply item effects based on the type
      // (In a real implementation, this would have specific logic for each item)
      
      // Track item usage - some items might be single-use
      // For now, we'll keep items after use
      
      return true;
    },
    
    // Use a companion to help with a challenge
    useCompanionForChallenge(companionId: string): boolean {
      // Check if the companion exists and is in a loyal state
      if (!this.animalCompanions.includes(companionId)) {
        return false;
      }
      
      const status = this.companionLoyalty[companionId];
      if (!status || status.state !== CompanionState.LOYAL) {
        return false;
      }
      
      // Get companion info from card store
      const cardStore = useCardStore();
      const logStore = useLogStore();
      const companion = cardStore.getCompanionById(companionId);
      
      if (!companion) {
        return false;
      }
      
      logStore.addToGameLog(`${companion.name} helps you with the challenge.`, true, 'companion');
      
      // In a real implementation, this could reduce companion loyalty or have other effects
      
      return true;
    },
    
    // Use a companion to keep watch during the night
    useCompanionForNight(companionId: string): boolean {
      // Check if the companion exists and is in a loyal state
      if (!this.animalCompanions.includes(companionId)) {
        return false;
      }
      
      const status = this.companionLoyalty[companionId];
      if (!status || status.state !== CompanionState.LOYAL) {
        return false;
      }
      
      // Get companion info from card store
      const cardStore = useCardStore();
      const logStore = useLogStore();
      const companion = cardStore.getCompanionById(companionId);
      
      if (!companion) {
        return false;
      }
      
      logStore.addToGameLog(`${companion.name} keeps watch over you during the night.`, true, 'companion');
      
      // In a real implementation, this could reduce companion loyalty or have other effects
      
      return true;
    },
    
    // Get a list of items that can be crafted with current resources
    getCraftableItems(): string[] {
      const cardStore = useCardStore();
      const allCraftableItems = cardStore.getAllCraftedItems().map(item => item.id);
      const craftableItems: string[] = [];
      
      for (const itemId of allCraftableItems) {
        const item = cardStore.getCraftedItemById(itemId);
        if (!item || !item.requiredResources) continue;
        
        // Check if we have all the required resources
        let canCraft = true;
        for (const resourceId of item.requiredResources) {
          if (!this.resources.includes(resourceId)) {
            canCraft = false;
            break;
          }
        }
        
        if (canCraft) {
          craftableItems.push(itemId);
        }
      }
      
      return craftableItems;
    },

    // Craft an item from resources
    craftItem(itemId: string): boolean {
      const cardStore = useCardStore();
      const logStore = useLogStore();
      const item = cardStore.getCraftedItemById(itemId);
      
      if (!item || !item.requiredResources) {
        return false;
      }
      
      // Check if we have all the resources needed
      for (const resourceId of item.requiredResources) {
        if (!this.resources.includes(resourceId)) {
          return false;
        }
      }
      
      // Remove resources used in crafting
      for (const resourceId of item.requiredResources) {
        this.removeResource(resourceId);
      }
      
      // Add the crafted item
      this.addCraftedItem(itemId);
      
      logStore.addToGameLog(`You crafted ${item.name}.`, true, 'crafting');
      
      return true;
    },

    // Rest to recover health
    rest(): boolean {
      const logStore = useLogStore();
      
      // Heal 1 health point when resting
      this.healHealth(1);
      
      logStore.addToGameLog(`You rest and recover. Health is now ${this.health}/${this.maxHealth}.`, true, 'system');
      
      return true;
    },
    
    // Use a companion to help with gathering resources
    useCompanionForGathering(companionId: string): boolean {
      // Check if the companion exists and is in a loyal state
      if (!this.animalCompanions.includes(companionId)) {
        return false;
      }
      
      const status = this.companionLoyalty[companionId];
      if (!status || status.state !== CompanionState.LOYAL) {
        return false;
      }
      
      // Get companion info from card store
      const cardStore = useCardStore();
      const logStore = useLogStore();
      const companion = cardStore.getCompanionById(companionId);
      
      if (!companion) {
        return false;
      }
      
      logStore.addToGameLog(`${companion.name} helps you gather resources.`, true, 'companion');
      
      // In a real implementation, this could reduce companion loyalty or have other effects
      
      return true;
    },
  }
});
