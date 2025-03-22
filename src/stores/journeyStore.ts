import { defineStore } from 'pinia';
import { LandscapeCard } from '@/models/types/cards';
import { useCardStore } from './cardStore';
import { useLogStore } from '@/stores/logStore';
import { usePlayerStore } from './playerStore';

interface JourneyState {
  currentLandscapeId: string;
  visitedLandscapes: string[];
  journeyProgress: number;
  journeyPath: string[];
  journeyComplete: boolean;
  wisdom: number;
}

// Extended landscape interface to accommodate the properties we need
interface ExtendedLandscapeCard extends LandscapeCard {
  arrivalEvent?: string;
  arrivalEffects?: {
    resources?: string[];
    health?: number;
  };
  wisdomGained?: boolean;
}

/**
 * Store for managing the player's journey through landscapes
 */
export const useJourneyStore = defineStore('journey', {
  state: (): JourneyState => ({
    currentLandscapeId: '',
    visitedLandscapes: [],
    journeyProgress: 0,
    journeyPath: [],
    journeyComplete: false,
    wisdom: 0
  }),
  
  getters: {
    /**
     * Get the current landscape card data
     */
    currentLandscape(): ExtendedLandscapeCard | null {
      const cardStore = useCardStore();
      const landscape = cardStore.getLandscapeById(this.currentLandscapeId);
      return landscape as ExtendedLandscapeCard || null;
    },
    
    /**
     * Calculate the journey progress as a percentage
     */
    journeyPercentage(): number {
      return Math.min(100, Math.round((this.journeyProgress / 10) * 100));
    }
  },
  
  actions: {
    /**
     * Reset the journey store to initial state
     */
    reset(): void {
      this.currentLandscapeId = '';
      this.visitedLandscapes = [];
      this.journeyProgress = 0;
      this.journeyPath = [];
      this.journeyComplete = false;
      this.wisdom = 0;
    },
    
    /**
     * Set the current landscape by ID
     */
    setCurrentLandscape(landscapeId: string): void {
      const logStore = useLogStore();
      const playerStore = usePlayerStore();
      const cardStore = useCardStore();
      
      // If we're already at this landscape, do nothing
      if (this.currentLandscapeId === landscapeId) {
        return;
      }
      
      const previousLandscapeId = this.currentLandscapeId;
      this.currentLandscapeId = landscapeId;
      
      // Add to visited landscapes if not already visited
      this.addVisitedLandscape(landscapeId);
      
      // Add to journey path
      this.journeyPath.push(landscapeId);
      
      // Get landscape data
      const landscape = cardStore.getLandscapeById(landscapeId) as ExtendedLandscapeCard;
      
      if (landscape) {
        // Log the journey
        if (previousLandscapeId) {
          const previousLandscape = cardStore.getLandscapeById(previousLandscapeId);
          if (previousLandscape) {
            logStore.addToGameLog(
              `You journey from ${previousLandscape.name} to ${landscape.name}.`, 
              true, 
              'action', 
              {
                fromLandscape: previousLandscapeId, 
                toLandscape: landscapeId
              }
            );
          }
        } else {
          logStore.addToGameLog(
            `You begin your journey at ${landscape.name}.`, 
            true, 
            'action', 
            {toLandscape: landscapeId}
          );
        }
        
        // Handle arrival events
        if (landscape.arrivalEvent) {
          logStore.addToGameLog(landscape.arrivalEvent, true, 'action');
        }
        
        // Special arrival effects
        if (landscape.arrivalEffects) {
          // Handle resource gain
          if (landscape.arrivalEffects.resources && landscape.arrivalEffects.resources.length > 0) {
            landscape.arrivalEffects.resources.forEach(resourceId => {
              if (!playerStore.isResourceCapacityReached) {
                playerStore.addResource(resourceId);
                const resourceName = cardStore.getResourceById(resourceId)?.name || resourceId;
                logStore.addToGameLog(`You found ${resourceName} at ${landscape.name}.`, false, 'resource');
              }
            });
          }
          
          // Handle health changes
          if (landscape.arrivalEffects.health) {
            if (landscape.arrivalEffects.health > 0) {
              playerStore.healHealth(landscape.arrivalEffects.health);
              logStore.addToGameLog(`The healing properties of ${landscape.name} restore ${landscape.arrivalEffects.health} health.`, true, 'system');
            } else if (landscape.arrivalEffects.health < 0) {
              playerStore.loseHealth(Math.abs(landscape.arrivalEffects.health));
              logStore.addToGameLog(`The harsh conditions at ${landscape.name} cause you to lose ${Math.abs(landscape.arrivalEffects.health)} health.`, true, 'system');
            }
          }
        }
      }
    },
    
    /**
     * Add a landscape to the visited list
     */
    addVisitedLandscape(landscapeId: string): void {
      const logStore = useLogStore();
      const cardStore = useCardStore();
      
      if (!this.visitedLandscapes.includes(landscapeId)) {
        this.visitedLandscapes.push(landscapeId);
        
        // Award experience for discovering new locations
        const playerStore = usePlayerStore();
        playerStore.addExperience(1);
        
        const landscape = cardStore.getLandscapeById(landscapeId) as ExtendedLandscapeCard;
        if (landscape) {
          logStore.addToGameLog(
            `You have discovered ${landscape.name}. You gain 1 experience.`, 
            true, 
            'system', 
            {newLocation: landscapeId}
          );
          
          // Check for wisdom gain at sacred sites
          if (landscape.type && landscape.type.toString() === 'Sacred Site' && !landscape.wisdomGained) {
            this.wisdom += 1;
            landscape.wisdomGained = true;
            logStore.addToGameLog(
              `The sacred energy of this site fills you with wisdom.`, 
              true, 
              'system'
            );
          }
        }
      }
    },
    
    /**
     * Advance the journey progress by a number of steps
     */
    advanceJourney(steps: number): void {
      const logStore = useLogStore();
      
      this.journeyProgress += steps;
      logStore.addToGameLog(
        `Your journey progresses by ${steps} steps. Total progress: ${this.journeyPercentage}%`, 
        false, 
        'system', 
        {currentProgress: this.journeyProgress}
      );
      
      // Check if journey is complete
      if (this.journeyPercentage >= 100 && !this.journeyComplete) {
        this.completeJourney(true);
      }
    },
    
    /**
     * Complete the journey (successful or not)
     */
    completeJourney(isVictory: boolean): void {
      const logStore = useLogStore();
      
      this.journeyComplete = true;
      
      if (isVictory) {
        logStore.addToGameLog(
          'You have completed your journey through the Celtic lands!', 
          true, 
          'system'
        );
      } else {
        logStore.addToGameLog(
          'Your journey has come to an end before reaching your destination.', 
          true, 
          'system'
        );
      }
    }
  }
});
