<template>
  <div class="player-status">
    <div class="player-status__header">
      <h3 class="player-status__title">{{ character ? character.name : 'Pathfinder' }}</h3>
      <div class="player-status__phase">Current Phase: {{ formatPhase(currentPhase) }}</div>
    </div>
    
    <div class="player-status__stats">
      <div class="stat-item">
        <div class="stat-label">Health</div>
        <div class="stat-value">
          <div class="health-bar">
            <div 
              class="health-bar__fill" 
              :style="{ width: `${(currentHealth / maxHealth) * 100}%` }"
              :class="healthBarClass"
            ></div>
          </div>
          <div class="health-text">{{ currentHealth }} / {{ maxHealth }}</div>
        </div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">Resources</div>
        <div class="stat-value">{{ resources.length }} / {{ resourceCapacity }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">Companions</div>
        <div class="stat-value">{{ companions.length }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">Crafted Items</div>
        <div class="stat-value">{{ craftedItems.length }}</div>
      </div>
      
      <div class="stat-item">
        <div class="stat-label">Current Season</div>
        <div class="stat-value season" :class="currentSeason.toLowerCase()">
          {{ formatSeasonName(currentSeason) }}
        </div>
      </div>
    </div>
    
    <div class="player-status__special-ability" v-if="character && character.specialAbility">
      <h4>Special Ability: {{ character.specialAbility.name }}</h4>
      <div class="ability-description">{{ character.specialAbility.description }}</div>
    </div>
    
    <div class="player-status__companions" v-if="companions.length > 0">
      <h4>Animal Companions</h4>
      <div class="companion-list">
        <div 
          v-for="companion in companions" 
          :key="companion.id"
          class="companion-list__item"
          :class="{ 'active': isSeasonActive(companion.affinitySeasons) }"
        >
          {{ companion.name }}
          <span 
            v-if="isSeasonActive(companion.affinitySeasons)" 
            class="companion-active-indicator"
            :title="`Active in ${formatSeasonName(currentSeason)}`"
          >
            ✓
          </span>
        </div>
      </div>
    </div>
    
    <div class="player-status__items" v-if="craftedItems.length > 0">
      <h4>Crafted Items</h4>
      <div class="item-list">
        <div 
          v-for="item in craftedItems" 
          :key="item.id"
          class="item-list__item"
        >
          {{ item.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed } from 'vue';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import { usePlayerStore, useGameStore, useCardStore } from '@/stores';
import { CharacterCard, AnimalCompanionCard, CraftedItemCard } from '@/models/types/cards';

export default defineComponent({
  name: 'PlayerStatus',
  setup() {
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    const cardStore = useCardStore();
    
    const character = computed<CharacterCard | null>(() => {
      return playerStore.character;
    });
    
    const currentPhase = computed(() => {
      return gameStore.currentPhase;
    });
    
    const currentSeason = computed(() => {
      return gameStore.currentSeason;
    });
    
    const currentHealth = computed(() => {
      return playerStore.health;
    });
    
    const maxHealth = computed(() => {
      return playerStore.maxHealth;
    });
    
    const healthBarClass = computed(() => {
      const healthPercentage = (currentHealth.value / maxHealth.value) * 100;
      
      if (healthPercentage <= 25) {
        return 'critical';
      } else if (healthPercentage <= 50) {
        return 'warning';
      } else {
        return 'good';
      }
    });
    
    const resources = computed(() => {
      return playerStore.resources;
    });
    
    const resourceCapacity = computed(() => {
      return playerStore.resourceCapacity;
    });
    
    const companions = computed<AnimalCompanionCard[]>(() => {
      return playerStore.animalCompanions
        .map(id => cardStore.getAnimalCompanionById(id))
        .filter(Boolean) as AnimalCompanionCard[];
    });
    
    const craftedItems = computed<CraftedItemCard[]>(() => {
      return playerStore.craftedItems
        .map(id => cardStore.getCraftedItemById(id))
        .filter(Boolean) as CraftedItemCard[];
    });
    
    const formatPhase = (phase: GamePhase) => {
      // Convert enum value to display name with spaces
      return phase.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    };
    
    const formatSeasonName = (season: string) => {
      // Convert enum value to display name
      switch (season) {
        case Season.SAMHAIN:
          return 'Samhain';
        case Season.WINTERS_DEPTH:
          return 'Winter\'s Depth';
        case Season.IMBOLC:
          return 'Imbolc';
        case Season.BELTANE:
          return 'Beltane';
        case Season.LUGHNASADH:
          return 'Lughnasadh';
        default:
          return season;
      }
    };
    
    const isSeasonActive = (affinitySeasons: Season[]) => {
      return affinitySeasons.includes(currentSeason.value as Season);
    };
    
    return {
      character,
      currentPhase,
      currentSeason,
      currentHealth,
      maxHealth,
      healthBarClass,
      resources,
      resourceCapacity,
      companions,
      craftedItems,
      formatPhase,
      formatSeasonName,
      isSeasonActive
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.player-status {
  background-color: white;
  border-radius: $border-radius-md;
  box-shadow: $shadow-md;
  padding: $spacing-md;
  margin-bottom: $spacing-md;
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: $spacing-md;
    padding-bottom: $spacing-sm;
    border-bottom: 1px solid rgba(0, 0, 0, 0.1);
  }
  
  &__title {
    font-family: $font-family-display;
    color: $primary-color;
    margin: 0;
  }
  
  &__phase {
    font-size: $font-size-sm;
    color: $accent-color;
    font-weight: bold;
  }
  
  &__stats {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: $spacing-md;
    margin-bottom: $spacing-md;
  }
  
  &__special-ability,
  &__companions,
  &__items {
    margin-top: $spacing-md;
    padding-top: $spacing-md;
    border-top: 1px solid rgba(0, 0, 0, 0.1);
    
    h4 {
      color: $secondary-color;
      margin-bottom: $spacing-sm;
    }
  }
}

.stat-item {
  .stat-label {
    font-size: $font-size-sm;
    color: $dark-color;
    opacity: 0.7;
    margin-bottom: $spacing-xs;
  }
  
  .stat-value {
    font-weight: bold;
    font-size: $font-size-lg;
    
    &.season {
      font-size: $font-size-base;
      display: inline-block;
      padding: 2px 8px;
      border-radius: 12px;
      color: white;
      
      &.samhain {
        background-color: $samhain-color;
      }
      
      &.wintersdepth {
        background-color: $winter-color;
      }
      
      &.imbolc {
        background-color: $imbolc-color;
      }
      
      &.beltane {
        background-color: $beltane-color;
      }
      
      &.lughnasadh {
        background-color: $lughnasadh-color;
      }
    }
  }
}

.health-bar {
  height: 10px;
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: $spacing-xs;
  
  &__fill {
    height: 100%;
    transition: width 0.3s ease;
    
    &.good {
      background-color: $success-color;
    }
    
    &.warning {
      background-color: $warning-color;
    }
    
    &.critical {
      background-color: $danger-color;
    }
  }
}

.health-text {
  font-size: $font-size-sm;
  text-align: right;
}

.companion-list,
.item-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-xs;
  
  &__item {
    background-color: rgba(0, 0, 0, 0.05);
    padding: 4px 8px;
    border-radius: $border-radius-sm;
    font-size: $font-size-sm;
    
    &.active {
      background-color: rgba($accent-color, 0.2);
      border: 1px solid $accent-color;
    }
  }
}

.companion-active-indicator {
  color: $success-color;
  margin-left: $spacing-xs;
}

.ability-description {
  font-size: $font-size-sm;
  font-style: italic;
  color: $dark-color;
}
</style>
