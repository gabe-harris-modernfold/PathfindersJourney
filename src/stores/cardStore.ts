import { defineStore } from 'pinia';
import { CardType, ChallengeType } from '@/models/enums/cardTypes';
import { Season } from '@/models/enums/seasons';
import { 
  CharacterCard, 
  LandscapeCard, 
  AnimalCompanionCard, 
  ResourceCard, 
  CraftedItemCard, 
  SeasonCard,
  ChallengeCard
} from '@/models/types/cards';
import characters from '@/models/data/characters.js';
import landscapes from '@/models/data/landscapes.js';
import resources from '@/models/data/resources.js';
import companions from '@/models/data/companions.js';
import { seasons } from '@/models/data/seasons.js';

interface CardStoreState {
  characters: CharacterCard[];
  landscapes: LandscapeCard[];
  animalCompanions: AnimalCompanionCard[];
  resources: ResourceCard[];
  craftedItems: CraftedItemCard[];
  seasons: SeasonCard[];
  initialized: boolean;
}

export const useCardStore = defineStore('card', {
  state: (): CardStoreState => ({
    characters: [],
    landscapes: [],
    animalCompanions: [],
    resources: [],
    craftedItems: [],
    seasons: [],
    initialized: false
  }),
  
  getters: {
    getCharacterById: (state) => (id: string) => {
      return state.characters.find(character => character.id === id);
    },
    
    getLandscapeById: (state) => (id: string) => {
      return state.landscapes.find(landscape => landscape.id === id);
    },
    
    getAnimalCompanionById: (state) => (id: string) => {
      return state.animalCompanions.find(companion => companion.id === id);
    },
    
    getCompanionById: (state) => (id: string) => {
      return state.animalCompanions.find(companion => companion.id === id);
    },
    
    getResourceById: (state) => (id: string) => {
      return state.resources.find(resource => resource.id === id);
    },
    
    getCraftedItemById: (state) => (id: string) => {
      return state.craftedItems.find(item => item.id === id);
    },
    
    getSeasonById: (state) => (id: string) => {
      return state.seasons.find(season => season.id === id);
    },
    
    getChallengeById: (state) => (id: string) => {
      const allChallenges = state.landscapes.reduce((challenges, landscape) => {
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
    },
    
    getResourcesBySeason: (state) => (season: Season) => {
      return state.resources.filter(resource => 
        resource.seasonalAbundance.includes(season)
      );
    },
    
    getCompanionsBySeason: (state) => (season: Season) => {
      return state.animalCompanions.filter(companion => 
        companion.affinitySeasons.includes(season)
      );
    },
    
    getAllCraftedItems: (state) => () => {
      return state.craftedItems;
    },
    
    getCraftableItems: (state) => () => {
      return state.craftedItems.map(item => item.id);
    }
  },
  
  actions: {
    initializeCards() {
      // Initialize with sample data
      this.initializeCharacters();
      this.initializeLandscapes();
      this.initializeAnimalCompanions();
      this.initializeResources();
      this.initializeCraftedItems();
      this.initializeSeasons();
      
      this.initialized = true;
    },
    
    initializeCharacters() {
      try {
        // Characters are exported as both a named export and default export
        // Access the character data properly, matching the format in characters.js
        this.characters = characters.map((char: any) => ({
          id: char.id,
          name: char.name,
          description: char.description || '',
          type: CardType.CHARACTER,
          healthPoints: char.health || 5,
          strength: char.stats?.physical || 0,
          wisdom: char.stats?.mental || 0,
          agility: char.stats?.physical || 0,
          diplomacy: char.stats?.social || 0,
          survival: char.stats?.spiritual || 0,
          resourceCapacity: char.resourceCapacity || 5,
          specialAbility: {
            name: char.abilities?.[0]?.name || '',
            description: char.abilities?.[0]?.description || ''
          },
          startingResources: char.startingItems || [],
          startingCompanion: null,
          image: `/images/characters/${char.image || 'default_character.jpg'}`
        }));
      } catch (error) {
        console.error('Error loading characters:', error);
        this.characters = [];
      }
      
      // If characters weren't loaded properly, set default characters as fallback
      if (!this.characters || this.characters.length === 0) {
        this.characters = [
          {
            id: 'giant_beastfriend',
            name: 'Giant Beastfriend',
            description: 'A towering figure with a natural affinity for wild creatures.',
            type: CardType.CHARACTER,
            healthPoints: 6,
            strength: 3,
            wisdom: 2,
            agility: 1,
            diplomacy: 1,
            survival: 2,
            resourceCapacity: 5,
            specialAbility: {
              name: 'Animal Empathy',
              description: 'Animal Companions cost -1 resource to bond with'
            },
            startingResources: ['leather_strips', 'animal_feed'],
            startingCompanion: null,
            image: '/images/characters/giant.jpg'
          },
          {
            id: 'forest_druid',
            name: 'Forest Druid',
            description: 'A wise keeper of ancient natural knowledge.',
            type: CardType.CHARACTER,
            healthPoints: 5,
            strength: 1,
            wisdom: 3,
            agility: 2,
            diplomacy: 2,
            survival: 3,
            resourceCapacity: 6,
            specialAbility: {
              name: 'Nature\'s Wisdom',
              description: 'Healing herbs are twice as effective'
            },
            startingResources: ['healing_herbs', 'oak_staff'],
            startingCompanion: null,
            image: '/images/characters/druid.jpg'
          }
        ];
      }
    },
    
    initializeLandscapes() {
      try {
        // Map landscapes from landscapes.js data file
        this.landscapes = landscapes.map((landData) => {
          const land: any = landData;
          return {
            id: land.id,
            name: land.name,
            description: land.description || '',
            type: CardType.LANDSCAPE,
            challenge: {
              name: land.challenge || 'Unknown Challenge',
              description: land.challenge || '',
              type: land.challengeType as ChallengeType || ChallengeType.WISDOM,
              difficulty: land.difficulty || 5
            },
            availableResources: land.availableResources || [],
            craftingBonus: land.craftingBonus || [],
            companions: land.companions || [],
            healing: land.healing || 0,
            image: `/images/landscapes/${land.image || 'default_landscape.jpg'}`
          };
        });
        
        console.log('Landscapes initialized:', this.landscapes.length);
      } catch (error) {
        console.error('Error initializing landscapes:', error);
        // Set default landscapes if needed
        this.landscapes = [];
      }
    },
    
    initializeAnimalCompanions() {
      try {
        // Convert the companions data to the AnimalCompanionCard format
        this.animalCompanions = companions.map((comp: any) => ({
          id: comp.id, // Use the ID directly from companions.js without adding a suffix
          name: comp.name,
          description: comp.abilityDescription || '',
          type: CardType.ANIMAL_COMPANION,
          ability: {
            name: comp.ability || '',
            description: comp.abilityDescription || '',
            effect: comp.abilityFunction ? 'Custom effect' : ''
          },
          preferredResources: comp.preferredResources || [],
          affinitySeasons: comp.seasonalAffinity?.map((season: string) => {
            // Convert season strings to Season enum values
            switch(season.toLowerCase()) {
              case 'samhain': return Season.SAMHAIN;
              case 'winters_depth': return Season.WINTERS_DEPTH;
              case 'imbolc': return Season.IMBOLC;
              case 'beltane': return Season.BELTANE;
              case 'lughnasadh': return Season.LUGHNASADH;
              default: return Season.SAMHAIN;
            }
          }) || []
        }));
        
        console.log(`Loaded ${this.animalCompanions.length} animal companions from data file`);
      } catch (error) {
        console.error('Error loading animal companions from data file:', error);
        // Fallback to hardcoded companions if there's an error
        this.animalCompanions = [
          {
            id: 'raven',
            name: 'Raven',
            description: 'A wise bird associated with prophecy and insight.',
            type: CardType.ANIMAL_COMPANION,
            ability: {
              name: 'Far Sight',
              description: 'The raven scouts ahead, revealing dangers and opportunities.',
              effect: 'Preview the next landscape before traveling there.'
            },
            preferredResources: [],
            affinitySeasons: [Season.SAMHAIN, Season.WINTERS_DEPTH]
          },
          {
            id: 'wolf',
            name: 'Wolf',
            description: 'A loyal pack animal with keen senses.',
            type: CardType.ANIMAL_COMPANION,
            ability: {
              name: 'Pack Hunter',
              description: 'The wolf helps track and hunt for resources.',
              effect: 'Gain an extra resource when gathering in a landscape.'
            },
            preferredResources: [],
            affinitySeasons: [Season.WINTERS_DEPTH, Season.IMBOLC]
          },
          {
            id: 'deer',
            name: 'Stag',
            description: 'A majestic forest dweller representing renewal and abundance.',
            type: CardType.ANIMAL_COMPANION,
            ability: {
              name: 'Forest Guide',
              description: 'The stag knows hidden paths through the wilderness.',
              effect: 'Reduce the difficulty of navigation challenges by 1.'
            },
            preferredResources: [],
            affinitySeasons: [Season.BELTANE, Season.LUGHNASADH]
          }
        ];
      }
    },
    
    initializeResources() {
      try {
        // Map resources from resources.js to ResourceCard format
        this.resources = resources.map((res: any) => ({
          id: res.id,
          name: res.name,
          description: res.description || '',
          type: CardType.RESOURCE,
          rarity: 'common', // Default rarity
          seasonalAbundance: [], // Default seasonal abundance
          specialEffect: res.useEffect ? {
            name: res.effect || 'Special Effect',
            description: res.description || '',
            effect: res.useEffect || ''
          } : undefined
        }));
        
        console.log('Resources initialized:', this.resources.length);
      } catch (error) {
        console.error('Error initializing resources:', error);
        // Set default resources if needed
        this.resources = [];
      }
    },
    
    initializeCraftedItems() {
      this.craftedItems = [
        {
          id: 'item_1',
          name: 'Herbal Poultice',
          description: 'A medicinal wrap made from healing herbs.',
          type: CardType.CRAFTED_ITEM,
          requiredResources: ['sacred_water', 'oak_galls'],
          complexity: 1,
          ability: {
            name: 'Healing Touch',
            description: 'Applies healing herbs directly to wounds.',
            effect: 'Restore 2 health when used.'
          }
        },
        {
          id: 'item_2',
          name: 'Oak Staff',
          description: 'A sturdy staff carved from sacred oak wood.',
          type: CardType.CRAFTED_ITEM,
          requiredResources: ['rowan_wood'],
          complexity: 2,
          ability: {
            name: 'Nature\'s Authority',
            description: 'The staff channels the power of the oak.',
            effect: 'Add +1 to all wisdom challenges.'
          },
          drawback: {
            description: 'The staff is heavy and cumbersome.',
            effect: 'Reduce resource capacity by 1 while carried.'
          }
        },
        {
          id: 'item_3',
          name: 'Iron Blade',
          description: 'A simple but effective weapon forged from iron.',
          type: CardType.CRAFTED_ITEM,
          requiredResources: ['bog_iron', 'forge_cinders'],
          complexity: 3,
          ability: {
            name: 'Sharp Edge',
            description: 'The blade cuts through obstacles with ease.',
            effect: 'Add +2 to strength challenges.'
          }
        },
        {
          id: 'item_4',
          name: 'Ogham Talisman',
          description: 'A protective charm carved with ancient druidic symbols.',
          type: CardType.CRAFTED_ITEM,
          requiredResources: ['ogham_sticks', 'amber_shards'],
          complexity: 2,
          ability: {
            name: 'Ancient Protection',
            description: 'The talisman wards against spiritual threats.',
            effect: 'Reduce threat accumulation by 1 during Otherworldly manifestations.'
          }
        },
        {
          id: 'item_5',
          name: 'Crystal Focus',
          description: 'A crystal that helps concentrate magical energies.',
          type: CardType.CRAFTED_ITEM,
          requiredResources: ['ancient_crystal'],
          complexity: 2,
          ability: {
            name: 'Mental Clarity',
            description: 'The crystal enhances mental abilities.',
            effect: '+2 to mental challenges.'
          }
        },
        {
          id: 'item_6',
          name: 'Witch\'s Brew',
          description: 'A potent magical concoction.',
          type: CardType.CRAFTED_ITEM,
          requiredResources: ['sacred_water', 'barrow_dust'],
          complexity: 1,
          ability: {
            name: 'Magical Enhancement',
            description: 'Temporarily enhances magical abilities.',
            effect: 'One-time +3 to any spiritual challenge.'
          }
        }
      ];
    },
    
    initializeSeasons() {
      try {
        this.seasons = seasons.map((seasonData: any) => {
          // Map the ID to the corresponding Season enum value
          let seasonEnum: Season;
          switch(seasonData.id) {
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
              seasonEnum = Season.SAMHAIN; // Default fallback
          }
          
          return {
            id: seasonData.id,
            name: seasonData.name,
            description: seasonData.description || '',
            type: CardType.SEASON,
            season: seasonEnum,
            abundantResources: seasonData.resourceAbundance || [],
            scarceResources: seasonData.resourceScarcity || [],
            animalAffinities: seasonData.animalAffinity || [],
            effects: [
              {
                name: seasonData.quest?.name || '',
                description: seasonData.effect || '',
                effect: seasonData.benefit || ''
              }
            ]
          };
        });
        
        console.log('Seasons initialized:', this.seasons.length);
      } catch (error) {
        console.error('Error initializing seasons:', error);
        this.seasons = [];
      }
    }
  }
});
