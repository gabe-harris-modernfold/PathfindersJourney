<template>
  <div class="seasonal-wheel">
    <div class="seasonal-wheel__container">
      <div 
        class="seasonal-wheel__dial" 
        :style="`transform: rotate(${rotationDegrees}deg)`"
      >
        <!-- Night sky with stars background -->
        <div class="night-sky">
          <div class="star-field">
            <div v-for="n in 100" :key="n" class="twinkling-star" :style="`top: ${Math.random() * 100}%; left: ${Math.random() * 100}%; animation-delay: ${Math.random() * 5}s; animation-duration: ${3 + Math.random() * 7}s;`"></div>
          </div>
        </div>
        
        <!-- Season sections - 5 sections (72° each) -->
        <div class="seasonal-wheel__section" data-season="samhain">
          <div class="moon-phase new-moon"></div>
        </div>
        <div class="seasonal-wheel__section" data-season="winters_depth">
          <div class="moon-phase crescent-moon"></div>
        </div>
        <div class="seasonal-wheel__section" data-season="imbolc">
          <div class="moon-phase quarter-moon"></div>
        </div>
        <div class="seasonal-wheel__section" data-season="beltane">
          <div class="moon-phase gibbous-moon"></div>
        </div>
        <div class="seasonal-wheel__section" data-season="lughnasadh">
          <div class="moon-phase full-moon"></div>
        </div>
      </div>
      
      <!-- Removed the pointer triangle -->
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
  place-items: center;
  width: 100%;
  
  &__container {
    position: relative;
    width: 550px;
    height: 550px;
    margin: 2rem auto;
  }
  
  &__dial {
    position: relative;
    width: 100%;
    height: 100%;
    border-radius: 50%;
    transition: transform 0.5s ease;
    overflow: hidden;
    background-color: transparent; // Changed from dark blue to transparent
  }
  
  &__section {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    transform-origin: center;
    
    &[data-season="samhain"] {
      transform: rotate(0deg);
    }
    
    &[data-season="winters_depth"] {
      transform: rotate(72deg);
    }
    
    &[data-season="imbolc"] {
      transform: rotate(144deg);
    }
    
    &[data-season="beltane"] {
      transform: rotate(216deg);
    }
    
    &[data-season="lughnasadh"] {
      transform: rotate(288deg);
    }
  }
  
  &__pointer {
    display: none; /* Hide the triangle pointer */
  }
  
  .moon-phase {
    position: absolute;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    z-index: 15;
    animation: float 8s ease-in-out infinite;
    transform: translateY(-130px);
  }
  
  .new-moon {
    background-color: transparent;
    border: 2px solid rgba(255, 255, 255, 0.6);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.4);
  }
  
  .crescent-moon {
    background-color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
    position: relative;
    overflow: hidden;
    
    &::after {
      content: '';
      position: absolute;
      top: -10px;
      right: -10px;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: rgba(10, 17, 40, 0.9);
      box-shadow: inset 0 0 10px rgba(10, 17, 40, 0.9);
    }
  }
  
  .quarter-moon {
    background: linear-gradient(90deg, #fff 50%, transparent 50%);
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }
  
  .gibbous-moon {
    background: linear-gradient(90deg, #fff 75%, transparent 25%);
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
  }
  
  .full-moon {
    background-color: #fff;
    border: 2px solid rgba(255, 255, 255, 0.7);
    box-shadow: 0 0 20px rgba(255, 255, 255, 0.8);
  }
  
  .floating-season-name {
    display: none; /* Hide the original season names */
  }
  
  .night-sky {
    position: absolute;
    width: 100%;
    height: 100%;
    z-index: 1;
  }
  
  .star-field {
    position: absolute;
    width: 130%;
    height: 130%;
    left: -15%;
    top: -15%;
    z-index: 2;
  }
  
  .twinkling-star {
    position: absolute;
    width: 3px;
    height: 3px;
    background-color: white;
    border-radius: 50%;
    opacity: 0;
    z-index: 3;
    box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.8);
    animation: twinkle 5s infinite ease-in-out;
    
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 50%;
      box-shadow: 0 0 20px 4px rgba(255, 255, 255, 0.4);
      animation: glow 5s infinite alternate;
    }
  }
  
  @keyframes float {
    0% {
      transform: translateY(-130px);
    }
    50% {
      transform: translateY(-150px);
    }
    100% {
      transform: translateY(-130px);
    }
  }
  
  @keyframes twinkle {
    0%, 100% {
      opacity: 0;
      transform: scale(0.5);
    }
    50% {
      opacity: 1;
      transform: scale(1.5);
    }
  }
  
  @keyframes glow {
    0% {
      box-shadow: 0 0 10px 2px rgba(255, 255, 255, 0.4);
    }
    100% {
      box-shadow: 0 0 20px 4px rgba(255, 255, 255, 0.8);
    }
  }
}

@media (max-width: 768px) {
  .seasonal-wheel {
    &__container {
      width: 380px;
      height: 380px;
    }
    
    .moon-phase {
      width: 40px;
      height: 40px;
      transform: translateY(-120px);
    }
    
    .crescent-moon {
      &::after {
        width: 40px;
        height: 40px;
        top: -7px;
        right: -7px;
      }
    }
    
    @keyframes float {
      0% {
        transform: translateY(-120px);
      }
      50% {
        transform: translateY(-140px);
      }
      100% {
        transform: translateY(-120px);
      }
    }
  }
}
</style>
