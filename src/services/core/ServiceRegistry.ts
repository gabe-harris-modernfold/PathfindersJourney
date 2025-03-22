/**
 * ServiceRegistry
 * 
 * Central registry for all services in the application.
 * Manages service instantiation and provides a consistent access pattern.
 */
import { StoreRegistry } from './StoreRegistry';

// Import existing service instances instead of non-existent class types
import { challengeService } from '../challenge';
import { diceService } from '../diceService';
import { companionService } from '../companionService';
import { journeyService } from '../journeyService';
import { resourceService } from '../resourceService';
import { craftingService } from '../craftingService';
import { threatService } from '../threatService';
import { victoryService } from '../victoryService';
import { phaseService } from '../phaseService';
import { cardRepository } from '../CardRepository';

export class ServiceRegistry {
  private static instance: ServiceRegistry;
  private storeRegistry: StoreRegistry;
  
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

  // Service getters - return the existing service instances
  public get challengeService() {
    return challengeService;
  }

  public get diceService() {
    return diceService;
  }

  public get companionService() {
    return companionService;
  }

  public get journeyService() {
    return journeyService;
  }

  public get resourceService() {
    return resourceService;
  }

  public get craftingService() {
    return craftingService;
  }

  public get threatService() {
    return threatService;
  }

  public get victoryService() {
    return victoryService;
  }
  
  public get phaseService() {
    return phaseService;
  }
  
  public get cardRepository() {
    return cardRepository;
  }
}
