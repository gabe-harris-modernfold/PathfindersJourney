/**
 * Journey Service
 * Handles journey path initialization and landscape navigation
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useSeasonStore } from '@/stores/seasonStore';
import { Season } from '@/models/enums/seasons';
import { LandscapeCard } from '@/models/types/cards';
import { useJourneyStore } from '@/stores/journeyStore';
import { useLogStore } from '@/stores/logStore';
import { ExtendedGameStore, ExtendedPlayerStore } from '@/types/store-extensions';

class JourneyService {
  /**
   * Initialize journey path with landscapes
   * @returns Array of landscape IDs representing the journey path
   */
  initializeJourney(): string[] {
    const cardStore = useCardStore();
    const allLandscapes = cardStore.landscapes;
    
    // Ensure we have enough landscapes
    if (!allLandscapes || allLandscapes.length < 15) {
      console.error('Not enough landscapes to create journey path');
      return [];
    }
    
    // Shuffle landscapes to create a random path
    const shuffled = [...allLandscapes].sort(() => 0.5 - Math.random());
    
    // Select 15 landscapes for the journey
    const selectedLandscapes = shuffled.slice(0, 15);
    
    // Get landscape IDs for the path
    const journeyPath = selectedLandscapes.map(landscape => landscape.id);
    
    // Update game store
    const gameStore = useGameStore() as any as ExtendedGameStore;
    gameStore.journeyPath = journeyPath;
    
    // Set initial landscape
    if (journeyPath.length > 0) {
      gameStore.currentLandscapeId = journeyPath[0];
      gameStore.visitedLandscapes = [journeyPath[0]];
      
      // Log journey start
      gameStore.addToGameLog(`Your journey begins at ${this.getLandscapeName(journeyPath[0])}`);
    }
    
    return journeyPath;
  }
  
  /**
   * Get the name of a landscape by its ID
   * @param landscapeId The ID of the landscape
   * @returns The name of the landscape
   */
  getLandscapeName(landscapeId: string): string {
    const cardStore = useCardStore();
    const landscape = cardStore.getLandscapeById(landscapeId);
    return landscape?.name || 'Unknown Location';
  }
  
  /**
   * Move to the next landscape in the journey path
   * @returns The ID of the new current landscape
   */
  moveToNextLandscape(): string | null {
    const gameStore = useGameStore() as any as ExtendedGameStore;
    const journeyStore = useJourneyStore();
    
    // Get current position in journey
    const currentIndex = gameStore.journeyPath.indexOf(gameStore.currentLandscapeId);
    const nextIndex = currentIndex + 1;
    
    // Check if we're at the end of the journey
    if (nextIndex >= gameStore.journeyPath.length) {
      console.log('Reached the end of the journey path');
      return null;
    }
    
    // Get the next landscape ID
    const nextLandscapeId = gameStore.journeyPath[nextIndex];
    
    // Update game state
    gameStore.currentLandscapeId = nextLandscapeId;
    
    // Add to visited landscapes if not already visited
    if (!gameStore.visitedLandscapes.includes(nextLandscapeId)) {
      gameStore.visitedLandscapes.push(nextLandscapeId);
      // Apply effects when entering a new landscape
      this.applyLandscapeEntryEffects(nextLandscapeId);
    }
    
    return nextLandscapeId;
  }
  
  /**
   * Start a new turn at the next landscape
   * @returns The ID of the new current landscape
   */
  startNewTurn(): string | null {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore() as any as ExtendedPlayerStore;
    
    // Move to the next landscape
    const newLandscapeId = this.moveToNextLandscape();
    
    // Reset per-turn player actions
    playerStore.hasResourceForagingAction = true;
    playerStore.hasPerformedCrafting = false;
    
    // Increment turn counter using the dedicated method
    gameStore.incrementTurn();
    
    // Check if we should advance the season (every 3 landscapes)
    // We use the visited landscapes length as a counter
    if (gameStore.visitedLandscapes.length > 0 && gameStore.visitedLandscapes.length % 3 === 0) {
      console.log(`Advancing season after ${gameStore.visitedLandscapes.length} landscapes`);
      this.advanceToNextSeason();
    }
    
    return newLandscapeId;
  }
  
  /**
   * Force initialization of the journey path
   * This is a safety method to ensure we have a valid journey path
   * @returns The initialized journey path or empty array if failed
   */
  ensureJourneyPathInitialized(): string[] {
    const gameStore = useGameStore();
    const journeyStore = useJourneyStore();
    
    // Check if journey path is missing or empty
    if (!gameStore.journeyPath || !Array.isArray(gameStore.journeyPath) || gameStore.journeyPath.length === 0) {
      console.log('Journey path needs initialization, generating now...');
      
      // Initialize a new journey path
      const path = this.initializeJourney();
      
      // Make sure the first landscape is set as current
      if (path.length > 0 && !gameStore.currentLandscapeId) {
        gameStore.setCurrentLandscapeId(path[0]);
      }
      
      return path;
    }
    
    return gameStore.journeyPath;
  }
  
  /**
   * Get the ID of the next landscape in the journey path
   * @returns The ID of the next landscape or null if at the end
   */
  getNextLandscapeId(): string | null {
    const gameStore = useGameStore() as any as ExtendedGameStore;
    const journeyStore = useJourneyStore();
    
    // Ensure journey path is initialized
    this.ensureJourneyPathInitialized();
    
    // Check if journey path exists after initialization attempt
    if (!gameStore.journeyPath || !Array.isArray(gameStore.journeyPath) || gameStore.journeyPath.length === 0) {
      console.error('Journey path is not initialized properly');
      return null;
    }
    
    // Check if current landscape ID exists
    if (!gameStore.currentLandscapeId) {
      console.error('Current landscape ID is not set');
      return null;
    }
    
    // Get current position in journey
    const currentIndex = gameStore.journeyPath.indexOf(gameStore.currentLandscapeId);
    const nextIndex = currentIndex + 1;
    
    // Check if we're at the end of the journey
    if (nextIndex >= gameStore.journeyPath.length) {
      return null;
    }
    
    return gameStore.journeyPath[nextIndex];
  }
  
  /**
   * Get available landscape options to move to
   * @returns Array of available landscape IDs to move to
   */
  getAvailableMovementOptions(): string[] {
    const gameStore = useGameStore() as any as ExtendedGameStore;
    const journeyStore = useJourneyStore();
    
    // Get current position in journey
    const currentIndex = gameStore.journeyPath.indexOf(gameStore.currentLandscapeId);
    
    // Only allow forward movement in this implementation
    const result = [];
    if (currentIndex + 1 < gameStore.journeyPath.length) {
      result.push(gameStore.journeyPath[currentIndex + 1]);
    }
    
    return result;
  }
  
  /**
   * Get the next landscape object in the journey path
   * @returns The next landscape object or null if at the end
   */
  getNextLandscape(): LandscapeCard | null {
    const gameStore = useGameStore() as any as ExtendedGameStore;
    const cardStore = useCardStore();
    const journeyStore = useJourneyStore();
    
    const nextLandscapeId = this.getNextLandscapeId();
    if (!nextLandscapeId) {
      return null;
    }
    
    return cardStore.getLandscapeById(nextLandscapeId);
  }
  
  /**
   * Get the current landscape object
   * @returns The current landscape object
   */
  getCurrentLandscape(): LandscapeCard | null {
    const gameStore = useGameStore() as any as ExtendedGameStore;
    const cardStore = useCardStore();
    
    return cardStore.getLandscapeById(gameStore.currentLandscapeId);
  }
  
  /**
   * Check if the current location provides shelter
   * @param gameStore The game store instance
   * @returns True if the current location provides shelter
   */
  isCurrentLocationShelter(gameStore = useGameStore() as any as ExtendedGameStore): boolean {
    const cardStore = useCardStore();
    const landscape = cardStore.getLandscapeById(gameStore.currentLandscapeId);
    
    return landscape?.providesShelter || false;
  }
  
  /**
   * Apply effects when entering a new landscape
   */
  private applyLandscapeEntryEffects(landscapeId: string): void {
    const cardStore = useCardStore();
    const gameStore = useGameStore() as any as ExtendedGameStore;
    const logStore = useLogStore();
    const landscape = cardStore.getLandscapeById(landscapeId);
    
    if (!landscape) {
      return;
    }
    
    // Log entry to new landscape
    gameStore.addToGameLog(`You have arrived at ${landscape.name}`);
    
    // Apply landscape effects
    if (landscape.difficulty > 0) {
      // Dangerous landscapes add threat tokens based on difficulty
      const threatTokens = Math.min(landscape.difficulty, 3);
      gameStore.addThreatTokens(threatTokens);
      gameStore.addToGameLog(`The danger of this area adds ${threatTokens} threat token(s)`);
    }
    
    // Apply landscape challenge if it has one
    if (landscape.challengeType) {
      gameStore.addToGameLog(`This area presents a ${landscape.challengeType} challenge`);
      
      // Set the challenge in the game state
      // Use a dummy challenge ID based on landscape for now
      const challengeId = `${landscape.id}_challenge`;
      gameStore.setCurrentChallenge(challengeId);
    }
    
    // Apply landscape special effects
    if (landscape.specialFeature) {
      gameStore.addTempEffect(
        landscape.specialFeature.name, 
        landscape.specialFeature.description,
        landscape.specialFeature.effect,
        1
      );
      gameStore.addToGameLog(`The landscape applies ${landscape.specialFeature.name}`);
    }
    
    // Apply entry effects if defined
    if (landscape.entryEffect) {
      gameStore.addToGameLog(`Entry Effect: ${landscape.entryEffect.description}`);
    }
  }
  
  /**
   * Advances to the next season
   * Wrapper method for seasonStore.advanceSeason()
   */
  advanceToNextSeason(): void {
    const seasonStore = useSeasonStore();
    seasonStore.advanceSeason();
  }
  
  /**
   * Get the name of a season
   * @param season The season enum value
   * @returns The display name of the season
   */
  getSeasonName(season: Season): string {
    switch (season) {
      case Season.WINTERS_DEPTH:
        return "Winter's Depth";
      case Season.IMBOLC:
        return "Imbolc";
      case Season.BELTANE:
        return "Beltane";
      case Season.LUGHNASADH:
        return "Lughnasadh";
      case Season.SAMHAIN:
        return "Samhain";
      default:
        return "Unknown Season";
    }
  }
}

export const journeyService = new JourneyService();
