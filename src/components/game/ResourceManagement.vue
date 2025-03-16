<template>
  <div class="resource-management">
    <div v-if="currentPhase !== GamePhase.RESOURCE_MANAGEMENT" class="resource-management__inactive">
      <p>Resource management is not available during the current phase.</p>
    </div>
    
    <div v-else class="resource-management__active">
      <div class="resource-cards-row">
        <!-- Resource Cards -->
        <div 
          v-for="resource in playerResources" 
          :key="resource.id"
          class="resource-card"
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
        
        <!-- Action Cards -->
        <template v-if="selectedResourceId">
          <div class="action-card">
            <GameCard 
              title="Use Resource" 
              cardType="ACTION"
              @click="useResource"
              :class="{ 'disabled': !canUseSelectedResource }"
            >
              <div style="font-size: 0.9rem; padding: 5px; text-align: center;">
                Apply the resource's special effect
              </div>
            </GameCard>
          </div>
          
          <div class="action-card">
            <GameCard 
              title="Discard Resource" 
              cardType="ACTION"
              @click="discardResource"
            >
              <div style="font-size: 0.9rem; padding: 5px; text-align: center;">
                Remove this resource from inventory
              </div>
            </GameCard>
          </div>
          
          <div class="action-card">
            <GameCard 
              title="Cancel" 
              cardType="ACTION"
              @click="cancelSelection"
            >
              <div style="font-size: 0.9rem; padding: 5px; text-align: center;">
                Return to resource management
              </div>
            </GameCard>
          </div>
        </template>
        
        <template v-else>
          <div class="action-card">
            <GameCard 
              title="Gather Resources" 
              cardType="ACTION"
              @click="gatherResources"
            >
              <div style="font-size: 0.9rem; padding: 5px; text-align: center;">
                Collect resources from the environment
              </div>
            </GameCard>
          </div>
          
          <div class="action-card">
            <GameCard 
              title="Continue Journey" 
              cardType="ACTION"
              @click="continueJourney"
            >
              <div style="font-size: 0.9rem; padding: 5px; text-align: center;">
                Proceed to the next phase of your adventure
              </div>
            </GameCard>
          </div>
        </template>
      </div>
      
      <div v-if="playerResources.length === 0" class="empty-state mt-3">
        You don't have any resources. Explore landscapes to gather resources.
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
    
    const gatherResources = () => {
      // Call the gatherResources method from gameStore
      gameStore.gatherResources();
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
      gatherResources,
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
  
  &__inactive {
    background-color: rgba(0, 0, 0, 0.05);
    padding: $spacing-md;
    border-radius: $border-radius-md;
    text-align: center;
  }
  
  &__active {
    display: flex;
    flex-direction: column;
  }
}

.resource-cards-row {
  display: flex;
  flex-wrap: nowrap;
  gap: 15px;
  justify-content: flex-start;
  overflow-x: auto;
  padding-bottom: 10px;
}

.resource-card, .action-card {
  flex: 0 0 auto;
  width: 185px;
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
  
  .game-card {
    background-color: #f9eeda;
    border: 1px solid #d3c7a7;
    border-radius: $border-radius-md;
    height: 100%;
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-md;
  font-style: italic;
  color: $secondary-color;
}

.season-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  
  .season-tag {
    padding: 2px 6px;
    border-radius: 12px;
    font-size: 0.8rem;
    
    &.imbolc {
      background-color: #e6f7ff;
      color: #0066cc;
    }
    
    &.beltane {
      background-color: #f0fff0;
      color: #228b22;
    }
    
    &.lughnasadh {
      background-color: #fff0e0;
      color: #b25900;
    }
    
    &.samhain {
      background-color: #f9e6ff;
      color: #5a008a;
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
