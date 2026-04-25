'use client';

import { useGame } from '@/store/game-context';
import { Talent } from '@/types/talent';
import { GameEvent } from '@/types/event';
import { useEffect, useRef } from 'react';

export function GameMain() {
  const { state, nextYear, setAutoPlay } = useGame();
  const timelineRef = useRef<HTMLDivElement>(null);
  const autoPlayRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Auto-play
  useEffect(() => {
    if (state.isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        nextYear();
      }, state.autoPlaySpeed);
    }
    return () => {
      if (autoPlayRef.current) clearInterval(autoPlayRef.current);
    };
  }, [state.isAutoPlaying, state.autoPlaySpeed, nextYear]);

  // Auto-scroll timeline
  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollTop = timelineRef.current.scrollHeight;
    }
  }, [state.events]);

  const toggleAutoPlay = () => {
    setAutoPlay(!state.isAutoPlaying);
  };

  const genderIcon = state.identity?.gender === 'male' ? '👦' : '👧';
  const raceIcon = '👤';
  const raceLabel = state.identity?.race === 'human' ? '人类' :
    state.identity?.race === 'elf' ? '精灵' :
    state.identity?.race === 'vampire' ? '吸血鬼' :
    state.identity?.race === 'android' ? '仿生人' :
    state.identity?.race === 'dragonborn' ? '龙裔' :
    state.identity?.race || '';

  return (
    <div className="flex flex-col h-dvh">
      {/* Header */}
      <div className="bg-bg-card border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span className="text-sm font-serif-sc font-semibold text-text-title">{state.world?.icon} {state.world?.name}</span>
            <span className="text-xs text-text-aux">{raceIcon}{raceLabel}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-serif-sc text-text-title">{genderIcon}{state.currentAge + 1}岁</span>
            <button
              className={`px-3 py-1 rounded-btn text-xs font-semibold transition-colors cursor-pointer btn-press ${
                state.isAutoPlaying
                  ? 'bg-[#5a8c5a] text-white'
                  : 'bg-bg-page text-text-aux border border-border'
              }`}
              onClick={toggleAutoPlay}
            >
              ⏩ {state.isAutoPlaying ? '自动播放中' : '自动播放'}
            </button>
          </div>
        </div>

        {/* Talent badges */}
        <div className="flex flex-wrap gap-1.5 mb-2">
          {state.talents.map((talent: Talent) => (
            <span
              key={talent.id}
              className="text-[11px] px-2 py-0.5 rounded-tag text-white"
              style={{
                backgroundColor: talent.rarity === 'legendary' ? '#e8602a' :
                  talent.rarity === 'epic' ? '#c4883a' :
                  talent.rarity === 'rare' ? '#7c5cbf' : '#4a6fa5'
              }}
              title={talent.description}
            >
              {talent.name}
            </span>
          ))}
        </div>

        {/* Attribute bars */}
        <div className="grid grid-cols-4 gap-2 mb-2">
          {[
            { name: '颜值', value: state.attributes.appearance },
            { name: '智力', value: state.attributes.intelligence },
            { name: '体质', value: state.attributes.constitution },
            { name: '家境', value: state.attributes.wealth },
          ].map((attr) => (
            <div key={attr.name} className="flex flex-col items-center">
              <span className="text-[11px] text-text-aux mb-1">{attr.name}</span>
              <div className="flex gap-0.5">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-3 h-1.5 rounded-sm ${i < attr.value ? 'bg-[#4a6fa5]' : 'bg-border/40'}`}
                  />
                ))}
              </div>
              <span className="text-xs font-bold font-serif-sc text-text-title mt-0.5">{attr.value}</span>
            </div>
          ))}
        </div>

        {/* Resources */}
        <div className="flex items-center gap-4 text-xs text-text-aux">
          <span>💰 {state.resources.money} {state.resources.money > 100000000 ? '亿万富翁' : state.resources.money > 10000 ? '小富' : state.resources.money > 0 ? '温饱' : '身无分文'}</span>
          <span>📈 {state.resources.career}</span>
          <span>👥 {state.resources.social} {state.resources.social > 50 ? '万人迷' : state.resources.social > 10 ? '广交好友' : '独来独往'}</span>
        </div>
      </div>

      {/* Timeline */}
      <div
        ref={timelineRef}
        className="flex-1 overflow-y-auto timeline-scroll px-4 py-4 space-y-3"
      >
        {state.events.length === 0 && (
          <div className="text-center text-text-aux text-sm py-8">
            你即将开始新的人生...
          </div>
        )}
        {state.events.map((event: GameEvent, index: number) => (
          <div
            key={index}
            className="bg-bg-card border border-border rounded-card p-3 shadow-card animate-fade-in"
          >
            <div className="flex items-center gap-2 mb-1">
              <span className="font-serif-sc font-bold text-sm text-[#4a6fa5]">{event.age} 岁</span>
              {index === state.events.length - 1 && (
                <span className="text-[10px] text-text-muted">◀ 当前</span>
              )}
            </div>
            <p className="text-text-body text-sm leading-relaxed">{event.content}</p>
            {event.attrChanges && Object.values(event.attrChanges).some(v => v !== 0) && (
              <div className="flex flex-wrap gap-1 mt-2">
                {Object.entries(event.attrChanges).map(([key, value]) => {
                  if (value === 0) return null;
                  const label = key === 'appearance' ? '颜值' : key === 'intelligence' ? '智力' : key === 'constitution' ? '体质' : '家境';
                  return (
                    <span key={key} className={`text-xs font-semibold ${value > 0 ? 'text-[#5a8c5a]' : 'text-[#b05050]'}`}>
                      {label}{value > 0 ? '+' : ''}{value}
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom action */}
      <div className="bg-bg-card border-t border-border px-4 py-3 flex-shrink-0">
        {state.isAutoPlaying ? (
          <button
            className="w-full min-h-[40px] rounded-btn font-semibold text-sm text-text-aux border border-border bg-bg-page cursor-pointer btn-press"
            onClick={toggleAutoPlay}
          >
            暂停播放
          </button>
        ) : (
          <button
            className="w-full min-h-[40px] rounded-btn font-semibold text-sm text-text-aux border border-border bg-bg-page cursor-pointer btn-press"
            onClick={nextYear}
            disabled={state.isAutoPlaying}
          >
            轻触，让岁月流转
          </button>
        )}
      </div>
    </div>
  );
}
