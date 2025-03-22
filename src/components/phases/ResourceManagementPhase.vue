<template>
  <div class="resource-management-phase">
    <h2 class="phase-title">RESOURCE MANAGEMENT</h2>
    <div class="phase-description">
      <p>Manage your resources and gather new ones.</p>
    </div>
    
    <!-- Reusing existing ResourceManagement component -->
    <ResourceManagement />
    
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
import ResourceManagement from '@/components/game/ResourceManagement.vue';

const gameStore = useGameStore();
const { phaseService, resourceService } = useServices();

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.resource-management-phase {
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
