<template>
  <div class="animal-companion-selection">
    <h2 class="animal-companion-selection__title">Available Companions</h2>
    
    <div class="animal-companion-selection__content">
      <div v-if="availableCompanions.length === 0" class="empty-state">
        <p>No animal companions are available in this area.</p>
        <p>Continue your journey to find potential companions.</p>
      </div>
      
      <div v-else class="companion-grid">
        <div 
          v-for="companion in availableCompanions" 
          :key="companion.id"
        >
          <GameCard
            :title="companion.name"
            :subtitle="companion.seasonalAffinity.map(s => formatSeasonName(s)).join(', ')"
            :cardType="CardType.ANIMAL_COMPANION"
            @click="selectAndBondWithCompanion(companion.id)"
          >
            <div class="companion-card-content">
              <p class="companion-description">{{ companion.abilityDescription }}</p>
              <div class="companion-resources">
                <p class="resources-label">Drawn to:</p>
                <ul class="resources-list">
                  <li v-for="(resource, index) in getPreferredResourceNames(companion)" :key="index">
                    {{ resource }}
                  </li>
                </ul>
              </div>
              <div v-if="hasCompatibleResources(companion.id)" class="compatible-resources-notice">
                You have compatible resources to bond with this companion.
              </div>
              <div v-else class="incompatible-resources-notice">
                You need to gather compatible resources.
              </div>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
    
    <!-- Bond Dialog -->
    <div class="bond-dialog-overlay" v-if="showBondDialog">
      <div class="bond-dialog">
        <div class="bond-dialog__header">
          <h3>Bond with {{ selectedCompanionName }}</h3>
          <button class="close-btn" @click="closeBondDialog">&times;</button>
        </div>
        
        <div class="bond-dialog__content">
          <p>Select a resource to form a bond:</p>
          
          <div class="resource-list">
            <div 
              v-for="resource in compatibleResources" 
              :key="resource.id"
              class="resource-item"
              :class="{ 'selected': selectedResource === resource.id }"
              @click="selectedResource = resource.id"
            >
              <span>{{ resource.name }}</span>
              <p class="resource-description">{{ resource.description }}</p>
            </div>
          </div>
        </div>
        
        <div class="bond-dialog__footer">
          <button 
            class="btn btn--primary" 
            @click="confirmBond"
            :disabled="!selectedResource"
          >
            Bond
          </button>
          <button class="btn btn--secondary" @click="closeBondDialog">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed, onMounted } from 'vue';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';
import { companionService } from '@/services/companionService';
import { Season } from '@/models/enums/seasons';
import { CardType } from '@/models/enums/cardTypes';
import GameCard from '@/components/core/GameCard.vue';

export default defineComponent({
  name: 'AnimalCompanionSelection',
  components: {
    GameCard
  },
  emits: ['select-companion'],
  setup(props, { emit }) {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    // Format season name for display
    const formatSeasonName = (season: Season): string => {
      return season.replace('_', ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    // Get available companions for current location
    const availableCompanions = computed(() => {
      // Get current location ID and season
      const locationId = gameStore.currentLandscapeId;
      
      if (!locationId) {
        return [];
      }
      
      // Define which companions are available at which landscapes (based on game rules)
      const landscapeCompanions: { [key: string]: string[] } = {
        'ancient_stone_circle': ['raven'],
        'sacred_oak_grove': ['wolf', 'deer', 'bear', 'boar'],
        'faerie_knoll': ['fox', 'hare'],
        'moonlit_loch': ['salmon', 'owl'],
        'whispering_heath': ['raven'],
        'wild_horse_plain': ['horse']
      };
      
      // Check if current landscape has any companions available
      if (!landscapeCompanions[locationId]) {
        return []; // No companions available at this landscape
      }
      
      // Get the companion IDs available at this landscape
      const availableCompanionTypes = landscapeCompanions[locationId];
      
      // Get companions that match the location and the player doesn't already have
      const companions = cardStore.animalCompanions.filter(companion => {
        // Skip companions the player already has
        if (playerStore.animalCompanions.includes(companion.id)) {
          return false;
        }
        
        // Check if companion type is available at this landscape
        // Assuming companion IDs contain the animal type (e.g., "wolf_companion")
        const companionType = companion.id.split('_')[0].toLowerCase();
        return availableCompanionTypes.includes(companionType);
      });
      
      // Add information about available companions to the journey log
      if (companions.length > 0) {
        companions.forEach(companion => {
          // Get preferred resources for this companion
          const preferredResources = companion.preferredResources || [];
          const resourceNames = preferredResources.map(resourceId => {
            const resource = cardStore.getResourceById(resourceId);
            return resource ? resource.name : resourceId;
          }).join(', ');
          
          // Check if player has compatible resources
          const canBond = hasCompatibleResources(companion.id);
          
          // Add to journey log
          gameStore.addToGameLog(
            `The ${companion.name} can be found in this area. ${canBond ? 'You have compatible resources to bond with it.' : 'You need specific resources to bond with it.'}`,
            false,
            'companion',
            {
              companionId: companion.id,
              companionName: companion.name,
              preferredResources: preferredResources,
              resourceNames: resourceNames,
              canBond: canBond,
              ability: companion.ability,
              description: companion.description
            }
          );
        });
      }
      
      return companions;
    });
    
    // Bond dialog state
    const showBondDialog = ref(false);
    const selectedCompanion = ref('');
    const selectedResource = ref('');
    
    // Select a random companion on component mount
    onMounted(() => {
      const randomCompanionId = companionService.selectRandomCompanion();
      if (randomCompanionId) {
        selectedCompanion.value = randomCompanionId;
        // Auto-open bond dialog if we have compatible resources
        if (hasCompatibleResources(randomCompanionId)) {
          bondWithCompanion(randomCompanionId);
        }
      }
    });
    
    // Get companion name for display
    const selectedCompanionName = computed(() => {
      const companion = cardStore.getCompanionById(selectedCompanion.value);
      return companion ? companion.name : '';
    });
    
    // Get compatible resources for the selected companion
    const compatibleResources = computed(() => {
      if (!selectedCompanion.value) return [];
      
      return playerStore.resources
        .filter(resourceId => 
          companionService.isResourceSuitableForBonding(resourceId, selectedCompanion.value)
        )
        .map(resourceId => cardStore.getResourceById(resourceId))
        .filter(resource => resource !== undefined) as any[];
    });
    
    // Check if player has compatible resources for a companion
    const hasCompatibleResources = (companionId: string): boolean => {
      return playerStore.resources.some(resourceId => 
        companionService.isResourceSuitableForBonding(resourceId, companionId)
      );
    };
    
    // Select a companion for detail view
    const selectCompanion = (companionId: string) => {
      emit('select-companion', companionId);
      
      // Add detailed information to journey log when a companion is selected
      const companion = cardStore.getCompanionById(companionId);
      if (companion) {
        // Get preferred resources for this companion
        const preferredResources = companion.preferredResources || [];
        const resourceNames = preferredResources.map(resourceId => {
          const resource = cardStore.getResourceById(resourceId);
          return resource ? resource.name : resourceId;
        }).join(', ');
        
        gameStore.addToGameLog(
          `You examine the ${companion.name}. It is drawn to these resources: ${resourceNames}. ${companion.ability}`,
          false,
          'companion',
          {
            companionId: companionId,
            companionName: companion.name,
            preferredResources: preferredResources,
            ability: companion.ability
          }
        );
      }
    };
    
    // Select and bond with a companion
    const selectAndBondWithCompanion = (companionId: string) => {
      selectCompanion(companionId);
      bondWithCompanion(companionId);
    };
    
    // Open bond dialog
    const bondWithCompanion = (companionId: string) => {
      selectedCompanion.value = companionId;
      const resources = playerStore.resources.filter(resourceId => 
        companionService.isResourceSuitableForBonding(resourceId, companionId)
      );
      
      if (resources.length > 0) {
        selectedResource.value = resources[0];
        showBondDialog.value = true;
      } else {
        gameStore.addToGameLog('No compatible resources available for bonding with this companion.');
      }
    };
    
    // Close bond dialog
    const closeBondDialog = () => {
      showBondDialog.value = false;
      selectedResource.value = '';
    };
    
    // Confirm bonding with companion
    const confirmBond = () => {
      if (!selectedCompanion.value || !selectedResource.value) {
        closeBondDialog();
        return;
      }
      
      const success = companionService.bondWithCompanion(
        selectedCompanion.value,
        selectedResource.value
      );
      
      if (success) {
        const companion = cardStore.getCompanionById(selectedCompanion.value);
        gameStore.addToGameLog(
          `You've bonded with ${companion?.name}!`,
          true,
          'companion'
        );
        
        // After bonding, select this companion
        selectCompanion(selectedCompanion.value);
      } else {
        gameStore.addToGameLog('Failed to bond with the companion.');
      }
      
      closeBondDialog();
    };
    
    // Get preferred resource names for a companion
    const getPreferredResourceNames = (companion: any) => {
      const preferredResources = companion.preferredResources || [];
      return preferredResources.map(resourceId => {
        const resource = cardStore.getResourceById(resourceId);
        return resource ? resource.name : resourceId;
      });
    };
    
    return {
      formatSeasonName,
      availableCompanions,
      showBondDialog,
      selectedCompanion,
      selectedResource,
      selectedCompanionName,
      compatibleResources,
      hasCompatibleResources,
      selectCompanion,
      selectAndBondWithCompanion,
      bondWithCompanion,
      closeBondDialog,
      confirmBond,
      getPreferredResourceNames
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.animal-companion-selection {
  &__title {
    margin-bottom: $spacing-md;
    color: $primary-color;
  }
  
  &__content {
    margin-bottom: $spacing-lg;
  }
}

.empty-state {
  font-style: italic;
  color: rgba($dark-color, 0.6);
  padding: $spacing-md;
  background-color: rgba($light-color, 0.5);
  border-radius: $border-radius-md;
  text-align: center;
}

.companion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: $spacing-md;
}

.companion-card-content {
  padding: $spacing-md;
}

.companion-description {
  margin-bottom: $spacing-md;
}

.companion-resources {
  margin-top: $spacing-md;
  padding-top: $spacing-md;
  border-top: 1px solid rgba($dark-color, 0.1);
}

.resources-label {
  font-weight: bold;
  margin-bottom: $spacing-xs;
}

.resources-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.compatible-resources-notice {
  color: $success-color;
  font-size: $font-size-xs;
  margin-top: $spacing-xs;
}

.incompatible-resources-notice {
  color: $danger-color;
  font-size: $font-size-xs;
  margin-top: $spacing-xs;
}

.bond-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($dark-color, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.bond-dialog {
  background-color: white;
  padding: $spacing-lg;
  border-radius: $border-radius-md;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    
    h3 {
      margin-top: 0;
    }
    
    .close-btn {
      font-size: 1.5rem;
      cursor: pointer;
    }
  }
  
  &__content {
    margin-bottom: $spacing-md;
  }
  
  &__footer {
    display: flex;
    justify-content: flex-end;
    gap: $spacing-sm;
  }
}

.resource-list {
  display: flex;
  flex-direction: column;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
}

.resource-item {
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-normal;
  
  span {
    display: block;
    font-weight: bold;
    margin-bottom: $spacing-xs;
  }
  
  .resource-description {
    font-size: $font-size-xs;
    color: rgba($dark-color, 0.7);
    margin: 0;
  }
  
  &:hover {
    border-color: $accent-color;
    background-color: rgba($accent-color, 0.1);
  }
  
  &.selected {
    border-color: $accent-color;
    background-color: rgba($accent-color, 0.2);
  }
}
</style>
