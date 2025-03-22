## Game Phase Implementation Plan with Gameplay Description

### 1. SETUP Phase
**GAMEPLAY**: The game board is prepared by arranging 15 Landscape Cards in a circular path. The Season Wheel is set to Samhain (starting season), and various card decks (Resources, Animal Companions, Crafted Items) are shuffled and placed ready for play. First Landscape card is revealed as the starting point.
**PLAYING CARDS**: Landscape Cards, Season Card, Resource/Companion/Crafted Item decks
**COMPONENTS**: `GameSetupView.vue`, `JourneyPath.vue`, `SeasonalWheel.vue`, `GameCard.vue`

### 2. CHARACTER_SELECTION Phase
**GAMEPLAY**: Player chooses one of four Character Cards, each with unique starting abilities, health values, and resource capacities. Character's special rules and weaknesses are applied to gameplay calculations.
**PLAYING CARDS**: Character Cards with specific stats and abilities
**COMPONENTS**: `CharacterSelection.vue`, `PlayerDashboard.vue`

### 3. SEASONAL_ASSESSMENT Phase
**GAMEPLAY**: Current Season Card's effects are applied to gameplay (difficulty modifiers, benefits). Resource availability and animal companion affinities are adjusted based on season. After a set number of turns, the Season Wheel advances to the next season.
**PLAYING CARDS**: Season Cards with specific effects and modifiers
**COMPONENTS**: `SeasonDisplay.vue`, `SeasonalWheel.vue`

### 4. THREAT_LEVEL_CHECK Phase
**GAMEPLAY**: Threat tokens are counted to determine the current threat level. Higher levels trigger more severe consequences. Season-specific threats may manifest based on the current Season Card.
**PLAYING CARDS**: Season Card influences threat effects
**COMPONENTS**: `ThreatManagement.vue`, `StatusArea.vue`

### 5. LANDSCAPE_CHALLENGE Phase
**GAMEPLAY**: The current Landscape Card presents a specific challenge to overcome. Challenge difficulty is modified by the current Season Card. Player decides which companions or items to use to help with the challenge.
**PLAYING CARDS**: Landscape Card (determines challenge), Season Card (modifies difficulty)
**COMPONENTS**: `LandscapeView.vue`, `GameMap.vue`, `ActionPanel.vue`

### 6. CHALLENGE_RESOLUTION Phase
**GAMEPLAY**: Player rolls D8 die and adds character modifiers to resolve the challenge. Success, partial success, or failure is determined by comparing roll to difficulty. Failures add threat tokens while successes may award XP and resources.
**PLAYING CARDS**: Character Card, Companion Cards, Crafted Item Cards (provide bonuses)
**COMPONENTS**: `ActionPanel.vue`, `GameLog.vue`

### 7. RESOURCE_MANAGEMENT Phase
**GAMEPLAY**: Based on challenge results, player may gather Resource Cards (1-2 for success/partial success). Player manages inventory within capacity limits. Current Season Card affects which resources are abundant or scarce.
**PLAYING CARDS**: Resource Cards added to inventory, Character Card (sets capacity)
**COMPONENTS**: `ResourceManagement.vue`, `GameCard.vue`

### 8. ANIMAL_COMPANION Phase
**GAMEPLAY**: At specific Landscape locations, player can bond with Animal Companion Cards. Companions must be fed with Resource Cards to strengthen bond. Current Season affects which animals have enhanced abilities.
**PLAYING CARDS**: Animal Companion Cards, Resource Cards (for feeding)
**COMPONENTS**: `AnimalCompanionSelection.vue`, `CompanionCard.vue`, `CompanionManagement.vue`

### 9. CRAFTING Phase
**GAMEPLAY**: Player can combine Resource Cards to craft magical items. D8 roll plus modifier must meet or exceed item complexity. Beltane season enhances crafting by adding extra uses to items.
**PLAYING CARDS**: Resource Cards (consumed), Crafted Item Cards (created)
**COMPONENTS**: `CraftingStation.vue`, `GameCard.vue`

### 10. JOURNEY_PROGRESSION Phase
**GAMEPLAY**: Player advances to next Landscape Card on the journey path. Progress percentage is calculated based on number of visited landscapes. Hidden locations may be discovered with certain items or companions.
**PLAYING CARDS**: Landscape Cards reveal journey progress, Season Card may advance
**COMPONENTS**: `JourneyTracker.vue`, `JourneyProgressionView.vue`, `GameMap.vue`

### 11. HEALING_RECOVERY Phase
**GAMEPLAY**: At healing locations, player can recover lost health. Healing effectiveness is influenced by current Season, with Lughnasadh providing doubled healing. If health reaches zero, player must retreat to nearest healing location.
**PLAYING CARDS**: Landscape Cards (some are healing locations), Season Card (affects healing)
**COMPONENTS**: `PlayerStatus.vue`, `ActionPanel.vue`

### 12. GAME_OVER Phase
**GAMEPLAY**: Victory conditions are checked (journey completion, XP thresholds). Game provides summary of accomplishments including challenges overcome, companions bonded with, and items crafted.
**PLAYING CARDS**: All collected cards are evaluated for final scoring
**COMPONENTS**: `PlayerDashboard.vue`, `GameLog.vue`