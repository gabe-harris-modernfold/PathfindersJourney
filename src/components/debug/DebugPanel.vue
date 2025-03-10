<template>
  <div class="debug-panel" :class="{ 'debug-panel--expanded': expanded }">
    <div class="debug-panel__header" @click="toggleExpanded">
      <h3>Debug Panel</h3>
      <span class="debug-panel__toggle">{{ expanded ? '▼' : '▲' }}</span>
    </div>
    <div v-if="expanded" class="debug-panel__content">
      <div class="debug-section">
        <h4>Game State</h4>
        <div class="debug-item">
          <span class="debug-label">Phase:</span>
          <span class="debug-value">{{ gameStore.formatPhase(gameStore.currentPhase) }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Turn:</span>
          <span class="debug-value">{{ gameStore.currentTurn }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Season:</span>
          <span class="debug-value">{{ gameStore.formatSeason(gameStore.currentSeason) }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Journey Progress:</span>
          <span class="debug-value">{{ gameStore.journeyProgress }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Game Started:</span>
          <span class="debug-value">{{ gameStore.gameStarted ? 'Yes' : 'No' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Game Over:</span>
          <span class="debug-value">{{ gameStore.gameOver ? 'Yes' : 'No' }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h4>Player</h4>
        <div class="debug-item">
          <span class="debug-label">Character:</span>
          <span class="debug-value">{{ playerStore.characterId ? playerStore.characterId : 'None' }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Health:</span>
          <span class="debug-value">{{ playerStore.health }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Resources:</span>
          <span class="debug-value">{{ playerStore.resources.length }}</span>
        </div>
        <div class="debug-item">
          <span class="debug-label">Companions:</span>
          <span class="debug-value">{{ playerStore.companions.length }}</span>
        </div>
      </div>

      <div class="debug-section">
        <h4>Current Landscape</h4>
        <div v-if="gameStore.currentLandscape" class="debug-item">
          <span class="debug-label">Name:</span>
          <span class="debug-value">{{ gameStore.currentLandscape.name }}</span>
        </div>
        <div v-if="gameStore.currentLandscape" class="debug-item">
          <span class="debug-label">Challenges:</span>
          <span class="debug-value">{{ gameStore.currentLandscape.challenges.length }}</span>
        </div>
        <div v-if="!gameStore.currentLandscape" class="debug-item">
          <span class="debug-value">No landscape selected</span>
        </div>
      </div>

      <div class="debug-section">
        <h4>Actions</h4>
        <button @click="forceAdvancePhase" class="debug-button">Force Next Phase</button>
        <button @click="forceAdvanceTurn" class="debug-button">Force Next Turn</button>
        <button @click="forceAdvanceSeason" class="debug-button">Force Next Season</button>
        <button @click="resetGame" class="debug-button danger">Reset Game</button>
      </div>

      <div class="debug-section">
        <h4>State Dump</h4>
        <pre class="debug-state">{{ stateDump }}</pre>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();

const expanded = ref(false);

const toggleExpanded = () => {
  expanded.value = !expanded.value;
};

const forceAdvancePhase = () => {
  gameStore.advancePhase();
  gameStore.addToGameLog('Phase advanced via debug panel', false, 'debug');
};

const forceAdvanceTurn = () => {
  gameStore.advanceTurn();
  gameStore.addToGameLog('Turn advanced via debug panel', false, 'debug');
};

const forceAdvanceSeason = () => {
  gameStore.advanceSeason();
  gameStore.addToGameLog('Season advanced via debug panel', false, 'debug');
};

const resetGame = () => {
  gameStore.resetGame();
  gameStore.addToGameLog('Game reset via debug panel', false, 'debug');
};

const stateDump = computed(() => {
  const dump = {
    game: {
      currentPhase: gameStore.currentPhase,
      currentTurn: gameStore.currentTurn,
      currentSeason: gameStore.currentSeason,
      currentLandscapeId: gameStore.currentLandscapeId,
      currentChallenge: gameStore.currentChallenge,
      visitedLandscapes: gameStore.visitedLandscapes,
      journeyProgress: gameStore.journeyProgress,
      gameStarted: gameStore.gameStarted,
      gameOver: gameStore.gameOver,
      isVictory: gameStore.isVictory
    },
    player: {
      characterId: playerStore.characterId,
      health: playerStore.health,
      resources: playerStore.resources.map(r => r.id),
      companions: playerStore.companions.map(c => c.id),
      craftedItems: playerStore.craftedItems.map(i => i.id)
    }
  };
  return JSON.stringify(dump, null, 2);
});
</script>

<style lang="scss" scoped>
.debug-panel {
  position: fixed;
  bottom: 0;
  right: 0;
  width: 300px;
  background-color: rgba(0, 0, 0, 0.8);
  color: #fff;
  border-top-left-radius: 8px;
  z-index: 1000;
  font-family: monospace;
  
  &--expanded {
    height: auto;
    max-height: 80vh;
    overflow-y: auto;
  }
  
  &__header {
    padding: 8px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    background-color: #333;
    border-top-left-radius: 8px;
    
    h3 {
      margin: 0;
      font-size: 14px;
    }
  }
  
  &__content {
    padding: 12px;
  }
  
  &__toggle {
    font-size: 12px;
  }
}

.debug-section {
  margin-bottom: 16px;
  
  h4 {
    margin: 0 0 8px 0;
    font-size: 12px;
    color: #1890ff;
    border-bottom: 1px solid #444;
    padding-bottom: 4px;
  }
}

.debug-item {
  margin-bottom: 4px;
  font-size: 11px;
  display: flex;
}

.debug-label {
  width: 120px;
  color: #ccc;
}

.debug-value {
  color: #fff;
  font-weight: bold;
}

.debug-button {
  background-color: #1890ff;
  color: white;
  border: none;
  padding: 4px 8px;
  margin-right: 8px;
  margin-bottom: 8px;
  border-radius: 4px;
  font-size: 11px;
  cursor: pointer;
  
  &:hover {
    background-color: darken(#1890ff, 10%);
  }
  
  &.danger {
    background-color: #f5222d;
    
    &:hover {
      background-color: darken(#f5222d, 10%);
    }
  }
}

.debug-state {
  font-size: 10px;
  background-color: #222;
  padding: 8px;
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
  white-space: pre-wrap;
}
</style>
