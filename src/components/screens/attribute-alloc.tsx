'use client';

import { useGame } from '@/store/game-context';
import { useState, useCallback } from 'react';

const ATTRS = [
  { key: 'appearance' as const, icon: '✨', name: '颜值', desc: '外貌魅力，影响社交和恋爱' },
  { key: 'intelligence' as const, icon: '🧠', name: '智力', desc: '学习能力和认知水平' },
  { key: 'constitution' as const, icon: '💪', name: '体质', desc: '身体素质，影响健康和寿命' },
  { key: 'wealth' as const, icon: '💰', name: '家境', desc: '家庭经济条件和社会资源' },
];

const BASE_POINTS = 12;

export function AttributeAlloc() {
  const { state, dispatch, setAttributes } = useGame();

  const bonusPoints = state.talents.reduce((total, talent) => {
    const pointEffect = talent.effects.find(e => e.type === 'attr_boost' && e.stat === '_points');
    return total + (pointEffect?.value || 0);
  }, 0);
  const totalPoints = BASE_POINTS + bonusPoints;

  const [attrs, setAttrs] = useState({
    appearance: state.attributes.appearance || 0,
    intelligence: state.attributes.intelligence || 0,
    constitution: state.attributes.constitution || 0,
    wealth: state.attributes.wealth || 0,
  });

  const usedPoints = attrs.appearance + attrs.intelligence + attrs.constitution + attrs.wealth;
  const remaining = totalPoints - usedPoints;
  const canStart = remaining === 0;

  const adjustAttr = useCallback((key: keyof typeof attrs, delta: number) => {
    setAttrs(prev => {
      const newVal = prev[key] + delta;
      if (newVal < 0 || newVal > 10) return prev;
      const newUsed = Object.entries({ ...prev, [key]: newVal }).reduce((sum, [, v]) => sum + v, 0);
      if (newUsed > totalPoints) return prev;
      return { ...prev, [key]: newVal };
    });
  }, [totalPoints]);

  const handleRandom = () => {
    let points = totalPoints;
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

  const talentNames = state.talents.map((t: { name: string }) => t.name).join(' · ');

  return (
    <div className="flex flex-col h-dvh bg-bg-page px-6 py-6">
      {/* Top */}
      <div className="text-center mb-4 flex-shrink-0">
        <h2 className="font-serif-sc text-xl font-bold text-text-title">属性分配</h2>
      </div>

      {/* Remaining points */}
      <div className="text-center mb-2 flex-shrink-0">
        <div className="text-4xl font-bold font-serif-sc" style={{ color: remaining === 0 ? '#5a8c5a' : '#a85656' }}>
          {remaining}
        </div>
        <div className="text-xs text-text-aux mt-1">剩余 {remaining} / {totalPoints} 点</div>
        {state.talents.length > 0 && (
          <div className="text-xs text-text-aux mt-1">
            天赋: {talentNames}
            {bonusPoints > 0 && <span style={{ color: '#5a8c5a' }}> · +{bonusPoints}点</span>}
          </div>
        )}
      </div>

      {/* Diamond separator */}
      <div className="text-center text-xl my-2 flex-shrink-0" style={{ color: '#a85656' }}>✦</div>

      {/* Attribute rows */}
      <div className="space-y-4 flex-1 overflow-hidden">
        {ATTRS.map((attr) => (
          <div key={attr.key} className="border border-[rgba(0,0,0,0.08)] rounded-card p-3 bg-bg-card">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-lg">{attr.icon}</span>
                <span className="font-serif-sc font-semibold text-text-title text-sm">{attr.name}</span>
              </div>
              <span className="text-text-aux text-xs">{attr.desc}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.08)] bg-bg-page text-text-title font-bold cursor-pointer hover:bg-border/30 transition-colors flex items-center justify-center disabled:opacity-30 text-lg"
                  onClick={() => adjustAttr(attr.key, -1)}
                  disabled={attrs[attr.key] <= 0}
                >
                  −
                </button>
                <button
                  className="w-7 h-7 rounded-full border border-[rgba(0,0,0,0.08)] bg-bg-page text-text-title font-bold cursor-pointer hover:bg-border/30 transition-colors flex items-center justify-center disabled:opacity-30 text-lg"
                  onClick={() => adjustAttr(attr.key, 1)}
                  disabled={attrs[attr.key] >= 10 || remaining <= 0}
                >
                  +
                </button>
              </div>
              <div className="flex-1 flex gap-0.5 min-w-0">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-sm transition-colors flex-1 ${
                      i < attrs[attr.key] ? 'bg-[#a85656]' : 'bg-border/40'
                    }`}
                  />
                ))}
              </div>
              <span className="text-2xl font-bold font-serif-sc text-text-title w-8 text-center flex-shrink-0">
                {attrs[attr.key]}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3 mt-4 pb-16 flex-shrink-0">
        <button
          className="flex-1 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-[#a85656] border border-[#a85656] bg-transparent"
          onClick={handleRandom}
        >
          随机分配
        </button>
        <button
          className="flex-1 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white"
          style={{ backgroundColor: canStart ? '#a85656' : '#b8b3a8' }}
          disabled={!canStart}
          onClick={handleStart}
        >
          开始人生
        </button>
      </div>
    </div>
  );
}
