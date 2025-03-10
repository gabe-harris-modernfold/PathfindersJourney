# Pathfinder's Journey: The Celtic Realm
## Comprehensive 10-Step Vue.js Development Plan

---

## Overview

This document outlines a detailed 10-step plan for developing "Pathfinder's Journey: The Celtic Realm" as a Vue.js application. Each step includes specific technical requirements, implementation details, and deliverables to ensure systematic progress.

---

## Technical Stack

- **Frontend Framework**: Vue 3.4+ with Composition API
- **State Management**: Pinia 2.x
- **Build Tool**: Vite 5.x
- **Type System**: TypeScript 5.x
- **CSS Preprocessor**: SCSS with modules
- **Testing Framework**: Vitest for unit testing, Cypress for E2E
- **Code Quality**: ESLint + Prettier

---

## Step 1: Project Foundation & Core Architecture

### Technical Requirements
- Establish project architecture with proper folder structure
- Configure TypeScript with strict type checking
- Set up Pinia stores with modular architecture
- Create foundational UI components with SCSS variables

### Implementation Details

#### Project Initialization
```bash
# Command line instructions
npm create vite@latest pathfinders-journey -- --template vue-ts
cd pathfinders-journey
npm install pinia vue-router sass
npm install -D vitest @vitejs/plugin-vue-jsx @vue/test-utils cypress
```

#### Folder Structure
```
pathfinders-journey/
├── public/
│   └── assets/
│       ├── fonts/
│       └── icons/
├── src/
│   ├── assets/
│   │   └── scss/
│   │       ├── _variables.scss
│   │       ├── _typography.scss
│   │       └── _animations.scss
│   ├── components/
│   │   ├── core/   # Base components
│   │   ├── game/   # Game-specific components
│   │   └── layout/ # Layout components
│   ├── composables/
│   │   └── useGameState.ts
│   ├── models/
│   │   ├── types/
│   │   │   ├── cards.ts
│   │   │   ├── game.ts
│   │   │   └── player.ts
│   │   └── enums/
│   │       ├── cardTypes.ts
│   │       ├── phases.ts
│   │       └── seasons.ts
│   ├── stores/
│   │   ├── gameStore.ts
│   │   ├── playerStore.ts
│   │   ├── cardStore.ts
│   │   └── index.ts
│   ├── views/
│   │   ├── GameSetupView.vue
│   │   └── GameBoardView.vue
│   ├── router/
│   │   └── index.ts
│   ├── App.vue
│   └── main.ts
├── tsconfig.json
├── vite.config.ts
└── package.json
```

#### Core Type Definitions
Define foundational interfaces and enums in `src/models/`:

**Game Phases**
```typescript
// src/models/enums/phases.ts
export enum GamePhase {
  SETUP = 'setup',
  SEASONAL_ASSESSMENT = 'seasonalAssessment',
  THREAT_CHECK = 'threatCheck',
  LANDSCAPE_CHALLENGE = 'landscapeChallenge',
  CHALLENGE_RESOLUTION = 'challengeResolution',
  RESOURCE_MANAGEMENT = 'resourceManagement',
  ANIMAL_COMPANION = 'animalCompanion',
  CRAFTING = 'crafting',
  JOURNEY_PROGRESSION = 'journeyProgression',
  GAME_OVER = 'gameOver'
}
```

**Card Types**
```typescript
// src/models/enums/cardTypes.ts
export enum CardType {
  LANDSCAPE = 'landscape',
  ANIMAL_COMPANION = 'animalCompanion',
  RESOURCE = 'resource',
  CRAFTED_ITEM = 'craftedItem',
  SEASON = 'season',
  CHARACTER = 'character'
}

export enum ChallengeType {
  PHYSICAL = 'physical',
  MENTAL = 'mental',
  SOCIAL = 'social',
  SPIRITUAL = 'spiritual'
}
```

#### Store Architecture
Create modular Pinia stores:

```typescript
// src/stores/gameStore.ts (structure only)
interface GameState {
  phase: GamePhase;
  turn: number;
  season: Season;
  threatTokens: number;
  blessingTokens: number;
  currentLandscapeId: string | null;
  visitedLandscapes: string[];
  seasonalWheel: {
    position: number;
    quests: { id: string; completed: boolean }[];
  };
  victoryConditions: {
    journeyCompleted: boolean;
    balanceMaintained: boolean;
    knowledgeAcquired: boolean;
    bondsFormed: boolean;
    questFulfilled: boolean;
  };
}
```

### Deliverables
- Configured Vue 3 project with TypeScript, Vite, and Pinia
- Complete folder structure with placeholders for all major components
- Core type definitions for game entities
- Basic SCSS design system with variables and mixins
- Initial Pinia store structure (unimplemented)
- Project README with setup instructions

---

## Step 2: Data Modeling & Card System

### Technical Requirements
- Implement comprehensive type definitions for all game entities
- Create card data structure with type safety
- Build initial card components with text-only representation
- Set up card repository system for data access

### Implementation Details

#### Core Data Models
Implement detailed interfaces for all game entities:

```typescript
// src/models/types/cards.ts
interface BaseCard {
  id: string;
  type: CardType;
  name: string;
  description?: string;
}

interface LandscapeCard extends BaseCard {
  type: CardType.LANDSCAPE;
  challenge: {
    type: ChallengeType;
    name: string;
    difficulty: number;
    description: string;
  };
  availableResources: string[]; // Resource IDs
  imagePlaceholder?: string; // For future image integration
}

// Similar interfaces for other card types
```

#### Card Repository
Implement a data service for managing cards:

```typescript
// src/services/cardRepository.ts (structure)
class CardRepository {
  // Internal storage
  private landscapes: Map<string, LandscapeCard>;
  private companions: Map<string, AnimalCompanionCard>;
  private resources: Map<string, ResourceCard>;
  private craftedItems: Map<string, CraftedItemCard>;
  private seasons: Map<string, SeasonCard>;
  private characters: Map<string, CharacterCard>;

  // Methods for accessing cards
  getLandscapeById(id: string): LandscapeCard | undefined;
  getCompanionById(id: string): AnimalCompanionCard | undefined;
  // ...other getters

  // Methods for filtering cards
  getLandscapesByChallenge(type: ChallengeType): LandscapeCard[];
  getResourcesByType(type: string): ResourceCard[];
  // ...other filters

  // Card collection management
  getAllLandscapeCards(): LandscapeCard[];
  // ...other collection getters
}
```

#### Card Components
Create base components for cards:

```vue
<!-- src/components/game/BaseCard.vue (structure) -->
<script setup lang="ts">
import { computed } from 'vue';
import type { BaseCard } from '@/models/types/cards';

const props = defineProps<{
  card: BaseCard;
  selected?: boolean;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: 'click', card: BaseCard): void;
}>();

const cardClasses = computed(() => ({
  'card': true,
  [`card--${props.card.type.toLowerCase()}`]: true,
  'card--selected': props.selected,
  'card--disabled': props.disabled
}));
</script>

<template>
  <div :class="cardClasses" @click="emit('click', card)">
    <div class="card__header">
      <h3 class="card__title">{{ card.name }}</h3>
    </div>
    <div class="card__content">
      <slot></slot>
    </div>
    <div class="card__footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>
```

### Deliverables
- Complete type definitions for all game entities
- Card repository with access methods and filtering
- Base card component with type-specific variations
- Static card data for initial game setup
- Card styling with text-first approach (placeholder for future images)

---

## Step 3: Game State Management

### Technical Requirements
- Implement core Pinia stores with proper TypeScript types
- Create state transitions system with validation
- Build game initialization flow
- Develop save/load mechanism for game state

### Implementation Details

#### Pinia Store Implementation
Implement the core game stores:

**Game Store**
Responsible for game flow, phases, and overall state:

```typescript
// src/stores/gameStore.ts (structure)
export const useGameStore = defineStore('game', {
  state: (): GameState => ({
    phase: GamePhase.SETUP,
    turn: 0,
    season: Season.SAMHAIN,
    threatTokens: 0,
    blessingTokens: 1,
    currentLandscapeId: null,
    visitedLandscapes: [],
    seasonalWheel: {
      position: 0,
      quests: [
        { id: 'samhain', completed: false },
        { id: 'winter', completed: false },
        { id: 'imbolc', completed: false },
        { id: 'beltane', completed: false },
        { id: 'lughnasadh', completed: false }
      ]
    },
    victoryConditions: {
      journeyCompleted: false,
      balanceMaintained: false,
      knowledgeAcquired: false,
      bondsFormed: false,
      questFulfilled: false
    }
  }),
  
  getters: {
    // Calculate derived state
    threatLevel: (state) => Math.floor(state.threatTokens / 3),
    seasonalEffects: (state) => SEASONAL_EFFECTS[state.season],
    isVictory: (state) => Object.values(state.victoryConditions).every(Boolean),
  },
  
  actions: {
    // Phase transitions
    transitionToPhase(newPhase: GamePhase): boolean,
    
    // Game initialization
    startGame(characterId: string): void,
    
    // Turn progression
    advanceTurn(): void,
    
    // Season management
    checkSeasonTransition(): void,
    
    // Victory conditions
    checkVictoryConditions(): void,
    
    // State persistence
    saveGame(): GameSaveData,
    loadGame(saveData: GameSaveData): void
  }
});
```

**Player Store**
Manages character state, resources, health, etc.:

```typescript
// src/stores/playerStore.ts (structure)
export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    characterId: null,
    health: 0,
    maxHealth: 0,
    resourceCapacity: 0,
    resources: [],
    animalCompanions: [],
    craftedItems: [],
    experience: 0,
    abilities: []
  }),
  
  getters: {
    character: (state) => state.characterId ? getCharacterById(state.characterId) : null,
    resourceCount: (state) => state.resources.length,
    isOverCapacity: (state) => state.resources.length > state.resourceCapacity,
    companionCount: (state) => state.animalCompanions.length,
  },
  
  actions: {
    initializeCharacter(characterId: string): void,
    modifyHealth(amount: number): void,
    addResource(resourceId: string): boolean,
    removeResource(resourceId: string): boolean,
    addCompanion(companionId: string): void,
    makeCompanionWary(companionId: string): void,
    addCraftedItem(itemId: string): void,
    useCraftedItem(itemId: string): void,
    gainExperience(amount: number): void
  }
});
```

**Card Store**
Manages the card decks, active cards, and discard piles:

```typescript
// src/stores/cardStore.ts (structure)
export const useCardStore = defineStore('cards', {
  state: (): CardState => ({
    decks: {
      landscape: [],
      animalCompanion: [],
      resource: [],
      craftedItem: [],
      season: []
    },
    active: {
      landscape: [],
      animalCompanion: [],
      resource: [],
      craftedItem: [],
      season: []
    },
    discard: {
      landscape: [],
      animalCompanion: [],
      resource: [],
      craftedItem: [],
      season: []
    }
  }),
  
  getters: {
    activeLandscape: (state) => {
      const gameStore = useGameStore();
      return state.active.landscape.find(
        card => card.id === gameStore.currentLandscapeId
      );
    },
    // Other getters for active cards and collections
  },
  
  actions: {
    initializeDecks(): void,
    shuffleDeck(deckType: keyof typeof CardType): void,
    drawCard(deckType: keyof typeof CardType): BaseCard | null,
    discardCard(card: BaseCard): void,
    activateCard(card: BaseCard): void,
    revealLandscape(id: string): LandscapeCard | null
  }
});
```

#### State Persistence
Implement save and load functionality:

```typescript
// src/services/saveManager.ts (structure)
class SaveManager {
  // Save game state to localStorage
  saveGame(): string {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    const cardStore = useCardStore();
    
    const saveData = {
      version: '1.0.0',
      timestamp: Date.now(),
      game: gameStore.$state,
      player: playerStore.$state,
      cards: cardStore.$state
    };
    
    const saveString = JSON.stringify(saveData);
    localStorage.setItem('pathfindersJourney_save', saveString);
    return saveString;
  }
  
  // Load game state from localStorage
  loadGame(): boolean {
    const saveString = localStorage.getItem('pathfindersJourney_save');
    if (!saveString) return false;
    
    try {
      const saveData = JSON.parse(saveString);
      
      // Version check and migration if needed
      if (saveData.version !== '1.0.0') {
        this.migrateSaveData(saveData);
      }
      
      const gameStore = useGameStore();
      const playerStore = usePlayerStore();
      const cardStore = useCardStore();
      
      // Reset stores to saved state
      gameStore.$state = saveData.game;
      playerStore.$state = saveData.player;
      cardStore.$state = saveData.cards;
      
      return true;
    } catch (error) {
      console.error('Failed to load save:', error);
      return false;
    }
  }
  
  // Handle save data migration between versions
  private migrateSaveData(saveData: any): void {
    // Implementation for future versions
  }
}
```

### Deliverables
- Fully implemented Pinia stores with TypeScript support
- Game state transition system with validation
- Player state management with character attributes
- Card state management with deck operations
- Save/load functionality with localStorage persistence
- Unit tests for core store functionality

---

## Step 4: Game Board & UI Components

### Technical Requirements
- Create responsive game board layout
- Build UI components for game elements
- Implement seasonal wheel visualization
- Develop player dashboard with status indicators
- Create card display areas with proper layout

### Implementation Details

#### Game Board Layout
Design the main game board using CSS Grid for responsive layout:

```vue
<!-- src/views/GameBoardView.vue (structure) -->
<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import SeasonalWheel from '@/components/game/SeasonalWheel.vue';
import JourneyPath from '@/components/game/JourneyPath.vue';
import PlayerDashboard from '@/components/game/PlayerDashboard.vue';
import ActionPanel from '@/components/game/ActionPanel.vue';
import StatusArea from '@/components/game/StatusArea.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();

// Reactive properties based on stores
const currentPhase = computed(() => gameStore.phase);
const currentSeason = computed(() => gameStore.season);
const threatLevel = computed(() => gameStore.threatLevel);
</script>

<template>
  <div class="game-board">
    <div class="game-board__top">
      <SeasonalWheel 
        :season="currentSeason" 
        :quests="gameStore.seasonalWheel.quests"
      />
      <StatusArea 
        :threat-tokens="gameStore.threatTokens"
        :blessing-tokens="gameStore.blessingTokens"
        :turn="gameStore.turn"
      />
    </div>
    
    <div class="game-board__center">
      <JourneyPath 
        :current-landscape-id="gameStore.currentLandscapeId"
        :visited-landscapes="gameStore.visitedLandscapes"
      />
    </div>
    
    <div class="game-board__bottom">
      <PlayerDashboard 
        :character="playerStore.character"
        :health="playerStore.health"
        :max-health="playerStore.maxHealth"
        :resources="playerStore.resources"
        :resource-capacity="playerStore.resourceCapacity"
        :companions="playerStore.animalCompanions"
        :crafted-items="playerStore.craftedItems"
      />
      <ActionPanel :phase="currentPhase" />
    </div>
  </div>
</template>

<style lang="scss">
.game-board {
  display: grid;
  grid-template-rows: auto 1fr auto;
  height: 100vh;
  overflow: hidden;
  
  &__top {
    display: grid;
    grid-template-columns: 1fr auto;
    gap: 1rem;
    padding: 1rem;
  }
  
  &__center {
    overflow-y: auto;
    padding: 1rem;
  }
  
  &__bottom {
    display: grid;
    grid-template-columns: 3fr 1fr;
    gap: 1rem;
    padding: 1rem;
  }
}

@media (max-width: 768px) {
  .game-board {
    &__top,
    &__bottom {
      grid-template-columns: 1fr;
    }
  }
}
</style>
```

#### Seasonal Wheel Component
Create an interactive visualization of the seasonal cycle:

```vue
<!-- src/components/game/SeasonalWheel.vue (structure) -->
<script setup lang="ts">
import { computed } from 'vue';
import { Season } from '@/models/enums/seasons';

const props = defineProps<{
  season: Season;
  quests: { id: string; completed: boolean }[];
}>();

const seasonIndex = computed(() => {
  const seasonMap = {
    [Season.SAMHAIN]: 0,
    [Season.WINTERS_DEPTH]: 1,
    [Season.IMBOLC]: 2,
    [Season.BELTANE]: 3,
    [Season.LUGHNASADH]: 4
  };
  return seasonMap[props.season] || 0;
});

const rotationDegrees = computed(() => seasonIndex.value * 72);
</script>

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
          <div class="seasonal-wheel__quest" :class="{ 'completed': quests[0].completed }">
            <span>Quest</span>
          </div>
        </div>
        <!-- Repeat for other seasons -->
      </div>
      
      <div class="seasonal-wheel__pointer"></div>
    </div>
    
    <div class="seasonal-wheel__info">
      <h3>{{ season }}</h3>
      <div class="seasonal-wheel__effects">
        <!-- Season effects displayed here -->
      </div>
    </div>
  </div>
</template>

<style lang="scss">
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
    border: 2px solid var(--color-border);
    transition: transform 0.5s ease-in-out;
  }
  
  &__section {
    position: absolute;
    width: 50%;
    height: 50%;
    transform-origin: bottom left;
    
    &[data-season="samhain"] {
      transform: rotate(0deg);
    }
    
    // Position other sections with appropriate rotation
  }
  
  &__pointer {
    position: absolute;
    top: 0;
    left: 50%;
    width: 2px;
    height: 20px;
    background-color: var(--color-accent);
    transform: translateX(-50%);
  }
}
</style>
```

#### Player Dashboard
Create a comprehensive player status display:

```vue
<!-- src/components/game/PlayerDashboard.vue (structure) -->
<script setup lang="ts">
import { computed } from 'vue';
import type { Character } from '@/models/types/character';
import type { Resource } from '@/models/types/cards';
import ResourceBadge from '@/components/game/ResourceBadge.vue';
import HealthMeter from '@/components/ui/HealthMeter.vue';
import CompanionsList from '@/components/game/CompanionsList.vue';
import CraftedItemsList from '@/components/game/CraftedItemsList.vue';

// Props with TypeScript types
const props = defineProps<{
  character: Character | null;
  health: number;
  maxHealth: number;
  resources: Resource[];
  resourceCapacity: number;
  companions: string[];
  craftedItems: string[];
}>();

// Computed properties
const isOverCapacity = computed(() => 
  props.resources.length > props.resourceCapacity
);

const healthPercentage = computed(() => 
  (props.health / props.maxHealth) * 100
);

const healthStatus = computed(() => {
  if (healthPercentage.value > 75) return 'good';
  if (healthPercentage.value > 30) return 'warning';
  return 'danger';
});

const characterName = computed(() => 
  props.character?.name || 'No Character Selected'
);
</script>

<template>
  <div class="player-dashboard">
    <div class="player-dashboard__header">
      <h2>{{ characterName }}</h2>
      <HealthMeter 
        :value="health" 
        :max="maxHealth"
        :status="healthStatus"
      />
    </div>
    
    <div class="player-dashboard__resources">
      <h3>Resources ({{ resources.length }}/{{ resourceCapacity }})</h3>
      <div 
        class="resource-list"
        :class="{ 'resource-list--over-capacity': isOverCapacity }"
      >
        <ResourceBadge 
          v-for="resource in resources" 
          :key="resource.id"
          :resource="resource"
        />
      </div>
    </div>
    
    <div class="player-dashboard__companions">
      <h3>Animal Companions</h3>
      <CompanionsList :companions="companions" />
    </div>
    
    <div class="player-dashboard__items">
      <h3>Crafted Items</h3>
      <CraftedItemsList :items="craftedItems" />
    </div>
  </div>
</template>
```

### Deliverables
- Complete game board layout with responsive design
- Seasonal wheel visualization with rotation animation
- Player dashboard with health, resources, and companions
- Journey path visualization with current location indicator
- Action panel for phase-specific controls
- Status area for game state indicators
- Comprehensive SCSS styling system

---

## Step 5: Challenge System Implementation

### Technical Requirements
- Build dice rolling mechanism with proper randomization
- Implement challenge difficulty calculator
- Create challenge resolution pipeline
- Develop success/failure outcome handler
- Build challenge history tracker

### Implementation Details

#### Dice Rolling Service
Create a service for handling dice rolls with proper randomization:

```typescript
// src/services/diceService.ts
class DiceService {
  // Roll a specific die (d4, d6, d8, etc.)
  rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }
  
  // Roll the game's eight-sided die
  rollD8(): number {
    return this.rollDie(8);
  }
  
  // Roll with advantage (roll twice, take higher)
  rollWithAdvantage(sides: number): { rolls: number[], result: number } {
    const roll1 = this.rollDie(sides);
    const roll2 = this.rollDie(sides);
    return {
      rolls: [roll1, roll2],
      result: Math.max(roll1, roll2)
    };
  }
  
  // Roll with disadvantage (roll twice, take lower)
  rollWithDisadvantage(sides: number): { rolls: number[], result: number } {
    const roll1 = this.rollDie(sides);
    const roll2 = this.rollDie(sides);
    return {
      rolls: [roll1, roll2],
      result: Math.min(roll1, roll2)
    };
  }
  
  // For debug/test purposes, can force a specific roll result
  private _debugMode = false;
  private _forcedValue: number | null = null;
  
  setForcedRoll(value: number | null): void {
    this._debugMode = value !== null;
    this._forcedValue = value;
  }
}

export const diceService = new DiceService();
```

#### Challenge Resolution System
Build a comprehensive challenge resolution system:

```typescript
// src/services/challengeService.ts
class ChallengeService {
  // Calculate challenge difficulty based on multiple factors
  calculateDifficulty(challenge: Challenge): number {
    const gameStore = useGameStore();
    const baseDifficulty = challenge.difficulty;
    
    // Apply seasonal modifiers
    const seasonModifier = this.getSeasonalModifier(challenge.type, gameStore.season);
    
    // Apply threat level modifier
    const threatModifier = Math.floor(gameStore.threatTokens / 3);
    
    return baseDifficulty + seasonModifier + threatModifier;
  }
  
  // Calculate player's bonus for challenge
  calculatePlayerBonus(challenge: Challenge): number {
    const playerStore = usePlayerStore();
    
    // Character ability bonus
    let bonus = this.getCharacterBonus(playerStore.character, challenge.type);
    
    // Item bonuses
    bonus += this.getItemBonuses(playerStore.craftedItems, challenge.type);
    
    // Companion bonuses
    bonus += this.getCompanionBonuses(playerStore.animalCompanions, challenge.type);
    
    // Blessing tokens
    const gameStore = useGameStore();
    bonus += gameStore.blessingTokens;
    
    return bonus;
  }
  
  // Determine challenge outcome
  resolveChallenge(challenge: Challenge): ChallengeOutcome {
    const difficulty = this.calculateDifficulty(challenge);
    const playerBonus = this.calculatePlayerBonus(challenge);
    
    const diceRoll = diceService.rollD8();
    const total = diceRoll + playerBonus;
    
    // Record the challenge attempt
    this.recordChallengeAttempt({
      challengeType: challenge.type,
      difficulty,
      diceRoll,
      playerBonus,
      total
    });
    
    // Natural 8 always succeeds
    if (diceRoll === 8) {
      return {
        success: true,
        exceptional: true,
        roll: diceRoll,
        total,
        difficulty
      };
    }
    
    // Success: total >= difficulty
    if (total >= difficulty) {
      return {
        success: true,
        exceptional: total >= difficulty + 2,
        roll: diceRoll,
        total,
        difficulty
      };
    }
    
    // Partial success: total = difficulty - 1
    if (total === difficulty - 1) {
      return {
        success: 'partial',
        exceptional: false,
        roll: diceRoll,
        total,
        difficulty
      };
    }
    
    // Failure
    return {
      success: false,
      exceptional: total <= difficulty - 3,
      roll: diceRoll,
      total,
      difficulty
    };
  }
  
  // Apply challenge outcomes
  applyOutcome(outcome: ChallengeOutcome, challenge: Challenge): void {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    if (outcome.success === true) {
      // Full success
      if (outcome.exceptional) {
        // Exceptional success (e.g., gain blessing token)
        gameStore.blessingTokens++;
      }
      
      // Collect resources
      this.collectResources(2);
      
      // Advance to next landscape
      gameStore.moveToNextLandscape();
    } 
    else if (outcome.success === 'partial') {
      // Partial success
      this.collectResources(1);
      gameStore.moveToNextLandscape();
    } 
    else {
      // Failure
      this.applyFailureConsequences(challenge);
    }
  }
  
  // Apply consequences of challenge failure
  private applyFailureConsequences(challenge: Challenge): void {
    const gameStore = useGameStore();
    const playerStore = usePlayerStore();
    
    switch (challenge.type) {
      case ChallengeType.PHYSICAL:
        // Lose health (1-3 points)
        const healthLoss = Math.floor(Math.random() * 3) + 1;
        playerStore.modifyHealth(-healthLoss);
        break;
        
      case ChallengeType.MENTAL:
        // Add threat tokens (1-2)
        const threatGain = Math.floor(Math.random() * 2) + 1;
        gameStore.addThreatTokens(threatGain);
        break;
        
      case ChallengeType.SOCIAL:
        // Lose access to a resource type temporarily
        this.blockResourceType();
        break;
        
      case ChallengeType.SPIRITUAL:
        // Animal companions become wary
        playerStore.makeAllCompanionsWary();
        break;
    }
  }
  
  // Challenge history tracking
  private challengeHistory: ChallengeAttempt[] = [];
  
  recordChallengeAttempt(attempt: ChallengeAttempt): void {
    this.challengeHistory.push({
      ...attempt,
      timestamp: Date.now()
    });
    
    // Keep history at a reasonable size
    if (this.challengeHistory.length > 20) {
      this.challengeHistory.shift();
    }
  }
  
  getChallengeHistory(): ChallengeAttempt[] {
    return [...this.challengeHistory];
  }
  
  // Helper methods
  private getSeasonalModifier(challengeType: ChallengeType, season: Season): number;
  private getCharacterBonus(character: Character, challengeType: ChallengeType): number;
  private getItemBonuses(items: string[], challengeType: ChallengeType): number;
  private getCompanionBonuses(companions: string[], challengeType: ChallengeType): number;
  private collectResources(count: number): void;
  private blockResourceType(): void;
}

export const challengeService = new ChallengeService();
```

#### Challenge Resolution Component
Create a UI for challenge resolution:

```vue
<!-- src/components/game/ChallengeResolution.vue (structure) -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import { challengeService } from '@/services/challengeService';
import { diceService } from '@/services/diceService';
import DiceRoller from '@/components/game/DiceRoller.vue';
import ChallengeDetails from '@/components/game/ChallengeDetails.vue';
import OutcomeDisplay from '@/components/game/OutcomeDisplay.vue';

const gameStore = useGameStore();
const cardStore = useCardStore();

const challenge = computed(() => {
  const activeLandscape = cardStore.activeLandscape;
  return activeLandscape?.challenge;
});

const difficulty = computed(() => {
  if (!challenge.value) return 0;
  return challengeService.calculateDifficulty(challenge.value);
});

const playerBonus = computed(() => {
  if (!challenge.value) return 0;
  return challengeService.calculatePlayerBonus(challenge.value);
});

const isRolling = ref(false);
const outcomeResult = ref(null);

const startRoll = () => {
  if (!challenge.value) return;
  
  isRolling.value = true;
  
  // Simulate dice roll animation
  setTimeout(() => {
    const outcome = challengeService.resolveChallenge(challenge.value);
    outcomeResult.value = outcome;
    isRolling.value = false;
  }, 1500);
};

const applyOutcome = () => {
  if (!outcomeResult.value || !challenge.value) return;
  
  challengeService.applyOutcome(outcomeResult.value, challenge.value);
  gameStore.transitionToPhase(GamePhase.RESOURCE_MANAGEMENT);
};
</script>

<template>
  <div class="challenge-resolution">
    <ChallengeDetails 
      v-if="challenge"
      :challenge="challenge"
      :difficulty="difficulty"
      :player-bonus="playerBonus"
    />
    
    <div class="challenge-resolution__dice">
      <DiceRoller 
        :sides="8"
        :rolling="isRolling"
        :result="outcomeResult?.roll"
      />
    </div>
    
    <div class="challenge-resolution__controls">
      <button 
        class="button button--primary"
        :disabled="isRolling || outcomeResult"
        @click="startRoll"
      >
        Roll for Challenge
      </button>
    </div>
    
    <OutcomeDisplay 
      v-if="outcomeResult"
      :outcome="outcomeResult"
      :challenge="challenge"
    />
    
    <div class="challenge-resolution__next">
      <button 
        v-if="outcomeResult"
        class="button button--primary"
        @click="applyOutcome"
      >
        Continue
      </button>
    </div>
  </div>
</template>
```

### Deliverables
- Dice rolling service with proper randomization
- Challenge difficulty calculator with all modifiers
- Challenge resolution system with outcome determination
- Success/failure consequence handler
- Challenge history tracking system
- Challenge resolution UI with dice animation
- Unit tests for challenge resolution edge cases

---

## Step 6: Journey & Seasonal Systems

### Technical Requirements
- Implement journey path navigation with card revelation
- Build seasonal transition system with effects
- Create location-specific interaction system
- Develop seasonal quest tracking
- Implement journey progress visualization

### Implementation Details

#### Journey System
Create a service for managing the journey path:

```typescript
// src/services/journeyService.ts
class JourneyService {
  // Initialize journey path with 15 landscapes
  initializeJourney(): string[] {
    const cardRepository = new CardRepository();
    const allLandscapes = cardRepository.getAllLandscapeCards();
    
    // Shuffle landscapes
    const shuffled = [...allLandscapes].sort(() => 0.5 - Math.random());
    
    // Select 15 landscapes for the journey
    const journeyLandscapes = shuffled.slice(0, 15);
    
    // Return landscape IDs in journey order
    return journeyLandscapes.map(landscape => landscape.id);
  }
  
  // Get current location index in journey
  getCurrentLocationIndex(currentLandscapeId: string, journeyPath: string[]): number {
    return journeyPath.findIndex(id => id === currentLandscapeId);
  }
  
  // Get next location in journey
  getNextLocation(currentLandscapeId: string, journeyPath: string[]): string | null {
    const currentIndex = this.getCurrentLocationIndex(currentLandscapeId, journeyPath);
    
    if (currentIndex === -1 || currentIndex >= journeyPath.length - 1) {
      return null;
    }
    
    return journeyPath[currentIndex + 1];
  }
  
  // Move to next location
  moveToNextLocation(gameStore, cardStore): boolean {
    const nextLandscapeId = this.getNextLocation(
      gameStore.currentLandscapeId, 
      gameStore.journeyPath
    );
    
    if (!nextLandscapeId) {
      return false;
    }
    
    // Reveal landscape if needed
    cardStore.revealLandscape(nextLandscapeId);
    
    // Update current location
    gameStore.currentLandscapeId = nextLandscapeId;
    
    // Add to visited locations
    if (!gameStore.visitedLandscapes.includes(nextLandscapeId)) {
      gameStore.visitedLandscapes.push(nextLandscapeId);
    }
    
    // Check for seasonal boundary
    this.checkSeasonalBoundary(gameStore);
    
    return true;
  }
  
  // Check if current location is at a seasonal boundary
  checkSeasonalBoundary(gameStore): boolean {
    const locationIndex = this.getCurrentLocationIndex(
      gameStore.currentLandscapeId,
      gameStore.journeyPath
    );
    
    // Seasonal boundaries at indices 3, 6, 9, 12
    const newSeasonIndex = Math.floor(locationIndex / 3);
    
    if (newSeasonIndex !== gameStore.seasonalWheel.position) {
      gameStore.seasonalWheel.position = newSeasonIndex;
      this.updateSeason(gameStore);
      return true;
    }
    
    return false;
  }
  
  // Update current season based on wheel position
  updateSeason(gameStore): void {
    const seasonMap = [
      Season.SAMHAIN,
      Season.WINTERS_DEPTH,
      Season.IMBOLC,
      Season.BELTANE,
      Season.LUGHNASADH
    ];
    
    const newSeason = seasonMap[gameStore.seasonalWheel.position];
    
    if (newSeason && newSeason !== gameStore.season) {
      gameStore.season = newSeason;
      this.applySeasonalEffects(gameStore);
    }
  }
  
  // Apply effects when season changes
  applySeasonalEffects(gameStore, playerStore): void {
    // Clear previous seasonal effects
    this.clearSeasonalEffects();
    
    // Apply new seasonal effects
    switch (gameStore.season) {
      case Season.SAMHAIN:
        // Veil between worlds is thin, spiritual challenges harder
        // Ancestral guidance available
        break;
        
      case Season.WINTERS_DEPTH:
        // Harsh conditions make physical challenges harder
        // Clearer thinking in stillness
        break;
        
      case Season.IMBOLC:
        // Renewal energy makes healing more effective
        // New growth provides hope
        break;
        
      case Season.BELTANE:
        // Vibrant energy enhances crafting
        // Life force is strong
        playerStore.maxHealth++;
        break;
        
      case Season.LUGHNASADH:
        // Gathering time - collect more resources
        // Community support - better healing
        break;
    }
  }
  
  // Track seasonal quests
  activateSeasonalQuest(season: Season): SeasonalQuest {
    // Return the quest details for the specified season
  }
  
  completeSeasonalQuest(season: Season, gameStore): void {
    const questIndex = this.getSeasonalQuestIndex(season);
    if (questIndex >= 0) {
      gameStore.seasonalWheel.quests[questIndex].completed = true;
      this.applyQuestReward(season, gameStore);
    }
  }
  
  // Helper methods
  private clearSeasonalEffects(): void;
  private getSeasonalQuestIndex(season: Season): number;
  private applyQuestReward(season: Season, gameStore): void;
}

export const journeyService = new JourneyService();
```

#### Journey Path Component
Create a visual representation of the journey:

```vue
<!-- src/components/game/JourneyPath.vue (structure) -->
<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { useCardStore } from '@/stores/cardStore';
import LandscapeCard from '@/components/game/LandscapeCard.vue';

const props = defineProps<{
  currentLandscapeId: string | null;
  visitedLandscapes: string[];
}>();

const gameStore = useGameStore();
const cardStore = useCardStore();

const journeyPath = computed(() => gameStore.journeyPath);

const visibleLandscapes = computed(() => {
  return journeyPath.value.map(id => {
    const isVisited = props.visitedLandscapes.includes(id);
    const isCurrent = id === props.currentLandscapeId;
    
    // Only show details for visited or current locations
    const landscape = isVisited || isCurrent
      ? cardStore.getLandscapeById(id)
      : null;
    
    return {
      id,
      landscape,
      isVisited,
      isCurrent,
      isRevealed: !!landscape
    };
  });
});

const currentIndex = computed(() => {
  if (!props.currentLandscapeId) return -1;
  return journeyPath.value.findIndex(id => id === props.currentLandscapeId);
});

const journeyProgress = computed(() => {
  if (currentIndex.value < 0) return 0;
  return (currentIndex.value / (journeyPath.value.length - 1)) * 100;
});
</script>

<template>
  <div class="journey-path">
    <div class="journey-path__progress">
      <div 
        class="journey-path__progress-bar"
        :style="`width: ${journeyProgress}%`"
      ></div>
    </div>
    
    <div class="journey-path__locations">
      <div 
        v-for="(location, index) in visibleLandscapes"
        :key="location.id"
        class="journey-path__location"
        :class="{
          'journey-path__location--visited': location.isVisited,
          'journey-path__location--current': location.isCurrent,
          'journey-path__location--hidden': !location.isRevealed
        }"
      >
        <div class="journey-path__node"></div>
        
        <div v-if="location.isRevealed" class="journey-path__card">
          <LandscapeCard 
            v-if="location.landscape"
            :card="location.landscape"
            :is-current="location.isCurrent"
          />
          <div v-else class="journey-path__placeholder">
            Unknown Location
          </div>
        </div>
        
        <div v-else class="journey-path__placeholder">
          ?
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.journey-path {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  
  &__progress {
    height: 8px;
    background-color: var(--color-background-alt);
    border-radius: 4px;
    overflow: hidden;
  }
  
  &__progress-bar {
    height: 100%;
    background-color: var(--color-primary);
    transition: width 0.5s ease-in-out;
  }
  
  &__locations {
    display: flex;
    flex-wrap: nowrap;
    gap: 1rem;
    overflow-x: auto;
    padding: 1rem 0;
  }
  
  &__location {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    
    &--visited .journey-path__node {
      background-color: var(--color-success);
    }
    
    &--current .journey-path__node {
      background-color: var(--color-primary);
      transform: scale(1.5);
    }
    
    &--hidden .journey-path__placeholder {
      background-color: var(--color-background-alt);
      color: var(--color-text-muted);
    }
  }
  
  &__node {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background-color: var(--color-border);
    transition: transform 0.3s ease, background-color 0.3s ease;
  }
  
  &__card {
    width: 200px;
  }
  
  &__placeholder {
    width: 200px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background);
    border: 1px dashed var(--color-border);
    border-radius: 8px;
  }
}
</style>
```

### Deliverables
- Journey path initialization system
- Seasonal transition mechanism with effects
- Location-specific interaction system
- Journey path visualization with progress tracking
- Seasonal wheel component with rotation animation
- Seasonal quest tracking and rewards
- Journey navigation system with movement controls

---

## Step 7: Resource & Companion Management

### Technical Requirements
- Implement resource collection and management
- Build resource capacity system with limits
- Create animal companion bonding mechanics
- Develop companion loyalty and feeding system
- Implement resource type preferences for companions

### Implementation Details

#### Resource Management Service
Create a service for handling resources:

```typescript
// src/services/resourceService.ts
class ResourceService {
  // Check if player can collect a resource
  canCollectResource(resourceId: string, playerStore): boolean {
    // Check capacity limits
    if (playerStore.resources.length >= playerStore.resourceCapacity) {
      return false;
    }
    
    return true;
  }
  
  // Collect a specific resource
  collectResource(resourceId: string, playerStore, cardStore): boolean {
    if (!this.canCollectResource(resourceId, playerStore)) {
      return false;
    }
    
    // Get resource card
    const resource = cardStore.getResourceById(resourceId);
    if (!resource) {
      return false;
    }
    
    // Add to player resources
    playerStore.addResource(resourceId);
    return true;
  }
  
  // Collect random resources from current landscape
  collectLandscapeResources(count: number, gameStore, playerStore, cardStore): string[] {
    const landscape = cardStore.getLandscapeById(gameStore.currentLandscapeId);
    if (!landscape) {
      return [];
    }
    
    // Get available resources at this landscape
    const availableResources = landscape.availableResources;
    
    // Apply seasonal abundance/scarcity
    const seasonallyAdjusted = this.applySeasonalResourceEffects(
      availableResources,
      gameStore.season
    );
    
    // Randomly select resources up to count
    const shuffled = [...seasonallyAdjusted].sort(() => 0.5 - Math.random());
    const selectedResources = shuffled.slice(0, count);
    
    // Add to player inventory
    const collected = [];
    for (const resourceId of selectedResources) {
      if (this.collectResource(resourceId, playerStore, cardStore)) {
        collected.push(resourceId);
      }
    }
    
    return collected;
  }
  
  // Use a resource
  useResource(resourceId: string, playerStore): boolean {
    return playerStore.removeResource(resourceId);
  }
  
  // Get resources by type
  getResourcesByType(type: string, playerStore, cardStore): string[] {
    return playerStore.resources.filter(resourceId => {
      const resource = cardStore.getResourceById(resourceId);
      return resource && resource.type === type;
    });
  }
  
  // Apply seasonal abundance/scarcity effects
  applySeasonalResourceEffects(resourceIds: string[], season: Season): string[] {
    // Define seasonal abundance/scarcity
    const seasonalEffects = {
      [Season.SAMHAIN]: {
        abundant: ['barrow_dust', 'standing_stone_chips'],
        scarce: ['woven_reeds', 'rowan_wood']
      },
      [Season.WINTERS_DEPTH]: {
        abundant: ['forge_cinders', 'bog_iron'],
        scarce: ['sacred_water', 'horse_hair']
      },
      [Season.IMBOLC]: {
        abundant: ['silver_mistletoe', 'sacred_water'],
        scarce: ['barrow_dust', 'forge_cinders']
      },
      [Season.BELTANE]: {
        abundant: ['rowan_wood', 'oak_galls'],
        scarce: ['standing_stone_chips', 'amber_shards']
      },
      [Season.LUGHNASADH]: {
        abundant: ['horse_hair', 'woven_reeds', 'ogham_sticks'],
        scarce: ['bog_iron', 'silver_mistletoe']
      }
    };
    
    // If no seasonal effects for current season, return original
    if (!seasonalEffects[season]) {
      return resourceIds;
    }
    
    // Make abundant resources more likely, scarce less likely
    let adjusted = [...resourceIds];
    
    // Double abundant resources (increase probability)
    for (const resourceId of resourceIds) {
      if (seasonalEffects[season].abundant.includes(resourceId)) {
        adjusted.push(resourceId);
      }
    }
    
    // Remove scarce resources (decrease probability)
    adjusted = adjusted.filter(resourceId => 
      !seasonalEffects[season].scarce.includes(resourceId)
    );
    
    return adjusted;
  }
}

export const resourceService = new ResourceService();
```

#### Companion Management Service
Create a service for animal companions:

```typescript
// src/services/companionService.ts
class CompanionService {
  // Bond with a new companion
  bondWithCompanion(companionId: string, resourceId: string, playerStore, cardStore): boolean {
    // Check if player already has this companion
    if (playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Get companion card
    const companion = cardStore.getCompanionById(companionId);
    if (!companion) {
      return false;
    }
    
    // Check if resource is appropriate for bonding
    if (!this.isResourceSuitableForBonding(resourceId, companionId)) {
      return false;
    }
    
    // Use the resource
    const resourceUsed = resourceService.useResource(resourceId, playerStore);
    if (!resourceUsed) {
      return false;
    }
    
    // Add companion to player's collection
    playerStore.addCompanion(companionId);
    return true;
  }
  
  // Feed a companion
  feedCompanion(companionId: string, resourceId: string, playerStore, cardStore): boolean {
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return false;
    }
    
    // Use the resource
    const resourceUsed = resourceService.useResource(resourceId, playerStore);
    if (!resourceUsed) {
      return false;
    }
    
    // Restore companion loyalty
    playerStore.restoreCompanionLoyalty(companionId);
    
    // Return success
    return true;
  }
  
  // Use companion ability
  useCompanionAbility(companionId: string, playerStore, gameStore): {
    success: boolean;
    effect: string;
  } {
    // Check if player has this companion
    if (!playerStore.animalCompanions.includes(companionId)) {
      return { success: false, effect: 'Companion not found' };
    }
    
    // Check if companion is wary
    if (playerStore.isCompanionWary(companionId)) {
      return { success: false, effect: 'Companion is wary' };
    }
    
    // Make companion wary unless fed this turn
    if (!playerStore.isCompanionFed(companionId)) {
      playerStore.makeCompanionWary(companionId);
    }
    
    // Apply companion ability
    const companion = cardStore.getCompanionById(companionId);
    if (!companion) {
      return { success: false, effect: 'Companion not found in cards' };
    }
    
    // Apply seasonal bonus if applicable
    const effectBonus = this.getSeasonalCompanionBonus(companionId, gameStore.season);
    
    // Execute ability based on companion type
    switch (companionId) {
      case 'raven_scout':
        // Reveal next Landscape card
        const nextLandscapeId = journeyService.getNextLocation(
          gameStore.currentLandscapeId,
          gameStore.journeyPath
        );
        
        if (nextLandscapeId) {
          cardStore.revealLandscape(nextLandscapeId);
          return { 
            success: true, 
            effect: `Revealed next location: ${cardStore.getLandscapeById(nextLandscapeId)?.name}`
          };
        }
        return { success: false, effect: 'No next location to reveal' };
        
      case 'wolf_guardian':
        // +2 to combat-related challenges
        return { 
          success: true, 
          effect: `+${2 + effectBonus} to combat challenges` 
        };
      
      // More companion abilities...
    }
    
    return { success: false, effect: 'Unknown companion ability' };
  }
  
  // Check if resource is preferred by companion
  isResourcePreferredByCompanion(resourceId: string, companionId: string): boolean {
    const preferredResources = {
      'wolf_guardian': ['bog_iron'],
      'bear_protector': ['rowan_wood', 'woven_reeds'],
      'deer_guide': ['silver_mistletoe', 'oak_galls'],
      'raven_scout': ['barrow_dust', 'standing_stone_chips'],
      // Other companions...
    };
    
    return preferredResources[companionId]?.includes(resourceId) || false;
  }
  
  // Get seasonal bonus for companion
  getSeasonalCompanionBonus(companionId: string, season: Season): number {
    const seasonalAffinities = {
      [Season.SAMHAIN]: ['wolf_guardian', 'raven_scout', 'owl_sage'],
      [Season.WINTERS_DEPTH]: ['wolf_guardian', 'raven_scout', 'owl_sage'],
      [Season.IMBOLC]: ['hare_pathfinder', 'deer_guide', 'salmon_journeyer'],
      [Season.BELTANE]: ['fox_trickster', 'horse_carrier', 'bear_protector'],
      [Season.LUGHNASADH]: ['boar_digger']
    };
    
    return seasonalAffinities[season]?.includes(companionId) ? 1 : 0;
  }
  
  // Helper methods
  private isResourceSuitableForBonding(resourceId: string, companionId: string): boolean;
}

export const companionService = new CompanionService();
```

#### Resource Management Components
Create UI components for resource management:

```vue
<!-- src/components/game/ResourceManagement.vue (structure) -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { resourceService } from '@/services/resourceService';
import ResourceCard from '@/components/game/ResourceCard.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();

const collectableResources = ref([]);
const collectedResources = ref([]);

// Compute resources available at current location
const availableResources = computed(() => {
  const landscape = cardStore.getLandscapeById(gameStore.currentLandscapeId);
  if (!landscape) return [];
  
  return landscape.availableResources.map(id => {
    const resource = cardStore.getResourceById(id);
    return {
      id,
      name: resource?.name || 'Unknown Resource',
      description: resource?.description || '',
      seasonal: isSeasonalResource(id)
    };
  });
});

// Check if resource is affected by current season
const isSeasonalResource = (resourceId) => {
  const seasonalEffects = {
    [Season.SAMHAIN]: {
      abundant: ['barrow_dust', 'standing_stone_chips'],
      scarce: ['woven_reeds', 'rowan_wood']
    },
    // Other seasons...
  };
  
  return {
    abundant: seasonalEffects[gameStore.season]?.abundant.includes(resourceId) || false,
    scarce: seasonalEffects[gameStore.season]?.scarce.includes(resourceId) || false
  };
};

// Method to collect resources
const collectResources = () => {
  // Number of resources to collect based on challenge success
  const resourceCount = gameStore.lastChallengeOutcome?.success === true ? 2 : 1;
  
  // Apply Lughnasadh seasonal bonus
  const seasonalBonus = gameStore.season === Season.LUGHNASADH ? 1 : 0;
  
  // Collect resources
  const collected = resourceService.collectLandscapeResources(
    resourceCount + seasonalBonus,
    gameStore,
    playerStore,
    cardStore
  );
  
  collectedResources.value = collected;
  
  // If at capacity, show warning
  if (playerStore.isOverCapacity) {
    // Handle over capacity...
  }
  
  // Move to next phase
  gameStore.transitionToPhase(GamePhase.ANIMAL_COMPANION);
};
</script>

<template>
  <div class="resource-management">
    <h2>Resource Collection</h2>
    
    <div class="resource-management__available">
      <h3>Available Resources</h3>
      <p>You can collect resources from this location.</p>
      
      <div class="resource-grid">
        <div 
          v-for="resource in availableResources"
          :key="resource.id"
          class="resource-item"
          :class="{
            'resource-item--abundant': resource.seasonal.abundant,
            'resource-item--scarce': resource.seasonal.scarce
          }"
        >
          <ResourceCard :resource-id="resource.id" />
          
          <div class="resource-item__seasonal" v-if="resource.seasonal.abundant">
            Abundant
          </div>
          
          <div class="resource-item__seasonal" v-if="resource.seasonal.scarce">
            Scarce
          </div>
        </div>
      </div>
    </div>
    
    <div class="resource-management__inventory">
      <h3>Your Resources ({{ playerStore.resourceCount }}/{{ playerStore.resourceCapacity }})</h3>
      
      <div class="resource-grid">
        <div 
          v-for="resourceId in playerStore.resources"
          :key="resourceId"
          class="resource-item"
        >
          <ResourceCard :resource-id="resourceId" />
        </div>
      </div>
    </div>
    
    <div class="resource-management__actions">
      <button 
        class="button button--primary"
        @click="collectResources"
      >
        Collect Resources
      </button>
    </div>
  </div>
</template>
```

### Deliverables
- Resource collection and management system
- Resource capacity tracking with limits
- Seasonal effects on resource availability
- Animal companion bonding mechanics
- Companion loyalty and feeding system
- Companion ability usage with seasonal effects
- Resource management UI components
- Companion management UI components

---

## Step 8: Crafting System Implementation

### Technical Requirements
- Implement crafting recipe system with requirements
- Build crafting success probability calculator
- Create crafted item usage tracking
- Develop item drawback system
- Implement location bonuses for crafting

### Implementation Details

#### Crafting Service
Create a service for the crafting system:

```typescript
// src/services/craftingService.ts
class CraftingService {
  // Check if player can craft an item
  canCraftItem(itemId: string, playerStore, cardStore, gameStore): {
    canCraft: boolean;
    missingResources: string[];
    locationBonus: number;
  } {
    // Get crafted item
    const item = cardStore.getCraftedItemById(itemId);
    if (!item) {
      return {
        canCraft: false,
        missingResources: [],
        locationBonus: 0
      };
    }
    
    // Check if player has required resources
    const missingResources = [];
    for (const requiredResourceId of item.requiredResources) {
      if (!playerStore.hasResource(requiredResourceId)) {
        missingResources.push(requiredResourceId);
      }
    }
    
    // Calculate location bonus
    const locationBonus = this.getLocationCraftingBonus(
      itemId,
      gameStore.currentLandscapeId,
      cardStore
    );
    
    return {
      canCraft: missingResources.length === 0,
      missingResources,
      locationBonus
    };
  }
  
  // Craft an item
  craftItem(itemId: string, playerStore, cardStore, gameStore): {
    success: boolean;
    item?: CraftedItem;
    message: string;
  } {
    // Check if crafting is possible
    const { canCraft, missingResources, locationBonus } = this.canCraftItem(
      itemId,
      playerStore,
      cardStore,
      gameStore
    );
    
    if (!canCraft) {
      return {
        success: false,
        message: `Missing resources: ${missingResources.join(', ')}`
      };
    }
    
    // Get crafted item
    const item = cardStore.getCraftedItemById(itemId);
    if (!item) {
      return {
        success: false,
        message: 'Item not found'
      };
    }
    
    // Calculate crafting difficulty
    const difficulty = this.calculateCraftingDifficulty(item);
    
    // Calculate player bonus
    let craftingBonus = 0;
    
    // Character bonus
    if (playerStore.character?.type === 'iron_crafter') {
      craftingBonus += 2;
    }
    
    // Location bonus
    craftingBonus += locationBonus;
    
    // Beltane season bonus
    if (gameStore.season === Season.BELTANE) {
      craftingBonus += 1;
    }
    
    // Roll for success
    const diceRoll = diceService.rollD8();
    const total = diceRoll + craftingBonus;
    
    if (total >= difficulty) {
      // Crafting successful
      
      // Consume resources
      for (const resourceId of item.requiredResources) {
        playerStore.removeResource(resourceId);
      }
      
      // Calculate uses based on item and bonuses
      let uses = item.uses;
      
      // Iron Crafter bonus
      if (playerStore.character?.type === 'iron_crafter') {
        uses += 1;
      }
      
      // Beltane season bonus
      if (gameStore.season === Season.BELTANE) {
        uses += 1;
      }
      
      // Add item to inventory with use count
      const craftedItem = {
        ...item,
        remainingUses: uses
      };
      
      playerStore.addCraftedItem(craftedItem);
      
      return {
        success: true,
        item: craftedItem,
        message: `Successfully crafted ${item.name}`
      };
    } else {
      // Crafting failed
      return {
        success: false,
        message: `Failed to craft ${item.name} (rolled ${diceRoll}, needed ${difficulty - craftingBonus})`
      };
    }
  }
  
  // Use a crafted item
  useItem(itemId: string, playerStore, gameStore): {
    success: boolean;
    effect: string;
    drawback?: string;
  } {
    // Find item in inventory
    const item = playerStore.getCraftedItemById(itemId);
    if (!item || item.remainingUses <= 0) {
      return {
        success: false,
        effect: 'Item not found or no uses remaining'
      };
    }
    
    // Apply item effect
    const effect = this.applyItemEffect(item, playerStore, gameStore);
    
    // Apply item drawback
    const drawback = this.applyItemDrawback(item, playerStore, gameStore);
    
    // Reduce remaining uses
    playerStore.useItem(itemId);
    
    return {
      success: true,
      effect,
      drawback
    };
  }
  
  // Calculate crafting difficulty based on item complexity
  calculateCraftingDifficulty(item: CraftedItem): number {
    // Difficulty based on resource count
    const resourceCount = item.requiredResources.length;
    
    if (resourceCount <= 2) {
      return 5; // Simple item
    } else if (resourceCount <= 3) {
      return 6; // Complex item
    } else {
      return 7; // Legendary item
    }
  }
  
  // Get crafting bonus based on location
  getLocationCraftingBonus(itemId: string, locationId: string, cardStore): number {
    const item = cardStore.getCraftedItemById(itemId);
    const landscape = cardStore.getLandscapeById(locationId);
    
    if (!item || !landscape) {
      return 0;
    }
    
    // Location-specific bonuses
    const craftingBonuses = {
      'iron_forge_dell': (item) => {
        // Bonus for metal items (containing Bog Iron)
        return item.requiredResources.includes('bog_iron') ? 1 : 0;
      },
      'sacred_oak_grove': (item) => {
        // Bonus for wooden items (containing Rowan Wood)
        return item.requiredResources.includes('rowan_wood') ? 1 : 0;
      },
      'druids_sanctuary': (item) => {
        // Bonus for spiritual items (containing Standing Stone Chips)
        return item.requiredResources.includes('standing_stone_chips') ? 1 : 0;
      },
      'moonlit_loch': (item) => {
        // Bonus for water-based items (containing Sacred Water)
        return item.requiredResources.includes('sacred_water') ? 1 : 0;
      }
    };
    
    const bonusCalculator = craftingBonuses[locationId];
    return bonusCalculator ? bonusCalculator(item) : 0;
  }
  
  // Helper methods
  private applyItemEffect(item: CraftedItem, playerStore, gameStore): string;
  private applyItemDrawback(item: CraftedItem, playerStore, gameStore): string;
}

export const craftingService = new CraftingService();
```

#### Crafting Interface Component
Create a UI for the crafting system:

```vue
<!-- src/components/game/CraftingInterface.vue (structure) -->
<script setup lang="ts">
import { ref, computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useCardStore } from '@/stores/cardStore';
import { craftingService } from '@/services/craftingService';
import CraftedItemCard from '@/components/game/CraftedItemCard.vue';
import ResourceCard from '@/components/game/ResourceCard.vue';
import DiceRoller from '@/components/game/DiceRoller.vue';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const cardStore = useCardStore();

const selectedItemId = ref(null);
const craftingResult = ref(null);
const isRolling = ref(false);

// Get all available crafting recipes
const availableRecipes = computed(() => {
  return cardStore.getAllCraftedItems().map(item => {
    const craftCheck = craftingService.canCraftItem(
      item.id,
      playerStore,
      cardStore,
      gameStore
    );
    
    return {
      ...item,
      canCraft: craftCheck.canCraft,
      missingResources: craftCheck.missingResources,
      locationBonus: craftCheck.locationBonus
    };
  });
});

// Get crafting difficulty for selected item
const craftingDifficulty = computed(() => {
  if (!selectedItemId.value) return null;
  
  const item = cardStore.getCraftedItemById(selectedItemId.value);
  if (!item) return null;
  
  return craftingService.calculateCraftingDifficulty(item);
});

// Get player's crafting bonus
const craftingBonus = computed(() => {
  if (!selectedItemId.value) return 0;
  
  let bonus = 0;
  
  // Character bonus
  if (playerStore.character?.type === 'iron_crafter') {
    bonus += 2;
  }
  
  // Location bonus
  const locationBonus = craftingService.getLocationCraftingBonus(
    selectedItemId.value,
    gameStore.currentLandscapeId,
    cardStore
  );
  bonus += locationBonus;
  
  // Beltane season bonus
  if (gameStore.season === Season.BELTANE) {
    bonus += 1;
  }
  
  return bonus;
});

// Select an item for crafting
const selectItem = (itemId) => {
  selectedItemId.value = itemId;
  craftingResult.value = null;
};

// Attempt to craft the selected item
const craftItem = () => {
  if (!selectedItemId.value) return;
  
  isRolling.value = true;
  
  // Simulate dice roll animation
  setTimeout(() => {
    const result = craftingService.craftItem(
      selectedItemId.value,
      playerStore,
      cardStore,
      gameStore
    );
    
    craftingResult.value = result;
    isRolling.value = false;
  }, 1500);
};

// Continue to next phase
const continueToNextPhase = () => {
  gameStore.transitionToPhase(GamePhase.JOURNEY_PROGRESSION);
};
</script>

<template>
  <div class="crafting-interface">
    <h2>Crafting</h2>
    
    <div class="crafting-interface__recipes">
      <h3>Available Recipes</h3>
      
      <div class="recipe-grid">
        <div 
          v-for="recipe in availableRecipes"
          :key="recipe.id"
          class="recipe-item"
          :class="{
            'recipe-item--selected': selectedItemId === recipe.id,
            'recipe-item--available': recipe.canCraft,
            'recipe-item--unavailable': !recipe.canCraft
          }"
          @click="selectItem(recipe.id)"
        >
          <CraftedItemCard :item="recipe" />
          
          <div v-if="!recipe.canCraft" class="recipe-item__missing">
            Missing: {{ recipe.missingResources.length }} resources
          </div>
          
          <div v-if="recipe.locationBonus" class="recipe-item__bonus">
            Location bonus: +{{ recipe.locationBonus }}
          </div>
        </div>
      </div>
    </div>
    
    <div class="crafting-interface__details" v-if="selectedItemId">
      <h3>Crafting Details</h3>
      
      <div class="crafting-details">
        <div class="crafting-details__difficulty">
          <p>Difficulty: {{ craftingDifficulty }}</p>
          <p>Your bonus: +{{ craftingBonus }}</p>
          <p>Need to roll: {{ Math.max(1, craftingDifficulty - craftingBonus) }}+</p>
        </div>
        
        <div class="crafting-details__resources">
          <h4>Required Resources</h4>
          <div class="resource-list">
            <div 
              v-for="resourceId in cardStore.getCraftedItemById(selectedItemId)?.requiredResources"
              :key="resourceId"
              class="resource-item"
              :class="{
                'resource-item--available': playerStore.hasResource(resourceId),
                'resource-item--unavailable': !playerStore.hasResource(resourceId)
              }"
            >
              <ResourceCard :resource-id="resourceId" />
            </div>
          </div>
        </div>
      </div>
      
      <div class="crafting-interface__roll">
        <DiceRoller 
          v-if="isRolling || craftingResult"
          :sides="8"
          :rolling="isRolling"
          :result="craftingResult?.roll"
        />
      </div>
      
      <div v-if="craftingResult" class="crafting-result">
        <div 
          class="crafting-result__message"
          :class="{
            'crafting-result__message--success': craftingResult.success,
            'crafting-result__message--failure': !craftingResult.success
          }"
        >
          {{ craftingResult.message }}
        </div>
        
        <div v-if="craftingResult.item" class="crafting-result__item">
          <CraftedItemCard :item="craftingResult.item" />
        </div>
      </div>
    </div>
    
    <div class="crafting-interface__actions">
      <button 
        class="button button--primary"
        :disabled="!selectedItemId || isRolling || craftingResult || !availableRecipes.find(r => r.id === selectedItemId)?.canCraft"
        @click="craftItem"
      >
        Craft Item
      </button>
      
      <button 
        class="button button--secondary"
        @click="continueToNextPhase"
      >
        Continue
      </button>
    </div>
  </div>
</template>
```

### Deliverables
- Crafting recipe system with resource requirements
- Crafting success probability calculator
- Crafted item usage tracking with limiting uses
- Drawback system for item effects
- Location bonuses for specific crafting types
- Seasonal effects on crafting
- Crafting interface with recipe selection
- Crafting result visualization with animations

---

## Step 9: Threat & Victory Systems

### Technical Requirements
- Implement threat token accumulation system
- Build otherworldly manifestation mechanics
- Create victory condition validation
- Develop game completion flow
- Build narrative event system for threats

### Implementation Details

#### Threat Management Service
Create a service for managing threat:

```typescript
// src/services/threatService.ts
class ThreatService {
  // Add threat tokens
  addThreatTokens(amount: number, gameStore): number {
    const oldThreatLevel = Math.floor(gameStore.threatTokens / 3);
    
    gameStore.threatTokens += amount;
    
    // Prevent threat prevention effects
    // E.g., Rowan Wood can prevent 1 threat
    if (playerStore.hasActiveEffect('threat_prevention')) {
      const preventAmount = playerStore.getEffectStrength('threat_prevention');
      gameStore.threatTokens = Math.max(0, gameStore.threatTokens - preventAmount);
    }
    
    const newThreatLevel = Math.floor(gameStore.threatTokens / 3);
    
    // If threat level increased, trigger effects
    if (newThreatLevel > oldThreatLevel) {
      this.applyThreatLevelIncrease(oldThreatLevel, newThreatLevel, gameStore);
    }
    
    return gameStore.threatTokens;
  }
  
  // Remove threat tokens
  removeThreatTokens(amount: number, gameStore): number {
    const oldThreatLevel = Math.floor(gameStore.threatTokens / 3);
    
    gameStore.threatTokens = Math.max(0, gameStore.threatTokens - amount);
    
    const newThreatLevel = Math.floor(gameStore.threatTokens / 3);
    
    // If threat level decreased, clear effects
    if (newThreatLevel < oldThreatLevel) {
      this.applyThreatLevelDecrease(oldThreatLevel, newThreatLevel, gameStore);
    }
    
    return gameStore.threatTokens;
  }
  
  // Check for threat effects at start of turn
  checkThreatEffects(gameStore): ThreatEffect | null {
    // At 5+ tokens: Draw a random event
    if (gameStore.threatTokens >= 5 && gameStore.threatTokens < 10) {
      return this.generateRandomEvent();
    }
    
    // At 10+ tokens: Roll on Otherworldly Manifestation table
    if (gameStore.threatTokens >= 10) {
      return this.generateManifestation();
    }
    
    return null;
  }
  
  // Generate a random threat event
  generateRandomEvent(): ThreatEffect {
    const events = [
      {
        name: 'Spectral Mist',
        description: 'A thick mist descends, making navigation difficult.',
        effect: (gameStore, playerStore) => {
          // Next movement requires +1 on challenge roll
          gameStore.addTempEffect('difficult_navigation', 1);
        }
      },
      {
        name: 'Eerie Whispers',
        description: 'Unsettling whispers cause doubt and confusion.',
        effect: (gameStore, playerStore) => {
          // -1 to next mental challenge
          gameStore.addTempEffect('mental_challenge_penalty', 1);
        }
      },
      {
        name: 'Sudden Cold',
        description: 'An unnatural chill cuts to the bone.',
        effect: (gameStore, playerStore) => {
          // Lose 1 health unless at a shelter
          if (!landscapeService.isCurrentLocationShelter(gameStore)) {
            playerStore.modifyHealth(-1);
          }
        }
      },
      // More random events...
    ];
    
    const randomIndex = Math.floor(Math.random() * events.length);
    return events[randomIndex];
  }
  
  // Generate an otherworldly manifestation
  generateManifestation(): ThreatEffect {
    // Roll 1-8 on manifestation table
    const roll = diceService.rollD8();
    
    const manifestations = [
      {
        name: 'Mist Wraith',
        description: 'A ghostly figure formed of mist blocks your path.',
        resolution: 'Requires Amber Shards to banish.',
        effect: (gameStore, playerStore) => {
          // Implementation of effect
        }
      },
      {
        name: 'Barrow Wight',
        description: 'An ancient guardian of the dead rises.',
        resolution: 'Drains 1 health each turn until outrun or confronted.',
        effect: (gameStore, playerStore) => {
          // Implementation of effect
        }
      },
      // Other manifestations...
    ];
    
    return manifestations[roll - 1];
  }
  
  // Apply effects when threat level increases
  private applyThreatLevelIncrease(oldLevel: number, newLevel: number, gameStore): void {
    // Implement effects for crossing threat thresholds
  }
  
  // Apply effects when threat level decreases
  private applyThreatLevelDecrease(oldLevel: number, newLevel: number, gameStore): void {
    // Implement effects for reducing threat thresholds
  }
}

export const threatService = new ThreatService();
```

#### Victory Condition Service
Create a service for validating victory conditions:

```typescript
// src/services/victoryService.ts
class VictoryService {
  // Check all victory conditions
  checkVictoryConditions(gameStore, playerStore): {
    isVictory: boolean;
    conditions: {
      journeyCompleted: boolean;
      balanceMaintained: boolean;
      knowledgeAcquired: boolean;
      bondsFormed: boolean;
      questFulfilled: boolean;
    };
  } {
    const conditions = {
      journeyCompleted: this.checkJourneyCompletion(gameStore),
      balanceMaintained: this.checkBalanceMaintained(gameStore),
      knowledgeAcquired: this.checkKnowledgeAcquired(playerStore),
      bondsFormed: this.checkBondsFormed(playerStore),
      questFulfilled: this.checkPersonalQuest(playerStore, gameStore)
    };
    
    const isVictory = Object.values(conditions).every(Boolean);
    
    // Update game state
    gameStore.victoryConditions = conditions;
    
    return {
      isVictory,
      conditions
    };
  }
  
  // Check if journey is complete (all 15 landscapes visited)
  checkJourneyCompletion(gameStore): boolean {
    // Complete when returned to starting point after visiting all landscapes
    const lastLandscapeIndex = gameStore.journeyPath.length - 1;
    return gameStore.visitedLandscapes.length >= gameStore.journeyPath.length &&
           gameStore.currentLandscapeId === gameStore.journeyPath[lastLandscapeIndex];
  }
  
  // Check if balance is maintained (fewer than 6 threat tokens)
  checkBalanceMaintained(gameStore): boolean {
    return gameStore.threatTokens < 6;
  }
  
  // Check if knowledge acquired (at least 2 crafted items)
  checkKnowledgeAcquired(playerStore): boolean {
    return playerStore.craftedItems.length >= 2;
  }
  
  // Check if bonds formed (at least one animal companion)
  checkBondsFormed(playerStore): boolean {
    return playerStore.animalCompanions.length >= 1;
  }
  
  // Check character-specific personal quest
  checkPersonalQuest(playerStore, gameStore): boolean {
    switch (playerStore.character?.type) {
      case 'giant_beastfriend':
        // Bond with at least 4 different Animal Companions
        return playerStore.companionsBondedCount >= 4;
        
      case 'hedge_witch':
        // Create at least 3 different Crafted Items
        return playerStore.uniqueCraftedItemsCount >= 3;
        
      case 'iron_crafter':
        // Craft a Legendary Item
        return playerStore.hasCraftedLegendaryItem;
        
      case 'village_elder':
        // Visit all major sacred sites and perform rituals
        return gameStore.completedRitualSites.length >= 5;
        
      default:
        return false;
    }
  }
  
  // Process victory
  processVictory(gameStore): void {
    gameStore.isGameOver = true;
    gameStore.isVictory = true;
    gameStore.phase = GamePhase.GAME_OVER;
    
    // Record victory stats
    gameStore.gameStats = {
      turnsPlayed: gameStore.turn,
      threatTokens: gameStore.threatTokens,
      finalSeason: gameStore.season,
      timestamp: Date.now()
    };
  }
  
  // Process defeat
  processDefeat(gameStore, reason: string): void {
    gameStore.isGameOver = true;
    gameStore.isVictory = false;
    gameStore.gameOverReason = reason;
    gameStore.phase = GamePhase.GAME_OVER;
    
    // Record defeat stats
    gameStore.gameStats = {
      turnsPlayed: gameStore.turn,
      threatTokens: gameStore.threatTokens,
      finalSeason: gameStore.season,
      defeatReason: reason,
      timestamp: Date.now()
    };
  }
}

export const victoryService = new VictoryService();
```

#### Game Over Component
Create a UI for game completion:

```vue
<!-- src/components/game/GameOver.vue (structure) -->
<script setup lang="ts">
import { computed } from 'vue';
import { useGameStore } from '@/stores/gameStore';
import { usePlayerStore } from '@/stores/playerStore';
import { useRouter } from 'vue-router';

const gameStore = useGameStore();
const playerStore = usePlayerStore();
const router = useRouter();

const isVictory = computed(() => gameStore.isVictory);
const gameStats = computed(() => gameStore.gameStats);
const victoryConditions = computed(() => gameStore.victoryConditions);

const victoryPercentage = computed(() => {
  if (!victoryConditions.value) return 0;
  
  const completedConditions = Object.values(victoryConditions.value).filter(Boolean).length;
  return (completedConditions / 5) * 100;
});

// Start a new game
const startNewGame = () => {
  router.push('/setup');
};

// View game history
const viewHistory = () => {
  // Implementation for viewing game stats/history
};
</script>

<template>
  <div 
    class="game-over"
    :class="{
      'game-over--victory': isVictory,
      'game-over--defeat': !isVictory
    }"
  >
    <div class="game-over__content">
      <h1 v-if="isVictory" class="game-over__title game-over__title--victory">
        Victory!
      </h1>
      <h1 v-else class="game-over__title game-over__title--defeat">
        Journey's End
      </h1>
      
      <div class="game-over__message">
        <p v-if="isVictory">
          You have successfully completed your journey through the Celtic Realm,
          maintaining balance and gathering knowledge along the way.
        </p>
        <p v-else>
          Your journey has come to an end. {{ gameStore.gameOverReason }}
        </p>
      </div>
      
      <div class="game-over__stats">
        <h2>Journey Statistics</h2>
        <ul>
          <li>Turns Played: {{ gameStats.turnsPlayed }}</li>
          <li>Final Threat Level: {{ Math.floor(gameStats.threatTokens / 3) }} ({{ gameStats.threatTokens }} tokens)</li>
          <li>Final Season: {{ gameStats.finalSeason }}</li>
          <li>Resources Collected: {{ playerStore.resourcesCollectedCount }}</li>
          <li>Companions Bonded: {{ playerStore.companionsBondedCount }}</li>
          <li>Items Crafted: {{ playerStore.craftedItemsCount }}</li>
        </ul>
      </div>
      
      <div v-if="!isVictory" class="game-over__progress">
        <h2>Victory Progress</h2>
        <div class="progress-bar">
          <div class="progress-bar__fill" :style="`width: ${victoryPercentage}%`"></div>
        </div>
        <ul class="victory-conditions">
          <li 
            v-for="(completed, condition) in victoryConditions"
            :key="condition"
            :class="{ 'completed': completed }"
          >
            {{ formatConditionName(condition) }}: {{ completed ? 'Completed' : 'Incomplete' }}
          </li>
        </ul>
      </div>
      
      <div class="game-over__actions">
        <button 
          class="button button--primary"
          @click="startNewGame"
        >
          Start New Journey
        </button>
        
        <button 
          class="button button--secondary"
          @click="viewHistory"
        >
          View Journey Log
        </button>
      </div>
    </div>
  </div>
</template>
```

### Deliverables
- Threat token accumulation system
- Random event generation for moderate threat
- Otherworldly manifestation system for high threat
- Victory condition validation for all requirements
- Character-specific quest validation
- Game completion flow with statistics
- Victory/defeat screen with journey summary
- Threat visualization with escalating effects

---

## Step 10: Final Integration & Polish

### Technical Requirements
- Implement comprehensive test suite
- Create game tutorial system
- Optimize performance for mobile devices
- Implement accessibility features
- Add final visual polish and animations

### Implementation Details

#### Test Suite Implementation
Develop comprehensive tests for game functionality:

```typescript
// tests/unit/gameStore.test.ts (example structure)
import { describe, it, expect, beforeEach } from 'vitest';
import { setActivePinia, createPinia } from 'pinia';
import { useGameStore } from '@/stores/gameStore';
import { GamePhase } from '@/models/enums/phases';
import { Season } from '@/models/enums/seasons';

describe('Game Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });
  
  it('initializes with default values', () => {
    const gameStore = useGameStore();
    
    expect(gameStore.phase).toBe(GamePhase.SETUP);
    expect(gameStore.turn).toBe(0);
    expect(gameStore.season).toBe(Season.SAMHAIN);
    expect(gameStore.threatTokens).toBe(0);
    expect(gameStore.blessingTokens).toBe(1);
    expect(gameStore.currentLandscapeId).toBeNull();
    expect(gameStore.visitedLandscapes).toEqual([]);
  });
  
  it('transitions between valid phases', () => {
    const gameStore = useGameStore();
    
    expect(gameStore.phase).toBe(GamePhase.SETUP);
    
    const result = gameStore.transitionToPhase(GamePhase.SEASONAL_ASSESSMENT);
    expect(result).toBe(true);
    expect(gameStore.phase).toBe(GamePhase.SEASONAL_ASSESSMENT);
  });
  
  it('prevents invalid phase transitions', () => {
    const gameStore = useGameStore();
    
    expect(gameStore.phase).toBe(GamePhase.SETUP);
    
    const result = gameStore.transitionToPhase(GamePhase.CHALLENGE_RESOLUTION);
    expect(result).toBe(false);
    expect(gameStore.phase).toBe(GamePhase.SETUP);
  });
  
  // More tests...
});
```
