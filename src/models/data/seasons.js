// Seasons data based on the game rules
export const seasons = [
  {
    id: 'samhain',
    name: 'Samhain',
    description: 'Winter Beginning - The veil between worlds is thin during this season.',
    effect: 'Spiritual challenges are harder (+2 difficulty)',
    benefit: 'Ancestral guidance available (may consult discard pile once)',
    resourceAbundance: ['barrow_dust', 'standing_stone_chips'],
    resourceScarcity: ['woven_reeds', 'rowan_wood'],
    animalAffinity: ['wolf', 'raven', 'owl'],
    image: 'samhain.jpg',
    modifiers: {
      spiritual: 2,
      physical: 0,
      mental: 0,
      social: 0
    },
    quest: {
      name: 'Honor the Ancestors',
      location: 'misty_barrow_downs',
      requirement: 'Make an offering of Barrow Dust',
      reward: 'Gain the protection of an ancestor (+1 to all challenges until next season)'
    }
  },
  {
    id: 'wintersDepth',
    name: 'Winter\'s Depth',
    description: 'The coldest and harshest part of winter tests your endurance.',
    effect: 'Physical challenges are harder (+2 difficulty)',
    benefit: 'Clearer thinking in stillness (+1 to wisdom challenges)',
    resourceAbundance: ['forge_cinders', 'bog_iron'],
    resourceScarcity: ['sacred_water', 'horse_hair'],
    animalAffinity: ['wolf', 'raven', 'owl'],
    image: 'winters_depth.jpg',
    modifiers: {
      spiritual: 0,
      physical: 2,
      mental: -1,
      social: 0
    },
    quest: {
      name: 'Forge of Endurance',
      location: 'iron_forge_dell',
      requirement: 'Craft an item containing Bog Iron',
      reward: 'Gain +1 max Health permanently'
    }
  },
  {
    id: 'imbolc',
    name: 'Imbolc',
    description: 'Spring Stirrings - The first signs of spring bring renewal and hope.',
    effect: 'Renewal energy makes healing more effective (recover +1 Health)',
    benefit: 'New growth provides hope (+1 to all challenge rolls)',
    resourceAbundance: ['silver_mistletoe', 'sacred_water'],
    resourceScarcity: ['barrow_dust', 'forge_cinders'],
    animalAffinity: ['hare', 'deer', 'salmon'],
    image: 'imbolc.jpg',
    modifiers: {
      spiritual: 0,
      physical: 0,
      mental: 0,
      social: 0,
      all: 1 // +1 to all challenge rolls
    },
    quest: {
      name: 'Awakening the Land',
      location: 'sacred_oak_grove',
      requirement: 'Plant a seed (discard Oak Galls)',
      reward: 'Remove 3 Threat tokens'
    }
  },
  {
    id: 'beltane',
    name: 'Beltane',
    description: 'Summer Beginning - The height of life energy and fertility.',
    effect: 'Vibrant energy enhances all crafting (crafted items gain +1 use)',
    benefit: 'Life force is strong (max Health increased by 1)',
    resourceAbundance: ['rowan_wood', 'oak_galls'],
    resourceScarcity: ['standing_stone_chips', 'amber_shards'],
    animalAffinity: ['fox', 'horse', 'bear'],
    image: 'beltane.jpg',
    modifiers: {
      spiritual: 0,
      physical: 0,
      mental: 0,
      social: 0
    },
    quest: {
      name: 'Sacred Union',
      location: 'faerie_knoll',
      requirement: 'Successfully complete a challenge with two different Animal Companions',
      reward: 'Gain a unique Blessing token that can be used twice'
    }
  },
  {
    id: 'lughnasadh',
    name: 'Lughnasadh',
    description: 'Harvest Beginning - The first harvest brings abundance and community.',
    effect: 'Gathering time (collect +1 Resource when successful)',
    benefit: 'Community support (double the effectiveness of healing)',
    resourceAbundance: ['horse_hair', 'woven_reeds', 'ogham_sticks'],
    resourceScarcity: ['bog_iron', 'silver_mistletoe'],
    animalAffinity: ['boar'],
    image: 'lughnasadh.jpg',
    modifiers: {
      spiritual: 0,
      physical: 0,
      mental: 0,
      social: -1 // Easier social challenges due to community support
    },
    quest: {
      name: 'First Harvest',
      location: 'gathering_fair',
      requirement: 'Trade 3 resources for 1 Crafted Item component',
      reward: 'Gain +1 Resource capacity permanently'
    }
  }
]
