<template>
  <ComponentWrapper componentName="PhaseFactory">
    <div class="phase-content" :class="`phase-${formatPhaseClass(currentPhase)}`">
      <component :is="currentPhaseComponent" />
    </div>
  </ComponentWrapper>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { GamePhase } from '@/models/enums/phases';
import { ComponentWrapper } from '@/components/common';

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
</script>

<style lang="scss" scoped>
.phase-content {
  position: relative;
  padding: 1rem;
  margin-top: 1rem;
  background-color: rgba(240, 230, 210, 0.3);
  border-radius: 8px;
  border: 1px solid #8c7851;
}
</style>
