import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 1/15: Ancient Stone Circle - First Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's first step in their journey
 * at the Ancient Stone Circle during the Samhain season. It includes:
 * - Initial character setup
 * - First landscape challenge (Spectral Guardians - a wisdom challenge)
 * - Resource gathering in Samhain season
 * - Starting animal companion bonding
 * 
 * The Ancient Stone Circle is known for its Spectral Guardians challenge,
 * which is more difficult during Samhain when the veil between worlds is thin.
 */
describe('Journey 1/15: Giant Beastfriend at Ancient Stone Circle', () => {
  // Setup stores before each test
  beforeEach(() => {
    setActivePinia(createPinia());
    
    // Mock any randomized functions to ensure predictable outcomes
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    
    // Reset game state
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    gameStore.resetGame();
    playerStore.resetPlayer();
    
    // Initialize game with test data
    gameStore.startGame();
    
    // Setup player with Giant Beastfriend character
    playerStore.selectCharacter('giant_beastfriend');
    
    // Setup initial landscape and challenge
    gameStore.setCurrentLandscape('ancient_stone_circle');
    gameStore.setCurrentChallenge('spectral_guardians');
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Ancient Stone Circle and overcome the Spectral Guardians challenge', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we're in Samhain season
    expect(gameStore.currentSeason).toBe(Season.SAMHAIN);
    expect(gameStore.gameLog.some(entry => entry.message.includes('season of Samhain'))).toBe(true);
    
    // Verify the seasonal effects (veil between worlds is thin)
    // This makes spiritual challenges harder (+2 difficulty)
    gameStore.updateResourceAvailability();
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // At the start of the journey, threat level should be 0
    expect(gameStore.threatTokens).toBe(0);
    
    // Perform threat level check
    gameStore.handleThreatLevelCheck();
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 3. PHASE: LANDSCAPE CHALLENGE
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('ancient_stone_circle');
    expect(gameStore.currentChallenge).toBe('spectral_guardians');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 6; // Spectral Guardians base difficulty
    const seasonModifier = 2; // Samhain makes spiritual challenges harder (+2)
    const threatModifier = Math.floor(gameStore.threatTokens / 3); // No threat tokens yet
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier;
    
    // Giant Beastfriend has no special bonuses for wisdom challenges
    const characterBonus = 0;
    
    // Mock a successful roll (7) despite difficult challenge
    const mockRoll = 7;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const success = gameStore.resolveChallenge(mockRoll + characterBonus, totalDifficulty);
    
    // Should be a partial success (roll + bonus = difficulty - 1)
    expect(success).toBe('PARTIAL');
    
    // On partial success, gain 1 resource from the landscape
    playerStore.addResource('standing_stone_chips'); // Resource available at Ancient Stone Circle
    
    // Verify resource was added
    expect(playerStore.resources).toContain('standing_stone_chips');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Verify resource capacity for Giant Beastfriend
    expect(playerStore.resourceCapacity).toBe(8); // Giant Beastfriend has 8 capacity
    
    // Add Barrow Dust (abundant in Samhain)
    playerStore.addResource('barrow_dust');
    
    // Verify resources are within capacity
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // At the Ancient Stone Circle, the player might encounter a Raven Scout
    // Giant Beastfriend has animal empathy ability
    playerStore.addAnimalCompanion('raven_scout');
    
    // Verify companion was added
    expect(playerStore.animalCompanions.length).toBe(1);
    expect(playerStore.animalCompanions[0]).toBe('raven_scout');
    
    // Feed companion with Barrow Dust to bond with it
    const initialResources = playerStore.resources.length;
    playerStore.feedCompanion('raven_scout', 'barrow_dust');
    
    // Verify resource was consumed
    expect(playerStore.resources.length).toBe(initialResources - 1);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // For the first landscape, we don't have enough resources to craft yet
    // but we'll gather resources for future crafting
    const craftableItems = playerStore.getCraftableItems();
    expect(craftableItems.length).toBe(0); // No craftable items yet with current resources
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 8. PHASE: JOURNEY PROGRESSION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.JOURNEY_PROGRESSION);
    
    // Since we had a partial success, we can advance to the next landscape
    const initialProgress = gameStore.journeyProgress;
    gameStore.advanceJourney(1); // Move forward one step
    
    // Verify journey progress has increased
    expect(gameStore.journeyProgress).toBe(initialProgress + 1);
    
    // Check if we get experience for overcoming our first challenge
    expect(playerStore.experience).toBeGreaterThan(0);
    
    // Prepare for next landscape (Misty Barrow Downs)
    gameStore.setCurrentLandscape('misty_barrow_downs');
    gameStore.setCurrentChallenge('ancestral_spirits');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
