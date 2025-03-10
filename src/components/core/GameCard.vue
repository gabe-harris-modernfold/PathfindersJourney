<template>
  <div 
    class="game-card" 
    :class="cardTypeClass"
    @click="$emit('click', $event)"
  >
    <div class="game-card__header">
      <h3>{{ title }}</h3>
      <div v-if="subtitle" class="game-card__subtitle">{{ subtitle }}</div>
    </div>
    <div class="game-card__body">
      <slot></slot>
    </div>
    <div v-if="$slots.footer" class="game-card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
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
      type: String,
      required: true,
      validator: (value: string) => {
        return Object.values(CardType).includes(value as CardType);
      }
    },
    season: {
      type: String,
      default: null,
      validator: (value: string) => {
        return value === null || Object.values(Season).includes(value as Season);
      }
    }
  },
  computed: {
    cardTypeClass() {
      const classes = {
        [`game-card--${this.cardType.toLowerCase().replace('_', '-')}`]: true
      };
      
      if (this.cardType === CardType.SEASON && this.season) {
        classes[this.season.toLowerCase()] = true;
      }
      
      return classes;
    }
  },
  emits: ['click']
});
</script>

<style lang="scss" scoped>
// Styles are in the main.scss file
</style>
