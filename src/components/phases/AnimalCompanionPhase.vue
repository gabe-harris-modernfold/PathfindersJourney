<template>
  <div class="animal-companion-phase">
    <h2 class="phase-title">ANIMAL COMPANION</h2>
    
    <div v-if="playerStore.animalCompanions.length === 0">
      <div class="placeholder-component">
        <h3>Animal Companion Selection</h3>
        <p>This component is under development.</p>
        <button class="btn" @click="selectCompanion('default_companion')">Select Default Companion</button>
      </div>
      
      <div class="action-buttons mt-4">
        <div class="game-card action-card" @click="advancePhase">
          <h4>Skip Animal Companion</h4>
          <div style="font-size: 1rem; padding: 5px;">
            Continue without a companion
          </div>
        </div>
      </div>
    </div>
    
    <div v-else>
      <div class="placeholder-component">
        <h3>Companion Management</h3>
        <p>This component is under development.</p>
        <div v-for="companion in playerStore.animalCompanions" :key="companion">
          <p>Companion ID: {{ companion }}</p>
        </div>
      </div>
      
      <div class="action-buttons mt-4">
        <div class="game-card action-card" @click="advancePhase">
          <h4>Continue Journey</h4>
          <div style="font-size: 1rem; padding: 5px;">
            Proceed to the next phase
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useServices } from '@/composables/useServices';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const { phaseService, companionService } = useServices();

// Select a companion - updated to use an available method from companionService
const selectCompanion = (companionId: string) => {
  // Using direct store access per standardization approach
  playerStore.addCompanion(companionId);
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.animal-companion-phase {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.placeholder-component {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.05);
}

.game-card {
  background: #f5f5dc;
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.action-card {
  background: #d2b48c;
}

.btn {
  background: #8b4513;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #654321;
  }
}

.mt-4 {
  margin-top: 1rem;
}
</style>
