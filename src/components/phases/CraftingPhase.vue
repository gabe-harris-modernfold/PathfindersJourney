<template>
  <div class="crafting-phase">
    <h2 class="phase-title">CRAFTING</h2>
    <div class="phase-description">
      <p>Craft items using your gathered resources.</p>
    </div>
    
    <div class="crafting-container">
      <div class="resource-panel">
        <h3>Your Resources ({{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }})</h3>
        <p v-if="!playerStore.resources.length">You have no resources to craft with.</p>
        <div v-else class="resource-grid">
          <GameCard 
            v-for="resourceId in playerStore.resources" 
            :key="resourceId"
            :title="getResourceName(resourceId)" 
            :card-type="CardType.RESOURCE"
            class="resource-card resource-card-full-bg"
            @click="selectResourceToDiscard(resourceId)"
            :is-selected="isResourceSelectedForDiscard(resourceId)"
          >
            <!-- Use header slot with empty content to override default header -->
            <template #header>
              <!-- Intentionally empty -->
            </template>
            
            <!-- Wrapper for image and text overlay -->
            <div class="card-image-overlay-wrapper">
              <img 
                v-if="getResourceImagePath(resourceId)" 
                :src="getResourceImagePath(resourceId)" 
                :alt="`${getResourceName(resourceId)} image`" 
                class="card-resource-image" 
              />
              <div class="card-text-overlay"></div> 
              
              <!-- Manually render title, subtitle, description, action inside -->
              <div class="card-content-over-image">
                <h3 class="card-title-over-image">{{ getResourceName(resourceId) }}</h3>
                <h4 class="card-subtitle-over-image">{{ `Type: ${getResourceType(resourceId)}` }}</h4>
                <p class="card-resource-description">{{ getResourceDescription(resourceId) }}</p>
                <div class="resource-action-over-image">
                  <small>Click to discard</small>
                </div>
              </div>
            </div>
          </GameCard>
        </div>
        <!-- Resource discard confirmation modal -->
        <div v-if="resourceToDiscard.value" class="discard-confirmation">
          <div class="discard-modal">
            <h4>Discard Resource</h4>
            <p>Are you sure you want to discard {{ discardResourceName }}?</p>
            <div class="discard-buttons">
              <button @click="confirmDiscard" class="confirm-button">Discard</button>
              <button @click="cancelDiscard" class="cancel-button">Cancel</button>
            </div>
          </div>
        </div>
      </div>
      
      <div class="recipes-panel">
        <h3>Available Recipes</h3>
        <div class="recipe-list">
          <p v-if="!availableRecipes.length">No recipes available with your current resources.</p>
          <ul v-else>
            <li v-for="recipe in availableRecipes" :key="recipe.id" class="recipe-item">
              <div class="recipe-name">{{ recipe.name }}</div>
              <div class="recipe-description">{{ recipe.description }}</div>
              <div class="recipe-ingredients">
                Requires: {{ formatIngredients(recipe.ingredients) }}
              </div>
              <button class="craft-button" @click="craftItem(recipe.id)">Craft</button>
            </li>
          </ul>
        </div>
      </div>
    </div>
    
    <GameCard 
      title="Continue Journey" 
      :cardType="CardType.ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Proceed to the next phase
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useLogStore } from '@/stores/logStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';
import { CardType } from '@/models/enums/cardTypes';
import { craftedItems } from '@/models/data/crafted-items';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();
const logStore = useLogStore();
const { phaseService, craftingService } = useServices();

// Display resources on mount
onMounted(() => {
  if (playerStore.resources.length > 0) {
    logStore.addToGameLog(`You inspect your resources for crafting (${playerStore.resourceCount}/${playerStore.resourceCapacity}).`, true, 'resource');
  } else {
    logStore.addToGameLog(`You check your pack but find no resources for crafting (0/${playerStore.resourceCapacity}).`, true, 'resource');
  }
  console.log('Available recipes:', availableRecipes.value);
  console.log('Player resources:', playerStore.resources);
});

// Get resource name from card store
const getResourceName = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : `Unknown (${resourceId})`;
};

// Get resource description from card store
const getResourceDescription = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.description : 'A mysterious resource.';
};

// Get resource image path from card store
const getResourceImagePath = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  try {
    // Attempt to require the image. Assuming images are directly in assets/images/
    // like in JourneyProgressionPhase
    return require(`@/assets/images/${resource.image}`);
  } catch (e) {
    console.error(`Failed to load image for resource ${resourceId}: ${resource.image}`, e);
    return ''; // Return empty string or a placeholder path on error
  }
};

// Get resource type from card store
const getResourceType = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.type : 'Unknown';
};

// Check if player has all required resources for a recipe
const hasRequiredResources = (requiredResources: string[]): boolean => {
  if (!requiredResources || requiredResources.length === 0) return false;
  
  // Create a copy of player resources to avoid mutation
  const availableResources = [...playerStore.resources];
  
  // Check if all required resources are in the player's inventory
  return requiredResources.every(resourceId => availableResources.includes(resourceId));
};

// Get available recipes based on current resources
const availableRecipes = computed(() => {
  // Filter crafted items to only show those that can be crafted with current resources
  return craftedItems
    .filter(item => hasRequiredResources(item.requiredResources))
    .map(item => ({
      id: item.id,
      name: item.name,
      description: `${item.ability} ${item.drawback ? `(Drawback: ${item.drawback})` : ''}`,
      ingredients: item.requiredResources
    }));
});

// Format ingredients list for display
const formatIngredients = (ingredients: string[]): string => {
  if (!ingredients || !ingredients.length) return 'No ingredients';
  
  return ingredients.map(ingredientId => {
    const resource = cardStore.getResourceById(ingredientId);
    return resource ? resource.name : ingredientId;
  }).join(', ');
};

// Craft an item using the selected recipe
const craftItem = (recipeId: string) => {
  const success = playerStore.craftItem(recipeId);
  
  if (!success) {
    logStore.addToGameLog(`You cannot craft this item. You may be missing required resources.`, false, 'crafting');
  }
};

// Select a resource to discard
const resourceToDiscard = ref<string>('');

// Helper function to check if a resource is selected for discard
const isResourceSelectedForDiscard = (id: string): boolean => {
  return resourceToDiscard.value === id;
};

// Computed property for the name of the resource to be discarded (for modal)
const discardResourceName = computed(() => {
  return resourceToDiscard.value ? getResourceName(resourceToDiscard.value) : '';
});

// Select a resource to discard
const selectResourceToDiscard = (resourceId: string) => {
  resourceToDiscard.value = resourceId;
};

// Confirm discarding a resource
const confirmDiscard = () => {
  if (resourceToDiscard.value) {
    playerStore.removeResource(resourceToDiscard.value);
    resourceToDiscard.value = ''; // Reset selection to empty string
    logStore.addToGameLog(`You discarded ${getResourceName(resourceToDiscard.value)}.`, true, 'resource');
  }
};

// Cancel discarding a resource
const cancelDiscard = () => {
  resourceToDiscard.value = ''; // Reset selection to empty string
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.crafting-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
}

.phase-title {
  font-size: 1.8rem;
  color: #5a3e2b;
  margin-bottom: 0.5rem;
}

.phase-description {
  text-align: center;
  margin-bottom: 1rem;
  color: #665e52;
}

.crafting-container {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
  
  @media (min-width: 768px) {
    flex-direction: column;
  }
}

.resource-panel, 
.recipes-panel {
  flex: 1;
  background-color: rgba(245, 245, 220, 0.5);
  border: 1px solid #8b4513;
  border-radius: 8px;
  padding: 1.5rem;
  
  h3 {
    color: #5a3e2b;
    margin-bottom: 1rem;
    border-bottom: 1px solid rgba(138, 69, 19, 0.3);
    padding-bottom: 0.5rem;
  }
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.resource-card {
  height: 100%;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.resource-action {
  margin-top: 10px;
  font-size: 0.8rem;
  color: #666;
  text-align: center;
}

.recipe-list {
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .recipe-item {
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border-left: 3px solid #8b4513;
    
    .recipe-name {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .recipe-description {
      font-size: 0.9rem;
      color: #5a3e2b;
      margin-bottom: 0.5rem;
    }
    
    .recipe-ingredients {
      font-size: 0.85rem;
      color: #8b4513;
      margin-bottom: 0.5rem;
    }
  }
}

.craft-button {
  background-color: #8b4513;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #6b3513;
  }
}

.discard-confirmation {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.discard-modal {
  background-color: #fff;
  padding: 1rem;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
  
  h4 {
    margin-top: 0;
  }
  
  .discard-buttons {
    display: flex;
    justify-content: space-between;
    margin-top: 1rem;
    
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .confirm-button {
      background-color: #8b4513;
      color: white;
      
      &:hover {
        background-color: #6b3513;
      }
    }
    
    .cancel-button {
      background-color: #ccc;
      
      &:hover {
        background-color: #aaa;
      }
    }
  }
}

.available-resources-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
  margin-top: 15px;
  margin-bottom: 20px;
}

.resource-card-wrapper {
  height: 100%;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.available-resource-card {
  background-color: rgba(255, 255, 255, 0.6);
  border-radius: 4px;
  margin-bottom: 0.75rem;
  padding: 0.75rem;
  border-left: 3px solid #8b4513;
}

.card-image-overlay-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.card-resource-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
}

.card-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: transparent;
  border-radius: 4px;
}

.card-content-over-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white;
}

.card-title-over-image {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-subtitle-over-image {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.card-resource-description {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.card-resource-effect {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
}

.resource-action-over-image {
  font-size: 0.8rem;
  margin-top: 10px;
  opacity: 0.8;
}

.resource-card-full-bg {
  padding: 0;
  background: none;
  border: 1px solid rgba(138, 69, 19, 0.5);
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.resource-card :deep(.game-card__header),
.resource-card-wrapper :deep(.game-card__header) {
  display: none !important; /* Use !important to ensure override */
}
</style>
