'use client';

import { useGame } from '@/store/game-context';
import { useState, useCallback } from 'react';

const ATTRS = [
  { key: 'appearance' as const, icon: '✨', name: '颜值', desc: '外貌魅力，影响社交和恋爱' },
  { key: 'intelligence' as const, icon: '🧠', name: '智力', desc: '学习能力和认知水平' },
  { key: 'constitution' as const, icon: '💪', name: '体质', desc: '身体素质，影响健康和寿命' },
  { key: 'wealth' as const, icon: '💰', name: '家境', desc: '家庭经济条件和社会资源' },
];

const TOTAL_POINTS = 12;

export function AttributeAlloc() {
  const { state, dispatch, setAttributes } = useGame();
  const [attrs, setAttrs] = useState({
    appearance: state.attributes.appearance || 1,
    intelligence: state.attributes.intelligence || 1,
    constitution: state.attributes.constitution || 1,
    wealth: state.attributes.wealth || 1,
  });

  const usedPoints = attrs.appearance + attrs.intelligence + attrs.constitution + attrs.wealth;
  const remaining = TOTAL_POINTS - usedPoints;
  const canStart = remaining === 0;

  const adjustAttr = useCallback((key: keyof typeof attrs, delta: number) => {
    setAttrs(prev => {
      const newVal = prev[key] + delta;
      if (newVal < 0 || newVal > 10) return prev;
      const newUsed = Object.entries({ ...prev, [key]: newVal }).reduce((sum, [, v]) => sum + v, 0);
      if (newUsed > TOTAL_POINTS) return prev;
      return { ...prev, [key]: newVal };
    });
  }, []);

  const handleRandom = () => {
    let points = TOTAL_POINTS;
    const values = [0, 0, 0, 0];
    while (points > 0) {
      const idx = Math.floor(Math.random() * 4);
      if (values[idx] < 10) {
        values[idx] += 1;
        points -= 1;
      }
    }
    setAttrs({
      appearance: values[0],
      intelligence: values[1],
      constitution: values[2],
      wealth: values[3],
    });
  };

  const handleStart = () => {
    if (!canStart) return;
    setAttributes(attrs);
    dispatch({ type: 'SET_PHASE', payload: 'fate-preview' });
  };

  return (
    <div className="flex flex-col min-h-dvh px-6 py-6">
      <div className="flex items-center gap-3 mb-4">
        <button
          className="text-text-aux text-xl cursor-pointer hover:text-text-title transition-colors"
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'talent-draw' })}
        >
          ←
        </button>
        <h2 className="font-serif-sc text-xl font-bold text-text-title">属性分配</h2>
      </div>

      <div className="bg-bg-card border border-border rounded-card p-3 mb-4 flex items-center justify-between">
        <span className="text-text-aux text-sm">剩余</span>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold font-serif-sc" style={{ color: remaining === 0 ? '#5a8c5a' : '#c4883a' }}>
            {remaining}
          </span>
          <span className="text-text-aux text-sm">/ {TOTAL_POINTS} 点</span>
        </div>
      </div>

      {state.talents.length > 0 && (
        <div className="bg-bg-card border border-border rounded-card p-3 mb-4">
          <p className="text-text-aux text-xs">
            天赋: {state.talents.map((t: { name: string }) => t.name).join(' · ')}
          </p>
        </div>
      )}

      <div className="space-y-4 flex-1">
        {ATTRS.map((attr) => (
          <div key={attr.key} className="bg-bg-card border border-border rounded-card p-4">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{attr.icon}</span>
              <span className="font-serif-sc font-semibold text-text-title">{attr.name}</span>
            </div>
            <p className="text-text-aux text-xs mb-3">{attr.desc}</p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  className="w-8 h-8 rounded-full border border-border bg-bg-page text-text-title font-bold text-lg cursor-pointer hover:bg-border/30 transition-colors flex items-center justify-center btn-press"
                  onClick={() => adjustAttr(attr.key, -1)}
                  disabled={attrs[attr.key] <= 0}
                >
                  −
                </button>
                <div className="w-10 text-center">
                  <span className="text-xl font-bold font-serif-sc text-text-title">{attrs[attr.key]}</span>
                </div>
                <button
                  className="w-8 h-8 rounded-full border border-border bg-bg-page text-text-title font-bold text-lg cursor-pointer hover:bg-border/30 transition-colors flex items-center justify-center btn-press disabled:opacity-30"
                  onClick={() => adjustAttr(attr.key, 1)}
                  disabled={attrs[attr.key] >= 10 || remaining <= 0}
                >
                  +
                </button>
              </div>
              <div className="flex gap-0.5 flex-1 min-w-0">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-sm transition-colors flex-1 ${
                      i < attrs[attr.key] ? 'bg-[#4a6fa5]' : 'bg-border/40'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-3 mt-4 pb-2">
        <button
          className="flex-1 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-[#4a6fa5] border border-[#4a6fa5] bg-transparent btn-press"
          onClick={handleRandom}
        >
          随机分配
        </button>
        <button
          className="flex-1 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white btn-press"
          style={{ backgroundColor: canStart ? '#4a6fa5' : '#b8b3a8' }}
          disabled={!canStart}
          onClick={handleStart}
        >
          开始人生
        </button>
      </div>
    </div>
  );
}
