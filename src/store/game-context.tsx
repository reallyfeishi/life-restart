'use client';

import React, { createContext, useContext, useReducer, useCallback } from 'react';
import { GameState } from '@/types/game';
import { gameReducer, initialState } from './game-reducer';
import type { GameAction } from './game-reducer';
import { World } from '@/types/world';
import { Identity } from '@/types/identity';
import { Talent } from '@/types/talent';
import { Attributes } from '@/types/attribute';
import { GameEvent } from '@/types/event';
import { API_BASE_URL } from '@/lib/config';

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
  handleDecision: (optionId: string, optionText: string, customInput?: string) => void;
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

  const applyEventChanges = useCallback((event: GameEvent, newAge: number) => {
    dispatch({ type: 'APPLY_EVENT_RESULT', payload: { age: newAge, event } });
  }, [dispatch]);

  const handleDecision = useCallback((optionId: string, optionText: string, customInput?: string) => {
    dispatch({ type: 'SET_PENDING_DECISION', payload: null });
    dispatch({ type: 'SET_AUTO_PLAY', payload: true });
    const nextYearWithDecision = async () => {
      setIsProcessing(true);
      const newAge = state.currentAge + 1;
      try {
        const response = await fetch(`${API_BASE_URL}/api/game/generate`, {
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
            decision: { optionId, optionText, customInput },
          }),
        });
        if (!response.ok) throw new Error('生成事件失败');
        const data = await response.json();
        const event: GameEvent = { age: newAge, ...data };
        applyEventChanges(event, newAge);
      } catch (err) {
        console.error('handleDecision error:', err);
        const fallbackEvent: GameEvent = { age: newAge, content: `${newAge}岁，你做出了选择，命运的车轮继续转动。` };
        addEvent(fallbackEvent);
        dispatch({ type: 'SET_CURRENT_AGE', payload: newAge });
      } finally {
        setIsProcessing(false);
      }
    };
    nextYearWithDecision();
  }, [state.currentAge, state.attributes, state.talents, state.events, state.world, state.identity, state.resources, state.selectedModel, state.disableThinking, addEvent, applyEventChanges]);

  const resetGame = useCallback(() => {
    dispatch({ type: 'RESET_GAME' });
  }, []);

  const nextYear = useCallback(async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const newAge = state.currentAge + 1;

    try {
      const response = await fetch(`${API_BASE_URL}/api/game/generate`, {
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

      // Check if this is a decision event
      if (event.isDecision && event.decision) {
        dispatch({ type: 'SET_PENDING_DECISION', payload: { age: newAge, decision: event.decision } });
      }

      applyEventChanges(event, newAge);
    } catch (err) {
      console.error('nextYear error:', err);
      const fallbackEvent: GameEvent = {
        age: newAge,
        content: `${newAge}岁，平凡地度过了这一年。`,
      };
      addEvent(fallbackEvent);
      dispatch({ type: 'SET_CURRENT_AGE', payload: newAge });
    } finally {
      setIsProcessing(false);
    }
  }, [state.currentAge, state.attributes, state.disableThinking, state.selectedModel, state.talents, state.events, state.world, state.identity, state.resources, addEvent, setDeath, updateResources, isProcessing, applyEventChanges]);

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
      handleDecision,
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
