import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 8/15: Springwell Glen - Eighth Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Springwell Glen during the Imbolc season. Key elements tested:
 * 
 * - Wisdom challenge (Hidden Waterways) during Imbolc
 * - Using the Druid's Charm to enhance wisdom and perception
 * - Leveraging Salmon Journeyer companion for water-related challenges
 * - Gathering river-based resources in Imbolc
 * - Testing the character's growing experience level
 * 
 * Springwell Glen represents the midpoint of the Imbolc season,
 * with challenges focused on wisdom and water navigation.
 */
describe('Journey 8/15: Giant Beastfriend at Springwell Glen', () => {
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
    playerStore.addExperience(7);
    
    // Setup landscape and challenge
    gameStore.setCurrentLandscape('springwell_glen');
    gameStore.setCurrentChallenge('hidden_waterways');
    
    // Set journey progress to 7 (eighth landscape)
    gameStore.advanceJourney(7);
    
    // Set season to Imbolc
    gameStore.advanceSeason(); // Advance from starting season (Samhain) to Winter's Depth
    gameStore.advanceSeason(); // Advance from Winter's Depth to Imbolc
    
    // Set starting resources based on previous landscapes
    playerStore.addResource('horse_hair');
    playerStore.addResource('amber_shards');
    playerStore.addResource('river_rushes');
    
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
    
    // Set threat tokens
    gameStore.addThreatTokens(3);
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Springwell Glen during Imbolc and find the Hidden Waterways', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we're in Imbolc season
    expect(gameStore.currentSeason).toBe(Season.IMBOLC);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // In Imbolc, water sources are beginning to flow
    // Stealth and patience challenges are easier (-1 difficulty)
    
    // Check experience level
    expect(playerStore.experience).toBe(7);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // Verify threat tokens (should be 3)
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
    expect(gameStore.currentLandscapeId).toBe('springwell_glen');
    expect(gameStore.currentChallenge).toBe('hidden_waterways');
    
    // Use Druid's Charm to enhance perception
    playerStore.useCraftedItem('druids_charm');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 5; // Hidden Waterways base difficulty
    const seasonModifier = -1; // Imbolc makes perception challenges easier (-1)
    const itemBonus = -2; // Druid's Charm offers perception bonus
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier + itemBonus;
    
    // Giant Beastfriend has limited wisdom when alone
    const characterBonus = 0;
    
    // Use Salmon Journeyer companion for water navigation
    playerStore.feedCompanion('salmon_journeyer', 'river_rushes');
    
    // Salmon Journeyer gives +3 for water-related challenges
    const companionBonus = 3;
    
    // Experience bonus: +1 for every 5 experience points
    const experienceBonus = Math.floor(playerStore.experience / 5);
    expect(experienceBonus).toBe(1);
    
    // Mock a modest roll (3)
    const mockRoll = 3;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const totalRoll = mockRoll + characterBonus + companionBonus + experienceBonus;
    const success = gameStore.resolveChallenge(totalRoll, totalDifficulty);
    
    // Should be a success (roll 3 + companion 3 + experience 1 = 7 vs difficulty 3)
    expect(success).toBe('SUCCESS');
    
    // On success, gain resources
    playerStore.addResource('river_rushes'); // Resource available at Springwell Glen
    playerStore.addResource('sacred_water'); // Another water-based resource
    
    // Verify resources were added
    expect(playerStore.resources).toContain('river_rushes');
    expect(playerStore.resources).toContain('sacred_water');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Check resource capacity
    expect(playerStore.resourceCapacity).toBe(8);
    
    // In Imbolc, Silver Mistletoe and Horse Hair are abundant
    playerStore.addResource('silver_mistletoe');
    
    // Check and handle resource capacity
    if (playerStore.resources.length > playerStore.resourceCapacity) {
      // Discard a resource that's less useful going forward
      playerStore.removeResource('amber_shards');
    }
    
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // Giant Beastfriend can have two active companions at once
    // We already activated Salmon Journeyer, now use Owl Sage
    
    // Feed Owl Sage to maintain bond
    playerStore.feedCompanion('owl_sage', 'silver_mistletoe');
    
    // Use Owl Sage's ability to reveal hidden wisdom
    playerStore.useCompanionAbility('owl_sage');
    
    // Verify we have our companions
    expect(playerStore.animalCompanions.length).toBe(6);
    expect(playerStore.animalCompanions).toContain('salmon_journeyer');
    expect(playerStore.animalCompanions).toContain('owl_sage');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Let's craft a Water Mirror with Sacred Water, River Rushes, and Silver Mistletoe
    
    // Verify we have all required resources
    const hasSacredWater = playerStore.resources.includes('sacred_water');
    const hasRiverRushes = playerStore.resources.includes('river_rushes');
    const hasSilverMistletoe = playerStore.resources.includes('silver_mistletoe');
    
    expect(hasSacredWater).toBe(true);
    expect(hasRiverRushes).toBe(true);
    expect(hasSilverMistletoe).toBe(true);
    
    // Craft the Water Mirror
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('water_mirror');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('water_mirror');
    
    // Consume the resources used for crafting
    playerStore.removeResource('sacred_water');
    playerStore.removeResource('river_rushes');
    playerStore.removeResource('silver_mistletoe');
    
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
    
    // Prepare for next landscape (Shepherd's Pass)
    gameStore.setCurrentLandscape('shepherds_pass');
    gameStore.setCurrentChallenge('rocky_ravine');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
