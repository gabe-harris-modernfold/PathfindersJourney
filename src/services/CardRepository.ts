import { 
  CharacterCard, 
  LandscapeCard, 
  ResourceCard, 
  AnimalCompanionCard, 
  CraftedItemCard, 
  SeasonCard 
} from '@/models/types/cards.js';
import { CardType } from '@/models/enums/cardTypes.js';
import { Season } from '@/models/enums/seasons';
import { getStandardizedChallengeType } from '@/utils/typeMapping';

// Import the data from models/data directory
import characters from '@/models/data/characters.js';
import landscapes from '@/models/data/landscapes.js';
import resources from '@/models/data/resources.js';
import companions from '@/models/data/companions.js';
import craftedItems from '@/models/data/crafted-items.js';
import seasons from '@/models/data/seasons.js';

export class CardRepository {
  private characters: CharacterCard[];
  private landscapes: LandscapeCard[];
  private resources: ResourceCard[];
  private animalCompanions: AnimalCompanionCard[];
  private craftedItems: CraftedItemCard[];
  private seasons: SeasonCard[];

  constructor() {
    // Map the data to the correct types
    this.characters = characters.map(char => ({
      id: char.id,
      name: char.name,
      description: char.description,
      type: CardType.CHARACTER,
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
      image: char.image || 'default_character.jpg'
    }));

    this.landscapes = landscapes.map(land => ({
      id: land.id,
      name: land.name,
      description: land.description || '',
      type: CardType.LANDSCAPE,
      challenge: land.challenge || '',
      challengeType: land.challengeType || '',
      difficulty: land.difficulty || 0,
      challenges: land.challenges ? land.challenges.map(challenge => ({
        type: challenge.type || '',
        difficulty: challenge.difficulty || 0
      })) : [],
      availableResources: land.availableResources || [],
      specialFeature: land.specialFeature,
      image: land.image || 'default_landscape.jpg'
    }));

    this.resources = resources.map(res => ({
      id: res.id,
      name: res.name,
      description: res.description || '',
      type: CardType.RESOURCE,
      resourceType: res.type || '',
      effect: {
        name: res.effect?.name || '',
        description: res.effect?.description || ''
      },
      season: res.season || '',
      rarity: res.rarity || 'common',
      seasonalAbundance: res.seasonalAbundance || [],
      specialEffect: res.specialEffect,
      image: res.image || 'default_resource.jpg'
    }));

    this.animalCompanions = companions.map(comp => ({
      id: comp.id,
      name: comp.name,
      description: comp.description || '',
      type: CardType.ANIMAL_COMPANION,
      ability: {
        name: comp.ability?.name || '',
        description: comp.ability?.description || ''
      },
      affinitySeasons: comp.affinitySeasons || [],
      preferredResources: comp.preferredResources || [],
      image: comp.image || 'default_companion.jpg'
    }));

    this.craftedItems = craftedItems.map(item => ({
      id: item.id,
      name: item.name,
      description: item.description || '',
      type: CardType.CRAFTED_ITEM,
      requiredResources: item.requiredResources || [],
      complexity: item.complexity || 1,
      ability: {
        name: item.ability?.name || '',
        description: item.ability?.description || '',
        type: item.ability?.type
      },
      drawback: item.drawback,
      image: item.image || 'default_crafted_item.jpg'
    }));

    this.seasons = seasons.map(season => {
      // Convert string season id to Season enum value
      let seasonEnum: Season;
      switch(season.id) {
        case 'samhain':
          seasonEnum = Season.SAMHAIN;
          break;
        case 'wintersDepth':
          seasonEnum = Season.WINTERS_DEPTH;
          break;
        case 'imbolc':
          seasonEnum = Season.IMBOLC;
          break;
        case 'beltane':
          seasonEnum = Season.BELTANE;
          break;
        case 'lughnasadh':
          seasonEnum = Season.LUGHNASADH;
          break;
        default:
          console.warn(`Unknown season id: ${season.id}, defaulting to Samhain`);
          seasonEnum = Season.SAMHAIN;
      }
      
      return {
        id: season.id,
        name: season.name,
        description: season.description || '',
        type: CardType.SEASON,
        effect: season.effect || '',
        benefit: season.benefit || '',
        season: seasonEnum, // Use the enum value
        resourceAbundance: season.resourceAbundance || [],
        resourceScarcity: season.resourceScarcity || [],
        animalAffinity: season.animalAffinity || [],
        abundantResources: season.resourceAbundance || [],
        scarceResources: season.resourceScarcity || [],
        animalAffinities: season.animalAffinity || [],
        effects: season.effects || [],
        modifiers: season.modifiers || { spiritual: 0, physical: 0, mental: 0, social: 0 },
        quest: season.quest,
        image: season.image || 'default_season.jpg'
      };
    });
  }

  // Character methods
  public getAllCharacters(): CharacterCard[] {
    return this.characters;
  }

  public getCharacterById(id: string): CharacterCard | undefined {
    return this.characters.find(character => character.id === id);
  }

  public getCharacterHealth(id: string): number {
    const character = this.getCharacterById(id);
    return character ? character.healthPoints : 0;
  }

  // Landscape methods
  public getAllLandscapes(): LandscapeCard[] {
    return this.landscapes;
  }

  public getLandscapeById(id: string): LandscapeCard | undefined {
    return this.landscapes.find(landscape => landscape.id === id);
  }

  // Resource methods
  public getAllResources(): ResourceCard[] {
    return this.resources;
  }

  public getResourceById(id: string): ResourceCard | undefined {
    return this.resources.find(resource => resource.id === id);
  }

  public getResourcesBySeasonalAbundance(season: string): ResourceCard[] {
    return this.resources.filter(resource => 
      resource.seasonalAbundance.includes(season as any)
    );
  }

  // Animal Companion methods
  public getAllAnimalCompanions(): AnimalCompanionCard[] {
    return this.animalCompanions;
  }

  public getAnimalCompanionById(id: string): AnimalCompanionCard | undefined {
    return this.animalCompanions.find(companion => companion.id === id);
  }

  public getAnimalCompanionsBySeasonAffinity(season: string): AnimalCompanionCard[] {
    return this.animalCompanions.filter(companion => 
      companion.affinitySeasons.includes(season as any)
    );
  }

  // Crafted Item methods
  public getAllCraftedItems(): CraftedItemCard[] {
    return this.craftedItems;
  }

  public getCraftedItemById(id: string): CraftedItemCard | undefined {
    return this.craftedItems.find(item => item.id === id);
  }

  // Season methods
  public getAllSeasons(): SeasonCard[] {
    return this.seasons;
  }

  public getSeasonById(id: string): SeasonCard | undefined {
    return this.seasons.find(season => season.id === id);
  }

  public getSeasons(): SeasonCard[] {
    return this.seasons;
  }

  // Generic card getter by type
  public getCardsByType(type: CardType): any[] {
    switch (type) {
      case CardType.CHARACTER:
        return this.characters;
      case CardType.LANDSCAPE:
        return this.landscapes;
      case CardType.RESOURCE:
        return this.resources;
      case CardType.ANIMAL_COMPANION:
        return this.animalCompanions;
      case CardType.CRAFTED_ITEM:
        return this.craftedItems;
      case CardType.SEASON:
        return this.seasons;
      default:
        return [];
    }
  }

  /**
   * Validates that all data references across the game are valid
   * Returns array of error messages if any issues are found
   */
  public validateReferentialIntegrity(): string[] {
    const errors: string[] = [];

    // Validate crafted items have valid resources
    this.craftedItems.forEach(item => {
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
    this.landscapes.forEach(landscape => {
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
    this.seasons.forEach(season => {
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
    this.characters.forEach(character => {
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
    this.animalCompanions.forEach(companion => {
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
}

// Export a singleton instance for use throughout the application
export const cardRepository = new CardRepository();
