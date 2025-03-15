<template>
  <div class="action-panel" style="border: 2px solid lightblue; position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">ActionPanel</div>
    <h2 class="action-panel__title">Actions</h2>
    
    <div class="action-panel__phase-info">
      <div class="action-panel__current-phase">
        <span>Current Phase:</span>
        <strong>{{ formatPhase(phase) }}</strong>
      </div>
      <div class="action-panel__turn">
        <span>Turn:</span>
        <strong>{{ gameStore.currentTurn }}</strong>
      </div>
    </div>
    
    <div class="action-panel__actions">
      <!-- Setup Phase -->
      <div v-if="phase === 'SETUP'" class="action-panel__phase-actions">
        <p>Select your character and prepare for your journey.</p>
        <button class="action-panel__button" @click="startJourney">
          Begin Journey
        </button>
      </div>
      
      <!-- Seasonal Assessment Phase -->
      <div v-else-if="phase === 'SEASONAL_ASSESSMENT'" class="action-panel__phase-actions">
        <p>The season is {{ formatSeason(gameStore.currentSeason) }}.</p>
        <p>Assess the seasonal effects on your journey.</p>
        <button class="action-panel__button" @click="completePhase">
          Continue
        </button>
      </div>
      
      <!-- Threat Check Phase -->
      <div v-else-if="phase === 'THREAT_CHECK'" class="action-panel__phase-actions">
        <p>Current Threat Level: {{ Math.floor(gameStore.threatTokens / 3) }}</p>
        <p>Threat Tokens: {{ gameStore.threatTokens }}</p>
        <button class="action-panel__button" @click="checkThreats">
          Check for Threats
        </button>
      </div>
      
      <!-- Landscape Challenge Phase -->
      <div v-else-if="phase === 'LANDSCAPE_CHALLENGE'" class="action-panel__phase-actions">
        <p>Face the challenges of this landscape.</p>
        <button class="action-panel__button" @click="attemptChallenge">
          Attempt Challenge
        </button>
        <button class="action-panel__button action-panel__button--secondary" @click="skipChallenge">
          Skip (Gain Threat Token)
        </button>
      </div>
      
      <!-- Challenge Resolution Phase -->
      <div v-else-if="phase === 'CHALLENGE_RESOLUTION'" class="action-panel__phase-actions">
        <p>Resolve the outcome of your challenge.</p>
        <div v-if="lastChallengeResult" class="action-panel__result">
          <div class="action-panel__result-header" :class="`action-panel__result-header--${lastChallengeResult.outcome}`">
            {{ formatOutcome(lastChallengeResult.outcome) }}
          </div>
          <div class="action-panel__result-details">
            <p>{{ lastChallengeResult.description }}</p>
            <div v-if="lastChallengeResult.rewards" class="action-panel__rewards">
              <span>Rewards:</span>
              <ul>
                <li v-for="(reward, index) in lastChallengeResult.rewards" :key="index">
                  {{ reward }}
                </li>
              </ul>
            </div>
          </div>
        </div>
        <button class="action-panel__button" @click="completePhase">
          Continue
        </button>
      </div>
      
      <!-- Resource Management Phase -->
      <div v-else-if="phase === 'RESOURCE_MANAGEMENT'" class="action-panel__phase-actions">
        <p>Manage your resources and gather what you need.</p>
        <button class="action-panel__button" @click="gatherResources">
          Gather Resources
        </button>
        <button class="action-panel__button action-panel__button--secondary" @click="completePhase">
          Skip Gathering
        </button>
      </div>
      
      <!-- Animal Companion Phase -->
      <div v-else-if="phase === 'ANIMAL_COMPANION'" class="action-panel__phase-actions">
        <p>Bond with animal companions or tend to existing ones.</p>
        <button 
          class="action-panel__button" 
          @click="bondWithCompanion"
          :disabled="playerStore.animalCompanions.length >= playerStore.maxCompanions"
        >
          Bond with Companion
        </button>
        <button 
          class="action-panel__button action-panel__button--secondary" 
          @click="tendToCompanions"
          :disabled="playerStore.animalCompanions.length === 0"
        >
          Tend to Companions
        </button>
        <button class="action-panel__button action-panel__button--tertiary" @click="completePhase">
          Skip
        </button>
      </div>
      
      <!-- Crafting Phase -->
      <div v-else-if="phase === 'CRAFTING'" class="action-panel__phase-actions">
        <p>Craft items from your gathered resources.</p>
        <button class="action-panel__button" @click="craftItems">
          Craft Items
        </button>
        <button class="action-panel__button action-panel__button--secondary" @click="completePhase">
          Skip Crafting
        </button>
      </div>
      
      <!-- Journey Progression Phase -->
      <div v-else-if="phase === 'JOURNEY_PROGRESSION'" class="action-panel__phase-actions">
        <p>Continue your journey to a new landscape.</p>
        <button class="action-panel__button" @click="moveToNextLandscape">
          Continue Journey
        </button>
        <button class="action-panel__button action-panel__button--secondary" @click="stayAtCurrentLandscape">
          Stay Here (Rest)
        </button>
      </div>
      
      <!-- Game Over Phase -->
      <div v-else-if="phase === 'GAME_OVER'" class="action-panel__phase-actions">
        <p v-if="gameStore.isVictory">Congratulations on completing your journey!</p>
        <p v-else>Your journey has ended. {{ gameStore.gameOverReason }}</p>
        <button class="action-panel__button" @click="startNewJourney">
          Start New Journey
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';

const props = defineProps<{
  phase: string;
}>();

const router = useRouter();
const gameStore = useGameStore();
const playerStore = usePlayerStore();

const lastChallengeResult = ref(null);

function formatPhase(phase: string): string {
  return phase
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, l => l.toUpperCase());
}

function formatSeason(season: string): string {
  const seasonMap = {
    'SAMHAIN': 'Samhain',
    'WINTERS_DEPTH': "Winter's Depth",
    'IMBOLC': 'Imbolc',
    'BELTANE': 'Beltane',
    'LUGHNASADH': 'Lughnasadh'
  };
  return seasonMap[season] || season;
}

function formatOutcome(outcome: string): string {
  const outcomeMap = {
    'SUCCESS': 'Success!',
    'PARTIAL_SUCCESS': 'Partial Success',
    'FAILURE': 'Failure'
  };
  return outcomeMap[outcome] || outcome;
}

function startJourney(): void {
  gameStore.startJourney();
}

function completePhase(): void {
  gameStore.advanceToNextPhase();
}

function checkThreats(): void {
  // This would typically call the threatService
  gameStore.checkThreats();
  completePhase();
}

function attemptChallenge(): void {
  // This would typically call the challengeService
  const result = gameStore.resolveCurrentChallenge();
  lastChallengeResult.value = result;
  gameStore.advanceToNextPhase();
}

function skipChallenge(): void {
  gameStore.addThreatTokens(1);
  gameStore.advanceToNextPhase();
}

function gatherResources(): void {
  // This would typically call the resourceService
  gameStore.gatherResources();
  completePhase();
}

function bondWithCompanion(): void {
  // Open companion selection modal or navigate to companion view
  gameStore.setActiveView('COMPANION_SELECTION');
}

function tendToCompanions(): void {
  // Open companion management modal or navigate to companion view
  gameStore.setActiveView('COMPANION_MANAGEMENT');
}

function craftItems(): void {
  // Open crafting modal or navigate to crafting view
  gameStore.setActiveView('CRAFTING_STATION');
}

function moveToNextLandscape(): void {
  // This would typically call the journeyService
  gameStore.moveToNextLandscape();
  completePhase();
}

function stayAtCurrentLandscape(): void {
  // Rest at current landscape (heal, etc.)
  playerStore.heal(1);
  completePhase();
}

function startNewJourney(): void {
  gameStore.resetGame();
  router.push('/setup');
}
</script>

<style lang="scss" scoped>
.action-panel {
  background: rgba(240, 230, 210, 0.5);
  border-radius: 8px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  &__title {
    margin-top: 0;
    color: #5c4d3c;
    border-bottom: 2px solid #8c7851;
    padding-bottom: 0.5rem;
  }
  
  &__phase-info {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    font-size: 0.9rem;
    
    strong {
      color: #5c4d3c;
    }
  }
  
  &__actions {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  &__phase-actions {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    
    p {
      margin: 0;
    }
  }
  
  &__button {
    background: #6b8e23;
    color: white;
    border: none;
    padding: 0.75rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s ease;
    
    &:hover:not(:disabled) {
      background: #556b2f;
    }
    
    &:disabled {
      background: #a9a9a9;
      cursor: not-allowed;
    }
    
    &--secondary {
      background: #8c7851;
      
      &:hover:not(:disabled) {
        background: #6a5a3d;
      }
    }
    
    &--tertiary {
      background: transparent;
      color: #5c4d3c;
      border: 1px solid #8c7851;
      
      &:hover:not(:disabled) {
        background: rgba(140, 120, 81, 0.1);
      }
    }
  }
  
  &__result {
    margin: 0.5rem 0;
    border-radius: 4px;
    overflow: hidden;
    
    &-header {
      padding: 0.5rem;
      color: white;
      font-weight: bold;
      text-align: center;
      
      &--SUCCESS {
        background: #6b8e23;
      }
      
      &--PARTIAL_SUCCESS {
        background: #d4a017;
      }
      
      &--FAILURE {
        background: #8b0000;
      }
    }
    
    &-details {
      padding: 0.75rem;
      background: rgba(255, 255, 255, 0.5);
      
      p {
        margin: 0 0 0.5rem 0;
      }
    }
  }
  
  &__rewards {
    font-size: 0.9rem;
    
    span {
      font-weight: bold;
    }
    
    ul {
      margin: 0.25rem 0 0 0;
      padding-left: 1.5rem;
    }
  }
}
</style>
