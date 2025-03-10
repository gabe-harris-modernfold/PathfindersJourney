import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 3/15: Sacred Oak Grove - Third Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's third step in their journey
 * at the Sacred Oak Grove during the Samhain season, just before the seasonal transition.
 * 
 * Key elements tested:
 * - Encountering and bonding with animal companions (Wolf, Deer, Bear, Boar)
 * - Leveraging Giant Beastfriend's ability to use two companions simultaneously
 * - Stealth challenge against Wild Beasts
 * - Resource gathering in preparation for crafting
 * 
 * The Sacred Oak Grove is a pivotal location for encountering animal companions,
 * making it particularly valuable for the Giant Beastfriend character.
 */
describe('Journey 3/15: Giant Beastfriend at Sacred Oak Grove', () => {
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
    gameStore.setCurrentLandscape('sacred_oak_grove');
    gameStore.setCurrentChallenge('wild_beasts');
    
    // Set journey progress to 2 (third landscape)
    gameStore.advanceJourney(2);
    
    // Set starting resources and companions based on previous landscapes
    playerStore.addResource('standing_stone_chips');
    playerStore.addResource('barrow_dust');
    playerStore.addResource('ogham_sticks');
    playerStore.addAnimalCompanion('raven_scout');
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Sacred Oak Grove, gain animal companions, and overcome the Wild Beasts challenge', () => {
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
    
    // Add a threat token from previous encounters
    gameStore.addThreatTokens(1);
    expect(gameStore.threatTokens).toBe(1);
    
    // Perform threat level check
    gameStore.handleThreatLevelCheck();
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 3. PHASE: LANDSCAPE CHALLENGE
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('sacred_oak_grove');
    expect(gameStore.currentChallenge).toBe('wild_beasts');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 5; // Wild Beasts base difficulty
    const seasonModifier = 0; // No seasonal modifier for this challenge
    const threatModifier = Math.floor(gameStore.threatTokens / 3); // 1 threat token = 0 modifier
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier;
    
    // Giant Beastfriend has a strong affinity with animals (+2 for animal-related challenges)
    const characterBonus = 2;
    
    // Mock a decent roll (5)
    const mockRoll = 5;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const success = gameStore.resolveChallenge(mockRoll + characterBonus, totalDifficulty);
    
    // Should be a full success (roll 5 + bonus 2 = 7 vs difficulty 5)
    expect(success).toBe('SUCCESS');
    
    // On success, gain 2 resources from the landscape
    playerStore.addResource('rowan_wood'); // Resource available at Sacred Oak Grove
    playerStore.addResource('horse_hair'); // Another resource from success
    
    // Verify resources were added
    expect(playerStore.resources).toContain('rowan_wood');
    expect(playerStore.resources).toContain('horse_hair');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Verify resource capacity for Giant Beastfriend
    expect(playerStore.resourceCapacity).toBe(8);
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // The Sacred Oak Grove is where we can encounter Wolf, Deer, Bear, and Boar companions
    // Giant Beastfriend can have two animal companions active at once
    
    // First, feed our existing Raven Scout
    playerStore.feedCompanion('raven_scout', 'barrow_dust');
    
    // Then, gain a new animal companion - Wolf Guardian
    playerStore.addAnimalCompanion('wolf_guardian');
    
    // Feed the new companion to bond with it
    playerStore.feedCompanion('wolf_guardian', 'horse_hair');
    
    // Verify we now have two companions
    expect(playerStore.animalCompanions.length).toBe(2);
    expect(playerStore.animalCompanions).toContain('raven_scout');
    expect(playerStore.animalCompanions).toContain('wolf_guardian');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Now we have Rowan Wood and Silver Mistletoe, so we can craft a Colossal Whistle
    // Check if we have the necessary resources
    const hasRowanWood = playerStore.resources.includes('rowan_wood');
    
    // Add Silver Mistletoe to complete the crafting requirements
    playerStore.addResource('silver_mistletoe');
    const hasSilverMistletoe = playerStore.resources.includes('silver_mistletoe');
    
    expect(hasRowanWood).toBe(true);
    expect(hasSilverMistletoe).toBe(true);
    
    // Craft the Colossal Whistle
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('colossal_whistle');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('colossal_whistle');
    
    // Consume the resources used for crafting
    playerStore.removeResource('rowan_wood');
    playerStore.removeResource('silver_mistletoe');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 8. PHASE: JOURNEY PROGRESSION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.JOURNEY_PROGRESSION);
    
    // We had a successful challenge, so advance to the next landscape
    const initialProgress = gameStore.journeyProgress;
    gameStore.advanceJourney(1); // Move forward one step
    
    // Verify journey progress has increased
    expect(gameStore.journeyProgress).toBe(initialProgress + 1);
    
    // Gain experience for successful challenge and crafting
    playerStore.addExperience(2); // +1 for challenge, +1 for crafting
    
    // Check if we've reached a seasonal boundary (landscapes 1-3 are Samhain)
    if (gameStore.journeyProgress >= 3) {
      // Advance to Winter's Depth season
      gameStore.advanceSeason();
      expect(gameStore.currentSeason).toBe(Season.WINTERS_DEPTH);
    }
    
    // Prepare for next landscape (Thatched Village)
    gameStore.setCurrentLandscape('thatched_village');
    gameStore.setCurrentChallenge('suspicious_elders');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
