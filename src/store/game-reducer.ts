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
  | { type: 'APPLY_EVENT_RESULT'; payload: { age: number; event: GameEvent } }
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

    case 'APPLY_EVENT_RESULT': {
      const { age, event } = action.payload;
      // Apply attribute changes — defensive init
      const newAttrs = {
        appearance: state.attributes.appearance ?? 0,
        intelligence: state.attributes.intelligence ?? 0,
        constitution: state.attributes.constitution ?? 0,
        wealth: state.attributes.wealth ?? 0,
      };
      const attrKeyMap: Record<string, keyof typeof state.attributes> = {
        appearance: 'appearance', intelligence: 'intelligence',
        constitution: 'constitution', wealth: 'wealth',
        颜值: 'appearance', 智力: 'intelligence', 体质: 'constitution', 家境: 'wealth',
      };
      if (event.attrChanges) {
        for (const [key, value] of Object.entries(event.attrChanges)) {
          // Clean key of trailing digits/plus signs (e.g. "智力0+1" → "智力")
          const cleanedKey = key.replace(/[0-9+\-]/g, '').trim();
          const mappedKey = attrKeyMap[cleanedKey];
          if (mappedKey) {
            const numValue = typeof value === 'number' ? value : parseInt(String(value), 10) || 0;
            const current = newAttrs[mappedKey] ?? 0;
            newAttrs[mappedKey] = Math.max(0, Math.min(15, current + numValue));
          }
        }
      }
      // Apply resource changes
      const newResources = { ...state.resources };
      const resourceKeyMap: Record<string, keyof typeof state.resources> = {
        money: 'money', career: 'career', social: 'social',
        金钱: 'money', 职业: 'career', 人脉: 'social',
      };
      if (event.resources) {
        for (const [key, value] of Object.entries(event.resources)) {
          const mappedKey = resourceKeyMap[key];
          if (mappedKey === 'money' && value !== undefined) {
            newResources.money = Math.max(-1000, Math.min(10000000, (state.resources.money || 0) + (value as number)));
          } else if (mappedKey === 'career' && value) {
            newResources.career = value as string;
          } else if (mappedKey === 'social' && value !== undefined) {
            newResources.social = Math.max(0, Math.min(200, (state.resources.social || 0) + (value as number)));
          }
        }
      }

      // Check if AI event describes death
      const deathKeywords = ['去世', '死亡', '离世', '死去', '死了', '殒命', '牺牲', '长眠', '消散', '陨落', '化为尘土', '化为灰烬'];
      const aiDescribesDeath = deathKeywords.some(kw => event.content.includes(kw));

      if (aiDescribesDeath && age >= 30) {
        // AI explicitly described death - use the event content as death reason
        return {
          ...state,
          attributes: newAttrs,
          resources: newResources,
          events: [...state.events, event],
          currentAge: age,
          deathAge: age,
          deathReason: event.content,
          phase: 'life-summary',
          isAutoPlaying: false,
          pendingDecision: null,
        };
      }

      // Code-level death check (very conservative fallback)
      const hasImmortalBody = state.talents.some(t => t.id === 'immortal_body');
      const hasDeathResist = state.talents.some(t => t.effects?.some(e => e.type === 'death_resist'));
      let isDead = false;
      let deathReason = '';
      if (age >= 100) {
        let deathChance = 0;
        if (age > 90) deathChance += (age - 90) * 1.5;
        if (age > 120) deathChance += (age - 120) * 3.0;
        if (hasImmortalBody) deathChance *= 0.3;
        if (hasDeathResist) deathChance *= 0.7;
        deathChance -= newAttrs.constitution * 0.5;
        deathChance = Math.max(0, deathChance);
        const roll = Math.random() * 100;
        if (roll < deathChance) {
          isDead = true;
          const reasons = age > 150
            ? ['安详离世', '寿终正寝', '超越凡人的极限']
            : ['安详离世', '寿终正寝', '因病去世'];
          deathReason = reasons[Math.floor(Math.random() * reasons.length)];
        }
      }

      return {
        ...state,
        attributes: newAttrs,
        resources: newResources,
        events: [...state.events, event],
        currentAge: age,
        pendingDecision: event.isDecision && event.decision ? { age, decision: event.decision } : state.pendingDecision,
        isAutoPlaying: event.isDecision && event.decision ? false : state.isAutoPlaying,
        phase: isDead ? 'life-summary' : state.phase,
        deathAge: isDead ? age : state.deathAge,
        deathReason: isDead ? deathReason : state.deathReason,
        ...(isDead ? { isAutoPlaying: false, pendingDecision: null } : {}),
      };
    }

    case 'RESET_GAME':
      return { ...initialState, unlockedAchievements: state.unlockedAchievements };

    default:
      return state;
  }
}
