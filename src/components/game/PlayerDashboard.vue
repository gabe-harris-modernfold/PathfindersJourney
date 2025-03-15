<template>
  <div class="player-dashboard" style="border: 2px solid lightblue; position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">PlayerDashboard</div>
    <div class="player-info">
      <h2 v-if="character">{{ character.name }}</h2>
      <div class="player-stats">
        <div class="stat">
          <span class="stat-label">Health:</span> 
          <span class="stat-value">{{ playerStore.health }}/{{ playerStore.maxHealth }}</span>
        </div>
        <div class="stat">
          <span class="stat-label">Experience:</span> 
          <span class="stat-value">{{ playerStore.experience }}</span>
        </div>
      </div>
    </div>

    <div class="resources-section">
      <h3>Resources</h3>
      <div v-if="playerStore.resources.length === 0" class="empty-state">No resources collected yet</div>
      <ul v-else class="resource-list">
        <li v-for="resourceId in playerStore.resources" :key="resourceId" class="resource-list__item">
          {{ getResourceName(resourceId) }}
        </li>
      </ul>
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
    
    const getResourceName = (resourceId: string) => {
      const resource = cardStore.getResourceById(resourceId);
      return resource ? resource.name : 'Unknown Resource';
    };
    
    return {
      playerStore,
      character,
      getResourceName
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.empty-state {
  font-style: italic;
  color: rgba($dark-color, 0.6);
  margin-bottom: $spacing-xs;
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
  margin-bottom: $spacing-xs;
  padding: $spacing-xs;
  border-radius: $border-radius-md;
  background-color: rgba($light-color, 0.6);
}

.player-dashboard {
  width: 100%;
  padding: $spacing-xs;
  background-color: rgba($light-color, 0.8);
  border-radius: $border-radius-md;
  box-shadow: 0 2px 4px rgba($dark-color, 0.2);
  
  .player-info {
    margin-bottom: $spacing-xs;
    
    h2 {
      margin-top: 0;
      margin-bottom: $spacing-xs / 2;
      color: $primary-color;
    }
  }
  
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
  
  .resources-section,
  .companions-section,
  .crafted-items-section {
    margin-top: $spacing-xs;
    
    h3 {
      margin-top: 0;
      margin-bottom: $spacing-xs / 2;
      border-bottom: 1px solid $border-color;
      padding-bottom: $spacing-xs / 2;
    }
  }
  
  .resource-list,
  .companion-list,
  .crafted-items-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }
}

.feed-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba($dark-color, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.feed-dialog {
  background-color: $light-color;
  padding: $spacing-md;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  width: 400px;
}

.feed-dialog__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: $spacing-xs;
}

.feed-dialog__body {
  margin-bottom: $spacing-xs;
}

.feed-dialog__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  font-size: $font-size-lg;
  cursor: pointer;
  margin-left: $spacing-xs;
}

.resource-options {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
}

.resource-option {
  padding: $spacing-xs;
  border: 1px solid $border-color;
  border-radius: $border-radius-md;
  cursor: pointer;
  
  &.selected {
    background-color: $accent-color;
    color: $light-color;
  }
}

.companion-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: $spacing-xs;
}

.companion-card {
  background-color: $light-color;
  border: 2px solid $border-color;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  padding: $spacing-xs;
  cursor: pointer;
  transition: all $transition-normal;
  position: relative;
  min-height: 180px;
  
  // Card appearance
  background-image: linear-gradient(to bottom, rgba(255,255,255,0.8) 0%, rgba(240,240,240,0.2) 100%);
  
  &::before {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    right: 3px;
    bottom: 3px;
    border: 1px solid rgba(255,255,255,0.6);
    border-radius: calc($border-radius-md - 3px);
    pointer-events: none;
  }
  
  &.selected {
    transform: translateY(-5px);
    border-color: $accent-color;
    box-shadow: $shadow-md;
  }
  
  &.wary {
    border-color: $warning-color;
    
    &::after {
      content: "Wary";
      position: absolute;
      top: $spacing-xs;
      right: $spacing-xs;
      background-color: $warning-color;
      color: $light-color;
      padding: $spacing-xs $spacing-sm;
      border-radius: $border-radius-md;
      font-size: $font-size-xs;
      font-weight: bold;
      transform: rotate(10deg);
    }
  }
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: $shadow-md;
  }
  
  &__header {
    margin-bottom: $spacing-xs;
    
    .companion-name {
      font-weight: bold;
      font-size: $font-size-md;
      margin-bottom: $spacing-xs / 2;
    }
    
    .companion-loyalty {
      display: flex;
      align-items: center;
      margin-top: $spacing-xs / 2;
      
      .loyalty-label {
        margin-right: $spacing-xs;
        font-size: $font-size-sm;
      }
      
      .loyalty-meter {
        flex-grow: 1;
        height: 8px;
        background-color: rgba($dark-color, 0.1);
        border-radius: $border-radius-md;
        overflow: hidden;
        
        .loyalty-bar {
          height: 100%;
          background-color: $primary-color;
          transition: width $transition-normal;
        }
      }
    }
  }
  
  &__body {
    font-size: $font-size-sm;
    margin-bottom: $spacing-xs;
    
    .companion-ability {
      margin-top: $spacing-xs;
      padding-top: $spacing-xs;
      border-top: 1px solid rgba($dark-color, 0.1);
      
      h5 {
        margin: 0 0 $spacing-xs / 2 0;
        font-size: $font-size-sm;
      }
      
      .ability-description {
        font-size: $font-size-xs;
        color: rgba($dark-color, 0.7);
      }
    }
  }
  
  &__footer {
    display: flex;
    justify-content: space-between;
    margin-top: $spacing-xs;
    
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
}
</style>
