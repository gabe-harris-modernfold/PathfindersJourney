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
          <div v-if="getCompanion(companionId) && hasCompatibleResources(companionId)" class="companion-narrative">
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
            
            <p>
              <span class="label">Compatible Resources in Your Pack</span>
              {{ getPlayerCompatibleResourcesText(companionId) }}
            </p>
            
            <div v-if="isResourcesRunningLow(companionId)" class="resource-warning">
              <p>⚠️ <strong>Warning:</strong> Resources for this companion are running low!</p>
            </div>
            
            <div class="action-buttons mt-4">
              <div class="game-card action-card" @click="useCompanionAbility(companionId)">
                <h4>Use Ability</h4>
              </div>
              <div class="game-card action-card warning" @click="dismissCompanion(companionId)">
                <h4>Dismiss</h4>
              </div>
            </div>
            
            <div v-if="getCompatibleResources(companionId).length > 0" class="mt-4">
              <h4>Feed with Resources</h4>
              <div class="resource-grid">
                <GameCard 
                  v-for="resourceId in getCompatibleResources(companionId)" 
                  :key="resourceId"
                  :title="getResourceName(resourceId)"
                  cardType="RESOURCE"
                  class="resource-card"
                  @click="feedCompanionWithResource(companionId, resourceId)"
                >
                  <div class="resource-content">
                    <p>{{ getResourceDescription(resourceId) }}</p>
                    <div class="resource-action">
                      <small>Click to feed companion</small>
                    </div>
                  </div>
                </GameCard>
              </div>
            </div>
            <div v-else class="mt-4">
              <p><em>No compatible resources to feed this companion.</em></p>
            </div>
          </div>
          <div v-else-if="getCompanion(companionId)">No compatible resources found for {{ getCompanion(companionId).name }}</div>
          <div v-else>Companion not found {{ companionId }}</div>
        </div>
      </div>
      
      <div class="action-buttons mt-4">
        <div class="game-card action-card" @click.prevent="advancePhase">
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
import { useLogStore } from '@/stores/logStore';
import { useServices } from '@/composables/useServices';
import { parseJsonString } from '@/utils/stringUtils';
import { onMounted } from 'vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();
const logStore = useLogStore();
const { phaseService, companionService } = useServices();

// Lifecycle hook to check and update companion status
onMounted(() => {
  checkCompanionResourceRequirements();
});

// Check if each bonded companion has compatible resources
// and unbond those without resources
const checkCompanionResourceRequirements = () => {
  const unbondedCompanions = [];
  
  playerStore.animalCompanions.forEach(companionId => {
    const companion = getCompanion(companionId);
    if (!companion) return;
    
    const hasCompatible = hasCompatibleResources(companionId);
    
    if (!hasCompatible) {
      // Add to list of companions to unbond
      unbondedCompanions.push({id: companionId, name: companion.name});
    }
  });
  
  // Process unbonding outside the loop to avoid modifying the array during iteration
  unbondedCompanions.forEach(companion => {
    playerStore.removeCompanion(companion.id);
    logStore.addToGameLog(
      `Your ${companion.name} has left your company due to lack of compatible resources.`, 
      true, 
      'companion'
    );
  });
};

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

// Check if a companion has compatible resources in the player's inventory
const hasCompatibleResources = (companionId: string) => {
  const companion = getCompanion(companionId);
  if (!companion || !companion.preferredResources) return false;
  
  return companion.preferredResources.some((prefResource) => {
    return playerStore.resources.some(resourceId => {
      const resource = cardStore.getResourceById(resourceId);
      if (!resource) return false;
      
      // Check both exact match and resource type match
      const resourceType = resourceId.split('_').slice(0, -1).join('_');
      return resourceType === prefResource || resourceId === prefResource;
    });
  });
};

// Get compatible resources text for a companion
const getPlayerCompatibleResourcesText = (companionId: string) => {
  const companion = getCompanion(companionId);
  if (!companion || !companion.preferredResources) return 'None';
  
  const compatibleResourceIds = playerStore.resources.filter(resourceId => {
    const resource = cardStore.getResourceById(resourceId);
    if (!resource) return false;
    
    return companion.preferredResources.some(prefResource => {
      // Check both exact match and resource type match
      const resourceType = resourceId.split('_').slice(0, -1).join('_');
      return resourceType === prefResource || resourceId === prefResource;
    });
  });
  
  if (compatibleResourceIds.length === 0) return 'None';
  
  return getResourceNamesText(compatibleResourceIds);
};

// Check if resources for a companion are running low
const isResourcesRunningLow = (companionId: string) => {
  // Get compatible resources for this companion
  const compatibleResources = getCompatibleResources(companionId);
  
  // If there are 2 or fewer compatible resources, they're running low
  return compatibleResources.length > 0 && compatibleResources.length <= 2;
};

// Use companion ability
const useCompanionAbility = (companionId: string) => {
  const success = playerStore.useCompanionAbility(companionId);
  if (success) {
    logStore.addToGameLog(`You used ${getCompanion(companionId)?.name}'s special ability.`, true, 'companion');
  } else {
    logStore.addToGameLog(`Unable to use ${getCompanion(companionId)?.name}'s special ability.`, true, 'error');
  }
};

// Get resource name
const getResourceName = (resourceId: string) => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : resourceId;
};

// Get resource description
const getResourceDescription = (resourceId: string) => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.description : '';
};

// Get compatible resources for a companion
const getCompatibleResources = (companionId: string) => {
  const companion = getCompanion(companionId);
  if (!companion || !companion.preferredResources) return [];
  
  return playerStore.resources.filter(resourceId => {
    const resource = cardStore.getResourceById(resourceId);
    if (!resource) return false;
    
    return companion.preferredResources?.some(prefResource => {
      const resourceType = resourceId.split('_').slice(0, -1).join('_');
      return resourceType === prefResource || resourceId === prefResource;
    }) || false;
  });
};

// Feed companion with specific resource
const feedCompanionWithResource = (companionId: string, resourceId: string) => {
  const companion = getCompanion(companionId);
  const resource = cardStore.getResourceById(resourceId);
  if (!companion || !resource) return;
  
  const success = companionService.feedCompanion(companionId, resourceId);
  
  if (success) {
    logStore.addToGameLog(`You fed ${resource.name} to your ${companion.name}.`, true, 'companion');
  } else {
    logStore.addToGameLog(`Failed to feed your companion.`, true, 'error');
  }
};

// Dismiss companion
const dismissCompanion = (companionId: string) => {
  const companion = getCompanion(companionId);
  if (!companion) return;
  
  playerStore.removeCompanion(companionId);
  logStore.addToGameLog(`You bid farewell to your ${companion.name}.`, true, 'companion');
};
</script>

<style lang="scss" scoped>
.animal-companion-phase {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  text-align: center;
  
  @media (min-width: 768px) {
    padding: 0 1rem;
  }
}

.phase-title {
  font-family: 'Cinzel', serif;
  font-size: 1.8rem;
  margin-bottom: 0.3rem;
  color: #3c2415;
  text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.2);
}

.phase-description {
  margin-bottom: 1rem;
  font-style: italic;
  color: #5a4534;
}

.companion-selection {
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (min-width: 768px) {
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
  }
}

.companion-card {
  margin: 0.25rem;
  width: 100%;
  max-width: 300px;
  cursor: pointer;
  
  @media (min-width: 768px) {
    width: calc(33.333% - 0.5rem);
  }
}

.companion-management {
  margin-top: 1rem;
  border: 1px solid #e0d2c3;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: rgba(255, 255, 255, 0.8);
}

.selected-companion {
  margin-top: 0.5rem;
  text-align: left;
}

.companion-narrative {
  h4 {
    margin-bottom: 0.25rem;
    color: #3c2415;
  }
  
  p {
    margin-bottom: 0.25rem;
    color: #5a4534;
  }
  
  .label {
    font-weight: bold;
    color: #8b4513;
    margin-right: 0.25rem;
  }
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.action-btn {
  background: #8b4513;
  color: white;
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  
  &:hover {
    background: #654321;
  }
}

.warning {
  background: #ffc107;
  
  &:hover {
    background: #ff9900;
  }
}

.mt-4 {
  margin-top: 0.5rem;
}

.resource-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.resource-card {
  cursor: pointer;
  transition: transform 0.2s;
  
  &:hover {
    transform: translateY(-4px);
  }
}

.resource-content {
  font-size: 0.9rem;
}

.resource-action {
  font-size: 0.8rem;
  color: #999;
  margin-top: 0.25rem;
}

.resource-warning {
  color: #ff9900;
  font-weight: bold;
  margin-top: 0.25rem;
}
</style>
