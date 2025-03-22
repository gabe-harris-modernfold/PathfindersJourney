<template>
  <div class="animal-companion-phase">
    <h2 class="phase-title">ANIMAL COMPANION</h2>
    
    <div v-if="playerStore.animalCompanions.length === 0">
      <AnimalCompanionSelection
        @select-companion="selectCompanion"
      />
      
      <div class="action-buttons mt-4">
        <GameCard 
          title="Skip Animal Companion" 
          cardType="ACTION"
          @click="advancePhase"
        >
          <div style="font-size: 1rem; padding: 5px;">
            Continue without a companion
          </div>
        </GameCard>
      </div>
    </div>
    
    <div v-else>
      <CompanionManagement />
      
      <div class="action-buttons mt-4">
        <GameCard 
          title="Continue Journey" 
          cardType="ACTION"
          @click="advancePhase"
        >
          <div style="font-size: 1rem; padding: 5px;">
            Proceed to the next phase
          </div>
        </GameCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';
import AnimalCompanionSelection from '@/components/game/AnimalCompanionSelection.vue';
import CompanionManagement from '@/components/game/CompanionManagement.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const { phaseService, companionService } = useServices();

// Select a companion
const selectCompanion = (companionId: string) => {
  companionService.selectCompanion(companionId);
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
  align-items: center;
  width: 100%;
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
}

.action-buttons {
  margin-top: 1rem;
  display: flex;
  justify-content: center;
}

.mt-4 {
  margin-top: 1rem;
}
</style>
