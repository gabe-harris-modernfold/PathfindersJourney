<template>
  <div class="landscape-challenge-phase">
    <h2 class="phase-title">LANDSCAPE CHALLENGE</h2>
    <div class="phase-description">
      <p v-if="currentLandscape && !rollResult">
        Will you face the challenges of this landscape?
      </p>
      <p v-else-if="!currentLandscape">Will you face the challenges of this landscape?</p>
    </div>
    
    <div v-if="!rollResult" class="challenge-actions">
      <GameCard 
        title="Roll D8 and Resolve Challenge" 
        cardType="ACTION"
        @click="rollForChallenge"
      >
        <div style="font-size: 0.85rem; padding: 5px;">
          {{ getChallengeDescription() }}<br><br>
          Test your skills against the challenge (Difficulty: {{ challengeDifficulty }})
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
    
    <div v-else class="challenge-result">
      <GameCard 
        :title="rollResult.success ? 'Challenge Passed!' : 'Challenge Failed'" 
        :cardType="rollResult.success ? 'SUCCESS' : 'DANGER'"
        @click="advanceToNextPhase"
      >
        <div class="roll-result">
          <div class="roll-value">{{ rollResult.roll }}</div>
          <div class="result-description">
            <p>
              {{ rollResult.success ? 
                  (rollResult.exceptional ? 'An exceptional triumph!' : 'You successfully overcome the challenge.') : 
                  (rollResult.exceptional ? 'A devastating setback!' : 'The challenge proves too difficult.') 
              }}
            </p>
          </div>
        </div>
      </GameCard>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import { ChallengeOutcome } from '@/models/types/game';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();
const { phaseService, challengeService } = useServices();

// State for tracking roll result
const rollResult = ref<ChallengeOutcome | null>(null);

// Get the current landscape
const currentLandscape = computed(() => {
  if (!gameStore.currentLandscapeId) return null;
  return cardStore.getLandscapeById(gameStore.currentLandscapeId);
});

// Get challenge difficulty
const challengeDifficulty = computed(() => {
  return currentLandscape.value?.difficulty || 5;
});

// Get a narrative description of the current challenge
const getChallengeDescription = () => {
  if (!currentLandscape.value) return '';
  
  const landscape = currentLandscape.value;
  const difficulty = landscape.difficulty || 5;
  
  // Use only the data from the landscape model
  return `${landscape.description} The ${landscape.challenge} (${landscape.challengeType}, difficulty ${difficulty}).`;
};

// Roll for challenge but don't advance phase immediately
const rollForChallenge = () => {
  // Resolve the challenge through the service
  rollResult.value = challengeService.resolveChallenge({
    type: currentLandscape.value?.challengeType,
    difficulty: challengeDifficulty.value,
    name: currentLandscape.value?.challenge
  });
  
  // Apply the outcome without advancing
  challengeService.applyOutcome(rollResult.value, {
    type: currentLandscape.value?.challengeType,
    difficulty: challengeDifficulty.value,
    name: currentLandscape.value?.challenge
  });
  
  // Apply health loss if challenge failed
  if (rollResult.value && rollResult.value.success === false) {
    playerStore.takeDamage(1);
    gameStore.addToGameLog("You lost 1 health point due to the failed challenge.", false);
  }
  
  // Award experience points if challenge succeeded
  if (rollResult.value && rollResult.value.success === true) {
    playerStore.addExperience(1);
    gameStore.addToGameLog("You gained 1 experience point for overcoming the challenge.", false);
    
    // Award bonus experience for exceptional success
    if (rollResult.value.exceptional) {
      playerStore.addExperience(1);
      gameStore.addToGameLog("Your exceptional success earned you an additional experience point!", false);
    }
  }
};

// Advance to the next phase after viewing result
const advanceToNextPhase = () => {
  // Only advance if we have a roll result
  if (rollResult.value) {
    phaseService.advancePhase();
  }
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
  line-height: 1.5;
  max-width: 600px;
}

.challenge-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.challenge-result {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
}

.roll-result {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  text-align: center;
}

.roll-value {
  font-size: 6rem;
  font-weight: bold;
  line-height: 1;
  color: #5a3e2b;
  margin-bottom: 1rem;
}

.result-description {
  margin-top: 1rem;
}
</style>
