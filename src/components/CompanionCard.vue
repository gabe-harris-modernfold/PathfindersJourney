<template>
  <ComponentWrapper componentName="CompanionCard">
    <GameCard 
      :title="companion?.name || 'Unknown Companion'" 
      :subtitle="'Animal Companion'" 
      :cardType="CardType.ANIMAL_COMPANION"
      :selected="selected"
      :disabled="isCompanionWary || abilityUsed"
      @click.prevent="$emit('select', companionId)"
    >
      <div class="companion-card__content">
        <div class="companion-loyalty">
          <div class="loyalty-meter">
            <div class="loyalty-bar" :style="loyaltyBarStyle"></div>
          </div>
        </div>
        
        <p v-if="companion?.ability">{{ parseJsonAbility(companion.ability) }}</p>
        
        <div class="companion-seasons" v-if="companion?.affinitySeasons?.length">
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
            @click.stop.prevent="openFeedDialog"
          >
            Feed
          </button>
          <button 
            class="btn"
            @click.stop.prevent="$emit('use-ability', companionId)"
            :disabled="abilityUsed || isCompanionWary"
          >
            {{ isCompanionWary ? 'Wary' : (abilityUsed ? 'Used' : 'Use') }}
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
  </ComponentWrapper>
</template>

<script>
import { defineComponent, computed, ref } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import GameCard from '@/components/GameCard.vue';
import { useServices } from '@/composables/useServices';
import { ComponentWrapper } from '@/components/common';
import { parseJsonAbility } from '@/utils/stringUtils';

export default defineComponent({
  name: 'CompanionCard',
  components: {
    GameCard,
    ComponentWrapper
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
    },
    canFeed: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'use-ability', 'feed', 'update:canFeed'],
  setup(props, { emit }) {
    const { cardRepository, companionService } = useServices();
    
    const showFeedDialog = ref(false);
    const selectedResource = ref('');
    
    // Get companion data - now using cardRepository from services
    const companion = computed(() => {
      return cardRepository.getAnimalCompanionById(props.companionId);
    });
    
    // Get companion loyalty
    const loyalty = computed(() => {
      return companionService.getLoyalty(props.companionId);
    });
    
    // Loyalty bar style - use the service method
    const loyaltyBarStyle = computed(() => {
      return companionService.getLoyaltyBarStyle(props.companionId);
    });
    
    // Compatible resources for feeding - use the service method
    const compatibleResources = computed(() => {
      return companionService.getCompatibleResources(props.companionId);
    });
    
    // Check if companion is wary
    const isCompanionWary = computed(() => {
      return companionService.isCompanionWary(props.companionId);
    });
    
    // Format season name for display - use the service method
    const formatSeasonName = (season) => {
      return companionService.formatSeasonName(season);
    };
    
    // Dialog management
    const openFeedDialog = () => {
      showFeedDialog.value = true;
    };
    
    const closeFeedDialog = () => {
      showFeedDialog.value = false;
      selectedResource.value = '';
    };
    
    const feedCompanion = () => {
      if (selectedResource.value) {
        emit('update:canFeed', false);
        emit('feed', props.companionId, selectedResource.value);
        closeFeedDialog();
      }
    };
    
    return {
      companion,
      loyalty,
      loyaltyBarStyle,
      isCompanionWary,
      compatibleResources,
      showFeedDialog,
      selectedResource,
      formatSeasonName,
      openFeedDialog,
      closeFeedDialog,
      feedCompanion,
      parseJsonAbility,
      CardType
    };
  }
});
</script>

<style lang="scss" scoped>
.companion-card__content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

.companion-loyalty {
  margin-bottom: 8px;
}

.loyalty-meter {
  height: 8px;
  background-color: #eee;
  border-radius: 4px;
  overflow: hidden;
}

.loyalty-bar {
  height: 100%;
  transition: width 0.3s, background-color 0.3s;
}

.season-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
  margin-top: 4px;
}

.season-tag {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  
  &.samhain {
    background-color: #8b6a2c;
    color: white;
  }
  
  &.winters_depth {
    background-color: #b3c7d6;
    color: #333;
  }
  
  &.imbolc {
    background-color: #c6d8c6;
    color: #333;
  }
  
  &.beltane {
    background-color: #f7c9a9;
    color: #333;
  }
  
  &.lughnasadh {
    background-color: #f0d9a0;
    color: #333;
  }
}

.companion-card__actions {
  display: flex;
  gap: 4px;
  
  .btn {
    flex: 1;
    padding: 4px;
    border-radius: 4px;
    font-size: 0.8rem;
    background: #e6d7b9;
    border: 1px solid #8c7851;
    cursor: pointer;
    
    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    
    &--primary {
      background: #5a3e2b;
      color: white;
    }
  }
}

// Feed Dialog Styles
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
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 400px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  
  &__header {
    padding: 16px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;
    
    h3 {
      margin: 0;
      color: #5a3e2b;
    }
    
    .close-btn {
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      color: #999;
      
      &:hover {
        color: #333;
      }
    }
  }
  
  &__content {
    padding: 16px;
    
    .resource-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
      margin-top: 12px;
      max-height: 200px;
      overflow-y: auto;
    }
    
    .resource-item {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      cursor: pointer;
      transition: all 0.2s;
      
      &:hover {
        background-color: #f5f5f5;
      }
      
      &.selected {
        background-color: rgba(76, 175, 80, 0.1);
        border-color: #4CAF50;
      }
    }
    
    .empty-state {
      padding: 16px;
      text-align: center;
      color: #999;
      font-style: italic;
    }
  }
  
  &__footer {
    padding: 16px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 8px;
  }
}
</style>