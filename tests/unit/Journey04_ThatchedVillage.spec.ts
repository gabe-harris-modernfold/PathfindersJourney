import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 4/15: Thatched Village - Fourth Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Thatched Village during the Winter's Depth season. Key elements tested:
 * 
 * - Seasonal transition to Winter's Depth and its effects
 * - Social challenge with the Suspicious Elders (charm-based)
 * - Using animal companions to overcome a social challenge
 * - Testing the Colossal Whistle crafted item
 * - Managing resources during the harsh Winter's Depth season
 * 
 * The Thatched Village presents a social challenge, which may be difficult 
 * for the wilderness-oriented Giant Beastfriend character.
 */
describe('Journey 4/15: Giant Beastfriend at Thatched Village', () => {
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
    gameStore.setCurrentLandscape('thatched_village');
    gameStore.setCurrentChallenge('suspicious_elders');
    
    // Set journey progress to 3 (fourth landscape)
    gameStore.advanceJourney(3);
    
    // Set season to Winter's Depth (having passed the seasonal boundary)
    gameStore.advanceSeason(); // Advance from starting season (Samhain) to Winter's Depth
    
    // Set starting resources and companions based on previous landscapes
    playerStore.addResource('standing_stone_chips');
    playerStore.addResource('barrow_dust');
    playerStore.addResource('ogham_sticks');
    playerStore.addAnimalCompanion('raven_scout');
    playerStore.addAnimalCompanion('wolf_guardian');
    playerStore.addCraftedItem('colossal_whistle');
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Thatched Village during Winter\'s Depth and handle the social challenge', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we've moved to Winter's Depth season
    expect(gameStore.currentSeason).toBe(Season.WINTERS_DEPTH);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // In Winter's Depth:
    // - Physical challenges are harder (+2 difficulty)
    // - Clearer thinking in stillness (+1 to wisdom challenges)
    // - Forge Cinders and Bog Iron are abundant
    // - Sacred Water and Horse Hair are scarce
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // Add another threat token from using the Colossal Whistle
    gameStore.addThreatTokens(2);
    expect(gameStore.threatTokens).toBe(2);
    
    // Perform threat level check
    gameStore.handleThreatLevelCheck();
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 3. PHASE: LANDSCAPE CHALLENGE
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('thatched_village');
    expect(gameStore.currentChallenge).toBe('suspicious_elders');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 6; // Suspicious Elders base difficulty
    const seasonModifier = 0; // No seasonal modifier for social challenges in Winter's Depth
    const threatModifier = Math.floor(gameStore.threatTokens / 3); // 2 threat tokens = 0 modifier
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier;
    
    // Giant Beastfriend has no special bonuses for social challenges
    const characterBonus = 0;
    
    // Use crafted item: Colossal Whistle grants +2 for physical challenges but not social ones
    const itemBonus = 0;
    
    // Use Fox Trickster companion (adding it first)
    playerStore.addAnimalCompanion('fox_trickster');
    playerStore.feedCompanion('fox_trickster', 'barrow_dust');
    
    // Fox Trickster gives +2 for social challenges
    const companionBonus = 2;
    
    // Mock a mediocre roll (4)
    const mockRoll = 4;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const success = gameStore.resolveChallenge(
      mockRoll + characterBonus + itemBonus + companionBonus, 
      totalDifficulty
    );
    
    // Should be a success (roll 4 + companion bonus 2 = 6 vs difficulty 6)
    expect(success).toBe('SUCCESS');
    
    // On success, gain 2 resources from the landscape
    playerStore.addResource('woven_reeds'); // Resource available at Thatched Village
    playerStore.addResource('sacred_water'); // Another resource from success
    
    // Verify resources were added
    expect(playerStore.resources).toContain('woven_reeds');
    expect(playerStore.resources).toContain('sacred_water');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // In Winter's Depth, Forge Cinders and Bog Iron are abundant
    playerStore.addResource('forge_cinders');
    playerStore.addResource('bog_iron');
    
    // Check if we exceed capacity and handle it
    if (playerStore.resources.length > playerStore.resourceCapacity) {
      // Discard a non-essential resource
      playerStore.removeResource('ogham_sticks');
    }
    
    // Verify resource capacity for Giant Beastfriend
    expect(playerStore.resourceCapacity).toBe(8);
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // Giant Beastfriend can have two active companions at once
    // We already used Fox Trickster, so now use Wolf Guardian
    
    // Feed Wolf Guardian to maintain bond
    playerStore.feedCompanion('wolf_guardian', 'barrow_dust');
    
    // Verify we still have our companions
    expect(playerStore.animalCompanions.length).toBe(3);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Let's craft a Giant's Bridle with Bog Iron, Horse Hair, and Woven Reeds
    // We need Horse Hair, which we don't have yet
    playerStore.addResource('horse_hair');
    
    // Verify we have all required resources
    const hasBogIron = playerStore.resources.includes('bog_iron');
    const hasHorseHair = playerStore.resources.includes('horse_hair');
    const hasWovenReeds = playerStore.resources.includes('woven_reeds');
    
    expect(hasBogIron).toBe(true);
    expect(hasHorseHair).toBe(true);
    expect(hasWovenReeds).toBe(true);
    
    // Craft the Giant's Bridle
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('giants_bridle');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('giants_bridle');
    
    // Consume the resources used for crafting
    playerStore.removeResource('bog_iron');
    playerStore.removeResource('horse_hair');
    playerStore.removeResource('woven_reeds');
    
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
    
    // Gain experience for successful challenge and crafting
    playerStore.addExperience(2); // +1 for challenge, +1 for crafting
    
    // Prepare for next landscape (Iron Forge Dell)
    gameStore.setCurrentLandscape('iron_forge_dell');
    gameStore.setCurrentChallenge('molten_trials');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
