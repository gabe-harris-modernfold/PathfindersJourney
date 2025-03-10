import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 2/15: Misty Barrow Downs - Second Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's second step in their journey
 * at the Misty Barrow Downs during the Samhain season. It includes:
 * - Challenge resolution for Ancestral Spirits (a courage challenge)
 * - Gathering Barrow Dust (abundant in Samhain)
 * - Using Raven Scout companion ability
 * - Accumulating resources for future crafting
 * 
 * The Misty Barrow Downs are known for their Ancestral Spirits challenge,
 * particularly potent during Samhain when the veil between worlds is thinnest.
 */
describe('Journey 2/15: Giant Beastfriend at Misty Barrow Downs', () => {
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
    
    // Setup landscape and challenge
    gameStore.setCurrentLandscape('misty_barrow_downs');
    gameStore.setCurrentChallenge('ancestral_spirits');
    
    // Set journey progress to 1 (second landscape)
    gameStore.advanceJourney(1);
    
    // Set starting resources and companions based on previous landscape
    playerStore.addResource('standing_stone_chips');
    playerStore.addResource('barrow_dust');
    playerStore.addAnimalCompanion('raven_scout');
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Misty Barrow Downs and overcome the Ancestral Spirits challenge', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we're still in Samhain season
    expect(gameStore.currentSeason).toBe(Season.SAMHAIN);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // Still early in the journey, threat level remains low
    expect(gameStore.threatTokens).toBe(0);
    
    // Perform threat level check
    gameStore.handleThreatLevelCheck();
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 3. PHASE: LANDSCAPE CHALLENGE
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('misty_barrow_downs');
    expect(gameStore.currentChallenge).toBe('ancestral_spirits');
    
    // Use Raven Scout's ability to gain insight about the challenge
    playerStore.useCompanionAbility('raven_scout');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 7; // Ancestral Spirits base difficulty
    const seasonModifier = 2; // Samhain makes spiritual challenges harder (+2)
    const threatModifier = Math.floor(gameStore.threatTokens / 3); // No threat tokens yet
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier;
    
    // Giant Beastfriend has a slight bonus for spiritual challenges
    const characterBonus = 1;
    
    // Mock a successful roll (8) - a natural 8 always succeeds regardless of modifiers
    const mockRoll = 8;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const success = gameStore.resolveChallenge(mockRoll + characterBonus, totalDifficulty);
    
    // Should be a full success (natural 8 always succeeds)
    expect(success).toBe('SUCCESS');
    
    // On success, gain 2 resources from the landscape
    playerStore.addResource('barrow_dust'); // Resource available at Misty Barrow Downs
    playerStore.addResource('barrow_dust'); // Second resource from success
    
    // Verify resources were added
    expect(playerStore.resources.filter(r => r === 'barrow_dust').length).toBe(3); // 1 from setup + 2 new
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Verify resource capacity for Giant Beastfriend
    expect(playerStore.resourceCapacity).toBe(8);
    
    // Add more resources available at this landscape
    playerStore.addResource('ogham_sticks');
    
    // Verify resources are within capacity
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // We already have the Raven Scout, feed it to strengthen our bond
    const initialResources = playerStore.resources.length;
    playerStore.feedCompanion('raven_scout', 'barrow_dust');
    
    // Verify resource was consumed
    expect(playerStore.resources.length).toBe(initialResources - 1);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Check if we can craft anything with our current resources
    const craftableItems = playerStore.getCraftableItems();
    
    // We now have Standing Stone Chips, Barrow Dust, and Ogham Sticks
    // But we still don't have enough for a specific item
    expect(craftableItems.length).toBe(0);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 8. PHASE: JOURNEY PROGRESSION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.JOURNEY_PROGRESSION);
    
    // Since we had a success, advance to the next landscape
    const initialProgress = gameStore.journeyProgress;
    gameStore.advanceJourney(1); // Move forward one step
    
    // Verify journey progress has increased
    expect(gameStore.journeyProgress).toBe(initialProgress + 1);
    
    // Gain experience for the successful challenge
    playerStore.addExperience(1);
    
    // Prepare for next landscape (Sacred Oak Grove)
    gameStore.setCurrentLandscape('sacred_oak_grove');
    gameStore.setCurrentChallenge('wild_beasts');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
