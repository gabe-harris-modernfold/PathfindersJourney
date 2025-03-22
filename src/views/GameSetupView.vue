<template>
  <ComponentWrapper componentName="GameSetupView">
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
          <!-- Debug info to check character data -->
          <div v-if="characters.length === 0" style="color: red; font-weight: bold;">
            No characters found! Please check character data initialization.
          </div>
          
          <GameCard 
            v-for="character in characters" 
            :key="character.id" 
            :title="character.name"
            cardType="CHARACTER"
            :class="{ 'selected': selectedCharacter && selectedCharacter.id === character.id }"
            @click="startGame(character)"
          >
            <p style="font-size: 10pt;">{{ character.description }}</p>
            
            <div class="character-stats" style="font-size: 10pt; background: transparent;">
              <div class="stat" style="background: transparent;"><span class="stat-label" style="font-size: 9pt;">Health:</span> <span style="font-size: 9pt;">{{ character.healthPoints }}</span></div>
              <div class="stat" style="background: transparent;"><span class="stat-label" style="font-size: 9pt;">Capacity:</span> <span style="font-size: 9pt;">{{ character.resourceCapacity }}</span></div>
            </div>
            
            <div class="character-abilities" style="font-size: 10pt;">
              <strong>{{ getAbilityName(character) }}:</strong> {{ getAbilityDescription(character) }}
            </div>
          </GameCard>
        </div>
      </div>
    </div>
  </ComponentWrapper>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { usePlayerStore } from '@/stores/playerStore';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';
import { CardType } from '@/models/enums/cardTypes';
import type { CharacterCard } from '@/models/types/cards';
import GameCard from '@/components/GameCard.vue'; // Import the GameCard component
import { ComponentWrapper } from '@/components/common';

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
  // Always initialize the cards to ensure we have the latest data
  cardStore.initializeCards();
  characters.value = cardStore.characters;
  console.log('Characters loaded:', characters.value.length);
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
        // Find the Ancient Stone Circle landscape
        const ancientStoneCircle = landscapes.find(landscape => landscape.id === 'ancient_stone_circle');
        
        if (ancientStoneCircle) {
          // Start at the Ancient Stone Circle
          gameStore.setCurrentLandscape(ancientStoneCircle.id);
          gameStore.addToGameLog(`You begin your journey at the Ancient Stone Circle.`, true, 'system');
          
          // Set a challenge from this landscape
          if (ancientStoneCircle.challenges && ancientStoneCircle.challenges.length > 0) {
            const firstChallenge = ancientStoneCircle.challenges[0];
            // Create a unique challenge ID based on the challenge type
            const challengeId = `${ancientStoneCircle.id}_${firstChallenge.type.toLowerCase()}_${firstChallenge.difficulty}`;
            gameStore.setCurrentChallenge(challengeId);
            console.log('Set initial challenge:', firstChallenge.type, 'difficulty:', firstChallenge.difficulty);
          }
        } else {
          // Fallback to first landscape if Ancient Stone Circle is not found
          const firstLandscape = landscapes[0];
          gameStore.setCurrentLandscape(firstLandscape.id);
          
          // Set a challenge from this landscape
          if (firstLandscape.challenges && firstLandscape.challenges.length > 0) {
            const firstChallenge = firstLandscape.challenges[0];
            // Create a unique challenge ID based on the challenge type
            const challengeId = `${firstLandscape.id}_${firstChallenge.type.toLowerCase()}_${firstChallenge.difficulty}`;
            gameStore.setCurrentChallenge(challengeId);
            console.log('Set initial challenge:', firstChallenge.type, 'difficulty:', firstChallenge.difficulty);
          }
        }
      }
    }
    
    // Navigate to the game board - use a slight delay to ensure all state changes are processed
    console.log('Navigating to game board');
    setTimeout(() => {
      router.push('/game');
    }, 50);
  } catch (error) {
    console.error('Error starting game:', error);
    alert('There was an error starting your adventure. Please try again.');
  }
};

// Load characters when component is mounted
onMounted(() => {
  // Reset game state when setup view is loaded (handles browser refresh)
  gameStore.resetGame();
  playerStore.resetPlayer();
  
  // Then load characters
  loadCharacters();
});
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
  
  .character-stats {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.25rem;
    
    .stat {
      background-color: rgba(92, 61, 46, 0.1);
      padding: 0.2rem;
      border-radius: 5px;
      font-size: 1.3rem;
      
      .stat-label {
        font-weight: bold;
        color: #5c3d2e;
      }
    }
  }
  
  .character-abilities {
    margin-bottom: 0.25rem;
    font-size: 1.3rem;
    color: #6a5d4d;
    
    strong {
      color: #5c3d2e;
    }
  }
}
</style>
