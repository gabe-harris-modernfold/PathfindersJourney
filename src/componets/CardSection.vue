<template>
    <div class="card-section" :class="{ 'card-section--expanded': expanded }">
      <div v-if="title" class="card-section__header" @click="toggleExpanded">
        <h3 class="card-section__title">{{ title }}</h3>
        <button v-if="collapsible" class="card-section__toggle">
          {{ expanded ? '▲' : '▼' }}
        </button>
      </div>
      
      <div v-if="!collapsible || expanded" :class="[
        'card-section__content',
        `card-section__content--${layout}`,
        { 'card-section__content--empty': $slots.empty && !hasChildren }
      ]">
        <slot v-if="hasChildren"></slot>
        <slot v-else name="empty">
          <div class="card-section__empty">
            No items to display
          </div>
        </slot>
      </div>
    </div>
  </template>
  
  <script lang="ts">
  import { defineComponent, ref, useSlots, computed } from 'vue';
  
  export default defineComponent({
    name: 'CardSection',
    props: {
      title: {
        type: String,
        default: ''
      },
      layout: {
        type: String,
        default: 'grid',
        validator: (value: string) => ['grid', 'horizontal', 'vertical'].includes(value)
      },
      collapsible: {
        type: Boolean,
        default: false
      },
      initiallyExpanded: {
        type: Boolean,
        default: true
      }
    },
    setup(props) {
      const expanded = ref(props.initiallyExpanded);
      const slots = useSlots();
      
      const hasChildren = computed(() => {
        return !!slots.default && slots.default().length > 0;
      });
      
      const toggleExpanded = () => {
        if (props.collapsible) {
          expanded.value = !expanded.value;
        }
      };
      
      return {
        expanded,
        hasChildren,
        toggleExpanded
      };
    }
  });
  </script>
  
  <style lang="scss" scoped>
  .card-section {
    width: 100%;
    margin-bottom: 16px;
    
    &__header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 12px;
      padding-bottom: 8px;
      border-bottom: 2px solid rgba(140, 120, 81, 0.3);
      
      &:hover {
        cursor: pointer;
      }
    }
    
    &__title {
      margin: 0;
      color: #5a3e2b;
      font-family: 'Cinzel', serif;
    }
    
    &__toggle {
      background: none;
      border: none;
      font-size: 1rem;
      color: #5a3e2b;
      cursor: pointer;
      transition: transform 0.3s;
    }
    
    &__content {
      transition: max-height 0.3s ease, opacity 0.3s ease;
      
      &--grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 16px;
      }
      
      &--horizontal {
        display: flex;
        flex-wrap: nowrap;
        gap: 16px;
        overflow-x: auto;
        padding-bottom: 12px;
        
        > * {
          flex: 0 0 auto;
          width: 200px;
        }
      }
      
      &--vertical {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }
      
      &--empty {
        min-height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
    }
    
    &__empty {
      color: #8c7851;
      font-style: italic;
      text-align: center;
      padding: 24px;
      background-color: rgba(240, 230, 210, 0.3);
      border-radius: 8px;
      width: 100%;
    }
    
    &--expanded {
      .card-section__toggle {
        transform: rotate(180deg);
      }
    }
  }
  
  @media (max-width: 768px) {
    .card-section {
      &__content--grid {
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
      }
    }
  }
  </style>