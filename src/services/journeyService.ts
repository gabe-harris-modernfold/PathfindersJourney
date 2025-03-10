/**
 * Journey Service
 * Handles journey path initialization and landscape navigation
 */
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { Season } from '@/models/enums/seasons';
import { LandscapeCard } from '@/models/types/cards';

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
    
    // Ensure the first landscape is a safe starting point
    this.ensureSafeStartingPoint(selectedLandscapes);
    
    // Return the IDs of the selected landscapes
    return selectedLandscapes.map(landscape => landscape.id);
  }
  
  /**
   * Move to the next landscape in the journey
   * @returns The ID of the new current landscape
   */
  moveToNextLandscape(): string | null {
    const gameStore = useGameStore();
    
    // Get current position in journey
    const currentIndex = gameStore.journeyPath.indexOf(gameStore.currentLandscapeId);
    
    // If at the end of the journey, return null
    if (currentIndex === gameStore.journeyPath.length - 1) {
      return null;
    }
    
    // Get next landscape ID
    const nextLandscapeId = gameStore.journeyPath[currentIndex + 1];
    
    // Update game state
    gameStore.visitedLandscapes.push(nextLandscapeId);
    gameStore.currentLandscapeId = nextLandscapeId;
    
    // Apply landscape entry effects
    this.applyLandscapeEntryEffects(nextLandscapeId);
    
    return nextLandscapeId;
  }
  
  /**
   * Check if the current location provides shelter
   * @param gameStore The game store instance
   * @returns True if the current location provides shelter
   */
  isCurrentLocationShelter(gameStore = useGameStore()): boolean {
    const cardStore = useCardStore();
    const landscape = cardStore.getLandscapeById(gameStore.currentLandscapeId);
    
    return landscape?.providesShelter || false;
  }
  
  /**
   * Get available movement options from current landscape
   * @returns Array of available landscape IDs to move to
   */
  getAvailableMovementOptions(): string[] {
    const gameStore = useGameStore();
    
    // Get current position in journey
    const currentIndex = gameStore.journeyPath.indexOf(gameStore.currentLandscapeId);
    
    // If at the end of the journey, return empty array
    if (currentIndex === gameStore.journeyPath.length - 1) {
      return [];
    }
    
    // For now, only allow moving to the next landscape
    // Could be expanded to allow backtracking or alternate paths
    return [gameStore.journeyPath[currentIndex + 1]];
  }
  
  /**
   * Get the next landscape in the journey
   * @returns The next landscape object or null if at the end
   */
  getNextLandscape(): LandscapeCard | null {
    const gameStore = useGameStore();
    const cardStore = useCardStore();
    
    // Get current position in journey
    const currentIndex = gameStore.journeyPath.indexOf(gameStore.currentLandscapeId);
    
    // If at the end of the journey, return null
    if (currentIndex === gameStore.journeyPath.length - 1) {
      return null;
    }
    
    // Get next landscape ID
    const nextLandscapeId = gameStore.journeyPath[currentIndex + 1];
    
    // Return the landscape object
    return cardStore.getLandscapeById(nextLandscapeId);
  }
  
  /**
   * Get the current landscape
   * @returns The current landscape object
   */
  getCurrentLandscape(): LandscapeCard | null {
    const gameStore = useGameStore();
    const cardStore = useCardStore();
    
    return cardStore.getLandscapeById(gameStore.currentLandscapeId);
  }
  
  /**
   * Apply effects when entering a new landscape
   * @param landscapeId The ID of the landscape being entered
   */
  private applyLandscapeEntryEffects(landscapeId: string): void {
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    const landscape = cardStore.getLandscapeById(landscapeId);
    
    if (!landscape) {
      return;
    }
    
    // Apply entry effects if defined
    if (landscape.entryEffect && landscape.entryEffect.description) {
      gameStore.addToGameLog(`Landscape Effect: ${landscape.entryEffect.description}`);
    }
    
    // Add landscape-specific challenges to the game
    if (landscape.challenges && landscape.challenges.length > 0) {
      // Set current challenge if there is one
      if (landscape.challenges[0] && landscape.challenges[0].id) {
        gameStore.setCurrentChallenge(landscape.challenges[0].id);
      }
    }
  }
  
  /**
   * Ensure the first landscape in the journey is a safe starting point
   * @param landscapes Array of landscapes for the journey
   */
  private ensureSafeStartingPoint(landscapes: LandscapeCard[]): void {
    // Find a safe landscape (low difficulty, provides shelter)
    const safeIndex = landscapes.findIndex(landscape => 
      landscape.providesShelter && 
      landscape.challenges && 
      landscape.challenges.every(challenge => challenge.difficulty <= 3)
    );
    
    // If found, swap with the first landscape
    if (safeIndex > 0) {
      [landscapes[0], landscapes[safeIndex]] = [landscapes[safeIndex], landscapes[0]];
    }
  }
  
  /**
   * Advance to the next season
   * @returns The new current season
   */
  advanceToNextSeason(): Season {
    const gameStore = useGameStore();
    
    // Use the proper Season enum values
    const seasons = [Season.SAMHAIN, Season.WINTERS_DEPTH, Season.IMBOLC, Season.BELTANE, Season.LUGHNASADH];
    const currentIndex = seasons.indexOf(gameStore.currentSeason as Season);
    
    // If current season not found, default to first season
    const nextIndex = (currentIndex === -1) ? 0 : (currentIndex + 1) % seasons.length;
    const nextSeason = seasons[nextIndex];
    
    // Update game state
    gameStore.currentSeason = nextSeason;
    
    // Apply seasonal transition effects
    this.applySeasonalTransitionEffects(nextSeason);
    
    return nextSeason;
  }
  
  /**
   * Apply effects when transitioning to a new season
   * @param season The new season
   */
  private applySeasonalTransitionEffects(season: Season): void {
    const gameStore = useGameStore();
    
    // Different effects based on the season
    switch (season) {
      case Season.SAMHAIN:
        // Veil between worlds is thin - increase threat
        gameStore.addThreatTokens(1);
        break;
      case Season.WINTERS_DEPTH:
        // Harsh conditions - challenges are more difficult
        gameStore.addTempEffect('winter_hardship', 'Winter Hardship', 'All physical challenges +1 difficulty', 1, 3);
        break;
      case Season.IMBOLC:
        // Renewal - heal 1 health
        const playerStore = usePlayerStore();
        console.log('Player heals 1 health from Imbolc season');
        playerStore.healHealth(1);
        gameStore.addToGameLog('The renewal of Imbolc heals you for 1 health', true);
        break;
      case Season.BELTANE:
        // Abundance - easier to find resources
        gameStore.addTempEffect('resource_abundance', 'Resource Abundance', 'Collect +1 resource from successful challenges', 1, 3);
        break;
      case Season.LUGHNASADH:
        // Harvest - crafting is easier
        gameStore.addTempEffect('crafting_bonus', 'Crafting Bonus', 'Crafting is easier during Lughnasadh', 1, 3);
        break;
    }
  }
}

export const journeyService = new JourneyService();
