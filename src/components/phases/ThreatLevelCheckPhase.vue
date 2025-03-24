<template>
  <div class="threat-level-check-phase">
    <h2 class="phase-title">THREAT LEVEL CHECK</h2>
    <div class="phase-description">
      <p>The ancient whispers reveal the veil of danger around you...</p>
    </div>
    
    <!-- Threat assessment and action container side by side -->
    <div class="threat-action-row">
      <!-- Threat information card with narrative style -->
      <div class="threat-assessment">
        <GameCard 
          :title="getThreatLevelTitle()" 
          cardType="WARNING"
          @click="advancePhase"
        >
          <div class="threat-content narrative-style">
            <p v-if="gameStore.threatTokens === 0">
              The winds are calm and the spirits silent. Your path seems clear of immediate dangers, though a wise traveler remains ever vigilant.
            </p>
            
            <template v-else>
              <p v-if="currentLandscape">
                <span v-if="gameStore.threatTokens >= 7" class="threat-warning">
                  The ancient stones tremble with warning. A powerful entity known as <strong>{{ currentLandscape.challenge }}</strong> haunts this place, its presence unmistakable to one with your senses.
                </span>
                <span v-else-if="gameStore.threatTokens >= 3" class="threat-warning">
                  The air grows thick with foreboding. Your intuition whispers of <strong>{{ currentLandscape.challengeType }}</strong> trials ahead, though their exact nature remains shrouded.
                </span>
                <span v-else class="threat-warning">
                  A subtle unease settles upon your shoulders. Something lurks beyond your perception, like shadows glimpsed from the corner of your eye.
                </span>
              </p>
              
              <p v-if="gameStore.threatTokens >= 9 && currentLandscape">
                Ancient symbols flash across your vision, revealing this as a formidable trial of strength <strong>{{ currentLandscape.difficulty }}</strong>. It will test your {{ currentLandscape.challengeType }} resolve to its very limits.
              </p>
              
              <p v-if="gameStore.threatTokens >= 5">
                The pattern of leaves scattered by the wind forms unusual signs. The path ahead may hold unexpected twists of fate that no seer could foretell.
              </p>
              
              <p v-if="gameStore.threatTokens >= 10" class="otherworldly-warning">
                The borders between worlds fray like worn cloth! Creatures of mist and shadow gather just beyond sight, waiting for the moment when the veil parts completely!
              </p>
            </template>
          </div>
        </GameCard>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useLogStore } from '@/stores/logStore';
import { useCardStore } from '@/stores/cardStore';
import { useServices } from '@/composables/useServices';
import GameCard from '@/components/GameCard.vue';

const gameStore = useGameStore();
const logStore = useLogStore();
const cardStore = useCardStore();
const { phaseService, threatService } = useServices();

// Get current landscape information for threat assessment
const currentLandscape = computed(() => {
  return cardStore.getLandscapeById(gameStore.currentLandscapeId);
});

// Get appropriate title based on threat level
const getThreatLevelTitle = () => {
  if (gameStore.threatTokens >= 10) return 'Otherworldly Presences';
  if (gameStore.threatTokens >= 7) return 'Dire Omens';
  if (gameStore.threatTokens >= 4) return 'Looming Shadows';
  if (gameStore.threatTokens >= 1) return 'Whispered Warnings';
  return 'Clear Skies';
};

// Handle threat check
const handleThreatCheck = () => {
  // Calculate challenge difficulty modifier
  const threatModifier = Math.floor(gameStore.threatTokens / 3);
  if (threatModifier > 0) {
    gameStore.addToGameLog(`Challenge difficulty increased by +${threatModifier} due to threat level.`, false);
  }
  
  // Log threat details based on current landscape
  if (currentLandscape.value) {
    if (gameStore.threatTokens >= 3 && gameStore.threatTokens < 7) {
      gameStore.addToGameLog(`Your senses warn of a ${currentLandscape.value.challengeType} threat in this area.`, false);
    } else if (gameStore.threatTokens >= 7) {
      gameStore.addToGameLog(`Visions clearly reveal "${currentLandscape.value.challenge}" present at the ${currentLandscape.value.name}.`, true);
      
      if (gameStore.threatTokens >= 9) {
        gameStore.addToGameLog(`The ${currentLandscape.value.challenge} is a difficulty ${currentLandscape.value.difficulty} trial that will test your ${currentLandscape.value.challengeType} abilities.`, false);
      }
    }
  }

  // Check for random event trigger
  if (gameStore.threatTokens >= 5) {
    gameStore.addToGameLog(`The elevated threat level brings uncertainty. Be prepared for a random event.`, false);
  }

  // Check for otherworldly manifestation
  if (gameStore.threatTokens >= 10) {
    gameStore.addToGameLog(`The veil between worlds grows thin! An Otherworldly Manifestation is imminent!`, true);
  }
};

// Advance to the next phase
const advancePhase = () => {
  // Perform threat check
  handleThreatCheck();
  // Advance to next phase
  phaseService.advancePhase();
};
</script>

<style lang="scss" scoped>
.threat-level-check-phase {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
}

.phase-title {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #5a3e2b;
}

.phase-description {
  text-align: center;
  margin-bottom: 1.5rem;
}

.threat-action-row {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
}

.threat-assessment {
  flex: 1;
}

.threat-content {
  font-size: 0.9rem;
  padding: 15px;
  line-height: 1.4;
  
  p {
    margin-bottom: 10px;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
}

.threat-warning {
  color: #794516;
  font-size: 0.85rem;
}

.otherworldly-warning {
  color: #a43434;
  font-weight: bold;
  font-size: 0.85rem;
}

.highlight {
  color: #6b4226;
  font-weight: bold;
}

.narrative-style {
  font-size: 0.9rem;
  padding: 10px;
  line-height: 1.4;
}
</style>
