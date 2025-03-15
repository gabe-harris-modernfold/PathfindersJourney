<template>
  <div 
    class="game-card" 
    :class="cardTypeClass"
    @click="$emit('click', $event)"
    style="position: relative; border-radius: 12px; aspect-ratio: 2.5/3.5; display: flex; flex-direction: column; box-shadow: 3px 3px 8px rgba(0,0,0,0.2); overflow: hidden; background: linear-gradient(to bottom, #f0e6d2 0%, #e6d7b9 100%); border: 2px solid #8c7851;"
  >
    <div style="position: absolute; top: -20px; left: 0; background-color: #f0e6d2; padding: 2px 6px; font-size: 12px; color: #333; z-index: 1070;">GameCard</div>
    
    <!-- Card identifier in corner -->
    <div class="card-identifier" :class="cardTypeIdentifierClass" style="position: absolute; top: 10px; right: 10px; width: 30px; height: 30px; z-index: 2;"></div>
    
    <!-- Card corner decoration (top left) -->
    <div style="position: absolute; top: 8px; left: 8px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; color: #5a3e2b;">
      {{ title.charAt(0) }}
      <div style="font-size: 1rem; margin-top: 2px;">{{ getSuitSymbol() }}</div>
    </div>
    
    <!-- Card corner decoration (bottom right) -->
    <div style="position: absolute; bottom: 8px; right: 8px; font-size: 0.8rem; font-weight: bold; text-transform: uppercase; color: #5a3e2b; transform: rotate(180deg);">
      {{ title.charAt(0) }}
      <div style="font-size: 1rem; margin-top: 2px;">{{ getSuitSymbol() }}</div>
    </div>
    
    <div class="game-card__header" style="border-top-left-radius: 12px; border-top-right-radius: 12px; padding: 10px; text-align: center; background-color: rgba(140, 120, 81, 0.25);">
      <h3 style="margin: 0; font-size: 1.2rem; text-transform: capitalize; color: #5a3e2b; font-weight: bold; letter-spacing: 0.5px;">{{ title }}</h3>
      <div v-if="subtitle" class="game-card__subtitle" style="font-size: 0.8rem; opacity: 0.8; color: #5a3e2b;">{{ subtitle }}</div>
    </div>
    
    <!-- Card border decoration -->
    <div style="position: absolute; top: 40px; left: 0; right: 0; bottom: 40px; border: 1px solid rgba(140, 120, 81, 0.3); border-radius: 8px; margin: 8px; pointer-events: none;"></div>
    
    <!-- Center suit symbol -->
    <div style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 4rem; opacity: 0.07; pointer-events: none; color: #5a3e2b;">
      {{ getSuitSymbol() }}
    </div>
    
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
      type: String as PropType<CardType>,
      required: true,
      validator: (value: string) => {
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
  
  // Card type identifiers
  .card-identifier {
    &.stone-arch-border::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 30px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%235a3e2b" d="M3,21V17.29L12,2L21,17.29V21H3M5,19H19V18L12,6.25L5,18V19Z"/></svg>');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
    }
    
    &.paw-print-corner::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 30px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%235a3e2b" d="M8.35,3C9.53,2.83 10.78,4.12 11.14,5.9C11.5,7.67 10.85,9.25 9.67,9.43C8.5,9.61 7.24,8.32 6.87,6.54C6.5,4.77 7.17,3.19 8.35,3M15.5,3C16.69,3.19 17.35,4.77 17,6.54C16.62,8.32 15.37,9.61 14.19,9.43C13,9.25 12.35,7.67 12.72,5.9C13.08,4.12 14.33,2.83 15.5,3M3,7.6C4.14,7.11 5.69,8 6.5,9.55C7.26,11.13 7,12.79 5.87,13.28C4.74,13.77 3.2,12.89 2.41,11.32C1.62,9.75 1.9,8.08 3,7.6M21,7.6C22.1,8.08 22.38,9.75 21.59,11.32C20.8,12.89 19.26,13.77 18.13,13.28C17,12.79 16.74,11.13 17.5,9.55C18.31,8 19.86,7.11 21,7.6M19.33,18.38C19.37,19.32 18.65,20.36 17.79,20.75C16,21.57 13.88,19.87 11.89,19.87C9.9,19.87 7.76,21.64 6,20.75C5,20.26 4.31,18.96 4.44,17.88C4.62,16.39 6.41,15.59 7.47,14.5C8.88,13.09 9.88,10.44 11.89,10.44C13.89,10.44 14.95,13.05 16.3,14.5C17.41,15.72 19.26,16.75 19.33,18.38Z"/></svg>');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
    }
    
    &.woven-basket::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 30px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%235a3e2b" d="M22,10V13H19V10H22M2,13H5V10H2V13M17,10H7V13H17V10M18,5V3C17.1,3 16.5,4.18 16.5,5.5V9H7.5V5.5C7.5,4.18 6.9,3 6,3V5C6.55,5 7,5.45 7,6V8H5V5H2V9H17V5H18Z"/></svg>');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
    }
    
    &.anvil-symbol::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 30px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%235a3e2b" d="M9,5V6H10V5H9M10,3V4H11V3H10M9,1C7.9,1 7,1.9 7,3H8C8,2.45 8.45,2 9,2V1M13,1V2C13.55,2 14,2.45 14,3H15C15,1.9 14.1,1 13,1M10,7V8H11V7H10M10,9V10H11V9H10M9,9V10H8V9H9M9,7V8H8V8C8,8.56 8.45,9 9,9V7M13,7V9C13.55,9 14,8.56 14,8V8H13V7M13,5V6H14V5H13M13,3V4H14V3H13M11,1V4H12V7H11V10H12V7H13V10H14V7H15V11H8V7H9V10H10V7H9V4H10V1H11M9,13H15V14C14.45,14 14,14.54 14,15.1V22H10V15.1C10,14.54 9.55,14 9,14V13Z"/></svg>');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
    }
    
    &.wheel-symbol::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 30px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%235a3e2b" d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,3C13.76,3 15.4,3.53 16.78,4.41L15,6.19C14.08,5.73 13.06,5.5 12,5.5C10.94,5.5 9.92,5.73 9,6.19L7.22,4.41C8.6,3.53 10.24,3 12,3M5.5,12C5.5,10.94 5.73,9.92 6.19,9L4.41,7.22C3.53,8.6 3,10.24 3,12C3,13.76 3.53,15.4 4.41,16.78L6.19,15C5.73,14.08 5.5,13.06 5.5,12M12,20C10.24,20 8.6,19.47 7.22,18.59L9,16.81C9.92,17.27 10.94,17.5 12,17.5C13.06,17.5 14.08,17.27 15,16.81L16.78,18.59C15.4,19.47 13.76,20 12,20M17.81,15L19.59,16.78C20.47,15.4 21,13.76 21,12C21,10.24 20.47,8.6 19.59,7.22L17.81,9C18.27,9.92 18.5,10.94 18.5,12C18.5,13.06 18.27,14.08 17.81,15M12,6.5C14.76,6.5 17,8.74 17,11.5C17,14.26 14.76,16.5 12,16.5C9.24,16.5 7,14.26 7,11.5C7,8.74 9.24,6.5 12,6.5M12,8.5A3,3 0 0,0 9,11.5A3,3 0 0,0 12,14.5A3,3 0 0,0 15,11.5A3,3 0 0,0 12,8.5Z"/></svg>');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
    }
    
    &.silhouette-symbol::before {
      content: "";
      position: absolute;
      top: 0;
      right: 0;
      width: 30px;
      height: 30px;
      background-image: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path fill="%235a3e2b" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"/></svg>');
      background-size: contain;
      background-repeat: no-repeat;
      opacity: 0.8;
    }
  }
  
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
}
</style>
