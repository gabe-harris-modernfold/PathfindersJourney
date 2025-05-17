<template>
  <div class="seasonal-assessment-phase">
    <!-- Background Elements Added -->
    <div class="landscape-image-container">
      <img src="@/assets/images/seasonal-assement.jpg" 
           class="landscape-image" 
           alt="Seasonal background" />
    </div>
    <div class="landscape-overlay"></div>
    <!-- End Background Elements -->

    <!-- Existing Content (Needs z-index) -->
    <h2 class="phase-title">SEASONAL ASSESSMENT</h2>
    
    <!-- Modified Season Card -->
    <div v-if="currentSeasonData" class="season-card">
      <!-- Restore original structure and data binding -->
      <h3>{{ currentSeasonData.name }}</h3>
      <div class="season-narrative">
        <p>{{ currentSeasonData.description }}</p>
        <p v-if="currentSeasonData.effect">
          The conditions this season are challenging: {{ currentSeasonData.effect }}.
        </p>
        <p v-if="currentSeasonData.benefit">
          However, this season also brings advantages: {{ currentSeasonData.benefit }}.
        </p>
        <p v-if="currentSeasonData.resourceAbundance && currentSeasonData.resourceAbundance.length > 0">
          During this time, {{ getResourceNamesText(currentSeasonData.resourceAbundance) }} can be found in abundance.
        </p>
        <p v-if="currentSeasonData.resourceScarcity && currentSeasonData.resourceScarcity.length > 0">
          However, {{ getResourceNamesText(currentSeasonData.resourceScarcity) }} are much harder to find.
        </p>
        <p v-if="currentSeasonData.animalAffinity && currentSeasonData.animalAffinity.length > 0">
          The {{ getCompanionNamesText(currentSeasonData.animalAffinity) }} are particularly active during this season.
        </p>
      </div>
    </div>
    <!-- Fallback Content (if no season data) -->
    <div v-else class="season-card season-card-fallback">
      <h3>Current Season</h3>
      <div class="season-narrative">
        <p>Seasonal details are currently unavailable.</p>
      </div>
    </div>

    <!-- Custom button-style card with background image -->
    <div class="continue-button" @click="advancePhase">
      <div class="continue-button-image"></div>
      <div class="continue-button-overlay"></div>
      <div class="continue-button-content">
        <h3>Continue Journey</h3>
        <p>Proceed to the next phase of your adventure</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { useSeasonStore } from '@/stores/seasonStore';
import { useServices } from '@/composables/useServices';
import { computed, onMounted } from 'vue';
import GameCard from '@/components/GameCard.vue';
import { Season } from '@/models/enums/seasons';
import { CardType } from '@/models/enums/cardTypes';
import type { SeasonCard as SeasonCardType } from '@/models/types/cards';

const gameStore = useGameStore();
const cardStore = useCardStore();
const seasonStore = useSeasonStore();
const { phaseService } = useServices();

// Debug logging
onMounted(() => {
  console.log('SeasonalAssessmentPhase mounted');
  console.log('Current season from seasonStore:', seasonStore.currentSeason);
  console.log('Current season card:', seasonStore.currentSeasonCard);
});

// Format season for display
const formatSeason = (season: Season | string): string => {
  if (typeof season === 'string') {
    return season.split(/(?=[A-Z])/).map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  } else {
    return String(season).split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  }
};

// Current season data - using seasonStore
const currentSeasonData = computed<SeasonCardType | null>(() => {
  // Return the card or null if it doesn't exist
  return seasonStore.currentSeasonCard || null; 
});

// Helper function to get image path (assuming images are in public/assets/images/seasons/)
const getImagePath = (imageName: string): string => {
  if (!imageName) return '';
  // Assuming images are stored in public/assets/images/seasons/
  // Adjust the path if your image location is different
  return `/assets/images/seasons/${imageName}`; 
};

// Get resource names text - formats a list of resources into a readable string
const getResourceNamesText = (resourceIds: string[]): string => {
  if (!resourceIds || resourceIds.length === 0) return '';
  
  const resourceNames = resourceIds.map(id => {
    const resource = cardStore.getResourceById(id);
    return resource ? resource.name : id;
  });
  
  if (resourceNames.length === 1) {
    return resourceNames[0];
  } else if (resourceNames.length === 2) {
    return `${resourceNames[0]} and ${resourceNames[1]}`;
  } else {
    const lastResource = resourceNames.pop();
    return `${resourceNames.join(', ')}, and ${lastResource}`;
  }
};

// Get companion names text - formats a list of companions into a readable string
const getCompanionNamesText = (companionIds: string[]): string => {
  if (!companionIds || companionIds.length === 0) return '';
  
  const companionNames = companionIds.map(id => {
    const companion = cardStore.getCompanionById(id);
    return companion ? companion.name : id;
  });
  
  if (companionNames.length === 1) {
    return companionNames[0];
  } else if (companionNames.length === 2) {
    return `${companionNames[0]} and ${companionNames[1]}`;
  } else {
    const lastCompanion = companionNames.pop();
    return `${companionNames.join(', ')}, and ${lastCompanion}`;
  }
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.seasonal-assessment-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative; // Added for absolute positioning context
  width: 100%;
  min-height: 500px; // Consistent height
  padding: 1rem; // Consistent padding
  box-sizing: border-box; // Include padding in width/height
  overflow: hidden; // Prevent potential overflow

  // Added Background Styles
  .landscape-image-container {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0; // Behind content
  }

  .landscape-image {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .landscape-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.75); // Standard light overlay
    z-index: 1; // Above image, below content
  }
  // End Added Background Styles

  // Ensure existing content is above the background/overlay
  .phase-title,
  .season-card,
  .seasonal-continue-card {
    position: relative; // Establish stacking context
    z-index: 2; // Make sure it's above the overlay (z-index 1)
  }

  .phase-title {
    text-align: center;
    margin-bottom: 1.5rem;
    font-family: 'Cinzel', serif;
    color: #4a2e1a; // Dark color for contrast
    font-size: 1.8rem;
    font-weight: bold;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5); // Add shadow for readability
  }

  // Modified Season Card
  .season-card {
    background-color: rgba(245, 245, 220, 0.75); // Increased transparency (75% opacity)
    border: 2px solid #8b4513; // Brown border
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    padding: 1.5rem; // Restore padding
    margin-bottom: 1.5rem;
    width: 90%;
    max-width: 800px;
    position: relative; // Keep relative positioning for z-index
    border-radius: 0.5rem;
    min-height: auto; // Allow height to be determined by content

    h3 {
      color: #8b4513; // Dark text color
      text-align: center;
      font-size: 1.8rem;
      margin-bottom: 1rem;
      border-bottom: 1px solid #8b4513;
      padding-bottom: 0.5rem;
      text-shadow: none; // Remove text shadow from overlay style
    }

    .season-narrative {
      text-align: center;
      p {
        color: #5a3e2b; // Dark text color
        font-size: 1.1rem;
        line-height: 1.5;
        margin: 0.5rem 0;
        text-shadow: none; // Remove text shadow from overlay style
      }
    }
  }

  /* Styles for fallback season card (adjust if needed) */
  .season-card-fallback { // Use a separate class for fallback styling
    // Keep fallback styles similar to the main restored card
    background-color: rgba(240, 232, 214, 0.75); // Increased transparency (75% opacity)
    border: 2px dashed #a0522d;
    // ... other fallback-specific styles if desired
    h3 {
      color: #a0522d;
    }
    .season-narrative p {
      color: #6b4f3e;
    }
  }
  
  // Ensure existing content is above the background/overlay
  .phase-title,
  .season-card,
  .seasonal-continue-card {
    position: relative; // Establish stacking context
    z-index: 2; // Make sure it's above the overlay (z-index 1)
  }

  /* Custom button-style card for Continue Journey */
  .continue-button {
    max-width: 250px;
    min-height: 350px;
    margin: 1.5rem auto;
    border: 2px solid #8c7851;
    border-radius: 12px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.2);
    cursor: pointer;
    position: relative;
    z-index: 2;
    overflow: hidden; // Keep the image within the rounded corners
    
    /* Simple highlight on hover without movement */
    &:hover {
      border-color: #a08c61;
      box-shadow: 0 6px 12px rgba(0,0,0,0.3);
      
      .continue-button-overlay {
        background-color: rgba(240, 230, 210, 0.6); // Slightly more transparent on hover
      }
    }
    
    /* Active state for when clicked */
    &:active {
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    }
  }
  
  .continue-button-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url('@/assets/images/continue-journey.jpg');
    background-size: cover;
    background-position: center;
    z-index: 1;
  }
  
  .continue-button-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); // Semi-transparent overlay
    z-index: 2;
    transition: background-color 0.2s ease; // Smooth transition for hover effect
  }
  
  .continue-button-content {
    position: relative;
    z-index: 3;
    padding: 1rem;
    text-align: center;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100%;
    box-sizing: border-box;
    
    h3 {
      margin: 0 0 0.5rem 0;
      color: #4a2e1a;
      font-size: 1.4rem;
      font-weight: bold;
      text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
    }
    
    p {
      margin: 0;
      color: #5a3e2b;
      font-size: 1rem;
      text-shadow: 1px 1px 1px rgba(0, 0, 0, 0.3);
    }
  }
}
</style>
