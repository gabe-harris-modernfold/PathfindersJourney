<template>
  <div class="game-board" style="border: 2px solid lightblue; position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">GameBoardView</div>
    <div class="game-header">
      <PlayerDashboard />
    </div>
    
    <main class="game-content">
      <!-- Season Section -->
      <section class="season-section">
        <div class="season-card-container">
          <GameCard
            :title="formatSeason(gameStore.currentSeason)"
            subtitle="Current Season"
            :cardType="CardType.SEASON"
          >
            <p>The seasons affect which resources are available and the effectiveness of your animal companions.</p>
          </GameCard>
        </div>
        
        <div class="seasonal-wheel-container">
          <SeasonalWheel 
            :season="gameStore.currentSeason" 
            :quests="seasonalQuests"
          />
        </div>
      </section>

      <!-- Character Section -->
      <section class="character-section">
        <div class="character-card-container">
          <GameCard
            :title="currentCharacter ? currentCharacter.name : 'No Character Selected'"
            :subtitle="currentCharacter ? currentCharacter.archetype : ''"
            :cardType="CardType.CHARACTER"
          >
            <div v-if="currentCharacter">
              <p>{{ currentCharacter.description }}</p>
              <div v-if="currentCharacter.specialAbility">
                <h4>Special Ability:</h4>
                <p>{{ currentCharacter.specialAbility.name }}: {{ currentCharacter.specialAbility.description }}</p>
              </div>
            </div>
          </GameCard>
        </div>
      </section>
      
      <!-- Landscape Section -->
      <section class="landscape-section" v-if="currentLandscape">
        <div class="landscape-card-container">
          <GameCard 
            :title="currentLandscape.name" 
            :subtitle="currentLandscape.description" 
            :cardType="CardType.LANDSCAPE"
          >
            <div v-if="currentLandscape.availableResources && currentLandscape.availableResources.length">
              <h4>Available Resources:</h4>
              <ul>
                <li v-for="resourceId in currentLandscape.availableResources" :key="resourceId">
                  {{ getResourceName(resourceId) }}
                </li>
              </ul>
            </div>
          </GameCard>
        </div>
      </section>
      
      <!-- Phase-specific content -->
      <section class="phase-content" style="margin-top: 20px; padding: 15px; background-color: rgba(240, 230, 210, 0.3); border-radius: 8px; border: 1px solid #8c7851;">
        <!-- Phase navigation bar -->
        <div class="phase-navigation" style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid #8c7851;">
          <div class="current-phase" style="font-weight: bold; color: #5a3e2b;">
            Current Phase: {{ formatPhase(gameStore.currentPhase) }}
          </div>
          
          <button @click="gameStore.advancePhase()" style="font-weight: bold; padding: 5px 15px; font-size: 0.9rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
            Next Phase →
          </button>
        </div>
        
        <!-- Seasonal Assessment Phase -->
        <div v-if="gameStore.currentPhase === GamePhase.SEASONAL_ASSESSMENT" style="display: flex; flex-direction: column; align-items: center; width: 100%;">
          <h2 class="phase-title" style="color: #5a3e2b; margin-bottom: 15px; text-align: center; width: 100%;">SEASONAL ASSESSMENT</h2>
          <SeasonalAssessmentCard />
          <button @click="gameStore.advancePhase()" style="margin-top: 20px; font-weight: bold; padding: 10px 20px; font-size: 1rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
            Continue to Next Phase
          </button>
        </div>
        
        <!-- Exploration Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.EXPLORATION">
          <h2 class="phase-title">EXPLORATION</h2>
          <div class="phase-description">
            <p>You are exploring {{ currentLandscape?.name }}. What will you discover?</p>
          </div>
          <button @click="gameStore.advancePhase()" style="margin-top: 20px; font-weight: bold; padding: 10px 20px; font-size: 1rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
            Continue to Next Phase
          </button>
        </div>
        
        <!-- Challenge Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.CHALLENGE && currentChallenge">
          <h2 class="phase-title">CHALLENGE</h2>
          <div class="challenge-card-container">
            <GameCard 
              :title="currentChallenge.name" 
              :subtitle="currentChallenge.description" 
              :cardType="currentChallenge.type"
            >
              <div>
                <p><strong>Difficulty:</strong> {{ currentChallenge.difficulty }}</p>
                <div v-if="currentChallenge.rewards">
                  <h4>Rewards:</h4>
                  <ul>
                    <li v-if="currentChallenge.rewards.resources">Resources: {{ currentChallenge.rewards.resources.join(', ') }}</li>
                    <li v-if="currentChallenge.rewards.experience">Experience: {{ currentChallenge.rewards.experience }}</li>
                    <li v-if="currentChallenge.rewards.knowledge">Knowledge: {{ currentChallenge.rewards.knowledge }}</li>
                  </ul>
                </div>
              </div>
            </GameCard>
          </div>
          
          <div class="challenge-details mt-4">
            <p>Difficulty: {{ getChallengeDifficulty() }}</p>
          </div>
          
          <div class="challenge-actions mt-4">
            <button 
              @click="resolveChallenge" 
              class="btn btn--primary"
            >
              Face Challenge
            </button>
            <button 
              @click="avoidChallenge" 
              class="btn btn--secondary ml-2"
            >
              Avoid (Lose 1 Health)
            </button>
          </div>
        </div>
        
        <!-- Challenge Resolution Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.CHALLENGE_RESOLUTION && lastChallengeResult">
          <h2 class="phase-title">CHALLENGE OUTCOME</h2>
          
          <div class="challenge-result" :class="{ 
            'success': lastChallengeResult.success, 
            'partial-success': lastChallengeResult.partialSuccess,
            'failure': !lastChallengeResult.success && !lastChallengeResult.partialSuccess
          }">
            <h3>{{ lastChallengeResult.success ? 'Success!' : lastChallengeResult.partialSuccess ? 'Partial Success' : 'Failure' }}</h3>
            <p>{{ lastChallengeResult.message }}</p>
          </div>
          
          <button 
            @click="gameStore.advancePhase()" 
            class="btn btn--primary mt-4"
          >
            Continue
          </button>
        </div>
        
        <!-- Threat Level Check Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.THREAT_LEVEL_CHECK">
          <h2 class="phase-title">THREAT LEVEL CHECK</h2>
          <div class="phase-description">
            <p>The threat level in the Celtic Realm is currently: <strong>{{ gameStore.threatTokens }}</strong></p>
            <div class="threat-meter" style="width: 100%; height: 30px; background-color: rgba(250, 235, 215, 0.3); border-radius: 15px; margin: 10px 0; overflow: hidden; border: 1px solid #8c7851;">
              <div class="threat-level" :style="{width: `${Math.min(gameStore.threatTokens * 10, 100)}%`, height: '100%', backgroundColor: gameStore.threatTokens > 7 ? '#993333' : gameStore.threatTokens > 4 ? '#cc9900' : '#669966', transition: 'width 0.5s ease'}"></div>
            </div>
          </div>
          <button @click="gameStore.advancePhase()" style="margin-top: 20px; font-weight: bold; padding: 10px 20px; font-size: 1rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
            Continue to Next Phase
          </button>
        </div>
        
        <!-- Resource Management Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.RESOURCE_MANAGEMENT">
          <h2 class="phase-title">RESOURCE MANAGEMENT</h2>
          
          <div class="resource-actions mt-4">
            <button 
              @click="gatherResources" 
              class="btn btn--primary"
              :disabled="playerStore.isResourceCapacityReached"
            >
              Gather Resources
            </button>
            
            <button 
              @click="performHealing" 
              class="btn btn--secondary ml-2"
            >
              Rest and Heal
            </button>
          </div>
          
          <div v-if="playerStore.isResourceCapacityReached" class="resource-warning mt-2">
            <p>You've reached your resource capacity!</p>
          </div>
        </div>
        
        <!-- Crafting Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.CRAFTING">
          <h2 data-testid="craftingHeader" data-phase="crafting" class="phase-title">CRAFTING</h2>
          <CraftingStation />
        </div>
        
        <!-- Animal Companion Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.ANIMAL_COMPANION">
          <h2 class="phase-title">ANIMAL COMPANION</h2>
          
          <div v-if="playerStore.animalCompanions.length === 0">
            <AnimalCompanionSelection
              @select-companion="selectCompanion"
            />
            
            <div class="action-buttons mt-4">
              <button 
                class="btn btn--secondary"
                @click="advancePhase"
              >
                Skip Animal Companion
              </button>
            </div>
          </div>
          
          <div v-else>
            <CompanionManagement />
            
            <div class="action-buttons mt-4">
              <button 
                class="btn btn--primary"
                @click="advancePhase"
              >
                Continue Journey
              </button>
            </div>
          </div>
        </div>
        
        <!-- Journey Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.JOURNEY">
          <h2 class="phase-title">JOURNEY</h2>
          
          <GameMap />
          
          <div class="journey-actions mt-4">
            <button 
              @click="gameStore.advanceJourney(1)"
              class="btn btn--primary"
            >
              Journey Onwards
            </button>
          </div>
        </div>
        
        <!-- Landscape Challenge Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.LANDSCAPE_CHALLENGE">
          <h2 class="phase-title">LANDSCAPE CHALLENGE</h2>
          <div class="phase-description">
            <p>The landscape presents challenges and opportunities. Overcome them to continue your journey.</p>
            <div class="landscape-challenges">
              <p>Current Landscape: <strong>{{ currentLandscape?.name || 'Unknown' }}</strong></p>
              <p>Challenge Level: <strong>{{ currentLandscape?.challengeLevel || 'Unknown' }}</strong></p>
            </div>
          </div>
          <button @click="gameStore.advancePhase()" style="margin-top: 20px; font-weight: bold; padding: 10px 20px; font-size: 1rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
            Continue to Next Phase
          </button>
        </div>
        
        <!-- Challenge Resolution Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.CHALLENGE_RESOLUTION">
          <h2 class="phase-title">CHALLENGE RESOLUTION</h2>
          <div class="phase-description">
            <p>Resolve the current challenge with your skills and resources.</p>
          </div>
          <button @click="gameStore.advancePhase()" style="margin-top: 20px; font-weight: bold; padding: 10px 20px; font-size: 1rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
            Continue to Next Phase
          </button>
        </div>
        
        <!-- Seasonal Assessment Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.SEASONAL_ASSESSMENT">
          <h2 class="phase-title">SEASONAL ASSESSMENT</h2>
          
          <div class="season-assessment-content">
            <p>The current season is <strong>{{ formatSeason(gameStore.currentSeason) }}</strong>.</p>
            <p>Assess how the season affects your journey and resources.</p>
          </div>
          
          <div class="season-actions mt-4">
            <button 
              @click="gameStore.advancePhase()" 
              class="btn btn--primary"
            >
              Continue Journey
            </button>
          </div>
        </div>
      </section>
    </main>
    
    <aside class="game-log">
      <GameLog />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/playerStore';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import { CardType, ChallengeType } from '@/models/enums/cardTypes';
import CompanionManagement from '@/components/game/CompanionManagement.vue';
import AnimalCompanionSelection from '@/components/game/AnimalCompanionSelection.vue';
import PlayerDashboard from '@/components/game/PlayerDashboard.vue';
import CraftingStation from '@/components/game/CraftingStation.vue';
import GameLog from '@/components/game/GameLog.vue';
import GameCard from '@/components/core/GameCard.vue';
import GameMap from '@/components/game/GameMap.vue';
import SeasonalAssessmentCard from '@/components/game/SeasonalAssessmentCard.vue';
import SeasonalWheel from '@/components/game/SeasonalWheel.vue';
import { CraftingService } from '@/services/craftingService';
import type { ResourceCard } from '@/models/types/cards';
import type { LandscapeCard } from '@/models/types/cards';

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

// Reactive references
const lastChallengeResult = ref<ChallengeResult | null>(null);
const selectedCompanion = ref<string | null>(null);
const craftingService = ref<CraftingService | null>(null);

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
    craftingService.value = new CraftingService();
    console.log('CraftingService initialized successfully');
  } catch (error) {
    console.error('Error initializing CraftingService:', error);
  }
});

// Game state
const currentLandscape = computed<LandscapeCard | null>(() => {
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
  const threatModifier = gameStore.threatLevel;
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
  const itemBonus = playerStore.craftedItems.length > 0 ? 1 : 0;
  playerBonus += itemBonus;

  // Helper function to format season names
  const formatSeason = (season: Season): string => {
    if (!season) return 'Unknown';
    
    // Convert enum value to readable format (e.g., SPRING to Spring)
    const seasonName = season.toString();
    return seasonName.charAt(0) + seasonName.slice(1).toLowerCase();
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
      for (let i = 0; i < 2 && !playerStore.isResourceCapacityReached; i++) {
        const randomIndex = Math.floor(Math.random() * currentLandscape.value.availableResources.length);
        const resourceId = currentLandscape.value.availableResources[randomIndex];
        
        const addResult = playerStore.addResource(resourceId);
        if (addResult) {
          const resource = cardStore.getResourceById(resourceId);
          if (resource) {
            gameStore.addToGameLog(`You gathered ${resource.name} as a reward.`, true);
          }
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
      
      const addResult = playerStore.addResource(resourceId);
      if (addResult) {
        const resource = cardStore.getResourceById(resourceId);
        if (resource) {
          gameStore.addToGameLog(`You gathered ${resource.name} as a partial reward.`, true);
        }
      }
    }
    
    // Apply a minor setback based on challenge type
    if (currentChallenge.value) {
      const challengeType = currentChallenge.value.type;
      let setbackMessage = "";
      
      switch (challengeType) {
        case ChallengeType.STRENGTH:
        case ChallengeType.AGILITY:
          // Physical challenges
          damage = 1;
          playerStore.loseHealth(damage);
          setbackMessage = `You suffer a minor injury. You lost ${damage} health point.`;
          break;
        case ChallengeType.WISDOM:
          // Mental challenges
          gameStore.addThreatTokens(1);
          setbackMessage = "Your confidence wavers. You gained 1 Threat token.";
          break;
        case ChallengeType.DIPLOMACY:
          // Social challenges
          // Temporarily lose access to one random resource type
          if (currentLandscape.value && currentLandscape.value.availableResources && currentLandscape.value.availableResources.length > 0) {
            const randomIndex = Math.floor(Math.random() * currentLandscape.value.availableResources.length);
            const resourceId = currentLandscape.value.availableResources[randomIndex];
            const resource = cardStore.getResourceById(resourceId);
            if (resource) {
              gameStore.addTempEffect(`resource_block_${resourceId}`, "Resource Unavailable", `Cannot gather ${resource.name}`, 1, 1);
              setbackMessage = `The local community withholds ${resource.name} from you for now.`;
            }
          }
          break;
        case ChallengeType.SURVIVAL:
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
  if (!currentChallenge.value) return '?';
  
  const baseDifficulty = currentChallenge.value.difficulty || 5;
  const threatModifier = gameStore.threatLevel;
  const seasonModifier = 0; // TODO: Add seasonal modifiers
  const totalDifficulty = baseDifficulty + threatModifier + seasonModifier;
  
  return `${totalDifficulty} (Base: ${baseDifficulty} + Threat: ${threatModifier} + Season: ${seasonModifier})`;
};

const handleThreatCheck = () => {
  // Use the threat level check handler in gameStore
  gameStore.handleThreatLevelCheck();
};

const gatherResources = () => {
  if (!currentLandscape.value || playerStore.isResourceCapacityReached) {
    return;
  }
  
  // Determine the number of resources the player can gather
  let resourcesToGather = 1;
  
  // Add seasonal bonuses
  if (gameStore.currentSeason === Season.LUGHNASADH) {
    resourcesToGather += 1; // Lughnasadh gives +1 resource
    gameStore.addToGameLog("The harvest season of Lughnasadh allows you to gather an extra resource.");
  }
  
  // Gather random resources available from the landscape
  if (currentLandscape.value.availableResources && currentLandscape.value.availableResources.length > 0) {
    for (let i = 0; i < resourcesToGather && !playerStore.isResourceCapacityReached; i++) {
      const randomIndex = Math.floor(Math.random() * currentLandscape.value.availableResources.length);
      const resourceId = currentLandscape.value.availableResources[randomIndex];
      
      const addResult = playerStore.addResource(resourceId);
      if (addResult) {
        const resource = cardStore.getResourceById(resourceId);
        if (resource) {
          gameStore.addToGameLog(`You gathered ${resource.name}.`, true);
        }
      }
    }
  } else {
    gameStore.addToGameLog("There are no resources to gather at this location.", true);
  }
  
  // Advance to the next phase
  gameStore.advancePhase();
};

const getResourceName = (resourceId: string) => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : 'Unknown Resource';
};

const getRequiredResourcesText = (resources: string[]): string => {
  if (!resources || !resources.length) return 'None';
  return resources.map(id => getResourceName(id)).join(', ');
};

const canCraftItem = (itemId: string) => {
  if (!craftingService.value) return false;
  return craftingService.value.canCraftItem(itemId);
};

const craftItem = (itemId: string) => {
  if (!craftingService.value) return;
  const result = craftingService.value.craftItem(itemId);
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

const performHealing = () => {
  let healAmount = 1; // Base healing
  
  // Add seasonal bonuses
  if (gameStore.currentSeason === Season.IMBOLC) {
    healAmount += 1; // Additional healing during Imbolc
  }
  if (gameStore.currentSeason === Season.LUGHNASADH) {
    healAmount *= 2; // Double healing during Lughnasadh
  }
  
  // Add location bonus
  if (isHealingLocation.value) {
    healAmount += 1; // Additional healing at special locations
  }
  
  // Apply healing
  playerStore.heal(healAmount);
  gameStore.addToGameLog(`You rest and recover ${healAmount} health.`, true);
  
  // Advance to next phase
  gameStore.advancePhase();
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
    const cardStore = useCardStore();
    const availableLandscapes = cardStore.landscapes.filter(l => 
      !gameStore.visitedLandscapes.includes(l.id)
    );
    
    if (availableLandscapes.length > 0) {
      // Pick a random landscape from the available ones
      const randomIndex = Math.floor(Math.random() * availableLandscapes.length);
      const newLandscape = availableLandscapes[randomIndex];
      
      // Update the current landscape
      gameStore.setCurrentLandscape(newLandscape.id);
      // Add to visited landscapes
      gameStore.addVisitedLandscape(newLandscape.id);
    } else {
      // If no more landscapes, we've completed the journey
      gameStore.addToGameLog('You have reached the end of your journey path.', true);
      gameStore.completeJourney(true);
    }
  }
  
  // Advance to the next phase
  gameStore.advancePhase();
};

// End the journey and return to character selection
const endJourney = () => {
  console.log('Ending journey...');
  playerStore.resetPlayer();
  gameStore.resetGame();
  router.push('/');
};

// Helper functions
const formatSeason = (season: Season): string => {
  if (!season) return 'Unknown';
  
  // Convert enum value to readable format (e.g., SPRING to Spring)
  const seasonName = season.toString();
  return seasonName.charAt(0) + seasonName.slice(1).toLowerCase();
};

const formatPhase = (phase: GamePhase): string => {
  if (!phase) return 'Unknown';
  
  // Convert enum value to readable format (e.g., SEASONAL_ASSESSMENT to Seasonal Assessment)
  const phaseName = phase.toString();
  return phaseName.charAt(0) + phaseName.slice(1).toLowerCase().replace('_', ' ');
};
</script>

<style lang="scss" scoped>
/* ... */
</style>
