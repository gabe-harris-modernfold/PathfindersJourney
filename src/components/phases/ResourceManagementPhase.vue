<template>
  <div class="resource-management-phase">
    <h2 class="phase-title">RESOURCE MANAGEMENT</h2>
    <div class="phase-description">
      <p>Manage your resources and gather new ones.</p>
    </div>
    
    <!-- Placeholder for ResourceManagement component -->
    <div class="resource-management-container">
      <div class="resource-list">
        <h3>Current Resources</h3>
        <p v-if="!playerStore.resources.length">You have no resources.</p>
        <ul v-else>
          <li v-for="resource in playerStore.resources" :key="resource">
            {{ resource }}
          </li>
        </ul>
      </div>
    </div>
    
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
import { usePlayerStore } from '@/stores/playerStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
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

.resource-management-container {
  width: 100%;
  max-width: 600px;
  background-color: rgba(245, 245, 220, 0.5);
  border: 1px solid #8b4513;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.resource-list {
  h3 {
    color: #5a3e2b;
    margin-bottom: 1rem;
  }
  
  ul {
    list-style-type: none;
    padding: 0;
    
    li {
      padding: 0.5rem;
      margin-bottom: 0.5rem;
      background-color: rgba(255, 255, 255, 0.6);
      border-radius: 4px;
      border-left: 3px solid #8b4513;
    }
  }
}
</style>
