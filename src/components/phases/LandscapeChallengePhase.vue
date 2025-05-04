<template>
  <div class="landscape-challenge-phase">
    <div class="landscape-image-container" v-if="currentLandscape">
      <img :src="getLandscapeImagePath()" class="landscape-image" />
    </div>
    <div class="landscape-overlay"></div>
    <h2 class="phase-title">LANDSCAPE CHALLENGE</h2>
    <div class="phase-description">
      <p v-if="currentLandscape && !rollResult">
        Will you face the challenges of this landscape?
      </p>
      <p v-else-if="!currentLandscape">Will you face the challenges of this landscape?</p>
    </div>
    
    <div v-if="!rollResult" class="challenge-actions">
      <!-- Modified Roll D8 Card -->
      <GameCard 
        title="Roll D8 and Resolve Challenge" 
        :cardType="CardType.ACTION"
        @click="rollForChallenge"
        class="challenge-roll-card" 
      >
        <!-- Use header slot with empty content to override default header -->
        <template #header>
          <!-- Intentionally empty -->
        </template>
        
        <!-- Wrapper for image and text overlay -->
        <div class="card-image-overlay-wrapper">
          <img 
            :src="require('@/assets/images/resolve-challenge.jpg')" 
            alt="Resolve Challenge" 
            class="card-landscape-image"
          />
          <div class="card-text-overlay"></div> 
          
          <!-- Manually render content inside -->
          <div class="card-content-over-image">
            <h3 class="card-title-over-image">Roll D8 and Resolve Challenge</h3>
            <p class="card-landscape-description">
              <!-- Preserve dynamic description -->
              {{ getChallengeDescription() }}<br><br>
              Test your skills against the challenge (Difficulty: {{ challengeDifficulty }})
            </p>
          </div>
        </div>
      </GameCard>
      
      <!-- Modified Avoid Challenge Card -->
      <GameCard 
        title="Avoid Challenge" 
        :cardType="CardType.ACTION"
        @click="avoidChallenge"
        class="challenge-avoid-card" 
      >
        <!-- Use header slot with empty content to override default header -->
        <template #header>
          <!-- Intentionally empty -->
        </template>
        
        <!-- Wrapper for image and text overlay -->
        <div class="card-image-overlay-wrapper">
          <img 
            :src="require('@/assets/images/avoid-challenge.jpg')" 
            alt="Avoid Challenge" 
            class="card-landscape-image"
          />
          <div class="card-text-overlay"></div> 
          
          <!-- Manually render content inside -->
          <div class="card-content-over-image">
            <h3 class="card-title-over-image">Avoid Challenge</h3>
            <p class="card-landscape-description">
              Cost: 2 Resources
            </p>
          </div>
        </div>
      </GameCard>
    </div>
    
    <div v-else class="challenge-result">
      <GameCard 
        :title="rollResult.success ? 'Challenge Passed!' : 'Challenge Failed'" 
        :cardType="rollResult.success ? CardType.SUCCESS : CardType.DANGER"
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
import { CardType } from '@/models/enums/cardTypes';

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

// Get landscape image path
const getLandscapeImagePath = () => {
  if (!currentLandscape.value || !currentLandscape.value.image) return '';
  return require(`@/assets/images/${currentLandscape.value.image}`);
};

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
  position: relative;
  min-height: 500px;
}

.landscape-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
  overflow: hidden;
}

.landscape-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.landscape-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(240, 230, 210, 0.75);
  z-index: 1;
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
  position: relative;
  z-index: 2;
}

.phase-description {
  text-align: center;
  margin-bottom: 1.5rem;
  line-height: 1.5;
  max-width: 600px;
  position: relative;
  z-index: 2;
}

.challenge-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
  position: relative;
  z-index: 2;
}

.challenge-result {
  display: flex;
  justify-content: center;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
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

/* Styles for the Roll D8 card image overlay effect */
.challenge-roll-card {
  max-width: 300px; 
  margin: 0 1rem 1rem 1rem; 

  // Explicitly collapse the header div
  :deep(.game-card__header) {
    padding: 0;
    height: 0;
    border: none;
    overflow: hidden;
  }

  // Remove padding from the body
  :deep(.game-card__body) {
    padding: 0;
    height: 100%; 
    // Hide the default symbol if present
    .game-card__symbol {
      display: none;
    }
  }

  // Wrapper positioned absolutely relative to the .game-card
  .card-image-overlay-wrapper {
    position: absolute; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; 
    z-index: 1; 
    border-radius: inherit; 
    overflow: hidden; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    min-height: 0; 
  }

  // Style for the image
  .card-landscape-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: 0; 
  }

  // Overlay for text readability
  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  // Container for text content over the image
  .card-content-over-image {
    position: relative; 
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 1rem; 
    width: 100%;
    box-sizing: border-box; 
  }

  // Style for the title over the image
  .card-title-over-image {
    font-size: 1.4rem; 
    font-weight: bold;
    margin: 0 0 0.5rem 0; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  // Style for the description text
  .card-landscape-description {
    font-size: 0.9rem; 
    margin: 0; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }
}

/* Styles for the Avoid Challenge card image overlay effect */
.challenge-avoid-card {
  max-width: 300px; 
  margin: 0 1rem 1rem 1rem; 

  // Explicitly collapse the header div
  :deep(.game-card__header) {
    padding: 0;
    height: 0;
    border: none;
    overflow: hidden;
  }

  // Remove padding from the body
  :deep(.game-card__body) {
    padding: 0;
    height: 100%; 
    // Hide the default symbol if present
    .game-card__symbol {
      display: none;
    }
  }

  // Wrapper positioned absolutely relative to the .game-card
  .card-image-overlay-wrapper {
    position: absolute; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; 
    z-index: 1; 
    border-radius: inherit; 
    overflow: hidden; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    min-height: 0; 
  }

  // Style for the image
  .card-landscape-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: 0; 
  }

  // Overlay for text readability
  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  // Container for text content over the image
  .card-content-over-image {
    position: relative; 
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 1rem; 
    width: 100%;
    box-sizing: border-box; 
  }

  // Style for the title over the image
  .card-title-over-image {
    font-size: 1.4rem; 
    font-weight: bold;
    margin: 0 0 0.5rem 0; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  // Style for the description text
  .card-landscape-description {
    font-size: 1rem; 
    margin: 0; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }
}

</style>
