<template>
  <div class="journey-progression">
    <h3 class="journey-progression__title">Journey Progression</h3>
    
    <div v-if="currentPhase !== GamePhase.JOURNEY_PROGRESSION" class="journey-progression__inactive">
      <p>Journey progression is not available during the current phase.</p>
    </div>
    
    <div v-else class="journey-progression__active">
      <div class="journey-progression__current-location">
        <h4>Current Location</h4>
        <div v-if="currentLandscape" class="landscape-card">
          <GameCard 
            :title="currentLandscape.name" 
            :subtitle="'Landscape'" 
            :cardType="CardType.LANDSCAPE"
          >
            <p>{{ currentLandscape.description }}</p>
            
            <div class="landscape-resources mt-3" v-if="currentLandscape.availableResources && currentLandscape.availableResources.length">
              <h5>Available Resources</h5>
              <div class="resource-tags">
                <span 
                  v-for="resourceId in currentLandscape.availableResources" 
                  :key="resourceId"
                  class="resource-tag"
                >
                  {{ getResourceName(resourceId) }}
                </span>
              </div>
            </div>
            
            <div class="landscape-challenges mt-3" v-if="currentLandscape.challenges && currentLandscape.challenges.length">
              <h5>Challenges</h5>
              <div v-for="(challenge, index) in currentLandscape.challenges" :key="index" class="challenge-item">
                <div class="challenge-name">{{ challenge.name }}</div>
                <div class="challenge-description">{{ challenge.description }}</div>
                <div class="challenge-difficulty">Difficulty: {{ challenge.difficulty }}</div>
              </div>
            </div>
          </GameCard>
        </div>
      </div>
      
      <div class="journey-progression__next-locations mt-4">
        <h4>Choose Your Path</h4>
        <div class="landscape-options">
          <div 
            v-for="landscape in availableLandscapes" 
            :key="landscape.id"
            class="landscape-option"
            :class="{ 'selected': selectedLandscapeId === landscape.id }"
            @click="selectLandscape(landscape)"
          >
            <GameCard 
              :title="landscape.name" 
              :subtitle="'Landscape'" 
              :cardType="CardType.LANDSCAPE"
            >
              <p>{{ landscape.description }}</p>
              
              <div class="landscape-distance">
                <span class="label">Distance:</span>
                <span class="value">{{ getDistanceEstimate(landscape) }}</span>
              </div>
              
              <div class="landscape-difficulty">
                <span class="label">Difficulty:</span>
                <span class="value" :class="getDifficultyClass(landscape)">
                  {{ getDifficultyLabel(landscape) }}
                </span>
              </div>
            </GameCard>
          </div>
        </div>
      </div>
      
      <div v-if="selectedLandscapeId" class="journey-progression__actions mt-4">
        <button 
          class="btn btn--primary" 
          @click="travelToSelectedLandscape"
        >
          Travel to {{ getSelectedLandscapeName() }}
        </button>
        <button 
          class="btn btn--secondary ml-2" 
          @click="cancelSelection"
        >
          Cancel
        </button>
      </div>
      
      <div class="journey-progression__progress mt-4">
        <h4>Journey Progress</h4>
        <div class="progress-bar">
          <div 
            class="progress-bar__fill" 
            :style="{ width: `${journeyProgress}%` }"
          ></div>
          <div class="progress-bar__label">{{ Math.round(journeyProgress) }}%</div>
        </div>
        <div class="progress-stats">
          <div class="stat-item">
            <span class="stat-label">Landscapes Traversed:</span>
            <span class="stat-value">{{ visitedLandscapes.length }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Remaining Distance:</span>
            <span class="stat-value">{{ remainingDistance }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { GamePhase } from '@/models/enums/phases';
import { CardType } from '@/models/enums/cardTypes';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';
import { LandscapeCard } from '@/models/types/cards';
import GameCard from '@/components/core/GameCard.vue';

export default defineComponent({
  name: 'JourneyProgressionView',
  components: {
    GameCard
  },
  setup() {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const selectedLandscapeId = ref<string | null>(null);
    
    const currentPhase = computed(() => {
      return gameStore.currentPhase;
    });
    
    const currentLandscapeId = computed(() => {
      return gameStore.currentLandscapeId;
    });
    
    const currentLandscape = computed(() => {
      if (!currentLandscapeId.value) return null;
      return cardStore.getLandscapeById(currentLandscapeId.value);
    });
    
    const visitedLandscapes = computed(() => {
      return gameStore.visitedLandscapes;
    });
    
    // Filter out already visited landscapes
    const availableLandscapes = computed(() => {
      const landscapes = cardStore.landscapes;
      return landscapes.filter(landscape => 
        !visitedLandscapes.value.includes(landscape.id) && 
        landscape.id !== currentLandscapeId.value
      ).slice(0, 3); // Limit to 3 options
    });
    
    const journeyProgress = computed(() => {
      const totalLandscapes = 15; // Total number of landscapes in the game
      return (visitedLandscapes.value.length / totalLandscapes) * 100;
    });
    
    const remainingDistance = computed(() => {
      const totalDistance = 100; // Total journey distance
      const coveredDistance = journeyProgress.value;
      return `${Math.round(totalDistance - coveredDistance)} leagues`;
    });
    
    const selectLandscape = (landscape: LandscapeCard) => {
      selectedLandscapeId.value = landscape.id;
    };
    
    const getSelectedLandscapeName = () => {
      if (!selectedLandscapeId.value) return '';
      const landscape = cardStore.getLandscapeById(selectedLandscapeId.value);
      return landscape ? landscape.name : '';
    };
    
    const travelToSelectedLandscape = () => {
      if (!selectedLandscapeId.value) return;
      
      // Set the new landscape as current
      gameStore.setCurrentLandscape(selectedLandscapeId.value);
      
      // Add to visited landscapes
      gameStore.addVisitedLandscape(selectedLandscapeId.value);
      
      // Add to game log
      gameStore.addToGameLog(`Traveled to ${getSelectedLandscapeName()}`);
      
      // Check if this completes the journey
      if (journeyProgress.value >= 90) {
        gameStore.completeJourney(true); // Set victory to true
        gameStore.addToGameLog('You have completed your journey through the Celtic Realm!');
      } else {
        // Advance to the next phase
        gameStore.advancePhase();
      }
      
      // Reset selection
      selectedLandscapeId.value = null;
    };
    
    const cancelSelection = () => {
      selectedLandscapeId.value = null;
    };
    
    const getResourceName = (resourceId: string) => {
      const resource = cardStore.getResourceById(resourceId);
      return resource ? resource.name : 'Unknown Resource';
    };
    
    const getDistanceEstimate = (landscape: LandscapeCard) => {
      // Since we don't have a distance property, we'll generate a random one
      // In a real implementation, this would be based on actual data
      const hash = landscape.id.split('').reduce((acc, char) => {
        return acc + char.charCodeAt(0);
      }, 0);
      
      return `${(hash % 20) + 5} leagues`;
    };
    
    const getDifficultyLabel = (landscape: LandscapeCard) => {
      if (!landscape.challenges || landscape.challenges.length === 0) {
        return 'Easy';
      }
      
      // Calculate average difficulty
      const totalDifficulty = landscape.challenges.reduce((sum, challenge) => {
        return sum + (challenge.difficulty || 1);
      }, 0);
      
      const avgDifficulty = totalDifficulty / landscape.challenges.length;
      
      if (avgDifficulty < 2) return 'Easy';
      if (avgDifficulty < 3) return 'Moderate';
      if (avgDifficulty < 4) return 'Hard';
      return 'Very Hard';
    };
    
    const getDifficultyClass = (landscape: LandscapeCard) => {
      const label = getDifficultyLabel(landscape);
      return label.toLowerCase().replace(' ', '-');
    };
    
    return {
      currentPhase,
      GamePhase,
      CardType,
      currentLandscape,
      availableLandscapes,
      visitedLandscapes,
      selectedLandscapeId,
      journeyProgress,
      remainingDistance,
      selectLandscape,
      travelToSelectedLandscape,
      cancelSelection,
      getResourceName,
      getSelectedLandscapeName,
      getDifficultyLabel,
      getDifficultyClass,
      getDistanceEstimate
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.journey-progression {
  padding: $spacing-md;
  
  &__title {
    font-family: $font-family-display;
    margin-bottom: $spacing-md;
    color: $primary-color;
  }
  
  &__inactive {
    background-color: rgba(0, 0, 0, 0.05);
    padding: $spacing-md;
    border-radius: $border-radius-md;
    text-align: center;
  }
  
  &__active {
    display: flex;
    flex-direction: column;
    gap: $spacing-md;
  }
  
  &__current-location, &__next-locations, &__progress {
    background-color: white;
    border-radius: $border-radius-md;
    box-shadow: $shadow-sm;
    padding: $spacing-md;
    
    h4 {
      margin-bottom: $spacing-md;
      color: $secondary-color;
    }
  }
  
  &__actions {
    display: flex;
    justify-content: center;
  }
}

.landscape-options {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: $spacing-md;
}

.landscape-option {
  cursor: pointer;
  transition: transform $transition-normal;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  &.selected {
    transform: translateY(-5px);
    box-shadow: 0 0 0 2px $accent-color;
    border-radius: $border-radius-md;
  }
}

.landscape-distance, .landscape-difficulty {
  margin-top: $spacing-sm;
  display: flex;
  justify-content: space-between;
  padding: $spacing-xs $spacing-sm;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: $border-radius-sm;
  
  .label {
    font-weight: bold;
  }
  
  .value {
    &.easy {
      color: $success-color;
    }
    
    &.moderate {
      color: $warning-color;
    }
    
    &.hard {
      color: $danger-color-light;
    }
    
    &.very-hard {
      color: $danger-color;
    }
  }
}

.landscape-resources, .landscape-challenges {
  background-color: rgba(0, 0, 0, 0.02);
  padding: $spacing-sm;
  border-radius: $border-radius-sm;
  margin-top: $spacing-sm;
  
  h5 {
    color: $secondary-color;
    font-size: $font-size-base;
    margin-bottom: $spacing-xs;
  }
}

.resource-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  
  .resource-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: $font-size-sm;
    background-color: rgba($accent-color, 0.2);
    color: $accent-color;
  }
}

.challenge-item {
  margin-bottom: $spacing-sm;
  padding-bottom: $spacing-sm;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
  
  .challenge-name {
    font-weight: bold;
    color: $secondary-color;
  }
  
  .challenge-difficulty {
    font-size: $font-size-sm;
    color: $accent-color;
    margin-top: $spacing-xs;
  }
}

.progress-bar {
  height: 24px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  margin-bottom: $spacing-md;
  
  &__fill {
    height: 100%;
    background-color: $accent-color;
    transition: width 0.5s ease;
  }
  
  &__label {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-weight: bold;
    text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
  }
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  
  .stat-item {
    background-color: rgba(0, 0, 0, 0.02);
    padding: $spacing-sm;
    border-radius: $border-radius-sm;
    flex: 1;
    margin: 0 $spacing-xs;
    
    &:first-child {
      margin-left: 0;
    }
    
    &:last-child {
      margin-right: 0;
    }
    
    .stat-label {
      display: block;
      font-weight: bold;
      margin-bottom: $spacing-xs;
    }
    
    .stat-value {
      display: block;
      font-size: $font-size-lg;
      color: $accent-color;
      text-align: center;
    }
  }
}

.mt-3 {
  margin-top: $spacing-md;
}

.mt-4 {
  margin-top: $spacing-lg;
}

.ml-2 {
  margin-left: $spacing-sm;
}
</style>
