<template>
  <div class="player-dashboard" style="border: 2px solid lightblue; position: relative; height: auto; min-height: 50px; display: flex; flex-direction: column; align-items: flex-start; padding: 10px;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">PlayerDashboard</div>
    <div class="player-info" style="width: 100%;">
      <div class="player-stats" style="display: flex; gap: 20px; margin-bottom: 10px;">
        <div class="stat">
          <span class="stat-label">{{ character ? character.name : 'Character' }}:</span> 
          <span class="stat-value">{{ playerStore.health }}/{{ playerStore.maxHealth }} HP</span>
        </div>
        <div class="stat">
          <span class="stat-label">XP:</span> 
          <span class="stat-value">{{ playerStore.experience }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Resources:</span> 
          <span class="stat-value">{{ playerStore.resources.length }}/{{ playerStore.resourceCapacity }}</span>
        </div>
      </div>
      
      <!-- Crafted Items Section -->
      <div v-if="playerStore.craftedItems.length > 0" class="crafted-items-section">
        <div class="section-label">Crafted Items:</div>
        <div class="crafted-items-list">
          <div v-for="itemId in playerStore.craftedItems" :key="itemId" class="crafted-item stat">
            <span class="stat-value">{{ getCraftedItemName(itemId) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';

export default defineComponent({
  name: 'PlayerDashboard',
  
  setup() {
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    const character = computed(() => {
      if (!playerStore.characterId) return null;
      return cardStore.getCharacterById(playerStore.characterId);
    });
    
    const getCraftedItemName = (itemId: string): string => {
      const item = cardStore.getCraftedItemById(itemId);
      return item ? item.name : 'Unknown Item';
    };
    
    return {
      playerStore,
      character,
      getCraftedItemName
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.player-dashboard {
  width: 100%;
  padding: $spacing-xs;
  background-color: rgba($light-color, 0.8);
  border-radius: $border-radius-md;
  box-shadow: 0 2px 4px rgba($dark-color, 0.2);
  
  .player-info {
    width: 100%;
    
    .player-stats {
      display: flex;
      flex-wrap: wrap;
      gap: $spacing-xs;
      margin-bottom: $spacing-xs;
      
      .stat {
        padding: $spacing-xs $spacing-sm;
        background-color: rgba($dark-color, 0.1);
        border-radius: $border-radius-md;
        
        .stat-label {
          font-weight: bold;
          margin-right: $spacing-xs;
        }
      }
    }
    
    .crafted-items-section {
      margin-top: 5px;
      
      .section-label {
        font-weight: bold;
        margin-bottom: 5px;
        font-family: 'Cinzel', serif;
      }
      
      .crafted-items-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        
        .crafted-item {
          padding: 4px 8px;
          background-color: rgba($dark-color, 0.1);
          border-radius: $border-radius-md;
          font-family: 'Cinzel', serif;
        }
      }
    }
  }
}
</style>
