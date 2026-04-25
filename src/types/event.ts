export interface GameEvent {
  age: number;
  content: string;
  attrChanges?: Partial<import('./attribute').Attributes>;
  resources?: {
    money?: number;
    career?: string;
    social?: number;
  };
  isEasterEgg?: boolean;
  achievementTrigger?: string;
}

export interface LifeRecord {
  id: string;
  worldId: string;
  worldName: string;
  gender: string;
  race: string;
  talents: string[];
  initialAttributes: import('./attribute').Attributes;
  events: GameEvent[];
  deathAge: number;
  deathReason: string;
  score: number;
  createdAt: number;
}
