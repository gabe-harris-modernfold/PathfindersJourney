<template>
  <div class="game-setup">
    <div class="game-container">
      <div class="game-header">
        <h1 class="game-title">Game Setup</h1>
        <p class="game-subtitle">Choose your character and begin your journey through the mystical Celtic landscape.</p>
      </div>
      
      <div class="celtic-quote">
        "The journey through the Celtic Realm is one of discovery, challenge, and transformation."
      </div>
      
      <h2>Select Your Character</h2>
      <p class="character-intro mb-4">
        Each character brings unique abilities and challenges to your journey. Choose wisely, as your character's strengths and weaknesses will shape your path through the Celtic Realm.
      </p>
      
      <div class="character-selection">
        <div v-for="character in characters" :key="character.id" class="character-card" 
             :class="{ 'selected': selectedCharacter && selectedCharacter.id === character.id }"
             @click="selectCharacter(character)">
          <h3>{{ character.name }}</h3>
          <p>{{ character.description }}</p>
          
          <div class="character-stats">
            <div class="stat"><span class="stat-label">Health:</span> {{ character.health }}</div>
            <div class="stat"><span class="stat-label">Capacity:</span> {{ character.resourceCapacity }}</div>
          </div>
          
          <div class="character-abilities">
            <strong>{{ getAbilityName(character) }}:</strong> {{ getAbilityDescription(character) }}
          </div>
          
          <button class="select-btn" @click.stop="startGame(character)">Start Adventure</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/playerStore';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import type { CharacterCard } from '@/models/types/cards';

// Initialize stores and router
const router = useRouter();
const playerStore = usePlayerStore();
const gameStore = useGameStore();
const cardStore = useCardStore();

// Initialize state
const characters = ref<CharacterCard[]>([]);
const selectedCharacter = ref<CharacterCard | null>(null);

// Load characters when component is mounted
const loadCharacters = () => {
  if (!cardStore.initialized) {
    cardStore.initializeCards();
  }
  characters.value = cardStore.characters;
};

// Select a character
const selectCharacter = (character: CharacterCard) => {
  selectedCharacter.value = character;
};

// Get the ability name for a character
const getAbilityName = (character: CharacterCard) => {
  return character.specialAbility?.name || '';
};

// Get the ability description for a character
const getAbilityDescription = (character: CharacterCard) => {
  return character.specialAbility?.description || '';
};

// Start the game with the selected character
const startGame = (character: CharacterCard) => {
  try {
    console.log('Starting game with character:', character.name);
    
    // Set the player's character
    playerStore.selectCharacter(character.id);
    
    // Initialize game state
    gameStore.startGame();
    gameStore.setPhase(GamePhase.SEASONAL_ASSESSMENT);
    
    // Add initial game log entry
    gameStore.addToGameLog(`You begin your journey as ${character.name}.`, true, 'system');
    
    // Set initial landscape if not already set
    if (!gameStore.currentLandscapeId) {
      const landscapes = cardStore.landscapes;
      if (landscapes.length > 0) {
        const firstLandscape = landscapes[0];
        gameStore.setCurrentLandscape(firstLandscape.id);
        
        // Set a challenge from this landscape
        if (firstLandscape.challenges && firstLandscape.challenges.length > 0) {
          const firstChallenge = firstLandscape.challenges[0];
          gameStore.setCurrentChallenge(firstChallenge.id);
          console.log('Set initial challenge:', firstChallenge.name);
        }
      }
    }
    
    // Navigate to the game board
    console.log('Navigating to game board');
    router.push('/game');
  } catch (error) {
    console.error('Error starting game:', error);
    alert('There was an error starting your adventure. Please try again.');
  }
};

// Load characters when component is mounted
loadCharacters();
</script>

<style lang="scss" scoped>
.game-setup {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 2rem;
  
  .game-container {
    max-width: 1200px;
    width: 100%;
  }
  
  .game-header {
    text-align: center;
    margin-bottom: 1rem;
  }
  
  .game-title {
    font-size: 2.5rem;
    color: #5c3d2e;
    margin-bottom: 0.25rem;
  }
  
  .game-subtitle {
    font-size: 1.2rem;
    color: #6a5d4d;
  }
  
  .celtic-quote {
    font-family: 'Tangerine', cursive;
    font-size: 1.8rem;
    text-align: center;
    color: #5c3d2e;
    margin: 1rem 0;
    font-style: italic;
  }
  
  h2 {
    font-size: 1.8rem;
    color: #5c3d2e;
    text-align: center;
    margin-bottom: 0.5rem;
  }
  
  .character-intro {
    text-align: center;
    max-width: 800px;
    margin: 0 auto;
    color: #6a5d4d;
  }
  
  .character-selection {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    margin-top: 1rem;
  }
  
  .character-card {
    background-color: rgba(255, 255, 255, 0.8);
    border: 2px solid #d9c5a0;
    border-radius: 10px;
    padding: 1rem;
    transition: all 0.3s ease;
    cursor: pointer;
    width: 250px; /* Standard playing card width ratio */
    height: 350px; /* Standard playing card height ratio */
    display: flex;
    flex-direction: column;
    position: relative;
    overflow: hidden;
    
    &:hover {
      transform: translateY(-5px);
      box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
      border-color: #b39b6f;
    }
    
    &.selected {
      border-color: #5c3d2e;
      background-color: rgba(92, 61, 46, 0.1);
    }
    
    h3 {
      font-size: 1.3rem;
      color: #5c3d2e;
      margin-bottom: 0.25rem;
      text-align: center;
    }
    
    p {
      color: #6a5d4d;
      margin-bottom: 0.5rem;
      line-height: 1.3;
      font-size: 0.9rem;
      flex-grow: 1;
      overflow-y: auto;
    }
    
    .character-stats {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      
      .stat {
        background-color: rgba(92, 61, 46, 0.1);
        padding: 0.3rem;
        border-radius: 5px;
        font-size: 0.85rem;
        
        .stat-label {
          font-weight: bold;
          color: #5c3d2e;
        }
      }
    }
    
    .character-abilities {
      margin-bottom: 0.75rem;
      font-size: 0.85rem;
      color: #6a5d4d;
      
      strong {
        color: #5c3d2e;
      }
    }
    
    .select-btn {
      background-color: #5c3d2e;
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 5px;
      cursor: pointer;
      transition: background-color 0.3s;
      width: 100%;
      margin-top: auto;
      
      &:hover {
        background-color: darken(#5c3d2e, 10%);
      }
    }
  }
}
</style>
