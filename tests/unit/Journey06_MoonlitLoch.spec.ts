import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 6/15: Moonlit Loch - Sixth Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Moonlit Loch during the Winter's Depth season. Key elements tested:
 * 
 * - Spiritual challenge (Water Spirits) requiring patience
 * - Acquiring aquatic animal companions (Salmon, Owl)
 * - Using the Iron Grove Key to reveal hidden paths
 * - Resource management under winter conditions
 * - Handling increasing threat levels as the journey progresses
 * 
 * The Moonlit Loch is the final landscape in the Winter's Depth season,
 * offering a chance to gain unique aquatic-oriented companions.
 */
describe('Journey 6/15: Giant Beastfriend at Moonlit Loch', () => {
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
    gameStore.setCurrentLandscape('moonlit_loch');
    gameStore.setCurrentChallenge('water_spirits');
    
    // Set journey progress to 5 (sixth landscape)
    gameStore.advanceJourney(5);
    
    // Set season to Winter's Depth
    gameStore.advanceSeason(); // Advance from starting season (Samhain) to Winter's Depth
    
    // Set starting resources based on previous landscapes
    playerStore.addResource('standing_stone_chips');
    playerStore.addResource('barrow_dust'); 
    playerStore.addResource('sacred_water');
    
    // Add animal companions
    playerStore.addAnimalCompanion('raven_scout');
    playerStore.addAnimalCompanion('wolf_guardian');
    playerStore.addAnimalCompanion('fox_trickster'); // Currently wary from last test
    
    // Add crafted items
    playerStore.addCraftedItem('colossal_whistle');
    playerStore.addCraftedItem('giants_bridle');
    playerStore.addCraftedItem('iron_grove_key');
    
    // Set threat tokens from previous landscapes and crafting
    gameStore.addThreatTokens(4);
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Moonlit Loch during Winter\'s Depth and engage with the Water Spirits', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we're in Winter's Depth season
    expect(gameStore.currentSeason).toBe(Season.WINTERS_DEPTH);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // In Winter's Depth, Sacred Water is scarce
    // This is problematic at the Moonlit Loch where it's typically abundant
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // We should have 4 threat tokens accumulated by now
    expect(gameStore.threatTokens).toBe(4);
    
    // Perform threat level check
    gameStore.handleThreatLevelCheck();
    
    // With 4 threat tokens, challenge difficulty increases by +1
    const threatModifier = Math.floor(gameStore.threatTokens / 3);
    expect(threatModifier).toBe(1);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 3. PHASE: LANDSCAPE CHALLENGE
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('moonlit_loch');
    expect(gameStore.currentChallenge).toBe('water_spirits');
    
    // Use Iron Grove Key to reveal a hidden path around the challenge
    playerStore.useCraftedItem('iron_grove_key');
    
    // The Iron Grove Key opens hidden paths, reducing challenge difficulty
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 6; // Water Spirits base difficulty
    const seasonModifier = 0; // No specific seasonal modifier for patience challenges in Winter's Depth
    const difficultyReduction = -2; // Using Iron Grove Key
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier + difficultyReduction;
    
    // Giant Beastfriend has no special bonuses for patience challenges
    const characterBonus = 0;
    
    // Try to recover the Fox Trickster companion by feeding it
    playerStore.feedCompanion('fox_trickster', 'barrow_dust');
    
    // Fox Trickster is now willing to help again
    const foxStatus = playerStore.getCompanionStatus('fox_trickster');
    expect(foxStatus).not.toBe('WARY');
    
    // Use Fox Trickster to manipulate the die roll
    const companionBonus = 2;
    
    // Mock a decent roll (5)
    const mockRoll = 5;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const totalRoll = mockRoll + characterBonus + companionBonus;
    const success = gameStore.resolveChallenge(totalRoll, totalDifficulty);
    
    // Should be a success (roll 5 + bonus 2 = 7 vs difficulty 5)
    expect(success).toBe('SUCCESS');
    
    // On success, gain 2 resources from the landscape
    playerStore.addResource('sacred_water'); // Resource available at Moonlit Loch
    playerStore.addResource('amber_shards'); // Another resource from success
    
    // Verify resources were added
    expect(playerStore.resources).toContain('sacred_water');
    expect(playerStore.resources).toContain('amber_shards');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Check resource capacity
    expect(playerStore.resourceCapacity).toBe(8);
    
    // Manage resources based on seasonal availability
    // In Winter's Depth, Forge Cinders and Bog Iron are abundant
    playerStore.addResource('forge_cinders');
    
    // Check and handle resource capacity
    if (playerStore.resources.length > playerStore.resourceCapacity) {
      playerStore.removeResource(playerStore.resources[0]);
    }
    
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // The Moonlit Loch is where we can encounter Salmon and Owl companions
    // Giant Beastfriend can have two animal companions active at once
    
    // Gain the Salmon Journeyer companion
    playerStore.addAnimalCompanion('salmon_journeyer');
    
    // Feed the Salmon to bond with it - use Sacred Water as it's affinity resource
    playerStore.feedCompanion('salmon_journeyer', 'sacred_water');
    
    // Also gain the Owl Sage companion
    playerStore.addAnimalCompanion('owl_sage');
    
    // Feed the Owl to bond with it
    playerStore.feedCompanion('owl_sage', 'barrow_dust');
    
    // Verify we now have more companions
    expect(playerStore.animalCompanions.length).toBe(5);
    expect(playerStore.animalCompanions).toContain('salmon_journeyer');
    expect(playerStore.animalCompanions).toContain('owl_sage');
    
    // Giant Beastfriend can only use two at a time, though they can keep more
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Let's craft Spirit Bridge Tokens with Barrow Dust, Sacred Water, and Amber Shards
    
    // Verify we have all required resources
    const hasBarrowDust = playerStore.resources.includes('barrow_dust');
    const hasSacredWater = playerStore.resources.includes('sacred_water');
    const hasAmberShards = playerStore.resources.includes('amber_shards');
    
    expect(hasBarrowDust).toBe(true);
    expect(hasSacredWater).toBe(true);
    expect(hasAmberShards).toBe(true);
    
    // Craft the Spirit Bridge Tokens
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('spirit_bridge_tokens');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('spirit_bridge_tokens');
    
    // Consume the resources used for crafting
    playerStore.removeResource('barrow_dust');
    playerStore.removeResource('sacred_water');
    playerStore.removeResource('amber_shards');
    
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
    
    // Check if we've reached a seasonal boundary (landscapes 4-6 are Winter's Depth)
    if (gameStore.journeyProgress >= 6) {
      // Advance to Imbolc season
      gameStore.advanceSeason();
      expect(gameStore.currentSeason).toBe(Season.IMBOLC);
    }
    
    // Prepare for next landscape (Menhir Path)
    gameStore.setCurrentLandscape('menhir_path');
    gameStore.setCurrentChallenge('stone_sentinels');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
