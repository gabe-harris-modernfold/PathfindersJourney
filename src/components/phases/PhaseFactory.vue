<template>
  <ComponentWrapper componentName="PhaseFactory">
    <div class="phase-content" :class="`phase-${formatPhaseClass(currentPhase)}`">
      <transition name="fade" mode="out-in">
        <component :is="currentPhaseComponent" v-if="currentPhaseComponent" />
        <div v-else class="fallback-phase">
          <h2>Continue Your Journey</h2>
          <p>There seems to be an issue loading the current phase.</p>
          <button @click="skipToNextPhase" class="fallback-button">
            Continue to Next Phase
          </button>
        </div>
      </transition>
    </div>
  </ComponentWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { GamePhase } from '@/models/enums/phases';
import { ComponentWrapper } from '@/components/common';
import { useServices } from '@/composables/useServices';

// Import all phase components
import SeasonalAssessmentPhase from './SeasonalAssessmentPhase.vue';
import ThreatLevelCheckPhase from './ThreatLevelCheckPhase.vue';
import LandscapeChallengePhase from './LandscapeChallengePhase.vue';
import ChallengeResolutionPhase from './ChallengeResolutionPhase.vue';
import ResourceManagementPhase from './ResourceManagementPhase.vue';
import AnimalCompanionPhase from './AnimalCompanionPhase.vue';
import CraftingPhase from './CraftingPhase.vue';
import JourneyProgressionPhase from './JourneyProgressionPhase.vue';
import ExplorationPhase from './ExplorationPhase.vue';

// Get current game phase from store
const gameStore = useGameStore();
const currentPhase = computed(() => gameStore.currentPhase);

// Map phases to components
const phaseComponentMap = {
  [GamePhase.SEASONAL_ASSESSMENT]: SeasonalAssessmentPhase,
  [GamePhase.THREAT_LEVEL_CHECK]: ThreatLevelCheckPhase,
  [GamePhase.LANDSCAPE_CHALLENGE]: LandscapeChallengePhase,
  [GamePhase.CHALLENGE_RESOLUTION]: ChallengeResolutionPhase,
  [GamePhase.RESOURCE_MANAGEMENT]: ResourceManagementPhase,
  [GamePhase.ANIMAL_COMPANION]: AnimalCompanionPhase,
  [GamePhase.CRAFTING]: CraftingPhase,
  [GamePhase.JOURNEY_PROGRESSION]: JourneyProgressionPhase,
  [GamePhase.EXPLORATION]: ExplorationPhase,
};

// Get the component for the current phase
const currentPhaseComponent = computed(() => {
  return phaseComponentMap[currentPhase.value] || null;
});

// Helper function to format phase for CSS class
const formatPhaseClass = (phase: GamePhase): string => {
  return phase.toLowerCase().replace(/_/g, '-');
};

// Function to skip to the next phase when the current phase component fails to load
const skipToNextPhase = () => {
  const { phaseService } = useServices();
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.phase-content {
  position: relative;
  min-height: 500px; // Ensure consistent height during transitions
  padding: 1rem;
  margin-top: 1rem;
  background-color: rgba(240, 230, 210, 0.3);
  border-radius: 8px;
  border: 1px solid #8c7851;
}

.fallback-phase {
  text-align: center;
  padding: 2rem;
}

.fallback-button {
  background-color: #8c7851;
  color: #fff;
  border: none;
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.fallback-button:hover {
  background-color: #786c3b;
}

/* Fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.6s ease, transform 0.6s ease;
}

.fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
