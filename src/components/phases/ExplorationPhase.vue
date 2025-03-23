<template>
  <div class="exploration-phase">
    <h2 class="phase-title">EXPLORATION</h2>
    <div class="phase-description">
      <p v-if="currentLandscape">You are exploring {{ currentLandscape.name }}. What will you discover?</p>
      <p v-else>Choose a landscape to explore.</p>
    </div>
    
    <GameCard 
      title="Continue Exploration" 
      cardType="ACTION"
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
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const logStore = useLogStore();
const journeyStore = useJourneyStore();
const cardStore = useCardStore();

// Add diagnostics to game log on component mount
onMounted(() => {
  // Add extensive debug info to log
  logStore.addToGameLog(`[DEBUG] ExplorationPhase Component Mounted`, false, 'debug');
  logStore.addToGameLog(`[DEBUG] Current Phase: ${gameStore.currentPhase}`, false, 'debug');
  logStore.addToGameLog(`[DEBUG] Current Landscape ID: ${gameStore.currentLandscapeId}`, false, 'debug');
  logStore.addToGameLog(`[DEBUG] Journey Progress: ${gameStore.journeyProgress} / ${journeyStore.journeyPath?.length - 1}`, false, 'debug');
  
  // Log journey path details
  if (journeyStore.journeyPath && journeyStore.journeyPath.length > 0) {
    const pathInfo = journeyStore.journeyPath.map((id, index) => {
      const landscape = cardStore.getLandscapeById(id);
      return `${index}: ${landscape?.name || 'Unknown'} (${id})`;
    }).join('; ');
    logStore.addToGameLog(`[DEBUG] Journey Path: ${pathInfo}`, false, 'debug');
  } else {
    logStore.addToGameLog(`[DEBUG] Journey Path is empty or undefined`, false, 'debug');
  }
  
  // Log visited landscapes
  if (gameStore.visitedLandscapes && gameStore.visitedLandscapes.length > 0) {
    logStore.addToGameLog(`[DEBUG] Visited Landscapes: ${gameStore.visitedLandscapes.join(', ')}`, false, 'debug');
  }
});

// Get the current landscape
const currentLandscape = computed(() => {
  if (!gameStore.currentLandscapeId) return null;
  return cardStore.getLandscapeById(gameStore.currentLandscapeId);
});

// Normal phase progression
const completeExploration = () => {
  logStore.addToGameLog(`[DEBUG] Normal Phase Advancement Initiated`, false, 'debug');
  
  if (currentLandscape.value) {
    logStore.addToGameLog(`[DEBUG] Current Landscape: ${currentLandscape.value.name}`, false, 'debug');
  }
  
  // Just use the standard phase advancement
  logStore.addToGameLog(`[DEBUG] Calling gameStore.advancePhase()`, false, 'debug');
  gameStore.advancePhase();
};

// Debug function to force jump to the next landscape and seasonal assessment
const debugJumpToNextLandscape = () => {
  logStore.addToGameLog(`[DEBUG] Debug Landscape Jump Initiated`, false, 'debug');
  
  // Log current state
  if (currentLandscape.value) {
    logStore.addToGameLog(`[DEBUG] Current Landscape: ${currentLandscape.value.name}`, false, 'debug');
  }
  logStore.addToGameLog(`[DEBUG] Current Journey Progress: ${gameStore.journeyProgress}`, false, 'debug');
  
  // Check if there's another landscape to move to
  if (!journeyStore.journeyPath || journeyStore.journeyPath.length === 0) {
    logStore.addToGameLog(`[DEBUG] ERROR: Journey path is empty or undefined!`, false, 'debug');
    return;
  }
  
  if (gameStore.journeyProgress >= journeyStore.journeyPath.length - 1) {
    logStore.addToGameLog(`[DEBUG] ERROR: Already at the last landscape in journey path!`, false, 'debug');
    return;
  }
  
  // Try to move to the next landscape
  const nextIndex = gameStore.journeyProgress + 1;
  const nextLandscapeId = journeyStore.journeyPath[nextIndex];
  const nextLandscape = cardStore.getLandscapeById(nextLandscapeId);
  
  logStore.addToGameLog(`[DEBUG] Next index: ${nextIndex}, Next ID: ${nextLandscapeId}`, false, 'debug');
  
  if (!nextLandscape) {
    logStore.addToGameLog(`[DEBUG] ERROR: Could not find next landscape with ID: ${nextLandscapeId}`, false, 'debug');
    return;
  }
  
  logStore.addToGameLog(`[DEBUG] Found next landscape: ${nextLandscape.name}`, false, 'debug');
  
  // Complete exploration of current landscape
  if (currentLandscape.value) {
    logStore.addToGameLog(`You have completed your exploration of ${currentLandscape.value.name}.`, true, 'phase');
  }
  
  // Update game state
  gameStore.journeyProgress = nextIndex;
  logStore.addToGameLog(`[DEBUG] Updated journeyProgress to ${nextIndex}`, false, 'debug');
  
  gameStore.currentLandscapeId = nextLandscapeId;
  logStore.addToGameLog(`[DEBUG] Updated currentLandscapeId to ${nextLandscapeId}`, false, 'debug');
  
  // Add to visited landscapes
  if (!gameStore.visitedLandscapes.includes(nextLandscapeId)) {
    gameStore.visitedLandscapes.push(nextLandscapeId);
    logStore.addToGameLog(`[DEBUG] Added ${nextLandscapeId} to visitedLandscapes`, false, 'debug');
  }
  
  // Log arrival
  logStore.addToGameLog(`Arrived at ${nextLandscape.name}.`, true, 'phase');
  
  // Set phase to Seasonal Assessment
  const oldPhase = gameStore.currentPhase;
  gameStore.currentPhase = GamePhase.SEASONAL_ASSESSMENT;
  logStore.addToGameLog(`[DEBUG] Changed phase from ${oldPhase} to ${gameStore.currentPhase}`, false, 'debug');
  
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
