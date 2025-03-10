<template>
  <div class="character-selection">
    <div 
      v-for="character in characters" 
      :key="character.id"
      class="character-selection__option"
      :class="{ selected: selectedCharacterId === character.id }"
      @click="selectCharacter(character.id)"
    >
      <GameCard 
        :title="character.name" 
        :subtitle="'Character'" 
        :cardType="CardType.CHARACTER"
      >
        <p>{{ character.description }}</p>
        
        <div class="character-stats mt-3">
          <div class="stat-item">
            <span class="stat-label">Health:</span>
            <span class="stat-value">{{ character.health }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">Resource Capacity:</span>
            <span class="stat-value">{{ character.resourceCapacity }}</span>
          </div>
        </div>
        
        <div v-if="character.specialAbility" class="character-rule mt-3">
          <h4>Special Ability</h4>
          <p class="ability-description">{{ character.specialAbility.description }}</p>
        </div>
        
        <div v-if="false" class="character-weakness mt-3">
          <h4>Weakness</h4>
          <p class="drawback-description">Not available</p>
        </div>
      </GameCard>
    </div>
  </div>
  
  <div class="text-center mt-4" v-if="selectedCharacterId">
    <button class="btn btn--primary btn--lg" @click="confirmSelection">
      Begin Your Journey
    </button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { CardType } from '@/models/enums/cardTypes';
import { useCardStore } from '@/stores';
import { usePlayerStore } from '@/stores';
import { useGameStore } from '@/stores';
import { CharacterCard } from '@/models/types/cards';
import GameCard from '@/components/core/GameCard.vue';

export default defineComponent({
  name: 'CharacterSelection',
  components: {
    GameCard
  },
  setup() {
    const router = useRouter();
    const cardStore = useCardStore();
    const playerStore = usePlayerStore();
    const gameStore = useGameStore();
    
    const characters = ref<CharacterCard[]>([]);
    const selectedCharacterId = ref<string | null>(null);
    
    onMounted(() => {
      // Initialize card store if not already initialized
      if (!cardStore.initialized) {
        cardStore.initializeCards();
      }
      
      // Get all characters
      characters.value = cardStore.characters;
    });
    
    const selectCharacter = (characterId: string) => {
      selectedCharacterId.value = characterId;
    };
    
    const confirmSelection = () => {
      if (selectedCharacterId.value) {
        const selectedCharacter = cardStore.getCharacterById(selectedCharacterId.value);
        
        if (selectedCharacter) {
          // Set the player's character
          playerStore.selectCharacter(selectedCharacterId.value);
          
          // Start the game
          gameStore.startGame();
          
          // Navigate to the game board
          router.push('/game');
        }
      }
    };
    
    return {
      characters,
      selectedCharacterId,
      selectCharacter,
      confirmSelection,
      CardType
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.character-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: $spacing-sm;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  padding: $spacing-xs $spacing-sm;
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: $border-radius-sm;
}
</style>
