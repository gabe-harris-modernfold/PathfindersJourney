<template>
  <div class="animal-companion-selection debug-component" data-component-name="AnimalCompanionSelection">
    <div class="animal-companion-selection__content">
      <div v-if="availableCompanions.length === 0" class="empty-state">
        <p>No animal companions are available in this area.</p>
        <p>Continue your journey to find potential companions.</p>
      </div>
      
      <div v-else-if="availableCompanions.length > 0" class="companion-grid">
        <div 
          v-for="companion in availableCompanions" 
          :key="companion.id"
          class="companion-card-wrapper"
          @click="handleCompanionCardClick(companion)"
        >
          <GameCard
            :title="companion.name"
            :subtitle="getCompanionSeasons(companion)"
            :cardType="CardType.ANIMAL_COMPANION"
          >
            <div class="companion-card-content">
              <p class="companion-description">{{ companion.ability }}</p>
              <div class="companion-resources">
                <p class="resources-label">Drawn to:</p>
                <ul class="resources-list">
                  <li v-for="(resource, index) in getPreferredResourceNames(companion)" :key="index">
                    {{ resource }}
                  </li>
                </ul>
              </div>
              <div 
                :class="hasCompatibleResources(companion.id) ? 'compatible-resources-notice' : 'incompatible-resources-notice'"
              >
                {{ hasCompatibleResources(companion.id) ? 'Click to form a sacred bond' : 'You need to gather compatible resources' }}
              </div>
            </div>
          </GameCard>
        </div>
      </div>
    </div>
    
    <!-- Bond Dialog -->
    <div v-if="showBondDialog" class="bond-dialog-overlay">
      <div class="bond-dialog">
        <div class="bond-dialog__header">
          <h3>Form a Sacred Bond with the {{ selectedCompanion?.name }}</h3>
          <button class="close-btn" @click="closeBondDialog">&times;</button>
        </div>
        
        <div class="bond-dialog__content">
          <p>Select a resource to form your sacred bond:</p>
          
          <div class="resource-list">
            <div 
              v-for="resourceId in compatiblePlayerResources" 
              :key="resourceId"
              class="resource-item"
              @click="completeBondingWithResource(resourceId)"
            >
              <span>{{ getResourceName(resourceId) }}</span>
            </div>
          </div>
        </div>
        
        <div class="bond-dialog__footer">
          <button class="btn btn--secondary" @click="closeBondDialog">
            Cancel
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, defineEmits } from 'vue';
import { useCardStore } from '@/stores/cardStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useGameStore } from '@/stores/gameStore';
import { Season } from '@/models/enums/seasons';
import { CardType } from '@/models/enums/cardTypes';
import GameCard from '@/components/core/GameCard.vue';
import companions, { AnimalCompanion } from '@/models/data/companions';

const emit = defineEmits(['select-companion']);

// Component setup
const cardStore = useCardStore();
const playerStore = usePlayerStore();
const gameStore = useGameStore();

// State management
const showBondDialog = ref(false);
const selectedCompanion = ref<AnimalCompanion | null>(null);
const compatiblePlayerResources = ref<string[]>([]);

// Get available companions for current location
const availableCompanions = computed<AnimalCompanion[]>(() => {
  // Get current location ID
  const locationId = gameStore.currentLandscapeId;
  
  if (!locationId) {
    return [];
  }
  
  // Filter companions that can be found at the current location
  return companions.filter(companion => {
    // Skip companions the player already has
    if (playerStore.animalCompanions.includes(companion.id)) {
      return false;
    }
    
    // Check if this landscape is where this companion can be found
    return companion.findLocation === locationId;
  });
});

// Format season name for display
const formatSeasonName = (season: string): string => {
  if (!season) return '';
  return season.replace('_', ' ').split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
};

// Get formatted seasons for a companion
const getCompanionSeasons = (companion: AnimalCompanion): string => {
  if (!companion.seasonalAffinity || !Array.isArray(companion.seasonalAffinity)) return '';
  return companion.seasonalAffinity.map(formatSeasonName).join(', ');
};

// Get preferred resource names for a companion
const getPreferredResourceNames = (companion: AnimalCompanion): string[] => {
  const preferredResources = companion.preferredResources || [];
  return preferredResources.map(resourceId => {
    const resource = cardStore.getResourceById(resourceId);
    return resource ? resource.name : resourceId;
  });
};

// Check if player has compatible resources for a companion
const hasCompatibleResources = (companionId: string): boolean => {
  const companion = companions.find(c => c.id === companionId);
  if (!companion) return false;
  
  const preferredResources = companion.preferredResources || [];
  if (preferredResources.length === 0) return true;
  
  // Ensure resources are properly typed
  const playerResourceIds = playerStore.resources.map((r: any) => r.id);
  return preferredResources.some(resourceId => playerResourceIds.includes(resourceId));
};

// Get a resource name by ID
const getResourceName = (resourceId: string): string => {
  const resource = cardStore.getResourceById(resourceId);
  return resource ? resource.name : resourceId;
};

// Handle clicking on a companion card
const handleCompanionCardClick = (companion: AnimalCompanion): void => {
  if (!companion) return;
  
  selectedCompanion.value = companion;
  
  // If player has compatible resources, show bond dialog
  if (hasCompatibleResources(companion.id)) {
    // Get all compatible resources player has
    const preferredResources = companion.preferredResources || [];
    const playerResourceIds = playerStore.resources.map((r: any) => r.id);
    
    compatiblePlayerResources.value = playerResourceIds.filter(resourceId => {
      if (preferredResources.length === 0) return true;
      return preferredResources.includes(resourceId);
    });
    
    // Log companion information
    gameStore.addToGameLog(`The ${companion.name} approaches you, sensing your connection to the ancient elements. You can form a sacred bond with this creature.`, true);
    
    // Show the bond dialog
    showBondDialog.value = true;
  } else {
    // Log that player needs resources
    gameStore.addToGameLog(`The ${companion.name} keeps its distance. To form a sacred bond, you'll need to gather resources it's drawn to.`, true);
  }
};

// Close the bond dialog
const closeBondDialog = (): void => {
  showBondDialog.value = false;
  selectedCompanion.value = null;
  compatiblePlayerResources.value = [];
};

// Complete bonding with a specific resource
const completeBondingWithResource = (resourceId: string): void => {
  if (!selectedCompanion.value) return;
  
  // Add companion to player's collection
  playerStore.addCompanion(selectedCompanion.value.id);
  
  // Remove the used resource from player's inventory
  playerStore.removeResource(resourceId);
  
  // Log the bonding with Celtic-themed message
  const resourceName = getResourceName(resourceId);
  gameStore.addToGameLog(
    `You offer the ${resourceName} and form a sacred bond with the ${selectedCompanion.value.name}. ` +
    `The ${resourceName} glows with ancient energy as it is consumed in the ritual. ` +
    `The ${selectedCompanion.value.name} will now accompany you on your journey.`, 
    true
  );
  
  // Close the dialog
  closeBondDialog();
  
  // Emit event to parent component
  emit('select-companion', selectedCompanion.value.id);
};
</script>

<style lang="scss" scoped>
.animal-companion-selection {
  display: flex;
  flex-direction: column;
  width: 100%;
  position: relative;
}

.animal-companion-selection__content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.companion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1rem;
}

.companion-card-wrapper {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border-radius: 0.5rem;
  position: relative;
  overflow: hidden;
}

.companion-card-wrapper:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
}

.companion-card-content {
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.companion-description {
  font-style: italic;
  color: #4a5568;
  margin-bottom: 0.5rem;
}

.companion-resources {
  margin-top: 0.5rem;
}

.resources-label {
  font-weight: bold;
  margin-bottom: 0.25rem;
}

.resources-list {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  font-size: 0.9rem;
}

.resources-list li {
  display: inline-block;
  background-color: #edf2f7;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
}

.compatible-resources-notice {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(72, 187, 120, 0.2);
  color: #2f855a;
  border-radius: 0.25rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.incompatible-resources-notice {
  margin-top: 0.5rem;
  padding: 0.5rem;
  background-color: rgba(237, 137, 54, 0.2);
  color: #c05621;
  border-radius: 0.25rem;
  text-align: center;
  font-weight: bold;
  font-size: 0.9rem;
}

.empty-state {
  text-align: center;
  padding: 2rem;
  background-color: #f7fafc;
  border-radius: 0.5rem;
  color: #4a5568;
}

/* Bond Dialog Styles */
.bond-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.75);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000; /* Ensure dialog appears on top */
}

.bond-dialog {
  background-color: white;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1),
              0 10px 10px -5px rgba(0, 0, 0, 0.04);
  display: flex;
  flex-direction: column;
  position: relative;
}

.bond-dialog__header {
  padding: 1.25rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bond-dialog__header h3 {
  margin: 0;
  font-size: 1.25rem;
  color: #2d3748;
}

.close-btn {
  background: transparent;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #a0aec0;
}

.close-btn:hover {
  color: #2d3748;
}

.bond-dialog__content {
  padding: 1.25rem;
  flex-grow: 1;
}

.resource-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-top: 1rem;
}

.resource-item {
  background-color: #edf2f7;
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  font-weight: 500;
}

.resource-item:hover {
  background-color: #e2e8f0;
}

.bond-dialog__footer {
  padding: 1.25rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 0.375rem;
  font-weight: 500;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

.btn--secondary {
  background-color: #e2e8f0;
  color: #4a5568;
}

.btn--secondary:hover {
  background-color: #cbd5e0;
}
</style>
