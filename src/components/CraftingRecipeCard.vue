<template>
  <ComponentWrapper componentName="CraftingRecipeCard">
    <GameCard 
      :title="recipe.name" 
      :subtitle="`Complexity: ${recipe.complexity}`" 
      :cardType="CardType.CRAFTED_ITEM"
      :selected="selected"
      :disabled="!canCraft"
      @click.prevent="$emit('select', recipe.id)"
    >
      <div class="recipe-card__content">
        <p>{{ truncateDescription(recipe.description) }}</p>
        
        <div class="recipe-resources">
          <h5>Required:</h5>
          <div class="resource-list">
            <div 
              v-for="resourceId in recipe.requiredResources" 
              :key="resourceId"
              class="resource-tag"
              :class="{ 'available': hasResource(resourceId), 'missing': !hasResource(resourceId) }"
            >
              {{ getResourceName(resourceId) }}
            </div>
          </div>
        </div>
        
        <div class="recipe-ability" v-if="recipe.ability">
          <p class="ability-name">{{ recipe.ability.name }}</p>
        </div>
      </div>
      
      <template #footer v-if="showActions">
        <div class="recipe-card__actions">
          <button 
            class="btn btn--primary"
            @click.stop.prevent="$emit('craft', recipe.id)"
            :disabled="!canCraft"
          >
            Craft
          </button>
          <button 
            class="btn"
            @click.stop.prevent="$emit('cancel')"
          >
            Cancel
          </button>
        </div>
      </template>
    </GameCard>
  </ComponentWrapper>
</template>
  
<script>
import { defineComponent, computed } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import GameCard from '@/components/GameCard.vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useServices } from '@/composables/useServices';
import { ComponentWrapper } from '@/components/common';
  
export default defineComponent({
  name: 'CraftingRecipeCard',
  components: {
    GameCard,
    ComponentWrapper
  },
  props: {
    recipe: {
      type: Object,
      required: true
    },
    selected: {
      type: Boolean,
      default: false
    },
    showActions: {
      type: Boolean,
      default: false
    }
  },
  emits: ['select', 'craft', 'cancel'],
  setup(props) {
    const playerStore = usePlayerStore();
    const { craftingService, cardRepository } = useServices();
    
    // Check if player has a specific resource
    const hasResource = (resourceId) => {
      return craftingService.hasResource(resourceId);
    };
    
    // Get the name of a resource
    const getResourceName = (resourceId) => {
      return craftingService.getResourceName(resourceId);
    };
    
    // Check if player can craft this item
    const canCraft = computed(() => {
      return craftingService.canCraftItem(props.recipe.id);
    });
    
    // Truncate description for display
    const truncateDescription = (text) => {
      return craftingService.truncateDescription(text);
    };
    
    return {
      hasResource,
      getResourceName,
      canCraft,
      truncateDescription,
      CardType
    };
  }
});
</script>
  
<style lang="scss" scoped>
.recipe-card__content {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
  font-size: 0.9rem;
}

.recipe-resources {
  margin-top: 6px;
  
  h5 {
    margin: 0 0 4px 0;
    font-size: 0.9rem;
  }
}

.resource-list {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  justify-content: center;
}

.resource-tag {
  font-size: 0.7rem;
  padding: 2px 6px;
  border-radius: 10px;
  
  &.available {
    background-color: rgba(76, 175, 80, 0.2);
    color: #2e7d32;
  }
  
  &.missing {
    background-color: rgba(244, 67, 54, 0.2);
    color: #c62828;
  }
}

.recipe-ability {
  margin-top: 6px;
  
  .ability-name {
    font-weight: bold;
    font-size: 0.8rem;
    color: #5a3e2b;
  }
}

.recipe-card__actions {
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
</style>