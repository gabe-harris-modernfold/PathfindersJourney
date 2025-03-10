import { computed, ref } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';

/**
 * Composable for accessing and manipulating game state
 * Provides a unified interface to interact with multiple stores
 */
export function useGameState() {
  const gameStore = useGameStore();
  const playerStore = usePlayerStore();
  const cardStore = useCardStore();

  // Computed properties for common game state
  const isGameStarted = computed(() => gameStore.currentPhase !== GamePhase.SETUP);
  const currentCharacter = computed(() => 
    playerStore.characterId ? cardStore.getCharacterById(playerStore.characterId) : null
  );
  const currentLandscape = computed(() => 
    gameStore.currentLandscapeId ? cardStore.getLandscapeById(gameStore.currentLandscapeId) : null
  );
  const currentSeason = computed(() => 
    gameStore.currentSeason ? cardStore.getSeasonById(gameStore.currentSeason) : null
  );
  const playerResources = computed(() => 
    playerStore.resources.map(id => cardStore.getResourceById(id)).filter(Boolean)
  );
  const playerCompanions = computed(() => 
    playerStore.animalCompanions.map(id => cardStore.getAnimalCompanionById(id)).filter(Boolean)
  );
  const playerCraftedItems = computed(() => 
    playerStore.craftedItems.map(id => cardStore.getCraftedItemById(id)).filter(Boolean)
  );
  const journeyProgress = computed(() => {
    const totalLandscapes = 15; // Total number of landscapes in the game
    return Math.floor((gameStore.visitedLandscapes.length / totalLandscapes) * 100);
  });
  const threatLevel = computed(() => 
    Math.floor(gameStore.threatTokens / 3)
  );

  // Game state helpers
  const canCraftItems = computed(() => 
    isGameStarted.value && 
    playerResources.value.length > 0 && 
    gameStore.currentPhase === GamePhase.RESOURCE_MANAGEMENT
  );
  
  const canBondWithCompanion = computed(() => 
    isGameStarted.value && 
    playerResources.value.length > 0 && 
    gameStore.currentPhase === GamePhase.ANIMAL_COMPANION
  );

  const canResolveChallenge = computed(() => 
    isGameStarted.value && 
    gameStore.currentPhase === GamePhase.LANDSCAPE_CHALLENGE
  );

  // Return all the state and helpers
  return {
    // Stores
    gameStore,
    playerStore,
    cardStore,
    
    // Game state
    isGameStarted,
    currentCharacter,
    currentLandscape,
    currentSeason,
    playerResources,
    playerCompanions,
    playerCraftedItems,
    journeyProgress,
    threatLevel,
    
    // Game state helpers
    canCraftItems,
    canBondWithCompanion,
    canResolveChallenge
  };
}
