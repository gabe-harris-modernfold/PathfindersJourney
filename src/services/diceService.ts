/**
 * Dice Service
 * Provides functions for dice rolling mechanics in the game
 */
class DiceService {
  // Roll a specific die (d4, d6, d8, etc.)
  rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
  }
  
  // Roll the game's eight-sided die
  rollD8(): number {
    return this.rollDie(8);
  }
  
  // Roll with advantage (roll twice, take higher)
  rollWithAdvantage(sides: number): { rolls: number[], result: number } {
    const roll1 = this.rollDie(sides);
    const roll2 = this.rollDie(sides);
    return {
      rolls: [roll1, roll2],
      result: Math.max(roll1, roll2)
    };
  }
  
  // Roll with disadvantage (roll twice, take lower)
  rollWithDisadvantage(sides: number): { rolls: number[], result: number } {
    const roll1 = this.rollDie(sides);
    const roll2 = this.rollDie(sides);
    return {
      rolls: [roll1, roll2],
      result: Math.min(roll1, roll2)
    };
  }
  
  // For debug/test purposes, can force a specific roll result
  private _debugMode = false;
  private _forcedValue: number | null = null;
  
  setForcedRoll(value: number | null): void {
    this._debugMode = value !== null;
    this._forcedValue = value;
  }
}

export const diceService = new DiceService();
