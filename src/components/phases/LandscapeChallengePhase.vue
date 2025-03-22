<template>
  <div class="landscape-challenge-phase">
    <h2 class="phase-title">LANDSCAPE CHALLENGE</h2>
    <div class="phase-description">
      <p>Will you face the challenges of this landscape?</p>
    </div>
    
    <div class="challenge-actions">
      <GameCard 
        title="Roll D8 and Resolve Challenge" 
        cardType="ACTION"
        @click="resolveChallenge"
      >
        <div style="font-size: 1rem; padding: 5px;">
          Test your skills against the challenge
        </div>
      </GameCard>
      
      <GameCard 
        title="Avoid Challenge" 
        cardType="ACTION"
        @click="avoidChallenge"
      >
        <div style="font-size: 1rem; padding: 5px;">
          Cost: 2 Resources
        </div>
      </GameCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const { phaseService, challengeService } = useServices();

// Resolve landscape challenge
const resolveChallenge = () => {
  challengeService.resolveChallengeLandscape();
  phaseService.advancePhase();
};

// Avoid landscape challenge by spending resources
const avoidChallenge = () => {
  challengeService.avoidChallengeLandscape();
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.landscape-challenge-phase {
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

.challenge-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}
</style>
