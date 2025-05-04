<template>
  <div class="crafting-phase">
    <!-- Background Elements Added -->
    <div class="landscape-image-container">
      <img :src="require('@/assets/images/crafting-phase.jpg')" class="landscape-image" alt="Crafting background" />
    </div>
    <div class="landscape-overlay"></div>
    <!-- End Background Elements -->

    <!-- Existing Content (Needs z-index) -->
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
        <div v-if="resourceToDiscard" class="discard-confirmation">
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
        <!-- Wrapper for image and text overlay -->
        <div class="card-image-overlay-wrapper">
          <img 
            :src="require('@/assets/images/crafting-recipies.jpg')" 
            alt="Crafting Recipes Background" 
            class="card-landscape-image" 
          />
          <div class="card-text-overlay"></div> 
          
          <!-- Content over the image/overlay -->
          <div class="card-content-over-image">
            <h3 class="panel-title-over-image">Available Recipes</h3>
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
      </div>
    </div>
    
    <!-- Modified Continue Journey Card -->
    <GameCard 
      title="Continue Journey" 
      :cardType="CardType.ACTION"
      @click="advancePhase"
      class="crafting-continue-card" 
    >
      <!-- Use header slot with empty content to override default header -->
      <template #header>
        <!-- Intentionally empty -->
      </template>
      
      <!-- Wrapper for image and text overlay -->
      <div class="card-image-overlay-wrapper">
        <img 
          :src="require('@/assets/images/continue-journey.jpg')" 
          alt="Continue Journey" 
          class="card-landscape-image"
        />
        <div class="card-text-overlay"></div> 
        
        <!-- Manually render content inside -->
        <div class="card-content-over-image">
          <h3 class="card-title-over-image">Continue Journey</h3>
          <p class="card-landscape-description">
            Proceed to the next phase
          </p>
        </div>
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
    logStore.addToGameLog(`You discarded ${discardResourceName.value}.`, true, 'resource');
    resourceToDiscard.value = ''; // Reset selection to empty string
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
  width: 100%;
  position: relative; 
  min-height: 600px; 
  padding: 1rem; 
  box-sizing: border-box; 
  overflow: hidden; 
}

// Added Background Styles
.landscape-image-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0; 
}

.landscape-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.landscape-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(240, 230, 210, 0.75); 
  z-index: 1; 
}
// End Added Background Styles

// Ensure content is above overlay
.phase-title,
.phase-description,
.crafting-container,
.crafting-continue-card {
  position: relative;
  z-index: 2;
}

.phase-title {
  text-align: center;
  margin-bottom: 1rem;
  font-family: 'Cinzel', serif; 
  color: #4a2e1a; 
  font-size: 1.8rem; 
  font-weight: bold; 
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); 
}

.phase-description {
  text-align: center;
  margin-bottom: 1.5rem;
  color: #5a3e2b; 
  max-width: 720px; 
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
  opacity: 0.9; 
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
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
}

.card-subtitle-over-image {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-resource-description {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #333; 
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
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
  max-width: 220px; 
  margin: 0.5rem; 
  
  // Hide default GameCard parts
  :deep(.game-card__header) { padding: 0; height: 0; border: none; overflow: hidden; }
  :deep(.game-card__body) { padding: 0; height: 100%; 
    .game-card__symbol { display: none; } 
  }

  // Container for image, overlay, and content
  .card-image-overlay-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    border-radius: inherit; 
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // The actual background image for the resource
  .card-resource-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover; 
    z-index: 0; 
  }

  // Semi-transparent overlay
  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  // Container for text content over the image/overlay
  .card-content-over-image {
    position: relative;
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 0.75rem; 
    width: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center; 
    height: 100%; 

    // Title styling
    .card-title-over-image {
      font-size: 1.1rem;
      font-weight: bold;
      margin: 0 0 0.25rem 0;
      text-transform: capitalize;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
    }

    // Subtitle (Type) styling
    .card-subtitle-over-image {
      font-size: 0.8rem;
      margin: 0 0 0.5rem 0;
      opacity: 0.9;
      font-weight: normal;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }

    // Description styling
    .card-resource-description {
      font-size: 0.85rem;
      margin: 0 0 0.5rem 0;
      line-height: 1.3;
      flex-grow: 1; 
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
    }
    
    // Action text styling
    .resource-action-over-image {
      margin-top: auto; 
      font-size: 0.75rem;
      opacity: 0.8;
      font-style: italic;
      small {
        text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6);
      }
    }
  }
}

.recipe-list {
  max-height: 300px; 
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

/* Override GameCard header specifically for resource cards in this wrapper if needed */
/* This might be redundant if the above :deep styles work correctly */
.resource-card-wrapper :deep(.game-card__header) {
  display: none !important; 
}

/* Styles for the Continue Journey card image overlay effect */
.crafting-continue-card {
  max-width: 300px; 
  margin: 1rem auto; 
  position: relative; 
  z-index: 2; 

  // Explicitly collapse the header div
  :deep(.game-card__header) {
    padding: 0;
    height: 0;
    border: none;
    overflow: hidden;
  }

  // Remove padding from the body
  :deep(.game-card__body) {
    padding: 0;
    height: 100%;
    // Hide the default symbol if present
    .game-card__symbol {
      display: none;
    }
  }

  // Wrapper positioned absolutely relative to the .game-card
  .card-image-overlay-wrapper {
    position: absolute; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; 
    z-index: 1; 
    border-radius: inherit; 
    overflow: hidden; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    min-height: 0; 
  }

  // Style for the image
  .card-landscape-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: 0; 
  }

  // Overlay for text readability
  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  // Container for text content over the image
  .card-content-over-image {
    position: relative; 
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 1rem; 
    width: 100%;
    box-sizing: border-box; 
  }

  // Style for the title over the image
  .card-title-over-image {
    font-size: 1.4rem; 
    font-weight: bold;
    margin: 0 0 0.5rem 0; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  // Style for the description text
  .card-landscape-description {
    font-size: 1rem; 
    margin: 0; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }
}

/* Ensure resource card styles don't get overridden */
.resource-card-wrapper :deep(.game-card__header) {
  display: none !important; 
}

/* Styles for the Recipes Panel image overlay effect */
.recipes-panel {
  position: relative; 
  border-radius: 8px; 
  overflow: hidden; 
  min-height: 300px; 
  margin-top: 1rem; 
  border: 1px solid #8c7851; 
  box-shadow: 0 2px 8px rgba(0,0,0,0.15); 

  // Wrapper for image, overlay, and content
  .card-image-overlay-wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    border-radius: inherit;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  // The background image
  .card-landscape-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    z-index: 0;
  }

  // Semi-transparent overlay
  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.75); 
    z-index: 1;
  }

  // Container for text content over the image/overlay
  .card-content-over-image {
    position: relative;
    z-index: 2;
    color: white;
    text-align: center;
    padding: 1rem;
    width: 100%;
    height: 100%; 
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    overflow-y: hidden; 

    // Title styling
    .panel-title-over-image {
      font-size: 1.4rem;
      font-weight: bold;
      margin: 0 0 0.75rem 0;
      color: white;
      text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
    }

    // Recipe List container adjustments
    .recipe-list {
      flex-grow: 1; 
      overflow-y: auto; 
      max-height: none; 
      padding-right: 10px; 
      margin-right: -10px; 
      color: white; 
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
      
      p { 
         text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
         font-style: italic;
      }

      ul {
        list-style-type: none;
        padding: 0;
        margin: 0;
      }
      
      // Individual recipe item styling adjustments
      .recipe-item {
        background-color: rgba(0, 0, 0, 0.3); 
        border-radius: 4px;
        margin-bottom: 0.75rem;
        padding: 0.75rem;
        border-left: 3px solid #a7c7a7; 
        text-align: left;
        
        .recipe-name {
          font-weight: bold;
          margin-bottom: 0.25rem;
          color: #ffffff;
        }
        
        .recipe-description {
          font-size: 0.9rem;
          color: #f0f0f0; 
          margin-bottom: 0.5rem;
        }
        
        .recipe-ingredients {
          font-size: 0.85rem;
          color: #d3e0d3; 
          margin-bottom: 0.5rem;
        }

        .craft-button {
          // Keep existing button styles, maybe adjust colors for contrast
          background-color: #4a7c59; 
          border-color: #3e684b;
          color: white;
          &:hover {
             background-color: #5e9971;
          }
        }
      }
    }
  }
}

.recipe-list {
  // Remove original styling if conflicting - KEEPING scroll for now
  // max-height: 300px; 
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
</style>
