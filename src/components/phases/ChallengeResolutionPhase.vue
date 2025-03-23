<template>
  <div class="challenge-resolution-phase">
    <h2 class="phase-title">{{ currentLandscape ? currentLandscape.name : 'LANDSCAPE' }} - {{ currentLandscape ? currentLandscape.challenge : 'CHALLENGE' }}</h2>
    
    <div v-if="lastChallengeResult" class="challenge-result" :class="{ 
      'success': lastChallengeResult.success, 
      'partial-success': lastChallengeResult.partialSuccess,
      'failure': !lastChallengeResult.success && !lastChallengeResult.partialSuccess
    }">
      <h3>{{ getOutcomeTitle() }}</h3>
      
      <!-- Challenge Description from model -->
      <p>{{ currentLandscape?.description }}</p>
      
      <!-- Challenge outcome details -->
      <div class="challenge-details">
        <div class="detail-item">
          <span class="label">Challenge:</span>
          <span>{{ currentLandscape?.challenge }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Type:</span>
          <span>{{ currentLandscape?.challengeType }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Difficulty:</span>
          <span>{{ lastChallengeResult.difficulty }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Roll:</span>
          <span>{{ lastChallengeResult.roll }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Total:</span>
          <span>{{ lastChallengeResult.total }}</span>
        </div>
        <div class="detail-item">
          <span class="label">Result:</span>
          <span class="result" :class="{
            'success-text': lastChallengeResult.success,
            'partial-text': lastChallengeResult.partialSuccess,
            'failure-text': !lastChallengeResult.success && !lastChallengeResult.partialSuccess
          }">
            {{ lastChallengeResult.success ? 'Glorious Victory' : lastChallengeResult.partialSuccess ? 'Bittersweet Outcome' : 'Valiant Struggle' }}
          </span>
        </div>
      </div>
    </div>
    
    <div class="narrative-outcome" v-if="lastChallengeResult && currentLandscape">
      <GameCard 
        :title="getNarrativeTitle()"
        cardType="STORY"
      >
        <div class="narrative-content">
          <!-- Dynamic narrative based on challenge type and outcome -->
          <p v-if="lastChallengeResult.success">
            <span v-if="currentLandscape.challengeType === 'mental'">
              Your wisdom and insight pierced through the veil of illusion at the {{ currentLandscape.name }}. The {{ currentLandscape.challenge }} acknowledged your intellect, allowing hidden knowledge to reveal itself to your prepared mind.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'physical'">
              With strength and agility, you overcame the {{ currentLandscape.challenge }} that guarded the {{ currentLandscape.name }}. Your body remembered ancient ways of moving through this sacred space, earning respect from the spirits watching.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'spiritual'">
              Your spirit resonated with the ancient energies of the {{ currentLandscape.name }}. The {{ currentLandscape.challenge }} found harmony with your inner light, blessing your journey forward.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'social'">
              Words flowed like honey from your lips, soothing the {{ currentLandscape.challenge }} at the {{ currentLandscape.name }}. Old suspicions melted away as bonds of trust formed between worlds once separate.
            </span>
            <span v-else>
              With skill and fortune favoring your path, you triumphed over the {{ currentLandscape.challenge }} at the {{ currentLandscape.name }}. The way forward opens to your determined spirit.
            </span>
          </p>
          
          <p v-else-if="lastChallengeResult.partialSuccess">
            <span v-if="currentLandscape.challengeType === 'mental'">
              The riddles of the {{ currentLandscape.challenge }} tested the limits of your understanding. Though not all secrets of the {{ currentLandscape.name }} revealed themselves, you gleaned enough wisdom to continue your quest.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'physical'">
              The {{ currentLandscape.challenge }} proved formidable, leaving you winded and marked by the trial. Yet you stand unbroken in the {{ currentLandscape.name }}, having earned passage through perseverance.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'spiritual'">
              The {{ currentLandscape.challenge }} stirred the depths of your soul, revealing both strengths and shadows. This partial communion with the {{ currentLandscape.name }}'s essence grants uncertain favor for what lies ahead.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'social'">
              An uneasy truce formed between you and the {{ currentLandscape.challenge }}. Not all hearts at the {{ currentLandscape.name }} were swayed by your words, but enough doors opened to permit your passage.
            </span>
            <span v-else>
              Neither triumph nor defeat marked your encounter with the {{ currentLandscape.challenge }}. The {{ currentLandscape.name }} yields passage, though not without extracting its price.
            </span>
          </p>
          
          <p v-else>
            <span v-if="currentLandscape.challengeType === 'mental'">
              The mysteries of the {{ currentLandscape.name }} proved too cryptic, its {{ currentLandscape.challenge }} weaving illusions that led your thoughts astray. Wisdom sometimes comes from acknowledging one's limitations.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'physical'">
              Despite your effort, the {{ currentLandscape.challenge }} overwhelmed your strength. The {{ currentLandscape.name }} extracts its toll in sweat and strain, teaching harsh lessons of humility.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'spiritual'">
              The {{ currentLandscape.challenge }} found disharmony with your inner self, causing the energies of the {{ currentLandscape.name }} to remain closed to your questing spirit. Some paths must be revisited when one's soul is better prepared.
            </span>
            <span v-else-if="currentLandscape.challengeType === 'social'">
              Your words fell on resistant ears among the {{ currentLandscape.challenge }}. The {{ currentLandscape.name }} remains unwelcoming, its denizens watching with suspicious eyes as you pass through their domain.
            </span>
            <span v-else>
              Fate turned against you in your confrontation with the {{ currentLandscape.challenge }}. The {{ currentLandscape.name }} reminds you that not all challenges can be overcome on first meeting.
            </span>
          </p>
        </div>
      </GameCard>
    </div>
    
    <GameCard 
      title="Continue Your Quest" 
      cardType="ACTION"
      @click="advancePhase"
    >
      <div class="narrative-content">
        <p v-if="currentLandscape">
          Leave the {{ currentLandscape.name }} behind and carry its lessons to the next chapter of your journey.
        </p>
        <p v-else>
          The path calls you onward to new horizons and untold adventures.
        </p>
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const cardStore = useCardStore();
const { phaseService, challengeService } = useServices();

// Get the last challenge result from the challenge service
const lastChallengeResult = computed(() => {
  return challengeService.getLastChallengeResult();
});

// Get the current landscape
const currentLandscape = computed(() => {
  if (!gameStore.currentLandscapeId) return null;
  return cardStore.getLandscapeById(gameStore.currentLandscapeId);
});

// Get outcome title based on success/failure
const getOutcomeTitle = () => {
  if (!lastChallengeResult.value) return '';
  
  return lastChallengeResult.value.success ? '✧・゚: *A Triumphant Victory!* :・゚✧' : 
         lastChallengeResult.value.partialSuccess ? '✦⋆ A Hard-Won Compromise ⋆✦' : 
         '•.¸¸•´¯`•.¸¸.• The Challenge Prevails •.¸¸•´¯`•.¸¸.•';
};

// Get narrative title based on challenge outcome
const getNarrativeTitle = () => {
  if (!lastChallengeResult.value) return "The Tale Unfolds";
  
  if (lastChallengeResult.value.success) {
    return "Chronicles of Triumph";
  } else if (lastChallengeResult.value.partialSuccess) {
    return "Whispers of What Could Have Been";
  } else {
    return "Lessons Written in Shadow";
  }
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.challenge-resolution-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 800px;
  margin: 0 auto;
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
  text-align: center;
}

.challenge-result {
  margin: 1rem 0;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
  border-radius: 0.5rem;
  
  h3 {
    margin-bottom: 1rem;
    font-size: 1.3rem;
  }
  
  p {
    line-height: 1.5;
    margin-bottom: 1.5rem;
    text-align: left;
  }
  
  &.success {
    background-color: rgba(0, 128, 0, 0.1);
    border-left: 5px solid rgba(0, 128, 0, 0.5);
  }
  
  &.partial-success {
    background-color: rgba(255, 165, 0, 0.1);
    border-left: 5px solid rgba(255, 165, 0, 0.5);
  }
  
  &.failure {
    background-color: rgba(255, 0, 0, 0.1);
    border-left: 5px solid rgba(255, 0, 0, 0.5);
  }
}

.challenge-details {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  text-align: left;
  margin-top: 1rem;
  
  .detail-item {
    padding: 0.5rem;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 0.25rem;
    
    .label {
      font-weight: bold;
      margin-right: 0.5rem;
    }
    
    .result {
      font-weight: bold;
      
      &.success-text {
        color: green;
      }
      
      &.partial-text {
        color: orange;
      }
      
      &.failure-text {
        color: red;
      }
    }
  }
}

.narrative-outcome {
  margin: 1rem 0;
  padding: 1.5rem;
  width: 100%;
  max-width: 600px;
  text-align: center;
  border-radius: 0.5rem;
  
  .narrative-content {
    padding: 1rem;
    text-align: left;
  }
}
</style>
