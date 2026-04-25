import { World } from './world';
import { Identity } from './identity';
import { Talent } from './talent';
import { Attributes } from './attribute';
import { GameEvent, Decision } from './event';

export type GamePhase =
  | 'world-select'
  | 'identity-setup'
  | 'talent-draw'
  | 'attribute-alloc'
  | 'fate-preview'
  | 'playing'
  | 'dead'
  | 'history'
  | 'achievements';

export interface GameState {
  phase: GamePhase;
  world: World | null;
  identity: Identity | null;
  talents: Talent[];
  attributes: Attributes;
  events: GameEvent[];
  currentAge: number;
  deathAge: number;
  deathReason: string;
  backstory: string;
  isAutoPlaying: boolean;
  autoPlaySpeed: number;
  unlockedAchievements: string[];
  sessionId: string | null;
  resources: {
    money: number;
    career: string;
    social: number;
  };
  selectedModel: string;
  disableThinking: boolean;
  pendingDecision: { age: number; decision: Decision } | null;
}
