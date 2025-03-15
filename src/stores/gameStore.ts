import { defineStore } from 'pinia';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import { GameState, VictoryConditions, GameLogEntry, TempEffect } from '@/models/types/game';
import { LandscapeCard, SeasonCard } from '@/models/types/cards';
import { usePlayerStore } from './playerStore';
import { useCardStore } from './cardStore';

export const useGameStore = defineStore('game', {
  state: () => ({
    currentPhase: GamePhase.CHARACTER_SELECTION,
    currentTurn: 1,
    currentSeason: Season.SAMHAIN,
    currentLandscapeId: '',
    currentChallenge: null as string | null,
    visitedLandscapes: [] as string[],
    journeyProgress: 0,
    journeyPath: [] as string[],
    gameLog: [] as GameLogEntry[],
    victoryConditions: {
      journeyCompleted: false,
      balanceMaintained: false,
      knowledgeAcquired: false,
      bondsFormed: false,
      questFulfilled: false,
      landscapesTraversed: false,
      seasonsExperienced: false,
      challengesOvercome: false
    } as VictoryConditions,
    gameStarted: false,
    gameOver: false,
    isVictory: false,
    threatTokens: 0,
    blessingTokens: 0,
    challengeHistory: [] as { id: string, outcome: string, turn: number }[],
    tempEffects: [] as TempEffect[],
    journeyComplete: false,
    wisdom: 0,
    ceremonyCompleted: false
  }),
  
  getters: {
    currentLandscape(): LandscapeCard | null {
      const cardStore = useCardStore();
      const landscape = cardStore.getLandscapeById(this.currentLandscapeId);
      return landscape || null;
    },
    
    currentSeasonCard(): SeasonCard | null {
      const cardStore = useCardStore();
      const seasonCard = cardStore.getSeasonById(this.currentSeason);
      return seasonCard || null;
    },
    
    journeyPercentage(): number {
      return Math.min(100, Math.round((this.journeyProgress / 10) * 100));
    },
    
    isGameOver(): boolean {
      return this.gameOver;
    },
    
    hasWon(): boolean {
      return this.isVictory;
    },
    
    formattedGameLog(): GameLogEntry[] {
      return [...this.gameLog].reverse();
    },
    
    threatLevel(): number {
      return Math.floor(this.threatTokens / 3);
    },
    
    hasTempEffect(): (effectId: string) => boolean {
      return (effectId: string) => {
        return this.tempEffects.some(effect => effect.id === effectId && effect.duration > 0);
      };
    },
    
    getTempEffectStrength(): (effectId: string) => number {
      return (effectId: string) => {
        const effect = this.tempEffects.find(effect => effect.id === effectId && effect.duration > 0);
        return effect ? effect.strength : 0;
      };
    }
  },
  
  actions: {
    startGame(): void {
      this.gameStarted = true;
      this.currentPhase = GamePhase.CHARACTER_SELECTION;
      this.currentTurn = 1;
      this.currentSeason = Season.SAMHAIN;
      this.threatTokens = 0;
      this.tempEffects = [];
      this.addToGameLog('Your journey begins in the season of Samhain, when the veil between worlds is thinnest.', true);
    },
    
    resetGame(): void {
      this.currentPhase = GamePhase.CHARACTER_SELECTION;
      this.currentTurn = 1;
      this.currentSeason = Season.SAMHAIN;
      this.currentLandscapeId = '';
      this.currentChallenge = null;
      this.visitedLandscapes = [];
      this.journeyProgress = 0;
      this.journeyPath = [];
      this.gameLog = [];
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
      this.gameStarted = false;
      this.gameOver = false;
      this.isVictory = false;
      this.threatTokens = 0;
      this.blessingTokens = 0;
      this.challengeHistory = [];
      this.tempEffects = [];
    },
    
    endGame(isVictory: boolean): void {
      this.gameOver = true;
      this.isVictory = isVictory;
      
      if (isVictory) {
        this.addToGameLog('Congratulations! You have completed your journey through the Celtic Realm.', true);
      } else {
        this.addToGameLog('Your journey has come to an end. The Celtic Realm remains shrouded in mystery.', true);
      }
      
      this.currentPhase = GamePhase.GAME_OVER;
    },
    
    setPhase(phase: GamePhase): void {
      this.currentPhase = phase;
      this.addToGameLog(`Entering the ${this.formatPhase(phase)} phase.`);
    },
    
    advancePhase(): void {
      const phaseOrder = [
        GamePhase.CHARACTER_SELECTION,
        GamePhase.SEASONAL_ASSESSMENT,
        GamePhase.THREAT_LEVEL_CHECK,
        GamePhase.LANDSCAPE_CHALLENGE,
        GamePhase.CHALLENGE_RESOLUTION,
        GamePhase.RESOURCE_MANAGEMENT,
        GamePhase.ANIMAL_COMPANION,
        GamePhase.CRAFTING,
        GamePhase.HEALING_RECOVERY,
        GamePhase.JOURNEY_PROGRESSION
      ];
      
      const currentIndex = phaseOrder.indexOf(this.currentPhase);
      if (currentIndex !== -1) {
        this.currentPhase = phaseOrder[(currentIndex + 1) % phaseOrder.length];
        this.addToGameLog(`Entering the ${this.formatPhase(this.currentPhase)} phase.`, true, 'phase', {
          previousPhase: phaseOrder[currentIndex],
          newPhase: this.currentPhase
        });
        
        // If we've completed a full cycle, advance the turn
        if (this.currentPhase === GamePhase.SEASONAL_ASSESSMENT) {
          this.advanceTurn();
        }
      }
    },
    
    advanceTurn(): void {
      this.currentTurn++;
      this.addToGameLog(`Turn ${this.currentTurn} has begun.`, true, 'system', {
        newTurn: this.currentTurn,
        currentSeason: this.formatSeason(this.currentSeason)
      });
      
      // Process any temporary effects
      this.processTempEffects();
      
      // Check if we need to advance the season
      if (this.currentTurn % 3 === 0) {
        this.advanceSeason();
      }
      
      // Check victory conditions
      this.checkVictoryConditions();
    },
    
    advanceSeason(): void {
      const seasonOrder = [
        Season.SAMHAIN,
        Season.WINTERS_DEPTH,
        Season.IMBOLC,
        Season.BELTANE,
        Season.LUGHNASADH
      ];
      
      const currentIndex = seasonOrder.indexOf(this.currentSeason);
      if (currentIndex !== -1) {
        const nextIndex = (currentIndex + 1) % seasonOrder.length;
        const previousSeason = this.currentSeason;
        this.currentSeason = seasonOrder[nextIndex];
        
        this.addToGameLog(`The season has changed to ${this.formatSeason(this.currentSeason)}.`, true, 'phase', {
          previousSeason: this.formatSeason(previousSeason),
          newSeason: this.formatSeason(this.currentSeason),
          turn: this.currentTurn
        });
        
        // Process resource changes with seasonal transition
        this.processSeasonalResourceChanges(previousSeason, this.currentSeason);
        
        // Apply season effects
        const cardStore = useCardStore();
        const seasonCard = cardStore.getSeasonById(this.currentSeason);
        
        if (seasonCard) {
          this.addToGameLog(`${seasonCard.name}: ${seasonCard.description}`, false, 'system', {
            seasonEffects: seasonCard.effects
          });
          
          // Apply any immediate effects of the season
          if (seasonCard.effects && seasonCard.effects.length > 0) {
            seasonCard.effects.forEach(effect => {
              const description = typeof effect.effect === 'string' ? effect.effect : `${effect.effect}`;
              this.addToGameLog(`Season Effect: ${effect.name} - ${description}`, false, 'system', {
                effectDetails: effect
              });
              // Here you would apply the actual effect logic
            });
          }
        }
      }
    },
    
    setCurrentLandscape(landscapeId: string): void {
      const previousLandscapeId = this.currentLandscapeId;
      this.currentLandscapeId = landscapeId;
      
      // Add to visited landscapes if not already visited
      if (!this.visitedLandscapes.includes(landscapeId)) {
        this.addVisitedLandscape(landscapeId);
      }
      
      const cardStore = useCardStore();
      const landscape = cardStore.getLandscapeById(landscapeId);
      
      if (landscape) {
        this.addToGameLog(`You have arrived at ${landscape.name}.`, true, 'action', {
          previousLandscapeId,
          newLandscapeId: landscapeId,
          landscapeName: landscape.name,
          availableResources: landscape.availableResources,
          specialFeature: landscape.specialFeature,
          providesShelter: landscape.providesShelter
        });
        
        // Apply entry effects if any
        if (landscape.entryEffect) {
          this.addToGameLog(`${landscape.name} Entry Effect: ${landscape.entryEffect.description}`, false, 'system', {
            entryEffect: landscape.entryEffect
          });
          // Here you would apply the actual entry effect logic
        }
        
        // Check if we've traversed enough landscapes for victory condition
        if (this.visitedLandscapes.length >= 10) {
          this.victoryConditions.landscapesTraversed = true;
          this.addToGameLog('You have traversed enough landscapes to complete your journey.', true, 'system', {
            visitedLandscapes: this.visitedLandscapes.length,
            requiredLandscapes: 10
          });
        }
      }
    },
    
    addVisitedLandscape(landscapeId: string): void {
      if (!this.visitedLandscapes.includes(landscapeId)) {
        this.visitedLandscapes.push(landscapeId);
        
        const cardStore = useCardStore();
        const landscape = cardStore.getLandscapeById(landscapeId);
        
        if (landscape) {
          this.addToGameLog(`${landscape.name} has been added to your journey path.`, false, 'system', {
            landscapeId,
            landscapeName: landscape.name,
            visitedLandscapesCount: this.visitedLandscapes.length
          });
          
          // Add to journey path for tracking
          this.journeyPath.push(landscapeId);
          
          // Increase journey progress
          this.advanceJourney(1);
        }
      }
    },
    
    setCurrentChallenge(challengeId: string | null): void {
      const previousChallengeId = this.currentChallenge;
      this.currentChallenge = challengeId;
      
      if (challengeId) {
        const cardStore = useCardStore();
        const challenge = cardStore.getChallengeById(challengeId);
        
        if (challenge) {
          // Extract challenge details for the log
          const challengeName = challenge.name || `${this.currentLandscape?.name || 'Unknown'} Challenge`;
          const challengeType = challenge.type || 'unknown';
          const challengeDifficulty = challenge.difficulty || 5;
          const challengeRewards = challenge.rewards || { resources: [], experience: 0 };
          
          this.addToGameLog(`You face a challenge: ${challengeName}`, true, 'challenge', {
            previousChallengeId,
            newChallengeId: challengeId,
            challengeName: challengeName,
            challengeType: challengeType,
            challengeDifficulty: challengeDifficulty,
            challengeRewards: challengeRewards
          });
        }
      } else {
        this.addToGameLog('The challenge has been cleared.', false, 'challenge', {
          previousChallengeId
        });
      }
    },
    
    advanceJourney(steps: number): void {
      const previousProgress = this.journeyProgress;
      this.journeyProgress += steps;
      
      this.addToGameLog(`Your journey has progressed by ${steps} steps.`, false, 'action', {
        previousProgress,
        newProgress: this.journeyProgress,
        stepsAdded: steps
      });
      
      // Check if journey is complete
      if (this.journeyProgress >= 15) {
        this.victoryConditions.journeyCompleted = true;
        this.addToGameLog('You have completed your journey through the Celtic Realm!', true, 'system', {
          journeyProgress: this.journeyProgress,
          journeyCompleted: true
        });
        
        // Check if we should end the game
        if (this.checkVictoryConditions()) {
          this.completeJourney(true);
        }
      }
    },
    
    completeJourney(isVictory: boolean): void {
      this.addToGameLog(
        isVictory 
          ? 'Congratulations! You have successfully completed your journey through the Celtic Realm!' 
          : 'Your journey has come to an end, but not in victory.',
        true,
        'system',
        {
          isVictory,
          journeyProgress: this.journeyProgress,
          victoryConditions: { ...this.victoryConditions },
          visitedLandscapes: this.visitedLandscapes.length,
          currentTurn: this.currentTurn,
          currentSeason: this.formatSeason(this.currentSeason)
        }
      );
      
      // End the game
      this.endGame(isVictory);
    },
    
    addToGameLog(
      message: string, 
      highlight: boolean = false, 
      type: 'phase' | 'action' | 'challenge' | 'resource' | 'companion' | 'crafting' | 'system' | 'error' | 'debug' = 'system',
      details: { [key: string]: any } = {}
    ): void {
      const entry: GameLogEntry = {
        message,
        timestamp: Date.now(),
        highlight,
        type,
        details,
        turn: this.currentTurn,
        season: this.currentSeason
      };
      
      // Log to console for debugging
      if (type === 'error') {
        console.error(entry.message, details);
      } else if (type === 'debug') {
        console.debug(entry.message, details);
      } else {
        console.log(entry.message, details);
      }
      
      this.gameLog.push(entry);
      
      // Keep the log from getting too large
      if (this.gameLog.length > 100) {
        this.gameLog.shift();
      }
    },
    
    checkVictoryConditions(): boolean {
      const allConditionsMet = Object.values(this.victoryConditions).every(Boolean);
      
      if (allConditionsMet) {
        this.endGame(true);
      }
      
      return allConditionsMet;
    },
    
    formatPhase(phase: GamePhase): string {
      return phase.replace(/_/g, ' ').toLowerCase();
    },
    
    formatSeason(season: Season): string {
      return season.replace(/_/g, ' ').toLowerCase();
    },
    
    // New methods for threat management
    addThreatTokens(amount: number): number {
      const oldThreatLevel = Math.floor(this.threatTokens / 3);
      
      this.threatTokens += amount;
      
      const newThreatLevel = Math.floor(this.threatTokens / 3);
      
      if (newThreatLevel > oldThreatLevel) {
        this.addToGameLog(`The threat level has increased to ${newThreatLevel}!`, true);
      }
      
      // Update victory condition for balance
      this.victoryConditions.balanceMaintained = this.threatTokens < 6;
      
      return this.threatTokens;
    },
    
    removeThreatTokens(amount: number): number {
      const oldThreatLevel = Math.floor(this.threatTokens / 3);
      
      this.threatTokens = Math.max(0, this.threatTokens - amount);
      
      const newThreatLevel = Math.floor(this.threatTokens / 3);
      
      if (newThreatLevel < oldThreatLevel) {
        this.addToGameLog(`The threat level has decreased to ${newThreatLevel}.`, true);
      }
      
      // Update victory condition for balance
      this.victoryConditions.balanceMaintained = this.threatTokens < 6;
      
      return this.threatTokens;
    },
    
    addTempEffect(effectId: string, name: string, description: string, strength: number, duration: number): void {
      // Check if effect already exists
      const existingEffectIndex = this.tempEffects.findIndex(effect => effect.id === effectId);
      
      if (existingEffectIndex !== -1) {
        // Update existing effect
        this.tempEffects[existingEffectIndex].strength = strength;
        this.tempEffects[existingEffectIndex].duration = duration;
      } else {
        // Add new effect
        this.tempEffects.push({
          id: effectId,
          name,
          description,
          strength,
          duration
        });
        
        this.addToGameLog(`New effect: ${name} - ${description}`, true);
      }
    },
    
    removeTempEffect(effectId: string): boolean {
      const index = this.tempEffects.findIndex(effect => effect.id === effectId);
      
      if (index !== -1) {
        const effect = this.tempEffects[index];
        this.addToGameLog(`Effect ended: ${effect.name}`, true);
        this.tempEffects.splice(index, 1);
        return true;
      }
      
      return false;
    },
    
    processTempEffects(): void {
      // Reduce duration of all temporary effects
      this.tempEffects.forEach((effect, index) => {
        if (effect.duration > 0) {
          effect.duration--;
          
          if (effect.duration === 0) {
            this.addToGameLog(`Effect ended: ${effect.name}`, true);
            this.tempEffects.splice(index, 1);
          }
        }
      });
    },
    
    clearGameLog(): void {
      this.gameLog = [];
      this.addToGameLog('Game log cleared.', false, 'system', {
        timestamp: Date.now()
      });
    },
    
    // Handle threat level check phase
    handleThreatLevelCheck(): void {
      const threatLevel = this.threatLevel;
      this.addToGameLog(`Threat Level Check: Current threat level is ${threatLevel}.`, true);
      
      // Apply threat level effects to challenge difficulty
      if (threatLevel > 0) {
        this.addToGameLog(`Challenge difficulty increased by +${threatLevel} due to threat level.`);
      }
      
      // Special events based on threat tokens
      if (this.threatTokens >= 10) {
        this.addToGameLog('DANGER: The otherworldly forces are manifesting! Rolling on the Otherworldly Manifestation table.', true, 'error');
        this.triggerOtherworldlyManifestation();
      } else if (this.threatTokens >= 5) {
        this.addToGameLog('WARNING: The spiritual balance is disturbed. Drawing a random event.', true, 'challenge');
        this.triggerRandomEvent();
      }
      
      // Advance to next phase
      this.advancePhase();
    },
    
    // Random Event System
    triggerRandomEvent(): void {
      // Define possible random events
      const randomEvents = [
        {
          id: 'sudden_storm',
          name: 'Sudden Storm',
          description: 'Dark clouds gather suddenly, bringing a fierce storm.',
          effect: () => {
            this.addToGameLog('The storm makes gathering resources more difficult. Resource capacity reduced by 1 temporarily.', true);
            this.addTempEffect('storm', 'Sudden Storm', 'Resource capacity -1', 1, 2);
            const playerStore = usePlayerStore();
            playerStore.addEffect({
              id: 'storm_effect',
              name: 'Storm Hindrance',
              description: 'Resource gathering diminished',
              type: 'negative',
              magnitude: -1,
              duration: 2,
              target: 'resourceCapacity'
            });
          }
        },
        {
          id: 'animal_migration',
          name: 'Animal Migration',
          description: 'A sudden migration of animals passes through the area.',
          effect: () => {
            this.addToGameLog('The animal migration brings opportunity. Your next Animal Companion check gets +2.', true);
            this.addTempEffect('migration', 'Animal Migration', 'Animal Companion checks +2', 2, 1);
          }
        },
        {
          id: 'ancient_memory',
          name: 'Ancient Memory',
          description: 'The land itself seems to remember ancient events, stirring old magics.',
          effect: () => {
            const playerStore = usePlayerStore();
            playerStore.gainExperience(1);
            this.addToGameLog('Ancient wisdom floods your mind. You gain 1 experience point.', true);
          }
        },
        {
          id: 'fae_mischief',
          name: 'Fae Mischief',
          description: 'The faerie folk play tricks on unwary travelers.',
          effect: () => {
            this.addToGameLog('Your supplies have been tampered with by mischievous fae.', true);
            const playerStore = usePlayerStore();
            playerStore.loseRandomResources(1);
          }
        },
        {
          id: 'spiritual_blessing',
          name: 'Spiritual Blessing',
          description: 'The ancestral spirits take notice of your journey and offer aid.',
          effect: () => {
            this.blessingTokens += 1;
            this.addToGameLog('You receive a blessing from the spirits. +1 Blessing token.', true);
          }
        }
      ];
      
      // Select random event
      const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      
      // Trigger the event
      this.addToGameLog(`Random Event: ${randomEvent.name} - ${randomEvent.description}`, true);
      randomEvent.effect();
    },
    
    // Otherworldly Manifestation System
    triggerOtherworldlyManifestation(): void {
      // Define possible otherworldly manifestations
      const manifestations = [
        {
          id: 'spirit_guardian',
          name: 'Spirit Guardian',
          description: 'A powerful guardian spirit manifests to test your worthiness.',
          effect: () => {
            this.addToGameLog('The spirit guardian challenges you to prove your worth!', true);
            this.addTempEffect('guardian_challenge', 'Spirit Guardian Challenge', 'Must succeed on next 2 challenges or lose 2 health', 2, 2);
            // Set up consequence if challenges are failed
            this.addToGameLog('You must succeed on your next two challenges or suffer 2 health damage.', true);
          }
        },
        {
          id: 'reality_distortion',
          name: 'Reality Distortion',
          description: 'The boundaries between worlds thin, causing strange distortions in reality.',
          effect: () => {
            this.addToGameLog('Reality warps around you, changing your path!', true);
            // Change the current landscape to a random one
            const cardStore = useCardStore();
            const landscapes = cardStore.landscapes;
            const randomLandscape = landscapes[Math.floor(Math.random() * landscapes.length)];
            this.setCurrentLandscape(randomLandscape.id);
            this.addToGameLog(`You suddenly find yourself at ${randomLandscape.name}!`, true);
          }
        },
        {
          id: 'ancestral_curse',
          name: 'Ancestral Curse',
          description: 'Ancient spirits place a curse upon you for disturbing the balance.',
          effect: () => {
            this.addToGameLog('An ancestral curse falls upon you!', true);
            const playerStore = usePlayerStore();
            playerStore.addEffect({
              id: 'ancestral_curse',
              name: 'Ancestral Curse',
              description: '-1 to all challenge rolls',
              type: 'negative',
              magnitude: -1,
              duration: 3,
              target: 'challengeRolls'
            });
            this.addToGameLog('You feel weakened. -1 to all challenge rolls for 3 turns.', true);
          }
        },
        {
          id: 'otherworld_portal',
          name: 'Otherworld Portal',
          description: 'A portal to the Otherworld opens, risking pulling you in.',
          effect: () => {
            this.addToGameLog('A swirling portal to the Otherworld appears before you!', true);
            // Increase threat further
            this.addThreatTokens(2);
            this.addToGameLog('The portal\'s energy increases the spiritual imbalance. +2 Threat tokens.', true);
            
            // But also offer a choice for reward
            this.addToGameLog('You sense that reaching into the portal could yield a valuable resource, but at great risk...', true);
            // This would trigger a choice in the UI
            // For now, simulate a 50/50 chance of benefit vs. harm
            if (Math.random() > 0.5) {
              const playerStore = usePlayerStore();
              const resource = ['silver_mistletoe', 'standing_stone_chips', 'amber_shards'][Math.floor(Math.random() * 3)];
              playerStore.addResource(resource);
              this.addToGameLog(`You reach into the portal and retrieve a rare resource: ${resource.replace('_', ' ')}!`, true);
            } else {
              const playerStore = usePlayerStore();
              playerStore.loseHealth(2);
              this.addToGameLog('The portal\'s energy burns you as you reach in! You lose 2 health.', true);
            }
          }
        },
        {
          id: 'time_anomaly',
          name: 'Time Anomaly',
          description: 'Time flows strangely, affecting your progress and abilities.',
          effect: () => {
            this.addToGameLog('Time becomes unstable around you!', true);
            // 50% chance to advance or reverse season
            if (Math.random() > 0.5) {
              this.advanceSeason();
              this.addToGameLog('Time accelerates, advancing the season prematurely!', true);
            } else {
              this.reverseSeason();
              this.addToGameLog('Time flows backwards, returning to the previous season!', true);
            }
          }
        }
      ];
      
      // Select random manifestation
      const manifestation = manifestations[Math.floor(Math.random() * manifestations.length)];
      
      // Trigger the manifestation
      this.addToGameLog(`Otherworldly Manifestation: ${manifestation.name} - ${manifestation.description}`, true, 'error');
      manifestation.effect();
    },
    
    // Helper for Time Anomaly manifestation
    reverseSeason(): void {
      const seasonOrder = [
        Season.SAMHAIN,
        Season.WINTERS_DEPTH,
        Season.IMBOLC,
        Season.BELTANE,
        Season.LUGHNASADH
      ];
      
      const currentIndex = seasonOrder.indexOf(this.currentSeason);
      if (currentIndex > 0) {
        const previousSeason = seasonOrder[currentIndex - 1];
        this.currentSeason = previousSeason;
        this.addToGameLog(`The season has reversed to ${this.formatSeason(this.currentSeason)}.`, true);
      } else {
        this.addToGameLog('The season remains unchanged - you are already at the beginning of the cycle.', true);
      }
      
      // Update the season card
      this.updateSeasonCard();
    },
    
    // Handle healing and recovery phase
    handleHealingRecovery(): void {
      const playerStore = usePlayerStore();
      
      // Basic healing opportunity each turn
      const healingAmount = 1;
      const currentSeason = this.currentSeasonCard;
      
      // Apply seasonal healing modifiers
      let seasonalHealingModifier = 0;
      if (currentSeason) {
        if (this.currentSeason === Season.IMBOLC) {
          seasonalHealingModifier = 1; // Imbolc provides +1 healing
        } else if (this.currentSeason === Season.LUGHNASADH) {
          seasonalHealingModifier = 0; // Lughnasadh doubles healing effectiveness
          this.addToGameLog('The community support during Lughnasadh doubles your healing effectiveness.');
        }
      }
      
      const totalHealing = healingAmount + seasonalHealingModifier;
      
      if (playerStore.health < playerStore.maxHealth) {
        playerStore.healHealth(totalHealing);
        this.addToGameLog(`You recover ${totalHealing} health during the healing phase.`, true, 'system');
      } else {
        this.addToGameLog('You are already at full health.', false, 'system');
      }
      
      // Special healing locations
      if (this.currentLandscape && ['Sacred Oak Grove', 'Druid\'s Sanctuary', 'Moonlit Loch'].includes(this.currentLandscape.name)) {
        const specialHealing = 1;
        playerStore.healHealth(specialHealing);
        this.addToGameLog(`The spiritual energy at this ${this.currentLandscape.name} provides an additional ${specialHealing} healing.`, true);
      }
      
      // Advance to next phase
      this.advancePhase();
    },
    
    // Process resource changes during seasonal transitions
    processSeasonalResourceChanges(previousSeason: Season, newSeason: Season): void {
      const playerStore = usePlayerStore();
      const cardStore = useCardStore();
      const resources = [...playerStore.resources]; // Create a copy to avoid modification during iteration
      
      this.addToGameLog(`Checking resources for seasonal changes...`, false, 'system');
      
      // Define which resources spoil during which seasonal transitions
      const seasonalSpoilage = {
        // From Samhain to Imbolc (early winter)
        [`${Season.SAMHAIN}_${Season.WINTERS_DEPTH}`]: ['berries', 'mushrooms', 'fresh_herbs'],
        [`${Season.WINTERS_DEPTH}_${Season.IMBOLC}`]: ['winter_roots', 'preserved_meats'],
        
        // From Imbolc to Beltane (spring)
        [`${Season.IMBOLC}_${Season.BELTANE}`]: ['spring_flowers', 'birch_sap'],
        
        // From Beltane to Lughnasadh (summer)
        [`${Season.BELTANE}_${Season.LUGHNASADH}`]: ['summer_fruits', 'fresh_water'],
        
        // From Lughnasadh to Samhain (autumn)
        [`${Season.LUGHNASADH}_${Season.SAMHAIN}`]: ['summer_fruits', 'fresh_water']
      };
      
      // Define which resources transform during seasonal transitions
      const seasonalTransformations = {
        // From Samhain to Imbolc
        [`${Season.SAMHAIN}_${Season.WINTERS_DEPTH}`]: {
          'acorns': 'winter_roots', // Acorns become more valuable in winter
          'fresh_herbs': 'dried_herbs' // Fresh herbs dry out
        },
        
        // From Imbolc to Beltane
        [`${Season.WINTERS_DEPTH}_${Season.IMBOLC}`]: {
          'snow_essence': 'spring_water', // Snow melts into spring water
          'pine_needles': 'spring_flowers' // New growth replaces old
        },
        
        // From Beltane to Lughnasadh
        [`${Season.IMBOLC}_${Season.BELTANE}`]: {
          'spring_flowers': 'summer_fruits', // Flowers become fruits
          'birch_sap': 'sweet_syrup' // Sap concentrates in the heat
        },
        
        // From Lughnasadh to Samhain
        [`${Season.BELTANE}_${Season.LUGHNASADH}`]: {
          'green_leaves': 'red_leaves', // Leaves change color
          'summer_fruits': 'fermented_fruit' // Fruits ferment
        }
      };
      
      // Check for resources that spoil during this seasonal transition
      const transitionKey = `${previousSeason}_${newSeason}`;
      const spoilingResources = seasonalSpoilage[transitionKey] || [];
      const transformingResources = seasonalTransformations[transitionKey] || {};
      
      // Process spoilage
      resources.forEach(resourceId => {
        // Check if this resource spoils
        if (spoilingResources.includes(resourceId)) {
          playerStore.removeResource(resourceId);
          this.addToGameLog(`Your ${this.formatResourceName(resourceId)} has spoiled with the change to ${this.formatSeason(newSeason)}.`, true, 'resource');
        }
        
        // Check if this resource transforms
        if (resourceId in transformingResources) {
          const newResourceId = transformingResources[resourceId];
          playerStore.removeResource(resourceId);
          playerStore.addResource(newResourceId);
          
          // Get resource names for better logging
          const oldResource = cardStore.getResourceById(resourceId);
          const newResource = cardStore.getResourceById(newResourceId);
          
          const oldName = oldResource ? oldResource.name : this.formatResourceName(resourceId);
          const newName = newResource ? newResource.name : this.formatResourceName(newResourceId);
          
          this.addToGameLog(`Your ${oldName} has transformed into ${newName} with the change to ${this.formatSeason(newSeason)}.`, true, 'resource');
        }
      });
      
      // Update resource availability based on the new season
      this.updateResourceAvailability();
    },
    
    // Helper method to format resource ID to a friendly name
    formatResourceName(resourceId: string): string {
      return resourceId.replace(/_/g, ' ');
    },
    
    // Update resource availability based on current season
    updateResourceAvailability(): void {
      // This would be implemented in the cardStore or another appropriate place
      // It would adjust what resources are available in each landscape based on the season
      
      this.addToGameLog(`Resource availability has adjusted to the new season.`, false, 'system');
      
      // Here we would apply season-specific resource modifiers
      // For example, some resources become more abundant in certain seasons
    },
    
    // Method to perform a D8 dice roll (1-8)
    rollD8(): number {
      // Random number between 1 and 8
      const roll = Math.floor(Math.random() * 8) + 1;
      this.addToGameLog(`You rolled a ${roll} on a D8.`, true, 'system');
      return roll;
    },
    
    // Resolve a challenge based on roll and difficulty
    resolveChallenge(totalRoll: number, difficulty: number): 'SUCCESS' | 'PARTIAL' | 'FAILURE' {
      this.addToGameLog(`Challenge attempt: Roll ${totalRoll} vs Difficulty ${difficulty}`, true, 'challenge');
      
      // Natural 8 is always a success
      if (totalRoll >= difficulty + 2) {
        this.addToGameLog('Critical Success! You overcome the challenge with exceptional results.', true, 'challenge');
        
        // Add to challenge history
        if (this.currentChallenge) {
          this.challengeHistory.push({
            id: this.currentChallenge,
            outcome: 'SUCCESS',
            turn: this.currentTurn
          });
        }
        
        // Remove threat tokens for successful challenge
        this.removeThreatTokens(1);
        
        return 'SUCCESS';
      } else if (totalRoll >= difficulty) {
        this.addToGameLog('Success! You overcome the challenge.', true, 'challenge');
        
        // Add to challenge history
        if (this.currentChallenge) {
          this.challengeHistory.push({
            id: this.currentChallenge,
            outcome: 'SUCCESS',
            turn: this.currentTurn
          });
        }
        
        return 'SUCCESS';
      } else if (totalRoll >= difficulty - 2) {
        this.addToGameLog('Partial Success. You manage to barely overcome parts of the challenge.', true, 'challenge');
        
        // Add to challenge history
        if (this.currentChallenge) {
          this.challengeHistory.push({
            id: this.currentChallenge,
            outcome: 'PARTIAL',
            turn: this.currentTurn
          });
        }
        
        // Add threat tokens for partial success
        this.addThreatTokens(1);
        
        return 'PARTIAL';
      } else {
        this.addToGameLog('Failure. The challenge proves too difficult for now.', true, 'challenge');
        
        // Add to challenge history
        if (this.currentChallenge) {
          this.challengeHistory.push({
            id: this.currentChallenge,
            outcome: 'FAILURE',
            turn: this.currentTurn
          });
        }
        
        // Add threat tokens for failure
        this.addThreatTokens(2);
        
        return 'FAILURE';
      }
    },
    
    // Perform a special action at a location
    performSpecialAction(actionId: string): { success: boolean; message: string } {
      const cardStore = useCardStore();
      const playerStore = usePlayerStore();
      
      // Handle different special actions based on ID
      switch (actionId) {
        case 'standing_stones_ceremony':
          // This is the final ceremony at the Great Standing Stones
          this.ceremonyCompleted = true;
          this.journeyComplete = true;
          
          // Add wisdom to player
          playerStore.wisdom = (playerStore.wisdom || 0) + 5;
          
          // Log the result
          this.addToGameLog('You have performed the ancient ceremony at the Standing Stones. Your journey is complete!', true, 'special');
          
          return {
            success: true,
            message: 'You have successfully completed the journey!'
          };
          
        case 'heal_at_spring':
          // Healing at the sacred spring
          playerStore.healHealth(5);
          
          this.addToGameLog('You drink from the sacred spring and feel revitalized.', true, 'special');
          
          return {
            success: true,
            message: 'You feel refreshed and healed.'
          };
          
        case 'meditation':
          // Gaining wisdom through meditation
          playerStore.wisdom = (playerStore.wisdom || 0) + 2;
          
          this.addToGameLog('You meditate peacefully, gaining insight and wisdom.', true, 'special');
          
          return {
            success: true,
            message: 'Your mind feels clearer and wiser.'
          };
          
        default:
          return {
            success: false,
            message: 'That action is not available at this location.'
          };
      }
    },
  }
});
