<template>
  <div class="threat-management">
    <h2>Threat Management</h2>
    
    <div class="threat-dashboard">
      <div class="threat-summary">
        <div class="threat-level-indicator" :class="threatLevelClass">
          <div class="threat-gauge">
            <div class="threat-fill" :style="{ width: threatPercentage + '%' }"></div>
          </div>
          <h3>Threat Level: {{ threatLevel }}</h3>
          <p class="token-count">Current Tokens: <span>{{ threatTokens }}/15</span></p>
          <p class="threat-description">{{ threatLevelDescription }}</p>
        </div>
        
        <div class="active-effects-summary">
          <h3>Active Threat Effects</h3>
          <div v-if="tempEffects.length === 0 && playerEffects.length === 0" class="no-effects">
            <p>The spiritual balance is currently stable. No active effects.</p>
          </div>
          <ul v-else class="effects-summary-list">
            <li v-for="effect in tempEffects" :key="effect.id" class="effect-item">
              <span class="effect-name">{{ effect.name }}:</span> 
              <span class="effect-description">{{ effect.description }}</span>
              <span class="effect-duration">({{ effect.duration }} turns remaining)</span>
            </li>
            <li v-for="effect in playerEffects" :key="effect.id" class="effect-item">
              <span class="effect-name">{{ effect.name }}:</span> 
              <span class="effect-description">{{ effect.description }}</span>
              <span class="effect-duration">({{ effect.duration }} turns remaining)</span>
            </li>
          </ul>
        </div>
      </div>
      
      <div class="threat-actions">
        <div class="action-group">
          <h4>Manage Threats</h4>
          <div class="button-group">
            <button @click="addThreatToken" class="btn danger">
              <i class="fas fa-plus-circle"></i> Add Threat Token
            </button>
            <button @click="removeThreatToken" class="btn success" :disabled="threatTokens === 0">
              <i class="fas fa-minus-circle"></i> Remove Threat Token
            </button>
          </div>
        </div>
        
        <div class="action-group">
          <h4>Threat Events</h4>
          <div class="button-group">
            <button @click="manifestThreat" class="btn warning" :disabled="threatTokens === 0">
              <i class="fas fa-bolt"></i> Manifest Threat
            </button>
            <button @click="addThreatPrevention" class="btn info">
              <i class="fas fa-shield-alt"></i> Add Threat Prevention
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="threat-assessment-guide">
      <h3>Threat Assessment Guide</h3>
      <div class="assessment-levels">
        <div class="assessment-level">
          <div class="level-indicator safe"></div>
          <div class="level-details">
            <h4>Stable (0-4 Tokens)</h4>
            <p>The Celtic Realm is in balance. No active threats present.</p>
            <ul class="effect-details">
              <li>No additional challenge difficulty</li>
              <li>No random events</li>
            </ul>
          </div>
        </div>
        
        <div class="assessment-level">
          <div class="level-indicator warning"></div>
          <div class="level-details">
            <h4>Disturbed (5-9 Tokens)</h4>
            <p>The veil between worlds begins to thin, minor disturbances appear.</p>
            <ul class="effect-details">
              <li>+1 to +3 challenge difficulty</li>
              <li>Minor threat events may trigger</li>
              <li>Random events at the start of your turn</li>
            </ul>
          </div>
        </div>
        
        <div class="assessment-level">
          <div class="level-indicator danger"></div>
          <div class="level-details">
            <h4>Unstable (10-14 Tokens)</h4>
            <p>The boundaries weaken significantly, otherworldly beings take notice.</p>
            <ul class="effect-details">
              <li>+3 to +4 challenge difficulty</li>
              <li>Major threat events may trigger</li>
              <li>Roll on the Otherworldly Manifestation table</li>
            </ul>
          </div>
        </div>
        
        <div class="assessment-level">
          <div class="level-indicator critical"></div>
          <div class="level-details">
            <h4>Collapse (15+ Tokens)</h4>
            <p>The veil collapses, otherworldly forces overwhelm the Celtic Realm.</p>
            <ul class="effect-details">
              <li>Game over - your journey ends in defeat</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
    <div class="threat-effects-reference">
      <h3>Potential Threat Effects</h3>
      <div class="threat-level-container">
        <div class="threat-level-section">
          <h4>Minor Threat Events (5+ Threat Tokens)</h4>
          <div class="threat-effects-list">
            <div class="threat-effect-card">
              <h5>Unsettling Whispers</h5>
              <p>Strange whispers echo through the landscape, causing unease</p>
              <p class="effect-details">(+1 difficulty to challenges for 2 turns)</p>
            </div>
            <div class="threat-effect-card">
              <h5>Sudden Chill</h5>
              <p>A bone-deep chill sets in, making it harder to perform tasks</p>
              <p class="effect-details">(1 health loss)</p>
            </div>
            <div class="threat-effect-card">
              <h5>Misplaced Supplies</h5>
              <p>Some of your resources have mysteriously gone missing</p>
              <p class="effect-details">(lose 1 resource)</p>
            </div>
          </div>
        </div>
        
        <div class="threat-level-section">
          <h4>Moderate Threat Events (7+ Threat Tokens)</h4>
          <div class="threat-effects-list">
            <div class="threat-effect-card">
              <h5>Otherworldly Fog</h5>
              <p>A thick, unnatural fog descends, obscuring paths and hiding dangers</p>
              <p class="effect-details">(landscape effect for 3 turns)</p>
            </div>
            <div class="threat-effect-card">
              <h5>Animal Unrest</h5>
              <p>Animals in the area become agitated and difficult to approach</p>
              <p class="effect-details">(companion effect for 2 turns)</p>
            </div>
            <div class="threat-effect-card">
              <h5>Weakening Boundaries</h5>
              <p>The veil between worlds thins, allowing strange energies to seep through</p>
              <p class="effect-details">(+2 difficulty to challenges for 3 turns)</p>
            </div>
          </div>
        </div>
        
        <div class="threat-level-section">
          <h4>Major Threat Events (10+ Threat Tokens)</h4>
          <div class="threat-effects-list">
            <div class="threat-effect-card">
              <h5>Seasonal Disruption</h5>
              <p>The natural cycle of seasons is disrupted, causing environmental chaos</p>
              <p class="effect-details">(seasonal shift for 4 turns)</p>
            </div>
            <div class="threat-effect-card">
              <h5>Otherworldly Manifestation</h5>
              <p>A powerful entity from beyond manifests, draining life force</p>
              <p class="effect-details">(3 health loss over 3 turns)</p>
            </div>
            <div class="threat-effect-card">
              <h5>Resource Blight</h5>
              <p>A mysterious blight affects resources, causing them to wither or spoil</p>
              <p class="effect-details">(lose 3 resources over 4 turns)</p>
            </div>
          </div>
        </div>
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
    
    const threatLevelClass = computed(() => {
      if (threatTokens.value >= 10) return 'danger';
      if (threatTokens.value >= 5) return 'warning';
      return 'safe';
    });
    
    const threatPercentage = computed(() => {
      return Math.min(100, (threatTokens.value / 15) * 100);
    });
    
    const threatLevelDescription = computed(() => {
      if (threatTokens.value >= 15) {
        return 'CRITICAL: The veil between worlds has collapsed!';
      } else if (threatTokens.value >= 10) {
        return 'DANGER: Otherworldly manifestations are occurring!';
      } else if (threatTokens.value >= 5) {
        return 'WARNING: The spiritual balance is disturbed.';
      } else {
        return 'STABLE: The Celtic Realm is in balance.';
      }
    });
    
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
      addThreatPrevention,
      threatLevelClass,
      threatPercentage,
      threatLevelDescription
    };
  }
});
</script>

<style scoped>
.threat-management {
  padding: 20px;
  max-width: 900px;
  margin: 0 auto;
  font-family: 'Cinzel', serif;
}

.threat-dashboard {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
  margin-bottom: 30px;
}

.threat-summary {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.threat-level-indicator {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
}

.threat-level-indicator.safe {
  background-color: rgba(46, 204, 113, 0.1);
  border-left: 5px solid #2ecc71;
}

.threat-level-indicator.warning {
  background-color: rgba(243, 156, 18, 0.1);
  border-left: 5px solid #f39c12;
}

.threat-level-indicator.danger {
  background-color: rgba(231, 76, 60, 0.1);
  border-left: 5px solid #e74c3c;
}

.threat-gauge {
  height: 8px;
  width: 100%;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 15px;
}

.threat-fill {
  height: 100%;
  background: linear-gradient(to right, #2ecc71, #f39c12, #e74c3c);
  transition: width 0.5s ease;
}

.threat-level-indicator h3 {
  margin: 0 0 5px 0;
  font-size: 1.4em;
}

.token-count {
  font-size: 1.2em;
  margin: 5px 0;
}

.token-count span {
  font-weight: bold;
}

.threat-description {
  font-style: italic;
  margin: 10px 0 0 0;
}

.active-effects-summary {
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.active-effects-summary h3 {
  margin-top: 0;
  margin-bottom: 15px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 8px;
}

.no-effects {
  font-style: italic;
  color: #777;
  padding: 10px 0;
}

.effects-summary-list {
  list-style-type: none;
  padding: 0;
  margin: 0;
}

.effect-item {
  padding: 10px 0;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
}

.effect-item:last-child {
  border-bottom: none;
}

.effect-name {
  font-weight: bold;
  color: #e74c3c;
}

.effect-description {
  margin-left: 5px;
}

.effect-duration {
  font-style: italic;
  font-size: 0.9em;
  color: #7f8c8d;
  margin-left: 5px;
}

.threat-actions {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.action-group {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.action-group h4 {
  margin-top: 0;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 8px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
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

.threat-assessment-guide {
  margin: 30px 0;
  padding: 20px;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.threat-assessment-guide h3 {
  margin-top: 0;
  margin-bottom: 20px;
  text-align: center;
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  padding-bottom: 10px;
}

.assessment-levels {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}

.assessment-level {
  display: flex;
  gap: 10px;
  align-items: flex-start;
}

.level-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 5px;
}

.level-indicator.safe {
  background-color: #2ecc71;
}

.level-indicator.warning {
  background-color: #f39c12;
}

.level-indicator.danger {
  background-color: #e74c3c;
}

.level-indicator.critical {
  background-color: #800000;
  box-shadow: 0 0 10px #e74c3c;
}

.level-details h4 {
  margin: 0 0 5px 0;
  font-size: 1.1em;
}

.level-details p {
  margin: 0 0 10px 0;
  font-size: 0.9em;
}

.effect-details {
  margin: 0;
  padding-left: 15px;
  font-size: 0.85em;
}

.threat-effects-reference {
  margin-bottom: 30px;
  padding: 20px;
  background-color: rgba(231, 76, 60, 0.1);
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  border-left: 4px solid #e74c3c;
}

.threat-level-container {
  display: grid;
  gap: 20px;
}

.threat-level-section h4 {
  margin-top: 0;
  margin-bottom: 15px;
  color: #e74c3c;
  border-bottom: 1px solid #e74c3c;
  padding-bottom: 8px;
}

.threat-effects-list {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.threat-effect-card {
  background-color: rgba(255, 255, 255, 0.8);
  padding: 15px;
  border-radius: 8px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  border-left: 3px solid #e74c3c;
  height: 100%;
}

.threat-effect-card h5 {
  margin-top: 0;
  margin-bottom: 10px;
  color: #e74c3c;
  font-size: 1.1em;
}

.threat-effect-card p {
  margin: 5px 0;
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
