<template>
  <div class="threat-management">
    <h2>Threat Management</h2>
    
    <div class="threat-info">
      <div class="threat-level">
        <h3>Threat Level: {{ threatLevel }}</h3>
        <p>Tokens: {{ threatTokens }}</p>
      </div>
      
      <div class="threat-actions">
        <button @click="addThreatToken" class="btn danger">Add Threat Token</button>
        <button @click="removeThreatToken" class="btn success" :disabled="threatTokens === 0">Remove Threat Token</button>
        <button @click="manifestThreat" class="btn warning" :disabled="threatTokens === 0">Manifest Threat</button>
        <button @click="addThreatPrevention" class="btn info">Add Threat Prevention (3 turns)</button>
      </div>
    </div>
    
    <div class="effects-container">
      <div class="game-effects">
        <h3>Game Effects</h3>
        <div v-if="tempEffects.length === 0" class="no-effects">No active effects</div>
        <div v-else class="effects-list">
          <div v-for="effect in tempEffects" :key="effect.id" class="effect-card">
            <h4>{{ effect.name }}</h4>
            <p>{{ effect.description }}</p>
            <p class="effect-details">
              Strength: {{ effect.strength }} | Duration: {{ effect.duration }} turns
            </p>
          </div>
        </div>
      </div>
      
      <div class="player-effects">
        <h3>Player Effects</h3>
        <div v-if="playerEffects.length === 0" class="no-effects">No active effects</div>
        <div v-else class="effects-list">
          <div v-for="effect in playerEffects" :key="effect.id" class="effect-card">
            <h4>{{ effect.name }}</h4>
            <p>{{ effect.description }}</p>
            <p class="effect-details">
              Strength: {{ effect.strength }} | Duration: {{ effect.duration }} turns
            </p>
          </div>
        </div>
      </div>
    </div>
    
    <div class="game-log">
      <h3>Game Log</h3>
      <div class="log-entries">
        <div v-for="(entry, index) in gameLog" :key="index" 
             :class="['log-entry', { 'highlight': entry.highlight }]">
          <p>{{ entry.message }}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { ThreatService } from '@/services/threatService';

export default defineComponent({
  name: 'ThreatManagement',
  
  setup() {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    const threatService = new ThreatService();
    
    const threatTokens = computed(() => gameStore.threatTokens);
    const threatLevel = computed(() => gameStore.threatLevel);
    const tempEffects = computed(() => gameStore.tempEffects);
    const playerEffects = computed(() => playerStore.activeEffects);
    const gameLog = computed(() => gameStore.formattedGameLog);
    
    const addThreatToken = () => {
      threatService.addThreatTokens(1);
    };
    
    const removeThreatToken = () => {
      threatService.removeThreatTokens(1);
    };
    
    const manifestThreat = () => {
      threatService.manifestThreat();
    };
    
    const addThreatPrevention = () => {
      threatService.addThreatPreventionEffect(3, 2);
    };
    
    return {
      threatTokens,
      threatLevel,
      tempEffects,
      playerEffects,
      gameLog,
      addThreatToken,
      removeThreatToken,
      manifestThreat,
      addThreatPrevention
    };
  }
});
</script>

<style scoped>
.threat-management {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.threat-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.threat-actions {
  display: flex;
  gap: 10px;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
}

.btn:hover {
  opacity: 0.9;
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.danger {
  background-color: #e74c3c;
  color: white;
}

.success {
  background-color: #2ecc71;
  color: white;
}

.warning {
  background-color: #f39c12;
  color: white;
}

.info {
  background-color: #3498db;
  color: white;
}

.effects-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 20px;
}

.game-effects, .player-effects {
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
}

.no-effects {
  font-style: italic;
  color: #777;
  padding: 10px 0;
}

.effects-list {
  display: grid;
  gap: 10px;
}

.effect-card {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 10px;
  border-radius: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.effect-card h4 {
  margin: 0 0 5px 0;
  color: #2c3e50;
}

.effect-card p {
  margin: 0 0 5px 0;
}

.effect-details {
  font-size: 0.9em;
  color: #7f8c8d;
}

.game-log {
  padding: 15px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  max-height: 300px;
  overflow-y: auto;
}

.log-entries {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.log-entry {
  padding: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
}

.log-entry p {
  margin: 0;
}

.highlight {
  background-color: rgba(241, 196, 15, 0.2);
  border-left: 3px solid #f1c40f;
}
</style>
