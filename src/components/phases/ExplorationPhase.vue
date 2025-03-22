<template>
  <div class="exploration-phase">
    <h2 class="phase-title">EXPLORATION</h2>
    <div class="phase-description">
      <p v-if="currentLandscape">You are exploring {{ currentLandscape.name }}. What will you discover?</p>
      <p v-else>Choose a landscape to explore.</p>
    </div>
    
    <GameCard 
      title="Continue to Next Phase" 
      cardType="ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Proceed with your exploration
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useLogStore } from '@/stores/logStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const logStore = useLogStore();
const { phaseService, cardRepository } = useServices();

// Get the current landscape
const currentLandscape = computed(() => {
  if (!gameStore.currentLandscapeId) return null;
  return cardRepository.getLandscapeById(gameStore.currentLandscapeId);
});

// Advance to the next phase
const advancePhase = () => {
  if (currentLandscape.value) {
    logStore.addToGameLog(`You have completed your exploration of ${currentLandscape.value.name}.`, true, 'phase');
  }
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.exploration-phase {
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

.phase-description {
  text-align: center;
  margin-bottom: 1.5rem;
}
</style>
