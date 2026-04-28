export interface DecisionOption {
  id: string;
  text: string;
  hint: string;
}

export interface Decision {
  prompt: string;
  options: DecisionOption[];
  allowFreeInput: boolean;
}

export interface GameEvent {
  age: number;
  content: string;
  attrChanges?: Partial<import('./attribute').Attributes>;
  resources?: {
    money?: number;
    career?: string;
    social?: number;
  };
  isDecision?: boolean;
  decision?: Decision;
  isEasterEgg?: boolean;
  achievementTrigger?: string;
  chosenOption?: string;
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
