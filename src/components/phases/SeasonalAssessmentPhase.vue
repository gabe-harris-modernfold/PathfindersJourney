<template>
  <div class="seasonal-assessment-phase">
    <h2 class="phase-title">SEASONAL ASSESSMENT</h2>
    <div class="phase-description">
      <p>The current season is {{ formatSeason(gameStore.currentSeason) }}.</p>
      <p>The seasons affect which resources are available and the effectiveness of your animal companions.</p>
    </div>
    <GameCard 
      title="Continue Journey" 
      cardType="ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Proceed to the next phase of your adventure
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';
import { Season } from '@/models/enums/seasons';

const gameStore = useGameStore();
const { phaseService } = useServices();

// Format season for display
const formatSeason = (season: Season | string): string => {
  if (typeof season === 'string') {
    return season.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  } else {
    return String(season).split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.seasonal-assessment-phase {
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
