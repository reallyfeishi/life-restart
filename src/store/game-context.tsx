'use client';

import React, { createContext, useContext, useReducer, useCallback, useState } from 'react';
import { GameState } from '@/types/game';
import { gameReducer, initialState } from './game-reducer';
import type { GameAction } from './game-reducer';
import { World } from '@/types/world';
import { Identity } from '@/types/identity';
import { Talent } from '@/types/talent';
import { Attributes } from '@/types/attribute';
import { GameEvent } from '@/types/event';

interface GameContextType {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  selectWorld: (world: World) => void;
  setIdentity: (identity: Partial<Identity>) => void;
  drawTalents: (talents: Talent[]) => void;
  setAttributes: (attrs: Attributes) => void;
  setBackstory: (backstory: string) => void;
  addEvent: (event: GameEvent) => void;
  setDeath: (age: number, reason: string) => void;
  setAutoPlay: (playing: boolean) => void;
  unlockAchievement: (id: string) => void;
  updateResources: (resources: Partial<{ money: number; career: string; social: number }>) => void;
  setModel: (model: string) => void;
  toggleThinking: () => void;
  resetGame: () => void;
  nextYear: () => Promise<void>;
  isProcessing: boolean;
}

const GameContext = createContext<GameContextType | null>(null);

export function GameProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [isProcessing, setIsProcessing] = React.useState(false);

  const selectWorld = useCallback((world: World) => {
    dispatch({ type: 'SELECT_WORLD', payload: world });
  }, []);

  const setIdentity = useCallback((identity: Partial<Identity>) => {
    dispatch({ type: 'SET_IDENTITY', payload: identity });
  }, []);

  const drawTalents = useCallback((talents: Talent[]) => {
    dispatch({ type: 'DRAW_TALENTS', payload: talents });
  }, []);

  const setAttributes = useCallback((attrs: Attributes) => {
    dispatch({ type: 'SET_ATTRIBUTES', payload: attrs });
  }, []);

  const setBackstory = useCallback((backstory: string) => {
    dispatch({ type: 'SET_BACKSTORY', payload: backstory });
  }, []);

  const addEvent = useCallback((event: GameEvent) => {
    dispatch({ type: 'ADD_EVENT', payload: event });
  }, []);

  const setDeath = useCallback((age: number, reason: string) => {
    dispatch({ type: 'SET_DEATH', payload: { age, reason } });
  }, []);

  const setAutoPlay = useCallback((playing: boolean) => {
    dispatch({ type: 'SET_AUTO_PLAY', payload: playing });
  }, []);

  const unlockAchievement = useCallback((id: string) => {
    dispatch({ type: 'UNLOCK_ACHIEVEMENT', payload: id });
  }, []);

  const updateResources = useCallback((resources: Partial<{ money: number; career: string; social: number }>) => {
    dispatch({ type: 'UPDATE_RESOURCES', payload: resources });
  }, []);

  const setModel = useCallback((model: string) => {
    dispatch({ type: 'SET_MODEL', payload: model });
  }, []);

  const toggleThinking = useCallback(() => {
    dispatch({ type: 'TOGGLE_THINKING' });
  }, []);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const nextYear = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const newAge = state.currentAge + 1;

    try {
      const response = await fetch('/api/game/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          age: newAge,
          attributes: state.attributes,
          talents: state.talents,
          events: state.events.slice(-5),
          world: state.world,
          identity: state.identity,
          resources: state.resources,
          model: state.selectedModel,
          disableThinking: state.disableThinking,
        }),
      });

      if (!response.ok) throw new Error('生成事件失败');

      const data = await response.json();
      const event: GameEvent = { age: newAge, ...data };

      // Apply attribute changes
      const newAttrs = { ...state.attributes };
      if (event.attrChanges) {
        for (const [key, value] of Object.entries(event.attrChanges)) {
          if (key in newAttrs) {
            (newAttrs as Record<string, number>)[key] = Math.max(0, Math.min(10, (newAttrs as Record<string, number>)[key] + (value as number)));
          }
        }
      }

      // Apply resource changes
      if (event.resources) {
        const newResources: Partial<{ money: number; career: string; social: number }> = {};
        if (event.resources.money !== undefined) newResources.money = (state.resources.money || 0) + (event.resources.money as number);
        if (event.resources.career) newResources.career = event.resources.career;
        if (event.resources.social !== undefined) newResources.social = (state.resources.social || 0) + (event.resources.social as number);
        updateResources(newResources);
      }

      setAttributes(newAttrs);
      addEvent(event);
      dispatch({ type: 'SET_CURRENT_AGE', payload: newAge });

      // Check death
      const deathResult = checkDeath(newAge, newAttrs, state.talents);
      if (deathResult.isDead) {
        setDeath(newAge, deathResult.reason);
      }
    } catch (err) {
      console.error('nextYear error:', err);
      // Fallback: generate a simple event
      const fallbackEvent: GameEvent = {
        age: newAge,
        content: `${newAge}岁，平凡地度过了这一年。`,
      };
      addEvent(fallbackEvent);
      dispatch({ type: 'SET_CURRENT_AGE', payload: newAge });
    } finally {
      setIsProcessing(false);
    }
  }, [state.currentAge, state.attributes, state.talents, state.events, state.world, state.identity, state.resources, addEvent, setAttributes, setDeath, updateResources, isProcessing]);

  return (
    <GameContext.Provider value={{
      state,
      dispatch,
      selectWorld,
      setIdentity,
      drawTalents,
      setAttributes,
      setBackstory,
      addEvent,
      setDeath,
      setAutoPlay,
      unlockAchievement,
      updateResources,
      setModel,
      toggleThinking,
      resetGame,
      nextYear,
      isProcessing,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const ctx = useContext(GameContext);
  if (!ctx) throw new Error('useGame must be used within GameProvider');
  return ctx;
}

function checkDeath(age: number, attrs: Attributes, talents: Talent[]): { isDead: boolean; reason: string } {
  // Base death chance increases with age
  const hasImmortalBody = talents.some(t => t.id === 'immortal_body');
  const hasDeathResist = talents.some(t => t.effects.some(e => e.type === 'death_resist'));

  let deathChance = 0;
  if (age > 60) deathChance += (age - 60) * 0.5;
  if (age > 80) deathChance += (age - 80) * 1.5;
  if (age > 100) deathChance += (age - 100) * 3;
  if (hasImmortalBody) deathChance *= 0.3;
  if (hasDeathResist) deathChance *= 0.7;

  // Constitution reduces death chance
  deathChance -= attrs.constitution * 0.3;
  deathChance = Math.max(0, deathChance);

  // Random death check
  const roll = Math.random() * 100;
  if (roll < deathChance) {
    const reasons = [
      '因病去世', '安详离世', '寿终正寝', '一场意外',
      age > 100 ? '超越凡人的极限' : '命运的召唤',
    ];
    return {
      isDead: true,
      reason: reasons[Math.floor(Math.random() * Math.min(3 + Math.floor(age / 30), reasons.length))],
    };
  }

  // Very low constitution can cause early death
  if (attrs.constitution <= 0 && age > 5) {
    return { isDead: true, reason: '体弱多病，不治而亡' };
  }

  return { isDead: false, reason: '' };
}
