<template>
  <div class="seasonal-wheel">
    <div class="seasonal-wheel__container">
      <div 
        class="seasonal-wheel__dial" 
        :style="`transform: rotate(${rotationDegrees}deg)`"
      >
        <!-- Season sections - 5 sections (72° each) -->
        <div class="seasonal-wheel__section" data-season="samhain">
          <div class="seasonal-wheel__label">Samhain</div>
          <div class="seasonal-wheel__quest" :class="{ 'completed': isQuestCompleted('SAMHAIN') }">
            <span>Quest</span>
          </div>
        </div>
        <div class="seasonal-wheel__section" data-season="winters_depth">
          <div class="seasonal-wheel__label">Winter's Depth</div>
          <div class="seasonal-wheel__quest" :class="{ 'completed': isQuestCompleted('WINTERS_DEPTH') }">
            <span>Quest</span>
          </div>
        </div>
        <div class="seasonal-wheel__section" data-season="imbolc">
          <div class="seasonal-wheel__label">Imbolc</div>
          <div class="seasonal-wheel__quest" :class="{ 'completed': isQuestCompleted('IMBOLC') }">
            <span>Quest</span>
          </div>
        </div>
        <div class="seasonal-wheel__section" data-season="beltane">
          <div class="seasonal-wheel__label">Beltane</div>
          <div class="seasonal-wheel__quest" :class="{ 'completed': isQuestCompleted('BELTANE') }">
            <span>Quest</span>
          </div>
        </div>
        <div class="seasonal-wheel__section" data-season="lughnasadh">
          <div class="seasonal-wheel__label">Lughnasadh</div>
          <div class="seasonal-wheel__quest" :class="{ 'completed': isQuestCompleted('LUGHNASADH') }">
            <span>Quest</span>
          </div>
        </div>
      </div>
      
      <div class="seasonal-wheel__pointer"></div>
    </div>
    
    <div class="seasonal-wheel__info">
      <h3>{{ formattedSeason }}</h3>
      <div class="seasonal-wheel__effects">
        <div v-if="seasonEffects.length > 0">
          <h4>Season Effects:</h4>
          <ul>
            <li v-for="(effect, index) in seasonEffects" :key="index">
              {{ effect }}
            </li>
          </ul>
        </div>
        <div v-else>
          <p>No active seasonal effects</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  season: string;
  quests: { id: string; completed: boolean }[];
}>();

const seasonIndex = computed(() => {
  const seasonMap = {
    'SAMHAIN': 0,
    'WINTERS_DEPTH': 1,
    'IMBOLC': 2,
    'BELTANE': 3,
    'LUGHNASADH': 4
  };
  return seasonMap[props.season] || 0;
});

const rotationDegrees = computed(() => seasonIndex.value * 72);

const formattedSeason = computed(() => {
  const seasonFormatMap = {
    'SAMHAIN': 'Samhain',
    'WINTERS_DEPTH': "Winter's Depth",
    'IMBOLC': 'Imbolc',
    'BELTANE': 'Beltane',
    'LUGHNASADH': 'Lughnasadh'
  };
  return seasonFormatMap[props.season] || props.season;
});

const seasonEffects = computed(() => {
  const effectsMap = {
    'SAMHAIN': [
      'Spiritual challenges are easier',
      'Animal companions are more restless'
    ],
    'WINTERS_DEPTH': [
      'Resources are more scarce',
      'Physical challenges are harder',
      'Shelter is critical'
    ],
    'IMBOLC': [
      'Healing is more effective',
      'New growth begins'
    ],
    'BELTANE': [
      'Resources are abundant',
      'Social challenges are easier'
    ],
    'LUGHNASADH': [
      'Crafting is more effective',
      'Harvesting yields more resources'
    ]
  };
  
  return effectsMap[props.season] || [];
});

const isQuestCompleted = (seasonId: string) => {
  const quest = props.quests.find(q => q.id === seasonId);
  return quest ? quest.completed : false;
};
</script>

<style lang="scss" scoped>
.seasonal-wheel {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 1rem;
  
  &__container {
    position: relative;
    width: 200px;
    height: 200px;
  }
  
  &__dial {
    position: absolute;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: #f0e6d2;
    border: 3px solid #8c7851;
    transition: transform 0.5s ease-in-out;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  &__section {
    position: absolute;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    padding-top: 10px;
    transform-origin: center bottom;
    
    &[data-season="samhain"] {
      transform: rotate(0deg);
      background: radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(89, 62, 49, 0.5) 100%);
    }
    
    &[data-season="winters_depth"] {
      transform: rotate(72deg);
      background: radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(173, 216, 230, 0.5) 100%);
    }
    
    &[data-season="imbolc"] {
      transform: rotate(144deg);
      background: radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(144, 238, 144, 0.5) 100%);
    }
    
    &[data-season="beltane"] {
      transform: rotate(216deg);
      background: radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(255, 182, 193, 0.5) 100%);
    }
    
    &[data-season="lughnasadh"] {
      transform: rotate(288deg);
      background: radial-gradient(ellipse at center, rgba(0,0,0,0) 30%, rgba(255, 215, 0, 0.5) 100%);
    }
  }
  
  &__label {
    font-weight: bold;
    font-size: 0.8rem;
    margin-bottom: 0.5rem;
    text-align: center;
    width: 80px;
  }
  
  &__quest {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #d4c8a8;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 20px;
    
    span {
      font-size: 0.6rem;
      display: none;
    }
    
    &.completed {
      background: #6b8e23;
    }
    
    &:hover {
      span {
        display: block;
        position: absolute;
        background: rgba(0, 0, 0, 0.7);
        color: white;
        padding: 0.25rem 0.5rem;
        border-radius: 3px;
        white-space: nowrap;
      }
    }
  }
  
  &__pointer {
    position: absolute;
    top: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 10px solid transparent;
    border-right: 10px solid transparent;
    border-top: 15px solid #8c7851;
    z-index: 2;
  }
  
  &__info {
    padding: 1rem;
    background: rgba(240, 230, 210, 0.3);
    border-radius: 8px;
    
    h3 {
      margin-top: 0;
      color: #5c4d3c;
      border-bottom: 1px solid #8c7851;
      padding-bottom: 0.5rem;
    }
    
    h4 {
      margin-bottom: 0.5rem;
      color: #5c4d3c;
    }
    
    ul {
      margin: 0;
      padding-left: 1.5rem;
      
      li {
        margin-bottom: 0.25rem;
      }
    }
  }
}

@media (max-width: 768px) {
  .seasonal-wheel {
    grid-template-columns: 1fr;
    
    &__container {
      margin: 0 auto;
    }
  }
}
</style>
