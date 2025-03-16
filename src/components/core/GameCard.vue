<template>
  <div 
    class="game-card" 
    :class="cardTypeClass"
    @click="$emit('click', $event)"
    style="position: relative; border-radius: 12px; aspect-ratio: 2.5/3.5; max-width: 220px; width: 100%; display: flex; flex-direction: column; box-shadow: 3px 3px 8px rgba(0,0,0,0.2); overflow: hidden; background: linear-gradient(to bottom, #f0e6d2 0%, #e6d7b9 100%); border: 2px solid #8c7851;"
  >
    <div style="position: absolute; top: -20px; left: 0; background-color: #f0e6d2; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">GameCard</div>
    
    <div class="game-card__header" style="border-top-left-radius: 12px; border-top-right-radius: 12px; padding: 10px; text-align: center; background-color: rgba(140, 120, 81, 0.25);">
      <h3 style="margin: 0; font-size: 1.1rem; text-transform: capitalize; color: #5a3e2b; font-weight: bold; letter-spacing: 0.5px;">{{ title }}</h3>
      <div v-if="subtitle" class="game-card__subtitle" style="font-size: 0.8rem; opacity: 0.8; color: #5a3e2b;">{{ subtitle }}</div>
    </div>
    
    <!-- Center suit symbol -->
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4rem; opacity: 0.07; pointer-events: none; color: #5a3e2b;">{{ getSuitSymbol() }}</div>
    
    <div class="game-card__body" style="flex-grow: 1; display: flex; align-items: center; justify-content: center; text-align: center; padding: 15px; z-index: 1; color: #5a3e2b;">
      <slot></slot>
    </div>
    
    <div v-if="$slots.footer" class="game-card__footer" style="border-bottom-left-radius: 12px; border-bottom-right-radius: 12px; padding: 10px; text-align: center; background-color: rgba(140, 120, 81, 0.15);">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';

export default defineComponent({
  name: 'GameCard',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    cardType: {
      type: [String, Object] as PropType<CardType>,
      required: true,
      validator: (value: string | CardType) => {
        // Allow both string values and enum values to be passed
        return Object.values(CardType).includes(value as CardType);
      }
    },
    season: {
      type: String as PropType<Season | null>,
      default: null,
      validator: (value: string) => {
        return value === null || Object.values(Season).includes(value as Season);
      }
    }
  },
  computed: {
    cardTypeClass() {
      if (!this.cardType) return {};
      
      const cardTypeValue = this.cardType.toLowerCase();
      const classes = {
        [`game-card--${cardTypeValue.replace(/_/g, '-')}`]: true
      };
      
      if (this.cardType === CardType.SEASON && this.season) {
        classes[this.season.toLowerCase()] = true;
      }
      
      return classes;
    },
    
    cardTypeIdentifierClass() {
      if (!this.cardType) return '';
      
      switch(this.cardType) {
        case CardType.LANDSCAPE:
          return 'stone-arch-border';
        case CardType.ANIMAL_COMPANION:
          return 'paw-print-corner';
        case CardType.RESOURCE:
          return 'woven-basket';
        case CardType.CRAFTED_ITEM:
          return 'anvil-symbol';
        case CardType.SEASON:
          return 'wheel-symbol';
        case CardType.CHARACTER:
          return 'silhouette-symbol';
        case CardType.ACTION:
          return 'arrow-symbol';
        default:
          return '';
      }
    }
  },
  methods: {
    getSuitSymbol() {
      // Return different suit symbols based on card type
      switch(this.cardType) {
        case CardType.LANDSCAPE:
          return '♣'; // clubs
        case CardType.ANIMAL_COMPANION:
          return '♥'; // hearts
        case CardType.RESOURCE:
          return '♦'; // diamonds
        case CardType.CRAFTED_ITEM:
          return '♠'; // spades
        case CardType.SEASON:
          return '★'; // star
        case CardType.CHARACTER:
          return '✦'; // diamond star
        case CardType.ACTION:
          return '➜'; // arrow
        default:
          return '•'; // bullet
      }
    }
  },
  emits: ['click']
});
</script>

<style lang="scss" scoped>
// Card styles
.game-card {
  font-family: 'Cinzel', serif;
  
  // Season-specific styling
  &.game-card--season {
    &.samhain {
      background: linear-gradient(to bottom, #f0e6d2 0%, #d2a679 100%);
    }
    
    &.winters_depth {
      background: linear-gradient(to bottom, #f0e6d2 0%, #b3c7d6 100%);
    }
    
    &.imbolc {
      background: linear-gradient(to bottom, #f0e6d2 0%, #c6d8c6 100%);
    }
    
    &.beltane {
      background: linear-gradient(to bottom, #f0e6d2 0%, #f7c9a9 100%);
    }
    
    &.lughnasadh {
      background: linear-gradient(to bottom, #f0e6d2 0%, #f0d9a0 100%);
    }
  }
  
  // Card type styling
  &.game-card--landscape {
    border-top: 4px solid #6c4f30;
  }
  
  &.game-card--animal-companion {
    border-top: 4px solid #8a4444;
  }
  
  &.game-card--resource {
    border-top: 4px solid #4c6c42;
  }
  
  &.game-card--crafted-item {
    border-top: 4px solid #444b69;
  }
  
  &.game-card--character {
    border: 2px solid #82632b;
    border-top-width: 4px;
  }
  
  &.game-card--action {
    border: 2px solid #5a3e2b;
    border-top-width: 4px;
    background: linear-gradient(to bottom, #f0c8a0 0%, #8c7851 100%);
  }
  
  .game-card__body p {
    font-size: 11px;
  }
  
  &__header {
    padding: 10px;
    font-family: 'Cinzel', serif;
    position: relative;
    z-index: 1;
  }
  
  &__title {
    margin: 0;
    font-size: 16px;
    font-weight: bold;
  }
  
  &__subtitle {
    margin: 5px 0 0;
    font-size: 12px;
    opacity: 0.8;
  }

  &__body {
    padding: 15px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    p {
      font-size: 11px;
      line-height: 1.4;
      margin-bottom: 10px;
    }
  }
}
</style>
