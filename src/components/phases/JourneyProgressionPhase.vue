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
          <div class="action-text">
            Click to journey to this location
          </div>
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

      <!-- Always show this button as a fallback -->
      <div class="fallback-action" style="margin-top: 20px;">
        <button @click="forceAdvanceToExploration" class="fallback-button">
          Continue Adventure
        </button>
      </div>
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
  width: 100%;
}

.next-landscape {
  margin-top: 1rem;
  width: 100%;
}

.action-text {
  font-weight: bold;
  margin-top: 10px;
  text-align: center;
  color: #5a3e2b;
}

.fallback-button {
  background-color: #4a543f;
  color: #fff;
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: bold;
  margin-top: 10px;
  
  &:hover {
    background-color: #5a644f;
  }
}

.fallback-action {
  text-align: center;
  padding: 15px;
  border: 1px dashed #9b9b9b;
  border-radius: 4px;
  background-color: rgba(0, 0, 0, 0.05);
}

.current-exploration {
  margin-top: 1rem;
  width: 100%;
}
</style>
