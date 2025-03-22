# Pathfinder's Journey - Game Architecture

## Vue.js Implementation

The application uses modern Vue.js patterns and technologies:

- **Vue 3 with Composition API** - The application uses Vue 3's script setup syntax in components (`src/components/*.vue`) and the latest Composition API patterns for better code organization and type safety
- **Pinia State Management** - Implements specialized Pinia stores for different aspects of game mechanics:
  - `src/stores/gameStore.ts` - Core game flow and phases
  - `src/stores/playerStore.ts` - Player data, health, and inventory
  - `src/stores/cardStore.ts` - Card management and retrieval
  - `src/stores/challengeStore.ts` - Challenges and threat token management
  - `src/stores/seasonStore.ts` - Seasonal mechanics and effects
  - `src/stores/journeyStore.ts` - Landscape progression and visited locations
  - `src/stores/logStore.ts` - Game log messages and history
  
  Each store follows well-defined patterns for actions, getters, and state.
- **Component-Based Architecture** - Uses a hierarchical component structure with specialized components for different game elements:
  - `src/components/cards/GameCard.vue`
  - `src/components/landscape/LandscapeView.vue`
  - `src/components/companions/CompanionCard.vue`
  - `src/components/challenges/ChallengeView.vue`
- **TypeScript Integration** - Full TypeScript implementation with strong typing:
  - Models: `src/models/types/*.ts`
  - Enums: `src/models/enums/*.ts` (e.g., `phases.ts`, `seasons.ts`, `cardTypes.ts`)
  - Interfaces: `src/types/store-extensions.d.ts`
- **Composable Functions** - Leverages custom composables to encapsulate logic:
  - `src/composables/useGameState.ts` - Unified interface to multiple stores
  - `src/composables/useCardSelection.ts` - Card selection logic
  - `src/composables/useResourceManagement.ts` - Resource management utilities

## Service Layer

The game implements a service-oriented architecture for game mechanics:

- **Singleton Pattern** - Services are implemented as singletons:
  - `src/services/CardRepository.ts` - `export const cardRepository = new CardRepository()`
  - `src/services/victoryService.ts` - `export const victoryService = new VictoryService()`
- **Specialized Services** - Dedicated services for different game mechanics:
  - `src/services/CardRepository.ts` - Managing card data and access
  - `src/services/challenge/ChallengeService.ts` - Handling game challenges
  - `src/services/companionService.ts` - Managing animal companions 
  - `src/services/craftingService.ts` - Handling item crafting mechanics
  - `src/services/journeyService.ts` - Managing landscape progression
  - `src/services/resourceService.ts` - Handling resource gathering and management
  - `src/services/threatService.ts` - Managing threat tokens and events
  - `src/services/victoryService.ts` - Handling win conditions
- **Strategy Pattern** - Challenge system uses strategy pattern:
  - `src/services/challenge/ChallengeStrategy.ts` - Base strategy interface
  - `src/services/challenge/strategies/PhysicalChallengeStrategy.ts` - Physical challenge implementation
  - `src/services/challenge/strategies/MentalChallengeStrategy.ts` - Mental challenge implementation
  - `src/services/challenge/strategies/SocialChallengeStrategy.ts` - Social challenge implementation
  - `src/services/challenge/strategies/SpiritualChallengeStrategy.ts` - Spiritual challenge implementation
- **Core Service Utilities**:
  - `src/services/core/BaseService.ts` - Base service class with common functionality
  - `src/services/core/ServiceRegistry.ts` - Service registration and retrieval
  - `src/services/core/StoreRegistry.ts` - Store registration and access
- **Direct Store Access** - Services directly access stores using the Pinia store hooks
- **Consistent Implementation** - Standardized method naming and organization with proper JSDoc comments
- **State Management** - Services include `reset()` methods for state management and initialization

## Data Structure

The game data is organized in a structured manner:

- **Game Data** - Static data located in `src/models/data/`:
  - `characters.ts` - Character definitions
  - `landscapes.ts` - Landscape definitions
  - `resources.ts` - Resource item definitions
  - `companions.ts` - Animal companion definitions
  - `crafted-items.ts` - Craftable item definitions
  - `seasons.ts` - Season definitions and effects
  - `challenges.ts` - Challenge definitions

- **Type Definitions** - Located in `src/models/types/`:
  - `cards.ts` - Card type interfaces
  - `game.ts` - Game state interfaces
  - `player.ts` - Player state interfaces