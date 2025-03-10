<template>
  <div class="game-log">
    <h3 class="game-log__title">Journey Log</h3>
    <div class="game-log__entries" ref="logContainer">
      <div 
        v-for="(entry, index) in gameLog" 
        :key="index" 
        class="game-log__entry"
        :class="{ 'game-log__entry--highlight': entry.highlight }"
      >
        <span class="game-log__timestamp">{{ formatTimestamp(entry.timestamp) }}</span>
        <span class="game-log__message">{{ entry.message }}</span>
      </div>
      <div v-if="gameLog.length === 0" class="game-log__empty">
        Your journey has just begun. Events will be recorded here.
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref, watch, nextTick } from 'vue';
import { useGameStore } from '@/stores';

export default defineComponent({
  name: 'GameLog',
  setup() {
    const gameStore = useGameStore();
    const logContainer = ref<HTMLElement | null>(null);
    
    const gameLog = computed(() => {
      return gameStore.gameLog;
    });
    
    const formatTimestamp = (timestamp: number) => {
      const date = new Date(timestamp);
      const hours = date.getHours().toString().padStart(2, '0');
      const minutes = date.getMinutes().toString().padStart(2, '0');
      const seconds = date.getSeconds().toString().padStart(2, '0');
      
      return `${hours}:${minutes}:${seconds}`;
    };
    
    // Auto-scroll to the bottom when new log entries are added
    watch(() => gameLog.value.length, () => {
      nextTick(() => {
        if (logContainer.value) {
          logContainer.value.scrollTop = logContainer.value.scrollHeight;
        }
      });
    });
    
    return {
      gameLog,
      logContainer,
      formatTimestamp
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.game-log {
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: $border-radius-md;
  background-color: rgba(0, 0, 0, 0.02);
  padding: $spacing-md;
  height: 300px;
  display: flex;
  flex-direction: column;
  
  &__title {
    margin-top: 0;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  &__entries {
    flex-grow: 1;
    overflow-y: auto;
    font-size: $font-size-sm;
    line-height: 1.4;
  }
  
  &__entry {
    margin-bottom: $spacing-xs;
    padding: $spacing-xs;
    border-radius: $border-radius-sm;
    
    &:hover {
      background-color: rgba(0, 0, 0, 0.05);
    }
    
    &--highlight {
      background-color: rgba($accent-color, 0.1);
      border-left: 3px solid $accent-color;
      padding-left: $spacing-sm;
    }
  }
  
  &__timestamp {
    color: rgba($dark-color, 0.6);
    margin-right: $spacing-sm;
    font-family: monospace;
  }
  
  &__message {
    color: $dark-color;
  }
  
  &__empty {
    color: rgba($dark-color, 0.6);
    font-style: italic;
    text-align: center;
    margin-top: $spacing-lg;
  }
}
</style>
