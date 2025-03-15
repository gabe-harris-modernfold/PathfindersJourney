<template>
  <div class="player-dashboard" style="border: 2px solid lightblue; position: relative; height: 50px; display: flex; align-items: center;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">PlayerDashboard</div>
    <div class="player-info">
      <div class="player-stats" style="display: flex; gap: 20px;">
        <div class="stat">
          <span class="stat-label">{{ character ? character.name : 'Character' }}:</span> 
          <span class="stat-value">{{ playerStore.health }}/{{ playerStore.maxHealth }} HP</span>
        </div>
        <div class="stat">
          <span class="stat-label">XP:</span> 
          <span class="stat-value">{{ playerStore.experience }}</span>
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
    
    return {
      playerStore,
      character
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
    margin-bottom: $spacing-xs;
    
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
  }
}
</style>
