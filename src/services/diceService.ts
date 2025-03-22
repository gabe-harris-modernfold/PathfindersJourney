/**
 * Dice Service
 * Provides functions for dice rolling mechanics in the game
 */

// Use a consistent class implementation
class DiceService {
  // Private properties with consistent naming
  private _debugMode = false;
  private _forcedValue: number | null = null;
  
  /**
   * Roll a specific die (d4, d6, d8, etc.)
   * @param sides The number of sides on the die
   * @returns The roll result
   */
  rollDie(sides: number): number {
    if (this._debugMode && this._forcedValue !== null) {
      return this._forcedValue;
    }
    return Math.floor(Math.random() * sides) + 1;
  }
  
  /**
   * Roll the game's eight-sided die
   * @returns The roll result
   */
  rollD8(): number {
    return this.rollDie(8);
  }
  
  /**
   * Roll with advantage (roll twice, take higher)
   * @param sides The number of sides on the die
   * @returns Object containing the rolls and the result
   */
  rollWithAdvantage(sides: number): { rolls: number[], result: number } {
    const roll1 = this.rollDie(sides);
    const roll2 = this.rollDie(sides);
    return {
      rolls: [roll1, roll2],
      result: Math.max(roll1, roll2)
    };
  }
  
  /**
   * Roll with disadvantage (roll twice, take lower)
   * @param sides The number of sides on the die
   * @returns Object containing the rolls and the result
   */
  rollWithDisadvantage(sides: number): { rolls: number[], result: number } {
    const roll1 = this.rollDie(sides);
    const roll2 = this.rollDie(sides);
    return {
      rolls: [roll1, roll2],
      result: Math.min(roll1, roll2)
    };
  }
  
  /**
   * Set a forced roll value for testing purposes
   * @param value The value to force, or null to disable forced roll
   */
  setForcedRoll(value: number | null): void {
    this._debugMode = value !== null;
    this._forcedValue = value;
  }
  
  /**
   * Reset the service state
   */
  reset(): void {
    this._debugMode = false;
    this._forcedValue = null;
  }
}

// Export as a singleton instance for consistent access pattern
export const diceService = new DiceService();
