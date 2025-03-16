<template>
  <div class="crafting-station" style="border: 2px solid lightblue; position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">CraftingStation</div>
    <h3 class="crafting-station__title">Crafting Station</h3>
    
    <div v-if="currentPhase !== GamePhase.CRAFTING" class="crafting-station__inactive">
      <p>Crafting is not available during the current phase.</p>
    </div>
    
    <div v-else class="crafting-station__active">
      <div class="crafting-station__recipes">
        <h4>Available Recipes</h4>
        <div v-if="availableRecipes.length === 0" class="empty-state">
          You don't have enough resources to craft any items.
        </div>
        <div v-else class="recipe-list">
          <div 
            v-for="item in availableRecipes" 
            :key="item.id"
            class="recipe-list__item"
            :class="{ 'selected': selectedRecipe?.id === item.id }"
            @click="selectRecipe(item)"
          >
            <h5>{{ item.name }}</h5>
            <div class="recipe-complexity">Complexity: {{ item.complexity }}</div>
            <div class="recipe-resources">
              <div>Required Resources:</div>
              <ul>
                <li v-for="resourceId in item.requiredResources" :key="resourceId">
                  {{ getResourceName(resourceId) }}
                  <span 
                    class="resource-status"
                    :class="{ 'available': hasResource(resourceId), 'missing': !hasResource(resourceId) }"
                  >
                    {{ hasResource(resourceId) ? '✓' : '✗' }}
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      <div v-if="selectedRecipe" class="crafting-station__details">
        <h4>{{ selectedRecipe.name }}</h4>
        <p>{{ selectedRecipe.description }}</p>
        
        <div class="item-ability mt-3">
          <h5>Ability: {{ selectedRecipe.ability.name }}</h5>
          <p class="ability-description">{{ selectedRecipe.ability.description }}</p>
        </div>
        
        <div v-if="selectedRecipe.drawback" class="item-drawback mt-3">
          <h5>Drawback</h5>
          <p class="drawback-description">{{ selectedRecipe.drawback.description }}</p>
        </div>
        
        <div class="item-resources mt-3">
          <h5>Required Resources</h5>
          <ul class="resource-requirements">
            <li 
              v-for="resourceId in selectedRecipe.requiredResources" 
              :key="resourceId"
              :class="{ 'available': hasResource(resourceId), 'missing': !hasResource(resourceId) }"
            >
              {{ getResourceName(resourceId) }}
              <span class="resource-status">
                {{ hasResource(resourceId) ? '✓' : '✗' }}
              </span>
            </li>
          </ul>
        </div>
        
        <div class="crafting-actions mt-4">
          <button 
            class="btn btn--primary" 
            @click="craftItem"
            :disabled="!canCraftSelectedRecipe"
          >
            Craft Item
          </button>
          <button class="btn btn--secondary ml-2" @click="cancelCrafting">
            Cancel
          </button>
        </div>
      </div>
      
      <div v-else class="crafting-station__placeholder">
        <p>Select a recipe to view details and craft an item.</p>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, onMounted } from 'vue';
import { GamePhase } from '@/models/enums/phases';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';
import { CraftedItemCard } from '@/models/types/cards';
import { CraftingService } from '@/services/craftingService';

export default defineComponent({
  name: 'CraftingStation',
  setup() {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const craftingService = ref<CraftingService | null>(null);
    const selectedRecipe = ref<CraftedItemCard | null>(null);
    
    onMounted(() => {
      try {
        craftingService.value = new CraftingService();
        console.log('CraftingStation: CraftingService initialized successfully');
      } catch (error) {
        console.error('CraftingStation: Error initializing CraftingService:', error);
      }
    });
    
    const currentPhase = computed(() => {
      return gameStore.currentPhase;
    });
    
    const playerResources = computed(() => {
      return playerStore.resources;
    });
    
    const availableRecipes = computed(() => {
      // Filter craftable items based on resources the player has
      return cardStore.craftedItems.filter(item => {
        // Check if the player has ALL of the required resources
        return item.requiredResources.every(resourceId => 
          playerResources.value.includes(resourceId)
        );
      });
    });
    
    const canCraftSelectedRecipe = computed(() => {
      if (!selectedRecipe.value) return false;
      
      // Just check if player has all required resources
      return selectedRecipe.value.requiredResources.every(resourceId => 
        playerResources.value.includes(resourceId)
      );
    });
    
    const getResourceName = (resourceId: string) => {
      const resource = cardStore.getResourceById(resourceId);
      return resource ? resource.name : 'Unknown Resource';
    };
    
    const hasResource = (resourceId: string) => {
      return playerResources.value.includes(resourceId);
    };
    
    const selectRecipe = (recipe: CraftedItemCard) => {
      selectedRecipe.value = recipe;
    };
    
    const craftItem = () => {
      if (!selectedRecipe.value || !canCraftSelectedRecipe.value) return;
      
      if (craftingService.value) {
        // Use the crafting service if available
        const result = craftingService.value.craftItem(selectedRecipe.value.id);
        if (!result) {
          console.error('Failed to craft item');
          return;
        }
      } else {
        // Fallback: Remove resources used for crafting
        selectedRecipe.value.requiredResources.forEach(resourceId => {
          playerStore.removeResource(resourceId);
        });
      }
      
      // Add the crafted item to the player's inventory
      playerStore.addCraftedItem(selectedRecipe.value.id);
      
      // Add experience for crafting
      playerStore.gainExperience(1);
      
      // Log the crafting
      gameStore.addToGameLog(`You crafted a ${selectedRecipe.value.name}!`);
      
      // Reset selection
      selectedRecipe.value = null;
      
      // Move to the next phase
      gameStore.advancePhase();
    };
    
    const cancelCrafting = () => {
      selectedRecipe.value = null;
      
      // Skip crafting and move to the next phase
      gameStore.advancePhase();
    };
    
    return {
      currentPhase,
      availableRecipes,
      selectedRecipe,
      canCraftSelectedRecipe,
      getResourceName,
      hasResource,
      selectRecipe,
      craftItem,
      cancelCrafting,
      GamePhase
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.crafting-station {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  padding: $spacing-md;
  
  &__title {
    margin-top: 0;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  &__inactive {
    text-align: center;
    padding: $spacing-lg;
    color: rgba($dark-color, 0.6);
    font-style: italic;
  }
  
  &__active {
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-gap: $spacing-lg;
    
    @media (max-width: $breakpoint-md) {
      grid-template-columns: 1fr;
    }
  }
  
  &__placeholder {
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
    background-color: rgba(0, 0, 0, 0.02);
    border-radius: $border-radius-md;
    padding: $spacing-md;
    text-align: center;
    color: rgba($dark-color, 0.6);
  }
}

.recipe-list {
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: $spacing-md;
  max-height: 400px;
  overflow-y: auto;
  
  &__item {
    background-color: rgba(0, 0, 0, 0.02);
    border: 1px solid rgba(0, 0, 0, 0.1);
    border-radius: $border-radius-md;
    padding: $spacing-md;
    cursor: pointer;
    transition: all $transition-fast;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
      transform: translateY(-2px);
    }
    
    &.selected {
      border-color: $accent-color;
      background-color: rgba($accent-color, 0.05);
    }
    
    h5 {
      margin-top: 0;
      margin-bottom: $spacing-xs;
    }
  }
}

.recipe-complexity {
  font-size: $font-size-sm;
  color: $accent-color;
  margin-bottom: $spacing-xs;
}

.recipe-resources {
  font-size: $font-size-sm;
  
  ul {
    list-style-type: none;
    padding-left: $spacing-md;
    margin-top: $spacing-xs;
  }
}

.resource-requirements {
  list-style-type: none;
  padding-left: 0;
  
  li {
    padding: $spacing-xs $spacing-sm;
    margin-bottom: $spacing-xs;
    border-radius: $border-radius-sm;
    display: flex;
    justify-content: space-between;
    
    &.available {
      background-color: rgba($success-color, 0.1);
    }
    
    &.missing {
      background-color: rgba($danger-color, 0.1);
    }
  }
}

.resource-status {
  font-weight: bold;
  
  &.available {
    color: $success-color;
  }
  
  &.missing {
    color: $danger-color;
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-lg;
  color: rgba($dark-color, 0.6);
  font-style: italic;
}
</style>
