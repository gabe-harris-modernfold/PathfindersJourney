import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 9/15: Shepherd's Pass - Ninth Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Shepherd's Pass during the Imbolc season. Key elements tested:
 * 
 * - Physical challenge (Rocky Ravine) requiring strength and endurance
 * - Using the Water Mirror for navigation
 * - Leveraging Bear Guardian companion for strength challenges
 * - Resource management approaching the seasonal transition
 * - Preparing for the final landscape of Imbolc
 * 
 * Shepherd's Pass represents the last landscape in the Imbolc season,
 * featuring a difficult physical challenge that plays to the Giant Beastfriend's strengths.
 */
describe('Journey 9/15: Giant Beastfriend at Shepherd\'s Pass', () => {
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
    
    // Set experience from previous challenges
    playerStore.addExperience(9);
    
    // Setup landscape and challenge
    gameStore.setCurrentLandscape('shepherds_pass');
    gameStore.setCurrentChallenge('rocky_ravine');
    
    // Set journey progress to 8 (ninth landscape)
    gameStore.advanceJourney(8);
    
    // Set season to Imbolc
    gameStore.advanceSeason(); // Advance from starting season (Samhain) to Winter's Depth
    gameStore.advanceSeason(); // Advance from Winter's Depth to Imbolc
    
    // Set starting resources based on previous landscapes
    playerStore.addResource('horse_hair');
    playerStore.addResource('woven_reeds');
    playerStore.addResource('standing_stone_chips');
    
    // Add animal companions
    playerStore.addAnimalCompanion('raven_scout');
    playerStore.addAnimalCompanion('wolf_guardian');
    playerStore.addAnimalCompanion('fox_trickster');
    playerStore.addAnimalCompanion('salmon_journeyer');
    playerStore.addAnimalCompanion('owl_sage');
    playerStore.addAnimalCompanion('bear_guardian');
    
    // Add crafted items
    playerStore.addCraftedItem('colossal_whistle');
    playerStore.addCraftedItem('giants_bridle');
    playerStore.addCraftedItem('iron_grove_key');
    playerStore.addCraftedItem('spirit_bridge_tokens');
    playerStore.addCraftedItem('druids_charm');
    playerStore.addCraftedItem('water_mirror');
    
    // Set threat tokens
    gameStore.addThreatTokens(4);
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Shepherd\'s Pass during Imbolc and overcome the Rocky Ravine challenge', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we're in Imbolc season
    expect(gameStore.currentSeason).toBe(Season.IMBOLC);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // Check experience level
    expect(playerStore.experience).toBe(9);
    const experienceBonus = Math.floor(playerStore.experience / 5);
    expect(experienceBonus).toBe(1);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // Verify threat tokens (should be 4)
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
    expect(gameStore.currentLandscapeId).toBe('shepherds_pass');
    expect(gameStore.currentChallenge).toBe('rocky_ravine');
    
    // Use Water Mirror to find the safest path through the ravine
    playerStore.useCraftedItem('water_mirror');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 8; // Rocky Ravine base difficulty
    const seasonModifier = 0; // No seasonal modifier for strength challenges in Imbolc
    const itemBonus = -2; // Water Mirror reveals paths (-2 difficulty)
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier + itemBonus;
    
    // Giant Beastfriend has natural strength
    const characterBonus = 2;
    
    // Use Bear Guardian companion for additional strength
    playerStore.feedCompanion('bear_guardian', 'woven_reeds');
    
    // Bear Guardian gives +3 for strength-based challenges
    const companionBonus = 3;
    
    // Mock a good roll (6)
    const mockRoll = 6;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const totalRoll = mockRoll + characterBonus + companionBonus + experienceBonus;
    const success = gameStore.resolveChallenge(totalRoll, totalDifficulty);
    
    // Should be a success (roll 6 + character 2 + companion 3 + experience 1 = 12 vs difficulty 7)
    expect(success).toBe('SUCCESS');
    
    // On success, gain resources
    playerStore.addResource('standing_stone_chips'); // Resource available at Shepherd's Pass
    playerStore.addResource('silver_mistletoe'); // Abundant in Imbolc
    
    // Verify resources were added
    expect(playerStore.resources).toContain('standing_stone_chips');
    expect(playerStore.resources).toContain('silver_mistletoe');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Check resource capacity
    expect(playerStore.resourceCapacity).toBe(8);
    
    // In Imbolc, Silver Mistletoe and Horse Hair are abundant
    playerStore.addResource('horse_hair');
    
    // Check and handle resource capacity
    if (playerStore.resources.length > playerStore.resourceCapacity) {
      // Discard a non-essential resource
      playerStore.removeResource(playerStore.resources[0]);
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
    playerStore.feedCompanion('wolf_guardian', 'horse_hair');
    
    // Use Wolf Guardian's ability to find a safe path
    playerStore.useCompanionAbility('wolf_guardian');
    
    // Add a new companion - Stag Protector
    playerStore.addAnimalCompanion('stag_protector');
    
    // Feed the Stag Protector to bond with it
    playerStore.feedCompanion('stag_protector', 'silver_mistletoe');
    
    // Verify we have our companions
    expect(playerStore.animalCompanions.length).toBe(7);
    expect(playerStore.animalCompanions).toContain('bear_guardian');
    expect(playerStore.animalCompanions).toContain('wolf_guardian');
    expect(playerStore.animalCompanions).toContain('stag_protector');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Let's craft a Bone Whistle with Horse Hair, Standing Stone Chips, and Woven Reeds
    
    // Verify we have all required resources
    const hasHorseHair = playerStore.resources.includes('horse_hair');
    const hasStandingStoneChips = playerStore.resources.includes('standing_stone_chips');
    const hasWovenReeds = playerStore.resources.includes('woven_reeds');
    
    expect(hasHorseHair).toBe(true);
    expect(hasStandingStoneChips).toBe(true);
    expect(hasWovenReeds).toBe(true);
    
    // Craft the Bone Whistle
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('bone_whistle');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('bone_whistle');
    
    // Consume the resources used for crafting
    playerStore.removeResource('horse_hair');
    playerStore.removeResource('standing_stone_chips');
    playerStore.removeResource('woven_reeds');
    
    // Add threat token from using crafted item
    gameStore.addThreatTokens(1);
    
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
    
    // Check if we've reached a seasonal boundary (landscapes 7-9 are Imbolc)
    if (gameStore.journeyProgress >= 9) {
      // Advance to Beltane season
      gameStore.advanceSeason();
      expect(gameStore.currentSeason).toBe(Season.BELTANE);
    }
    
    // Prepare for next landscape (Fertile Plains)
    gameStore.setCurrentLandscape('fertile_plains');
    gameStore.setCurrentChallenge('aggressive_herds');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
