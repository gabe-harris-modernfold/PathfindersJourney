<template>
  <div class="animal-companion-phase">
    <h2 class="phase-title">ANIMAL COMPANION</h2>
    
    <div v-if="playerStore.animalCompanions.length === 0">
      <div class="companion-selection">
        <h3>Animal Companion Selection</h3>
        <p>Choose a companion to accompany you on your journey.</p>
        
        <div class="companions-grid">
          <div 
            v-for="companion in availableCompanions" 
            :key="companion.id" 
            class="companion-card"
            @click="selectCompanion(companion.id)"
          >
            <h4>{{ companion.name }}</h4>
            <div class="companion-narrative">
              <p>{{ parseJsonString(companion.abilityDescription) }}</p>
              <p>{{ parseJsonString(companion.ability) }}</p>
              
              <p v-if="companion.preferredResources && companion.preferredResources.length > 0">
                <span class="label">Preferred Resources</span>
                {{ getResourceNames(companion.preferredResources).join(', ') }}
              </p>
              
              <p v-if="companion.seasonalAffinity && companion.seasonalAffinity.length > 0">
                <span class="label">Seasonal Affinity</span>
                {{ formatSeasons(companion.seasonalAffinity) }}
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="action-buttons mt-4">
        <div class="game-card action-card" @click="advancePhase">
          <h4>Skip Animal Companion</h4>
          <div style="font-size: 1rem; padding: 5px;">
            Continue without a companion
          </div>
        </div>
      </div>
    </div>
    
    <div v-else>
      <div class="companion-management">
        <h3>Your Animal Companion</h3>
        <div v-for="companionId in playerStore.animalCompanions" :key="companionId" class="selected-companion">
          <div v-if="getCompanion(companionId)" class="companion-narrative">
            <h4>{{ getCompanion(companionId).name }}</h4>
            <p>{{ parseJsonString(getCompanion(companionId).abilityDescription) }}</p>
            <p>{{ parseJsonString(getCompanion(companionId).ability) }}</p>
            
            <p v-if="getCompanion(companionId).preferredResources && getCompanion(companionId).preferredResources.length > 0">
              <span class="label">Preferred Resources</span>
              {{ getResourceNames(getCompanion(companionId).preferredResources).join(', ') }}
            </p>
            
            <p v-if="getCompanion(companionId).seasonalAffinity && getCompanion(companionId).seasonalAffinity.length > 0">
              <span class="label">Seasonal Affinity</span>
              {{ formatSeasons(getCompanion(companionId).seasonalAffinity) }}
            </p>
          </div>
          <div v-else>Companion not found {{ companionId }}</div>
        </div>
      </div>
      
      <div class="action-buttons mt-4">
        <div class="game-card action-card" @click="advancePhase">
          <h4>Continue Journey</h4>
          <div style="font-size: 1rem; padding: 5px;">
            Proceed to the next phase
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import { parseJsonString } from '@/utils/stringUtils';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();
const { phaseService, companionService } = useServices();

// Select a companion - updated to use an available method from companionService
const selectCompanion = (companionId: string) => {
  // Using direct store access per standardization approach
  playerStore.addCompanion(companionId);
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};

// Get available companions
const availableCompanions = companionService.getAvailableCompanions();

// Get companion by ID
const getCompanion = (companionId: string) => {
  return companionService.getCompanion(companionId);
};

// Get resource names
const getResourceNames = (resourceIds: string[]) => {
  return resourceIds.map((resourceId) => {
    const resource = cardStore.getResourceById(resourceId);
    return resource ? resource.name : resourceId;
  });
};

const getResourceNamesText = (resourceIds: string[]) => {
  const resourceNames = getResourceNames(resourceIds);
  return resourceNames.join(', ');
};

// Format seasons
const formatSeasons = (seasons: string[]) => {
  if (!seasons || seasons.length === 0) return '';
  
  const seasonNames = seasons.map((season) => {
    if (typeof season === 'string') {
      return season.split(/(?=[A-Z])/).map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    } else {
      return String(season).split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
  });
  
  if (seasonNames.length === 1) {
    return seasonNames[0];
  } else if (seasonNames.length === 2) {
    return `${seasonNames[0]} and ${seasonNames[1]}`;
  } else {
    const lastSeason = seasonNames.pop();
    return `${seasonNames.join(', ')}, and ${lastSeason}`;
  }
};
</script>

<style lang="scss" scoped>
.animal-companion-phase {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.companion-selection {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.05);
}

.companions-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}

.companion-card {
  background: #f5f5dc;
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.companion-narrative {
  font-size: 0.9rem;
  color: #666;
}

.companion-management {
  border: 2px dashed #ccc;
  border-radius: 8px;
  padding: 16px;
  margin: 16px 0;
  text-align: center;
  background-color: rgba(0, 0, 0, 0.05);
}

.selected-companion {
  margin-bottom: 1rem;
}

.game-card {
  background: #f5f5dc;
  border: 2px solid #8b4513;
  border-radius: 8px;
  padding: 1rem;
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.action-card {
  background: #d2b48c;
}

.label {
  font-weight: bold;
  margin-right: 0.5rem;
}

.btn {
  background: #8b4513;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #654321;
  }
}

.mt-4 {
  margin-top: 1rem;
}
</style>
