<template>
  <div class="crafting-phase">
    <h2 class="phase-title">CRAFTING</h2>
    <div class="phase-description">
      <p>Craft items using your gathered resources.</p>
    </div>
    
    <!-- Reusing existing CraftingStation component -->
    <CraftingStation />
    
    <GameCard 
      title="Continue Journey" 
      cardType="ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Proceed to the next phase
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';
import CraftingStation from '@/components/game/CraftingStation.vue';

const gameStore = useGameStore();
const { phaseService } = useServices();

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.crafting-phase {
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
