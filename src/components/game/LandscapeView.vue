<template>
  <div class="landscape-view">
    <GameCard 
      :title="landscape?.name || 'Unknown Landscape'" 
      :subtitle="'Landscape'"
      :cardType="CardType.LANDSCAPE"
    >
      <p class="landscape-description">{{ landscape?.description }}</p>
      
      <div v-if="landscape?.challenges?.length" class="landscape-challenge mt-3">
        <h4>Challenge: {{ landscape.challenge || landscape.challenges[0].type }}</h4>
        <p>
          <span class="challenge-type" :class="landscape.challenge || landscape.challenges[0].type">
            {{ landscape.challenge || landscape.challenges[0].type }}
          </span>
          - Difficulty: {{ landscape.challenges[0].difficulty }}
        </p>
        <p>{{ landscape?.description }}</p>
      </div>
      
      <div v-if="landscape?.availableResources?.length" class="landscape-resources mt-3">
        <h4>Available Resources:</h4>
        <ul class="resource-list">
          <li v-for="resourceId in landscape.availableResources" :key="resourceId" class="resource-list__item">
            {{ getResourceName(resourceId) }}
          </li>
        </ul>
      </div>
      
      <template #footer>
        <div class="landscape-actions">
          <button 
            v-if="!challengeResolved && currentPhase === GamePhase.LANDSCAPE_CHALLENGE" 
            class="btn btn--primary"
            @click="attemptChallenge"
          >
            Attempt Challenge
          </button>
          
          <button 
            v-if="challengeResolved && currentPhase === GamePhase.RESOURCE_MANAGEMENT" 
            class="btn btn--accent"
            @click="gatherResources"
            :disabled="!canGatherResources"
          >
            Gather Resources
          </button>
          
          <button 
            v-if="challengeResolved && currentPhase === GamePhase.JOURNEY_PROGRESSION" 
            class="btn btn--secondary"
            @click="continueJourney"
          >
            Continue Journey
          </button>
        </div>
      </template>
    </GameCard>
  </div>
</template>

<script lang="ts">
import { defineComponent, computed, ref } from 'vue';
import { CardType } from '@/models/enums/cardTypes';
import { GamePhase } from '@/models/enums/phases';
import { ChallengeType } from '@/models/enums/cardTypes';
import { useCardStore, useGameStore, usePlayerStore } from '@/stores';
import GameCard from '@/components/core/GameCard.vue';
import { LandscapeCard } from '@/models/types/cards';
import { getStandardizedChallengeType, abilityMatchesChallenge } from '@/utils/typeMapping';

export default defineComponent({
  name: 'LandscapeView',
  components: {
    GameCard
  },
  props: {
    landscapeId: {
      type: String,
      required: true
    }
  },
  setup(props) {
    const cardStore = useCardStore();
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    const challengeResolved = ref(false);
    
    const landscape = computed<LandscapeCard | undefined>(() => {
      return cardStore.getLandscapeById(props.landscapeId);
    });
    
    const currentPhase = computed(() => {
      return gameStore.currentPhase;
    });
    
    const canGatherResources = computed(() => {
      return playerStore.resources.length < playerStore.resourceCapacity;
    });
    
    const getResourceName = (resourceId: string) => {
      if (!resourceId) {
        return 'Unknown Resource';
      }
      const resource = cardStore.getResourceById(resourceId);
      return resource ? resource.name : 'Unknown Resource';
    };
    
    const attemptChallenge = () => {
      if (!landscape.value) return;
      
      const challenge = landscape.value.challenges?.[0];
      if (!challenge) return;
      
      // Standardize challenge type
      const standardChallengeType = getStandardizedChallengeType(challenge.type);
      
      // Get the current season's modifier for this challenge type
      const currentSeason = cardStore.getSeasonById(gameStore.currentSeason);
      if (!currentSeason) {
        gameStore.addToGameLog('Error: Current season not found.');
        return;
      }
      
      // Convert effect to number if it's a string
      const challengeEffect = currentSeason.effects?.find(e => 
        getStandardizedChallengeType(e.name) === standardChallengeType);
      const effectValue = challengeEffect?.effect || "0";
      const seasonModifier = typeof effectValue === 'string' ? parseInt(effectValue, 10) : effectValue;
      
      // Calculate the total difficulty
      const totalDifficulty = challenge.difficulty + seasonModifier;
      
      // Simulate a dice roll (1-10)
      const roll = Math.floor(Math.random() * 10) + 1;
      
      // Check if the player has any animal companions that can help
      const animalBonus = playerStore.animalCompanions.reduce((bonus, companionId) => {
        const companion = cardStore.getAnimalCompanionById(companionId);
        if (companion && companion.ability && companion.ability.name && 
            !companion.ability.name.includes('Wary')) {
          // Since makeCompanionWary doesn't exist, we'll just log it
          console.log(`Animal companion ${companion.name} is helping with the challenge`);
          return bonus + 1;
        }
        return bonus;
      }, 0);
      
      // Check if the player has any crafted items that can help
      const itemBonus = playerStore.craftedItems.reduce((bonus, itemId) => {
        const item = cardStore.getCraftedItemById(itemId);
        // Use our utility function to check if ability matches challenge
        if (item && item.ability && abilityMatchesChallenge(item.ability, challenge.type)) {
          console.log(`Crafted item ${item.name} is helping with the challenge`);
          return bonus + 1;
        }
        return bonus;
      }, 0);
      
      // Calculate the total roll
      const totalRoll = roll + animalBonus + itemBonus;
      
      // Determine the outcome
      if (totalRoll >= totalDifficulty) {
        // Success
        gameStore.addToGameLog(`Challenge success! You rolled ${roll} + ${animalBonus} (animal) + ${itemBonus} (items) = ${totalRoll} vs difficulty ${totalDifficulty}.`);
        playerStore.gainExperience(1);
        challengeResolved.value = true;
        
        // Move to the next phase
        gameStore.advancePhase();
      } else {
        // Failure
        gameStore.addToGameLog(`Challenge failed! You rolled ${roll} + ${animalBonus} (animal) + ${itemBonus} (items) = ${totalRoll} vs difficulty ${totalDifficulty}.`);
        
        // Take damage (adjustHealth doesn't exist, use console.log instead)
        console.log('Player takes 1 damage from failed challenge');
        
        // Give the player another chance
        gameStore.addToGameLog('You can try again or use different resources to overcome this challenge.');
      }
    };
    
    const gatherResources = () => {
      if (!landscape.value || !landscape.value.availableResources?.length) return;
      
      // Randomly select a resource from the available ones
      const availableResources = landscape.value.availableResources;
      const randomIndex = Math.floor(Math.random() * availableResources.length);
      const resourceId = availableResources[randomIndex];
      
      // Verify resource exists before attempting to add it
      const resource = cardStore.getResourceById(resourceId);
      if (!resource) {
        gameStore.addToGameLog(`Error: Resource with ID ${resourceId} not found.`);
        return;
      }
      
      // Add the resource to the player's inventory
      if (playerStore.addResource(resourceId)) {
        gameStore.addToGameLog(`You gathered ${resource.name}.`);
      } else {
        gameStore.addToGameLog('Your resource bag is full.');
      }
      
      // Move to the next phase
      gameStore.advancePhase();
    };
    
    const continueJourney = () => {
      // Move to the next landscape
      gameStore.advanceJourney(1);
      
      // Reset challenge state for the next landscape
      challengeResolved.value = false;
    };
    
    return {
      landscape,
      currentPhase,
      challengeResolved,
      canGatherResources,
      getResourceName,
      attemptChallenge,
      gatherResources,
      continueJourney,
      CardType,
      GamePhase,
      ChallengeType
    };
  }
});
</script>

<style lang="scss" scoped>
@import '@/assets/scss/variables';

.landscape-description {
  font-style: italic;
  margin-bottom: $spacing-md;
}

.landscape-challenge {
  background-color: rgba(0, 0, 0, 0.05);
  padding: $spacing-md;
  border-radius: $border-radius-md;
  margin-bottom: $spacing-md;
}

.landscape-actions {
  display: flex;
  gap: $spacing-md;
  justify-content: center;
}

.resource-list {
  display: flex;
  flex-wrap: wrap;
  gap: $spacing-sm;
  list-style: none;
  padding: 0;
  margin: $spacing-sm 0;
}
</style>
