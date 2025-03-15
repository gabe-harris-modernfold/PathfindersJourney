<template>
  <div class="companion-management">
    <div class="companion-management__header">
      <h2 class="companion-management__title">Animal Companions</h2>
    </div>
    
    <div class="companion-management__content">
      <div v-if="playerCompanions.length === 0" class="empty-state">
        <p>You haven't bonded with any animal companions yet.</p>
        <p>Find a suitable companion and use a resource to form a bond.</p>
      </div>
      
      <div v-else class="companion-cards">
        <CompanionCard
          v-for="companionId in playerCompanions"
          :key="companionId"
          :companionId="companionId"
          :abilityUsed="usedCompanionAbilities.includes(companionId)"
          :canFeed="hasCompatibleResources(companionId)"
          @select="selectCompanion"
          @feed="openFeedDialog"
          @use-ability="useCompanionAbility"
        />
      </div>
    </div>
    
    <h3 class="mt-4">Available Companions</h3>
    <div class="available-companions">
      <div v-if="availableCompanions.length === 0" class="empty-state">
        <p>No companions are available in this area.</p>
        <p>Continue exploring to find potential companions.</p>
      </div>
      
      <div v-else class="companion-cards">
        <div
          v-for="companion in availableCompanions"
          :key="companion.id"
          class="available-companion-card"
          @click="selectAvailableCompanion(companion.id)"
        >
          <div class="available-companion-card__header">
            <h4>{{ companion.name }}</h4>
          </div>
          <div class="available-companion-card__content">
            <p>{{ companion.description }}</p>
            <div class="companion-ability mt-2">
              <h5>{{ companion.ability.name }}</h5>
              <p class="ability-description">{{ companion.ability.description }}</p>
            </div>
            <div class="companion-seasons mt-2">
              <h5>Seasonal Affinity</h5>
              <div class="season-tags">
                <span
                  v-for="season in companion.affinitySeasons"
                  :key="season"
                  class="season-tag"
                  :class="season.toLowerCase()"
                >
                  {{ formatSeasonName(season) }}
                </span>
              </div>
            </div>
          </div>
          <div class="available-companion-card__footer">
            <button 
              class="btn btn--primary"
              @click.stop="openBondDialog(companion.id)"
              :disabled="!hasResourcesForBonding(companion.id)"
            >
              Bond
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Bond Dialog -->
    <div class="feed-dialog-overlay" v-if="showBondDialog">
      <div class="feed-dialog">
        <div class="feed-dialog__header">
          <h3>Bond with {{ selectedCompanionName }}</h3>
          <button class="close-btn" @click="closeBondDialog">&times;</button>
        </div>
        
        <div class="feed-dialog__content">
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
            </div>
          </div>
        </div>
        
        <div class="feed-dialog__footer">
          <button 
            class="btn btn--primary" 
            @click="bondWithCompanion"
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
import { defineComponent, computed, ref } from 'vue';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';
import { companionService } from '@/services/companionService';
import CompanionCard from './CompanionCard.vue';
import { Season } from '@/models/enums/seasons';

export default defineComponent({
  name: 'CompanionManagement',
  components: {
    CompanionCard
  },
  emits: ['close'],
  setup(props, { emit }) {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    // Player companions
    const playerCompanions = computed(() => playerStore.animalCompanions);
    
    // Available companions for bonding
    const availableCompanions = computed(() => {
      const allCompanions = cardStore.animalCompanions;
      return allCompanions.filter(companion => 
        !playerCompanions.value.includes(companion.id) &&
        isCompanionAvailableInSeason(companion)
      );
    });
    
    // Check if companion is available in current season
    const isCompanionAvailableInSeason = (companion: any) => {
      const currentSeason = gameStore.currentSeason;
      return companion.affinitySeasons && companion.affinitySeasons.includes(currentSeason);
    };
    
    // Format season name for display
    const formatSeasonName = (season: Season) => {
      return season.replace('_', ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    // Tracking used abilities
    const usedCompanionAbilities = ref<string[]>([]);
    
    // Selection state
    const selectedCompanion = ref('');
    const selectedAvailableCompanion = ref('');
    
    // Bond dialog state
    const showBondDialog = ref(false);
    const selectedResource = ref('');
    
    // Get resources compatible with a companion
    const getCompatibleResources = (companionId: string) => {
      return playerStore.resources.filter(resourceId => 
        companionService.isResourceSuitableForBonding(resourceId, companionId)
      );
    };
    
    // Check if player has compatible resources for a companion
    const hasCompatibleResources = (companionId: string) => {
      return getCompatibleResources(companionId).length > 0;
    };
    
    // Check if player has resources for bonding with a companion
    const hasResourcesForBonding = (companionId: string) => {
      return playerStore.resources.some(resourceId => 
        companionService.isResourceSuitableForBonding(resourceId, companionId)
      );
    };
    
    // Get companion name
    const selectedCompanionName = computed(() => {
      const companion = cardStore.getCompanionById(selectedAvailableCompanion.value);
      return companion ? companion.name : '';
    });
    
    // Get compatible resources for the selected companion
    const compatibleResources = computed(() => {
      if (!selectedAvailableCompanion.value) return [];
      
      return playerStore.resources
        .filter(resourceId => 
          companionService.isResourceSuitableForBonding(resourceId, selectedAvailableCompanion.value)
        )
        .map(resourceId => cardStore.getResourceById(resourceId))
        .filter(resource => resource !== undefined) as any[];
    });
    
    // Select a companion
    const selectCompanion = (companionId: string) => {
      selectedCompanion.value = companionId;
    };
    
    // Select an available companion
    const selectAvailableCompanion = (companionId: string) => {
      selectedAvailableCompanion.value = companionId;
    };
    
    // Open bond dialog
    const openBondDialog = (companionId: string) => {
      selectedAvailableCompanion.value = companionId;
      const resources = getCompatibleResources(companionId);
      
      if (resources.length > 0) {
        selectedResource.value = resources[0];
        showBondDialog.value = true;
      } else {
        gameStore.addToGameLog('No compatible resources for bonding with this companion.');
      }
    };
    
    // Close bond dialog
    const closeBondDialog = () => {
      showBondDialog.value = false;
      selectedResource.value = '';
    };
    
    // Bond with a companion
    const bondWithCompanion = () => {
      if (!selectedAvailableCompanion.value || !selectedResource.value) {
        closeBondDialog();
        return;
      }
      
      const success = companionService.bondWithCompanion(
        selectedAvailableCompanion.value,
        selectedResource.value
      );
      
      if (success) {
        const companion = cardStore.getCompanionById(selectedAvailableCompanion.value);
        gameStore.addToGameLog(
          `You've formed a bond with ${companion?.name}!`,
          true,
          'companion'
        );
      } else {
        gameStore.addToGameLog('Failed to bond with the companion.');
      }
      
      closeBondDialog();
    };
    
    // Use companion ability
    const useCompanionAbility = (companionId: string) => {
      if (usedCompanionAbilities.value.includes(companionId)) {
        return;
      }
      
      const success = playerStore.useCompanionAbility(companionId);
      
      if (success) {
        usedCompanionAbilities.value.push(companionId);
        
        const companion = cardStore.getCompanionById(companionId);
        gameStore.addToGameLog(
          `You used ${companion?.name}'s ability: ${companion?.ability.name}`,
          true,
          'companion'
        );
      } else {
        gameStore.addToGameLog('You cannot use this companion\'s ability right now.');
      }
    };
    
    // Reset used abilities when turn changes
    gameStore.$subscribe((_, state) => {
      if (state.currentTurn > 0) {
        usedCompanionAbilities.value = [];
      }
    });
    
    // Open feed dialog - passes to CompanionCard
    const openFeedDialog = (companionId: string) => {
      console.log(`Open feed dialog for companion ${companionId}`);
      // Handled by CompanionCard component
    };
    
    // Emit close event to parent
    const emitClose = () => {
      emit('close');
    };
    
    return {
      playerCompanions,
      availableCompanions,
      usedCompanionAbilities,
      selectedCompanion,
      showBondDialog,
      selectedResource,
      selectedCompanionName,
      compatibleResources,
      selectCompanion,
      selectAvailableCompanion,
      openBondDialog,
      closeBondDialog,
      bondWithCompanion,
      useCompanionAbility,
      hasCompatibleResources,
      hasResourcesForBonding,
      formatSeasonName,
      openFeedDialog,
      emitClose
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.companion-management {
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
  }
  
  &__title {
    margin: 0;
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

.companion-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: $spacing-md;
  margin-top: $spacing-sm;
}

.available-companion-card {
  background-color: $light-color;
  border: 2px solid $border-color;
  border-radius: $border-radius-md;
  box-shadow: $shadow-sm;
  padding: $spacing-sm;
  cursor: pointer;
  transition: all $transition-normal;
  position: relative;
  min-height: 180px;
  
  // Card appearance
  background-image: linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.2) 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: calc($border-radius-md - 3px);
    pointer-events: none;
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-md;
  }
  
  &__header {
    margin-bottom: $spacing-sm;
    
    h4 {
      font-weight: bold;
      margin: 0;
      color: $primary-color;
    }
  }
  
  &__content {
    font-size: $font-size-sm;
    margin-bottom: $spacing-md;
    
    p {
      margin-bottom: $spacing-sm;
    }
    
    .companion-ability {
      margin-top: $spacing-sm;
      
      h5 {
        margin: 0 0 $spacing-xs 0;
        font-size: $font-size-sm;
      }
      
      .ability-description {
        font-size: $font-size-xs;
        color: rgba($dark-color, 0.7);
      }
    }
    
    .companion-seasons {
      margin-top: $spacing-sm;
      
      h5 {
        margin: 0 0 $spacing-xs 0;
        font-size: $font-size-sm;
      }
    }
  }
  
  &__footer {
    display: flex;
    justify-content: flex-end;
  }
}

.season-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
}

.season-tag {
  font-size: $font-size-xs;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-md;
  color: $light-color;
  
  &.spring {
    background-color: #7cb342;
  }
  
  &.summer {
    background-color: #f9a825;
  }
  
  &.fall, &.autumn {
    background-color: #ef6c00;
  }
  
  &.winter {
    background-color: #42a5f5;
  }
}

// Feed/Bond Dialog styling from CompanionCard to maintain consistency
.feed-dialog-overlay {
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

.feed-dialog {
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
  flex-wrap: wrap;
  gap: $spacing-sm;
  margin-top: $spacing-sm;
}

.resource-item {
  padding: $spacing-sm;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  transition: all $transition-normal;
  
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
