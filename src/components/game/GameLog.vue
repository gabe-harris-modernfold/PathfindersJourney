<template>
  <div class="game-log" style="border: 2px solid lightblue; position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: lightblue; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">GameLog</div>
    <h3 class="game-log__title">Journey Log</h3>
    <div class="game-log__entries" ref="logContainer">
      <div v-if="gameLog.length === 0" class="game-log__empty">
        Your journey has just begun. Events will be recorded here.
      </div>
      <p v-else class="game-log__paragraph">
        <template v-for="(entry, index) in gameLog" :key="index">
          <span 
            class="log-sentence" 
            :class="{ 'log-sentence--highlight': entry.highlight }"
          >
            <span class="first-letter">{{ entry.message.charAt(0) }}</span>{{ entry.message.substring(1) }}
            <span class="log-sentence__separator" v-if="index < gameLog.length - 1">. </span>
          </span>
        </template>
      </p>
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
.game-log {
  background-color: rgba(240, 230, 210, 0.2);
  border-radius: 8px;
  margin-bottom: 20px;
  width: 100%;
  max-height: 300px;
  overflow-y: auto;
  
  &__title {
    background: linear-gradient(to right, #8c7851, #5a3e2b);
    color: #fff;
    margin: 0;
    padding: 10px;
    border-top-left-radius: 6px;
    border-top-right-radius: 6px;
    font-family: 'Cinzel', serif;
    text-align: center;
    font-size: 26px;
  }
  
  &__entries {
    padding: 10px;
    overflow-y: auto;
    max-height: 250px;
  }
  
  &__paragraph {
    margin: 10px;
    padding: 15px;
    background-color: rgba(255, 255, 255, 0.7);
    border-radius: 4px;
    font-size: 28px;
    line-height: 2.2;
    color: #333;
    text-align: justify;
    font-family: 'Tangerine', cursive;
    letter-spacing: 0.5px;
    word-spacing: 2px;
  }
  
  &__empty {
    padding: 15px;
    text-align: center;
    font-style: italic;
    color: #777;
    font-size: 22px;
  }
}

.log-sentence {
  display: inline;
  position: relative;
  margin-bottom: 8px;
  
  .first-letter {
    font-size: 250%;
    font-weight: bold;
    color: #5a3e2b;
    line-height: 0.7;
    vertical-align: bottom;
    font-family: 'Tangerine', cursive;
    display: inline-block;
    margin-right: 2px;
    position: relative;
    top: 5px;
  }
  
  &--highlight {
    font-weight: bold;
    
    .first-letter {
      color: #8c7851;
    }
  }
  
  &__separator {
    margin: 0 5px;
    display: inline-block;
    position: relative;
  }
}

@media (max-width: 768px) {
  .game-log {
    max-height: 200px;
    
    &__entries {
      max-height: 150px;
    }
  }
}
</style>
