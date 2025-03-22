<template>
  <div class="threat-level-check-phase">
    <h2 class="phase-title">THREAT LEVEL CHECK</h2>
    <div class="phase-description">
      <p>Your current threat level: {{ gameStore.threatTokens }}</p>
    </div>
    <GameCard 
      title="Remain Vigilant" 
      cardType="ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Stay alert and advance to the next phase
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { useLogStore } from '@/stores/logStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const logStore = useLogStore();
const { phaseService, threatService } = useServices();

// Handle threat check
const handleThreatCheck = () => {
  // This would call logic in the threatService
  const threatLevel = threatService.getThreatLevel();
  
  // You could add additional logic here based on the threat level
  if (threatLevel > 0) {
    logStore.addToGameLog(`Threat Level: ${threatLevel}. Be cautious!`, false);
  }
};

// Advance to the next phase
const advancePhase = () => {
  // Perform threat check
  handleThreatCheck();
  // Advance to next phase
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.threat-level-check-phase {
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
