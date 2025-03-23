<template>
  <div class="resource-management-phase">
    <h2 class="phase-title">RESOURCE MANAGEMENT</h2>
    <div class="phase-description">
      <p>Manage your resources and gather new ones.</p>
    </div>
    
    <div class="resource-management-container">
      <div class="resource-panel">
        <h3>Your Resources ({{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }})</h3>
        <p v-if="!playerStore.resources.length">You have no resources.</p>
        <div v-else class="resource-grid">
          <GameCard 
            v-for="resourceId in playerStore.resources" 
            :key="resourceId"
            :title="getResourceName(resourceId)"
            cardType="RESOURCE"
            class="resource-card"
            @click="confirmResourceDiscard(resourceId)"
          >
            <p>{{ getResourceDescription(resourceId) }}</p>
            <div class="resource-action">
              <small>Click to discard</small>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
    
    <div class="resource-actions">
      <GameCard 
        title="Gather Resources" 
        cardType="ACTION"
        :disabled="cannotGatherResources"
        @click="gatherResources"
      >
        <div style="font-size: 1.1rem; padding: 10px;">
          Gather resources from the current landscape
          <div v-if="cannotGatherResources" class="disabled-reason">
            {{ gatherResourcesDisabledReason }}
          </div>
        </div>
      </GameCard>
      
      <GameCard 
        title="Continue Journey" 
        cardType="ACTION"
        @click="advancePhase"
      >
        <div style="font-size: 1.1rem; padding: 10px;">
          Proceed to the next phase
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
  return false;
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
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
}

.phase-description {
  text-align: center;
  margin-bottom: 1.5rem;
}

.resource-management-container {
  width: 100%;
  max-width: 600px;
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

.resource-card {
  height: 100%;
  flex: 0 0 auto;
  width: 250px;
  transition: transform 0.2s;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
  }
  
  :deep(.game-card__body) {
    display: flex;
    flex-direction: column;
    padding-top: 30px;
    padding-bottom: 30px;
    position: relative;
    
    p {
      margin-bottom: 5px;
    }
  }
}

.resource-action {
  position: absolute;
  bottom: 8px;
  left: 0;
  right: 0;
  text-align: center;
  font-size: 0.8rem;
  color: #666;
}

.resource-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
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
