import { 
  CharacterCard, 
  LandscapeCard, 
  ResourceCard, 
  AnimalCompanionCard, 
  CraftedItemCard, 
  SeasonCard,
  ChallengeCard
} from '@/models/types/cards';
import { CardType, ChallengeType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import { getStandardizedChallengeType } from '@/utils/typeMapping';

// Import the data from models/data directory
import characters from '@/models/data/characters';
import landscapes from '@/models/data/landscapes';
import resources from '@/models/data/resources';
import companions from '@/models/data/companions';
import { craftedItems } from '@/models/data/crafted-items';
import { seasons } from '@/models/data/seasons';

/**
 * Repository for managing all card data in the game
 * Responsible for loading, validating, and providing access to card data
 */
export class CardRepository {
  private _characters: CharacterCard[];
  private _landscapes: LandscapeCard[];
  private _resources: ResourceCard[];
  private _animalCompanions: AnimalCompanionCard[];
  private _craftedItems: CraftedItemCard[];
  private _seasons: SeasonCard[];

  constructor() {
    this._characters = this._initializeCharacters();
    this._landscapes = this._initializeLandscapes();
    this._resources = this._initializeResources();
    this._animalCompanions = this._initializeAnimalCompanions();
    this._craftedItems = this._initializeCraftedItems();
    this._seasons = this._initializeSeasons();
  }

  /**
   * Generic base mapper function that handles common card properties
   * @param sourceData The source data object
   * @param cardType The type of card being created
   * @param defaultImage Default image to use if none is provided
   * @returns Base card object with common properties
   */
  private _createBaseCard<T>(sourceData: any, cardType: CardType, defaultImage: string): T {
    return {
      id: sourceData.id,
      name: sourceData.name,
      description: sourceData.description || '',
      type: cardType,
      image: sourceData.image || defaultImage
    } as unknown as T;
  }

  /**
   * Initialize character cards from raw data
   * @returns Array of processed character cards
   */
  private _initializeCharacters(): CharacterCard[] {
    return characters.map(char => ({
      ...this._createBaseCard<CharacterCard>(char, CardType.CHARACTER, 'default_character.jpg'),
      healthPoints: char.healthPoints || 0,
      strength: char.strength || 0,
      wisdom: char.wisdom || 0,
      agility: char.agility || 0,
      diplomacy: char.diplomacy || 0,
      survival: char.survival || 0,
      resourceCapacity: char.resourceCapacity || 5,
      specialAbility: {
        name: char.specialAbility?.name || '',
        description: char.specialAbility?.description || ''
      },
      startingResources: char.startingResources || [],
      startingCompanion: char.startingCompanion,
      startingCompanions: char.startingCompanions
    }));
  }

  /**
   * Initialize landscape cards from raw data
   * @returns Array of processed landscape cards
   */
  private _initializeLandscapes(): LandscapeCard[] {
    return landscapes.map(land => ({
      ...this._createBaseCard<LandscapeCard>(land, CardType.LANDSCAPE, 'default_landscape.jpg'),
      challenge: land.challenge || '',
      challengeType: land.challengeType || '',
      difficulty: land.difficulty || 0,
      challenges: land.challenges ? land.challenges.map(challenge => ({
        type: challenge.type || '',
        difficulty: challenge.difficulty || 0
      })) : [],
      availableResources: land.availableResources || [],
      specialFeature: land.specialFeature,
      animalCompanions: land.animalCompanions,
      providesShelter: land.providesShelter,
      entryEffect: land.entryEffect,
      craftingBonuses: land.craftingBonuses,
      hasCraftingFacilities: land.hasCraftingFacilities
    }));
  }

  /**
   * Initialize resource cards from raw data
   * @returns Array of processed resource cards
   */
  private _initializeResources(): ResourceCard[] {
    return resources.map(res => ({
      ...this._createBaseCard<ResourceCard>(res, CardType.RESOURCE, 'default_resource.jpg'),
      resourceType: res.type || '',
      effect: {
        name: res.effect?.name || '',
        description: res.effect?.description || ''
      },
      season: res.season || '',
      rarity: res.rarity || 'common',
      seasonalAbundance: res.seasonalAbundance || [],
      specialEffect: res.specialEffect
    }));
  }

  /**
   * Initialize animal companion cards from raw data
   * @returns Array of processed animal companion cards
   */
  private _initializeAnimalCompanions(): AnimalCompanionCard[] {
    return companions.map(comp => ({
      ...this._createBaseCard<AnimalCompanionCard>(comp, CardType.ANIMAL_COMPANION, comp.image || 'default_companion.jpg'),
      ability: {
        name: comp.ability || '',
        description: comp.abilityDescription || ''
      },
      affinitySeasons: (comp.seasonalAffinity || []).map(season => {
        // Convert string season to Season enum
        if (season === 'samhain') return Season.SAMHAIN;
        if (season === 'winters_depth') return Season.WINTERS_DEPTH;
        if (season === 'imbolc') return Season.IMBOLC;
        if (season === 'beltane') return Season.BELTANE;
        if (season === 'lughnasadh') return Season.LUGHNASADH;
        return Season.SAMHAIN; // Default
      }),
      preferredResources: comp.preferredResources || [],
      challengeBonuses: {},  // Default empty object
      seasonalBonuses: {},   // Default empty object
      bondingEffect: undefined,   // Default undefined
      loyaltyEffects: {}     // Default empty object
    }));
  }

  /**
   * Initialize crafted item cards from raw data
   * @returns Array of processed crafted item cards
   */
  private _initializeCraftedItems(): CraftedItemCard[] {
    return craftedItems.map(item => ({
      ...this._createBaseCard<CraftedItemCard>(item, CardType.CRAFTED_ITEM, 'default_crafted_item.jpg'),
      requiredResources: item.requiredResources || [],
      complexity: item.complexity || 1,
      ability: {
        name: item.ability?.name || '',
        description: item.ability?.description || '',
        type: item.ability?.type
      },
      drawback: item.drawback,
      isLegendary: item.isLegendary,
      challengeBonuses: item.challengeBonuses
    }));
  }

  /**
   * Initialize season cards from raw data and convert string season IDs to enum values
   * @returns Array of processed season cards
   */
  private _initializeSeasons(): SeasonCard[] {
    return seasons.map(season => {
      // Convert string season id to Season enum value
      const seasonEnum = this._mapSeasonStringToEnum(season.id);
      
      return {
        ...this._createBaseCard<SeasonCard>(season, CardType.SEASON, 'default_season.jpg'),
        effect: season.effect || '',
        benefit: season.benefit || '',
        season: seasonEnum,
        resourceAbundance: season.resourceAbundance || [],
        resourceScarcity: season.resourceScarcity || [],
        animalAffinity: season.animalAffinity || [],
        abundantResources: season.resourceAbundance || [],
        scarceResources: season.resourceScarcity || [],
        animalAffinities: season.animalAffinity || [],
        effects: season.effects || [],
        modifiers: season.modifiers || { spiritual: 0, physical: 0, mental: 0, social: 0 },
        quest: season.quest
      };
    });
  }

  /**
   * Helper function to convert season string ID to Season enum
   * @param seasonId The string ID of the season
   * @returns The corresponding Season enum value
   */
  private _mapSeasonStringToEnum(seasonId: string): Season {
    switch(seasonId) {
      case 'samhain':
        return Season.SAMHAIN;
      case 'wintersDepth':
        return Season.WINTERS_DEPTH;
      case 'imbolc':
        return Season.IMBOLC;
      case 'beltane':
        return Season.BELTANE;
      case 'lughnasadh':
        return Season.LUGHNASADH;
      default:
        console.warn(`Unknown season id: ${seasonId}, defaulting to Samhain`);
        return Season.SAMHAIN;
    }
  }

  /**
   * Factory method to create a card of the specified type
   * @param type The type of card to create
   * @param data Raw data for the card
   * @returns The created card
   */
  public createCard<T>(type: CardType, data: any): T {
    switch (type) {
      case CardType.CHARACTER:
        return this._createCharacterCard(data) as unknown as T;
      case CardType.LANDSCAPE:
        return this._createLandscapeCard(data) as unknown as T;
      case CardType.RESOURCE:
        return this._createResourceCard(data) as unknown as T;
      case CardType.ANIMAL_COMPANION:
        return this._createAnimalCompanionCard(data) as unknown as T;
      case CardType.CRAFTED_ITEM:
        return this._createCraftedItemCard(data) as unknown as T;
      case CardType.SEASON:
        return this._createSeasonCard(data) as unknown as T;
      default:
        throw new Error(`Unsupported card type: ${type}`);
    }
  }

  /**
   * Factory method for creating a character card
   * @param data Raw character data
   * @returns Processed character card
   */
  private _createCharacterCard(data: any): CharacterCard {
    return {
      ...this._createBaseCard<CharacterCard>(data, CardType.CHARACTER, 'default_character.jpg'),
      healthPoints: data.healthPoints || 0,
      strength: data.strength || 0,
      wisdom: data.wisdom || 0,
      agility: data.agility || 0,
      diplomacy: data.diplomacy || 0,
      survival: data.survival || 0,
      resourceCapacity: data.resourceCapacity || 5,
      specialAbility: {
        name: data.specialAbility?.name || '',
        description: data.specialAbility?.description || ''
      },
      startingResources: data.startingResources || [],
      startingCompanion: data.startingCompanion,
      startingCompanions: data.startingCompanions
    };
  }

  /**
   * Factory method for creating a landscape card
   * @param data Raw landscape data
   * @returns Processed landscape card
   */
  private _createLandscapeCard(data: any): LandscapeCard {
    return {
      ...this._createBaseCard<LandscapeCard>(data, CardType.LANDSCAPE, 'default_landscape.jpg'),
      challenge: data.challenge || '',
      challengeType: data.challengeType || '',
      difficulty: data.difficulty || 0,
      challenges: data.challenges ? data.challenges.map(challenge => ({
        type: challenge.type || '',
        difficulty: challenge.difficulty || 0
      })) : [],
      availableResources: data.availableResources || [],
      specialFeature: data.specialFeature,
      animalCompanions: data.animalCompanions,
      providesShelter: data.providesShelter,
      entryEffect: data.entryEffect,
      craftingBonuses: data.craftingBonuses,
      hasCraftingFacilities: data.hasCraftingFacilities
    };
  }

  /**
   * Factory method for creating a resource card
   * @param data Raw resource data
   * @returns Processed resource card
   */
  private _createResourceCard(data: any): ResourceCard {
    return {
      ...this._createBaseCard<ResourceCard>(data, CardType.RESOURCE, 'default_resource.jpg'),
      resourceType: data.type || '',
      effect: {
        name: data.effect?.name || '',
        description: data.effect?.description || ''
      },
      season: data.season || '',
      rarity: data.rarity || 'common',
      seasonalAbundance: data.seasonalAbundance || [],
      specialEffect: data.specialEffect
    };
  }

  /**
   * Factory method for creating an animal companion card
   * @param data Raw animal companion data
   * @returns Processed animal companion card
   */
  private _createAnimalCompanionCard(data: any): AnimalCompanionCard {
    return {
      ...this._createBaseCard<AnimalCompanionCard>(data, CardType.ANIMAL_COMPANION, 'default_companion.jpg'),
      ability: {
        name: data.ability || '',
        description: data.abilityDescription || ''
      },
      affinitySeasons: (data.seasonalAffinity || []).map(season => {
        // Convert string season to Season enum
        if (season === 'samhain') return Season.SAMHAIN;
        if (season === 'winters_depth') return Season.WINTERS_DEPTH;
        if (season === 'imbolc') return Season.IMBOLC;
        if (season === 'beltane') return Season.BELTANE;
        if (season === 'lughnasadh') return Season.LUGHNASADH;
        return Season.SAMHAIN; // Default
      }),
      preferredResources: data.preferredResources || [],
      challengeBonuses: {},  // Default empty object
      seasonalBonuses: {},   // Default empty object
      bondingEffect: undefined,   // Default undefined
      loyaltyEffects: {}     // Default empty object
    };
  }

  /**
   * Factory method for creating a crafted item card
   * @param data Raw crafted item data
   * @returns Processed crafted item card
   */
  private _createCraftedItemCard(data: any): CraftedItemCard {
    return {
      ...this._createBaseCard<CraftedItemCard>(data, CardType.CRAFTED_ITEM, 'default_crafted_item.jpg'),
      requiredResources: data.requiredResources || [],
      complexity: data.complexity || 1,
      ability: {
        name: data.ability?.name || '',
        description: data.ability?.description || '',
        type: data.ability?.type
      },
      drawback: data.drawback,
      isLegendary: data.isLegendary,
      challengeBonuses: data.challengeBonuses
    };
  }

  /**
   * Factory method for creating a season card
   * @param data Raw season data
   * @returns Processed season card
   */
  private _createSeasonCard(data: any): SeasonCard {
    const seasonEnum = this._mapSeasonStringToEnum(data.id);
    
    return {
      ...this._createBaseCard<SeasonCard>(data, CardType.SEASON, 'default_season.jpg'),
      effect: data.effect || '',
      benefit: data.benefit || '',
      season: seasonEnum,
      resourceAbundance: data.resourceAbundance || [],
      resourceScarcity: data.resourceScarcity || [],
      animalAffinity: data.animalAffinity || [],
      abundantResources: data.resourceAbundance || [],
      scarceResources: data.resourceScarcity || [],
      animalAffinities: data.animalAffinity || [],
      effects: data.effects || [],
      modifiers: data.modifiers || { spiritual: 0, physical: 0, mental: 0, social: 0 },
      quest: data.quest
    };
  }

  /**
   * Gets all character cards
   */
  public get characters(): CharacterCard[] {
    return this._characters;
  }

  /**
   * Gets all landscape cards
   */
  public get landscapes(): LandscapeCard[] {
    return this._landscapes;
  }

  /**
   * Gets all animal companion cards
   */
  public get animalCompanions(): AnimalCompanionCard[] {
    return this._animalCompanions;
  }

  /**
   * Gets all resource cards
   */
  public get resources(): ResourceCard[] {
    return this._resources;
  }

  /**
   * Gets all crafted item cards
   */
  public get craftedItems(): CraftedItemCard[] {
    return this._craftedItems;
  }

  /**
   * Gets all season cards
   */
  public get seasons(): SeasonCard[] {
    return this._seasons;
  }

  /**
   * Gets resources that are abundant in a specific season
   * @param season The season to check for abundance
   * @returns Array of resources abundant in the given season
   */
  public getResourcesBySeason(season: Season): ResourceCard[] {
    return this._resources.filter(resource => 
      resource.seasonalAbundance.includes(season)
    );
  }

  /**
   * Gets animal companions with affinity for a specific season
   * @param season The season to check for affinity
   * @returns Array of animal companions with affinity for the given season
   */
  public getCompanionsBySeason(season: Season): AnimalCompanionCard[] {
    return this._animalCompanions.filter(companion => 
      companion.affinitySeasons.includes(season)
    );
  }

  /**
   * Gets a challenge by ID
   * @param id The ID of the challenge to find
   * @returns The challenge card or undefined if not found
   */
  public getChallengeById(id: string): ChallengeCard | undefined {
    const allChallenges = this._landscapes.reduce((challenges, landscape) => {
      // Convert single challenge to a challenge card format for compatibility
      const landscapeChallenge = {
        id: `${landscape.id}_${landscape.challengeType?.toLowerCase() || 'challenge'}`,
        name: `${landscape.name} ${landscape.challenge || 'Challenge'}`,
        description: `A ${landscape.challengeType || 'unknown'} challenge at ${landscape.name}`,
        type: landscape.challengeType as ChallengeType || ChallengeType.WISDOM,
        difficulty: landscape.difficulty || 5,
        rewards: {
          resources: [],
          experience: 10,
          knowledge: landscape.id
        }
      };
      return [...challenges, landscapeChallenge];
    }, [] as ChallengeCard[]);
    
    return allChallenges.find(challenge => challenge.id === id);
  }

  /**
   * Gets all character cards
   * @returns Array of all character cards
   */
  public getAllCharacters(): CharacterCard[] {
    return this._characters;
  }

  /**
   * Gets a specific character by ID
   * @param id The ID of the character to find
   * @returns The character card or undefined if not found
   */
  public getCharacterById(id: string): CharacterCard | undefined {
    return this._characters.find(character => character.id === id);
  }

  /**
   * Gets the health points of a specific character
   * @param id The ID of the character
   * @returns The character's health points or 0 if character not found
   */
  public getCharacterHealth(id: string): number {
    const character = this.getCharacterById(id);
    return character ? character.healthPoints : 0;
  }

  /**
   * Gets all landscape cards
   * @returns Array of all landscape cards
   */
  public getAllLandscapes(): LandscapeCard[] {
    return this._landscapes;
  }

  /**
   * Gets a specific landscape by ID
   * @param id The ID of the landscape to find
   * @returns The landscape card or undefined if not found
   */
  public getLandscapeById(id: string): LandscapeCard | undefined {
    return this._landscapes.find(landscape => landscape.id === id);
  }

  /**
   * Gets all resource cards
   * @returns Array of all resource cards
   */
  public getAllResources(): ResourceCard[] {
    return this._resources;
  }

  /**
   * Gets a specific resource by ID
   * @param id The ID of the resource to find
   * @returns The resource card or undefined if not found
   */
  public getResourceById(id: string): ResourceCard | undefined {
    return this._resources.find(resource => resource.id === id);
  }

  /**
   * Gets resources that are abundant in a specific season
   * @param season The season to check for abundance
   * @returns Array of resources abundant in the given season
   */
  public getResourcesBySeasonalAbundance(season: string): ResourceCard[] {
    return this._resources.filter(resource => 
      resource.seasonalAbundance.includes(season as any)
    );
  }

  /**
   * Gets all animal companion cards
   * @returns Array of all animal companion cards
   */
  public getAllAnimalCompanions(): AnimalCompanionCard[] {
    return this._animalCompanions;
  }

  /**
   * Gets a specific animal companion by ID
   * @param id The ID of the animal companion to find
   * @returns The animal companion card or undefined if not found
   */
  public getAnimalCompanionById(id: string): AnimalCompanionCard | undefined {
    return this._animalCompanions.find(companion => companion.id === id);
  }

  /**
   * Gets animal companions with affinity for a specific season
   * @param season The season to check for affinity
   * @returns Array of animal companions with affinity for the given season
   */
  public getAnimalCompanionsBySeasonAffinity(season: string): AnimalCompanionCard[] {
    return this._animalCompanions.filter(companion => 
      companion.affinitySeasons.includes(season as any)
    );
  }

  /**
   * Gets all crafted item cards
   * @returns Array of all crafted item cards
   */
  public getAllCraftedItems(): CraftedItemCard[] {
    return this._craftedItems;
  }

  /**
   * Gets a specific crafted item by ID
   * @param id The ID of the crafted item to find
   * @returns The crafted item card or undefined if not found
   */
  public getCraftedItemById(id: string): CraftedItemCard | undefined {
    return this._craftedItems.find(item => item.id === id);
  }

  /**
   * Gets all season cards
   * @returns Array of all season cards
   */
  public getAllSeasons(): SeasonCard[] {
    return this._seasons;
  }

  /**
   * Gets a specific season by ID
   * @param id The ID of the season to find
   * @returns The season card or undefined if not found
   */
  public getSeasonById(id: string): SeasonCard | undefined {
    return this._seasons.find(season => season.id === id);
  }

  /**
   * Gets all season cards (alias for getAllSeasons)
   * @returns Array of all season cards
   */
  public getSeasons(): SeasonCard[] {
    return this._seasons;
  }

  /**
   * Gets cards of a specific type
   * @param type The card type to filter by
   * @returns Array of cards of the specified type
   */
  public getCardsByType(type: CardType): any[] {
    switch (type) {
      case CardType.CHARACTER:
        return this._characters;
      case CardType.LANDSCAPE:
        return this._landscapes;
      case CardType.RESOURCE:
        return this._resources;
      case CardType.ANIMAL_COMPANION:
        return this._animalCompanions;
      case CardType.CRAFTED_ITEM:
        return this._craftedItems;
      case CardType.SEASON:
        return this._seasons;
      default:
        return [];
    }
  }

  /**
   * Validates that all data references across the game are valid
   * Returns array of error messages if any issues are found
   * @returns Array of error messages, empty if no issues found
   */
  public validateReferentialIntegrity(): string[] {
    const errors: string[] = [];

    // Validate crafted items have valid resources
    this._craftedItems.forEach(item => {
      if (item.requiredResources) {
        item.requiredResources.forEach(resourceId => {
          const resource = this.getResourceById(resourceId);
          if (!resource) {
            errors.push(`Crafted item ${item.name} (${item.id}) requires resource ${resourceId} which doesn't exist`);
          }
        });
      }
    });

    // Validate landscapes have valid challenge types
    this._landscapes.forEach(landscape => {
      if (landscape.challenges && landscape.challenges.length > 0) {
        landscape.challenges.forEach(challenge => {
          try {
            // Verify challenge type is standardized
            getStandardizedChallengeType(challenge.type);
          } catch (error) {
            errors.push(`Landscape ${landscape.name} (${landscape.id}) has invalid challenge type: ${challenge.type}`);
          }
        });
      }
      
      // Validate landscape companions
      if (landscape.animalCompanions) {
        landscape.animalCompanions.forEach(companionId => {
          const companion = this.getAnimalCompanionById(companionId);
          if (!companion) {
            errors.push(`Landscape ${landscape.name} (${landscape.id}) references companion ${companionId} which doesn't exist`);
          }
        });
      }
      
      // Validate landscape available resources
      if (landscape.availableResources) {
        landscape.availableResources.forEach(resourceId => {
          const resource = this.getResourceById(resourceId);
          if (!resource) {
            errors.push(`Landscape ${landscape.name} (${landscape.id}) offers resource ${resourceId} which doesn't exist`);
          }
        });
      }
    });

    // Validate seasons have valid resource/companion references
    this._seasons.forEach(season => {
      // Validate season ID matches enum values
      const matchesEnumValue = Object.values(Season).some(
        enumValue => enumValue === season.id
      );
      
      if (!matchesEnumValue) {
        errors.push(`Season ${season.name} (${season.id}) doesn't match any Season enum value - expected format like 'samhain' or 'wintersDepth'`);
      }
      
      // Check resource abundance references
      if (season.resourceAbundance) {
        season.resourceAbundance.forEach(resourceId => {
          const resource = this.getResourceById(resourceId);
          if (!resource) {
            errors.push(`Season ${season.name} (${season.id}) lists abundant resource ${resourceId} which doesn't exist`);
          }
        });
      }
      
      // Check resource scarcity references
      if (season.resourceScarcity) {
        season.resourceScarcity.forEach(resourceId => {
          const resource = this.getResourceById(resourceId);
          if (!resource) {
            errors.push(`Season ${season.name} (${season.id}) lists scarce resource ${resourceId} which doesn't exist`);
          }
        });
      }
      
      // Check animal affinity references
      if (season.animalAffinity) {
        season.animalAffinity.forEach(companionId => {
          const companion = this.getAnimalCompanionById(companionId);
          if (!companion) {
            errors.push(`Season ${season.name} (${season.id}) has affinity for companion ${companionId} which doesn't exist`);
          }
        });
      }
    });

    // Validate characters have valid starting resources and companions
    this._characters.forEach(character => {
      if (character.startingResources) {
        character.startingResources.forEach(resourceId => {
          const resource = this.getResourceById(resourceId);
          if (!resource) {
            errors.push(`Character ${character.name} (${character.id}) starts with resource ${resourceId} which doesn't exist`);
          }
        });
      }
      
      if (character.startingCompanions) {
        character.startingCompanions.forEach(companionId => {
          const companion = this.getAnimalCompanionById(companionId);
          if (!companion) {
            errors.push(`Character ${character.name} (${character.id}) starts with companion ${companionId} which doesn't exist`);
          }
        });
      }
    });

    // Validate animal companions have valid resource preferences
    this._animalCompanions.forEach(companion => {
      if (companion.preferredResources) {
        companion.preferredResources.forEach(resourceId => {
          const resource = this.getResourceById(resourceId);
          if (!resource) {
            errors.push(`Animal companion ${companion.name} (${companion.id}) prefers resource ${resourceId} which doesn't exist`);
          }
        });
      }
      
      // Check companion affinity seasons match enum values
      if (companion.affinitySeasons) {
        companion.affinitySeasons.forEach(seasonVal => {
          if (!Object.values(Season).includes(seasonVal as Season)) {
            errors.push(`Animal companion ${companion.name} (${companion.id}) has invalid season affinity: ${seasonVal}`);
          }
        });
      }
    });

    return errors;
  }

  /**
   * Resets the repository state
   * Reloads all card data from source
   */
  public reset(): void {
    this._characters = this._initializeCharacters();
    this._landscapes = this._initializeLandscapes();
    this._resources = this._initializeResources();
    this._animalCompanions = this._initializeAnimalCompanions();
    this._craftedItems = this._initializeCraftedItems();
    this._seasons = this._initializeSeasons();
  }
}

// Export a singleton instance for use throughout the application
export const cardRepository = new CardRepository();
