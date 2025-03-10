<template>
  <div class="player-dashboard">
    <div class="player-dashboard__header">
      <h3 class="character-name">{{ character?.name || 'Unknown Character' }}</h3>
      <p v-if="character">{{ character.description }}</p>
    </div>
    
    <div class="player-dashboard__stats">
      <div class="stat-item">
        <span class="stat-label">Health:</span>
        <span class="stat-value">{{ playerHealth }} / {{ playerMaxHealth }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Resources:</span>
        <span class="stat-value">{{ playerResources.length }} / {{ playerResourceCapacity }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Experience:</span>
        <span class="stat-value">{{ playerExperience }}</span>
      </div>
      <div class="stat-item">
        <span class="stat-label">Knowledge:</span>
        <span class="stat-value">{{ playerKnowledge.length }} / 5</span>
      </div>
    </div>
    
    <div class="player-dashboard__ability mt-3">
      <h4>Special Ability: {{ character?.specialAbility.name }}</h4>
      <p class="ability-description">{{ character?.specialAbility.description }}</p>
      <button 
        class="btn btn--accent btn--sm mt-2" 
        @click="useSpecialAbility"
        :disabled="specialAbilityUsed"
      >
        {{ specialAbilityUsed ? 'Ability Used' : 'Use Ability' }}
      </button>
    </div>
    
    <div class="player-dashboard__inventory mt-4">
      <h4>Resources</h4>
      <div v-if="playerResources.length === 0" class="empty-state">
        No resources collected yet.
      </div>
      <div v-else class="resource-list">
        <div 
          v-for="resourceId in playerResources" 
          :key="resourceId"
          class="resource-list__item"
          @click="showResourceDetails(resourceId)"
        >
          {{ getResourceName(resourceId) }}
        </div>
      </div>
      
      <h4 class="mt-3">Animal Companions</h4>
      <div v-if="playerCompanions.length === 0" class="empty-state">
        No animal companions yet.
      </div>
      <div v-else class="companion-list">
        <div 
          v-for="companionId in playerCompanions" 
          :key="companionId"
          class="companion-list__item"
          :class="{ wary: isCompanionWary(companionId) }"
          @click="showCompanionDetails(companionId)"
        >
          <div>{{ getCompanionName(companionId) }}</div>
          <div v-if="isCompanionWary(companionId)" class="wary-status">Wary</div>
        </div>
      </div>
      
      <h4 class="mt-3">Crafted Items</h4>
      <div v-if="playerItems.length === 0" class="empty-state">
        No crafted items yet.
      </div>
      <div v-else class="crafted-items-list">
        <div 
          v-for="itemId in playerItems" 
          :key="itemId"
          class="crafted-items-list__item"
          @click="showItemDetails(itemId)"
        >
          <div>{{ getItemName(itemId) }}</div>
          <div class="uses-remaining">Uses: {{ getItemUsesRemaining(itemId) }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';

export default defineComponent({
  name: 'PlayerDashboard',
  setup() {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const character = computed(() => {
      if (!playerStore.characterId) return null;
      return cardStore.getCharacterById(playerStore.characterId);
    });
    
    const playerHealth = computed(() => playerStore.health);
    const playerMaxHealth = computed(() => playerStore.maxHealth);
    const playerResources = computed(() => playerStore.resources);
    const playerResourceCapacity = computed(() => playerStore.resourceCapacity);
    const playerCompanions = computed(() => playerStore.animalCompanions);
    const playerItems = computed(() => playerStore.craftedItems);
    const playerExperience = computed(() => playerStore.experience);
    const playerKnowledge = computed(() => playerStore.knowledgeDiscovered);
    const specialAbilityUsed = computed(() => playerStore.specialAbilityUsed);
    
    const getResourceName = (resourceId: string) => {
      const resource = cardStore.getResourceById(resourceId);
      return resource ? resource.name : 'Unknown Resource';
    };
    
    const getCompanionName = (companionId: string) => {
      const companion = cardStore.getAnimalCompanionById(companionId);
      return companion ? companion.name : 'Unknown Companion';
    };
    
    const getItemName = (itemId: string) => {
      const item = cardStore.getCraftedItemById(itemId);
      return item ? item.name : 'Unknown Item';
    };
    
    const getItemUsesRemaining = (itemId: string) => {
      const item = cardStore.getCraftedItemById(itemId);
      return item ? 3 : 0; // Default to 3 uses for crafted items
    };
    
    const isCompanionWary = (companionId: string) => {
      const companion = cardStore.getAnimalCompanionById(companionId);
      return companion ? false : true; // Default to not wary if companion exists
    };
    
    const showResourceDetails = (resourceId: string) => {
      const resource = cardStore.getResourceById(resourceId);
      if (resource) {
        gameStore.addToGameLog(`Resource: ${resource.name} - ${resource.description}`);
        if (resource.specialEffect) {
          gameStore.addToGameLog(`Effect: ${resource.specialEffect.description}`);
        }
      }
    };
    
    const showCompanionDetails = (companionId: string) => {
      const companion = cardStore.getAnimalCompanionById(companionId);
      if (companion) {
        gameStore.addToGameLog(`Companion: ${companion.name} - ${companion.description}`);
        gameStore.addToGameLog(`Ability: ${companion.ability.name} - ${companion.ability.description}`);
        
        const waryStatus = 'This companion is ready to assist you.';
        gameStore.addToGameLog(waryStatus);
      }
    };
    
    const showItemDetails = (itemId: string) => {
      const item = cardStore.getCraftedItemById(itemId);
      if (item) {
        gameStore.addToGameLog(`Item: ${item.name} - ${item.description}`);
        gameStore.addToGameLog(`Ability: ${item.ability.name} - ${item.ability.description}`);
        
        if (item.drawback) {
          gameStore.addToGameLog(`Drawback: ${item.drawback.description}`);
        }
        
        gameStore.addToGameLog(`Uses remaining: 3`); // Default to 3 uses
      }
    };
    
    const useSpecialAbility = () => {
      if (playerStore.useSpecialAbility()) {
        // Implement character-specific ability effects
        if (character.value) {
          switch (character.value.id) {
            case 'beastfriend':
              // Example: Heal animal companions
              playerStore.animalCompanions.forEach(companionId => {
                console.log(`Animal companion ${companionId} is now active`);
              });
              gameStore.addToGameLog('All your animal companions are no longer wary.');
              break;
            // Add other character abilities as needed
            default:
              gameStore.addToGameLog('You used your special ability.');
              break;
          }
        }
      }
    };
    
    return {
      character,
      playerHealth,
      playerMaxHealth,
      playerResources,
      playerResourceCapacity,
      playerCompanions,
      playerItems,
      playerExperience,
      playerKnowledge,
      specialAbilityUsed,
      getResourceName,
      getCompanionName,
      getItemName,
      getItemUsesRemaining,
      isCompanionWary,
      showResourceDetails,
      showCompanionDetails,
      showItemDetails,
      useSpecialAbility
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.empty-state {
  font-style: italic;
  color: rgba($dark-color, 0.6);
  margin-bottom: $spacing-md;
}

.wary-status {
  font-size: $font-size-sm;
  color: $warning-color;
  font-style: italic;
}

.uses-remaining {
  font-size: $font-size-sm;
  color: $accent-color;
}

.resource-list__item,
.companion-list__item,
.crafted-items-list__item {
  cursor: pointer;
  transition: transform $transition-fast;
  
  &:hover {
    transform: translateY(-2px);
  }
}
</style>
