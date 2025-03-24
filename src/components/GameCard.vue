<template>
  <ComponentWrapper componentName="GameCard">
    <div 
      class="game-card" 
      :class="[
        `game-card--${cardTypeClass}`,
        { 'game-card--disabled': disabled, 'game-card--selected': selected }
      ]"
      @click="handleClick"
    >
      <!-- Card Header -->
      <div class="game-card__header">
        <h3 class="game-card__title">{{ title }}</h3>
        <div v-if="subtitle" class="game-card__subtitle">{{ subtitle }}</div>
      </div>
      
      <!-- Card Body with Background Symbol -->
      <div class="game-card__body">
        <div v-if="!noSymbol" class="game-card__symbol">{{ getSuitSymbol() }}</div>
        <slot></slot>
      </div>
      
      <!-- Optional Footer -->
      <div v-if="$slots.footer" class="game-card__footer">
        <slot name="footer"></slot>
      </div>
    </div>
  </ComponentWrapper>
</template>

<script>
import { defineComponent } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import { ComponentWrapper } from '@/components/common';

export default defineComponent({
  name: 'GameCard',
  components: {
    ComponentWrapper
  },
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
      type: [String, Number],
      required: true,
      validator: (value) => {
        // Allow both string values and enum values to be passed
        return Object.values(CardType).includes(value);
      }
    },
    season: {
      type: String,
      default: null
    },
    selected: {
      type: Boolean,
      default: false
    },
    disabled: {
      type: Boolean,
      default: false
    },
    noSymbol: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    cardTypeClass() {
      if (!this.cardType) return '';
      return this.cardType.toString().toLowerCase().replace(/_/g, '-');
    }
  },
  methods: {
    getSuitSymbol() {
      // Return different suit symbols based on card type
      switch(this.cardType) {
        case CardType.LANDSCAPE: return '♣'; 
        case CardType.ANIMAL_COMPANION: return '♥';
        case CardType.RESOURCE: return '♦';
        case CardType.CRAFTED_ITEM: return '♠';
        case CardType.SEASON: return '★';
        case CardType.CHARACTER: return '✦';
        case CardType.ACTION: return '➜';
        default: return '•';
      }
    },
    handleClick(event) {
      if (!this.disabled) {
        this.$emit('click', event);
      }
    }
  },
  emits: ['click']
});
</script>

<style lang="scss" scoped>
.game-card {
  position: relative;
  border-radius: 12px;
  aspect-ratio: 2.5/3.5;
  width: 100%;
  max-width: 220px;
  display: flex;
  flex-direction: column;
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
  overflow: hidden;
  background: linear-gradient(to bottom, #f0e6d2 0%, #e6d7b9 100%);
  border: 2px solid #8c7851;
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 16px rgba(0,0,0,0.2);
  }
  
  &--selected {
    transform: scale(1.05);
    border-color: #4a7c59;
    box-shadow: 0 0 0 2px #4a7c59, 0 8px 16px rgba(0,0,0,0.2);
  }
  
  &--disabled {
    opacity: 0.6;
    filter: grayscale(0.5);
    cursor: not-allowed;
    
    &:hover {
      transform: none;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15);
    }
  }
  
  &__header {
    border-top-left-radius: 10px;
    border-top-right-radius: 10px;
    padding: 8px;
    text-align: center;
    background-color: rgba(140, 120, 81, 0.25);
    z-index: 2;
  }
  
  &__title {
    margin: 0;
    font-size: 1.1rem;
    text-transform: capitalize;
    color: #5a3e2b;
    font-weight: bold;
  }
  
  &__subtitle {
    font-size: 0.8rem;
    opacity: 0.8;
    color: #5a3e2b;
  }
  
  &__body {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 8px;
    z-index: 1;
    color: #5a3e2b;
    position: relative;
  }
  
  &__symbol {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 4rem;
    opacity: 0.07;
    pointer-events: none;
    color: #5a3e2b;
    z-index: 0;
  }
  
  &__footer {
    border-bottom-left-radius: 10px;
    border-bottom-right-radius: 10px;
    padding: 6px;
    text-align: center;
    background-color: rgba(140, 120, 81, 0.15);
    z-index: 2;
  }
  
  // Card type styling
  &--landscape {
    border-top: 4px solid #6c4f30;
  }
  
  &--animal-companion {
    border-top: 4px solid #8a4444;
  }
  
  &--resource {
    border-top: 4px solid #4c6c42;
  }
  
  &--crafted-item {
    border-top: 4px solid #444b69;
  }
  
  &--character {
    border: 2px solid #82632b;
    border-top-width: 4px;
  }
  
  &--action {
    border: 2px solid #5a3e2b;
    border-top-width: 4px;
    background: linear-gradient(to bottom, #f0c8a0 0%, #e8d5b2 100%);
  }
}
</style>