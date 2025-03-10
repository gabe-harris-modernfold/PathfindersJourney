<template>
  <div class="journey-tracker">
    <h3 class="journey-tracker__title">Journey Progress</h3>
    
    <div class="journey-progress">
      <div class="journey-progress__track">
        <div 
          class="journey-progress__fill" 
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      
      <div class="journey-progress__markers">
        <div 
          v-for="(landscape, index) in journeyLandscapes" 
          :key="index"
          class="journey-progress__marker"
          :class="{
            'visited': index < currentLandscapeIndex,
            'current': index === currentLandscapeIndex
          }"
          :title="landscape.name"
        ></div>
      </div>
    </div>
    
    <div class="journey-stats mt-3">
      <div class="journey-stats__item">
        <span class="stat-label">Landscapes Traversed:</span>
        <span class="stat-value">{{ currentLandscapeIndex }} / {{ totalLandscapes }}</span>
      </div>
      <div class="journey-stats__item">
        <span class="stat-label">Current Location:</span>
        <span class="stat-value">{{ currentLandscape?.name || 'Unknown' }}</span>
      </div>
      <div class="journey-stats__item">
        <span class="stat-label">Current Season:</span>
        <span class="stat-value season-name" :class="currentSeason?.season.toLowerCase()">
          {{ currentSeason?.name || 'Unknown' }}
        </span>
      </div>
    </div>
    
    <div class="victory-conditions mt-4">
      <h4>Victory Conditions</h4>
      <div class="victory-conditions__list">
        <div class="victory-conditions__item">
          <span class="condition-label">Knowledge Acquired:</span>
          <span 
            class="condition-status"
            :class="{ 'completed': victoryConditions.knowledgeAcquired }"
          >
            {{ victoryConditions.knowledgeAcquired ? 'Completed' : 'Incomplete' }}
          </span>
        </div>
        <div class="victory-conditions__item">
          <span class="condition-label">Landscapes Traversed:</span>
          <span 
            class="condition-status"
            :class="{ 'completed': victoryConditions.landscapesTraversed }"
          >
            {{ victoryConditions.landscapesTraversed ? 'Completed' : 'Incomplete' }}
          </span>
        </div>
        <div class="victory-conditions__item">
          <span class="condition-label">Seasons Experienced:</span>
          <span 
            class="condition-status"
            :class="{ 'completed': victoryConditions.seasonsExperienced }"
          >
            {{ victoryConditions.seasonsExperienced ? 'Completed' : 'Incomplete' }}
          </span>
        </div>
        <div class="victory-conditions__item">
          <span class="condition-label">Challenges Overcome:</span>
          <span 
            class="condition-status"
            :class="{ 'completed': victoryConditions.challengesOvercome }"
          >
            {{ victoryConditions.challengesOvercome ? 'Completed' : 'Incomplete' }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useCardStore, useGameStore } from '@/stores';

export default defineComponent({
  name: 'JourneyTracker',
  setup() {
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    
    const journeyLandscapes = computed(() => {
      return gameStore.visitedLandscapes.map(id => cardStore.getLandscapeById(id) || { name: 'Unknown' });
    });
    
    const currentLandscapeIndex = computed(() => {
      return gameStore.visitedLandscapes.indexOf(gameStore.currentLandscapeId);
    });
    
    const totalLandscapes = computed(() => {
      return gameStore.visitedLandscapes.length;
    });
    
    const currentLandscape = computed(() => {
      return cardStore.getLandscapeById(gameStore.currentLandscapeId);
    });
    
    const currentSeason = computed(() => {
      return cardStore.getSeasonById(gameStore.currentSeason);
    });
    
    const progressPercentage = computed(() => {
      if (totalLandscapes.value === 0) return 0;
      return (currentLandscapeIndex.value / totalLandscapes.value) * 100;
    });
    
    const victoryConditions = computed(() => {
      return gameStore.victoryConditions;
    });
    
    return {
      journeyLandscapes,
      currentLandscapeIndex,
      totalLandscapes,
      currentLandscape,
      currentSeason,
      progressPercentage,
      victoryConditions
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.journey-tracker {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  padding: $spacing-md;
  
  &__title {
    margin-top: 0;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.journey-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  grid-gap: $spacing-sm;
  
  &__item {
    display: flex;
    justify-content: space-between;
    padding: $spacing-xs $spacing-sm;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: $border-radius-sm;
  }
}

.victory-conditions {
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: $border-radius-md;
  padding: $spacing-md;
  
  h4 {
    margin-top: 0;
    margin-bottom: $spacing-sm;
  }
  
  &__list {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    grid-gap: $spacing-sm;
  }
  
  &__item {
    display: flex;
    justify-content: space-between;
    padding: $spacing-xs $spacing-sm;
    background-color: white;
    border-radius: $border-radius-sm;
    border: 1px solid rgba(0, 0, 0, 0.1);
  }
}

.condition-status {
  font-weight: 600;
  
  &.completed {
    color: $success-color;
  }
  
  &:not(.completed) {
    color: $warning-color;
  }
}
</style>
