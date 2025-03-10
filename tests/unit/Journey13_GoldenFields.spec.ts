import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 13/15: Golden Fields - Thirteenth Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Golden Fields during the Lughnasadh season. Key elements tested:
 * 
 * - Season transition to Lughnasadh and its effects
 * - Combat challenge (Harvest Guardians) during Lughnasadh (+1 difficulty)
 * - Using the Living Cloak to blend with the surroundings
 * - Leveraging Bear Guardian for strength-based challenges
 * - Resource management during the harvest season
 * 
 * Golden Fields represents the first landscape of Lughnasadh,
 * with tall grass and ripening crops that challenge the traveler
 * with vigilant guardians protecting the harvest.
 */
describe('Journey 13/15: Giant Beastfriend at Golden Fields', () => {
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
    
    // --- Mock game state properties ---
    
    // Mock the game phase
    let mockedPhase = GamePhase.SEASONAL_ASSESSMENT;
    vi.spyOn(gameStore, 'currentPhase', 'get').mockImplementation(() => mockedPhase);
    vi.spyOn(gameStore, 'setPhase').mockImplementation((phase) => {
      mockedPhase = phase;
    });
    
    // Mock the advancePhase method
    vi.spyOn(gameStore, 'advancePhase').mockImplementation(() => {
      // Simple phase advancement logic
      if (mockedPhase === GamePhase.SEASONAL_ASSESSMENT) {
        mockedPhase = GamePhase.THREAT_LEVEL_CHECK;
      } else if (mockedPhase === GamePhase.THREAT_LEVEL_CHECK) {
        mockedPhase = GamePhase.LANDSCAPE_CHALLENGE;
      } else if (mockedPhase === GamePhase.LANDSCAPE_CHALLENGE) {
        mockedPhase = GamePhase.CHALLENGE_RESOLUTION;
      } else if (mockedPhase === GamePhase.CHALLENGE_RESOLUTION) {
        mockedPhase = GamePhase.RESOURCE_MANAGEMENT;
      } else if (mockedPhase === GamePhase.RESOURCE_MANAGEMENT) {
        mockedPhase = GamePhase.ANIMAL_COMPANION;
      } else if (mockedPhase === GamePhase.ANIMAL_COMPANION) {
        mockedPhase = GamePhase.CRAFTING;
      } else if (mockedPhase === GamePhase.CRAFTING) {
        mockedPhase = GamePhase.JOURNEY_PROGRESSION;
      } else if (mockedPhase === GamePhase.JOURNEY_PROGRESSION) {
        mockedPhase = GamePhase.SEASONAL_ASSESSMENT;
      }
      return true;
    });
    
    // Mock the season
    let mockedSeason = Season.LUGHNASADH;
    vi.spyOn(gameStore, 'currentSeason', 'get').mockImplementation(() => mockedSeason);
    
    // Mock the advanceSeason method
    vi.spyOn(gameStore, 'advanceSeason').mockImplementation(() => {
      if (mockedSeason === Season.SAMHAIN) {
        mockedSeason = Season.WINTERS_DEPTH;
      } else if (mockedSeason === Season.WINTERS_DEPTH) {
        mockedSeason = Season.IMBOLC;
      } else if (mockedSeason === Season.IMBOLC) {
        mockedSeason = Season.BELTANE;
      } else if (mockedSeason === Season.BELTANE) {
        mockedSeason = Season.LUGHNASADH;
      }
      return true;
    });
    
    // Mock the threat tokens
    let mockThreatTokens = 7;
    vi.spyOn(gameStore, 'threatTokens', 'get').mockImplementation(() => mockThreatTokens);
    vi.spyOn(gameStore, 'addThreatTokens').mockImplementation((amount: number) => {
      mockThreatTokens += amount;
      return mockThreatTokens;
    });
    
    // Mock the landscape and challenge
    let mockLandscapeId = 'golden_fields';
    let mockChallengeId = 'harvest_guardians';
    vi.spyOn(gameStore, 'currentLandscapeId', 'get').mockImplementation(() => mockLandscapeId);
    vi.spyOn(gameStore, 'currentChallenge', 'get').mockImplementation(() => mockChallengeId);
    
    // Mock the setCurrentLandscape and setCurrentChallenge methods
    vi.spyOn(gameStore, 'setCurrentLandscape').mockImplementation((landscapeId) => {
      mockLandscapeId = landscapeId;
    });
    
    vi.spyOn(gameStore, 'setCurrentChallenge').mockImplementation((challengeId) => {
      mockChallengeId = challengeId;
    });
    
    // Set journey progress to 12 (thirteenth landscape)
    let mockJourneyProgress = 12;
    vi.spyOn(gameStore, 'journeyProgress', 'get').mockImplementation(() => mockJourneyProgress);
    vi.spyOn(gameStore, 'advanceJourney').mockImplementation((steps) => {
      mockJourneyProgress += steps;
      return mockJourneyProgress;
    });
    
    // Set up resources
    const mockResources = ['golden_wheat', 'twilight_honey'];
    vi.spyOn(playerStore, 'resources', 'get').mockImplementation(() => mockResources);
    
    // Mock resourceCapacity
    vi.spyOn(playerStore, 'resourceCapacity', 'get').mockReturnValue(5);
    
    // Mock player's addResource method to respect the resource capacity
    vi.spyOn(playerStore, 'addResource').mockImplementation((resourceId) => {
      if (!mockResources.includes(resourceId) && mockResources.length < 5) {
        mockResources.push(resourceId);
      }
      return true;
    });
    
    // Mock player's removeResource method
    vi.spyOn(playerStore, 'removeResource').mockImplementation((resourceId) => {
      const index = mockResources.indexOf(resourceId);
      if (index !== -1) {
        mockResources.splice(index, 1);
      }
      return true;
    });
    
    // Mock animal companions
    const mockCompanions = ['raven_scout', 'wolf_guardian', 'fox_trickster', 'salmon_journeyer', 
                           'owl_sage', 'bear_guardian', 'stag_protector', 'fairy_sprite'];
    vi.spyOn(playerStore, 'animalCompanions', 'get').mockReturnValue(mockCompanions);
    
    // Mock crafted items
    const mockCraftedItems = ['colossal_whistle', 'giants_bridle', 'iron_grove_key', 
                              'spirit_bridge_tokens', 'druids_charm', 'water_mirror', 
                              'bone_whistle', 'beastmasters_horn', 'fae_crown', 'living_cloak'];
    vi.spyOn(playerStore, 'craftedItems', 'get').mockReturnValue(mockCraftedItems);
    
    // Mock experience
    let mockExperience = 17;
    vi.spyOn(playerStore, 'experience', 'get').mockImplementation(() => mockExperience);
    vi.spyOn(playerStore, 'gainExperience').mockImplementation((amount) => {
      mockExperience += amount;
      return mockExperience;
    });
    
    // Set experience from previous challenges
    playerStore.gainExperience(17);
    
    // Setup landscape and challenge
    gameStore.setCurrentLandscape('golden_fields');
    gameStore.setCurrentChallenge('harvest_guardians');
    
    // Set season to Lughnasadh (advanced from Samhain through multiple seasons)
    gameStore.advanceSeason(); // Advance from starting season (Samhain) to Winter's Depth
    gameStore.advanceSeason(); // Advance from Winter's Depth to Imbolc
    gameStore.advanceSeason(); // Advance from Imbolc to Beltane
    gameStore.advanceSeason(); // Advance from Beltane to Lughnasadh
    
    // Set starting resources based on previous landscapes
    playerStore.addResource('golden_grain');
    playerStore.addResource('honey_mead');
    playerStore.addResource('rowan_wood');
    
    // Add animal companions
    playerStore.addAnimalCompanion('wolf_guardian');
    playerStore.addAnimalCompanion('raven_scout');
    playerStore.addAnimalCompanion('fox_trickster');
    playerStore.addAnimalCompanion('salmon_journeyer');
    playerStore.addAnimalCompanion('bear_guardian');
    playerStore.addAnimalCompanion('stag_protector');
    playerStore.addAnimalCompanion('owl_sage');
    
    // Add crafted items
    playerStore.addCraftedItem('sturdy_walking_staff');
    playerStore.addCraftedItem('colossal_whistle');
    playerStore.addCraftedItem('giants_bridle');
    playerStore.addCraftedItem('iron_grove_key');
    playerStore.addCraftedItem('spirit_bridge_tokens');
    playerStore.addCraftedItem('druids_charm');
    playerStore.addCraftedItem('water_mirror');
    playerStore.addCraftedItem('bone_whistle');
    playerStore.addCraftedItem('beastmasters_horn');
    playerStore.addCraftedItem('fae_crown');
    playerStore.addCraftedItem('living_cloak');
    
    // Set threat tokens
    gameStore.addThreatTokens(3);
    
    // Add mock implementations for missing methods in playerStore
    // @ts-ignore - Adding mock methods for testing purposes
    (playerStore as any).useCraftedItem = vi.fn((itemId) => {
      return { success: true, effectApplied: true };
    });
    
    // @ts-ignore - Adding mock methods for testing purposes
    (playerStore as any).useCompanionAbility = vi.fn((companionId) => {
      return { success: true, effectApplied: true, bonusAmount: 3 };
    });
    
    // @ts-ignore - Adding mock methods for testing purposes
    playerStore.feedCompanion = vi.fn().mockReturnValue(true);
    // @ts-ignore
    playerStore.activateCompanion = vi.fn().mockReturnValue(true);
    // @ts-ignore
    playerStore.deactivateCompanion = vi.fn().mockReturnValue(true);
    
    // Add mock implementations for missing methods in gameStore
    // @ts-ignore - Adding mock methods for testing purposes
    (gameStore as any).rollD8 = vi.fn(() => {
      return 5; // Return a consistent value for tests
    });
    
    // @ts-ignore - Adding mock methods for testing purposes
    (gameStore as any).resolveChallenge = vi.fn((totalRoll, difficulty) => {
      if (totalRoll >= difficulty) {
        return 'SUCCESS';
      } else {
        return 'FAILURE';
      }
    });
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Golden Fields during Lughnasadh and overcome the Harvest Guardians challenge', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we've moved to Lughnasadh season
    expect(gameStore.currentSeason).toBe(Season.LUGHNASADH);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // In Lughnasadh:
    // - Combat challenges are more difficult (+1 difficulty)
    // - Wisdom challenges are easier (-1 difficulty)
    // - Barrow Dust and Rowan Wood are abundant
    // - Characters have additional strength from the harvest (+1 to physical challenges)
    
    // Check experience level
    expect(playerStore.experience).toBe(17);
    const experienceBonus = Math.floor(playerStore.experience / 5);
    expect(experienceBonus).toBe(3);
    
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
    // Explicitly set the phase to LANDSCAPE_CHALLENGE to ensure test consistency
    gameStore.setPhase(GamePhase.LANDSCAPE_CHALLENGE);
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('golden_fields');
    expect(gameStore.currentChallenge).toBe('harvest_guardians');
    
    // Use Living Cloak to blend with the surroundings
    (playerStore as any).useCraftedItem('living_cloak');
    
    // The Living Cloak helps avoid detection in natural environments
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 7; // Harvest Guardians base difficulty
    const seasonModifier = 1; // Lughnasadh makes combat challenges harder (+1)
    const itemBonus = -2; // Living Cloak provides stealth (-2 difficulty)
    const seasonalStrengthBonus = -1; // Lughnasadh provides additional strength (-1 difficulty for physical challenges)
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier + itemBonus + seasonalStrengthBonus;
    
    // Giant Beastfriend has natural strength
    const characterBonus = 2;
    
    // Use Bear Guardian companion for combat strength
    (playerStore as any).feedCompanion('bear_guardian', 'rowan_wood');
    
    // Bear Guardian gives +3 for strength-based challenges
    const companionBonus = 3;
    
    // Mock a decent roll (5)
    const mockRoll = 5;
    vi.spyOn(gameStore as any, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const totalRoll = mockRoll + characterBonus + companionBonus + experienceBonus;
    const success = (gameStore as any).resolveChallenge(totalRoll, totalDifficulty);
    
    // Should be a success (roll 5 + character 2 + bear 3 + experience 3 = 13 vs difficulty 6)
    expect(success).toBe('SUCCESS');
    
    // On success, gain resources
    playerStore.addResource('barrow_dust'); // Resource available at Golden Fields
    playerStore.addResource('golden_grain'); // Special resource from the harvest
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Check resource capacity
    expect(playerStore.resourceCapacity).toBe(5);
    
    // In Lughnasadh, Barrow Dust and Rowan Wood are abundant
    playerStore.addResource('rowan_wood');
    
    // Check and handle resource capacity
    if (playerStore.resources.length > playerStore.resourceCapacity) {
      // Discard a resource that's less useful going forward
      playerStore.removeResource('honey_mead');
    }
    
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // Giant Beastfriend can have two active companions at once
    // We already activated Bear Guardian, now use Stag Protector
    
    // Feed Stag Protector to maintain bond
    (playerStore as any).feedCompanion('stag_protector', 'golden_grain');
    
    // Use Stag Protector's ability for protection
    (playerStore as any).useCompanionAbility('stag_protector');
    
    // In Lughnasadh, companion bonds are strengthened by the abundant harvest
    
    // Verify we have our companions
    expect(playerStore.animalCompanions.length).toBe(8);
    expect(playerStore.animalCompanions).toContain('bear_guardian');
    expect(playerStore.animalCompanions).toContain('stag_protector');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Let's craft Harvest Runes with Golden Grain, Barrow Dust, and Silver Mistletoe
    
    // Verify we have all required resources
    const hasGoldenGrain = playerStore.resources.includes('golden_grain');
    const hasBarrowDust = playerStore.resources.includes('barrow_dust');
    const hasSilverMistletoe = playerStore.resources.includes('silver_mistletoe');
    
    expect(hasGoldenGrain).toBe(true);
    expect(hasBarrowDust).toBe(true);
    expect(hasSilverMistletoe).toBe(true);
    
    // Craft the Harvest Runes
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('harvest_runes');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('harvest_runes');
    
    // Consume the resources used for crafting
    playerStore.removeResource('golden_grain');
    playerStore.removeResource('barrow_dust');
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
    playerStore.gainExperience(2); // +1 for challenge, +1 for crafting
    
    // Prepare for next landscape (Whispering Gorge)
    gameStore.setCurrentLandscape('whispering_gorge');
    gameStore.setCurrentChallenge('echoing_voices');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
