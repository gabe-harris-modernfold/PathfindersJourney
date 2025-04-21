<template>
  <div class="exploration-phase">
    <div class="landscape-image-container" v-if="currentLandscape">
      <img :src="getLandscapeImagePath()" class="landscape-image" />
    </div>
    <div class="landscape-overlay"></div>
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

// Get landscape image path
const getLandscapeImagePath = () => {
  if (!currentLandscape.value || !currentLandscape.value.image) return '';
  // Dynamically require the image based on the path stored in the landscape data
  // Ensure the path in your data (e.g., 'landscapes/forest.jpg') matches the actual file structure
  return require(`@/assets/images/${currentLandscape.value.image}`);
};

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
  position: relative; /* Added for positioning context */
  min-height: 500px; /* Added to ensure container has height */
}

.landscape-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.landscape-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.landscape-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Adjust alpha (last value) for desired transparency */
  background-color: rgba(240, 230, 210, 0.75); 
  z-index: 1;
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
  position: relative; /* Added for stacking */
  z-index: 2; /* Ensure title is above overlay */
}

.phase-description {
  text-align: center;
  margin-bottom: 1.5rem;
  position: relative; /* Added for stacking */
  z-index: 2; /* Ensure description is above overlay */
}

/* Ensure GameCard is also above the overlay */
:deep(.game-card) { 
  position: relative;
  z-index: 2;
}
</style>
