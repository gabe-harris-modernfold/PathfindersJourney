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
        if (landscape.challenges) {
          // Convert landscape challenges to full challenge cards for compatibility
          const landscapeChallenges = landscape.challenges.map(challenge => ({
            id: `${landscape.id}_${challenge.type.toLowerCase()}`,
            name: `${landscape.name} ${challenge.type}`,
            description: `A ${challenge.type} challenge at ${landscape.name}`,
            type: challenge.type as ChallengeType,
            difficulty: challenge.difficulty,
            rewards: {
              resources: [],
              experience: 10,
              knowledge: landscape.id
            }
          }));
          return [...challenges, ...landscapeChallenges];
        }
        return challenges;
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
              description: land.challengeDescription || '',
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
      this.animalCompanions = [
        {
          id: 'companion_1',
          name: 'Raven',
          description: 'A wise bird associated with prophecy and insight.',
          type: CardType.ANIMAL_COMPANION,
          ability: {
            name: 'Far Sight',
            description: 'The raven scouts ahead, revealing dangers and opportunities.',
            effect: 'Preview the next landscape before traveling there.'
          },
          affinitySeasons: [Season.SAMHAIN, Season.WINTERS_DEPTH]
        },
        {
          id: 'companion_2',
          name: 'Wolf',
          description: 'A loyal pack animal with keen senses.',
          type: CardType.ANIMAL_COMPANION,
          ability: {
            name: 'Pack Hunter',
            description: 'The wolf helps track and hunt for resources.',
            effect: 'Gain an extra resource when gathering in a landscape.'
          },
          affinitySeasons: [Season.WINTERS_DEPTH, Season.IMBOLC]
        },
        {
          id: 'companion_3',
          name: 'Stag',
          description: 'A majestic forest dweller representing renewal and abundance.',
          type: CardType.ANIMAL_COMPANION,
          ability: {
            name: 'Forest Guide',
            description: 'The stag knows hidden paths through the wilderness.',
            effect: 'Reduce the difficulty of navigation challenges by 1.'
          },
          affinitySeasons: [Season.BELTANE, Season.LUGHNASADH]
        }
      ];
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
      this.seasons = [
        {
          id: 'season_1',
          name: 'Samhain',
          description: 'The Celtic new year, when the veil between worlds is thinnest.',
          type: CardType.SEASON,
          season: Season.SAMHAIN,
          abundantResources: ['resource_4'],
          scarceResources: ['resource_1', 'resource_5'],
          animalAffinities: ['companion_1'],
          effects: [
            {
              name: 'Thin Veil',
              description: 'The boundary between the mortal world and the Otherworld weakens.',
              effect: 'Wisdom challenges are easier, but unexpected spirits may appear.'
            }
          ]
        },
        {
          id: 'season_2',
          name: 'Winter\'s Depth',
          description: 'The coldest time of year, when survival is most challenging.',
          type: CardType.SEASON,
          season: Season.WINTERS_DEPTH,
          abundantResources: [],
          scarceResources: ['resource_1', 'resource_2', 'resource_5'],
          animalAffinities: ['companion_1', 'companion_2'],
          effects: [
            {
              name: 'Bitter Cold',
              description: 'The harsh weather tests endurance and resourcefulness.',
              effect: 'Lose 1 health at the end of each turn unless sheltered.'
            }
          ]
        },
        {
          id: 'season_3',
          name: 'Imbolc',
          description: 'The first stirrings of spring, a time of purification and renewal.',
          type: CardType.SEASON,
          season: Season.IMBOLC,
          abundantResources: ['resource_3'],
          scarceResources: [],
          animalAffinities: ['companion_2'],
          effects: [
            {
              name: 'Renewal',
              description: 'The land begins to awaken from winter\'s slumber.',
              effect: 'Heal 1 health at the start of each turn.'
            }
          ]
        },
        {
          id: 'season_4',
          name: 'Beltane',
          description: 'The height of spring, celebrating fertility and growth.',
          type: CardType.SEASON,
          season: Season.BELTANE,
          abundantResources: ['resource_1', 'resource_3', 'resource_5'],
          scarceResources: ['resource_4'],
          animalAffinities: ['companion_3'],
          effects: [
            {
              name: 'Abundant Growth',
              description: 'The land is lush with new life and energy.',
              effect: 'Gather one additional resource per turn.'
            }
          ]
        },
        {
          id: 'season_5',
          name: 'Lughnasadh',
          description: 'The harvest festival, celebrating the first fruits of the season.',
          type: CardType.SEASON,
          season: Season.LUGHNASADH,
          abundantResources: ['resource_1', 'resource_2', 'resource_5'],
          scarceResources: [],
          animalAffinities: ['companion_3'],
          effects: [
            {
              name: 'Harvest Bounty',
              description: 'The land provides abundant resources before winter.',
              effect: 'Resource capacity is increased by 2 during this season.'
            }
          ]
        }
      ];
    }
  }
});
