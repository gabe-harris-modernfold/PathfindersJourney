# Cascade: The Pathfinder's Guide

Within the Celtic Realm of Pathfinder's Journey, Cascade serves as your mystical companion and guide. Like the flowing waters that connect the Sacred Landscapes of this world, Cascade bridges the gap between traveler and journey, offering insights drawn from the ancient wisdom of the land.

## Origins

Born from the mists of the Ancient Stone Circle during the season of Samhain when the veil between worlds is thinnest, Cascade embodies the spirit of guidance. Neither fully of this world nor the Otherworld, Cascade exists to assist Pathfinders as they traverse the Misty Barrow Downs, Sacred Oak Grove, and beyond.

## Technical Integration

**Component Structure:**
- Implemented as part of `src/views/GameBoardView.vue`, the main game interface component
- Operates alongside `src/components/game/PlayerDashboard.vue` and `src/components/game/GameLog.vue` components
- Accesses game state via Pinia stores: `gameStore.ts`, `playerStore.ts`, and `cardStore.ts`

**Store Integration:**
- Interfaces with `src/stores/gameStore.ts` to access game phase, season data, and landscape information
- Utilizes `src/stores/cardStore.ts` for retrieving landscape data from `landscapes.js` rather than hardcoded values
- Monitors `currentSeason` state (starting with Samhain) from `gameStore.ts`

**Phase-Specific Functionality:**
- Provides guidance during all game phases within `GameBoardView.vue` phase sections:
  - `SeasonalAssessmentPhase`
  - `ThreatLevelCheckPhase`
  - `ChallengeResolutionPhase` 
  - `JourneyProgressionPhase`

**Card System Integration:**
- Interfaces with the `src/components/core/GameCard.vue` component (parent component in `core` directory)
- Uses landscape data from `landscapes.js` for all 15 sacred landscape locations
- Supports all card types defined in `CardType` enum

## Data Flow Architecture

Cascade accesses game data through a hierarchical structure:
- Parent component: `GameBoardView.vue` contains all phase-specific components
- Accesses game state via store getters like `currentLandscape`, `currentSeason`, and `threatLevel`
- Renders information through child components like `GameCard.vue` and `GameLog.vue`
- Processes game logic methods like `resolveChallenge()`, `getSeasonModifier()`, and `formatSeason()`

## Technical Capabilities

**Landscape Knowledge:**
- Retrieves landscape data from `src/models/data/landscapes.js` through `cardStore.getLandscapeById()` method
- Provides data on all 15 predefined landscapes and their associated challenges

**Seasonal Mechanics:**
- Tracks seasonal changes through `gameStore.advanceSeason()` method
- Utilizes seasonal modifiers from `getSeasonalResourceModifier()` in gameplay

**Challenge System:**
- Interfaces with challenge resolution methods in `GameBoardView.vue`
- Accesses challenge difficulty assessments via `getChallengeDifficulty()` method

**Resource Management:**
- Works with `ResourceManagement.vue` component for resource tracking
- Connects to `gatherResources()` method in both gameStore and GameBoardView

## GameStore State Management

Cascade interfaces with `src/stores/gameStore.ts` to track and respond to the game's current state:

**Core Game States:**
- `currentPhase` - Tracks active game phase from `src/models/enums/phases.ts` enum (starts in `SEASONAL_ASSESSMENT`)
- `currentTurn` - Monitors turn progression (begins at 1)
- `currentSeason` - Tracks active season, initialized to `Season.SAMHAIN` at game start
- `currentLandscapeId` - References the active landscape using ID from `src/models/data/landscapes.js`
- `currentChallenge` - Stores the active challenge data
- `threatTokens` - Accumulates threat levels affecting gameplay difficulty

**World State Tracking:**
- `visitedLandscapes` - Array of previously visited landscape IDs
- `journeyProgress` - Numeric progress indicator (0-10)
- `journeyPath` - Sequential array of landscape IDs forming the player's path
- `gameLog` - Log of game events with timestamps

**Victory Condition States:**
- `victoryConditions` - Object tracking progress on 8 victory conditions
- `gameStarted` - Boolean flag for game initialization
- `gameOver` - Indicates game completion state
- `isVictory` - Tracks win/loss status

**Temporal Effects System:**
- `tempEffects` - Array of temporary gameplay effects with duration tracking
- `ceremonyCompleted` - Tracks special ceremony completion status

## Phase Transitions

Cascade works with the phase system defined in `src/models/enums/phases.ts`:
1. `SEASONAL_ASSESSMENT` (starting phase) - Evaluates season effects
2. `THREAT_LEVEL_CHECK` - Processes accumulated threat tokens
3. `LANDSCAPE_CHALLENGE` - Presents landscape-specific challenges
4. `CHALLENGE_RESOLUTION` - Resolves challenge outcomes
5. `RESOURCE_MANAGEMENT` - Handles resource collection/usage
6. `ANIMAL_COMPANION` - Manages animal companion interactions
7. `CRAFTING` - Facilitates item crafting
8. `JOURNEY_PROGRESSION` - Advances to next landscape
9. `GAME_OVER` - Manages endgame state

## Data Models Architecture

Cascade directly integrates with the game's core data models:

**Landscapes (`src/models/data/landscapes.js`):**
- Provides access to all 15 predefined landscapes including Ancient Stone Circle, Misty Barrow Downs, and Sacred Oak Grove
- Each landscape contains structured data for challenges, difficulty ratings, and available resources
- Accessed through `src/stores/cardStore.ts` getLandscapeById() to maintain data consistency
- Example: `ancient_stone_circle` includes Spectral Guardians challenge with mental difficulty 5

**Seasons (`src/models/data/seasons.js`):**
- Tracks the five Celtic seasons from Samhain (start season) through Winter's Depth, Imbolc, Beltane, and Lughnasadh
- Each season includes resource abundance/scarcity data and animal affinities
- Contains seasonal modifiers that affect gameplay mechanics
- Example: Samhain provides +2 difficulty to spiritual challenges

**Companions (`src/models/data/companions.js`):**
- Interfaces with 10 animal companions including Raven Scout, Wolf Guardian, and Deer Guide
- Each companion includes ability functions that modify game state
- Contains seasonal affinities that align with specific seasons
- Example: Wolf Guardian provides +2 to combat-related challenges

**Resources (`src/models/data/resources.js`):**
- Manages resource availability based on current landscape and season
- Used for crafting and challenge resolution
- Each resource has specific seasonal abundance patterns

Cascade's implementation maintains strict adherence to these data models, ensuring consistent game behavior while providing insight across all game phases.
