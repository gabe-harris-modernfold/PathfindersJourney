// Type definitions for animal companions
declare module '@/models/data/companions' {
  export interface AnimalCompanion {
    id: string;
    name: string;
    ability: string;
    abilityDescription: string;
    preferredResources: string[];
    seasonalAffinity: string[];
    image: string;
    findLocation: string;
    abilityFunction: (gameState: any, ...args: any[]) => any;
  }

  const companions: AnimalCompanion[];
  export default companions;
}
