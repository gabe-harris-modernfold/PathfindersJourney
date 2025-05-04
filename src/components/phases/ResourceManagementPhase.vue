<template>
  <div class="resource-management-phase">
    <h2 class="phase-title">TREASURES OF THE JOURNEY</h2>
    <div class="phase-description">
      <p>The whispers of the wild call you to gather mystical bounties and arrange your curious collection...</p>
    </div>
    
    <div class="resource-management-container">
      <div class="resource-panel">
        <h3>Your Traveling Pack ({{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }})</h3>
        <p v-if="!playerStore.resources.length">Your pack lies empty, awaiting wondrous finds...</p>
        <div v-else class="resource-grid">
          <GameCard 
            v-for="resourceId in playerStore.resources" 
            :key="resourceId"
            :title="getResourceName(resourceId)"
            :card-type="CardType.RESOURCE"
            class="resource-card resource-card-full-bg"
            @click="confirmResourceDiscard(resourceId)"
            :is-selected="resourceToDiscard === resourceId"
          >
            <template #header>
              <!-- Intentionally empty -->
            </template>
            
            <!-- Wrapper for image and text overlay -->
            <div class="card-image-overlay-wrapper">
              <img 
                v-if="getResourceImagePath(resourceId)" 
                :src="getResourceImagePath(resourceId)" 
                :alt="`${getResourceName(resourceId)} image`" 
                class="card-resource-image" 
              />
              <div class="card-text-overlay"></div> 
              
              <!-- Manually render title, subtitle, description, action inside -->
              <div class="card-content-over-image">
                <h3 class="card-title-over-image">{{ getResourceName(resourceId) }}</h3>
                <h4 class="card-subtitle-over-image">{{ `Type: ${getResourceType(resourceId)}` }}</h4>
                <p class="card-resource-description">{{ getResourceDescription(resourceId) }}</p>
                <div class="resource-action-over-image">
                  <small>Click to discard</small>
                </div>
              </div>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
    
    <div class="resource-actions">
      <!-- Modified Gather Resources Card -->
      <GameCard 
        title="Gather Resources" 
        :cardType="CardType.ACTION"
        :disabled="cannotGatherResources"
        @click="gatherResources"
        class="resource-gather-card" 
      >
        <!-- Use header slot with empty content to override default header -->
        <template #header>
          <!-- Intentionally empty -->
        </template>
        
        <!-- Wrapper for image and text overlay -->
        <div class="card-image-overlay-wrapper">
          <img 
            :src="require('@/assets/images/traveling-pack.jpg')" 
            alt="Gather Resources" 
            class="card-landscape-image"
          />
          <div class="card-text-overlay"></div> 
            
          <!-- Manually render content inside -->
          <div class="card-content-over-image">
            <h3 class="card-title-over-image">Gather Resources</h3>
            <p class="card-landscape-description">
              Gather resources from the current landscape
              <span v-if="cannotGatherResources">(Your resource capacity is full)</span>
            </p>
          </div>
        </div>
      </GameCard>
      
      <!-- Modified Continue Journey Card -->
      <GameCard 
        title="Continue Journey" 
        :cardType="CardType.ACTION"
        @click="advancePhase"
        class="resource-continue-card" 
      >
        <!-- Use header slot with empty content to override default header -->
        <template #header>
          <!-- Intentionally empty -->
        </template>
        
        <!-- Wrapper for image and text overlay -->
        <div class="card-image-overlay-wrapper">
          <img 
            :src="require('@/assets/images/continue-journey.jpg')" 
            alt="Continue Journey" 
            class="card-landscape-image"
          />
          <div class="card-text-overlay"></div> 
          
          <!-- Manually render content inside -->
          <div class="card-content-over-image">
            <h3 class="card-title-over-image">Continue Journey</h3>
            <p class="card-landscape-description">
              Proceed to the next phase
            </p>
          </div>
        </div>
      </GameCard>
    </div>
    
    <!-- Resource discard confirmation modal -->
    <div v-if="showDiscardModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Discard Resource?</h3>
        <p>Are you sure you want to discard {{ getResourceName(resourceToDiscard) }}?</p>
        <div class="modal-buttons">
          <button class="confirm" @click="discardResource">Discard</button>
          <button class="cancel" @click="cancelDiscard">Cancel</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { useLogStore } from '@/stores/logStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';
import { CardType } from '@/models/enums/cardTypes';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();
const logStore = useLogStore();
const { phaseService, resourceService } = useServices();

// Check resources when component mounts
onMounted(() => {
  // Log current resource status with numbers
  const resourceCount = playerStore.resourceCount;
  const resourceCapacity = playerStore.resourceCapacity;
  
  if (resourceCount === 0) {
    logStore.addToGameLog(`You check your belongings. Your pack is empty (0/${resourceCapacity} resources).`, true, 'resource');
    
    // Re-apply starting resources from character if they should be there
    if (playerStore.character) {
      let startingResourceCount = 0;
      let startingResources: string[] = [];
      
      // Check both startingResources and startingItems
      if (playerStore.character.startingResources && playerStore.character.startingResources.length > 0) {
        startingResources = [...playerStore.character.startingResources];
        startingResourceCount += playerStore.character.startingResources.length;
      }
      
      if (playerStore.character.startingItems && playerStore.character.startingItems.length > 0) {
        startingResources = [...startingResources, ...playerStore.character.startingItems];
        startingResourceCount += playerStore.character.startingItems.length;
      }
      
      if (startingResourceCount > 0) {
        logStore.addToGameLog(`You search more carefully and find ${startingResourceCount} items you had forgotten about.`, true, 'resource');
        
        let addedCount = 0;
        startingResources.forEach(resourceId => {
          const resource = cardStore.getResourceById(resourceId);
          if (resource) {
            playerStore.addResource(resourceId);
            addedCount++;
            const resourceTypeText = resource.resourceCategory ? ` - a ${resource.resourceCategory.replace('_', ' ')} resource` : '';
            const resourceEffectText = resource.effectText ? `: ${resource.effectText}` : '';
            logStore.addToGameLog(`You add ${resource.name}${resourceTypeText}${resourceEffectText} to your pack (${addedCount}/${resourceCapacity} resources).`, true, 'resource');
          }
        });
      }
    }
  } else {
    logStore.addToGameLog(`You check your pack. You have ${resourceCount}/${resourceCapacity} resources available.`, true, 'resource');
    
    if (resourceCount > 0) {
      logStore.addToGameLog(`Your inventory contains:`, true, 'resource');
      playerStore.resources.forEach(resourceId => {
        const resource = cardStore.getResourceById(resourceId);
        if (resource) {
          const typeInfo = resource.resourceCategory ? `(${resource.resourceCategory.replace('_', ' ')})` : '';
          const effectInfo = resource.effectText ? `Effect: ${resource.effectText}` : '';
          const preferredInfo = resource.preferredBy?.length > 0 ? `Preferred by: ${resource.preferredBy.join(', ')}` : '';
          
          let resourceDetails = `- ${resource.name} ${typeInfo}`;
          if (effectInfo) resourceDetails += `. ${effectInfo}`;
          if (preferredInfo) resourceDetails += `. ${preferredInfo}`;
          
          logStore.addToGameLog(resourceDetails, false, 'resource');
        }
      });
    }
  }
});

// Get resource name from card store
const getResourceName = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : `Unknown (${resourceId})`;
};

// Get resource description from card store
const getResourceDescription = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.description : 'A mysterious resource.';
};

// Get resource image path from card store
const getResourceImagePath = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  if (!resource || !resource.image) return '';
  try {
    return require(`@/assets/images/${resource.image}`);
  } catch (e) {
    console.error(`Failed to load image for resource ${resourceId}: ${resource.image}`, e);
    return '';
  }
};

// Get resource type from card store
const getResourceType = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.type : 'Unknown';
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};

// Gather resources - simplified for testing
const gatherResources = () => {
  // Debug logging to see what's happening
  console.log('Gathering resources');
  console.log('Card store resources:', cardStore.resources);
  console.log('Player resources:', playerStore.resources);
  console.log('Player resource count:', playerStore.resourceCount);
  console.log('Player resource capacity:', playerStore.resourceCapacity);
  
  // Directly get all resources from cardStore
  const allResources = cardStore.resources;
  
  if (allResources.length === 0) {
    console.log('No resources available');
    logStore.addToGameLog("No resources available to gather.", true, 'error');
    return;
  }
  
  // Check capacity
  if (playerStore.resourceCount >= playerStore.resourceCapacity) {
    logStore.addToGameLog(`Your resource capacity (${playerStore.resourceCapacity}) is full. You must discard resources before gathering more.`, true, 'resource');
    return;
  }
  
  // Pick a random resource - simplified approach
  const randomIndex = Math.floor(Math.random() * allResources.length);
  const resource = allResources[randomIndex];
  
  console.log('Selected resource:', resource);
  
  if (!resource) {
    logStore.addToGameLog(`Failed to gather a resource.`, true, 'error');
    return;
  }
  
  // Add resource to player inventory
  const resourceId = resource.id;
  const addResult = playerStore.addResource(resourceId);
  
  console.log('Add result:', addResult);
  
  if (addResult) {
    // Use resource properties for detailed description
    const resourceTypeText = resource.resourceCategory ? ` (${resource.resourceCategory.replace('_', ' ')})` : '';
    const resourceEffectText = resource.effectText ? `: ${resource.effectText}` : '';
    
    logStore.addToGameLog(`You gathered ${resource.name}${resourceTypeText}${resourceEffectText}.`, true, 'resource');
  } else {
    // If we can't add the resource (e.g., inventory full), let the user know
    logStore.addToGameLog(`Your resource capacity (${playerStore.resourceCapacity}) is full. You must discard resources before gathering more.`, true, 'resource');
  }
};

// For testing: Always enable gather resources button
const cannotGatherResources = computed(() => {
  // Debug logging
  console.log('Checking if gather resources is disabled');
  console.log('Card store resources count:', cardStore.resources?.length || 0);
  console.log('Player resource count:', playerStore.resourceCount);
  console.log('Player resource capacity:', playerStore.resourceCapacity);
  
  // Always enable for testing
  return playerStore.resourceCount >= playerStore.resourceCapacity;
});

// Get gather resources disabled reason
const gatherResourcesDisabledReason = computed(() => {
  // Always empty for testing
  return '';
});

// Resource discard confirmation
const resourceToDiscard = ref<string | null>(null);
const showDiscardModal = ref(false);

// Confirm resource discard
const confirmResourceDiscard = (resourceId: string) => {
  resourceToDiscard.value = resourceId;
  showDiscardModal.value = true;
};

// Discard the selected resource
const discardResource = () => {
  if (resourceToDiscard.value) {
    const resourceName = getResourceName(resourceToDiscard.value);
    playerStore.removeResource(resourceToDiscard.value);
    console.log(`Discarded ${resourceName}`);
    
    // Close the modal
    showDiscardModal.value = false;
    resourceToDiscard.value = null;
  }
};

// Cancel resource discard
const cancelDiscard = () => {
  showDiscardModal.value = false;
  resourceToDiscard.value = null;
};
</script>

<style lang="scss" scoped>
.resource-management-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0;
}

.phase-title {
  font-size: 1.8rem;
  color: #5a3e2b;
  margin: 0 0 0.25rem 0;
}

.phase-description {
  text-align: center;
  margin-bottom: 0.5rem;
  color: #665e52;
}

.resource-management-container {
  width: 100%;
  background-color: rgba(245, 245, 220, 0.5);
  border: 1px solid #8b4513;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.resource-panel {
  h3 {
    color: #5a3e2b;
    margin-bottom: 1rem;
  }
}

.resource-grid {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 15px;
  margin-top: 15px;
  overflow-x: auto;
}

.card-image-overlay-wrapper {
  position: relative;
  height: 100%;
  width: 100%;
}

.card-resource-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 4px;
  opacity: 0.9; /* Keep slight transparency */
}

.card-text-overlay {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  width: 100%;
  background-color: transparent; /* No dark overlay */
  border-radius: 4px;
}

.card-content-over-image {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  color: white; /* Keep default white for title/subtitle */
}

.card-title-over-image {
  font-size: 1.2rem;
  font-weight: bold;
  margin-bottom: 0.25rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
}

.card-subtitle-over-image {
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  opacity: 0.9;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.card-resource-description {
  font-size: 0.85rem;
  margin-bottom: 0.5rem;
  color: #333333; /* Dark grey description text */
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.6);
}

.resource-action-over-image {
  font-size: 0.8rem;
  margin-top: 10px;
  opacity: 0.8;
  color: white; /* Keep action text white */
}

.resource-card-full-bg {
  max-width: 250px; 
  position: relative; 
  border-radius: 0.5rem; 
  overflow: hidden; 
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2); 

  :deep(.game-card__header) {
    padding: 0;
    height: 0;
    border: none;
    overflow: hidden;
  }

  :deep(.game-card__body) {
    padding: 0;
    height: 100%;
    display: flex; 
    align-items: stretch; 
    .game-card__symbol {
      display: none;
    }
  }

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
  }

  .card-resource-image { 
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: 0; 
  }

  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  .card-content-over-image {
    position: relative; 
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 1rem; 
    width: 100%;
    height: 100%; 
    box-sizing: border-box; 
    display: flex;
    flex-direction: column;
    justify-content: space-between; 
  }

  .card-title-over-image {
    font-size: 1.2rem; 
    font-weight: bold;
    margin: 0 0 0.25rem 0; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
    line-height: 1.2;
  }
  
  .card-subtitle-over-image {
    font-size: 0.8rem;
    font-weight: normal;
    margin: 0 0 0.5rem 0;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    opacity: 0.9;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }

  .card-resource-description {
    font-size: 0.9rem; 
    margin: 0; 
    flex-grow: 1; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
    line-height: 1.3;
    overflow: hidden; 
    text-overflow: ellipsis; 
  }
  
  .resource-action-over-image {
    margin-top: 0.5rem;
    font-size: 0.8rem;
    opacity: 0.8;
    small {
      text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.6); 
      font-style: italic;
    }
  }
  
  &:hover {
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
  
  &[is-selected="true"] {
     border: 2px solid #ffcc00; 
     box-shadow: 0 0 10px #ffcc00;
  }
}

.resource-actions {
  display: flex;
  flex-direction: row;
  justify-content: center;
  gap: 1rem;
  margin-top: 1rem;
  width: 100%;
  
  .game-card {
    flex: 0 1 300px;  
    max-width: 400px;
  }
}

/* Styles for the Gather Resources card image overlay effect */
.resource-gather-card {
  max-width: 300px; 
  margin-bottom: 1rem; 

  :deep(.game-card__header) {
    padding: 0;
    height: 0;
    border: none;
    overflow: hidden;
  }

  :deep(.game-card__body) {
    padding: 0;
    height: 100%;
    .game-card__symbol {
      display: none;
    }
  }

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

  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  .card-content-over-image {
    position: relative; 
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 1rem; 
    width: 100%;
    box-sizing: border-box; 
  }

  .card-title-over-image {
    font-size: 1.4rem; 
    font-weight: bold;
    margin: 0 0 0.5rem 0; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  .card-landscape-description {
    font-size: 1rem; 
    margin: 0; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }
}

/* Continue Journey Card Styles */
.resource-continue-card {
  max-width: 300px; 
  margin: 0; 

  :deep(.game-card__header) {
    padding: 0;
    height: 0;
    border: none;
    overflow: hidden;
  }

  :deep(.game-card__body) {
    padding: 0;
    height: 100%;
    .game-card__symbol {
      display: none;
    }
  }

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

  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; 
  }

  .card-content-over-image {
    position: relative; 
    z-index: 2; 
    color: white; 
    text-align: center;
    padding: 1rem; 
    width: 100%;
    box-sizing: border-box; 
  }

  .card-title-over-image {
    font-size: 1.4rem; 
    font-weight: bold;
    margin: 0 0 0.5rem 0; 
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  .card-landscape-description {
    font-size: 1rem; 
    margin: 0; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }
}

/* Modal styling */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
}

.modal-content {
  background-color: #f9f3e9;
  padding: 20px;
  border-radius: 5px;
  max-width: 400px;
  width: 100%;
  text-align: center;
}

.modal-buttons {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  gap: 10px;
  
  button {
    padding: 8px 15px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    
    &.confirm {
      background-color: #a43434;
      color: white;
    }
    
    &.cancel {
      background-color: #4a543f;
      color: white;
    }
  }
}
</style>
