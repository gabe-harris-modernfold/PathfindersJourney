<template>
  <div class="game-container">
    <h1 class="game-title">Game Board</h1>
    <div class="current-phase">{{ gameStore.currentPhase }}</div>
    
    <div class="game-board">
      <div class="player-status-horizontal">
        <h2>Player Status</h2>
        <div class="status-items">
          <div class="status-item">
            <span class="status-icon">❤️</span>
            <span class="status-value">{{ playerStore.health }}</span>
          </div>
          <div class="status-item">
            <span class="status-icon">👤</span>
            <span class="status-value">{{ currentCharacter?.name || 'Unknown' }}</span>
          </div>
          <div class="status-item">
            <span class="status-icon">🍂</span>
            <span class="status-value">{{ formatSeason(gameStore.currentSeason) }}</span>
          </div>
        </div>
      </div>
      
      <div class="game-board__content">
        <div class="game-board__phase-content">
          <!-- Game phases content will go here -->
          <div v-if="gameStore.currentPhase === GamePhase.SEASONAL_ASSESSMENT" class="seasonal-assessment">
            <h2>Seasonal Assessment</h2>
            <p>The current season is {{ formatSeason(gameStore.currentSeason) }}.</p>
            <p>Assess the seasonal effects on your journey and prepare for the challenges ahead.</p>
            
            <div class="seasonal-effects" v-if="currentSeasonCard">
              <h3>Seasonal Effects:</h3>
              <ul>
                <li v-for="(effect, index) in currentSeasonCard.effects" :key="index">
                  <strong>{{ effect.name }}:</strong> {{ effect.description }}
                </li>
              </ul>
            </div>
            
            <button class="action-btn" @click="gameStore.advancePhase()">
              Continue to Threat Assessment
            </button>
          </div>
          
          <!-- Threat Level Check Phase -->
          <div v-else-if="gameStore.currentPhase === GamePhase.THREAT_LEVEL_CHECK" class="threat-assessment">
            <h2>Threat Level Check</h2>
            <p>Current Threat Level: {{ gameStore.threatLevel }}</p>
            <p>Threat Tokens: {{ gameStore.threatTokens }}</p>
            
            <div class="threat-effects">
              <h3>Threat Effects:</h3>
              <ul>
                <li>Challenge difficulty: +{{ gameStore.threatLevel }}</li>
                <li v-if="gameStore.threatTokens >= 10" class="danger">
                  DANGER: Otherworldly Manifestation likely
                </li>
                <li v-else-if="gameStore.threatTokens >= 5" class="warning">
                  WARNING: Random events likely
                </li>
              </ul>
            </div>
            
            <button class="action-btn" @click="handleThreatCheck">
              Assess Threats
            </button>
          </div>
          
          <!-- Landscape Challenge Phase -->
          <div v-else-if="gameStore.currentPhase === GamePhase.LANDSCAPE_CHALLENGE" class="landscape-challenge">
            <h2>Landscape Challenge</h2>
            <p>You are at {{ currentLandscape?.name || 'an unknown location' }}.</p>
            
            <div class="challenge-details" v-if="currentLandscape">
              <div class="challenge-info">
                <h3>{{ currentChallenge?.name || 'Challenge' }}</h3>
                <p>{{ currentChallenge?.description || 'No description available' }}</p>
                <p><strong>Difficulty:</strong> {{ getChallengeDifficulty() }}</p>
                <p><strong>Type:</strong> {{ currentChallenge?.type || 'Unknown' }}</p>
              </div>
              
              <div class="challenge-actions">
                <button class="action-btn" @click="resolveChallenge">
                  Attempt to Resolve
                </button>
                <button class="action-btn secondary" @click="avoidChallenge">
                  Avoid Challenge (Costs 1 Health)
                </button>
              </div>
            </div>
          </div>
          
          <!-- Challenge Resolution Phase -->
          <div v-else-if="gameStore.currentPhase === GamePhase.CHALLENGE_RESOLUTION" class="challenge-resolution">
            <h2>Challenge Resolution</h2>
            <div v-if="lastChallengeResult">
              <h3>{{ lastChallengeResult.success ? 'Success!' : lastChallengeResult.partialSuccess ? 'Partial Success' : 'Failure!' }}</h3>
              <p>{{ lastChallengeResult.message }}</p>
              
              <div v-if="lastChallengeResult.success" class="success-results">
                <h4>Rewards:</h4>
                <p>Experience: +1</p>
                <p>You may now gather resources from this landscape.</p>
              </div>
              
              <div v-else-if="lastChallengeResult.partialSuccess" class="partial-success-results">
                <h4>Partial Rewards:</h4>
                <p>Experience: +{{ lastChallengeResult.partialSuccessExperience || 0 }}</p>
                <p>You may gather 1 resource from this landscape.</p>
                <p>Minor Setback: {{ lastChallengeResult.partialSuccessSetback }}</p>
              </div>
              
              <div v-else class="failure-results">
                <h4>Consequences:</h4>
                <p>Health: -{{ lastChallengeResult.damage || 1 }}</p>
                <p>You may try again or retreat.</p>
              </div>
              
              <button class="action-btn" @click="gameStore.advancePhase()">
                Continue
              </button>
            </div>
            <div v-else>
              <p>No active challenge resolution.</p>
              <button class="action-btn" @click="gameStore.advancePhase()">
                Continue
              </button>
            </div>
          </div>
          
          <!-- Resource Management Phase -->
          <div v-else-if="gameStore.currentPhase === GamePhase.RESOURCE_MANAGEMENT" class="resource-management">
            <h2>Resource Management</h2>
            <p>You can gather resources from this location.</p>
            
            <div class="available-resources" v-if="currentLandscape?.availableResources?.length">
              <h3>Available Resources:</h3>
              <ul>
                <li v-for="(resourceId, index) in currentLandscape.availableResources" :key="index">
                  {{ getResourceName(resourceId) }}
                </li>
              </ul>
            </div>
            
            <div class="inventory">
              <h3>Your Inventory:</h3>
              <p>Resources: {{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }}</p>
            </div>
            
            <button class="action-btn" 
                  @click="gatherResources" 
                  :disabled="playerStore.isResourceCapacityReached">
              Gather Resources
            </button>
            <button class="action-btn secondary" @click="gameStore.advancePhase()">
              Skip Gathering
            </button>
          </div>
          
          <!-- Healing and Recovery Phase -->
          <div v-else-if="gameStore.currentPhase === GamePhase.HEALING_RECOVERY" class="healing-recovery">
            <h2>Healing & Recovery</h2>
            <p>Current Health: {{ playerStore.health }}/{{ playerStore.maxHealth }}</p>
            
            <div class="healing-options">
              <h3>Recovery Options:</h3>
              <ul>
                <li>Basic healing: 1 health per turn</li>
                <li v-if="gameStore.currentSeason === Season.IMBOLC">
                  Seasonal bonus (Imbolc): +1 healing
                </li>
                <li v-if="gameStore.currentSeason === Season.LUGHNASADH">
                  Seasonal bonus (Lughnasadh): Double healing effectiveness
                </li>
                <li v-if="isHealingLocation">
                  Location bonus: +1 healing at this special location
                </li>
              </ul>
            </div>
            
            <button class="action-btn" @click="performHealing">
              Rest & Recover
            </button>
          </div>
          
          <!-- Other phase content -->
          <div v-else class="default-phase">
            <h2>{{ gameStore.currentPhase }}</h2>
            <p>This phase is under development.</p>
            
            <button class="action-btn" @click="gameStore.advancePhase()">
              Continue
            </button>
          </div>
        </div>
        
        <div class="game-controls">
          <button class="control-btn" @click="gameStore.advancePhase()">Next Phase</button>
          <button class="control-btn danger" @click="endJourney">End Journey</button>
        </div>
      </div>
    </div>
    
    <!-- Game Log -->
    <div class="game-log">
      <h2>Game Log</h2>
      <div class="log-entries">
        <div v-for="(entry, index) in gameStore.gameLog" :key="index" 
            class="log-entry" 
            :class="{ 'highlighted': entry.highlight }">
          <div class="log-message">{{ entry.message }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/playerStore';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import { ChallengeType } from '@/models/enums/cardTypes';
import type { ResourceCard, LandscapeCard } from '@/models/types/cards';

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

// Computed properties
const currentCharacter = computed(() => {
  if (!playerStore.characterId) return null;
  return cardStore.characters.find(char => char.id === playerStore.characterId);
});

const currentChallenge = computed(() => {
  if (!gameStore.currentChallenge) return null;
  return cardStore.getChallengeById(gameStore.currentChallenge);
});

const currentLandscape = computed<LandscapeCard | null>(() => {
  return gameStore.currentLandscape;
});

const currentSeasonCard = computed(() => {
  return gameStore.currentSeasonCard;
});

// State for challenge resolution
const lastChallengeResult = ref<ChallengeResult | null>(null);

// Check if current location is a healing location
const isHealingLocation = computed(() => {
  if (!currentLandscape.value) return false;
  return ['Sacred Oak Grove', 'Druid\'s Sanctuary', 'Moonlit Loch'].includes(currentLandscape.value.name);
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

const performHealing = () => {
  // Use the healing recovery handler in gameStore
  gameStore.handleHealingRecovery();
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
  return season.toString().replace('_', ' ');
};
</script>

<style lang="scss" scoped>
.game-container {
  max-width: 1200px;
  width: 100%;
  margin: 0 auto;
  padding: 1rem;
}

.game-title {
  font-size: 2.5rem;
  color: #5c3d2e;
  margin-bottom: 0.5rem;
  text-align: center;
}

.current-phase {
  background-color: rgba(92, 61, 46, 0.8);
  color: white;
  padding: 0.3rem 0.5rem;
  border-radius: 3px;
  text-align: center;
  margin-bottom: 0.5rem;
  font-weight: bold;
}

.game-board {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  
  &__content {
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    padding: 0.5rem;
    
    h2 {
      color: #5c3d2e;
      font-size: 1.2rem;
      margin-bottom: 0.5rem;
      border-bottom: 1px solid #d9c5a0;
      padding-bottom: 0.2rem;
    }
  }
  
  &__phase-content {
    display: flex;
    flex-direction: column;
  }
}

.player-status-horizontal {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  
  h2 {
    color: #5c3d2e;
    font-size: 1.2rem;
    margin-right: 1rem;
    margin-bottom: 0;
    white-space: nowrap;
  }
  
  .status-items {
    display: flex;
    flex-wrap: nowrap;
    gap: 0.5rem;
    
    .status-item {
      display: flex;
      flex-direction: row;
      align-items: center;
      padding: 0.3rem;
      border: 1px solid #d9c5a0;
      border-radius: 3px;
      
      .status-icon {
        font-size: 1.2rem;
        margin-right: 0.5rem;
      }
      
      .status-value {
        color: #5c3d2e;
      }
    }
  }
}

.game-log {
  margin-top: 1rem;
  background-color: #f8f8f8;
  border: 1px solid #dddddd;
  border-radius: 5px;
  padding: 0.5rem;
  
  h2 {
    font-size: 1.2rem;
    color: #5c3d2e;
    margin-bottom: 0.5rem;
    border-bottom: 1px solid #d9c5a0;
    padding-bottom: 0.2rem;
  }
  
  .log-entries {
    max-height: 200px;
    overflow-y: auto;
    
    .log-entry {
      padding: 0.2rem;
      margin-bottom: 0.2rem;
      font-size: 0.9rem;
      color: #666666;
      
      &.highlighted {
        background-color: rgba(92, 61, 46, 0.1);
        border-left: 2px solid #5c3d2e;
        padding-left: 0.5rem;
      }
    }
  }
}

.action-btn, .control-btn {
  background-color: #5c3d2e;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  
  &:hover {
    background-color: darken(#5c3d2e, 10%);
  }
  
  &.danger {
    background-color: #8b0000;
    
    &:hover {
      background-color: darken(#8b0000, 10%);
    }
  }
  
  &.secondary {
    background-color: #666666;
    
    &:hover {
      background-color: darken(#666666, 10%);
    }
  }
}

.game-controls {
  display: flex;
  justify-content: space-between;
  margin-top: 1rem;
}

.seasonal-assessment, .default-phase {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  border: 1px solid #d9c5a0;
  
  h2 {
    color: #5c3d2e;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: #6a5d4d;
    margin-bottom: 1rem;
  }
}

.landscape-challenge {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  border: 1px solid #d9c5a0;
  
  h2 {
    color: #5c3d2e;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .challenge-details {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    
    .challenge-info {
      h3 {
        font-size: 1.2rem;
        margin-bottom: 0.2rem;
      }
      
      p {
        font-size: 0.9rem;
        color: #666666;
      }
    }
    
    .challenge-actions {
      display: flex;
      gap: 0.5rem;
    }
  }
}

.threat-assessment {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  border: 1px solid #d9c5a0;
  
  h2 {
    color: #5c3d2e;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .threat-effects {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        font-size: 0.9rem;
        color: #666666;
        
        &.danger {
          color: #8b0000;
        }
        
        &.warning {
          color: #ff9900;
        }
      }
    }
  }
}

.challenge-resolution {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  border: 1px solid #d9c5a0;
  
  h2 {
    color: #5c3d2e;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .success-results, .partial-success-results, .failure-results {
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    border: 1px solid #d9c5a0;
    
    h4 {
      font-size: 1.2rem;
      margin-bottom: 0.2rem;
    }
    
    p {
      font-size: 0.9rem;
      color: #666666;
    }
  }
}

.resource-management {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  border: 1px solid #d9c5a0;
  
  h2 {
    color: #5c3d2e;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .available-resources {
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    border: 1px solid #d9c5a0;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.2rem;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        font-size: 0.9rem;
        color: #666666;
      }
    }
  }
  
  .inventory {
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    border: 1px solid #d9c5a0;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.2rem;
    }
    
    p {
      font-size: 0.9rem;
      color: #666666;
    }
  }
}

.healing-recovery {
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 5px;
  border: 1px solid #d9c5a0;
  
  h2 {
    color: #5c3d2e;
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
  }
  
  .healing-options {
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.8);
    border-radius: 5px;
    border: 1px solid #d9c5a0;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.2rem;
    }
    
    ul {
      list-style: none;
      padding: 0;
      margin: 0;
      
      li {
        font-size: 0.9rem;
        color: #666666;
      }
    }
  }
}
</style>
