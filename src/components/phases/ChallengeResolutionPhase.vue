<template>
  <div class="challenge-resolution-phase">
    <!-- Added Landscape Background -->
    <div class="landscape-image-container" v-if="currentLandscape">
      <img :src="getLandscapeImagePath()" class="landscape-image" />
    </div>
    <div class="landscape-overlay"></div>
    <!-- End Added Landscape Background -->

    <!-- Existing Content (Needs z-index) -->
    <h2 class="phase-title">{{ currentLandscape ? currentLandscape.name : 'LANDSCAPE' }} - {{ currentLandscape ? currentLandscape.challenge : 'CHALLENGE' }}</h2>
    
    <div class="narrative-outcome" v-if="lastChallengeResult && currentLandscape">
      <GameCard 
        :title="getNarrativeTitle()"
        :cardType="CardType.STORY"
        @click="advancePhase"
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
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';
import { CardType } from '@/models/enums/cardTypes';

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

// Get landscape image path (ADDED)
const getLandscapeImagePath = () => {
  if (!currentLandscape.value || !currentLandscape.value.image) return '';
  try {
    return require(`@/assets/images/${currentLandscape.value.image}`);
  } catch (e) {
     console.warn(`Background image not found for ChallengeResolutionPhase: ${currentLandscape.value.image}`);
     // Optionally return a default path here
     return ''; 
  }
};

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
  // Removed max-width to allow full background coverage
  margin: 0 auto;
  position: relative; // Added for absolute positioning context
  min-height: 500px; // Added for consistent height
  padding: 1rem; // Added for consistency
  box-sizing: border-box; // Added for consistency
  overflow: hidden; // Added for consistency
}

// Added Background Styles
.landscape-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; // Behind content
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
  background-color: rgba(240, 230, 210, 0.75); // Standard overlay
  z-index: 1; // Above image, below content
}
// End Added Background Styles

.phase-title {
  font-size: 1.8rem; // Increased size
  margin-bottom: 1.5rem; // Adjusted margin
  color: #4a2e1a; // Darker brown for contrast
  text-align: center;
  font-family: 'Cinzel', serif; // Added font
  font-weight: bold; // Added weight
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); // Added shadow
  position: relative; // Added for z-index
  z-index: 2; // Added: Ensure title is above overlay
}

.narrative-outcome {
  margin: 1rem auto;
  // padding: 1.5rem; // Padding might conflict with card styles
  max-width: 600px;
  display: flex;
  justify-content: center;
  width: 100%; // Ensure it takes width
  position: relative; // Added for z-index
  z-index: 2; // Added: Ensure card is above overlay
}

.narrative-content {
  padding: 0.5rem;
  text-align: left;
  
  p {
    margin-bottom: 0;
    padding: 0;
    
    span {
      font-size: 0.85rem;
      display: block;
      width: 100%;
      margin: 0;
      padding: 0;
    }
  }
}
</style>
