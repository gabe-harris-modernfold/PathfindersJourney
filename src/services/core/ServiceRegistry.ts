/**
 * ServiceRegistry
 * 
 * Central registry for all services in the application.
 * Manages service instantiation and provides a consistent access pattern.
 */
import { StoreRegistry } from './StoreRegistry';

// Import service modules but don't directly reference imported objects until getter is called
import * as challengeModule from '../challenge';
import * as diceServiceModule from '../diceService';
import * as companionServiceModule from '../companionService';
import * as journeyServiceModule from '../journeyService';
import * as resourceServiceModule from '../resourceService';
import * as craftingServiceModule from '../craftingService';
import * as threatServiceModule from '../threatService';
import * as victoryServiceModule from '../victoryService';
import * as phaseServiceModule from '../phaseService';
import * as cardRepositoryModule from '../CardRepository';

/**
 * Service registry that creates and manages all services
 */
export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private storeRegistry: StoreRegistry;
  
  // Service instances - lazy initialized
  private _challengeService: any | null = null;
  private _diceService: any | null = null;
  private _companionService: any | null = null;
  private _journeyService: any | null = null;
  private _resourceService: any | null = null;
  private _craftingService: any | null = null;
  private _threatService: any | null = null;
  private _victoryService: any | null = null;
  private _phaseService: any | null = null;
  private _cardRepository: any | null = null;
  
  /**
   * Private constructor to enforce singleton pattern
   */
  private constructor() {
    this.storeRegistry = new StoreRegistry();
  }

  /**
   * Get the singleton instance of the service registry
   * @returns The service registry instance
   */
  public static getInstance(): ServiceRegistry {
    if (!ServiceRegistry.instance) {
      ServiceRegistry.instance = new ServiceRegistry();
    }
    return ServiceRegistry.instance;
  }
  
  // Lazy getters for each service
  
  get challengeService(): any {
    if (!this._challengeService) {
      this._challengeService = challengeModule.challengeService;
    }
    return this._challengeService;
  }
  
  get diceService(): any {
    if (!this._diceService) {
      this._diceService = diceServiceModule.diceService;
    }
    return this._diceService;
  }
  
  get companionService(): any {
    if (!this._companionService) {
      this._companionService = companionServiceModule.companionService;
    }
    return this._companionService;
  }
  
  get journeyService(): any {
    if (!this._journeyService) {
      this._journeyService = journeyServiceModule.journeyService;
    }
    return this._journeyService;
  }
  
  get resourceService(): any {
    if (!this._resourceService) {
      this._resourceService = resourceServiceModule.resourceService;
    }
    return this._resourceService;
  }
  
  get craftingService(): any {
    if (!this._craftingService) {
      this._craftingService = craftingServiceModule.getCraftingService();
    }
    return this._craftingService;
  }
  
  get threatService(): any {
    if (!this._threatService) {
      this._threatService = threatServiceModule.getThreatService();
    }
    return this._threatService;
  }
  
  get victoryService(): any {
    if (!this._victoryService) {
      this._victoryService = victoryServiceModule.victoryService;
    }
    return this._victoryService;
  }
  
  get phaseService(): any {
    if (!this._phaseService) {
      this._phaseService = phaseServiceModule.getPhaseService();
    }
    return this._phaseService;
  }
  
  get cardRepository(): any {
    if (!this._cardRepository) {
      this._cardRepository = cardRepositoryModule.cardRepository;
    }
    return this._cardRepository;
  }
  
  /**
   * Reset all services
   */
  public reset(): void {
    // Reset all service instances
    this._challengeService = null;
    this._diceService = null;
    this._companionService = null;
    this._journeyService = null;
    this._resourceService = null;
    this._craftingService = null;
    this._threatService = null;
    this._victoryService = null;
    this._phaseService = null;
    this._cardRepository = null;
  }
}
