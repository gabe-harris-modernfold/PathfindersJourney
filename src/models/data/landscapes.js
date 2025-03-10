// Landscape data based on the game rules
export const landscapes = [
  {
    id: 'ancient_stone_circle',
    name: 'Ancient Stone Circle',
    challenge: 'Spectral Guardians',
    challengeType: 'mental',
    difficulty: 5,
    description: 'A circle of towering stones, humming with ancient power and guarded by spectral entities.',
    availableResources: ['standing_stone_chips', 'barrow_dust', 'amber_shards'],
    image: 'stone_circle.jpg'
  },
  {
    id: 'misty_barrow_downs',
    name: 'Misty Barrow Downs',
    challenge: 'Ancestral Spirits',
    challengeType: 'spiritual',
    difficulty: 6,
    description: 'Rolling hills shrouded in mist, dotted with ancient burial mounds where ancestral spirits linger.',
    availableResources: ['barrow_dust', 'ogham_sticks', 'amber_shards'],
    image: 'barrow_downs.jpg'
  },
  {
    id: 'sacred_oak_grove',
    name: 'Sacred Oak Grove',
    challenge: 'Wild Beasts',
    challengeType: 'physical',
    difficulty: 4,
    description: 'A grove of ancient oaks where wild beasts roam and protect the sacred trees.',
    availableResources: ['rowan_wood', 'oak_galls', 'silver_mistletoe'],
    image: 'oak_grove.jpg',
    companions: ['wolf', 'deer', 'bear', 'boar']
  },
  {
    id: 'thatched_village',
    name: 'Thatched Village',
    challenge: 'Suspicious Elders',
    challengeType: 'social',
    difficulty: 5,
    description: 'A small settlement of thatched roundhouses where elders are wary of outsiders.',
    availableResources: ['woven_reeds', 'horse_hair', 'rowan_wood'],
    image: 'village.jpg'
  },
  {
    id: 'iron_forge_dell',
    name: 'Iron Forge Dell',
    challenge: 'Molten Trials',
    challengeType: 'physical',
    difficulty: 7,
    description: 'A smoky valley where smiths work their forges, testing visitors with trials of heat and metal.',
    availableResources: ['bog_iron', 'forge_cinders', 'standing_stone_chips'],
    image: 'forge.jpg',
    craftingBonus: ['bog_iron']
  },
  {
    id: 'moonlit_loch',
    name: 'Moonlit Loch',
    challenge: 'Water Spirits',
    challengeType: 'spiritual',
    difficulty: 5,
    description: 'A serene lake reflecting the moon, home to mysterious water spirits.',
    availableResources: ['sacred_water', 'woven_reeds', 'silver_mistletoe'],
    image: 'loch.jpg',
    companions: ['salmon', 'owl'],
    craftingBonus: ['sacred_water'],
    healing: 2
  },
  {
    id: 'menhir_path',
    name: 'Menhir Path',
    challenge: 'Stone Sentinels',
    challengeType: 'perception',
    difficulty: 6,
    description: 'A path lined with standing stones that seem to shift positions when not observed directly.',
    availableResources: ['standing_stone_chips', 'barrow_dust', 'ogham_sticks'],
    image: 'menhir.jpg'
  },
  {
    id: 'faerie_knoll',
    name: 'Faerie Knoll',
    challenge: 'Trickster Beings',
    challengeType: 'cunning',
    difficulty: 7,
    description: 'A small hill where the veil between worlds is thin and trickster faeries delight in confounding travelers.',
    availableResources: ['silver_mistletoe', 'amber_shards', 'horse_hair'],
    image: 'faerie_knoll.jpg',
    companions: ['fox', 'hare']
  },
  {
    id: 'whispering_heath',
    name: 'Whispering Heath',
    challenge: 'Deceptive Paths',
    challengeType: 'navigation',
    difficulty: 5,
    description: 'A vast heathland where whispers on the wind lead travelers astray.',
    availableResources: ['woven_reeds', 'rowan_wood', 'oak_galls'],
    image: 'heath.jpg',
    companions: ['raven']
  },
  {
    id: 'blackthorn_maze',
    name: 'Blackthorn Maze',
    challenge: 'Thorny Barriers',
    challengeType: 'endurance',
    difficulty: 6,
    description: 'A labyrinth of thorny blackthorn bushes that test a traveler\'s endurance and determination.',
    availableResources: ['rowan_wood', 'horse_hair', 'bog_iron'],
    image: 'blackthorn.jpg'
  },
  {
    id: 'boggy_lowlands',
    name: 'Boggy Lowlands',
    challenge: 'Sinking Ground',
    challengeType: 'agility',
    difficulty: 5,
    description: 'Treacherous wetlands where the ground may give way beneath your feet at any moment.',
    availableResources: ['bog_iron', 'sacred_water', 'woven_reeds'],
    image: 'bog.jpg'
  },
  {
    id: 'gathering_fair',
    name: 'Gathering Fair',
    challenge: 'Rival Seekers',
    challengeType: 'trade',
    difficulty: 4,
    description: 'A bustling market where various Celtic tribes gather to trade goods and stories.',
    availableResources: ['horse_hair', 'woven_reeds', 'ogham_sticks'],
    image: 'fair.jpg'
  },
  {
    id: 'elder_bridge',
    name: 'Elder Bridge',
    challenge: 'Guardian Toll',
    challengeType: 'sacrifice',
    difficulty: 7,
    description: 'An ancient bridge guarded by spirits who demand a toll from all who wish to cross.',
    availableResources: ['standing_stone_chips', 'amber_shards', 'barrow_dust'],
    image: 'bridge.jpg'
  },
  {
    id: 'druids_sanctuary',
    name: 'Druid\'s Sanctuary',
    challenge: 'Wisdom Trial',
    challengeType: 'knowledge',
    difficulty: 8,
    description: 'A sacred grove where druids test visitors with trials of wisdom and knowledge.',
    availableResources: ['silver_mistletoe', 'oak_galls', 'ogham_sticks'],
    image: 'sanctuary.jpg',
    craftingBonus: ['standing_stone_chips'],
    healing: 2
  },
  {
    id: 'wild_horse_plain',
    name: 'Wild Horse Plain',
    challenge: 'Untamed Spirits',
    challengeType: 'connection',
    difficulty: 6,
    description: 'Vast grasslands where wild horses run free, embodying the untamed spirit of the land.',
    availableResources: ['horse_hair', 'woven_reeds', 'rowan_wood'],
    image: 'horse_plain.jpg',
    companions: ['horse']
  }
]
