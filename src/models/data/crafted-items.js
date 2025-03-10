// Crafted Items data based on the game rules
export const craftedItems = [
  {
    id: 'beast_speaker_charm',
    name: 'Beast Speaker Charm',
    requiredResources: ['horse_hair', 'amber_shards', 'oak_galls'],
    ability: 'Command any Animal Companion regardless of season',
    drawback: 'The charm slowly drains your vitality (-1 Health per 3 turns)',
    complexity: 'complex',
    difficulty: 6,
    maxUses: 3,
    image: 'beast_speaker_charm.jpg',
    abilityFunction: (gameState, companion) => {
      return {
        success: true,
        message: `The Beast Speaker Charm allows you to command ${companion.name} regardless of the current season.`,
        effect: {
          type: 'companion_boost',
          target: companion.id,
          boost: 1
        },
        drawback: {
          type: 'health_drain',
          interval: 3,
          amount: 1
        }
      }
    }
  },
  {
    id: 'colossal_whistle',
    name: 'Colossal Whistle',
    requiredResources: ['rowan_wood', 'silver_mistletoe'],
    ability: 'Summon aid from great beasts to overcome any physical challenge',
    drawback: 'May attract unwanted attention (add 2 Threat tokens)',
    complexity: 'simple',
    difficulty: 5,
    maxUses: 2,
    image: 'colossal_whistle.jpg',
    abilityFunction: (gameState, challengeType) => {
      if (challengeType === 'physical') {
        return {
          success: true,
          message: 'The Colossal Whistle summons great beasts to aid you, automatically succeeding at the physical challenge.',
          effect: {
            type: 'auto_success',
            challengeType: 'physical'
          },
          drawback: {
            type: 'threat_increase',
            amount: 2
          }
        }
      }
      return {
        success: false,
        message: 'The Colossal Whistle can only help with physical challenges.'
      }
    }
  },
  {
    id: 'earth_speaker_staff',
    name: 'Earth Speaker Staff',
    requiredResources: ['rowan_wood', 'standing_stone_chips', 'barrow_dust'],
    ability: 'Automatically succeed wisdom and knowledge challenges',
    drawback: 'Each use ages the wielder (lose 1 Resource capacity)',
    complexity: 'complex',
    difficulty: 6,
    maxUses: 3,
    image: 'earth_speaker_staff.jpg',
    abilityFunction: (gameState, challengeType) => {
      if (['wisdom', 'knowledge', 'mental'].includes(challengeType)) {
        return {
          success: true,
          message: 'The Earth Speaker Staff channels ancient wisdom, automatically succeeding at the mental challenge.',
          effect: {
            type: 'auto_success',
            challengeType: challengeType
          },
          drawback: {
            type: 'capacity_loss',
            amount: 1
          }
        }
      }
      return {
        success: false,
        message: 'The Earth Speaker Staff can only help with wisdom and knowledge challenges.'
      }
    }
  },
  {
    id: 'giants_bridle',
    name: 'Giant\'s Bridle',
    requiredResources: ['bog_iron', 'horse_hair', 'woven_reeds'],
    ability: 'Control powerful entities and redirect their strength',
    drawback: 'The controlled entity may break free (roll D8 each use, free on 1-2)',
    complexity: 'complex',
    difficulty: 6,
    maxUses: 2,
    image: 'giants_bridle.jpg',
    abilityFunction: (gameState) => {
      const breakFreeRoll = Math.floor(Math.random() * 8) + 1
      const breakFree = breakFreeRoll <= 2
      
      return {
        success: !breakFree,
        message: breakFree 
          ? 'The Giant\'s Bridle fails to control the entity, which breaks free!' 
          : 'The Giant\'s Bridle allows you to control a powerful entity, redirecting its strength to your advantage.',
        effect: breakFree ? null : {
          type: 'challenge_bonus',
          bonus: 3
        },
        drawback: breakFree ? {
          type: 'threat_increase',
          amount: 2
        } : null
      }
    }
  },
  {
    id: 'ogham_divining_set',
    name: 'Ogham Divining Set',
    requiredResources: ['oak_galls', 'sacred_water', 'ogham_sticks'],
    ability: 'Foresee and avoid one challenge completely',
    drawback: 'Glimpsing fate may reveal unwelcome truths (draw a Curse card)',
    complexity: 'complex',
    difficulty: 6,
    maxUses: 1,
    image: 'ogham_divining_set.jpg',
    abilityFunction: (gameState) => {
      return {
        success: true,
        message: 'The Ogham Divining Set reveals the future, allowing you to avoid one challenge completely.',
        effect: {
          type: 'skip_challenge',
          count: 1
        },
        drawback: {
          type: 'curse',
          description: 'You glimpse an unwelcome truth about your future.'
        }
      }
    }
  },
  {
    id: 'seasonal_compass',
    name: 'Seasonal Compass',
    requiredResources: ['amber_shards', 'standing_stone_chips', 'forge_cinders'],
    ability: 'Change the current season for one round',
    drawback: 'Disrupts natural order (add 1 Threat token)',
    complexity: 'complex',
    difficulty: 6,
    maxUses: 1,
    image: 'seasonal_compass.jpg',
    abilityFunction: (gameState, targetSeason) => {
      return {
        success: true,
        message: `The Seasonal Compass shifts the world around you, temporarily changing the season to ${targetSeason.name}.`,
        effect: {
          type: 'season_change',
          season: targetSeason.id,
          duration: 1
        },
        drawback: {
          type: 'threat_increase',
          amount: 1
        }
      }
    }
  },
  {
    id: 'iron_grove_key',
    name: 'Iron Grove Key',
    requiredResources: ['bog_iron', 'silver_mistletoe', 'forge_cinders'],
    ability: 'Unlock hidden paths and secret areas on Landscape cards',
    drawback: 'Opens doors for otherworldly beings (roll on Manifestation table)',
    complexity: 'complex',
    difficulty: 6,
    maxUses: 2,
    image: 'iron_grove_key.jpg',
    abilityFunction: (gameState, landscape) => {
      // Roll for manifestation (1-8)
      const manifestationRoll = Math.floor(Math.random() * 8) + 1
      
      return {
        success: true,
        message: 'The Iron Grove Key unlocks a hidden path, revealing secrets of this landscape.',
        effect: {
          type: 'reveal_secret',
          landscape: landscape.id
        },
        drawback: {
          type: 'manifestation',
          roll: manifestationRoll
        }
      }
    }
  },
  {
    id: 'spirit_bridge_tokens',
    name: 'Spirit Bridge Tokens',
    requiredResources: ['barrow_dust', 'sacred_water', 'amber_shards'],
    ability: 'Travel instantly to any previously visited Landscape',
    drawback: 'Spiritual disorientation (-2 to next challenge roll)',
    complexity: 'complex',
    difficulty: 6,
    maxUses: 1,
    image: 'spirit_bridge_tokens.jpg',
    abilityFunction: (gameState, targetLandscapeIndex) => {
      if (targetLandscapeIndex <= gameState.journeyProgress) {
        return {
          success: true,
          message: 'The Spirit Bridge Tokens create a mystical pathway, allowing you to travel instantly to a previously visited landscape.',
          effect: {
            type: 'teleport',
            destination: targetLandscapeIndex
          },
          drawback: {
            type: 'challenge_penalty',
            amount: -2,
            duration: 1
          }
        }
      }
      return {
        success: false,
        message: 'The Spirit Bridge Tokens cannot take you to a place you haven\'t yet visited.'
      }
    }
  }
]
