<template>
  <div class="resource-management">
    <h3 class="resource-management__title">Resource Management</h3>
    
    <div v-if="currentPhase !== GamePhase.RESOURCE_MANAGEMENT" class="resource-management__inactive">
      <p>Resource management is not available during the current phase.</p>
    </div>
    
    <div v-else class="resource-management__active">
      <div class="resource-management__inventory">
        <h4>Your Resources ({{ playerResources.length }} / {{ resourceCapacity }})</h4>
        <div v-if="playerResources.length === 0" class="empty-state">
          You don't have any resources. Explore landscapes to gather resources.
        </div>
        <div v-else class="resource-grid">
          <div 
            v-for="resource in playerResources" 
            :key="resource.id"
            class="resource-grid__item"
            :class="{ 'selected': selectedResourceId === resource.id }"
            @click="selectResource(resource)"
          >
            <GameCard 
              :title="resource.name" 
              :subtitle="'Resource'" 
              :cardType="CardType.RESOURCE"
            >
              <p>{{ resource.description }}</p>
              
              <div class="resource-type mt-3" v-if="resource.rarity">
                <h5>Rarity: {{ resource.rarity }}</h5>
                <p>{{ getRarityDescription(resource.rarity) }}</p>
              </div>
              
              <div class="resource-seasons mt-3" v-if="resource.seasonalAbundance && resource.seasonalAbundance.length">
                <h5>Seasonal Availability</h5>
                <div class="season-tags">
                  <span 
                    v-for="season in resource.seasonalAbundance" 
                    :key="season"
                    class="season-tag"
                    :class="getSeasonClassName(season)"
                  >
                    {{ formatSeasonName(season) }}
                  </span>
                </div>
              </div>
              
              <div class="resource-special-effect mt-3" v-if="resource.specialEffect">
                <h5>Special Effect</h5>
                <p>{{ resource.specialEffect.description }}</p>
              </div>
            </GameCard>
          </div>
        </div>
      </div>
      
      <div v-if="selectedResourceId" class="resource-management__actions mt-4">
        <button 
          class="btn btn--primary" 
          @click="useResource"
          :disabled="!canUseSelectedResource"
        >
          Use Resource
        </button>
        <button 
          class="btn btn--secondary ml-2" 
          @click="discardResource"
        >
          Discard Resource
        </button>
        <button 
          class="btn btn--accent ml-2" 
          @click="cancelSelection"
        >
          Cancel
        </button>
      </div>
      
      <div class="resource-management__continue mt-4">
        <button 
          class="btn btn--primary btn--lg" 
          @click="continueJourney"
        >
          Continue Journey
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { GamePhase } from '@/models/enums/phases';
import { CardType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';
import { ResourceCard } from '@/models/types/cards';
import GameCard from '@/components/core/GameCard.vue';

export default defineComponent({
  name: 'ResourceManagement',
  components: {
    GameCard
  },
  setup() {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const selectedResourceId = ref<string | null>(null);
    
    const currentPhase = computed(() => {
      return gameStore.currentPhase;
    });
    
    const playerResources = computed(() => {
      const resourceIds = playerStore.resources;
      return resourceIds.map(id => cardStore.getResourceById(id)).filter(Boolean) as ResourceCard[];
    });
    
    const resourceCapacity = computed(() => {
      return playerStore.resourceCapacity;
    });
    
    const selectedResource = computed(() => {
      if (!selectedResourceId.value) return null;
      return playerResources.value.find(r => r.id === selectedResourceId.value) || null;
    });
    
    const canUseSelectedResource = computed(() => {
      if (!selectedResource.value) return false;
      
      // Check if the resource has a special effect
      return !!selectedResource.value.specialEffect;
    });
    
    const selectResource = (resource: ResourceCard) => {
      selectedResourceId.value = resource.id;
    };
    
    const useResource = () => {
      if (!selectedResource.value) return;
      
      // Apply the resource effect
      const resource = selectedResource.value;
      
      if (resource.specialEffect) {
        // Apply the effect based on the resource type
        gameStore.addToGameLog(`Used ${resource.name}: ${resource.specialEffect.description}`);
        
        // Remove the resource after use
        playerStore.removeResource(resource.id);
        
        // Reset selection
        selectedResourceId.value = null;
      }
    };
    
    const discardResource = () => {
      if (!selectedResource.value) return;
      
      // Remove the resource
      playerStore.removeResource(selectedResource.value.id);
      gameStore.addToGameLog(`Discarded ${selectedResource.value.name}`);
      
      // Reset selection
      selectedResourceId.value = null;
    };
    
    const cancelSelection = () => {
      selectedResourceId.value = null;
    };
    
    const continueJourney = () => {
      gameStore.advancePhase();
    };
    
    // Convert season value to a CSS class name
    const getSeasonClassName = (season: string): string => {
      // Always return lowercase values for CSS classes
      if (typeof season === 'string') {
        return season.toLowerCase().replace(/_/g, '-');
      }
      return '';
    };
    
    const formatSeasonName = (season: string): string => {
      // Handle various season formats
      if (typeof season !== 'string') {
        return 'Unknown Season';
      }
      
      // Try to match with Season enum values
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
          // For legacy string values that aren't enum values
          return season.replace(/_/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace('Winters Depth', 'Winter\'s Depth');
      }
    };
    
    const getRarityDescription = (rarity: string) => {
      switch (rarity) {
        case 'common':
          return 'Commonly found throughout the Celtic Realm.';
        case 'uncommon':
          return 'Somewhat rare, but can be found in specific locations.';
        case 'rare':
          return 'Very rare and valuable, found only in special circumstances.';
        default:
          return 'Unknown rarity.';
      }
    };
    
    return {
      currentPhase,
      GamePhase,
      CardType,
      playerResources,
      resourceCapacity,
      selectedResource,
      selectedResourceId,
      canUseSelectedResource,
      selectResource,
      useResource,
      discardResource,
      cancelSelection,
      continueJourney,
      formatSeasonName,
      getSeasonClassName,
      getRarityDescription
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.resource-management {
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
  
  &__inventory {
    background-color: white;
    border-radius: $border-radius-md;
    box-shadow: $shadow-sm;
    padding: $spacing-md;
    
    h4 {
      margin-bottom: $spacing-md;
      color: $secondary-color;
    }
  }
  
  &__actions, &__continue {
    display: flex;
    justify-content: center;
  }
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: $spacing-md;
  
  &__item {
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
}

.resource-type, .resource-affinity, .resource-seasons, .resource-special-effect {
  margin-top: $spacing-sm;
  padding: $spacing-xs $spacing-sm;
  background-color: rgba(0, 0, 0, 0.02);
  border-radius: $border-radius-sm;
  
  h5 {
    color: $secondary-color;
    font-size: $font-size-base;
    margin-bottom: $spacing-xs;
  }
}

.season-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  
  .season-tag {
    display: inline-block;
    padding: 2px 8px;
    border-radius: 12px;
    font-size: $font-size-sm;
    
    &.samhain {
      background-color: rgba($danger-color, 0.2);
      color: $danger-color;
    }
    
    &.winters-depth {
      background-color: rgba($primary-color, 0.2);
      color: $primary-color;
    }
    
    &.imbolc {
      background-color: rgba($success-color, 0.2);
      color: $success-color;
    }
    
    &.beltane {
      background-color: rgba($warning-color, 0.2);
      color: darken($warning-color, 10%);
    }
    
    &.lughnasadh {
      background-color: rgba($accent-color, 0.2);
      color: $accent-color;
    }
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-lg;
  color: $secondary-color;
  font-style: italic;
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
