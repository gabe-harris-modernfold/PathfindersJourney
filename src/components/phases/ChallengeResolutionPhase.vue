<template>
  <div class="challenge-resolution-phase">
    <h2 class="phase-title">{{ currentLandscape ? currentLandscape.name : 'LANDSCAPE' }} - {{ currentLandscape ? currentLandscape.challenge : 'CHALLENGE' }}</h2>
    
    <div v-if="lastChallengeResult" class="challenge-result" :class="{ 
      'success': lastChallengeResult.success, 
      'partial-success': lastChallengeResult.partialSuccess,
      'failure': !lastChallengeResult.success && !lastChallengeResult.partialSuccess
    }">
      <h3>{{ getOutcomeTitle() }}</h3>
      
      <!-- Challenge Description from model -->
      <p>{{ currentLandscape?.description }}</p>
      
      <!-- Challenge outcome details -->
      <div class="challenge-details">
        <div class="detail-item">
          <span class="label">Challenge:</span>
          <span>{{ currentLandscape?.challenge }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Type:</span>
          <span>{{ currentLandscape?.challengeType }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Difficulty:</span>
          <span>{{ lastChallengeResult.difficulty }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Roll:</span>
          <span>{{ lastChallengeResult.roll }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Total:</span>
          <span>{{ lastChallengeResult.total }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Result:</span>
          <span class="result" :class="{
            'success-text': lastChallengeResult.success,
            'partial-text': lastChallengeResult.partialSuccess,
            'failure-text': !lastChallengeResult.success && !lastChallengeResult.partialSuccess
          }">
            {{ lastChallengeResult.success ? 'Success' : lastChallengeResult.partialSuccess ? 'Partial Success' : 'Failure' }}
          </span>
        </div>
      </div>
    </div>
    
    <GameCard 
      title="Continue to Next Phase" 
      cardType="ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1rem; padding: 5px;">
        Proceed with your journey
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const cardStore = useCardStore();
const { phaseService, challengeService } = useServices();

// Get the last challenge result from the challenge service
const lastChallengeResult = computed(() => {
  return challengeService.getLastChallengeResult();
});

// Get the current landscape
const currentLandscape = computed(() => {
  if (!gameStore.currentLandscapeId) return null;
  return cardStore.getLandscapeById(gameStore.currentLandscapeId);
});

// Get outcome title based on success/failure
const getOutcomeTitle = () => {
  if (!lastChallengeResult.value) return '';
  
  return lastChallengeResult.value.success ? 'Challenge Overcome' : 
         lastChallengeResult.value.partialSuccess ? 'Challenge Partially Overcome' : 
         'Challenge Failed';
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.challenge-resolution-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
  text-align: center;
}

.challenge-result {
  margin: 1rem 0;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
  border-radius: 0.5rem;
  
  h3 {
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  p {
    line-height: 1.5;
    margin-bottom: 1.5rem;
    text-align: left;
  }
  
  &.success {
    background-color: rgba(0, 128, 0, 0.1);
    border-left: 5px solid rgba(0, 128, 0, 0.5);
  }
  
  &.partial-success {
    background-color: rgba(255, 165, 0, 0.1);
    border-left: 5px solid rgba(255, 165, 0, 0.5);
  }
  
  &.failure {
    background-color: rgba(255, 0, 0, 0.1);
    border-left: 5px solid rgba(255, 0, 0, 0.5);
  }
}

.challenge-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  text-align: left;
  margin-top: 1rem;
  
  .detail-item {
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 0.25rem;
    
    .label {
      font-weight: bold;
      margin-right: 0.5rem;
    }
    
    .result {
      font-weight: bold;
      
      &.success-text {
        color: green;
      }
      
      &.partial-text {
        color: orange;
      }
      
      &.failure-text {
        color: red;
      }
    }
  }
}
</style>
