<template>
  <div class="exploration-phase">
    <h2 class="phase-title">EXPLORATION</h2>
    <div class="phase-description">
      <p v-if="currentLandscape">You are exploring {{ currentLandscape.name }}. What will you discover?</p>
      <p v-else>Choose a landscape to explore.</p>
    </div>
    
    <GameCard 
      title="Continue Exploration" 
      :cardType="CardType.ACTION"
      @click="completeExploration"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Complete exploration and move to next phase
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useLogStore } from '@/stores/logStore';
import { useJourneyStore } from '@/stores/journeyStore';
import { useCardStore } from '@/stores/cardStore';
import { GamePhase } from '@/models/enums/phases';
import { CardType } from '@/models/enums/cardTypes';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const logStore = useLogStore();
const journeyStore = useJourneyStore();
const cardStore = useCardStore();

// Add diagnostics to game log on component mount
onMounted(() => {
});

// Get the current landscape
const currentLandscape = computed(() => {
  if (!gameStore.currentLandscapeId) return null;
  return cardStore.getLandscapeById(gameStore.currentLandscapeId);
});

// Normal phase progression
const completeExploration = () => {
  gameStore.advancePhase();
};

// Debug function to force jump to the next landscape and seasonal assessment
const debugJumpToNextLandscape = () => {
  // Check if there's another landscape to move to
  if (!journeyStore.journeyPath || journeyStore.journeyPath.length === 0) {
    return;
  }
  
  if (gameStore.journeyProgress >= journeyStore.journeyPath.length - 1) {
    return;
  }
  
  // Try to move to the next landscape
  const nextIndex = gameStore.journeyProgress + 1;
  const nextLandscapeId = journeyStore.journeyPath[nextIndex];
  const nextLandscape = cardStore.getLandscapeById(nextLandscapeId);
  
  if (!nextLandscape) {
    return;
  }
  
  // Complete exploration of current landscape
  if (currentLandscape.value) {
    logStore.addToGameLog(`You have completed your exploration of ${currentLandscape.value.name}.`, true, 'phase');
  }
  
  // Update game state
  gameStore.journeyProgress = nextIndex;
  gameStore.currentLandscapeId = nextLandscapeId;
  
  // Add to visited landscapes
  if (!gameStore.visitedLandscapes.includes(nextLandscapeId)) {
    gameStore.visitedLandscapes.push(nextLandscapeId);
  }
  
  // Log arrival
  logStore.addToGameLog(`Arrived at ${nextLandscape.name}.`, true, 'phase');
  
  // Set phase to Seasonal Assessment
  const oldPhase = gameStore.currentPhase;
  gameStore.currentPhase = GamePhase.SEASONAL_ASSESSMENT;
  
  // Log phase change
  logStore.addToGameLog(`Entering the Seasonal Assessment phase.`, true, 'phase');
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
