<template>
  <div class="game-board" style="border: 2px solid lightblue; position: relative;">
    <main class="game-content">
      <!-- Cards Row Section -->
      <section class="cards-row-section">
        <div class="cards-row">
          <div class="card-item">
            <GameCard
              :title="formatSeason(gameStore.currentSeason)"
              subtitle="Current Season"
              :cardType="CardType.SEASON"
            >
              <p>The seasons affect which resources are available and the effectiveness of your animal companions.</p>
            </GameCard>
          </div>
          
          <div v-if="currentLandscape" class="card-item">
            <GameCard
              :title="currentLandscape.name"
              subtitle="Current Landscape"
              :cardType="CardType.LANDSCAPE"
            >
              <p>{{ currentLandscape.description }}</p>
            </GameCard>
          </div>
          
          <div v-if="currentCharacter" class="card-item">
            <GameCard
              :title="currentCharacter.name"
              subtitle="Your Character"
              :cardType="CardType.CHARACTER"
            >
              <p>{{ currentCharacter.specialAbility.name }}: {{ currentCharacter.specialAbility.description }}</p>
            </GameCard>
          </div>
          
          <!-- Resource Cards -->
          <div v-for="resourceId in playerStore.resources" :key="resourceId" class="card-item">
            <GameCard
              :title="getCardResourceName(resourceId)"
              subtitle="Resource"
              :cardType="CardType.RESOURCE"
            >
              <p>{{ getResourceDescription(resourceId) }}</p>
            </GameCard>
          </div>
          
          <!-- Crafted Item Cards -->
          <div v-for="itemId in playerStore.craftedItems" :key="itemId" class="card-item">
            <GameCard
              :title="getCraftedItemName(itemId)"
              subtitle="Crafted Item"
              :cardType="CardType.CRAFTED_ITEM"
            >
              <p>{{ getCraftedItemDescription(itemId) }}</p>
            </GameCard>
          </div>
        </div>
      </section>

      <!-- Character Section -->
      <section class="character-section" v-if="false">
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
      <section class="landscape-section" v-if="false">
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
                  {{ getCardResourceName(resourceId) }}
                </li>
              </ul>
            </div>
          </GameCard>
        </div>
      </section>
      
      <!-- Phase-specific content -->
      <section class="phase-content" style="border: 2px solid lightblue; position: relative; margin-top: 0; padding: 5px; background-color: rgba(240, 230, 210, 0.3); border-radius: 8px; border: 1px solid #8c7851;">
        <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">GameBoardView</div>
        <div style="position: absolute; top: -20px; left: 115px; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">PhaseContent</div>
        
        <!-- Seasonal Assessment Phase -->
        <div v-if="gameStore.currentPhase === GamePhase.SEASONAL_ASSESSMENT" style="display: flex; flex-direction: column; align-items: center; width: 100%; position: relative; border: 2px solid rgba(173, 216, 230, 0.3); padding: 5px;">
          <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">SeasonalAssessmentPhase</div>
          <GameCard 
            title="Continue Journey" 
            cardType="ACTION"
            @click="gameStore.advancePhase()"
          >
            <div style="font-size: 1.1rem; padding: 10px;">
              Proceed to the next phase of your adventure
            </div>
          </GameCard>
        </div>
        
        <!-- Exploration Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.EXPLORATION">
          <h2 class="phase-title">EXPLORATION</h2>
          <div class="phase-description">
            <p>You are exploring {{ currentLandscape?.name }}. What will you discover?</p>
          </div>
          <button @click="gameStore.advancePhase()" style="margin-top: 5px; font-weight: bold; padding: 5px 10px; font-size: 0.9rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
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
              :cardType="CardType.CHARACTER"
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
          </div>
          
          <GameCard 
            title="Continue to Next Phase" 
            cardType="ACTION"
            @click="gameStore.advancePhase()"
          >
            <div style="font-size: 1rem; padding: 5px;">
              Proceed with your journey
            </div>
          </GameCard>
        </div>
        
        <!-- Threat Level Check Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.THREAT_LEVEL_CHECK" style="position: relative; border: 2px solid lightblue; padding: 10px;">
          <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">ThreatLevelCheckPhase</div>
          <div class="phase-description">
            <div>
              <!-- Threat meter removed -->
            </div>
          </div>
          <GameCard 
            title="Remain Vigilant" 
            cardType="ACTION"
            @click="gameStore.advancePhase()"
          >
            <div style="font-size: 1.1rem; padding: 10px;">
              Stay alert and advance to the next phase
            </div>
          </GameCard>
        </div>
        
        <!-- Resource Management Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.RESOURCE_MANAGEMENT" style="position: relative; border: 2px solid lightblue; padding: 10px;">
          <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">ResourceManagementPhase</div>
          <ResourceManagement />
        </div>
        
        <!-- Animal Companion Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.ANIMAL_COMPANION" style="position: relative; border: 2px solid lightblue; padding: 10px;">
          <div v-if="playerStore.animalCompanions.length === 0">
            <AnimalCompanionSelection
              @select-companion="selectCompanion"
            />
            
            <div class="action-buttons mt-4">
              <GameCard 
                title="Skip Animal Companion" 
                cardType="ACTION"
                @click="advancePhase"
              >
                <div style="font-size: 1rem; padding: 5px;">
                  Continue without a companion
                </div>
              </GameCard>
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
        
        <!-- Crafting Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.CRAFTING">
          <CraftingStation />
        </div>
        
        <!-- Journey Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.JOURNEY">
          <h2 class="phase-title">JOURNEY</h2>
          <GameMap />
          <div class="journey-actions mt-4">
            <GameCard 
              title="Journey Onwards" 
              cardType="ACTION"
              @click="gameStore.advanceJourney(1)"
            >
              <div style="font-size: 1rem; padding: 5px;">
                Continue your travels
              </div>
            </GameCard>
          </div>
        </div>
        
        <!-- Journey Progression Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.JOURNEY_PROGRESSION" style="position: relative; border: 2px solid lightblue; padding: 10px;">
          <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">JourneyProgressionPhase</div>
          <h2 class="phase-title">JOURNEY PROGRESSION</h2>
          <div class="phase-description">
            <p>You are ready to journey to the next landscape.</p>
            <div v-if="nextLandscape" class="next-landscape mt-4">
              <GameCard 
                :title="nextLandscape.name" 
                subtitle="Next Landscape"
                :cardType="CardType.LANDSCAPE"
                @click="startNewTurn()"
              >
                <p>{{ nextLandscape.description }}</p>
                <div class="action-text" style="font-weight: bold; margin-top: 10px; text-align: center; color: #5a3e2b;">
                  Click to journey to this location
                </div>
              </GameCard>
            </div>
            <div v-else class="mt-4">
              <GameCard 
                title="Continue Journey" 
                cardType="ACTION"
                @click="gameStore.advancePhase()"
              >
                <div style="font-size: 1.1rem; padding: 10px;">
                  Begin the next turn of your adventure
                </div>
              </GameCard>
            </div>
          </div>
        </div>
        
        <!-- Landscape Challenge Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.LANDSCAPE_CHALLENGE" style="position: relative; border: 2px solid lightblue; padding: 10px;">
          <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">LandscapeChallengePhase</div>
          <div class="challenge-actions" style="margin-top: 20px; display: flex; gap: 10px;">
            <GameCard 
              title="Roll D8 and Resolve Challenge" 
              cardType="ACTION"
              @click="resolveChallengeLandscape()"
            >
              <div style="font-size: 1rem; padding: 5px;">
                Test your skills against the challenge
              </div>
            </GameCard>
            
            <GameCard 
              title="Avoid Challenge" 
              cardType="ACTION"
              @click="avoidChallengeLandscape()"
            >
              <div style="font-size: 1rem; padding: 5px;">
                Cost: 2 Resources
              </div>
            </GameCard>
          </div>
        </div>
        
        <!-- Challenge Resolution Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.CHALLENGE_RESOLUTION" style="position: relative; border: 2px solid lightblue; padding: 10px;">
          <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">ChallengeResolutionPhase</div>
          <h2 class="phase-title">CHALLENGE RESOLUTION</h2>
          <div class="phase-description">
            <p>Resolve the current challenge with your skills and resources.</p>
          </div>
          <GameCard 
            title="Continue to Next Phase" 
            cardType="ACTION"
            @click="gameStore.advancePhase()"
          >
            <div style="font-size: 1rem; padding: 5px;">
              Proceed with your journey
            </div>
          </GameCard>
        </div>
        
        <!-- Seasonal Assessment Phase -->
        <div v-else-if="gameStore.currentPhase === GamePhase.SEASONAL_ASSESSMENT">
          <GameCard 
            title="Continue Journey" 
            cardType="ACTION"
            @click="gameStore.advancePhase()"
          >
            <div style="font-size: 1.1rem; padding: 10px;">
              Proceed to the next phase of your adventure
            </div>
          </GameCard>
        </div>
      </section>
    </main>
    
    <aside class="game-log">
      <PlayerDashboard />
      <GameLog />
    </aside>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import GameMap from '@/components/game/GameMap.vue';
import ResourceManagement from '@/components/game/ResourceManagement.vue';
import CraftingStation from '@/components/game/CraftingStation.vue';
import PlayerDashboard from '@/components/game/PlayerDashboard.vue';
import AnimalCompanionSelection from '@/components/game/AnimalCompanionSelection.vue';
import CompanionManagement from '@/components/game/CompanionManagement.vue';
import GameLog from '@/components/game/GameLog.vue';
import GameCard from '@/components/core/GameCard.vue';
import { GamePhase } from '@/models/enums/phases';
import { CardType } from '@/models/enums/cardTypes';
import { CraftingService } from '@/services/craftingService';
import type { ResourceCard } from '@/models/types/cards';
import type { LandscapeCard } from '@/models/types/cards';
import { Season } from '@/models/enums/seasons';
import { ChallengeType } from '@/models/enums/cardTypes';

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

const nextLandscape = computed(() => {
  const cardStore = useCardStore();
  // Get the next landscape index
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
  const seasonModifier = seasonModifiers[gameStore.currentSeason] || 0;
  
  return baseDifficulty + threatModifier + seasonModifier;
};

const getItemBonuses = () => {
  // Safely calculate item bonuses
  return playerStore.equippedItems?.reduce((total, item) => {
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
  
  return seasonModifiers[gameStore.currentSeason] || 0;
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
  if (gameStore.currentSeason === Season.LUGHNASADH) {
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
        gameStore.victoryConditions.journeyCompleted = true;
        gameStore.checkVictoryConditions();
      }
    } else {
      // This should not happen, but just in case
      gameStore.addToGameLog('You have visited all landscapes, including the Wild Horse Plain.', true);
      gameStore.completeJourney(true);
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
  
  const phaseName = phase.toString().replace(/_/g, ' ').toLowerCase();
  return phaseName.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

const formatSeason = (season: Season): string => {
  if (!season) return 'Unknown';
  
  // Convert enum value to readable format (e.g., SPRING to Spring)
  const seasonName = season.toString();
  return seasonName.charAt(0) + seasonName.slice(1).toLowerCase();
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
  gameStore.addToGameLog("The veil thins as otherworldly forces manifest!", true);
};

const advanceToChallenge = () => {
  gameStore.advancePhase();
};

const advanceToNextPhase = () => {
  gameStore.advancePhase();
};
</script>

<style lang="scss" scoped>
.game-board {
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f8f4e9;
}

.game-header {
  padding: 0.5rem;
  background-color: rgba(92, 61, 46, 0.1);
}

.game-content {
  flex-grow: 1;
  overflow-y: auto;
  padding: 0.25rem;
  display: flex;
  flex-direction: column;
}

.season-section, 
.cards-row-section {
  margin-bottom: 0.25rem;
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  
  h2, h3 {
    font-size: 28px; 
  }
  
  p {
    font-size: 18px;
    line-height: 1.6;
  }
}

.cards-row {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.8rem;
  padding: 0.25rem;
  width: 100%;
  
  .card-item {
    flex: 0 0 auto;
    max-width: calc(31% - 0.8rem); 
    min-width: 200px; 
    margin-bottom: 0.8rem;
  }
}

.seasonal-wheel-container {
  margin-bottom: 0;
}

.phase-description {
  p {
    font-family: 'Cinzel', serif;
    font-size: 26px;
    line-height: 1.6;
    letter-spacing: 0.5px;
  }
}
</style>
