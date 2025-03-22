/**
 * useServices
 * 
 * Composable function to access services throughout the application.
 * Provides a consistent interface to interact with game services.
 */
import { ServiceRegistry } from '@/services/core/ServiceRegistry';

export function useServices() {
  const serviceRegistry = ServiceRegistry.getInstance();
  
  return {
    // Return all services through the registry
    challengeService: serviceRegistry.challengeService,
    diceService: serviceRegistry.diceService,
    companionService: serviceRegistry.companionService,
    journeyService: serviceRegistry.journeyService,
    resourceService: serviceRegistry.resourceService,
    craftingService: serviceRegistry.craftingService,
    threatService: serviceRegistry.threatService,
    victoryService: serviceRegistry.victoryService,
    phaseService: serviceRegistry.phaseService,
    cardRepository: serviceRegistry.cardRepository
  };
}
