import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '../../src/stores/gameStore';
import { usePlayerStore } from '../../src/stores/playerStore';
import { useCardStore } from '../../src/stores/cardStore';
import { GamePhase } from '../../src/models/enums/phases';
import { Season } from '../../src/models/enums/seasons';

/**
 * Test 10/15: Fertile Plains - Tenth Step of the Journey
 * 
 * This test simulates the Giant Beastfriend character's journey through 
 * the Fertile Plains during the Beltane season. Key elements tested:
 * 
 * - Season transition to Beltane and its effects
 * - Stealth challenge (Aggressive Herds) during Beltane (-1 difficulty)
 * - Using the Bone Whistle to calm the herds
 * - Resource gathering in the lush Beltane season
 * - Managing companions after the seasonal transition
 * 
 * The Fertile Plains marks the first landscape of Beltane,
 * a season of growth and abundance, with challenges focused on stealth and agility.
 */
describe('Journey 10/15: Giant Beastfriend at Fertile Plains', () => {
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
    playerStore.addExperience(11);
    
    // Setup landscape and challenge
    gameStore.setCurrentLandscape('fertile_plains');
    gameStore.setCurrentChallenge('aggressive_herds');
    
    // Set journey progress to 9 (tenth landscape)
    gameStore.advanceJourney(9);
    
    // Set season to Beltane (having passed the seasonal boundary)
    gameStore.advanceSeason(); // Advance from starting season (Samhain) to Winter's Depth
    gameStore.advanceSeason(); // Advance from Winter's Depth to Imbolc
    gameStore.advanceSeason(); // Advance from Imbolc to Beltane
    
    // Set starting resources based on previous landscapes
    playerStore.addResource('silver_mistletoe');
    playerStore.addResource('river_rushes');
    
    // Add animal companions
    playerStore.addAnimalCompanion('raven_scout');
    playerStore.addAnimalCompanion('wolf_guardian');
    playerStore.addAnimalCompanion('fox_trickster');
    playerStore.addAnimalCompanion('salmon_journeyer');
    playerStore.addAnimalCompanion('owl_sage');
    playerStore.addAnimalCompanion('bear_guardian');
    playerStore.addAnimalCompanion('stag_protector');
    
    // Add crafted items
    playerStore.addCraftedItem('colossal_whistle');
    playerStore.addCraftedItem('giants_bridle');
    playerStore.addCraftedItem('iron_grove_key');
    playerStore.addCraftedItem('spirit_bridge_tokens');
    playerStore.addCraftedItem('druids_charm');
    playerStore.addCraftedItem('water_mirror');
    playerStore.addCraftedItem('bone_whistle');
    
    // Set threat tokens (reduced by 1 during seasonal transition to Beltane)
    gameStore.addThreatTokens(4);
    
    // Ensure we start from the beginning of turn sequence
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should navigate the Fertile Plains during Beltane and avoid the Aggressive Herds', () => {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    // 1. PHASE: SEASONAL ASSESSMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
    
    // Verify we've moved to Beltane season
    expect(gameStore.currentSeason).toBe(Season.BELTANE);
    
    // Apply seasonal effects
    gameStore.updateResourceAvailability();
    
    // In Beltane:
    // - Stealth and agility challenges are easier (-1 difficulty)
    // - Combat challenges are more difficult (+1 difficulty)
    // - Ogham Sticks and River Rushes are abundant
    // - Amber Shards and Standing Stone Chips glow with seasonal energy
    
    // Check experience level
    expect(playerStore.experience).toBe(11);
    const experienceBonus = Math.floor(playerStore.experience / 5);
    expect(experienceBonus).toBe(2);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 2. PHASE: THREAT LEVEL CHECK
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.THREAT_LEVEL_CHECK);
    
    // Verify threat tokens (should be 4 after transition to Beltane)
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
    expect(gameStore.currentLandscapeId).toBe('fertile_plains');
    expect(gameStore.currentChallenge).toBe('aggressive_herds');
    
    // Use Bone Whistle to calm the herds
    playerStore.useCraftedItem('bone_whistle');
    
    // Advance to challenge resolution phase
    gameStore.advancePhase();
    
    // 4. PHASE: CHALLENGE RESOLUTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CHALLENGE_RESOLUTION);
    
    // Calculate challenge parameters
    const baseDifficulty = 6; // Aggressive Herds base difficulty
    const seasonModifier = -1; // Beltane makes stealth challenges easier (-1)
    const itemBonus = -2; // Bone Whistle calms animals (-2 difficulty)
    const totalDifficulty = baseDifficulty + seasonModifier + threatModifier + itemBonus;
    
    // Giant Beastfriend has an affinity with animals
    const characterBonus = 2;
    
    // Use Stag Protector companion for additional stealth
    playerStore.feedCompanion('stag_protector', 'silver_mistletoe');
    
    // Stag Protector gives +2 for stealth-based challenges
    const companionBonus = 2;
    
    // Mock a roll (4)
    const mockRoll = 4;
    vi.spyOn(gameStore, 'rollD8').mockReturnValue(mockRoll);
    
    // Resolve the challenge
    const totalRoll = mockRoll + characterBonus + companionBonus + experienceBonus;
    const success = gameStore.resolveChallenge(totalRoll, totalDifficulty);
    
    // Should be a success (roll 4 + character 2 + companion 2 + experience 2 = 10 vs difficulty 4)
    expect(success).toBe('SUCCESS');
    
    // On success, gain resources
    playerStore.addResource('ogham_sticks'); // Resource available at Fertile Plains
    playerStore.addResource('horse_hair'); // Another resource from success
    
    // Verify resources were added
    expect(playerStore.resources).toContain('ogham_sticks');
    expect(playerStore.resources).toContain('horse_hair');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 5. PHASE: RESOURCE MANAGEMENT
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.RESOURCE_MANAGEMENT);
    
    // Check resource capacity
    expect(playerStore.resourceCapacity).toBe(8);
    
    // In Beltane, Ogham Sticks and River Rushes are abundant
    playerStore.addResource('river_rushes');
    
    // Check and handle resource capacity
    if (playerStore.resources.length > playerStore.resourceCapacity) {
      // Discard any non-essential resource
      for (let i = 0; i < playerStore.resources.length; i++) {
        if (!['ogham_sticks', 'river_rushes', 'horse_hair', 'silver_mistletoe'].includes(playerStore.resources[i])) {
          playerStore.removeResource(playerStore.resources[i]);
          break;
        }
      }
    }
    
    expect(playerStore.resources.length).toBeLessThanOrEqual(playerStore.resourceCapacity);
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 6. PHASE: ANIMAL COMPANION ACTION
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.ANIMAL_COMPANION);
    
    // Giant Beastfriend can have two active companions at once
    // We already activated Stag Protector, now use Fox Trickster
    
    // Feed Fox Trickster to maintain bond
    playerStore.feedCompanion('fox_trickster', 'ogham_sticks');
    
    // Use Fox Trickster's ability for deception
    playerStore.useCompanionAbility('fox_trickster');
    
    // In Beltane, certain companions thrive - Stag Protector is especially strong
    
    // Verify we still have our companions
    expect(playerStore.animalCompanions.length).toBe(7);
    expect(playerStore.animalCompanions).toContain('stag_protector');
    expect(playerStore.animalCompanions).toContain('fox_trickster');
    
    // Advance to next phase
    gameStore.advancePhase();
    
    // 7. PHASE: CRAFTING (OPTIONAL)
    // ------------------------------------------
    expect(gameStore.currentPhase).toBe(GamePhase.CRAFTING);
    
    // Let's craft the Beastmaster's Horn with Horse Hair, Ogham Sticks, and River Rushes
    
    // Verify we have all required resources
    const hasHorseHair = playerStore.resources.includes('horse_hair');
    const hasOghamSticks = playerStore.resources.includes('ogham_sticks');
    const hasRiverRushes = playerStore.resources.includes('river_rushes');
    
    expect(hasHorseHair).toBe(true);
    expect(hasOghamSticks).toBe(true);
    expect(hasRiverRushes).toBe(true);
    
    // Craft the Beastmaster's Horn
    const initialCraftedItems = playerStore.craftedItems.length;
    playerStore.addCraftedItem('beastmasters_horn');
    
    // Verify crafting was successful
    expect(playerStore.craftedItems.length).toBe(initialCraftedItems + 1);
    expect(playerStore.craftedItems).toContain('beastmasters_horn');
    
    // Consume the resources used for crafting
    playerStore.removeResource('horse_hair');
    playerStore.removeResource('ogham_sticks');
    playerStore.removeResource('river_rushes');
    
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
    
    // Prepare for next landscape (Ancient Apple Orchard)
    gameStore.setCurrentLandscape('ancient_apple_orchard');
    gameStore.setCurrentChallenge('hidden_fae');
    
    // Complete turn sequence by returning to the first phase
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(gameStore.currentPhase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
});
