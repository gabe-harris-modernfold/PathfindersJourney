<template>
  <div class="status-area debug-component" data-component-name="StatusArea">
    <h2 class="status-area__title">Game Status</h2>
    
    <div class="status-area__content">
      <div class="status-area__tokens">
        <div class="status-area__token-group">
          <div class="status-area__token-label">Threat Tokens:</div>
          <div class="status-area__token-display">
            <div 
              v-for="i in threatTokens" 
              :key="`threat-${i}`" 
              class="status-area__token status-area__token--threat"
            ></div>
            <div 
              v-for="i in (15 - threatTokens)" 
              :key="`empty-threat-${i}`" 
              class="status-area__token status-area__token--empty"
            ></div>
          </div>
          <div class="status-area__token-count">{{ threatTokens }} / 15</div>
        </div>
        
        <div class="status-area__token-group">
          <div class="status-area__token-label">Blessing Tokens:</div>
          <div class="status-area__token-display">
            <div 
              v-for="i in blessingTokens" 
              :key="`blessing-${i}`" 
              class="status-area__token status-area__token--blessing"
            ></div>
            <div 
              v-for="i in (5 - blessingTokens)" 
              :key="`empty-blessing-${i}`" 
              class="status-area__token status-area__token--empty"
            ></div>
          </div>
          <div class="status-area__token-count">{{ blessingTokens }} / 5</div>
        </div>
      </div>
      
      <div class="status-area__info">
        <div class="status-area__info-item">
          <span class="status-area__info-label">Turn:</span>
          <span class="status-area__info-value">{{ turn }}</span>
        </div>
        
        <div class="status-area__info-item">
          <span class="status-area__info-label">Threat Level:</span>
          <span class="status-area__info-value">{{ threatLevel }}</span>
        </div>
        
        <div class="status-area__info-item">
          <span class="status-area__info-label">Landscapes Visited:</span>
          <span class="status-area__info-value">{{ visitedLandscapes }} / 15</span>
        </div>
      </div>
      
      <div v-if="activeEffects.length > 0" class="status-area__effects">
        <h3 class="status-area__effects-title">Active Effects</h3>
        <div 
          v-for="effect in activeEffects" 
          :key="effect.id"
          class="status-area__effect"
        >
          <div class="status-area__effect-name">{{ effect.name }}</div>
          <div class="status-area__effect-duration">
            <span v-if="effect.duration > 0">{{ effect.duration }} turns</span>
            <span v-else>Permanent</span>
          </div>
          <div class="status-area__effect-description">{{ effect.description }}</div>
        </div>
      </div>
      
      <div class="status-area__victory-conditions">
        <h3 class="status-area__victory-title">Victory Conditions</h3>
        <div class="status-area__condition-list">
          <div class="status-area__condition">
            <div class="status-area__condition-check" :class="{ 'completed': victoryConditions.journeyCompleted }"></div>
            <div class="status-area__condition-text">Complete the Journey</div>
          </div>
          <div class="status-area__condition">
            <div class="status-area__condition-check" :class="{ 'completed': victoryConditions.balanceMaintained }"></div>
            <div class="status-area__condition-text">Maintain Balance (< 6 Threat)</div>
          </div>
          <div class="status-area__condition">
            <div class="status-area__condition-check" :class="{ 'completed': victoryConditions.knowledgeAcquired }"></div>
            <div class="status-area__condition-text">Acquire Knowledge (2+ Items)</div>
          </div>
          <div class="status-area__condition">
            <div class="status-area__condition-check" :class="{ 'completed': victoryConditions.bondsFormed }"></div>
            <div class="status-area__condition-text">Form Bonds (1+ Companion)</div>
          </div>
          <div class="status-area__condition">
            <div class="status-area__condition-check" :class="{ 'completed': victoryConditions.questFulfilled }"></div>
            <div class="status-area__condition-text">Fulfill Personal Quest</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

const props = defineProps<{
  threatTokens: number;
  blessingTokens: number;
  turn: number;
}>();

const gameStore = useGameStore();

const threatLevel = computed(() => Math.floor(props.threatTokens / 3));

const visitedLandscapes = computed(() => gameStore.visitedLandscapes.length);

const activeEffects = computed(() => {
  // Combine game and player effects
  const tempEffects = gameStore.tempEffects || [];
  return tempEffects;
});

const victoryConditions = computed(() => gameStore.victoryConditions || {
  journeyCompleted: false,
  balanceMaintained: false,
  knowledgeAcquired: false,
  bondsFormed: false,
  questFulfilled: false
});
</script>

<style lang="scss" scoped>
.status-area {
  background: rgba(240, 230, 210, 0.5);
  border-radius: 8px;
  padding: 1rem;
  
  &__title {
    margin-top: 0;
    color: #5c4d3c;
    border-bottom: 2px solid #8c7851;
    padding-bottom: 0.5rem;
  }
  
  &__content {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }
  
  &__tokens {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }
  
  &__token-group {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }
  
  &__token-label {
    font-weight: bold;
    color: #5c4d3c;
  }
  
  &__token-display {
    display: flex;
    flex-wrap: wrap;
    gap: 0.25rem;
  }
  
  &__token {
    width: 15px;
    height: 15px;
    border-radius: 50%;
    
    &--threat {
      background: #8b0000;
    }
    
    &--blessing {
      background: #6b8e23;
    }
    
    &--empty {
      background: #d4c8a8;
      opacity: 0.3;
    }
  }
  
  &__token-count {
    font-size: 0.8rem;
    color: #5c4d3c;
    text-align: right;
  }
  
  &__info {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
  
  &__info-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  &__info-label {
    font-weight: bold;
    color: #5c4d3c;
  }
  
  &__info-value {
    color: #333;
  }
  
  &__effects {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
  
  &__effects-title {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #5c4d3c;
  }
  
  &__effect {
    padding: 0.5rem;
    margin-bottom: 0.5rem;
    background: rgba(140, 120, 81, 0.1);
    border-radius: 4px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  &__effect-name {
    font-weight: bold;
    color: #5c4d3c;
  }
  
  &__effect-duration {
    font-size: 0.8rem;
    color: #666;
    margin-bottom: 0.25rem;
  }
  
  &__effect-description {
    font-size: 0.9rem;
  }
  
  &__victory-conditions {
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
  }
  
  &__victory-title {
    margin-top: 0;
    margin-bottom: 0.75rem;
    font-size: 1rem;
    color: #5c4d3c;
  }
  
  &__condition-list {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }
  
  &__condition {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  &__condition-check {
    width: 18px;
    height: 18px;
    border: 2px solid #8c7851;
    border-radius: 3px;
    position: relative;
    
    &.completed {
      background: #6b8e23;
      border-color: #6b8e23;
      
      &:after {
        content: '';
        position: absolute;
        top: 2px;
        left: 6px;
        width: 5px;
        height: 10px;
        border: solid white;
        border-width: 0 2px 2px 0;
        transform: rotate(45deg);
      }
    }
  }
  
  &__condition-text {
    font-size: 0.9rem;
    color: #333;
  }
}

@media (max-width: 768px) {
  .status-area {
    &__tokens {
      flex-direction: row;
      justify-content: space-between;
    }
    
    &__token-group {
      width: 48%;
    }
  }
}
</style>
