<template>
    <GameCard 
      :title="resource.name" 
      :subtitle="resource.rarity" 
      :cardType="CardType.RESOURCE"
      :selected="selected"
      @click.prevent="$emit('select', resource.id)"
    >
      <div class="resource-card__content">
        <p>{{ truncateDescription(resource.description) }}</p>
        
        <div class="resource-seasons" v-if="resource.seasonalAbundance?.length">
          <div class="season-tags">
            <span 
              v-for="season in resource.seasonalAbundance" 
              :key="season"
              class="season-tag"
              :class="getSeasonClassName(season)"
            >
              {{ formatSeasonName(season) }}
            </span>
          </div>
        </div>
        
        <div class="resource-special" v-if="resource.specialEffect">
          <p class="special-effect">{{ resource.specialEffect.description }}</p>
        </div>
      </div>
      
      <template #footer v-if="showActions">
        <div class="resource-card__actions">
          <button 
            class="btn btn--primary"
            @click.stop.prevent="$emit('use', resource.id)"
            :disabled="!resource.specialEffect"
          >
            Use
          </button>
          <button 
            class="btn"
            @click.stop.prevent="$emit('discard', resource.id)"
          >
            Discard
          </button>
        </div>
      </template>
    </GameCard>
  </template>
  
  <script>
  import { defineComponent } from 'vue';
  import { CardType } from '@/models/enums/cardTypes';
  import GameCard from '@/components/core/GameCard.vue';
  import { resourceService } from '@/services/resourceService';
  
  export default defineComponent({
    name: 'ResourceCard',
    components: {
      GameCard
    },
    props: {
      resource: {
        type: Object,
        required: true
      },
      selected: {
        type: Boolean,
        default: false
      },
      showActions: {
        type: Boolean,
        default: false
      }
    },
    emits: ['select', 'use', 'discard'],
    setup(props) {
      // Truncate description for display - use the service method
      const truncateDescription = (text) => {
        return resourceService.truncateDescription(text);
      };
      
      // Format season name for display - use the service method
      const formatSeasonName = (season) => {
        return resourceService.formatSeasonName(season);
      };
      
      // Get CSS class for season - use the service method
      const getSeasonClassName = (season) => {
        return resourceService.getSeasonClassName(season);
      };
      
      return {
        CardType,
        truncateDescription,
        formatSeasonName,
        getSeasonClassName
      };
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .resource-card__content {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 4px;
    font-size: 0.9rem;
  }
  
  .resource-seasons {
    margin-top: 4px;
  }
  
  .season-tags {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    justify-content: center;
  }
  
  .season-tag {
    font-size: 0.7rem;
    padding: 1px 4px;
    border-radius: 8px;
    
    &.imbolc {
      background-color: #e6f7ff;
      color: #0066cc;
    }
    
    &.beltane {
      background-color: #f0fff0;
      color: #228b22;
    }
    
    &.lughnasadh {
      background-color: #fff0e0;
      color: #b25900;
    }
    
    &.samhain {
      background-color: #f9e6ff;
      color: #5a008a;
    }
    
    &.winters-depth {
      background-color: #e6f0ff;
      color: #0047b3;
    }
  }
  
  .resource-special {
    margin-top: 4px;
    
    .special-effect {
      font-style: italic;
      font-size: 0.8rem;
      color: #5a3e2b;
    }
  }
  
  .resource-card__actions {
    display: flex;
    gap: 2px;
    
    .btn {
      flex: 1;
      padding: 3px;
      border-radius: 4px;
      font-size: 0.8rem;
      background: #e6d7b9;
      border: 1px solid #8c7851;
      cursor: pointer;
      
      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      &--primary {
        background: #5a3e2b;
        color: white;
      }
    }
  }
  </style>