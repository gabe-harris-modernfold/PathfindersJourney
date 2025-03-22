<template>
  <div class="journey-progression-phase">
    <h2 class="phase-title">JOURNEY PROGRESSION</h2>
    <div class="phase-description">
      <p>You are ready to journey to the next landscape.</p>
      
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
      
      <div v-else>
        <GameCard 
          title="Continue Journey" 
          cardType="ACTION"
          @click="advancePhase"
        >
          <div style="font-size: 1.1rem; padding: 10px;">
            Begin the next turn of your adventure
          </div>
        </GameCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';
import { CardType } from '@/models/enums/cardTypes';

const gameStore = useGameStore();
const { phaseService, journeyService, cardRepository } = useServices();

// Get the next landscape
const nextLandscape = computed(() => {
  const nextId = journeyService.getNextLandscapeId();
  return nextId ? cardRepository.getLandscapeById(nextId) : null;
});

// Start new turn by moving to the next landscape
const startNewTurn = () => {
  journeyService.startNewTurn();
  phaseService.setPhase(phaseService.getCurrentPhase());
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
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
</style>
