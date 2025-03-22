/**
 * BaseService
 * 
 * Base class for all services in the application.
 * Provides common functionality and enforces consistency across services.
 */
import { StoreRegistry } from '../core/StoreRegistry';

export abstract class BaseService {
  protected storeRegistry: StoreRegistry;

  /**
   * Constructor for all services
   * @param storeRegistry The store registry for accessing stores
   */
  constructor(storeRegistry: StoreRegistry) {
    this.storeRegistry = storeRegistry;
  }

  /**
   * Initialize the service
   * This method can be overridden by derived services to perform initialization logic
   */
  public initialize(): void {
    // Base implementation does nothing
  }

  /**
   * Reset the service state
   * This method can be overridden by derived services to reset their state
   */
  public reset(): void {
    // Base implementation does nothing
  }
}
