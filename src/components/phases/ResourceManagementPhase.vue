<template>
  <div class="resource-management-phase">
    <h2 class="phase-title">RESOURCE MANAGEMENT</h2>
    <div class="phase-description">
      <p>Manage your resources and gather new ones.</p>
    </div>
    
    <div class="resource-management-container">
      <div class="resource-list">
        <h3>Current Resources ({{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }})</h3>
        <p v-if="!playerStore.resources.length">You have no resources.</p>
        <ul v-else class="resources-grid">
          <li v-for="resourceId in playerStore.resources" :key="resourceId" class="resource-item">
            <div class="resource-name">{{ getResourceName(resourceId) }}</div>
            <div class="resource-description">{{ getResourceDescription(resourceId) }}</div>
          </li>
        </ul>
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
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

.resource-list {
  h3 {
    color: #5a3e2b;
    margin-bottom: 1rem;
  }
  
  .resources-grid {
    list-style-type: none;
    padding: 0;
    display: grid;
    grid-template-columns: 1fr;
    gap: 0.75rem;
    
    @media (min-width: 480px) {
      grid-template-columns: repeat(2, 1fr);
    }
  }
  
  .resource-item {
    padding: 0.75rem;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 4px;
    border-left: 3px solid #8b4513;
    
    .resource-name {
      font-weight: bold;
      margin-bottom: 0.25rem;
    }
    
    .resource-description {
      font-size: 0.85rem;
      color: #5a3e2b;
    }
  }
}

.resource-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  max-width: 600px;
  margin-bottom: 2rem;
}
</style>
