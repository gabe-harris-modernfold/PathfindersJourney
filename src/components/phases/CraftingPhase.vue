<template>
  <div class="crafting-phase">
    <h2 class="phase-title">CRAFTING</h2>
    <div class="phase-description">
      <p>Craft items using your gathered resources.</p>
    </div>
    
    <!-- Placeholder for CraftingStation component -->
    <div class="placeholder-component">
      <h3>Crafting Station</h3>
      <p>This component is under development.</p>
      <div class="available-resources">
        <h4>Available Resources</h4>
        <div class="resource-list">
          <p>Resource data will be displayed here.</p>
        </div>
      </div>
      <div class="crafting-recipes">
        <h4>Available Recipes</h4>
        <div class="recipe-list">
          <p>Crafting recipes will be displayed here.</p>
        </div>
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
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

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
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.phase-title {
  font-size: 1.8rem;
  color: #5a3e2b;
  margin-bottom: 0.5rem;
}

.phase-description {
  text-align: center;
  margin-bottom: 1rem;
  color: #665e52;
}

.placeholder-component {
  width: 100%;
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 2rem;
  margin-bottom: 1.5rem;
  background-color: rgba(0, 0, 0, 0.05);
  text-align: center;

  h3 {
    margin-bottom: 1rem;
    color: #5a3e2b;
  }

  .available-resources,
  .crafting-recipes {
    margin-top: 1.5rem;
    background-color: rgba(255, 255, 255, 0.5);
    border-radius: 6px;
    padding: 1rem;
  }

  .resource-list,
  .recipe-list {
    min-height: 100px;
    padding: 1rem;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    margin-top: 0.5rem;
  }
}

.game-card {
  background: #f5f5dc;
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  text-align: center;
  min-width: 200px;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.action-card {
  background: #d2b48c;
}
</style>
