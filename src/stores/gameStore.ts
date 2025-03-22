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

interface GameState {
  currentPhase: GamePhase;
  currentTurn: number;
  gameStarted: boolean;
  gameOver: boolean;
  isVictory: boolean;
  victoryConditions: VictoryConditions;
  currentLandscapeId: string;
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
    currentLandscapeId: ''
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
      
      const phaseOrder = [
        GamePhase.SEASONAL_ASSESSMENT,
        GamePhase.THREAT_LEVEL_CHECK,
        GamePhase.LANDSCAPE_CHALLENGE,
        GamePhase.CHALLENGE_RESOLUTION,
        GamePhase.RESOURCE_MANAGEMENT,
        GamePhase.ANIMAL_COMPANION,
        GamePhase.CRAFTING,
        GamePhase.JOURNEY_PROGRESSION
      ];
      
      const currentIndex = phaseOrder.indexOf(this.currentPhase);
      if (currentIndex !== -1) {
        const previousPhase = this.currentPhase;
        this.currentPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];
        
        logStore.addToGameLog(`Entering the ${this._formatPhase(this.currentPhase)} phase.`, true, 'phase', {
          previousPhase,
          newPhase: this.currentPhase
        });
        
        // If we've completed a full cycle, advance the turn
        if (this.currentPhase === GamePhase.SEASONAL_ASSESSMENT) {
          this.advanceTurn();
        }
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
     * @param landcapeId The ID of the landscape to set as current
     */
    setCurrentLandscapeId(landcapeId: string): void {
      const logStore = useLogStore();
      const cardStore = useCardStore();
      
      this.currentLandscapeId = landcapeId;
      
      const landscape = cardStore.getLandscapeById(landcapeId);
      if (landscape) {
        logStore.addToGameLog(`You have arrived at ${landscape.name}.`, true, 'landscape');
      }
    },
    
    /**
     * Handle all phases of a turn
     */
    processTurn(): void {
      const challengeStore = useChallenge();
      const playerStore = usePlayerStore();
      
      // Handle each phase based on the current phase
      switch (this.currentPhase) {
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
        [GamePhase.SEASONAL_ASSESSMENT]: 'Seasonal Assessment',
        [GamePhase.THREAT_LEVEL_CHECK]: 'Threat Level Check',
        [GamePhase.LANDSCAPE_CHALLENGE]: 'Landscape Challenge',
        [GamePhase.CHALLENGE_RESOLUTION]: 'Challenge Resolution',
        [GamePhase.RESOURCE_MANAGEMENT]: 'Resource Management',
        [GamePhase.ANIMAL_COMPANION]: 'Animal Companion',
        [GamePhase.CRAFTING]: 'Crafting',
        [GamePhase.JOURNEY_PROGRESSION]: 'Journey Progression',
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
        case 'beltane':
          recoveryChance = 0.75; // 75% chance in Beltane (spring)
          break;
        case 'lughnasadh':
          recoveryChance = 0.5; // 50% chance in Lughnasadh (summer)
          break;
        case 'samhain':
          recoveryChance = 0.25; // 25% chance in Samhain (autumn)
          break;
        case 'winters_depth':
          recoveryChance = 0; // No natural recovery in Winter's Depth
          break;
        case 'imbolc':
          recoveryChance = 0.4; // 40% chance in Imbolc (late winter/early spring)
          break;
        default:
          recoveryChance = 0.3;
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
