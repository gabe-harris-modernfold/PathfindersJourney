import { defineStore } from 'pinia';
import { ChallengeOutcome } from '@/models/types/game';
import { useCardStore } from './cardStore';
import { usePlayerStore } from './playerStore';
import { useLogStore } from '@/stores/logStore';
import { useSeasonStore } from './seasonStore';

interface ChallengeState {
  currentChallenge: string | null;
  challengeHistory: { id: string, outcome: string, turn: number }[];
  threatTokens: number;
  blessingTokens: number;
}

/**
 * Store for managing challenges and their outcomes
 */
export const useChallenge = defineStore('challenge', {
  state: (): ChallengeState => ({
    currentChallenge: null,
    challengeHistory: [],
    threatTokens: 0,
    blessingTokens: 0
  }),
  
  getters: {
    /**
     * Calculate the current threat level
     */
    threatLevel(): number {
      return Math.floor(this.threatTokens / 3);
    }
  },
  
  actions: {
    /**
     * Reset the challenge store to initial state
     */
    reset(): void {
      this.currentChallenge = null;
      this.challengeHistory = [];
      this.threatTokens = 0;
      this.blessingTokens = 0;
    },
    
    /**
     * Set the current challenge by ID
     */
    setCurrentChallenge(challengeId: string | null): void {
      const logStore = useLogStore();
      const cardStore = useCardStore();
      
      this.currentChallenge = challengeId;
      
      if (challengeId) {
        const challenge = cardStore.getChallengeById(challengeId);
        
        if (challenge) {
          logStore.addToGameLog(
            `A challenge appears: ${challenge.name}. ${challenge.description}`, 
            true, 
            'challenge', 
            {challengeId, challengeType: challenge.type}
          );
          
          // Describe difficulty
          const difficultyText = this._getDifficultyDescription(challenge.difficulty);
          logStore.addToGameLog(
            `This appears to be a ${difficultyText} challenge.`, 
            false, 
            'challenge'
          );
        }
      } else {
        logStore.addToGameLog('The challenge has been resolved.', false, 'challenge');
      }
    },
    
    /**
     * Add threat tokens to the game
     */
    addThreatTokens(amount: number): number {
      const logStore = useLogStore();
      
      if (amount <= 0) return this.threatTokens;
      
      const previousThreatLevel = this.threatLevel;
      this.threatTokens += amount;
      const newThreatLevel = this.threatLevel;
      
      logStore.addToGameLog(
        `You gain ${amount} threat ${amount === 1 ? 'token' : 'tokens'}. Total: ${this.threatTokens}`, 
        false, 
        'system', 
        {threatTokens: this.threatTokens}
      );
      
      // Alert if threat level increased
      if (newThreatLevel > previousThreatLevel) {
        logStore.addToGameLog(
          `Warning: Threat level has increased to ${newThreatLevel}!`, 
          true, 
          'system', 
          {threatLevel: newThreatLevel}
        );
      }
      
      return this.threatTokens;
    },
    
    /**
     * Remove threat tokens from the game
     */
    removeThreatTokens(amount: number): number {
      const logStore = useLogStore();
      
      if (amount <= 0) return this.threatTokens;
      
      const previousThreatLevel = this.threatLevel;
      this.threatTokens = Math.max(0, this.threatTokens - amount);
      const newThreatLevel = this.threatLevel;
      
      logStore.addToGameLog(
        `You remove ${amount} threat ${amount === 1 ? 'token' : 'tokens'}. Total: ${this.threatTokens}`, 
        false, 
        'system', 
        {threatTokens: this.threatTokens}
      );
      
      // Alert if threat level decreased
      if (newThreatLevel < previousThreatLevel) {
        logStore.addToGameLog(
          `The threat level has decreased to ${newThreatLevel}.`, 
          false, 
          'system', 
          {threatLevel: newThreatLevel}
        );
      }
      
      return this.threatTokens;
    },
    
    /**
     * Handle the threat level check phase
     */
    handleThreatLevelCheck(): void {
      const logStore = useLogStore();
      
      if (this.threatLevel <= 0) {
        logStore.addToGameLog('Threat level check: All is calm in the realm.', false, 'system');
        return;
      }
      
      logStore.addToGameLog(`Threat level check: Current threat level is ${this.threatLevel}.`, true, 'system');
      
      // Roll to determine if a random event occurs
      const roll = this._rollD8();
      
      if (roll <= this.threatLevel) {
        // Trigger random event
        logStore.addToGameLog(`The high threat level has attracted unwanted attention! (Roll: ${roll}, Threat: ${this.threatLevel})`, true, 'system');
        this.triggerRandomEvent();
      } else {
        logStore.addToGameLog(`You evade any ill effects of the threat... for now. (Roll: ${roll}, Threat: ${this.threatLevel})`, false, 'system');
      }
    },
    
    /**
     * Trigger a random event based on threat level
     */
    triggerRandomEvent(): void {
      const logStore = useLogStore();
      const playerStore = usePlayerStore();
      
      const events = [
        {
          name: "Resource Theft",
          description: "Something has stolen from your supplies!",
          effect: () => {
            if (playerStore.resources.length > 0) {
              playerStore.loseRandomResources(1);
            } else {
              logStore.addToGameLog("Fortunately, you had nothing of value to lose.", false, 'system');
            }
          }
        },
        {
          name: "Minor Injury",
          description: "You sustain a minor injury while traveling.",
          effect: () => {
            playerStore.loseHealth(1);
            logStore.addToGameLog("You lose 1 health point.", false, 'system');
          }
        },
        {
          name: "Lost Path",
          description: "You've become disoriented and lost precious time.",
          effect: () => {
            logStore.addToGameLog("Your journey progress is delayed.", false, 'system');
            // Note: In the refactored version, this would call journeyStore.advanceJourney(-1)
          }
        },
        {
          name: "Harsh Weather",
          description: "A sudden change in weather makes travel difficult.",
          effect: () => {
            const seasonStore = useSeasonStore();
            seasonStore.addTempEffect('harsh_weather', 'Harsh Weather', 'Travel and resource gathering are more difficult.', 1, 2);
          }
        },
        {
          name: "Wildlife Encounter",
          description: "You encounter hostile wildlife!",
          effect: () => {
            // Determine outcome based on player's survival skill
            const survivalSkill = playerStore.character?.survival || 0;
            const roll = this._rollD8();
            
            if (roll + survivalSkill >= 6) {
              logStore.addToGameLog("You successfully navigate the encounter without harm.", false, 'system');
              playerStore.addExperience(1);
            } else {
              playerStore.loseHealth(1);
              logStore.addToGameLog("The encounter leaves you injured. You lose 1 health.", true, 'system');
            }
          }
        }
      ];
      
      // Higher threat levels can trigger otherworldly manifestations
      if (this.threatLevel >= 3 && this._rollD8() >= 6) {
        this.triggerOtherworldlyManifestation();
        return;
      }
      
      // Select a random event
      const event = events[Math.floor(Math.random() * events.length)];
      
      logStore.addToGameLog(`Random Event: ${event.name}`, true, 'system');
      logStore.addToGameLog(event.description, false, 'system');
      
      // Apply the event effect
      event.effect();
    },
    
    /**
     * Trigger an otherworldly manifestation (higher-level threat event)
     */
    triggerOtherworldlyManifestation(): void {
      const logStore = useLogStore();
      const playerStore = usePlayerStore();
      const seasonStore = useSeasonStore();
      
      const manifestations = [
        {
          name: "Fae Mischief",
          description: "The fae folk have taken an interest in your journey, playing tricks on you.",
          effect: () => {
            if (playerStore.resources.length >= 2) {
              // Swap two random resources
              const resourceIndices = [];
              while (resourceIndices.length < 2) {
                const idx = Math.floor(Math.random() * playerStore.resources.length);
                if (!resourceIndices.includes(idx)) {
                  resourceIndices.push(idx);
                }
              }
              
              // Swap resources
              const tempResource = playerStore.resources[resourceIndices[0]];
              playerStore.resources[resourceIndices[0]] = playerStore.resources[resourceIndices[1]];
              playerStore.resources[resourceIndices[1]] = tempResource;
              
              logStore.addToGameLog("The fae have rearranged your supplies. Some items seem changed.", true, 'system');
            } else {
              // Add a random new resource
              const cardStore = useCardStore();
              const allResources = cardStore.resources.map(r => r.id);
              const randomResource = allResources[Math.floor(Math.random() * allResources.length)];
              
              playerStore.addResource(randomResource);
              logStore.addToGameLog(`The fae have left you a gift: ${cardStore.getResourceById(randomResource)?.name || randomResource}.`, true, 'system');
            }
          }
        },
        {
          name: "Spirit Visitation",
          description: "An ancestral spirit appears before you with cryptic wisdom.",
          effect: () => {
            playerStore.addExperience(2);
            logStore.addToGameLog("The spirit imparts ancient wisdom. You gain 2 experience points.", true, 'system');
            
            // Add a temporary effect
            seasonStore.addTempEffect('spirit_blessing', 'Spirit Blessing', 'Your connection to the spirit world is strengthened.', 2, 3);
          }
        },
        {
          name: "Time Anomaly",
          description: "Reality shifts around you, and you find yourself experiencing time differently.",
          effect: () => {
            // Reverse the season
            seasonStore.reverseSeason();
            
            logStore.addToGameLog("The flow of time itself seems altered around you.", true, 'system');
          }
        },
        {
          name: "Otherworldly Hunt",
          description: "The Wild Hunt passes through the mortal realm, bringing chaos in their wake.",
          effect: () => {
            // More severe consequences
            playerStore.loseHealth(2);
            playerStore.loseRandomResources(2);
            
            logStore.addToGameLog("The Hunt's passage leaves destruction in its wake. You lose 2 health and some resources.", true, 'system');
            
            // But also some benefit
            playerStore.addExperience(3);
            logStore.addToGameLog("Having witnessed such ancient power, you gain significant insight. +3 experience.", true, 'system');
          }
        },
        {
          name: "Gateway Between Worlds",
          description: "A sudden rift opens between the mortal realm and the Otherworld.",
          effect: () => {
            // This could lead to a special challenge or opportunity
            const roll = this._rollD8();
            
            if (roll >= 4) {
              // Positive outcome
              playerStore.healHealth(Math.min(3, playerStore.maxHealth - playerStore.health));
              logStore.addToGameLog("Healing energies flow from the rift, restoring your vitality. You recover up to 3 health.", true, 'system');
            } else {
              // Negative outcome
              this.addThreatTokens(2);
              logStore.addToGameLog("Dark energies escape from the rift, increasing the threat in the area. +2 threat tokens.", true, 'system');
            }
          }
        }
      ];
      
      // Select a random manifestation
      const manifestation = manifestations[Math.floor(Math.random() * manifestations.length)];
      
      logStore.addToGameLog(`Otherworldly Manifestation: ${manifestation.name}`, true, 'system');
      logStore.addToGameLog(manifestation.description, true, 'system');
      
      // Apply the manifestation effect
      manifestation.effect();
    },
    
    /**
     * Resolve a challenge based on roll and difficulty
     */
    resolveChallenge(totalRoll: number, difficulty: number): 'SUCCESS' | 'PARTIAL' | 'FAILURE' {
      const logStore = useLogStore();
      
      let outcome: 'SUCCESS' | 'PARTIAL' | 'FAILURE';
      let outcomeText: string;
      
      // Determine outcome
      if (totalRoll >= difficulty + 2) {
        // Outstanding success
        outcome = 'SUCCESS';
        outcomeText = 'Outstanding Success';
        this.addChallengeHistory(this.currentChallenge, 'SUCCESS');
        
        // Reduce threat
        this.removeThreatTokens(1);
        
        logStore.addToGameLog(`Challenge outcome: ${outcomeText}! (Roll: ${totalRoll}, Needed: ${difficulty})`, true, 'challenge');
        logStore.addToGameLog('Your exceptional performance reduces the threat level.', false, 'challenge');
      } else if (totalRoll >= difficulty) {
        // Success
        outcome = 'SUCCESS';
        outcomeText = 'Success';
        this.addChallengeHistory(this.currentChallenge, 'SUCCESS');
        
        logStore.addToGameLog(`Challenge outcome: ${outcomeText}. (Roll: ${totalRoll}, Needed: ${difficulty})`, true, 'challenge');
      } else if (totalRoll >= difficulty - 2) {
        // Partial success
        outcome = 'PARTIAL';
        outcomeText = 'Partial Success';
        this.addChallengeHistory(this.currentChallenge, 'PARTIAL');
        
        logStore.addToGameLog(`Challenge outcome: ${outcomeText}. (Roll: ${totalRoll}, Needed: ${difficulty})`, true, 'challenge');
        logStore.addToGameLog('You succeed, but not without some cost.', false, 'challenge');
      } else {
        // Failure
        outcome = 'FAILURE';
        outcomeText = 'Failure';
        this.addChallengeHistory(this.currentChallenge, 'FAILURE');
        
        // Increase threat
        this.addThreatTokens(1);
        
        logStore.addToGameLog(`Challenge outcome: ${outcomeText}. (Roll: ${totalRoll}, Needed: ${difficulty})`, true, 'challenge');
        logStore.addToGameLog('Your failure increases the threat level.', false, 'challenge');
      }
      
      return outcome;
    },
    
    /**
     * Add an entry to the challenge history
     */
    addChallengeHistory(challengeId: string | null, outcome: string): void {
      if (challengeId) {
        this.challengeHistory.push({
          id: challengeId,
          outcome,
          turn: 0 // In the refactored version, this would use gameStore.currentTurn
        });
      }
    },
    
    /**
     * Roll a D8 dice (1-8)
     * @private
     */
    _rollD8(): number {
      return Math.floor(Math.random() * 8) + 1;
    },
    
    /**
     * Get a text description of a challenge difficulty
     * @private
     */
    _getDifficultyDescription(difficulty: number): string {
      if (difficulty <= 3) return 'simple';
      if (difficulty <= 5) return 'moderate';
      if (difficulty <= 7) return 'challenging';
      return 'extremely difficult';
    }
  }
});
