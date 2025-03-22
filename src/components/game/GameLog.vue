<template>
  <div class="game-log">
    <h3>Game Log</h3>
    <div class="log-entries" ref="logContainer">
      <div 
        v-for="(entry, index) in logStore.formattedGameLog" 
        :key="index"
        :class="['log-entry', `log-type-${entry.type}`, { 'highlighted': entry.highlight }]"
      >
        <span class="log-timestamp">{{ formatTimestamp(entry.timestamp) }}</span>
        <span class="log-message">{{ entry.message }}</span>
      </div>
      <div v-if="logStore.formattedGameLog.length === 0" class="log-empty">
        <p>Journey progress will be recorded here.</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick } from 'vue';
import { useLogStore } from '@/stores/logStore';

// Initialize stores
const logStore = useLogStore();
const logContainer = ref<HTMLElement | null>(null);

// Format timestamp to readable time
const formatTimestamp = (timestamp: number): string => {
  const date = new Date(timestamp);
  return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

// Auto-scroll to the bottom when new entries are added
watch(() => logStore.gameLog.length, async () => {
  await nextTick();
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
});

// Initial scroll to bottom on mount
onMounted(() => {
  if (logContainer.value) {
    logContainer.value.scrollTop = logContainer.value.scrollHeight;
  }
});
</script>

<style lang="scss" scoped>
.game-log {
  display: flex;
  flex-direction: column;
  height: 100%;
  
  h3 {
    margin-top: 0;
    padding: 10px;
    background-color: #2c3e50;
    color: white;
    border-bottom: 1px solid #1a2533;
  }
  
  .log-entries {
    flex: 1;
    overflow-y: auto;
    padding: 10px;
    background-color: rgba(44, 62, 80, 0.1);
    border-radius: 4px;
    max-height: 300px;
    
    .log-entry {
      padding: 5px 0;
      border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      font-size: 0.9rem;
      
      &.highlighted {
        font-weight: bold;
        background-color: rgba(255, 240, 102, 0.2);
      }
      
      .log-timestamp {
        color: #666;
        margin-right: 8px;
        font-size: 0.8rem;
      }
      
      &.log-type-phase { color: #3498db; }
      &.log-type-action { color: #2ecc71; }
      &.log-type-challenge { color: #e74c3c; }
      &.log-type-resource { color: #f39c12; }
      &.log-type-companion { color: #9b59b6; }
      &.log-type-crafting { color: #16a085; }
      &.log-type-error { color: #e74c3c; font-weight: bold; }
      &.log-type-debug { color: #7f8c8d; font-style: italic; }
    }
    
    .log-empty {
      color: #95a5a6;
      font-style: italic;
      text-align: center;
      padding: 20px 0;
    }
  }
}
</style>
