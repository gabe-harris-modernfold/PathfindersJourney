// Resource data based on the game rules
export const resources = [
  {
    id: 'rowan_wood',
    name: 'Rowan Wood',
    effect: 'Wards against supernatural threats',
    type: 'protective',
    description: 'Sacred wood that provides protection against supernatural entities.',
    image: 'rowan_wood.jpg',
    useEffect: 'Prevent 1 additional Threat token accumulation'
  },
  {
    id: 'bog_iron',
    name: 'Bog Iron',
    effect: 'Strengthens crafted items',
    type: 'crafting_base',
    description: 'Iron extracted from bogs, known for its unique properties in crafting.',
    image: 'bog_iron.jpg',
    preferredBy: ['wolf']
  },
  {
    id: 'silver_mistletoe',
    name: 'Silver Mistletoe',
    effect: 'Opens pathways between worlds',
    type: 'spiritual',
    description: 'Rare mistletoe with silver-tinted leaves that can bridge the gap between worlds.',
    image: 'silver_mistletoe.jpg',
    preferredBy: ['deer']
  },
  {
    id: 'standing_stone_chips',
    name: 'Standing Stone Chips',
    effect: 'Enhances divination abilities',
    type: 'mystic',
    description: 'Small fragments from ancient standing stones, imbued with divinatory power.',
    image: 'stone_chips.jpg',
    preferredBy: ['raven']
  },
  {
    id: 'woven_reeds',
    name: 'Woven Reeds',
    effect: 'Creates protective barriers',
    type: 'protective',
    description: 'Specially woven reeds that can create magical barriers when properly arranged.',
    image: 'woven_reeds.jpg',
    preferredBy: ['hare']
  },
  {
    id: 'horse_hair',
    name: 'Horse Hair',
    effect: 'Binds magical energies',
    type: 'binding',
    description: 'Hair from wild horses that can bind magical energies when woven into patterns.',
    image: 'horse_hair.jpg',
    preferredBy: ['horse']
  },
  {
    id: 'oak_galls',
    name: 'Oak Galls',
    effect: 'Preserves magical properties',
    type: 'crafting_base',
    description: 'Growths from oak trees that preserve the magical properties of other materials.',
    image: 'oak_galls.jpg',
    preferredBy: ['boar']
  },
  {
    id: 'amber_shards',
    name: 'Amber Shards',
    effect: 'Stores spiritual energy',
    type: 'binding',
    description: 'Fragments of amber that can store spiritual energy for later use.',
    image: 'amber_shards.jpg',
    preferredBy: ['fox']
  },
  {
    id: 'barrow_dust',
    name: 'Barrow Dust',
    effect: 'Communes with ancestral spirits',
    type: 'spiritual',
    description: 'Dust gathered from ancient burial mounds, allowing communion with ancestral spirits.',
    image: 'barrow_dust.jpg',
    useEffect: 'Commune with spirits for hints',
    preferredBy: ['owl']
  },
  {
    id: 'forge_cinders',
    name: 'Forge Cinders',
    effect: 'Transforms magical properties',
    type: 'elemental',
    description: 'Cinders from a sacred forge that can transform the magical properties of other materials.',
    image: 'forge_cinders.jpg',
    preferredBy: ['bear']
  },
  {
    id: 'sacred_water',
    name: 'Sacred Water',
    effect: 'Purifies corrupted elements',
    type: 'elemental',
    description: 'Water from sacred springs that can purify corrupted elements and heal wounds.',
    image: 'sacred_water.jpg',
    useEffect: 'Remove 1 Threat token or heal 1 Health',
    preferredBy: ['salmon']
  },
  {
    id: 'ogham_sticks',
    name: 'Ogham Sticks',
    effect: 'Deciphers magical writing',
    type: 'mystic',
    description: 'Wooden sticks inscribed with Ogham symbols, used to decipher magical writings.',
    image: 'ogham_sticks.jpg',
    preferredBy: ['deer']
  },
  {
    id: 'ancient_crystal',
    name: 'Ancient Crystal',
    effect: 'Amplifies spiritual energy',
    type: 'mystic',
    description: 'A valuable crystal with properties that can amplify magical energies.',
    image: 'ancient_crystal.jpg',
    preferredBy: ['owl']
  }
]

export default resources;
