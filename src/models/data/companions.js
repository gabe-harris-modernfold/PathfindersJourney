// Animal Companions data based on the game rules
const companions = [
  {
    id: 'raven',
    name: 'Raven Scout',
    ability: 'Reveal next Landscape card',
    abilityDescription: 'The Raven flies ahead to scout the path, revealing the next landscape you will encounter.',
    preferredResources: ['standing_stone_chips', 'barrow_dust', 'ogham_sticks', 'sacred_water', 'amber_shards', 'horse_hair'],
    seasonalAffinity: ['samhain', 'winters_depth'],
    image: 'raven.jpg',
    findLocation: 'ancient_stone_circle',
    abilityFunction: (gameState) => {
      // Implementation would reveal the next landscape in the journey path
      return {
        success: true,
        message: 'The Raven scouts ahead, revealing the next landscape on your journey.'
      }
    }
  },
  {
    id: 'wolf',
    name: 'Wolf Guardian',
    ability: '+2 to combat-related challenges',
    abilityDescription: 'The Wolf stands by your side during combat, lending its strength and ferocity.',
    preferredResources: ['bog_iron'],
    seasonalAffinity: ['samhain', 'winters_depth'],
    image: 'wolf.jpg',
    findLocation: 'sacred_oak_grove',
    abilityFunction: (gameState, challengeType) => {
      if (['physical', 'combat'].includes(challengeType)) {
        return {
          bonus: 2,
          success: true,
          message: 'The Wolf Guardian stands beside you, adding its strength to yours.'
        }
      }
      return {
        bonus: 0,
        success: true,
        message: 'The Wolf Guardian watches but cannot help with this type of challenge.'
      }
    }
  },
  {
    id: 'deer',
    name: 'Deer Guide',
    ability: 'Move an extra Landscape without challenge',
    abilityDescription: 'The Deer knows hidden paths through the wilderness, allowing you to bypass a challenge.',
    preferredResources: ['silver_mistletoe', 'oak_galls', 'ogham_sticks'],
    seasonalAffinity: ['imbolc'],
    image: 'deer.jpg',
    findLocation: 'sacred_oak_grove',
    abilityFunction: (gameState) => {
      // Implementation would allow skipping a landscape challenge
      return {
        success: true,
        message: 'The Deer Guide leads you along a hidden path, bypassing the challenge ahead.'
      }
    }
  },
  {
    id: 'bear',
    name: 'Bear Protector',
    ability: 'Prevent up to 3 damage from one challenge',
    abilityDescription: 'The Bear shields you from harm, absorbing damage that would otherwise injure you.',
    preferredResources: ['forge_cinders'],
    seasonalAffinity: ['beltane'],
    image: 'bear.jpg',
    findLocation: 'sacred_oak_grove',
    abilityFunction: (gameState, damage) => {
      const preventedDamage = Math.min(damage, 3)
      return {
        preventedDamage,
        success: true,
        message: `The Bear Protector shields you, preventing ${preventedDamage} damage.`
      }
    }
  },
  {
    id: 'hare',
    name: 'Hare Pathfinder',
    ability: 'Re-roll one failed challenge roll',
    abilityDescription: 'The Hare\'s quick thinking and agility inspire you to try again after a failure.',
    preferredResources: ['woven_reeds'],
    seasonalAffinity: ['imbolc'],
    image: 'hare.jpg',
    findLocation: 'faerie_knoll',
    abilityFunction: (gameState) => {
      // Implementation would allow re-rolling a challenge
      return {
        success: true,
        message: 'The Hare Pathfinder inspires you to try a different approach. You may re-roll your challenge.'
      }
    }
  },
  {
    id: 'boar',
    name: 'Boar Digger',
    ability: 'Collect one extra Resource card',
    abilityDescription: 'The Boar\'s keen sense for finding hidden treasures helps you discover additional resources.',
    preferredResources: ['oak_galls'],
    seasonalAffinity: ['lughnasadh'],
    image: 'boar.jpg',
    findLocation: 'sacred_oak_grove',
    abilityFunction: (gameState) => {
      // Implementation would add an extra resource
      return {
        success: true,
        message: 'The Boar Digger roots around and uncovers an additional resource for you.'
      }
    }
  },
  {
    id: 'fox',
    name: 'Fox Trickster',
    ability: 'Manipulate one die roll by ±2',
    abilityDescription: 'The Fox\'s cunning allows you to manipulate fate, adjusting a die roll in your favor.',
    preferredResources: ['amber_shards'],
    seasonalAffinity: ['beltane'],
    image: 'fox.jpg',
    findLocation: 'faerie_knoll',
    abilityFunction: (gameState, rollValue, adjustment) => {
      // Ensure adjustment is within ±2
      const validAdjustment = Math.max(-2, Math.min(2, adjustment))
      return {
        adjustedRoll: rollValue + validAdjustment,
        success: true,
        message: `The Fox Trickster uses its cunning to adjust your roll by ${validAdjustment}.`
      }
    }
  },
  {
    id: 'owl',
    name: 'Owl Sage',
    ability: 'Gain insight to bypass one challenge without rolling',
    abilityDescription: 'The Owl\'s wisdom reveals the solution to a challenge, allowing you to bypass it entirely.',
    preferredResources: ['barrow_dust'],
    seasonalAffinity: ['samhain', 'winters_depth'],
    image: 'owl.jpg',
    findLocation: 'moonlit_loch',
    abilityFunction: (gameState, challengeType) => {
      if (challengeType === 'mental' || challengeType === 'knowledge') {
        return {
          bypass: true,
          success: true,
          message: 'The Owl Sage shares ancient wisdom, allowing you to bypass this challenge without rolling.'
        }
      }
      return {
        bypass: false,
        success: true,
        message: 'The Owl Sage offers advice, but this challenge requires more than wisdom alone.'
      }
    }
  },
  {
    id: 'salmon',
    name: 'Salmon Journeyer',
    ability: 'Return to a previous Landscape instantly',
    abilityDescription: 'The Salmon knows how to swim against the current, guiding you back to a place you\'ve visited before.',
    preferredResources: ['sacred_water'],
    seasonalAffinity: ['imbolc'],
    image: 'salmon.jpg',
    findLocation: 'moonlit_loch',
    abilityFunction: (gameState, targetLandscapeIndex) => {
      // Implementation would move player to a previous landscape
      if (targetLandscapeIndex < gameState.journeyProgress) {
        return {
          success: true,
          message: 'The Salmon Journeyer guides you back upstream to a previous landscape.'
        }
      }
      return {
        success: false,
        message: 'The Salmon Journeyer cannot guide you to a place you haven\'t yet visited.'
      }
    }
  },
  {
    id: 'horse',
    name: 'Horse Carrier',
    ability: 'Carry 3 extra Resource cards temporarily',
    abilityDescription: 'The Horse\'s strength allows you to carry more resources than you normally could.',
    preferredResources: ['horse_hair'],
    seasonalAffinity: ['beltane'],
    image: 'horse.jpg',
    findLocation: 'wild_horse_plain',
    abilityFunction: (gameState) => {
      // Implementation would temporarily increase resource capacity
      return {
        extraCapacity: 3,
        success: true,
        message: 'The Horse Carrier allows you to carry 3 additional resources temporarily.'
      }
    }
  }
]

export default companions;
