import { defineStore } from 'pinia';
import { GameLogEntry } from '@/models/types/game';
import { Season } from '@/models/enums/seasons';

interface LogState {
  gameLog: GameLogEntry[];
}

/**
 * Store for managing game logs and messages
 */
export const useLogStore = defineStore('log', {
  state: (): LogState => ({
    gameLog: []
  }),
  
  getters: {
    /**
     * Get the game log in reverse order (most recent first)
     */
    formattedGameLog(): GameLogEntry[] {
      return [...this.gameLog].reverse();
    }
  },
  
  actions: {
    /**
     * Reset the log store to initial state
     */
    reset(): void {
      this.gameLog = [];
    },
    
    /**
     * Add an entry to the game log
     * @param message The log message
     * @param highlight Whether to highlight the message
     * @param type The type of log message
     * @param details Additional details for the log entry
     */
    addToGameLog(
      message: string, 
      highlight: boolean = false, 
      type: 'phase' | 'action' | 'challenge' | 'resource' | 'companion' | 'crafting' | 'system' | 'error' | 'debug' = 'system',
      details: { [key: string]: any } = {}
    ): void {
      // Create the log entry
      const logEntry: GameLogEntry = {
        message,
        timestamp: Date.now(),
        highlight,
        type,
        details,
        // In the refactored version, these would use gameStore and seasonStore
        // turn: useGameStore().currentTurn,
        // season: useSeasonStore().currentSeason
        turn: 0,
        season: Season.SAMHAIN
      };
      
      // Add to the log
      this.gameLog.push(logEntry);
      
      // Keep log size manageable (optional)
      if (this.gameLog.length > 100) {
        this.gameLog.shift(); // Remove oldest entry
      }
      
      // For debugging/development - log to console as well
      if (process.env.NODE_ENV === 'development') {
        const logPrefix = `[${type.toUpperCase()}]`;
        if (type === 'error') {
          console.error(logPrefix, message, details);
        } else if (type === 'debug') {
          console.debug(logPrefix, message, details);
        } else {
          console.log(logPrefix, message, details);
        }
      }
    },
    
    /**
     * Clear the game log
     */
    clearGameLog(): void {
      this.gameLog = [];
      this.addToGameLog('Game log cleared.', false, 'system');
    }
  }
});
