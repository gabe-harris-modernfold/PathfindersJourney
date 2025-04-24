<template>
  <ComponentWrapper componentName="GameBoardView">
    <div class="game-board">
      <div class="main-content-area">
        <main class="game-content">
          <!-- Phase-specific content using PhaseFactory -->
          <section class="phase-content">
            <PhaseFactory />
          </section>
        </main>
      </div>
      
      <!-- Player Dashboard - Redesigned to be narrative and whimsical -->
      <div class="dashboard-container">
        <CardSection 
          title="Your Journey's Tale" 
          collapsible
          layout="vertical"
          :initiallyExpanded="false">
          <div class="narrative-text">
            You are a <span class="highlight">{{ currentCharacter?.name || 'Pathfinder' }}</span>, 
            a traveler braving the season of <span class="highlight">{{ formatSeason(seasonStore.currentSeason) }}</span>.
            Your journey has led you through <span class="highlight">{{ gameStore.currentTurn }}</span> turns of adventure,
            leaving you with <span class="highlight">{{ playerStore.health }}/{{ playerStore.maxHealth }}</span> vitality
            and a pack filled with <span class="highlight">{{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }}</span> treasures.
            <span v-if="playerStore.animalCompanions.length > 0">
              Accompanied by <span class="highlight">{{ playerStore.companionCount }}</span> loyal beasts,
            </span>
            <span v-if="playerStore.craftedItems.length > 0">
              your skilled hands have crafted
              <span v-for="itemId in playerStore.craftedItems" :key="itemId" class="crafted-item">
                {{ getCraftedItemName(itemId) }}{{ playerStore.craftedItems.indexOf(itemId) < playerStore.craftedItems.length - 1 ? ', ' : '' }}
              </span>.
            </span>
            The fates now guide you towards <span class="highlight">{{ formatPhase(gameStore.currentPhase) }}</span>.
          </div>
        </CardSection>
      </div>
      
      <!-- Game Log at bottom spanning full width -->
      <div class="game-log-container">
        <GameLog />
      </div>
    </div>
  </ComponentWrapper>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useSeasonStore } from '@/stores/seasonStore';
import GameMap from '@/components/game/GameMap.vue';
import GameCard from '@/components/core/GameCard.vue';
import GameLog from '@/components/game/GameLog.vue';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import PhaseFactory from '@/components/phases/PhaseFactory.vue';
import { ComponentWrapper } from '@/components/common';
import CardSection from '@/components/CardSection.vue';

// Interface for challenge result
interface ChallengeResult {
  success: boolean;
  partialSuccess?: boolean;
  partialSuccessExperience?: number;
  partialSuccessSetback?: string;
  message: string;
  damage?: number;
  rewards?: any;
}

// Initialize router and stores
const router = useRouter();
const playerStore = usePlayerStore();
const gameStore = useGameStore();
const cardStore = useCardStore();
const seasonStore = useSeasonStore();

// Reactive references
const lastChallengeResult = ref<ChallengeResult | null>(null);
const selectedCompanion = ref<string | null>(null);
const craftingService = ref<any | null>(null);

// Track seasonal quests
const seasonalQuests = ref([
  { id: 'SAMHAIN', completed: false },
  { id: 'WINTERS_DEPTH', completed: false },
  { id: 'IMBOLC', completed: false },
  { id: 'BELTANE', completed: false },
  { id: 'LUGHNASADH', completed: false }
]);

// Initialize services after component is mounted
onMounted(() => {
  // Make sure the CraftingService is initialized correctly
  try {
    craftingService.value = {};
    console.log('CraftingService initialized successfully');
  } catch (error) {
    console.error('Error initializing CraftingService:', error);
  }
});

// Game state
const currentLandscape = computed(() => {
  return gameStore.currentLandscape;
});

const currentCharacter = computed(() => {
  if (!playerStore.characterId) return null;
  return cardStore.characters.find(char => char.id === playerStore.characterId);
});

// Computed properties
const currentChallenge = computed(() => {
  if (!gameStore.currentChallenge) return null;
  return cardStore.getChallengeById(gameStore.currentChallenge);
});

const nextLandscape = computed(() => {
  const nextIndex = gameStore.journeyProgress + 1;
  if (nextIndex < gameStore.journeyPath.length) {
    const nextLandscapeId = gameStore.journeyPath[nextIndex];
    return cardStore.getLandscapeById(nextLandscapeId);
  }
  return null;
});

// State for challenge resolution

// Companion selection for ANIMAL_COMPANION phase

const selectCompanion = (companionId: string) => {
  selectedCompanion.value = companionId;
};

const clearSelectedCompanion = () => {
  selectedCompanion.value = null;
};

// Check if current location is a healing location
const isHealingLocation = computed(() => {
  if (!currentLandscape.value) return false;
  return ['Sacred Oak Grove', 'Druid\'s Sanctuary', 'Moonlit Loch'].includes(currentLandscape.value.name);
});

// Crafting computed properties
const craftableItems = computed(() => {
  if (!playerStore.resources.length) return [];
  
  // Get list of craftable items based on player's resources
  const craftableItemIds = playerStore.getCraftableItems();
  
  // Get full item objects for display
  return craftableItemIds
    .map(id => cardStore.getCraftedItemById(id))
    .filter(item => item !== undefined);
});

const currentLandscapeCraftingBonus = computed(() => {
  if (!currentLandscape.value) return null;
  
  // Check if landscape has crafting bonuses
  const landscape = currentLandscape.value;
  
  // Special crafting locations from game rules
  if (landscape.name === 'Iron Forge Dell') return 1;
  if (landscape.name === 'Sacred Oak Grove') return 1;
  if (landscape.name === 'Druid\'s Sanctuary') return 1;
  if (landscape.name === 'Moonlit Loch') return 1;
  
  return null;
});

// Game actions
const resolveChallenge = () => {
  if (!currentChallenge.value || !gameStore.currentChallenge) {
    gameStore.addToGameLog("No active challenge to resolve.", true);
    return;
  }
  
  console.log('Resolving challenge:', currentChallenge.value.name);
  
  // Calculate challenge difficulty including threat level
  const baseDifficulty = currentChallenge.value.difficulty || 5;
  const threatModifier = gameStore.threatTokens;
  const seasonModifier = 0; // TODO: Add seasonal modifiers
  const totalDifficulty = baseDifficulty + threatModifier + seasonModifier;
  
  // Calculate player's bonus
  let playerBonus = 0;
  
  // Add bonuses from character
  if (currentCharacter.value?.specialAbility) {
    // Apply specific character bonuses if applicable
    playerBonus += 1;
  }
  
  // Add bonuses from animal companions
  const animalBonus = playerStore.animalCompanions.length > 0 ? 1 : 0;
  playerBonus += animalBonus;
  
  // Add bonuses from crafted items
  const itemBonus = getItemBonuses();
  playerBonus += itemBonus;

  // Helper function to format season names
  const formatSeason = (season: Season): string => {
    if (!season) return 'The Current Season';
    
    // Handle the string-based enum values
    switch (season) {
      case Season.SAMHAIN:
        return 'Samhain';
      case Season.WINTERS_DEPTH:
        return 'Winter\'s Depth';
      case Season.IMBOLC:
        return 'Imbolc';
      case Season.BELTANE:
        return 'Beltane';
      case Season.LUGHNASADH:
        return 'Lughnasadh';
      default:
        return 'The Current Season';
    }
  };

  // Simulate rolling the 8-sided die
  const dieRoll = Math.floor(Math.random() * 8) + 1;
  const totalRoll = dieRoll + playerBonus;
  
  let success = false;
  let partialSuccess = false;
  let damage = 0;
  
  // Natural 8 always succeeds
  if (dieRoll === 8) {
    success = true;
    gameStore.addToGameLog("Natural 8! Automatic success regardless of modifiers.", true);
  } else {
    // Check for full success
    success = totalRoll >= totalDifficulty;
    
    // Check for partial success (exactly one point below difficulty)
    partialSuccess = !success && totalRoll === totalDifficulty - 1;
  }
  
  if (success) {
    // Handle success
    lastChallengeResult.value = {
      success: true,
      message: `You successfully resolved the challenge! Roll: ${dieRoll} + ${playerBonus} = ${totalRoll} vs difficulty ${totalDifficulty}`
    };
    
    gameStore.addToGameLog(`Success! You rolled ${dieRoll} + ${playerBonus} = ${totalRoll} vs difficulty ${totalDifficulty}.`, true);
    
    // Award experience
    playerStore.gainExperience(1);
    gameStore.addToGameLog("You gained 1 experience point!", true);
    
    // Award resources (2 for full success)
    if (currentLandscape.value && currentLandscape.value.availableResources && currentLandscape.value.availableResources.length > 0) {
      let resourcesAwarded = 0;
      while (resourcesAwarded < 2 && !playerStore.isResourceCapacityReached) {
        const randomIndex = Math.floor(Math.random() * currentLandscape.value.availableResources.length);
        const resourceId = currentLandscape.value.availableResources[randomIndex];
        
        // Verify that the resource exists in cardStore before adding it
        const resourceExists = cardStore.getResourceById(resourceId);
        if (!resourceExists) {
          console.error(`Resource with ID ${resourceId} not found in cardStore`);
          gameStore.addToGameLog(`You attempted to gather a resource, but it was unidentifiable.`, true);
          continue;
        }
        
        // Add resource to player inventory
        const addResult = playerStore.addResource(resourceId);
        
        if (addResult) {
          const resource = cardStore.getResourceById(resourceId);
          if (resource) {
            gameStore.addToGameLog(`You gathered ${resource.name}.`, true);
            resourcesAwarded++;
          }
        } else if (playerStore.isResourceCapacityReached) {
          gameStore.addToGameLog(`Your resource capacity is reached. You cannot gather more resources.`, true);
          break;
        }
      }
    }
    
    // Clear the current challenge
    gameStore.setCurrentChallenge(null);
  } else if (partialSuccess) {
    // Handle partial success
    lastChallengeResult.value = {
      success: false,
      partialSuccess: true,
      message: `You partially resolved the challenge. Roll: ${dieRoll} + ${playerBonus} = ${totalRoll} vs difficulty ${totalDifficulty}`
    };
    
    gameStore.addToGameLog(`Partial success! You rolled ${dieRoll} + ${playerBonus} = ${totalRoll}, just one point below difficulty ${totalDifficulty}.`, true);
    
    // Award experience (half for partial success)
    if (Math.random() < 0.5) {
      playerStore.gainExperience(1);
      gameStore.addToGameLog("You gained 1 experience point for your effort!", true);
    }
    
    // Award 1 resource for partial success
    if (currentLandscape.value && currentLandscape.value.availableResources && currentLandscape.value.availableResources.length > 0) {
      const randomIndex = Math.floor(Math.random() * currentLandscape.value.availableResources.length);
      const resourceId = currentLandscape.value.availableResources[randomIndex];
      
      // Verify that the resource exists in cardStore before adding it
      const resourceExists = cardStore.getResourceById(resourceId);
      if (!resourceExists) {
        console.error(`Resource with ID ${resourceId} not found in cardStore`);
        gameStore.addToGameLog(`You attempted to gather a resource, but it was unidentifiable.`, true);
      } else {
        const addResult = playerStore.addResource(resourceId);
        if (addResult) {
          const resource = cardStore.getResourceById(resourceId);
          if (resource) {
            gameStore.addToGameLog(`You gathered ${resource.name}.`, true);
          }
        }
      }
    }
    
    // Apply a minor setback based on challenge type
    if (currentChallenge.value) {
      const challengeType = currentChallenge.value.type;
      let setbackMessage = "";
      
      switch (challengeType) {
        case 'STRENGTH':
        case 'AGILITY':
          // Physical challenges
          damage = 1;
          playerStore.loseHealth(damage);
          setbackMessage = `You suffer a minor injury. You lost ${damage} health point.`;
          break;
        case 'WISDOM':
          // Mental challenges
          gameStore.addThreatTokens(1);
          setbackMessage = "Your confidence wavers. You gained 1 Threat token.";
          break;
        case 'DIPLOMACY':
          // Social challenges
          // Temporarily lose access to one random resource type
          if (currentLandscape.value && currentLandscape.value.availableResources && currentLandscape.value.availableResources.length > 0) {
            const randomIndex = Math.floor(Math.random() * currentLandscape.value.availableResources.length);
            const resourceId = currentLandscape.value.availableResources[randomIndex];
            const resource = cardStore.getResourceById(resourceId);
            if (resource) {
              gameStore.addTempEffect({
                id: `resource_block_${resourceId}`,
                name: "Resource Unavailable",
                description: `Cannot gather ${resource.name}`,
                magnitude: 1
              }, 1);
              setbackMessage = `The local community withholds ${resource.name} from you for now.`;
            }
          }
          break;
        case 'SURVIVAL':
          // Survival/spiritual challenges
          // Animal companions become wary
          if (playerStore.animalCompanions.length > 0) {
            const companionId = playerStore.animalCompanions[0];
            // Mark companion as wary (will be implemented in Phase 4)
            setbackMessage = "Your animal companion becomes wary of this place.";
          } else {
            gameStore.addThreatTokens(1);
            setbackMessage = "The spiritual imbalance increases. You gained 1 Threat token.";
          }
          break;
        default:
          damage = 1;
          playerStore.loseHealth(damage);
          setbackMessage = `You encounter an unexpected setback. You lost ${damage} health point.`;
      }
      
      gameStore.addToGameLog(`Setback: ${setbackMessage}`, true);
    }
    
    // Clear the current challenge
    gameStore.setCurrentChallenge(null);
  } else {
    // Handle failure
    damage = 1; // Basic damage from failing challenge
    
    lastChallengeResult.value = {
      success: false,
      message: `You failed to resolve the challenge. Roll: ${dieRoll} + ${playerBonus} = ${totalRoll} vs difficulty ${totalDifficulty}`,
      damage
    };
    
    gameStore.addToGameLog(`Failure! You rolled ${dieRoll} + ${playerBonus} = ${totalRoll} vs difficulty ${totalDifficulty}.`, true);
    
    // Apply consequences - lose health
    playerStore.loseHealth(damage);
    gameStore.addToGameLog(`You lost ${damage} health point${damage > 1 ? 's' : ''}.`, true);
    
    // Check if player is still alive
    if (playerStore.health <= 0) {
      gameStore.addToGameLog("Your journey has come to an end...", true);
      endJourney();
      return;
    }
  }
  
  // Move to the Challenge Resolution phase
  gameStore.setPhase(GamePhase.CHALLENGE_RESOLUTION);
};

const avoidChallenge = () => {
  // It costs 1 health to avoid a challenge
  playerStore.loseHealth(1);
  gameStore.addToGameLog("You chose to avoid the challenge, losing 1 health in the process.", true);
  
  // Skip directly to Resource Management
  gameStore.setPhase(GamePhase.RESOURCE_MANAGEMENT);
};

const getChallengeDifficulty = () => {
  if (!currentLandscape.value) return 5;
  
  const baseDifficulty = currentLandscape.value.challenges?.[0]?.difficulty || 5;
  const threatModifier = Math.floor(gameStore.threatTokens / 3);
  
  // Calculate season modifier based on current season
  const seasonModifiers = {
    [Season.SAMHAIN]: 0,
    [Season.WINTERS_DEPTH]: -2,
    [Season.IMBOLC]: -1,
    [Season.BELTANE]: 1,
    [Season.LUGHNASADH]: 2
  };
  const seasonModifier = seasonModifiers[seasonStore.currentSeason] || 0;
  
  return baseDifficulty + threatModifier + seasonModifier;
};

const getItemBonuses = () => {
  // Safely calculate item bonuses
  return playerStore.equippedItems?.reduce((total, itemId) => {
    // Get the item data from the store
    const item = playerStore.craftedItems.find(i => i === itemId) ? { challengeBonus: 1 } : null;
    return total + (item?.challengeBonus || 0);
  }, 0) || 0;
};

const getTotalBonus = () => {
  // Character ability modifier
  const characterBonus = playerStore.selectedCharacter?.abilityModifier || 0;
  
  // Item bonuses from equipped items
  const itemBonus = getItemBonuses();
  
  // Blessing tokens
  const blessingBonus = gameStore.blessingTokens;
  
  return characterBonus + itemBonus + blessingBonus;
};

const getSeasonModifier = () => {
  const seasonModifiers = {
    [Season.SAMHAIN]: 0,
    [Season.WINTERS_DEPTH]: -2,
    [Season.IMBOLC]: -1,
    [Season.BELTANE]: 1,
    [Season.LUGHNASADH]: 2
  };
  
  return seasonModifiers[seasonStore.currentSeason] || 0;
};

const resolveChallengeLandscape = () => {
  try {
    // Roll the eight-sided die
    const diceRoll = Math.floor(Math.random() * 8) + 1;
    gameStore.addToGameLog(`You rolled a ${diceRoll} on a D8.`, true);
    
    const playerBonus = getTotalBonus();
    const totalRoll = diceRoll + playerBonus;
    const difficulty = getChallengeDifficulty();
    
    gameStore.addToGameLog(`You rolled a ${diceRoll} + ${playerBonus} bonus = ${totalRoll} total against difficulty ${difficulty}.`, true);
    
    // Natural 8 always succeeds
    const isNaturalSuccess = diceRoll === 8;
    const isSuccess = isNaturalSuccess || totalRoll >= difficulty;
    
    if (isNaturalSuccess) {
      gameStore.addToGameLog("A natural 8! Automatic success regardless of difficulty!", true);
    }
    
    // Create and store the challenge result
    lastChallengeResult.value = {
      success: isSuccess,
      message: isSuccess ? 
        "You successfully overcome the landscape challenge!" : 
        "You failed to overcome the landscape challenge...",
      damage: isSuccess ? 0 : Math.max(1, Math.floor((difficulty - totalRoll) / 2))
    };
    
    // Apply damage if failed
    if (!isSuccess) {
      playerStore.loseHealth(lastChallengeResult.value.damage);
      gameStore.addToGameLog(`You lost ${lastChallengeResult.value.damage} health from failing the challenge.`, true);
    }
    
    // Move to challenge resolution phase
    gameStore.setPhase(GamePhase.CHALLENGE_RESOLUTION);
  } catch (error) {
    console.error("Error in resolveChallengeLandscape:", error);
    gameStore.addToGameLog("An error occurred while resolving the challenge.", true, 'error');
  }
};

const avoidChallengeLandscape = () => {
  // Check if player has at least 2 resources
  const totalResources = playerStore.resources.length;
  if (totalResources < 2) {
    gameStore.addToGameLog("You need at least 2 resources to avoid this challenge!", true);
    return;
  }
  
  // Spend 2 random resources
  const spentResources = [];
  for (let i = 0; i < 2; i++) {
    if (playerStore.resources.length > 0) {
      const index = Math.floor(Math.random() * playerStore.resources.length);
      const resource = playerStore.resources.splice(index, 1)[0];
      spentResources.push(resource);
    }
  }
  
  // Log the avoidance
  const resourceNames = spentResources.map(r => r.name || r.id).join(" and ");
  gameStore.addToGameLog(`You spent ${resourceNames} to avoid the challenge.`, true);
  
  // Advance to resource management
  gameStore.setPhase(GamePhase.RESOURCE_MANAGEMENT);
};

const handleThreatCheck = () => {
  // Log the threat level evaluation
  gameStore.addToGameLog(`Threat level assessed at ${gameStore.threatTokens} tokens.`, true);

  // Calculate challenge difficulty modifier
  const threatModifier = Math.floor(gameStore.threatTokens / 3);
  if (threatModifier > 0) {
    gameStore.addToGameLog(`Challenge difficulty increased by +${threatModifier} due to threat level.`, false);
  }
  
  // Get the current landscape details
  const currentLandscape = cardStore.getLandscapeById(gameStore.currentLandscapeId);
  if (currentLandscape) {
    // Provide information about the current landscape's challenge based on threat level
    if (gameStore.threatTokens >= 3 && gameStore.threatTokens < 7) {
      // Low to medium threat - reveal challenge type
      gameStore.addToGameLog(`Your senses warn of a ${currentLandscape.challengeType} threat in this area.`, false);
    } else if (gameStore.threatTokens >= 7) {
      // High threat - reveal specific challenge
      gameStore.addToGameLog(`Visions clearly reveal "${currentLandscape.challenge}" present at the ${currentLandscape.name}.`, true);
      
      // Add challenge difficulty information if threat is very high
      if (gameStore.threatTokens >= 9) {
        gameStore.addToGameLog(`The ${currentLandscape.challenge} is a difficulty ${currentLandscape.difficulty} trial that will test your ${currentLandscape.challengeType} abilities.`, false);
      }
    }
  }

  // Check for random event trigger
  if (gameStore.threatTokens >= 5) {
    gameStore.addToGameLog(`The elevated threat level brings uncertainty. Be prepared for a random event.`, false);
  }

  // Check for otherworldly manifestation
  if (gameStore.threatTokens >= 10) {
    gameStore.addToGameLog(`The veil between worlds grows thin! An Otherworldly Manifestation is imminent!`, true);
  }

  // Advance to the next phase
  gameStore.advancePhase();
};

const gatherResources = () => {
  if (!currentLandscape.value) {
    gameStore.addToGameLog("Cannot gather resources - no landscape is available.", true, 'error');
    return;
  }
  
  if (playerStore.isResourceCapacityReached) {
    gameStore.addToGameLog(`Your resource capacity (${playerStore.resourceCapacity}) is full. You must discard resources before gathering more.`, true, 'resource');
    return;
  }
  
  // Determine the number of resources the player can gather
  let resourcesToGather = 1;
  
  // Add seasonal bonuses
  if (seasonStore.currentSeason === Season.LUGHNASADH) {
    resourcesToGather += 1; // Lughnasadh gives +1 resource
    gameStore.addToGameLog("The harvest season of Lughnasadh allows you to gather an extra resource.");
  }
  
  // Gather random resources available from the landscape
  if (currentLandscape.value.availableResources && currentLandscape.value.availableResources.length > 0) {
    let successfulGathers = 0;
    
    for (let i = 0; i < resourcesToGather && !playerStore.isResourceCapacityReached; i++) {
      const randomIndex = Math.floor(Math.random() * currentLandscape.value.availableResources.length);
      const resourceId = currentLandscape.value.availableResources[randomIndex];
      
      // Get resource from cardStore
      const resource = cardStore.getResourceById(resourceId);
      
      if (!resource) {
        console.error(`Resource with ID ${resourceId} not found in cardStore`);
        gameStore.addToGameLog(`You attempted to gather a resource, but it was unidentifiable.`, true, 'error');
        continue;
      }
      
      // Add resource to player inventory
      const addResult = playerStore.addResource(resourceId);
      
      if (addResult) {
        gameStore.addToGameLog(`You gathered ${resource.name}.`, true, 'resource');
        successfulGathers++;
      } else if (playerStore.isResourceCapacityReached) {
        gameStore.addToGameLog(`Your resource capacity is reached. You cannot gather more resources.`, true, 'resource');
        break;
      }
    }
    
    if (successfulGathers === 0) {
      gameStore.addToGameLog(`You failed to gather any resources.`, true, 'resource');
    } else {
      gameStore.addToGameLog(`You successfully gathered ${successfulGathers} resource(s) from ${currentLandscape.value.name}.`, true, 'resource');
    }
  } else {
    gameStore.addToGameLog(`There are no resources to gather at ${currentLandscape.value.name}.`, true, 'resource');
  }
  
  // Advance to the next phase
  gameStore.advancePhase();
};

const getRequiredResourcesText = (resources: string[]): string => {
  if (!resources || !resources.length) return 'None';
  return resources.map(id => cardStore.getResourceById(id)?.name || id).join(', ');
};

const canCraftItem = (itemId: string) => {
  if (!craftingService.value) return false;
  return craftingService.value.canCraftItem ? craftingService.value.canCraftItem(itemId) : false;
};

const craftItem = (itemId: string) => {
  if (!craftingService.value) return;
  const result = craftingService.value.craftItem ? craftingService.value.craftItem(itemId) : false;
  if (result) {
    gameStore.addToGameLog(`Successfully crafted an item!`, true);
    // If we want to add a virtual die roll for crafting difficulty:
    const dieRoll = Math.floor(Math.random() * 8) + 1;
    gameStore.addToGameLog(`Rolled a ${dieRoll} for crafting check`, true);
    
    // Get crafted item details
    const item = cardStore.getCraftedItemById(itemId);
    if (item) {
      gameStore.addToGameLog(`You now have a ${item.name} (${item.ability})`, true);
      gameStore.addToGameLog(`Beware: ${item.drawback}`, true);
    }
  }
};

// Function to advance from Animal Companion phase
const advancePhase = () => {
  // For the Animal Companion phase, we need to handle the progression
  if (gameStore.currentPhase === GamePhase.ANIMAL_COMPANION) {
    // If we have a selected companion, clear it first
    if (selectedCompanion.value) {
      clearSelectedCompanion();
    }
    
    // Generate a new landscape if needed and advance the game phase
    const availableLandscapes = cardStore.landscapes.filter(l => 
      !gameStore.visitedLandscapes.includes(l.id)
    );
    
    if (availableLandscapes.length > 0) {
      // First, check if Wild Horse Plain is the only landscape left
      const wildHorsePlainOnly = availableLandscapes.length === 1 && 
                                availableLandscapes[0].id === 'wild_horse_plain';
      
      let newLandscape;
      
      if (wildHorsePlainOnly) {
        // If Wild Horse Plain is the only landscape left, use it as the final destination
        newLandscape = availableLandscapes[0];
        gameStore.addToGameLog('You can see the Wild Horse Plain in the distance - your final destination!', true);
      } else {
        // If Wild Horse Plain is not the only one left, make sure we don't select it yet
        const nonFinalLandscapes = availableLandscapes.filter(l => l.id !== 'wild_horse_plain');
        
        if (nonFinalLandscapes.length > 0) {
          // Pick a random landscape from the available ones (excluding Wild Horse Plain)
          const randomIndex = Math.floor(Math.random() * nonFinalLandscapes.length);
          newLandscape = nonFinalLandscapes[randomIndex];
        } else {
          // If all other landscapes have been visited, now use Wild Horse Plain
          newLandscape = availableLandscapes[0]; // This must be Wild Horse Plain
          gameStore.addToGameLog('After visiting all the other lands, you finally approach the Wild Horse Plain!', true);
        }
      }
      
      // Update the current landscape
      gameStore.setCurrentLandscape(newLandscape.id);
      // Add to visited landscapes
      gameStore.addVisitedLandscape(newLandscape.id);
      
      // If this is Wild Horse Plain and we've visited it, mark the journey as complete
      if (newLandscape.id === 'wild_horse_plain') {
        gameStore.addToGameLog('You have reached the Wild Horse Plain, completing your journey!', true);
        gameStore.completeJourney();
        gameStore.checkVictoryConditions();
      }
    } else {
      // This should not happen, but just in case
      gameStore.addToGameLog('You have visited all landscapes, including the Wild Horse Plain.', true);
      gameStore.completeJourney();
    }
  }
  
  // Advance to the next phase
  gameStore.advancePhase();
};

// Function to start a new turn by setting the current landscape to the next one
// and resetting the phase to SEASONAL_ASSESSMENT
const startNewTurn = () => {
  if (nextLandscape.value) {
    // Update current landscape to the next one
    gameStore.currentLandscapeId = gameStore.journeyPath[gameStore.journeyProgress + 1];
    // Advance journey progress
    gameStore.journeyProgress++;
    // Add to game log
    gameStore.addToGameLog(`Arrived at ${nextLandscape.value.name}.`);
    // Reset phase to start the turn cycle - use direct assignment instead of setPhase
    gameStore.currentPhase = GamePhase.SEASONAL_ASSESSMENT;
  } else {
    // No more landscapes, handle journey completion
    gameStore.addToGameLog("You've reached the end of your journey!");
    gameStore.journeyComplete = true;
    gameStore.advancePhase();
  }
};

// End the journey and return to home screen
const endJourney = () => {
  console.log('Ending journey...');
  playerStore.resetPlayer();
  gameStore.resetGame();
  router.push('/');
};

// Helper functions
const formatPhase = (phase: GamePhase): string => {
  if (!phase) return 'Unknown';
  
  const phaseName = phase.toString();
  return phaseName.split('_').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
  ).join(' ');
};

const formatSeason = (season: Season): string => {
  if (!season) return 'The Current Season';
  
  // Handle the string-based enum values
  switch (season) {
    case Season.SAMHAIN:
      return 'Samhain';
    case Season.WINTERS_DEPTH:
      return 'Winter\'s Depth';
    case Season.IMBOLC:
      return 'Imbolc';
    case Season.BELTANE:
      return 'Beltane';
    case Season.LUGHNASADH:
      return 'Lughnasadh';
    default:
      return 'The Current Season';
  }
};

const getCardResourceName = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : 'Unknown Resource';
};

const getResourceDescription = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.description : 'A valuable resource that can be used for crafting and survival.';
};

const getCraftedItemName = (itemId: string): string => {
  const item = cardStore.getCraftedItemById(itemId);
  return item ? item.name : 'Unknown Item';
};

const getCraftedItemDescription = (itemId: string): string => {
  const item = cardStore.getCraftedItemById(itemId);
  return item ? item.description : 'A crafted item.';
};

const triggerRandomEvent = () => {
  // Use the gameStore's random event trigger
  gameStore.triggerRandomEvent();
  gameStore.addToGameLog("A random event has been drawn due to the high threat level.", true);
};

const triggerOtherworldlyManifestation = () => {
  // Use the gameStore's otherworldly manifestation trigger
  gameStore.triggerOtherworldlyManifestation();
  gameStore.addToGameLog("The veil between worlds grows thin! An Otherworldly Manifestation is imminent!", true);
};

const advanceToChallenge = () => {
  gameStore.advancePhase();
};

const advanceToNextPhase = () => {
  gameStore.advancePhase();
};

// Function to move forward in the journey
const moveForward = () => {
  // Check if there are more landscapes
  if (gameStore.journeyPath.length > gameStore.journeyProgress + 1) {
    // Move to the next landscape
    gameStore.journeyProgress++;
    gameStore.currentLandscapeId = gameStore.journeyPath[gameStore.journeyProgress];
    
    // Add to game log
    gameStore.addToGameLog(`Arrived at ${nextLandscape.value.name}.`);
    // Reset phase to start the turn cycle - use direct assignment instead of setPhase
    gameStore.currentPhase = GamePhase.SEASONAL_ASSESSMENT;
  } else {
    // No more landscapes, handle journey completion
    gameStore.addToGameLog("You've reached the end of your journey!");
    gameStore.journeyComplete = true;
    gameStore.advancePhase();
  }
};

const onJourneyAdvance = () => {
  // Advance journey to next stage
  moveForward();
};

const showChallengeRating = () => {
  const challengeDifficulty = getChallengeDifficulty();
  const playerChance = getTotalBonus();
  
  // Display the challenge difficulty
  return `Challenge Rating: ${challengeDifficulty} | Your Rating: ${playerChance}`;
};
</script>

<style lang="scss" scoped>
.game-board {
  height: 100%;
  display: grid;
  grid-template-columns: 1fr;
  grid-template-rows: 1fr auto;
  gap: 0.25rem;
  padding: 0.25rem;
  background-color: #f5f5f5;
}

.dashboard-container {
  grid-column: 1 / -1;
  padding: 0.5rem;
  background-color: #fff;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.main-content-area {
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.25rem;
}

.game-content {
  background-color: white;
  border-radius: 0.5rem;
  padding: 0.25rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: auto;
}

.phase-content {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  margin: 0;
  padding: 0;
}

.player-dashboard {
  background-color: #f2e9d8;
  border-radius: 5px;
  padding: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);

  &.narrative-style {
    background-color: #f9f3e9;
    border: 1px solid #d9c7a7;
    font-family: 'Garamond', serif;
  }
  
  h3 {
    font-size: 1.2rem;
    margin-top: 0;
    margin-bottom: 5px;
    color: #5a3e2b;
    text-align: center;
    font-family: 'Garamond', serif;
  }
}

.narrative-scroll {
  line-height: 1.4;
  font-size: 0.95rem;
  color: #432818;
  
  p {
    margin: 4px 0;
  }
  
  .highlight {
    color: #6b4226;
    font-weight: bold;
  }
}

.crafted-item {
  display: inline;
  color: #6b4226;
  font-style: italic;
  margin-right: 5px;
}

.stat-row {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.stat-item {
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 0.25rem;
  padding: 0.5rem;
  
  p {
    margin: 0.25rem 0;
    font-size: 0.9rem;
    
    strong {
      color: #f39c12;
      margin-right: 0.25rem;
    }
  }
}

.placeholder-log {
  background-color: #fff;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 0.25rem;
  height: 300px;
  overflow-y: auto;
}

.game-log-container {
  grid-column: 1 / -1;
  background-color: #fff;
  margin-top: 1rem;
  border-radius: 0.5rem;
  overflow: hidden;
}

.full-width {
  width: 100%;
  display: block;
  white-space: normal;
  text-align: left;
}

.narrative-text {
  width: 100%;
  text-align: left;
  line-height: 1.6;
}
</style>
