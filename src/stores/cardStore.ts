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
      this.characters = [
        {
          id: 'character_1',
          name: 'The Druid',
          description: 'A keeper of ancient wisdom with a deep connection to nature.',
          type: CardType.CHARACTER,
          healthPoints: 8,
          strength: 6,
          wisdom: 10,
          agility: 6,
          diplomacy: 8,
          survival: 9,
          resourceCapacity: 6,
          image: '/images/characters/druid.jpg',
          specialAbility: {
            name: 'Nature\'s Harmony',
            description: 'Can communicate with animals to gain insights about the landscape.'
          },
          startingResources: ['resource_1', 'resource_5'],
          startingCompanion: 'companion_1'
        },
        {
          id: 'character_2',
          name: 'The Warrior',
          description: 'A brave fighter skilled in combat and survival.',
          type: CardType.CHARACTER,
          healthPoints: 12,
          strength: 10,
          wisdom: 6,
          agility: 8,
          diplomacy: 5,
          survival: 8,
          resourceCapacity: 4,
          image: '/images/characters/warrior.jpg',
          specialAbility: {
            name: 'Battle Prowess',
            description: 'Years of training have honed combat skills to perfection.'
          },
          startingResources: ['resource_2', 'resource_3']
        },
        {
          id: 'character_3',
          name: 'The Bard',
          description: 'A storyteller who carries the history and legends of the Celtic people.',
          type: CardType.CHARACTER,
          healthPoints: 6,
          strength: 5,
          wisdom: 9,
          agility: 7,
          diplomacy: 10,
          survival: 7,
          resourceCapacity: 8,
          image: '/images/characters/bard.jpg',
          specialAbility: {
            name: 'Ancient Tales',
            description: 'Knowledge of old stories reveals secrets of the land.'
          },
          startingResources: ['resource_4', 'resource_7', 'resource_9']
        },
        {
          id: 'giant_beastfriend',
          name: 'Giant Beastfriend',
          description: 'A towering figure with a natural affinity for wild creatures, able to form bonds with even the most ferocious beasts.',
          type: CardType.CHARACTER,
          healthPoints: 7,
          strength: 8,
          wisdom: 7,
          agility: 5,
          diplomacy: 4,
          survival: 9,
          resourceCapacity: 8,
          image: '/images/characters/giant_beastfriend.jpg',
          specialAbility: {
            name: 'Animal Empathy',
            description: 'Animal Companions cost -1 resource to bond with'
          },
          startingResources: ['resource_3', 'resource_6'],
          challengeBonuses: {
            'physical': 3,
            'mental': 2,
            'spiritual': 3,
            'social': 1
          }
        },
        {
          id: 'hedge_witch',
          name: 'Hedge Witch/Warlock',
          description: 'A practitioner of herbal magic and minor enchantments who dwells at the borderlands between civilization and wilderness.',
          type: CardType.CHARACTER,
          healthPoints: 5,
          strength: 4,
          wisdom: 10,
          agility: 6,
          diplomacy: 5,
          survival: 8,
          resourceCapacity: 7,
          image: '/images/characters/hedge_witch.jpg',
          specialAbility: {
            name: 'Herbal Knowledge',
            description: 'Can substitute one resource for another when crafting'
          },
          startingResources: ['resource_8', 'resource_10'],
          challengeBonuses: {
            'physical': 1,
            'mental': 3,
            'spiritual': 4,
            'social': 1
          }
        },
        {
          id: 'iron_crafter',
          name: 'Iron Crafter',
          description: 'A master smith whose knowledge of metals and fire allows them to create items of remarkable power.',
          type: CardType.CHARACTER,
          healthPoints: 6,
          strength: 7,
          wisdom: 8,
          agility: 5,
          diplomacy: 6,
          survival: 6,
          resourceCapacity: 6,
          image: '/images/characters/iron_crafter.jpg',
          specialAbility: {
            name: 'Master Smith',
            description: 'Crafting requires one fewer resource'
          },
          startingResources: ['resource_2', 'resource_5'],
          challengeBonuses: {
            'physical': 3,
            'mental': 3,
            'spiritual': 1,
            'social': 2
          }
        },
        {
          id: 'village_elder',
          name: 'Village Elder',
          description: 'A respected keeper of tradition and wisdom, whose connection to the community provides unique advantages.',
          type: CardType.CHARACTER,
          healthPoints: 5,
          strength: 3,
          wisdom: 12,
          agility: 4,
          diplomacy: 9,
          survival: 7,
          resourceCapacity: 5,
          image: '/images/characters/village_elder.jpg',
          specialAbility: {
            name: 'Ancient Wisdom',
            description: 'Start with knowledge of entire journey path (all landscapes revealed at beginning)'
          },
          startingResources: ['resource_7', 'resource_9'],
          challengeBonuses: {
            'physical': 1,
            'mental': 4,
            'spiritual': 3,
            'social': 3
          }
        }
      ];
    },
    
    initializeLandscapes() {
      this.landscapes = [
        {
          id: 'landscape_1',
          name: 'The Misty Forest',
          description: 'An ancient woodland shrouded in mist where spirits are said to dwell.',
          type: CardType.LANDSCAPE,
          challenges: [
            {
              id: 'challenge_1',
              name: 'Lost Path',
              description: 'The mist has obscured the path, making navigation difficult.',
              type: ChallengeType.WISDOM,
              difficulty: 2,
              rewards: {
                resources: ['resource_1', 'resource_5'],
                experience: 1
              }
            },
            {
              id: 'challenge_2',
              name: 'Forest Guardian',
              description: 'A mysterious entity blocks your path, demanding a tribute.',
              type: ChallengeType.DIPLOMACY,
              difficulty: 3,
              rewards: {
                resources: ['resource_7'],
                experience: 2,
                knowledge: 'The forest spirits value respect above all else.'
              }
            }
          ],
          availableResources: ['resource_1', 'resource_5', 'resource_8'],
          specialFeature: {
            name: 'Ancient Grove',
            description: 'A sacred place where druids once gathered.',
            effect: 'Heal 1 health if you spend a turn meditating here.'
          }
        },
        {
          id: 'landscape_2',
          name: 'The Standing Stones',
          description: 'A circle of megalithic stones humming with ancient power.',
          type: CardType.LANDSCAPE,
          challenges: [
            {
              id: 'challenge_3',
              name: 'Ritual Alignment',
              description: 'The stones must be aligned with the stars to unlock their power.',
              type: ChallengeType.WISDOM,
              difficulty: 4,
              rewards: {
                resources: ['resource_10'],
                experience: 2,
                knowledge: 'The stones align with the seasonal transitions.'
              }
            }
          ],
          availableResources: ['resource_2', 'resource_10'],
          specialFeature: {
            name: 'Ley Line Nexus',
            description: 'A powerful convergence of earth energies.',
            effect: 'Your special ability can be used twice in this location.'
          }
        }
      ];
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
      this.resources = [
        {
          id: 'resource_1',
          name: 'Healing Herbs',
          description: 'Plants with medicinal properties that can restore health.',
          type: CardType.RESOURCE,
          rarity: 'common',
          seasonalAbundance: [Season.BELTANE, Season.LUGHNASADH],
          specialEffect: {
            name: 'Herbal Remedy',
            description: 'A poultice made from these herbs can heal wounds.',
            effect: 'Restore 1 health when used.'
          }
        },
        {
          id: 'resource_2',
          name: 'Sacred Oak Wood',
          description: 'Wood from the revered oak tree, imbued with strength.',
          type: CardType.RESOURCE,
          rarity: 'uncommon',
          seasonalAbundance: [Season.LUGHNASADH]
        },
        {
          id: 'resource_3',
          name: 'Iron Ore',
          description: 'Raw metal used for crafting tools and weapons.',
          type: CardType.RESOURCE,
          rarity: 'uncommon',
          seasonalAbundance: [Season.IMBOLC, Season.BELTANE]
        },
        {
          id: 'resource_4',
          name: 'Mistletoe',
          description: 'A parasitic plant considered sacred by the druids.',
          type: CardType.RESOURCE,
          rarity: 'rare',
          seasonalAbundance: [Season.WINTERS_DEPTH],
          specialEffect: {
            name: 'Druidic Focus',
            description: 'Enhances spiritual connection when used in rituals.',
            effect: 'Add +1 to wisdom challenges when used.'
          }
        },
        {
          id: 'resource_5',
          name: 'Wild Berries',
          description: 'Nutritious forest fruits that provide sustenance.',
          type: CardType.RESOURCE,
          rarity: 'common',
          seasonalAbundance: [Season.BELTANE, Season.LUGHNASADH]
        }
      ];
    },
    
    initializeCraftedItems() {
      this.craftedItems = [
        {
          id: 'item_1',
          name: 'Herbal Poultice',
          description: 'A medicinal wrap made from healing herbs.',
          type: CardType.CRAFTED_ITEM,
          requiredResources: ['resource_1', 'resource_5'],
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
          requiredResources: ['resource_2'],
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
          requiredResources: ['resource_3'],
          complexity: 3,
          ability: {
            name: 'Sharp Edge',
            description: 'The blade cuts through obstacles with ease.',
            effect: 'Add +2 to strength challenges.'
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
