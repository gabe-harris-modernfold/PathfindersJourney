<template>
  <div class="animal-companion-selection">
    <h3 class="animal-companion-selection__title">Animal Companions</h3>
    
    <div v-if="currentPhase !== GamePhase.ANIMAL_COMPANION" class="animal-companion-selection__inactive">
      <p>Animal companion bonding is not available during the current phase.</p>
    </div>
    
    <div v-else class="animal-companion-selection__active">
      <p class="animal-companion-selection__description">
        Choose an animal companion to bond with. Companions have special affinities with certain seasons.
      </p>
      
      <div class="animal-companion-selection__available">
        <h4>Available Companions</h4>
        <div v-if="availableCompanions.length === 0" class="empty-state">
          No new animal companions are available in this area.
        </div>
        <div v-else class="companion-grid">
          <div 
            v-for="companion in availableCompanions" 
            :key="companion.id"
            class="companion-grid__item"
            :class="{ 'selected': selectedCompanion?.id === companion.id }"
            @click="selectCompanion(companion)"
          >
            <GameCard 
              :title="companion.name" 
              :subtitle="'Animal Companion'" 
              :cardType="CardType.ANIMAL_COMPANION"
            >
              <p>{{ companion.description }}</p>
              
              <div class="companion-ability mt-3">
                <h5>{{ companion.ability.name }}</h5>
                <p class="ability-description">{{ companion.ability.description }}</p>
              </div>
              
              <div class="companion-seasons mt-3">
                <h5>Seasonal Affinity</h5>
                <div class="season-tags">
                  <span 
                    v-for="season in companion.affinitySeasons" 
                    :key="season"
                    class="season-tag"
                    :class="season.toLowerCase()"
                  >
                    {{ formatSeasonName(season) }}
                  </span>
                </div>
              </div>
            </GameCard>
          </div>
        </div>
      </div>
      
      <div v-if="selectedCompanion" class="animal-companion-selection__actions mt-4">
        <button 
          class="btn btn--primary" 
          @click="bondWithCompanion"
        >
          Bond with {{ selectedCompanion.name }}
        </button>
        <button class="btn btn--secondary ml-2" @click="skipCompanion">
          Skip
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { GamePhase } from '@/models/enums/phases';
import { CardType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import { useCardStore, usePlayerStore, useGameStore } from '@/stores';
import { AnimalCompanionCard } from '@/models/types/cards';
import GameCard from '@/components/core/GameCard.vue';

export default defineComponent({
  name: 'AnimalCompanionSelection',
  components: {
    GameCard
  },
  setup() {
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const selectedCompanion = ref<AnimalCompanionCard | null>(null);
    
    const currentPhase = computed(() => {
      return gameStore.currentPhase;
    });
    
    const currentSeason = computed(() => {
      return gameStore.currentSeason;
    });
    
    const playerCompanions = computed(() => {
      return playerStore.animalCompanions;
    });
    
    const availableCompanions = computed(() => {
      // Get all companions that the player doesn't already have
      // and that have an affinity with the current season
      return cardStore.animalCompanions.filter(companion => 
        !playerCompanions.value.includes(companion.id) &&
        companion.affinitySeasons.includes(currentSeason.value as Season)
      );
    });
    
    const formatSeasonName = (season: Season) => {
      // Convert enum value to a more readable format
      return season.replace('_', ' ').split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
    };
    
    const selectCompanion = (companion: AnimalCompanionCard) => {
      selectedCompanion.value = companion;
    };
    
    const bondWithCompanion = () => {
      if (!selectedCompanion.value) return;
      
      // Add the companion to the player's collection
      playerStore.addAnimalCompanion(selectedCompanion.value.id);
      
      // Log the bonding
      gameStore.addToGameLog(`You have bonded with the ${selectedCompanion.value.name}.`);
      
      // Reset selection
      selectedCompanion.value = null;
      
      // Move to the next phase
      gameStore.advancePhase();
    };
    
    const skipCompanion = () => {
      // Reset selection
      selectedCompanion.value = null;
      
      // Log the skipping
      gameStore.addToGameLog('You decided not to bond with any animal companions this time.');
      
      // Move to the next phase
      gameStore.advancePhase();
    };
    
    return {
      currentPhase,
      availableCompanions,
      selectedCompanion,
      selectCompanion,
      bondWithCompanion,
      skipCompanion,
      formatSeasonName,
      GamePhase,
      CardType
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.animal-companion-selection {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  padding: $spacing-md;
  
  &__title {
    margin-top: 0;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  &__inactive {
    text-align: center;
    padding: $spacing-lg;
    color: rgba($dark-color, 0.6);
    font-style: italic;
  }
  
  &__description {
    margin-bottom: $spacing-md;
  }
  
  &__actions {
    display: flex;
    justify-content: center;
  }
}

.companion-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  grid-gap: $spacing-md;
  
  &__item {
    cursor: pointer;
    transition: transform $transition-fast;
    
    &:hover {
      transform: translateY(-5px);
    }
    
    &.selected {
      transform: translateY(-5px);
      
      ::v-deep .game-card {
        border-color: $accent-color;
        box-shadow: $shadow-lg;
      }
    }
  }
}

.season-tags {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  margin-top: $spacing-xs;
}

.season-tag {
  font-size: $font-size-sm;
  padding: $spacing-xs $spacing-sm;
  border-radius: $border-radius-sm;
  
  &.samhain {
    background-color: rgba($samhain-color, 0.2);
    color: $samhain-color;
  }
  
  &.winters_depth {
    background-color: rgba($winter-color, 0.2);
    color: $winter-color;
  }
  
  &.imbolc {
    background-color: rgba($imbolc-color, 0.2);
    color: $imbolc-color;
  }
  
  &.beltane {
    background-color: rgba($beltane-color, 0.2);
    color: $beltane-color;
  }
  
  &.lughnasadh {
    background-color: rgba($lughnasadh-color, 0.2);
    color: $lughnasadh-color;
  }
}

.empty-state {
  text-align: center;
  padding: $spacing-lg;
  color: rgba($dark-color, 0.6);
  font-style: italic;
}
</style>
