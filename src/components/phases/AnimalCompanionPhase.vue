<template>
  <div class="animal-companion-phase">
    <h2 class="phase-title">ANIMAL COMPANION</h2>
    
    <div v-if="playerStore.animalCompanions.length === 0">
      <div class="companion-selection">
        <h3>Animal Companion Selection</h3>
        <p>Choose a companion to accompany you on your journey.</p>
        
        <div class="companions-grid">
          <GameCard
            v-for="companion in availableCompanions" 
            :key="companion.id" 
            :title="companion.name"
            :subtitle="'Animal Companion'"
            :cardType="CardType.ANIMAL_COMPANION"
            class="companion-card"
            @click="selectCompanion(companion.id)"
          >
            <div class="companion-narrative">
              <p>{{ parseJsonString(companion.ability) }}</p>
            </div>
          </GameCard>
        </div>
      </div>
      
      <div class="action-buttons bottom-actions">
        <!-- Modified Skip Animal Companion Card -->
        <GameCard
          title="Skip Animal Companion"
          :cardType="CardType.ACTION"
          class="skip-companion-card" 
          @click="advancePhase"
        >
          <!-- Use header slot with empty content to override default header -->
          <template #header>
            <!-- Intentionally empty -->
          </template>
          
          <!-- Wrapper for image and text overlay -->
          <div class="card-image-overlay-wrapper">
            <img 
              :src="require('@/assets/images/skip-animal-phase.jpg')" 
              alt="Skip Animal Companion" 
              class="card-landscape-image"
            />
            <div class="card-text-overlay"></div> 
            
            <!-- Manually render content inside -->
            <div class="card-content-over-image">
               <h3 class="card-title-over-image">Continue without Companion</h3>
              <p class="card-landscape-description">
                Proceed to the next phase alone.
              </p>
            </div>
          </div>
        </GameCard>
      </div>
    </div>
    
    <div v-else>
      <div class="companion-management">
        <h3>Your Animal Companion</h3>
        <div v-for="companionId in playerStore.animalCompanions" :key="companionId" class="selected-companion">
          <div v-if="getCompanion(companionId) && hasCompatibleResources(companionId)">
            <!-- Main Companion Card -->
            <GameCard
              :title="getCompanion(companionId).name"
              :subtitle="'Animal Companion'"
              :cardType="CardType.ANIMAL_COMPANION"
              class="selected-companion-card"
            >
              <p>{{ parseJsonString(getCompanion(companionId).ability) }}</p>
            </GameCard>
            
            <!-- Resource feeding with cleaner UI -->
            <div class="resource-offerings">
              <h4>Make an Offering to your companions</h4>
              <div class="compatible-resources" v-if="hasCompatibleResources(companionId)">
                <div class="resource-item" v-for="resourceId in getCompatibleResourceIds(companionId)" :key="resourceId">
                  <GameCard 
                    :title="getResourceName(resourceId)" 
                    :cardType="CardType.RESOURCE"
                    @click="feedCompanionWithResource(companionId, resourceId)"
                  >
                    <div class="resource-details">
                      <p>{{ getResourceDescription(resourceId) }}</p>
                      <p class="action-text">Offer this resource</p>
                    </div>
                  </GameCard>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="getCompanion(companionId)">No compatible resources found for {{ getCompanion(companionId).name }}</div>
          <div v-else>Companion not found {{ companionId }}</div>
        </div>
      </div>
      
      <div class="action-buttons bottom-actions">
        <GameCard
          title="Continue Journey"
          :cardType="CardType.ACTION"
          class="action-card"
          @click="advancePhase"
        />
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
import GameCard from '@/components/GameCard.vue';
import { CardType } from '@/models/enums/cardTypes';

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

// Navigate to next phase
const advancePhase = () => {
  console.log('Advancing to next phase');
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

// Get compatible resource IDs for a companion
const getCompatibleResourceIds = (companionId: string) => {
  return getCompatibleResources(companionId).map(resourceId => resourceId);
};

// Feed companion with specific resource
const feedCompanionWithResource = (companionId: string, resourceId: string) => {
  const companion = getCompanion(companionId);
  const resource = cardStore.getResourceById(resourceId);
  if (!companion || !resource) return;
  
  const success = companionService.feedCompanion(companionId, resourceId);
  
  if (success) {
    logStore.addToGameLog(`You offered ${resource.name} to your ${companion.name}.`, true, 'companion');
    const loyalty = companionService.getLoyalty(companionId);
    logStore.addToGameLog(`${companion.name} now has a loyalty level of ${loyalty}.`, true, 'companion');
  } else {
    logStore.addToGameLog(`Failed to feed your companion.`, true, 'error');
  }
};

// Continue journey 
const continueJourney = () => {
  console.log('Continue journey button clicked');
  advancePhase();
};
</script>

<style lang="scss" scoped>
.animal-companion-phase {
  display: flex;
  flex-direction: column;
  min-height: 100%;
  text-align: center;
  padding: 1rem;
  
  .phase-title {
    text-align: center;
    margin-bottom: 1.5rem;
  }
  
  .companion-selection {
    margin-bottom: 2rem;
  }
  
  .companions-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    justify-content: flex-start;
    margin-left: 1rem;
    
    .companion-card {
      flex: 0 0 calc(25% - 0.5rem);
      max-width: calc(25% - 0.5rem);
      transform: scale(0.5);
      transform-origin: top left;
      margin-bottom: -2rem;
      margin-right: -4rem;
      
      :deep(.game-card__title) {
        font-size: 0.9rem;
      }
      
      :deep(.game-card__subtitle) {
        font-size: 0.75rem;
      }
      
      :deep(.game-card__body) {
        font-size: 0.75rem;
      }
    }
  }
  
  .selected-companion {
    margin-bottom: 2rem;
    margin-left: 1rem;
    
    .selected-companion-card {
      transform: scale(0.5);
      transform-origin: top left;
      margin-bottom: -2rem;
      margin-right: -4rem;
      
      :deep(.game-card__title) {
        font-size: 0.9rem;
      }
      
      :deep(.game-card__subtitle) {
        font-size: 0.75rem;
      }
      
      :deep(.game-card__body) {
        font-size: 0.75rem;
      }
    }
  }
  
  .resource-offerings {
    margin-top: 1rem;
  }
  
  .compatible-resources {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-left: 1rem;
    
    .resource-item {
      .resource-card {
        flex: 0 0 calc(25% - 0.5rem);
        max-width: calc(25% - 0.5rem);
        transform: scale(0.5);
        transform-origin: top left;
        margin-bottom: -2rem;
        margin-right: -4rem;
        cursor: pointer;
        
        :deep(.game-card__title) {
          font-size: 0.9rem;
        }
        
        :deep(.game-card__body) {
          font-size: 0.75rem;
        }
      }
    }
  }
  
  .action-buttons {
    display: flex;
    gap: 0.5rem;
    
    &.bottom-actions {
      margin-top: 2rem;
      justify-content: center;
      display: flex;
      
      .action-card {
        transform: scale(0.5);
        transform-origin: center;
        margin: 0 auto;
        
        :deep(.game-card__title) {
          font-size: 1.1rem;
        }
      }
    }
  }
  
  .label {
    font-weight: bold;
    margin-right: 0.5rem;
  }
  
  .resource-warning {
    color: #e74c3c;
    margin-top: 0.5rem;
  }
  
  .mt-4 {
    margin-top: 1rem;
  }
}

/* Styles for the Skip Animal Companion card image overlay effect */
.skip-companion-card {
  max-width: 300px; 
  margin: 0 auto; 
  
  // Explicitly collapse the header div
  :deep(.game-card__header) {
    padding: 0;
    height: 0;
    border: none;
    overflow: hidden;
  }

  // Remove padding from the body
  :deep(.game-card__body) {
    padding: 0;
    height: 100%;
    // Hide the default symbol if present
    .game-card__symbol {
      display: none;
    }
  }

  // Wrapper positioned absolutely relative to the .game-card
  .card-image-overlay-wrapper {
    position: absolute; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; 
    z-index: 1; 
    border-radius: inherit; 
    overflow: hidden; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    min-height: 0; 
  }

  // Style for the image
  .card-landscape-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: 0; 
  }

  // Overlay for text readability
  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  // Container for text content over the image
  .card-content-over-image {
    position: relative; 
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 1rem; 
    width: 100%;
    box-sizing: border-box; 
  }

  // Style for the title over the image
  .card-title-over-image {
    font-size: 1.4rem; 
    font-weight: bold;
    margin: 0 0 0.5rem 0; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  // Style for the description text
  .card-landscape-description {
    font-size: 1rem; 
    margin: 0; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }
}
</style>
