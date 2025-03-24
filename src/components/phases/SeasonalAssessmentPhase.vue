<template>
  <div class="seasonal-assessment-phase">
    <h2 class="phase-title">SEASONAL ASSESSMENT</h2>
    
    <div class="season-card" v-if="currentSeasonData">
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
    
    <!-- Fallback message if current season data is not available -->
    <div class="season-card" v-else>
      <h3>{{ formatSeason(seasonStore.currentSeason) }}</h3>
      <div class="season-narrative">
        <p>The seasons continue to change, affecting the world around you.</p>
        <p>Each season brings different challenges and opportunities for your journey.</p>
      </div>
    </div>
    
    <GameCard 
      title="Continue Journey" 
      cardType="ACTION"
      @click="advancePhase"
    >
      <div style="font-size: 1.1rem; padding: 10px;">
        Proceed to the next phase of your adventure
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

// Current season data - using seasonStore instead of gameStore
const currentSeasonData = computed(() => {
  return seasonStore.currentSeasonCard;
});

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
  width: 100%;
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
}

.season-card {
  background-color: #f5f5dc; /* Beige background for an antiqued parchment look */
  padding: 1.5rem;
  border: 2px solid #8b4513; /* Brown border for an old-world feel */
  border-radius: 0.5rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  margin-bottom: 1.5rem;
  width: 90%;
  max-width: 800px;
}

.season-card h3 {
  color: #8b4513;
  text-align: center;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  border-bottom: 1px solid #8b4513;
  padding-bottom: 0.5rem;
}

.season-narrative {
  text-align: left;
  margin-top: 1rem;
  line-height: 1.6;
  font-size: 0.95rem;
}

.season-narrative p {
  margin-bottom: 1rem;
}
</style>
