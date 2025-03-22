import { defineStore } from 'pinia';
import { GamePhase } from '@/models/enums/phases';
import { VictoryConditions } from '@/models/types/game';
import { usePlayerStore } from './playerStore';
import { useSeasonStore } from './seasonStore';
import { useJourneyStore } from './journeyStore';
import { useChallenge } from './challengeStore';
import { useLogStore } from './logStore';
import { useCardStore } from './cardStore';
import { victoryService } from '@/services/victoryService';
import { Season } from '@/models/enums/seasons'; // Import the Season enum

interface GameState {
  currentPhase: GamePhase;
  currentTurn: number;
  gameStarted: boolean;
  gameOver: boolean;
  isVictory: boolean;
  victoryConditions: VictoryConditions;
  currentLandscapeId: string;
  currentSeason?: string;
  currentLandscape?: any;
  currentChallenge?: any;
  journeyProgress?: number;
  journeyPath?: any[];
  threatTokens?: number;
  blessingTokens?: number;
  visitedLandscapes?: string[];
  journeyComplete?: boolean;
}

/**
 * Main game store for overall game state management
 * Coordinates between other domain-specific stores
 */
export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    currentPhase: GamePhase.SEASONAL_ASSESSMENT,
    currentTurn: 1,
    gameStarted: false,
    gameOver: false,
    isVictory: false,
    victoryConditions: {
      journeyCompleted: false,
      balanceMaintained: false,
      knowledgeAcquired: false,
      bondsFormed: false,
      questFulfilled: false,
      landscapesTraversed: false,
      seasonsExperienced: false,
      challengesOvercome: false
    },
    currentLandscapeId: '',
    currentSeason: undefined,
    currentLandscape: undefined,
    currentChallenge: undefined,
    journeyProgress: undefined,
    journeyPath: undefined,
    threatTokens: undefined,
    blessingTokens: undefined,
    visitedLandscapes: undefined,
    journeyComplete: undefined
  }),
  
  getters: {
    /**
     * Check if the game is over
     */
    isGameOver(): boolean {
      return this.gameOver;
    },
    
    /**
     * Check if the player has won
     */
    hasWon(): boolean {
      return this.isVictory;
    }
  },
  
  actions: {
    /**
     * Start a new game
     */
    startGame(): void {
      const seasonStore = useSeasonStore();
      const logStore = useLogStore();
      
      this.gameStarted = true;
      this.currentPhase = GamePhase.SEASONAL_ASSESSMENT;
      this.currentTurn = 1;
      
      // Reset all domain-specific stores
      seasonStore.reset();
      useJourneyStore().reset();
      useChallenge().reset();
      
      logStore.addToGameLog('Your journey begins in the season of Samhain, when the veil between worlds is thinnest.', true);
    },
    
    /**
     * Reset the game state
     */
    resetGame(): void {
      // Reset main game state
      this.currentPhase = GamePhase.SEASONAL_ASSESSMENT;
      this.currentTurn = 1;
      this.gameStarted = false;
      this.gameOver = false;
      this.isVictory = false;
      this.victoryConditions = {
        journeyCompleted: false,
        balanceMaintained: false,
        knowledgeAcquired: false,
        bondsFormed: false,
        questFulfilled: false,
        landscapesTraversed: false,
        seasonsExperienced: false,
        challengesOvercome: false
      };
      this.currentLandscapeId = '';
      this.currentSeason = undefined;
      this.currentLandscape = undefined;
      this.currentChallenge = undefined;
      this.journeyProgress = undefined;
      this.journeyPath = undefined;
      this.threatTokens = undefined;
      this.blessingTokens = undefined;
      this.visitedLandscapes = undefined;
      this.journeyComplete = undefined;
      
      // Reset all domain-specific stores
      useSeasonStore().reset();
      useJourneyStore().reset();
      useChallenge().reset();
      useLogStore().reset();
      usePlayerStore().resetPlayer();
    },
    
    /**
     * End the game
     */
    endGame(isVictory: boolean): void {
      const logStore = useLogStore();
      
      this.gameOver = true;
      this.isVictory = isVictory;
      
      if (isVictory) {
        logStore.addToGameLog('Congratulations! You have completed your journey through the Celtic Realm.', true);
      } else {
        logStore.addToGameLog('Your journey has come to an end. The Celtic Realm remains shrouded in mystery.', true);
      }
      
      this.currentPhase = GamePhase.GAME_OVER;
    },
    
    /**
     * Set the current game phase
     */
    setPhase(phase: GamePhase): void {
      const logStore = useLogStore();
      
      this.currentPhase = phase;
      logStore.addToGameLog(`Entering the ${this._formatPhase(phase)} phase.`);
    },
    
    /**
     * Advance to the next game phase
     */
    advancePhase(): void {
      const logStore = useLogStore();
      const journeyStore = useJourneyStore();
      
      const phaseOrder = [
        GamePhase.SETUP,
        GamePhase.CHARACTER_SELECTION,
        GamePhase.SEASONAL_ASSESSMENT,
        GamePhase.THREAT_LEVEL_CHECK,
        GamePhase.LANDSCAPE_CHALLENGE,
        GamePhase.CHALLENGE_RESOLUTION,
        GamePhase.RESOURCE_MANAGEMENT,
        GamePhase.ANIMAL_COMPANION,
        GamePhase.CRAFTING,
        GamePhase.JOURNEY_PROGRESSION,
        GamePhase.EXPLORATION
      ];
      
      const currentIndex = phaseOrder.indexOf(this.currentPhase);
      if (currentIndex !== -1) {
        const previousPhase = this.currentPhase;
        
        // Special handling for Exploration phase completion - move to next landscape
        if (this.currentPhase === GamePhase.EXPLORATION) {
          // Get the next landscape if available
          if (this.journeyProgress < journeyStore.journeyPath.length - 1) {
            // Log completion of current landscape exploration
            const currentLandscapeName = this.getCurrentLandscapeName();
            if (currentLandscapeName) {
              logStore.addToGameLog(`You have completed your exploration of ${currentLandscapeName}.`, true, 'phase');
            }
            
            // Move to next landscape
            this.journeyProgress++;
            this.currentLandscapeId = journeyStore.journeyPath[this.journeyProgress];
            
            // Log arrival at new landscape
            const newLandscapeName = this.getCurrentLandscapeName();
            if (newLandscapeName) {
              logStore.addToGameLog(`Arrived at ${newLandscapeName}.`, true, 'phase');
            }
          }
          
          // Set directly to Seasonal Assessment instead of cycling through
          this.currentPhase = GamePhase.SEASONAL_ASSESSMENT;
        } else {
          // Normal phase advancement for non-Exploration phases
          this.currentPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];
        }
        
        // Log the phase transition
        logStore.addToGameLog(`Entering the ${this._formatPhase(this.currentPhase)} phase.`, true, 'phase', {
          previousPhase,
          newPhase: this.currentPhase
        });
      }
    },
    
    /**
     * Advance to the next turn
     */
    advanceTurn(): void {
      const logStore = useLogStore();
      const seasonStore = useSeasonStore();
      
      this.currentTurn++;
      logStore.addToGameLog(`Turn ${this.currentTurn} has begun.`, true, 'system', {
        newTurn: this.currentTurn,
        currentSeason: this._formatSeason(seasonStore.currentSeason)
      });
      
      // Process any temporary effects
      seasonStore.processTempEffects();
      
      // Check if we need to advance the season
      if (this.currentTurn % 3 === 0) {
        seasonStore.advanceSeason();
      }
      
      // Check victory conditions
      this.checkVictoryConditions();
    },
    
    /**
     * Check if victory conditions have been met
     */
    checkVictoryConditions(): boolean {
      // Use the victory service to check all conditions
      const result = victoryService.checkVictoryConditions();
      this.victoryConditions = result;
      
      // Check if all required victory conditions are met
      const allConditionsMet = Object.values(result).every(condition => condition);
      
      if (allConditionsMet) {
        this.endGame(true);
        return true;
      }
      
      return false;
    },
    
    /**
     * Set the current landscape ID
     * @param landscapeId The ID of the landscape to set as current
     */
    setCurrentLandscapeId(landscapeId: string): void {
      const logStore = useLogStore();
      const cardStore = useCardStore();
      
      this.currentLandscapeId = landscapeId;
      // Also set the currentLandscape for backward compatibility
      this.currentLandscape = landscapeId;
      
      const landscape = cardStore.getLandscapeById(landscapeId);
      if (landscape) {
        logStore.addToGameLog(`You have arrived at ${landscape.name}.`, true, 'system');
      }
    },
    
    /**
     * Set current landscape
     * Supports both string ID and landscape object
     * @param landscape The landscape ID (string) or object to set as current
     */
    setCurrentLandscape(landscape: string | any): void {
      if (typeof landscape === 'string') {
        // It's a landscape ID
        this.currentLandscape = landscape;
        this.currentLandscapeId = landscape;
      } else if (landscape && typeof landscape === 'object') {
        // It's a landscape object
        this.currentLandscape = landscape.id || '';
        this.currentLandscapeId = landscape.id || '';
      }
    },
    
    /**
     * Advance the journey by a number of steps
     * This delegates to journeyStore.advanceJourney
     * @param steps Number of steps to advance
     */
    advanceJourney(steps: number): void {
      const journeyStore = useJourneyStore();
      journeyStore.advanceJourney(steps);
    },
    
    /**
     * Advance to the next season
     * This delegates to seasonStore.advanceSeason
     */
    advanceSeason(): void {
      const seasonStore = useSeasonStore();
      seasonStore.advanceSeason();
    },
    
    /**
     * Update resource availability based on current season
     * This delegates to seasonStore._updateResourceAvailability
     */
    updateResourceAvailability(): void {
      const seasonStore = useSeasonStore();
      // Using private method via any type cast
      (seasonStore as any)._updateResourceAvailability();
    },
    
    /**
     * Set the current challenge
     * @param challenge The challenge to set as current
     */
    setCurrentChallenge(challenge: any): void {
      this.currentChallenge = challenge;
    },
    
    /**
     * Add to the game log
     * @param message The message to add to the log
     * @param isHighlighted Whether the log entry should be highlighted
     * @param type The type of log entry
     * @param data Any additional data to include with the log entry
     */
    addToGameLog(message: string, isHighlighted?: boolean, type?: 'phase' | 'action' | 'challenge' | 'resource' | 'companion' | 'crafting' | 'system' | 'error' | 'debug', data?: any): void {
      const logStore = useLogStore();
      logStore.addToGameLog(message, isHighlighted, type, data);
    },
    
    /**
     * Add threat tokens
     * @param amount The amount of threat tokens to add
     */
    addThreatTokens(amount: number): void {
      if (!this.threatTokens) this.threatTokens = 0;
      this.threatTokens += amount;
      this.addToGameLog(`Added ${amount} threat tokens. Current total: ${this.threatTokens}`);
    },
    
    /**
     * Add temporary effect
     * @param effect The effect to add
     * @param duration The duration of the effect
     */
    addTempEffect(effect: any, duration: number): void {
      const playerStore = usePlayerStore();
      playerStore.addEffect({
        id: effect.id || `temp_effect_${Date.now()}`,
        name: effect.name,
        description: effect.description,
        magnitude: effect.magnitude || 1,
        duration: duration,
        type: effect.type || 'temporary',
        target: effect.target || 'player' // Add default target
      });
      this.addToGameLog(`Added temporary effect: ${effect.name} (${duration} turns)`);
    },
    
    /**
     * Add visited landscape
     * @param landscapeId The ID of the landscape to mark as visited
     */
    addVisitedLandscape(landscapeId: string): void {
      if (!this.visitedLandscapes) this.visitedLandscapes = [];
      if (!this.visitedLandscapes.includes(landscapeId)) {
        this.visitedLandscapes.push(landscapeId);
      }
    },
    
    /**
     * Complete the journey
     */
    completeJourney(): void {
      this.journeyComplete = true;
      this.addToGameLog('Your journey is complete!', true, 'system');
    },
    
    /**
     * Trigger a random event
     */
    triggerRandomEvent(): void {
      // Implementation would be here
      this.addToGameLog('A random event has occurred!', true, 'event');
    },
    
    /**
     * Trigger an otherworldly manifestation
     */
    triggerOtherworldlyManifestation(): void {
      // Implementation would be here
      this.addToGameLog('An otherworldly manifestation has appeared!', true, 'event');
    },
    
    /**
     * Handle all phases of a turn
     */
    processTurn(): void {
      const challengeStore = useChallenge();
      const playerStore = usePlayerStore();
      
      // Handle each phase based on the current phase
      switch (this.currentPhase) {
        case GamePhase.SETUP:
          // Setup game state
          break;
        case GamePhase.CHARACTER_SELECTION:
          // Handle character selection
          break;
        case GamePhase.SEASONAL_ASSESSMENT:
          // Check seasonal effects
          this._handleSeasonalAssessment();
          break;
          
        case GamePhase.THREAT_LEVEL_CHECK:
          // Check threat level and potential events
          challengeStore.handleThreatLevelCheck();
          break;
          
        case GamePhase.LANDSCAPE_CHALLENGE:
          // Generate or process landscape challenge
          this._handleLandscapeChallenge();
          break;
          
        case GamePhase.CHALLENGE_RESOLUTION:
          // Resolve any active challenges
          this._handleChallengeResolution();
          break;
          
        case GamePhase.RESOURCE_MANAGEMENT:
          // Handle resource gathering and management
          this._handleResourceManagement();
          break;
          
        case GamePhase.ANIMAL_COMPANION:
          // Handle animal companion care and abilities
          playerStore.updateCompanionStatus();
          break;
          
        case GamePhase.CRAFTING:
          // Handle crafting opportunities
          // Do nothing by default - player initiates crafting
          break;
          
        case GamePhase.JOURNEY_PROGRESSION:
          // Handle journey movement and progression
          this._handleJourneyProgression();
          break;
          
        case GamePhase.EXPLORATION:
          // Handle exploration
          break;
          
        default:
          break;
      }
      
      // After processing, advance to next phase
      this.advancePhase();
    },
    
    /**
     * Format phase name for display
     * @private
     */
    _formatPhase(phase: GamePhase): string {
      const phaseNames: Record<GamePhase, string> = {
        [GamePhase.SETUP]: 'Setup',
        [GamePhase.CHARACTER_SELECTION]: 'Character Selection',
        [GamePhase.SEASONAL_ASSESSMENT]: 'Seasonal Assessment',
        [GamePhase.THREAT_LEVEL_CHECK]: 'Threat Level Check',
        [GamePhase.LANDSCAPE_CHALLENGE]: 'Landscape Challenge',
        [GamePhase.CHALLENGE_RESOLUTION]: 'Challenge Resolution',
        [GamePhase.RESOURCE_MANAGEMENT]: 'Resource Management',
        [GamePhase.ANIMAL_COMPANION]: 'Animal Companion',
        [GamePhase.CRAFTING]: 'Crafting', 
        [GamePhase.JOURNEY_PROGRESSION]: 'Journey Progression',
        [GamePhase.EXPLORATION]: 'Exploration',
        [GamePhase.GAME_OVER]: 'Game Over'
      };
      
      return phaseNames[phase] || 'Unknown Phase';
    },
    
    /**
     * Format season name for display
     * @private
     */
    _formatSeason(season: string): string {
      const nameMap: Record<string, string> = {
        'samhain': 'Samhain',
        'winters_depth': 'Winter\'s Depth',
        'imbolc': 'Imbolc',
        'beltane': 'Beltane',
        'lughnasadh': 'Lughnasadh'
      };
      
      return nameMap[season] || 'Unknown Season';
    },
    
    /**
     * Get the name of the current landscape
     * @returns The name of the current landscape or null if not found
     * @private
     */
    getCurrentLandscapeName(): string | null {
      const cardStore = useCardStore();
      if (!this.currentLandscapeId) return null;
      
      const landscape = cardStore.getLandscapeById(this.currentLandscapeId);
      return landscape?.name || null;
    },
    
    /**
     * Handle seasonal assessment phase
     * @private
     */
    _handleSeasonalAssessment(): void {
      // Process any seasonal effects, such as resource scarcity
      this._handleHealingRecovery();
    },
    
    /**
     * Handle landscape challenge phase
     * @private
     */
    _handleLandscapeChallenge(): void {
      const journeyStore = useJourneyStore();
      const challengeStore = useChallenge();
      const logStore = useLogStore();
      
      // If no current landscape, nothing to do
      if (!journeyStore.currentLandscapeId) {
        logStore.addToGameLog('You must choose a landscape before facing challenges.', false, 'system');
        return;
      }
      
      // If no active challenge, create one
      if (!challengeStore.currentChallenge) {
        const landscape = journeyStore.currentLandscape;
        if (landscape) {
          const challengeId = `${landscape.id}_${landscape.challengeType?.toLowerCase() || 'challenge'}`;
          challengeStore.setCurrentChallenge(challengeId);
        }
      }
    },
    
    /**
     * Handle challenge resolution phase
     * @private
     */
    _handleChallengeResolution(): void {
      // Usually handled by player action, this is just a placeholder
      const challengeStore = useChallenge();
      const logStore = useLogStore();
      
      if (!challengeStore.currentChallenge) {
        logStore.addToGameLog('No active challenge to resolve.', false, 'system');
      }
    },
    
    /**
     * Handle resource management phase
     * @private
     */
    _handleResourceManagement(): void {
      // Usually handled by player action, this is just a placeholder
      const logStore = useLogStore();
      logStore.addToGameLog('You may gather resources or manage your inventory.', false, 'system');
    },
    
    /**
     * Handle journey progression phase
     * @private
     */
    _handleJourneyProgression(): void {
      // Usually handled by player action, this is just a placeholder
      const logStore = useLogStore();
      logStore.addToGameLog('You may continue your journey to a new location.', false, 'system');
    },
    
    /**
     * Handle healing and recovery phase
     * @private
     */
    _handleHealingRecovery(): void {
      const playerStore = usePlayerStore();
      const seasonStore = useSeasonStore();
      const logStore = useLogStore();
      
      // Basic recovery varies by season
      let recoveryChance = 0;
      switch (seasonStore.currentSeason) {
        case Season.BELTANE:
          recoveryChance = 0.75; // 75% chance in Beltane (spring)
          break;
        case Season.LUGHNASADH:
          recoveryChance = 0.5; // 50% chance in Lughnasadh (summer)
          break;
        case Season.SAMHAIN:
          recoveryChance = 0.3; // 30% chance in Samhain (autumn)
          break;
        case Season.WINTERS_DEPTH:
          recoveryChance = 0.1; // 10% chance in Winter's Depth
          break;
        case Season.IMBOLC:
          recoveryChance = 0.25; // 25% chance in Imbolc (late winter)
          break;
        default:
          recoveryChance = 0.3; // Default is 30%
          break;
      }
      
      // Check for healing
      if (playerStore.health < playerStore.maxHealth && Math.random() < recoveryChance) {
        playerStore.healHealth(1);
        logStore.addToGameLog('You recover 1 health from rest.', false, 'system');
      }
      
      // Process player effects
      playerStore.processEffects();
    },
  }
});
