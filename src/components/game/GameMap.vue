<template>
  <div class="game-map" style="border: 2px solid rgba(173, 216, 230, 0.3); position: relative;">
    <div style="position: absolute; top: -20px; left: 0; background-color: rgba(173, 216, 230, 0.5); padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070; pointer-events: none;">GameMap</div>
    <h3 class="game-map__title">Journey Map</h3>
    <div class="game-map__content">
      <div class="map-container">
        <div class="map-grid">
          <div 
            v-for="(location, index) in journeyLocations" 
            :key="index"
            class="map-location"
            :class="{ 
              'map-location--active': index === currentLocationIndex,
              'map-location--visited': index < currentLocationIndex
            }"
          >
            <div class="location-marker">{{ index + 1 }}</div>
            <div class="location-name">{{ location.name }}</div>
          </div>
        </div>
        <div class="map-path"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';

export default defineComponent({
  name: 'GameMap',
  
  setup() {
    const gameStore = useGameStore();
    
    const journeyLocations = ref([
      { name: 'Forest Edge', type: 'forest' },
      { name: 'River Crossing', type: 'river' },
      { name: 'Mountain Pass', type: 'mountain' },
      { name: 'Ancient Ruins', type: 'ruins' },
      { name: 'Valley Settlement', type: 'settlement' }
    ]);
    
    const currentLocationIndex = computed(() => {
      return gameStore.journeyProgress || 0;
    });
    
    return {
      journeyLocations,
      currentLocationIndex
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.game-map {
  width: 100%;
  margin-bottom: $spacing-lg;
  
  &__title {
    margin-bottom: $spacing-md;
    text-align: center;
  }
  
  &__content {
    background-color: rgba($light-color, 0.9);
    border-radius: $border-radius-md;
    padding: $spacing-md;
    box-shadow: 0 2px 4px rgba($dark-color, 0.2);
  }
}

.map-container {
  position: relative;
  min-height: 200px;
}

.map-grid {
  display: flex;
  justify-content: space-between;
  position: relative;
  z-index: 2;
}

.map-path {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 4px;
  background-color: $border-color;
  z-index: 1;
  transform: translateY(-50%);
}

.map-location {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  .location-marker {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    background-color: $light-color;
    border: 2px solid $border-color;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: $spacing-xs;
    font-weight: bold;
    z-index: 2;
  }
  
  .location-name {
    font-size: $font-size-sm;
    text-align: center;
    max-width: 100px;
  }
  
  &--active {
    .location-marker {
      background-color: $primary-color;
      color: $light-color;
      border-color: darken($primary-color, 10%);
    }
    
    .location-name {
      font-weight: bold;
    }
  }
  
  &--visited {
    .location-marker {
      background-color: $success-color;
      color: $light-color;
      border-color: darken($success-color, 10%);
    }
  }
}
</style>
