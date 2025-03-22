<template>
  <div class="challenge-resolution-phase">
    <h2 class="phase-title">CHALLENGE OUTCOME</h2>
    
    <div v-if="lastChallengeResult" class="challenge-result" :class="{ 
      'success': lastChallengeResult.success, 
      'partial-success': lastChallengeResult.partialSuccess,
      'failure': !lastChallengeResult.success && !lastChallengeResult.partialSuccess
    }">
      <h3>{{ lastChallengeResult.success ? 'Success!' : lastChallengeResult.partialSuccess ? 'Partial Success' : 'Failure' }}</h3>
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
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const { phaseService, challengeService } = useServices();

// Get the last challenge result from the challenge service
const lastChallengeResult = computed(() => {
  return challengeService.getLastChallengeResult();
});

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
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
}

.challenge-result {
  margin: 1rem 0;
  padding: 1rem;
  width: 100%;
  text-align: center;
  border-radius: 0.5rem;
  
  &.success {
    background-color: rgba(0, 128, 0, 0.2);
  }
  
  &.partial-success {
    background-color: rgba(255, 165, 0, 0.2);
  }
  
  &.failure {
    background-color: rgba(255, 0, 0, 0.2);
  }
}
</style>
