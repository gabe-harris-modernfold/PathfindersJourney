// Character data based on the game rules
export const characters = [
  {
    id: 'giant_beastfriend',
    name: 'Giant Beastfriend',
    description: 'A towering figure with a natural affinity for wild creatures, able to form bonds with even the most ferocious beasts.',
    abilities: [
      {
        name: 'Animal Empathy',
        description: 'Animal Companions cost -1 resource to bond with'
      },
      {
        name: 'Multiple Companions',
        description: 'May use two Animal Companions simultaneously'
      }
    ],
    startingItems: ['horse_hair', 'standing_stone_chips'],
    health: 7,
    resourceCapacity: 8,
    specialAction: {
      name: 'Wild Call',
      description: 'Once per journey, summon any animal companion temporarily without forming a permanent bond',
      uses: 1
    },
    image: 'giant_beastfriend.jpg',
    stats: {
      physical: 3,
      mental: 2,
      spiritual: 3,
      social: 1
    },
    weakness: 'Cannot use crafted items containing Bog Iron without penalty (-2 to related checks)'
  },
  {
    id: 'hedge_witch',
    name: 'Hedge Witch/Warlock',
    description: 'A practitioner of herbal magic and minor enchantments who dwells at the borderlands between civilization and wilderness.',
    abilities: [
      {
        name: 'Herbal Knowledge',
        description: 'Can substitute one resource for another when crafting'
      },
      {
        name: 'Extra Crafting',
        description: 'May craft one additional item beyond normal limits'
      }
    ],
    startingItems: ['silver_mistletoe', 'sacred_water'],
    health: 5,
    resourceCapacity: 7,
    specialAction: {
      name: 'Herbal Remedy',
      description: 'Once per journey, create a potion that heals 3 health or removes a negative effect',
      uses: 1
    },
    image: 'hedge_witch.jpg',
    stats: {
      physical: 1,
      mental: 3,
      spiritual: 4,
      social: 1
    },
    weakness: '-2 penalty on all social challenges in villages'
  },
  {
    id: 'iron_crafter',
    name: 'Iron Crafter',
    description: 'A master smith whose knowledge of metals and fire allows them to create items of remarkable power.',
    abilities: [
      {
        name: 'Master Smith',
        description: 'Crafting requires one fewer resource'
      },
      {
        name: 'Durable Crafting',
        description: 'Crafted items have one additional use before breaking'
      }
    ],
    startingItems: ['bog_iron', 'forge_cinders'],
    health: 6,
    resourceCapacity: 6,
    specialAction: {
      name: 'Forge Blessing',
      description: 'Once per journey, instantly craft any one item without requiring resources',
      uses: 1
    },
    image: 'iron_crafter.jpg',
    stats: {
      physical: 3,
      mental: 3,
      spiritual: 1,
      social: 2
    },
    weakness: 'Cannot use Animal Companions effectively (-1 to their abilities)'
  },
  {
    id: 'village_elder',
    name: 'Village Elder',
    description: 'A respected keeper of tradition and wisdom, whose connection to the community provides unique advantages.',
    abilities: [
      {
        name: 'Ancient Wisdom',
        description: 'Start with knowledge of entire journey path (all landscapes revealed at beginning)'
      },
      {
        name: 'Communal Aid',
        description: 'Can invoke communal aid once per season (automatic success on one challenge)'
      }
    ],
    startingItems: ['ogham_sticks', 'barrow_dust'],
    health: 5,
    resourceCapacity: 5,
    specialAction: {
      name: 'Ancestral Guidance',
      description: 'Once per journey, consult with ancestral spirits to avoid one negative outcome completely',
      uses: 1
    },
    image: 'village_elder.jpg',
    stats: {
      physical: 1,
      mental: 4,
      spiritual: 3,
      social: 3
    },
    weakness: 'Physical challenges are more difficult (+1 difficulty)'
  }
];

export default characters;
