<template>
  <div class="journey-progression-phase">
    <h2 class="phase-title">JOURNEY PROGRESSION</h2>
    <div class="phase-description">
      <p>Prepare for the next step in your adventure.</p>
      
      <div v-if="nextLandscape" class="next-landscape">
        <GameCard 
          :title="nextLandscape.name" 
          subtitle="Next Landscape"
          :cardType="CardType.LANDSCAPE"
          @click="startNewTurn"
        >
          <p>{{ nextLandscape.description }}</p>
        </GameCard>
      </div>
      
      <div v-else class="current-exploration">
        <GameCard 
          title="Explore Current Area" 
          cardType="ACTION"
          @click="advanceToExploration"
        >
          <div style="font-size: 1.1rem; padding: 10px;">
            Continue exploring your current location
          </div>
        </GameCard>
      </div>

      <!-- Removed redundant fallback button -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import GameCard from '../GameCard.vue';  
import { CardType } from '@/models/enums/cardTypes';

const gameStore = useGameStore();
const cardStore = useCardStore();
const { phaseService, journeyService } = useServices();

// Get the next landscape
const nextLandscape = computed(() => {
  const nextId = journeyService.getNextLandscapeId();
  if (!nextId) return null;
  
  return cardStore.getLandscapeById(nextId);
});

// Start new turn by moving to the next landscape
const startNewTurn = () => {
  // Start the new turn
  journeyService.startNewTurn();
  
  // Force the game store to update in the UI by logging a state change
  const currentTurn = gameStore.currentTurn;
  console.log(`Current turn: ${currentTurn}`);
  
  // After starting a new turn, advance to exploration phase
  phaseService.advanceToExploration();
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};

// Advance to exploration phase
const advanceToExploration = () => {
  phaseService.advanceToExploration();
};

// Force advance to exploration phase
const forceAdvanceToExploration = () => {
  phaseService.forceAdvanceToExploration();
};
</script>

<style lang="scss" scoped>
.journey-progression-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .phase-title {
    text-align: center;
    margin-bottom: 2rem;
    font-family: 'Cinzel', serif;
    color: #4a7c59;
  }
  
  .phase-description {
    text-align: center;
    margin-bottom: 2rem;
    max-width: 720px;
  }
  
  .next-landscape, 
  .current-exploration {
    display: flex;
    justify-content: center;
    margin: 2rem auto;
    max-width: 300px;
    
    :deep(p) {
      text-align: center;
    }
  }
  
  .landscape-button,
  .exploration-button {
    width: 100%;
    margin-top: 2rem;
    display: flex;
    justify-content: center;
  }
}
</style>
