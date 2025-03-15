<template>
  <div class="seasonal-assessment-card" style="position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: #f0c8a0; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">SeasonalAssessmentCard</div>
    
    <GameCard
      :title="formatSeasonName(currentSeason?.season) || 'Unknown Season'"
      subtitle="Seasonal Assessment"
      :cardType="CardType.SEASON"
      :season="currentSeason?.season"
    >
      <div class="seasonal-assessment-content">
        <p class="seasonal-introduction">
          The wheel of time turns to {{ formatSeasonName(currentSeason?.season) }}. 
          The Celtic Realm changes with the seasons, influencing your journey in both seen and unseen ways.
        </p>
        
        <!-- Season Description -->
        <div class="season-description my-2">
          <p>{{ currentSeason?.description }}</p>
        </div>
        
        <!-- Season Effects -->
        <div class="season-effects mt-3">
          <h4>Season Effects</h4>
          <div v-if="currentSeason?.effects && currentSeason.effects.length > 0" class="effect-list">
            <div v-for="(effect, index) in currentSeason.effects" :key="index" class="effect-card">
              <div class="effect-header">{{ effect.name }}</div>
              <div class="effect-body">{{ effect.effect }}</div>
            </div>
          </div>
        </div>
        
        <!-- Resources & Companions -->
        <div class="resource-companion-grid mt-3">
          <div class="grid-column">
            <div v-if="currentSeason?.abundantResources?.length" class="abundant-resources">
              <h5>Abundant Resources</h5>
              <ul class="resource-list">
                <li v-for="resourceId in currentSeason.abundantResources" :key="resourceId" class="abundant">
                  {{ getResourceName(resourceId) }}
                </li>
              </ul>
            </div>
            
            <div v-if="currentSeason?.scarceResources?.length" class="scarce-resources mt-2">
              <h5>Scarce Resources</h5>
              <ul class="resource-list">
                <li v-for="resourceId in currentSeason.scarceResources" :key="resourceId" class="scarce">
                  {{ getResourceName(resourceId) }}
                </li>
              </ul>
            </div>
          </div>
          
          <div class="grid-column">
            <div v-if="currentSeason?.animalAffinities?.length" class="animal-affinities">
              <h5>Animal Affinities</h5>
              <ul class="animal-list">
                <li v-for="companionId in currentSeason.animalAffinities" :key="companionId" class="affinity">
                  {{ getCompanionName(companionId) }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <template #footer>
        <div class="season-actions">
          <button class="btn btn--primary" @click="acknowledgeSeasonalEffects" style="font-weight: bold; padding: 10px 20px; font-size: 1rem; border-radius: 6px; cursor: pointer; background: linear-gradient(to bottom, #8c7851, #5a3e2b); border: 2px solid #f0c8a0; color: #fff; transition: all 0.3s ease;">
            Embrace the Season
          </button>
        </div>
      </template>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import { useCardStore } from '@/stores/cardStore';
import { useGameStore } from '@/stores/gameStore';
import GameCard from '@/components/core/GameCard.vue';

// Initialize stores
const cardStore = useCardStore();
const gameStore = useGameStore();

// Get the current season data
const currentSeason = computed(() => {
  return cardStore.getSeasonById(gameStore.currentSeason);
});

// Helper methods for displaying resource and companion names
const getResourceName = (resourceId: string) => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : 'Unknown Resource';
};

const getCompanionName = (companionId: string) => {
  const companion = cardStore.getAnimalCompanionById(companionId);
  return companion ? companion.name : 'Unknown Companion';
};

// Format season name for display
const formatSeasonName = (season: Season): string => {
  // Handle various season formats
  switch (season) {
    case Season.SAMHAIN:
      return 'Samhain';
    case Season.WINTERS_DEPTH:
      return 'Winter\'s Depth';
    case Season.IMBOLC:
      return 'Imbolc';
    case Season.BELTANE:
      return 'Beltane';
    case Season.LUGHNASADH:
      return 'Lughnasadh';
    default:
      return String(season).replace(/([A-Z])/g, ' $1').trim();
  }
};

// Handle the acknowledgment of seasonal effects and advance to the next phase
const acknowledgeSeasonalEffects = () => {
  if (currentSeason.value) {
    gameStore.addToGameLog(`The influences of ${formatSeasonName(currentSeason.value.season)} spread across the Celtic Realm.`, true);
    
    // Apply any seasonal effects
    if (currentSeason.value.effects && currentSeason.value.effects.length > 0) {
      currentSeason.value.effects.forEach(effect => {
        gameStore.addToGameLog(`${effect.name}: ${effect.effect}`, false, 'system');
      });
    }
    
    // Highlight animal companions that have affinity with this season
    if (currentSeason.value.animalAffinities && currentSeason.value.animalAffinities.length > 0) {
      const affinityCompanions = currentSeason.value.animalAffinities
        .map(id => getCompanionName(id))
        .join(', ');
      
      gameStore.addToGameLog(`The following companions are energized by this season: ${affinityCompanions}`, false, 'companion');
    }
  }
  
  // Move to the next phase
  gameStore.advancePhase();
};
</script>

<style lang="scss" scoped>
.seasonal-assessment-card {
  max-width: 400px;
  margin: 0 auto;
}

.seasonal-introduction {
  font-style: italic;
  color: #5a3e2b;
  font-size: 0.95rem;
  text-align: center;
  margin-bottom: 1rem;
  font-family: 'Tangerine', cursive;
  font-size: 1.4rem;
}

.effect-card {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  
  .effect-header {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 4px 8px;
    font-weight: bold;
    font-size: 0.9rem;
  }
  
  .effect-body {
    padding: 6px 8px;
    font-size: 0.85rem;
  }
}

.resource-companion-grid {
  display: flex;
  gap: 1rem;
  
  .grid-column {
    flex: 1;
  }
}

h4, h5 {
  margin-top: 0;
  margin-bottom: 0.5rem;
  color: #5a3e2b;
}

h4 {
  font-size: 1.1rem;
}

h5 {
  font-size: 0.9rem;
}

ul.resource-list, ul.animal-list {
  list-style: none;
  padding-left: 0;
  margin: 0;
  
  li {
    font-size: 0.85rem;
    margin-bottom: 3px;
    padding: 2px 6px;
    border-radius: 4px;
    
    &.abundant {
      background-color: rgba(76, 175, 80, 0.1);
      border-left: 3px solid #4CAF50;
    }
    
    &.scarce {
      background-color: rgba(244, 67, 54, 0.1);
      border-left: 3px solid #F44336;
    }
    
    &.affinity {
      background-color: rgba(33, 150, 243, 0.1);
      border-left: 3px solid #2196F3;
    }
  }
}

.season-actions {
  margin-top: 0.5rem;
}

// Seasonal color themes
.samhain {
  background-color: rgba(139, 69, 19, 0.1);
}

.winters_depth {
  background-color: rgba(176, 224, 230, 0.1);
}

.imbolc {
  background-color: rgba(144, 238, 144, 0.1);
}

.beltane {
  background-color: rgba(255, 165, 0, 0.1);
}

.lughnasadh {
  background-color: rgba(255, 215, 0, 0.1);
}
</style>
