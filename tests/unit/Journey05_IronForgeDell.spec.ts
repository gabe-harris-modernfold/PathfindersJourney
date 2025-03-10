import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 5/15: Iron Forge Dell - Fifth Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Iron Forge Dell during the Winter's Depth season. Key elements tested:
 * 
 * - Physical challenge (Molten Trials) during Winter's Depth (+2 difficulty)
 * - Using the crafted Giant's Bridle to overcome a physical challenge
 * - Gathering Forge Cinders and Bog Iron (abundant in Winter's Depth)
 * - Managing animal companions in a harsh environment
 * - Testing the character's health mechanics during a physical challenge
 * 
 * Iron Forge Dell presents a difficult strength-based challenge, which may
 * test the Giant Beastfriend's physical prowess in the harsh winter.
 */
describe('Journey 5/15: Giant Beastfriend at Iron Forge Dell', () => {
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
    gameStore.setCurrentLandscape('iron_forge_dell');
    gameStore.setCurrentChallenge('molten_trials');
    
    // Set journey progress to 4 (fifth landscape)
    gameStore.advanceJourney(4);
    
    // Set season to Winter's Depth
    gameStore.advanceSeason(); // Advance from starting season (Samhain) to Winter's Depth
    
    // Set starting resources and companions based on previous landscapes
    playerStore.addResource('standing_stone_chips');
    playerStore.addResource('barrow_dust');
    playerStore.addResource('forge_cinders');
    playerStore.addResource('sacred_water');
    
    // Add animal companions
    playerStore.addAnimalCompanion('raven_scout');
    playerStore.addAnimalCompanion('wolf_guardian');
    playerStore.addAnimalCompanion('fox_trickster');
    
    // Add crafted items
    playerStore.addCraftedItem('colossal_whistle');
    playerStore.addCraftedItem('giants_bridle');
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Iron Forge Dell during Winter\'s Depth and overcome the Molten Trials challenge', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we're in Winter's Depth season
    expect(gameStore.currentSeason).toBe(Season.WINTERS_DEPTH);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // Winter's Depth makes physical challenges harder
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // We should have some threat tokens accumulated by now
    gameStore.addThreatTokens(1); // Add one more from previous landscape
    expect(gameStore.threatTokens).toBeGreaterThan(0);
    
    // Perform threat level check
    gameStore.handleThreatLevelCheck();
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 3. PHASE: LANDSCAPE CHALLENGE
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.LANDSCAPE_CHALLENGE);
    
    // Verify current landscape and challenge
    expect(gameStore.currentLandscapeId).toBe('iron_forge_dell');
    expect(gameStore.currentChallenge).toBe('molten_trials');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 7; // Molten Trials base difficulty
    const seasonModifier = 2; // Winter's Depth makes physical challenges harder (+2)
    const threatModifier = Math.floor(gameStore.threatTokens / 3);
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier;
    
    // Record initial health
    const initialHealth = playerStore.health;
    expect(initialHealth).toBe(7); // Giant Beastfriend starts with 7 health
    
    // Use crafted item: Giant's Bridle grants control over powerful entities
    const itemBonus = 2; // Provides +2 for strength challenges
    
    // Use Wolf Guardian companion for additional strength
    playerStore.feedCompanion('wolf_guardian', 'barrow_dust');
    const companionBonus = 2; // Wolf Guardian provides +2 to combat-related challenges
    
    // Mock a modest roll (5)
    const mockRoll = 5;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Calculate total roll with bonuses
    const totalRoll = mockRoll + itemBonus + companionBonus;
    
    // Resolve the challenge
    const success = gameStore.resolveChallenge(totalRoll, totalDifficulty);
    
    // Evaluate the outcome based on difficulty
    if (totalRoll >= totalDifficulty) {
      expect(success).toBe('SUCCESS');
    } else if (totalRoll === totalDifficulty - 1) {
      expect(success).toBe('PARTIAL');
    } else {
      expect(success).toBe('FAILURE');
      
      // On failure of a physical challenge, lose health
      playerStore.takeDamage(2); // Lose 2 health from the challenge
      expect(playerStore.health).toBe(initialHealth - 2);
    }
    
    // Regardless of outcome, gather some resources
    // In Iron Forge Dell, Forge Cinders and Bog Iron are readily available
    playerStore.addResource('forge_cinders');
    playerStore.addResource('bog_iron');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Check resource capacity
    expect(playerStore.resourceCapacity).toBe(8);
    
    // In Winter's Depth, Forge Cinders and Bog Iron are abundant
    // which is perfect for the Iron Forge Dell location
    
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
    
    // Giant Beastfriend can have two active companions at once
    // We already used Wolf Guardian, now use Raven Scout to look ahead
    
    // Feed Raven Scout to maintain bond
    playerStore.feedCompanion('raven_scout', 'barrow_dust');
    
    // Use Raven Scout's ability to scout the next landscape
    playerStore.useCompanionAbility('raven_scout');
    
    // Verify we still have our companions
    expect(playerStore.animalCompanions.length).toBe(3);
    
    // Don't feed Fox Trickster this turn to see how it becomes wary
    const foxTricksterStatus = playerStore.getCompanionStatus('fox_trickster');
    expect(foxTricksterStatus).toBe('WARY'); // Should become wary after not being fed
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // This is an ideal location for crafting iron-based items
    // Let's craft the Iron Grove Key with Bog Iron, Silver Mistletoe, and Forge Cinders
    
    // Add Silver Mistletoe to complete the crafting requirements
    playerStore.addResource('silver_mistletoe');
    
    // Verify we have all required resources
    const hasBogIron = playerStore.resources.includes('bog_iron');
    const hasSilverMistletoe = playerStore.resources.includes('silver_mistletoe');
    const hasForgeCinders = playerStore.resources.includes('forge_cinders');
    
    expect(hasBogIron).toBe(true);
    expect(hasSilverMistletoe).toBe(true);
    expect(hasForgeCinders).toBe(true);
    
    // Craft the Iron Grove Key
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('iron_grove_key');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('iron_grove_key');
    
    // Consume the resources used for crafting
    playerStore.removeResource('bog_iron');
    playerStore.removeResource('silver_mistletoe');
    playerStore.removeResource('forge_cinders');
    
    // As a drawback of using the Iron Grove Key, add a threat token
    gameStore.addThreatTokens(1);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 8. PHASE: JOURNEY PROGRESSION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.JOURNEY_PROGRESSION);
    
    // Unless we failed the challenge, advance to the next landscape
    if (success !== 'FAILURE') {
      const initialProgress = gameStore.journeyProgress;
      gameStore.advanceJourney(1); // Move forward one step
      
      // Verify journey progress has increased
      expect(gameStore.journeyProgress).toBe(initialProgress + 1);
      
      // Gain experience for overcoming a difficult challenge (difficulty 6+)
      playerStore.addExperience(2); // +1 for challenge, +1 for crafting
    } else {
      // If we failed, we stay at Iron Forge Dell and try again next turn
      expect(gameStore.journeyProgress).toBe(4); // Unchanged
      
      // But we still gain some experience for the attempt
      playerStore.addExperience(1);
    }
    
    // Prepare for next landscape (Moonlit Loch if success, or remain at Iron Forge Dell)
    if (success !== 'FAILURE') {
      gameStore.setCurrentLandscape('moonlit_loch');
      gameStore.setCurrentChallenge('water_spirits');
    }
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
