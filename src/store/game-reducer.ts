import { World } from '@/types/world';
import { Identity } from '@/types/identity';
import { Talent } from '@/types/talent';
import { Attributes } from '@/types/attribute';
import { GameEvent } from '@/types/event';
import { GamePhase, GameState } from '@/types/game';

export type GameAction =
  | { type: 'SET_PHASE'; payload: GamePhase }
  | { type: 'SELECT_WORLD'; payload: World }
  | { type: 'SET_IDENTITY'; payload: Partial<Identity> }
  | { type: 'DRAW_TALENTS'; payload: Talent[] }
  | { type: 'SET_ATTRIBUTES'; payload: Attributes }
  | { type: 'SET_BACKSTORY'; payload: string }
  | { type: 'ADD_EVENT'; payload: GameEvent }
  | { type: 'SET_EVENTS'; payload: GameEvent[] }
  | { type: 'SET_CURRENT_AGE'; payload: number }
  | { type: 'SET_DEATH'; payload: { age: number; reason: string } }
  | { type: 'SET_AUTO_PLAY'; payload: boolean }
  | { type: 'UNLOCK_ACHIEVEMENT'; payload: string }
  | { type: 'UPDATE_RESOURCES'; payload: Partial<{ money: number; career: string; social: number }> }
  | { type: 'SET_MODEL'; payload: string }
  | { type: 'TOGGLE_THINKING' }
  | { type: 'SET_PENDING_DECISION'; payload: { age: number; decision: import('@/types/event').Decision } | null }
  | { type: 'RESET_GAME' };

export const initialState: GameState = {
  phase: 'world-select',
  world: null,
  identity: null,
  talents: [] as Talent[],
  attributes: { appearance: 0, intelligence: 0, constitution: 0, wealth: 0 },
  events: [] as GameEvent[],
  currentAge: 0,
  deathAge: 0,
  deathReason: '',
  backstory: '',
  isAutoPlaying: true,
  autoPlaySpeed: 1000,
  unlockedAchievements: [],
  sessionId: null,
  resources: { money: 0, career: '无业', social: 0 },
  selectedModel: 'glm-5',
  disableThinking: false,
  pendingDecision: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_PHASE':
      return { ...state, phase: action.payload };

    case 'SELECT_WORLD':
      return { ...state, world: action.payload };

    case 'SET_IDENTITY':
      return {
        ...state,
        identity: state.identity ? { ...state.identity, ...action.payload } : { ...action.payload } as Identity,
      };

    case 'DRAW_TALENTS':
      return { ...state, talents: action.payload };

    case 'SET_ATTRIBUTES':
      return { ...state, attributes: action.payload };

    case 'SET_BACKSTORY':
      return { ...state, backstory: action.payload };

    case 'ADD_EVENT':
      return { ...state, events: [...state.events, action.payload] };

    case 'SET_EVENTS':
      return { ...state, events: action.payload };

    case 'SET_CURRENT_AGE':
      return { ...state, currentAge: action.payload };

    case 'SET_DEATH':
      return {
        ...state,
        deathAge: action.payload.age,
        deathReason: action.payload.reason,
        phase: 'life-summary',
        isAutoPlaying: false,
        pendingDecision: null,
      };

    case 'SET_AUTO_PLAY':
      return { ...state, isAutoPlaying: action.payload };

    case 'UNLOCK_ACHIEVEMENT':
      if (state.unlockedAchievements.includes(action.payload)) {
        return state;
      }
      return { ...state, unlockedAchievements: [...state.unlockedAchievements, action.payload] };

    case 'UPDATE_RESOURCES':
      return { ...state, resources: { ...state.resources, ...action.payload } };

    case 'SET_MODEL':
      return { ...state, selectedModel: action.payload };

    case 'TOGGLE_THINKING':
      return { ...state, disableThinking: !state.disableThinking };

    case 'SET_PENDING_DECISION':
      return { ...state, pendingDecision: action.payload, isAutoPlaying: action.payload === null ? state.isAutoPlaying : false };

    case 'RESET_GAME':
      return { ...initialState, unlockedAchievements: state.unlockedAchievements };

    default:
      return state;
  }
}
