<template>
  <div class="crafting-phase">
    <h2 class="phase-title">CRAFTING</h2>
    <div class="phase-description">
      <p>Craft items using your gathered resources.</p>
    </div>
    
    <div class="crafting-container">
      <div class="resource-panel">
        <h3>Your Resources ({{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }})</h3>
        <div class="resource-list">
          <p v-if="!playerStore.resources.length">You have no resources to craft with.</p>
          <ul v-else>
            <li v-for="resourceId in playerStore.resources" :key="resourceId" class="resource-item">
              <div class="resource-name">{{ getResourceName(resourceId) }}</div>
              <div class="resource-description">{{ getResourceDescription(resourceId) }}</div>
            </li>
          </ul>
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
      cardType="ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Proceed to the next phase
      </div>
    </GameCard>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useLogStore } from '@/stores/logStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

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

// Get available recipes based on current resources
const availableRecipes = computed(() => {
  // This would normally come from a crafting service or recipes data
  // For now, returning an empty array as placeholder
  return [];
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
  // This would call a craftingService method to craft the item
  logStore.addToGameLog(`You attempt to craft an item...`, true, 'crafting');
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
    flex-direction: row;
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

.resource-list, 
.recipe-list {
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }
  
  .resource-item, 
  .recipe-item {
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    margin-bottom: 0.75rem;
    padding: 0.75rem;
    border-left: 3px solid #8b4513;
    
    .resource-name, 
    .recipe-name {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .resource-description, 
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
</style>
