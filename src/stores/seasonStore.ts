import { defineStore } from 'pinia';
import { Season } from '@/models/enums/seasons';
import { SeasonCard } from '@/models/types/cards';
import { TempEffect } from '@/models/types/game';
import { useCardStore } from './cardStore';
import { usePlayerStore } from './playerStore';
import { useLogStore } from './logStore';

interface SeasonState {
  currentSeason: Season;
  tempEffects: TempEffect[];
  ceremonyCompleted: boolean;
}

/**
 * Store for managing seasons and seasonal effects in the game
 */
export const useSeasonStore = defineStore('season', {
  state: (): SeasonState => ({
    currentSeason: Season.SAMHAIN,
    tempEffects: [],
    ceremonyCompleted: false
  }),
  
  getters: {
    /**
     * Get the current season card data
     */
    currentSeasonCard(): SeasonCard | null {
      const cardStore = useCardStore();
      const seasonCard = cardStore.getSeasonById(this.currentSeason);
      return seasonCard || null;
    },
    
    /**
     * Check if a temporary effect is active
     */
    hasTempEffect(): (effectId: string) => boolean {
      return (effectId: string) => {
        return this.tempEffects.some(effect => effect.id === effectId && effect.duration > 0);
      };
    },
    
    /**
     * Get the strength of a temporary effect
     */
    getTempEffectStrength(): (effectId: string) => number {
      return (effectId: string) => {
        const effect = this.tempEffects.find(effect => effect.id === effectId && effect.duration > 0);
        return effect ? effect.strength : 0;
      };
    }
  },
  
  actions: {
    /**
     * Reset the season store to initial state
     */
    reset(): void {
      this.currentSeason = Season.SAMHAIN;
      this.tempEffects = [];
      this.ceremonyCompleted = false;
    },
    
    /**
     * Advance to the next season
     */
    advanceSeason(): void {
      const logStore = useLogStore();
      const playerStore = usePlayerStore();
      
      const seasonOrder = [
        Season.SAMHAIN,
        Season.WINTERS_DEPTH,
        Season.IMBOLC,
        Season.BELTANE,
        Season.LUGHNASADH
      ];
      
      const currentIndex = seasonOrder.indexOf(this.currentSeason);
      if (currentIndex !== -1) {
        const previousSeason = this.currentSeason;
        const newSeasonIndex = (currentIndex + 1) % seasonOrder.length;
        this.currentSeason = seasonOrder[newSeasonIndex];
        
        // Log the season change
        logStore.addToGameLog(`The wheel of the year turns. The season changes from ${this._formatSeason(previousSeason)} to ${this._formatSeason(this.currentSeason)}.`, true, 'phase', {
          previousSeason,
          newSeason: this.currentSeason
        });
        
        // Process seasonal resource changes
        this._processSeasonalResourceChanges(previousSeason, this.currentSeason);
        
        // Update resource availability
        this._updateResourceAvailability();
        
        // Reset ceremony completion
        this.ceremonyCompleted = false;
      }
    },
    
    /**
     * Reverse to the previous season (for special effects)
     */
    reverseSeason(): void {
      const logStore = useLogStore();
      
      const seasonOrder = [
        Season.SAMHAIN,
        Season.WINTERS_DEPTH,
        Season.IMBOLC,
        Season.BELTANE,
        Season.LUGHNASADH
      ];
      
      const currentIndex = seasonOrder.indexOf(this.currentSeason);
      if (currentIndex !== -1) {
        const previousSeason = this.currentSeason;
        const newSeasonIndex = (currentIndex - 1 + seasonOrder.length) % seasonOrder.length;
        this.currentSeason = seasonOrder[newSeasonIndex];
        
        logStore.addToGameLog(`A strange temporal shift occurs. The wheel of the year reverses from ${this._formatSeason(previousSeason)} to ${this._formatSeason(this.currentSeason)}.`, true, 'phase', {
          previousSeason,
          newSeason: this.currentSeason
        });
        
        // Update resource availability
        this._updateResourceAvailability();
      }
    },
    
    /**
     * Add a temporary effect to the game
     */
    addTempEffect(effectId: string, name: string, description: string, strength: number, duration: number): void {
      const logStore = useLogStore();
      
      // Check if effect already exists
      const existingEffect = this.tempEffects.find(effect => effect.id === effectId);
      
      if (existingEffect) {
        // Update existing effect
        existingEffect.duration = Math.max(existingEffect.duration, duration);
        existingEffect.strength = Math.max(existingEffect.strength, strength);
        
        logStore.addToGameLog(`The effect "${name}" has been strengthened.`, false, 'system');
      } else {
        // Add new effect
        this.tempEffects.push({
          id: effectId,
          name,
          description,
          strength,
          duration
        });
        
        logStore.addToGameLog(`A new effect has begun: "${name}". ${description}`, true, 'system');
      }
    },
    
    /**
     * Remove a temporary effect from the game
     */
    removeTempEffect(effectId: string): boolean {
      const index = this.tempEffects.findIndex(effect => effect.id === effectId);
      if (index !== -1) {
        const effect = this.tempEffects[index];
        this.tempEffects.splice(index, 1);
        
        const logStore = useLogStore();
        logStore.addToGameLog(`The effect "${effect.name}" has ended.`, false, 'system');
        
        return true;
      }
      return false;
    },
    
    /**
     * Process all temporary effects, reducing their duration
     */
    processTempEffects(): void {
      const expiredEffects: string[] = [];
      
      // Reduce duration of all effects
      this.tempEffects.forEach(effect => {
        effect.duration--;
        if (effect.duration <= 0) {
          expiredEffects.push(effect.id);
        }
      });
      
      // Remove expired effects
      expiredEffects.forEach(effectId => {
        this.removeTempEffect(effectId);
      });
    },
    
    /**
     * Get the seasonal modifier for resource gathering
     */
    getSeasonalResourceModifier(): number {
      switch (this.currentSeason) {
        case Season.BELTANE:
          return 2; // Abundance
        case Season.LUGHNASADH:
          return 1; // Harvest
        case Season.SAMHAIN:
          return 0; // Neutral
        case Season.IMBOLC:
          return -1; // Scarcity
        case Season.WINTERS_DEPTH:
          return -2; // Hardship
        default:
          return 0;
      }
    },
    
    /**
     * Complete a seasonal ceremony
     */
    completeSeasonalCeremony(): void {
      if (!this.ceremonyCompleted) {
        const logStore = useLogStore();
        const playerStore = usePlayerStore();
        
        this.ceremonyCompleted = true;
        playerStore.addExperience(1);
        
        logStore.addToGameLog(
          `You completed the seasonal ceremony for ${this._formatSeason(this.currentSeason)}. You gain wisdom and insight.`, 
          true, 
          'system'
        );
      }
    },
    
    /**
     * Process resource changes during seasonal transitions
     * @private
     */
    _processSeasonalResourceChanges(previousSeason: Season, newSeason: Season): void {
      const logStore = useLogStore();
      const playerStore = usePlayerStore();
      const cardStore = useCardStore();
      
      // Different resource effects based on season transitions
      if (previousSeason === Season.SAMHAIN && newSeason === Season.WINTERS_DEPTH) {
        // Entering Winter's Depth - possible resource loss
        if (playerStore.resources.length > 0 && this._rollD8() <= 3) {
          const lostResource = playerStore.resources[Math.floor(Math.random() * playerStore.resources.length)];
          playerStore.removeResource(lostResource);
          
          const resourceName = cardStore.getResourceById(lostResource)?.name || lostResource;
          logStore.addToGameLog(`As the cold deepens, you lose ${resourceName} to the harsh conditions.`, true, 'resource');
        }
      } else if (previousSeason === Season.WINTERS_DEPTH && newSeason === Season.IMBOLC) {
        // Entering Imbolc - healing opportunity
        if (playerStore.health < playerStore.maxHealth) {
          playerStore.healHealth(1);
          logStore.addToGameLog(`The first stirrings of spring bring renewal. You recover 1 health.`, true, 'system');
        }
      } else if (previousSeason === Season.IMBOLC && newSeason === Season.BELTANE) {
        // Entering Beltane - resource abundance
        const availableResources = cardStore.getResourcesBySeason(Season.BELTANE).map(r => r.id);
        if (availableResources.length > 0 && !playerStore.isResourceCapacityReached) {
          const newResource = availableResources[Math.floor(Math.random() * availableResources.length)];
          playerStore.addResource(newResource);
          
          const resourceName = cardStore.getResourceById(newResource)?.name || newResource;
          logStore.addToGameLog(`The abundance of Beltane brings you ${resourceName}.`, true, 'resource');
        }
      } else if (previousSeason === Season.BELTANE && newSeason === Season.LUGHNASADH) {
        // Entering Lughnasadh - wisdom gain
        playerStore.addExperience(1);
        logStore.addToGameLog(`The harvest season brings wisdom. You gain 1 experience.`, true, 'system');
      } else if (previousSeason === Season.LUGHNASADH && newSeason === Season.SAMHAIN) {
        // Full cycle completed - special reward
        playerStore.addExperience(1);
        logStore.addToGameLog(`You have completed a full cycle of the seasons. The spirits reward your perseverance with insight.`, true, 'system');
      }
    },
    
    /**
     * Update resource availability based on current season
     * @private
     */
    _updateResourceAvailability(): void {
      // This is just a placeholder for resource availability update logic
      const logStore = useLogStore();
      logStore.addToGameLog(`Resource availability has shifted with the season.`, false, 'resource');
    },
    
    /**
     * Update resource availability based on current season
     * Public method to be called from other stores
     */
    updateResourceAvailability(): void {
      this._updateResourceAvailability();
    },
    
    /**
     * Format season name for display
     * @private
     */
    _formatSeason(season: Season): string {
      const nameMap: Record<Season, string> = {
        [Season.SAMHAIN]: 'Samhain',
        [Season.WINTERS_DEPTH]: 'Winter\'s Depth',
        [Season.IMBOLC]: 'Imbolc',
        [Season.BELTANE]: 'Beltane',
        [Season.LUGHNASADH]: 'Lughnasadh'
      };
      
      return nameMap[season] || 'Unknown Season';
    },
    
    /**
     * Roll a D8 dice (1-8)
     * @private
     */
    _rollD8(): number {
      return Math.floor(Math.random() * 8) + 1;
    }
  }
});
