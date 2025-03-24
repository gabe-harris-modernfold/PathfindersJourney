<template>
  <div class="game-log">
    <div class="game-log-header">
      <h3>Game Log</h3>
      <button 
        class="copy-button" 
        title="Copy log to clipboard"
        @click="copyLogToClipboard"
      >
        📋
      </button>
    </div>
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

// Copy log content to clipboard
const copyLogToClipboard = () => {
  if (!logStore.formattedGameLog.length) return;
  
  // Create text content from log entries
  const logText = logStore.formattedGameLog
    .map(entry => `[${formatTimestamp(entry.timestamp)}] ${entry.message}`)
    .join('\n');
  
  // Copy to clipboard
  navigator.clipboard.writeText(logText)
    .then(() => {
      // Add temporary success message to log
      logStore.addToGameLog('Log copied to clipboard!', true, 'action');
    })
    .catch(err => {
      console.error('Failed to copy log: ', err);
      logStore.addToGameLog('Failed to copy log to clipboard.', true, 'error');
    });
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
  width: 100%;
  background-color: rgba(245, 245, 245, 0.95);
  border: 1px solid #d9c7a7;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  margin-top: auto;
  max-height: 200px;
  display: flex;
  flex-direction: column;
  
  .game-log-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.5rem 1rem;
    background-color: #f9f3e9;
    border-bottom: 1px solid #d9c7a7;
    
    h3 {
      margin: 0;
      font-size: 1rem;
      color: #5a3e2b;
    }
    
    .copy-button {
      background: none;
      border: none;
      color: #5a3e2b;
      cursor: pointer;
      font-size: 1rem;
      padding: 0.25rem;
      
      &:hover {
        color: #432818;
      }
    }
  }
  
  .log-entries {
    padding: 0.5rem;
    overflow-y: auto;
    max-height: 150px;
    
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
