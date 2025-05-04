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

    <!-- Modified GameCard -->
    <GameCard 
      title="Continue Journey" 
      :cardType="CardType.ACTION"
      @click="advancePhase"
      class="seasonal-continue-card" 
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
            Proceed to the next phase of your adventure
          </p>
        </div>
      </div>
    </GameCard>
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
    background-color: #f5f5dc; // Beige background
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
    background-color: #f0e8d6; 
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

  /* Styles for the Continue Journey card (KEEP image overlay here) */
  .seasonal-continue-card {
    max-width: 300px; // Consistent max-width
    margin: 2rem auto; // Consistent margin

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
  }

  // Wrapper positioned absolutely relative to the .game-card
  .card-image-overlay-wrapper { // Keep these styles for the continue card
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
  .card-content-over-image { // Keep these styles for the continue card
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
