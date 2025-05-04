<template>
  <div class="journey-progression-phase">
    <h2 class="phase-title">JOURNEY PROGRESSION</h2>
    <div class="phase-description">
      <p>Prepare for the next step in your adventure.</p>
      
      <div v-if="nextLandscape" class="next-landscape">
        <GameCard 
          :title="nextLandscape.name"
          :cardType="CardType.LANDSCAPE"
          @click="startNewTurn"
          class="landscape-card-full-bg" 
        >
          <!-- Use header slot with empty content to override default header -->
          <template #header>
            <!-- Intentionally empty to prevent default header rendering -->
          </template>
          
          <!-- Wrapper for image and text overlay -->
          <div class="card-image-overlay-wrapper">
            <img 
              v-if="getLandscapeImagePath()" 
              :src="getLandscapeImagePath()" 
              alt="Landscape image" 
              class="card-landscape-image"
            />
            <div class="card-text-overlay"></div> 
            
            <!-- Manually render title, subtitle, description inside -->
            <div class="card-content-over-image">
              <h3 class="card-title-over-image">{{ nextLandscape.name }}</h3>
              <h4 class="card-subtitle-over-image">Next Landscape</h4>
              <p class="card-landscape-description">{{ nextLandscape.description }}</p>
            </div>
          </div>
        </GameCard>
      </div>
      
      <div v-else class="current-exploration">
        <GameCard 
          title="Explore Current Area" 
          :cardType="CardType.ACTION"
          @click="advanceToExploration"
          class="explore-continue-card"
        >
          <!-- Use header slot with empty content to override default header -->
          <template #header>
            <!-- Intentionally empty -->
          </template>
          
          <!-- Wrapper for image and text overlay -->
          <div class="card-image-overlay-wrapper">
            <img 
              :src="require('@/assets/images/resolve-challenge.jpg')" 
              alt="Explore Current Area" 
              class="card-landscape-image"
            />
            <div class="card-text-overlay"></div> 
            
            <!-- Manually render content inside -->
            <div class="card-content-over-image">
              <h3 class="card-title-over-image">Explore Current Area</h3>
              <p class="card-landscape-description">
                Continue exploring your current location
              </p>
            </div>
          </div>
        </GameCard>
      </div>

      <!-- Removed redundant fallback button -->
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';  
import { CardType } from '@/models/enums/cardTypes';

const gameStore = useGameStore();
const cardStore = useCardStore();
const { phaseService, journeyService } = useServices();

// Get the next landscape
const nextLandscape = computed(() => {
  const nextId = journeyService.instance.getNextLandscapeId();
  if (!nextId) return null;
  
  return cardStore.getLandscapeById(nextId);
});

// Get landscape image path
const getLandscapeImagePath = () => {
  if (!nextLandscape.value || !nextLandscape.value.image) return '';
  // Dynamically require the image based on the path stored in the landscape data
  return require(`@/assets/images/${nextLandscape.value.image}`);
};

// Start new turn by moving to the next landscape
const startNewTurn = () => {
  // Start the new turn
  journeyService.instance.startNewTurn();
  
  // Force the game store to update in the UI by logging a state change
  const currentTurn = gameStore.currentTurn;
  console.log(`Current turn: ${currentTurn}`);
  
  // After starting a new turn, advance to exploration phase
  phaseService.advanceToExploration();
};

// Advance to the next phase
const advancePhase = () => {
  phaseService.advancePhase();
};

// Advance to exploration phase
const advanceToExploration = () => {
  phaseService.advanceToExploration();
};

// Force advance to exploration phase
const forceAdvanceToExploration = () => {
  phaseService.forceAdvanceToExploration();
};
</script>

<style lang="scss" scoped>
// Global style to target the specific header element
:global(.next-landscape .game-card .game-card__header) {
  display: none !important;
}

.journey-progression-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  .phase-title {
    text-align: center;
    margin-bottom: 2rem;
    font-family: 'Cinzel', serif;
    color: #4a7c59;
  }
  
  .phase-description {
    text-align: center;
    margin-bottom: 2rem;
    max-width: 720px;
  }
  
  .next-landscape, 
  .current-exploration {
    display: flex;
    justify-content: center;
    margin: 2rem auto;
    max-width: 300px; 
  }

  // Target the specific GameCard instance within .next-landscape
  .next-landscape {
    .game-card {
      // Ensure the GameCard establishes a positioning context (it already does with position: relative)
      
      // Instead of display: none, explicitly collapse the header div
      :deep(.game-card__header) {
        padding: 0;
        height: 0;
        border: none; // Remove any border that might take space
        overflow: hidden; // Ensure content doesn't spill if somehow present
      }
      
      // Remove padding from the body so our absolute wrapper can align perfectly edge-to-edge
      :deep(.game-card__body) {
        padding: 0;
        // Make body take full height relative to card content flow area (might not be strictly necessary with absolute wrapper)
        height: 100%; 
        // Hide the default symbol if present, as it would be under our wrapper
        .game-card__symbol {
          display: none;
        }
      }
    }
  }

  // Wrapper now positioned absolutely relative to the .game-card, covering the whole card
  .card-image-overlay-wrapper {
    position: absolute; 
    top: 0;
    left: 0;
    width: 100%;
    height: 100%; 
    z-index: 1; // Sit above default card background/body (z-index 0/1) but below our content
    border-radius: inherit; // Inherit rounding from parent GameCard
    overflow: hidden; 
    display: flex; 
    align-items: center; 
    justify-content: center; 
    min-height: 0; // Reset min-height from previous attempts
  }

  // Style for the image (acts as background within the wrapper)
  .card-landscape-image {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
    z-index: 0; // Bottom layer within the wrapper
  }

  // Overlay for text readability
  .card-text-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(240, 230, 210, 0.7); 
    z-index: 1; // Above image within the wrapper
  }

  // Container for text content over the image
  .card-content-over-image {
      position: relative; // Position relative to the wrapper flow
      z-index: 2; // Above overlay within the wrapper
      color: white; 
      text-align: center;
      padding: 1rem; 
      width: 100%;
      box-sizing: border-box; 
  }

  // Style for the title over the image (remains the same)
  .card-title-over-image {
    font-size: 1.4rem; 
    font-weight: bold;
    margin: 0 0 0.25rem 0;
    text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.8);
  }

  // Style for the subtitle over the image (remains the same)
  .card-subtitle-over-image {
    font-size: 0.9rem; 
    font-weight: normal;
    margin: 0 0 0.75rem 0;
    opacity: 0.9;
    text-transform: uppercase;
    letter-spacing: 1px;
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  }

  // Style for the description text (on top) (remains the same)
  .card-landscape-description {
    font-size: 1rem; 
    margin: 0; 
    text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7); 
  }
}

/* Styles for the Explore Current Area card image overlay effect */
.explore-continue-card {
  max-width: 300px; // Consistent max-width
  margin: 0 auto; // Center the card

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
    background-color: rgba(240, 230, 210, 0.7); /* Standard light overlay */
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
