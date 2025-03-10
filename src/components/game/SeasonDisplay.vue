<template>
  <div class="season-display">
    <GameCard 
      :title="formatSeasonName(currentSeason?.season) || 'Unknown Season'" 
      :subtitle="'Season'"
      :cardType="CardType.SEASON"
      :season="currentSeason?.season"
    >
      <p>{{ currentSeason?.description }}</p>
      
      <div class="season-effects mt-3">
        <h4>Season Effects</h4>
        <div v-if="currentSeason?.effects && currentSeason.effects.length > 0" class="effect-list">
          <div v-for="(effect, index) in currentSeason.effects" :key="index" class="effect-list__item">
            <h6>{{ effect.name }}</h6>
            <p><strong>Effect:</strong> {{ effect.effect }}</p>
          </div>
        </div>
      </div>
      
      <div class="season-resources mt-3">
        <div v-if="currentSeason?.abundantResources?.length" class="abundant-resources">
          <h5>Abundant Resources</h5>
          <div class="resource-list">
            <div 
              v-for="resourceId in currentSeason.abundantResources" 
              :key="resourceId"
              class="resource-list__item abundant"
            >
              {{ getResourceName(resourceId) }}
            </div>
          </div>
        </div>
        
        <div v-if="currentSeason?.scarceResources?.length" class="scarce-resources mt-2">
          <h5>Scarce Resources</h5>
          <div class="resource-list">
            <div 
              v-for="resourceId in currentSeason.scarceResources" 
              :key="resourceId"
              class="resource-list__item scarce"
            >
              {{ getResourceName(resourceId) }}
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="currentSeason?.animalAffinities?.length" class="season-animals mt-3">
        <h5>Animal Affinity</h5>
        <div class="companion-list">
          <div 
            v-for="companionId in currentSeason.animalAffinities" 
            :key="companionId"
            class="companion-list__item affinity"
          >
            {{ getCompanionName(companionId) }}
          </div>
        </div>
      </div>
      
      <template #footer>
        <div v-if="currentPhase === GamePhase.SEASONAL_ASSESSMENT" class="season-actions">
          <button class="btn btn--primary" @click="acknowledgeSeasonalEffects">
            Acknowledge Seasonal Effects
          </button>
        </div>
      </template>
    </GameCard>
    
    <div class="seasonal-wheel mt-4">
      <div class="seasonal-wheel__circle" :style="seasonWheelStyle">
        <div class="seasonal-wheel__marker"></div>
        <div class="seasonal-wheel__labels">
          <span>Samhain</span>
          <span>Winter's Depth</span>
          <span>Imbolc</span>
          <span>Beltane</span>
          <span>Lughnasadh</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import { useCardStore, useGameStore } from '@/stores';
import GameCard from '@/components/core/GameCard.vue';

export default defineComponent({
  name: 'SeasonDisplay',
  components: {
    GameCard
  },
  setup() {
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    
    const currentSeason = computed(() => {
      return cardStore.getSeasonById(gameStore.currentSeason);
    });
    
    const currentPhase = computed(() => {
      return gameStore.currentPhase;
    });
    
    const seasonWheelStyle = computed(() => {
      // Calculate rotation based on current season
      let rotation = 0;
      
      if (currentSeason.value && currentSeason.value.season) {
        // Use the actual enum values for comparison
        const seasonValue = currentSeason.value.season as Season;
        
        switch (seasonValue) {
          case Season.SAMHAIN:
            rotation = 0;
            break;
          case Season.WINTERS_DEPTH:
            rotation = 72;
            break;
          case Season.IMBOLC:
            rotation = 144;
            break;
          case Season.BELTANE:
            rotation = 216;
            break;
          case Season.LUGHNASADH:
            rotation = 288;
            break;
          default:
            console.warn(`Unknown season: ${seasonValue}`);
            rotation = 0;
        }
      }
      
      return {
        transform: `rotate(${rotation}deg)`
      };
    });
    
    const getResourceName = (resourceId: string) => {
      const resource = cardStore.getResourceById(resourceId);
      return resource ? resource.name : 'Unknown Resource';
    };
    
    const getCompanionName = (companionId: string) => {
      const companion = cardStore.getAnimalCompanionById(companionId);
      return companion ? companion.name : 'Unknown Companion';
    };
    
    // Convert season enum value to a display-friendly format
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
    
    const acknowledgeSeasonalEffects = () => {
      // Apply seasonal effects
      if (currentSeason.value) {
        gameStore.addToGameLog(`The effects of ${formatSeasonName(currentSeason.value.season)} are now in play.`);
        
        // Reset animal companions' wary status for those with affinity to this season
        if (currentSeason.value.animalAffinities && currentSeason.value.animalAffinities.length > 0) {
          currentSeason.value.animalAffinities.forEach(companionId => {
            // Update companion status in the game log
            const companionName = getCompanionName(companionId);
            gameStore.addToGameLog(`${companionName} is energized by this season.`);
          });
        }
      }
      
      // Move to the next phase
      gameStore.advancePhase();
    };
    
    return {
      currentSeason,
      currentPhase,
      seasonWheelStyle,
      getResourceName,
      getCompanionName,
      formatSeasonName,
      acknowledgeSeasonalEffects,
      CardType,
      GamePhase,
      Season
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.season-effects {
  background-color: rgba(0, 0, 0, 0.05);
  padding: $spacing-md;
  border-radius: $border-radius-md;
}

.season-benefit {
  color: $success-color;
}

.resource-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin: $spacing-xs 0;
  
  &__item {
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    
    &.abundant {
      background-color: rgba($success-color, 0.2);
      border: 1px solid rgba($success-color, 0.3);
    }
    
    &.scarce {
      background-color: rgba($warning-color, 0.2);
      border: 1px solid rgba($warning-color, 0.3);
    }
  }
}

.companion-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin: $spacing-xs 0;
  
  &__item {
    padding: $spacing-xs $spacing-sm;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    
    &.affinity {
      background-color: rgba($animal-companion-color, 0.2);
      border: 1px solid rgba($animal-companion-color, 0.3);
    }
  }
}

.season-actions {
  display: flex;
  justify-content: center;
}
</style>
