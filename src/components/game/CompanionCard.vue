<template>
  <GameCard 
    :title="companion?.name || 'Unknown Companion'" 
    :subtitle="'Animal Companion'" 
    :cardType="CardType.ANIMAL_COMPANION"
    class="companion-card"
    :class="{ 'wary': isCompanionWary }"
    @click="selectCompanion"
    style="border: 2px solid lightblue; position: relative;"
  >
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">CompanionCard</div>
    <div class="companion-card__content">
      <p>{{ companion?.description || 'No description available' }}</p>
      
      <div class="companion-loyalty mt-3">
        <h5>Loyalty Level: {{ loyalty }}</h5>
        <div class="loyalty-meter">
          <div class="loyalty-bar" :style="loyaltyBarStyle"></div>
        </div>
      </div>
      
      <div class="companion-ability mt-3" v-if="companion?.ability">
        <h5>{{ companion.ability.name }}</h5>
        <p>{{ companion.ability.description }}</p>
        <p class="ability-effect">{{ companion.ability.effect }}</p>
      </div>
      
      <div class="companion-seasons mt-3" v-if="companion?.affinitySeasons">
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
    
    <template #footer>
      <div class="companion-card__actions">
        <button 
          v-if="canFeed"
          class="btn btn--primary"
          @click.stop="openFeedDialog"
        >
          Feed Companion
        </button>
        <button 
          class="btn btn--secondary"
          @click.stop="useAbility"
          :disabled="abilityUsed || isCompanionWary"
        >
          {{ isCompanionWary ? 'Wary' : (abilityUsed ? 'Ability Used' : 'Use Ability') }}
        </button>
      </div>
    </template>
  </GameCard>

  <!-- Feed Dialog -->
  <div class="feed-dialog-overlay" v-if="showFeedDialog">
    <div class="feed-dialog">
      <div class="feed-dialog__header">
        <h3>Feed {{ companion?.name }}</h3>
        <button class="close-btn" @click="closeFeedDialog">&times;</button>
      </div>
      
      <div class="feed-dialog__content">
        <p>Select a resource to feed your companion:</p>
        
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
          <div v-if="compatibleResources.length === 0" class="empty-state">
            No compatible resources available.
          </div>
        </div>
      </div>
      
      <div class="feed-dialog__footer">
        <button 
          class="btn btn--primary" 
          @click="feedCompanion"
          :disabled="!selectedResource || compatibleResources.length === 0"
        >
          Feed
        </button>
        <button class="btn btn--secondary" @click="closeFeedDialog">
          Cancel
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, PropType } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import GameCard from '@/components/core/GameCard.vue';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';
import { companionService } from '@/services/companionService';
import { AnimalCompanionCard, ResourceCard } from '@/models/types/cards';

export default defineComponent({
  name: 'CompanionCard',
  components: {
    GameCard
  },
  props: {
    companionId: {
      type: String,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    abilityUsed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'use-ability', 'feed'],
  setup(props, { emit }) {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const showFeedDialog = ref(false);
    const selectedResource = ref('');
    
    // Get companion data
    const companion = computed(() => {
      return cardStore.getCompanionById(props.companionId);
    });
    
    // Get companion loyalty
    const loyalty = computed(() => {
      return companionService.getLoyalty(props.companionId);
    });
    
    // Loyalty bar style
    const loyaltyBarStyle = computed(() => {
      const percentage = (loyalty.value / 5) * 100;
      return {
        width: `${percentage}%`,
        backgroundColor: getLoyaltyColor(loyalty.value)
      };
    });
    
    // Compatible resources for feeding
    const compatibleResources = computed(() => {
      // Get all player resources
      const playerResourceIds = playerStore.resources;
      
      // Filter resources that are suitable for the companion
      return playerResourceIds
        .map(id => cardStore.getResourceById(id))
        .filter(resource => resource && companionService.isResourceSuitableForBonding(resource.id, props.companionId)) as ResourceCard[];
    });
    
    // Check if player has resources to feed companion
    const canFeed = computed(() => {
      return compatibleResources.value.length > 0;
    });
    
    // Check if companion is wary
    const isCompanionWary = computed(() => {
      return companionService.isCompanionWary(props.companionId);
    });
    
    // Format season name for display
    const formatSeasonName = (season: Season) => {
      return season.replace('_', ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    // Get color based on loyalty level
    const getLoyaltyColor = (loyalty: number) => {
      if (loyalty <= 1) return '#FF5252'; // Danger - Red
      if (loyalty <= 3) return '#FFC107'; // Warning - Yellow
      return '#4CAF50'; // Success - Green
    };
    
    // Select this companion
    const selectCompanion = () => {
      emit('select', props.companionId);
    };
    
    // Open feed dialog
    const openFeedDialog = () => {
      showFeedDialog.value = true;
      selectedResource.value = compatibleResources.value.length > 0 ? 
        compatibleResources.value[0].id : '';
    };
    
    // Close feed dialog
    const closeFeedDialog = () => {
      showFeedDialog.value = false;
      selectedResource.value = '';
    };
    
    // Feed companion with selected resource
    const feedCompanion = () => {
      if (!selectedResource.value) return;
      
      const success = companionService.feedCompanion(
        props.companionId,
        selectedResource.value
      );
      
      if (success) {
        const resource = cardStore.getResourceById(selectedResource.value);
        gameStore.addToGameLog(
          `You fed your ${companion.value?.name} with ${resource?.name}.`, 
          true, 
          'companion'
        );
        emit('feed', props.companionId);
      } else {
        gameStore.addToGameLog('Failed to feed your companion.');
      }
      
      closeFeedDialog();
    };
    
    // Use companion ability
    const useAbility = () => {
      if (props.abilityUsed || isCompanionWary.value) return;
      emit('use-ability', props.companionId);
    };
    
    return {
      companion,
      loyalty,
      loyaltyBarStyle,
      compatibleResources,
      canFeed,
      showFeedDialog,
      selectedResource,
      selectCompanion,
      openFeedDialog,
      closeFeedDialog,
      feedCompanion,
      useAbility,
      formatSeasonName,
      CardType,
      isCompanionWary
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.companion-card {
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }
  
  &__content {
    flex: 1;
    display: flex;
    flex-direction: column;
  }
  
  &__actions {
    display: flex;
    justify-content: space-between;
    
    button {
      flex: 1;
      margin: 0 $spacing-xs;
      
      &:first-child {
        margin-left: 0;
      }
      
      &:last-child {
        margin-right: 0;
      }
    }
  }
  
  &.wary {
    background-color: rgba($warning-color, 0.1);
    border: 1px solid $warning-color;
  }
}

.companion-loyalty {
  margin-bottom: $spacing-md;
  
  h5 {
    margin-bottom: $spacing-sm;
  }
}

.loyalty-meter {
  height: 10px;
  background-color: #eee;
  border-radius: 5px;
  overflow: hidden;
}

.loyalty-bar {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.companion-ability {
  margin-bottom: $spacing-md;
  
  h5 {
    margin-bottom: $spacing-xs;
  }
  
  .ability-effect {
    font-style: italic;
    color: $primary-color;
    margin-top: $spacing-xs;
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
    font-size: 0.8rem;
    color: white;
    
    &.samhain {
      background-color: $samhain-color;
    }
    
    &.winters_depth {
      background-color: $winter-color;
    }
    
    &.imbolc {
      background-color: $imbolc-color;
    }
    
    &.beltane {
      background-color: $beltane-color;
    }
    
    &.lughnasadh {
      background-color: $lughnasadh-color;
    }
  }
}

// Feed Dialog
.feed-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
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
  margin: $spacing-md 0;
  max-height: 200px;
  overflow-y: auto;
  border: 1px solid #eee;
  border-radius: $border-radius-sm;
}

.resource-item {
  padding: $spacing-sm;
  border-bottom: 1px solid #eee;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba($primary-color, 0.1);
  }
  
  &.selected {
    background-color: rgba($primary-color, 0.2);
  }
}

.empty-state {
  padding: $spacing-md;
  text-align: center;
  color: rgba($dark-color, 0.6);
  font-style: italic;
}
</style>
