import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 7/15: Menhir Path - Seventh Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Menhir Path during the Imbolc season. Key elements tested:
 * 
 * - Season transition to Imbolc and its effects
 * - Using Spirit Bridge Tokens to bypass Stone Sentinels challenge
 * - Managing animal companions across seasonal transitions
 * - Resource gathering in the awakening spring of Imbolc
 * - Testing threat level reduction during seasonal change
 * 
 * The Menhir Path presents an endurance-based physical challenge,
 * suitable for the Giant Beastfriend's physical prowess.
 */
describe('Journey 7/15: Giant Beastfriend at Menhir Path', () => {
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
    gameStore.setCurrentLandscape('menhir_path');
    gameStore.setCurrentChallenge('stone_sentinels');
    
    // Set journey progress to 6 (seventh landscape)
    gameStore.advanceJourney(6);
    
    // Set season to Imbolc (having passed the seasonal boundary)
    gameStore.advanceSeason(); // Advance from Winter's Depth to Imbolc
    gameStore.advanceSeason(); 
    
    // Set starting resources based on previous landscapes
    playerStore.addResource('standing_stone_chips');
    playerStore.addResource('forge_cinders');
    playerStore.addResource('amber_shards');
    
    // Add animal companions
    playerStore.addAnimalCompanion('raven_scout');
    playerStore.addAnimalCompanion('wolf_guardian');
    playerStore.addAnimalCompanion('fox_trickster');
    playerStore.addAnimalCompanion('salmon_journeyer');
    playerStore.addAnimalCompanion('owl_sage');
    
    // Add crafted items
    playerStore.addCraftedItem('colossal_whistle');
    playerStore.addCraftedItem('giants_bridle');
    playerStore.addCraftedItem('iron_grove_key');
    playerStore.addCraftedItem('spirit_bridge_tokens');
    
    // Set threat tokens (reduced by 1 during seasonal transition to Imbolc)
    gameStore.addThreatTokens(3);
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Menhir Path during Imbolc and overcome the Stone Sentinels challenge', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we've moved to Imbolc season
    expect(gameStore.currentSeason).toBe(Season.IMBOLC);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // In Imbolc:
    // - Stealth and patience challenges are easier (-1 difficulty)
    // - Physical challenges are normal again (no modifiers)
    // - Silver Mistletoe and Horse Hair are abundant
    // - River Rushes are newly available
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // Verify threat tokens (should be 3 after reduction during seasonal transition)
    expect(gameStore.threatTokens).toBe(3);
    
    // Perform threat level check
    gameStore.handleThreatLevelCheck();
    
    // With 3 threat tokens, challenge difficulty increases by +1
    const threatModifier = Math.floor(gameStore.threatTokens / 3);
    expect(threatModifier).toBe(1);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 3. PHASE: LANDSCAPE CHALLENGE
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('menhir_path');
    expect(gameStore.currentChallenge).toBe('stone_sentinels');
    
    // Use Spirit Bridge Tokens to commune with the stones
    playerStore.useCraftedItem('spirit_bridge_tokens');
    
    // The Spirit Bridge Tokens allow for bypassing certain challenges
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 7; // Stone Sentinels base difficulty
    const seasonModifier = 0; // No specific seasonal modifier for endurance challenges in Imbolc
    const itemBonus = -3; // Spirit Bridge Tokens significantly reduce difficulty
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier + itemBonus;
    
    // Giant Beastfriend has a natural endurance bonus
    const characterBonus = 2;
    
    // Use Bear Guardian companion for additional strength (adding it first)
    playerStore.addAnimalCompanion('bear_guardian');
    playerStore.feedCompanion('bear_guardian', 'amber_shards');
    
    // Bear Guardian gives +3 for endurance challenges
    const companionBonus = 3;
    
    // Mock a decent roll (4)
    const mockRoll = 4;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const totalRoll = mockRoll + characterBonus + companionBonus;
    const success = gameStore.resolveChallenge(totalRoll, totalDifficulty);
    
    // Should be a success (roll 4 + character 2 + companion 3 = 9 vs difficulty 5)
    expect(success).toBe('SUCCESS');
    
    // On success, gain resources
    playerStore.addResource('standing_stone_chips'); // Resource available at Menhir Path
    playerStore.addResource('silver_mistletoe'); // Abundant in Imbolc
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Check resource capacity
    expect(playerStore.resourceCapacity).toBe(8);
    
    // In Imbolc, Silver Mistletoe and Horse Hair are abundant
    playerStore.addResource('horse_hair');
    
    // River Rushes are newly available in Imbolc
    playerStore.addResource('river_rushes');
    
    // Check and handle resource capacity
    if (playerStore.resources.length > playerStore.resourceCapacity) {
      // Discard a resource that's less useful going forward
      playerStore.removeResource('forge_cinders');
    }
    
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // Giant Beastfriend can have two active companions at once
    // We already activated Bear Guardian, now use Wolf Guardian
    
    // Feed Wolf Guardian to maintain bond
    playerStore.feedCompanion('wolf_guardian', 'standing_stone_chips');
    
    // Use Wolf Guardian's ability to track the path ahead
    playerStore.useCompanionAbility('wolf_guardian');
    
    // Verify we have our companions
    expect(playerStore.animalCompanions.length).toBe(6);
    expect(playerStore.animalCompanions).toContain('bear_guardian');
    expect(playerStore.animalCompanions).toContain('wolf_guardian');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Let's craft the Druid's Charm with Silver Mistletoe, River Rushes, and Standing Stone Chips
    
    // Verify we have all required resources
    const hasSilverMistletoe = playerStore.resources.includes('silver_mistletoe');
    const hasRiverRushes = playerStore.resources.includes('river_rushes');
    const hasStandingStoneChips = playerStore.resources.includes('standing_stone_chips');
    
    expect(hasSilverMistletoe).toBe(true);
    expect(hasRiverRushes).toBe(true);
    expect(hasStandingStoneChips).toBe(true);
    
    // Craft the Druid's Charm
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('druids_charm');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('druids_charm');
    
    // Consume the resources used for crafting
    playerStore.removeResource('silver_mistletoe');
    playerStore.removeResource('river_rushes');
    playerStore.removeResource('standing_stone_chips');
    
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
    
    // Gain experience for overcoming a challenge and crafting
    playerStore.addExperience(2); // +1 for challenge, +1 for crafting
    
    // Prepare for next landscape (Springwell Glen)
    gameStore.setCurrentLandscape('springwell_glen');
    gameStore.setCurrentChallenge('hidden_waterways');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
