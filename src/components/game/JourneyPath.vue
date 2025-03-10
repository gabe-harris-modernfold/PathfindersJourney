<template>
  <div class="journey-path">
    <h2 class="journey-path__title">Journey Path</h2>
    
    <div class="journey-path__map">
      <div 
        v-for="(landscapeId, index) in journeyPath" 
        :key="landscapeId"
        class="journey-path__node"
        :class="{
          'journey-path__node--current': landscapeId === currentLandscapeId,
          'journey-path__node--visited': isVisited(landscapeId),
          'journey-path__node--unvisited': !isVisited(landscapeId)
        }"
        @click="selectLandscape(landscapeId)"
      >
        <div class="journey-path__node-content">
          <span class="journey-path__node-number">{{ index + 1 }}</span>
          <span class="journey-path__node-name">{{ getLandscapeName(landscapeId) }}</span>
        </div>
        
        <div v-if="index < journeyPath.length - 1" class="journey-path__connector"></div>
      </div>
    </div>
    
    <div v-if="selectedLandscape" class="journey-path__details">
      <h3>{{ selectedLandscape.name }}</h3>
      <p>{{ selectedLandscape.description }}</p>
      
      <div class="journey-path__challenge">
        <h4>Challenge: {{ selectedLandscape.challenge.name }}</h4>
        <p>{{ selectedLandscape.challenge.description }}</p>
        <div class="journey-path__challenge-type">
          Type: <span>{{ selectedLandscape.challenge.type }}</span>
        </div>
        <div class="journey-path__challenge-difficulty">
          Difficulty: <span>{{ selectedLandscape.challenge.difficulty }}</span>
        </div>
      </div>
      
      <div class="journey-path__resources">
        <h4>Available Resources:</h4>
        <ul>
          <li v-for="resourceId in selectedLandscape.availableResources" :key="resourceId">
            {{ getResourceName(resourceId) }}
          </li>
        </ul>
      </div>
      
      <div v-if="canMove && selectedLandscape.id !== currentLandscapeId" class="journey-path__actions">
        <button 
          class="journey-path__move-btn"
          @click="moveToLandscape(selectedLandscape.id)"
          :disabled="!canMoveToLandscape(selectedLandscape.id)"
        >
          Move to this Landscape
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';

const props = defineProps<{
  currentLandscapeId: string | null;
  visitedLandscapes: string[];
}>();

const emit = defineEmits<{
  (e: 'move', landscapeId: string): void;
}>();

const gameStore = useGameStore();
const cardStore = useCardStore();

const selectedLandscapeId = ref<string | null>(props.currentLandscapeId);
const journeyPath = computed(() => gameStore.journeyPath);

const selectedLandscape = computed(() => {
  if (!selectedLandscapeId.value) return null;
  return cardStore.getLandscapeById(selectedLandscapeId.value);
});

const canMove = computed(() => {
  return gameStore.currentPhase === 'JOURNEY_PROGRESSION';
});

function isVisited(landscapeId: string): boolean {
  return props.visitedLandscapes.includes(landscapeId);
}

function getLandscapeName(landscapeId: string): string {
  const landscape = cardStore.getLandscapeById(landscapeId);
  return landscape ? landscape.name : 'Unknown';
}

function getResourceName(resourceId: string): string {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : 'Unknown Resource';
}

function selectLandscape(landscapeId: string): void {
  selectedLandscapeId.value = landscapeId;
}

function canMoveToLandscape(landscapeId: string): boolean {
  if (!canMove.value) return false;
  if (!props.currentLandscapeId) return false;
  
  // Can only move to adjacent landscapes
  const currentIndex = journeyPath.value.indexOf(props.currentLandscapeId);
  const targetIndex = journeyPath.value.indexOf(landscapeId);
  
  return Math.abs(currentIndex - targetIndex) === 1;
}

function moveToLandscape(landscapeId: string): void {
  if (canMoveToLandscape(landscapeId)) {
    emit('move', landscapeId);
  }
}
</script>

<style lang="scss" scoped>
.journey-path {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  
  @media (min-width: 1024px) {
    grid-template-columns: 3fr 2fr;
  }
  
  &__title {
    grid-column: 1 / -1;
    color: #5c4d3c;
    border-bottom: 2px solid #8c7851;
    padding-bottom: 0.5rem;
    margin-top: 0;
  }
  
  &__map {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    background: rgba(240, 230, 210, 0.3);
    border-radius: 8px;
    max-height: 500px;
    overflow-y: auto;
    
    @media (min-width: 768px) {
      flex-direction: row;
      flex-wrap: wrap;
      justify-content: center;
    }
  }
  
  &__node {
    position: relative;
    display: flex;
    align-items: center;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s ease;
    
    &-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      z-index: 2;
    }
    
    &-number {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      background: #8c7851;
      color: white;
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    &-name {
      font-size: 0.8rem;
      text-align: center;
      max-width: 100px;
    }
    
    &--current {
      background: rgba(107, 142, 35, 0.3);
      border: 2px solid #6b8e23;
      
      .journey-path__node-number {
        background: #6b8e23;
      }
    }
    
    &--visited {
      background: rgba(140, 120, 81, 0.2);
      
      .journey-path__node-number {
        background: #8c7851;
      }
    }
    
    &--unvisited {
      background: rgba(200, 200, 200, 0.2);
      
      .journey-path__node-number {
        background: #a9a9a9;
      }
    }
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    }
  }
  
  &__connector {
    position: absolute;
    right: -15px;
    top: 50%;
    transform: translateY(-50%);
    width: 30px;
    height: 2px;
    background: #8c7851;
    z-index: 1;
    
    @media (min-width: 768px) {
      right: -20px;
      width: 40px;
    }
  }
  
  &__details {
    padding: 1rem;
    background: rgba(240, 230, 210, 0.3);
    border-radius: 8px;
    
    h3 {
      margin-top: 0;
      color: #5c4d3c;
      border-bottom: 1px solid #8c7851;
      padding-bottom: 0.5rem;
    }
    
    h4 {
      color: #5c4d3c;
      margin-bottom: 0.5rem;
    }
  }
  
  &__challenge {
    margin: 1rem 0;
    padding: 0.75rem;
    background: rgba(255, 255, 255, 0.5);
    border-radius: 4px;
    
    &-type, &-difficulty {
      display: inline-block;
      margin-right: 1rem;
      font-size: 0.9rem;
      
      span {
        font-weight: bold;
      }
    }
  }
  
  &__resources {
    margin: 1rem 0;
    
    ul {
      padding-left: 1.5rem;
      margin: 0.5rem 0;
    }
  }
  
  &__actions {
    margin-top: 1.5rem;
  }
  
  &__move-btn {
    background: #6b8e23;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-weight: bold;
    transition: background 0.2s ease;
    
    &:hover:not(:disabled) {
      background: #556b2f;
    }
    
    &:disabled {
      background: #a9a9a9;
      cursor: not-allowed;
    }
  }
}
</style>
