'use client';

import { useGame } from '@/store/game-context';
import { useState, useCallback } from 'react';
import { Talent } from '@/types/talent';
import { API_BASE_URL } from '@/lib/config';

const RARITY_COLORS: Record<string, string> = {
  common: '#4a6fa5',
  rare: '#7c5cbf',
  epic: '#c4883a',
  legendary: '#e8602a',
};

const RARITY_LABELS: Record<string, string> = {
  common: '常见',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

const FALLBACK_TALENTS: Talent[] = [
  { id: 'fb_1', name: '命运之子', description: '全属性+1，天生好命', rarity: 'legendary', effects: [], worlds: [] },
  { id: 'fb_2', name: '过目不忘', description: '学习能力超群', rarity: 'rare', effects: [], worlds: [] },
  { id: 'fb_3', name: '幸运星', description: '随机正面事件触发率增加', rarity: 'common', effects: [], worlds: [] },
];

export function TalentDraw() {
  const { state, dispatch, drawTalents } = useGame();
  const [revealed, setRevealed] = useState(false);
  const [drawnTalents, setDrawnTalents] = useState<Talent[]>([]);
  const [redrawCount, setRedrawCount] = useState(3);
  const [isLoading, setIsLoading] = useState(false);

  const drawTalentsFromAPI = useCallback(async (): Promise<Talent[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/game/talents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: state.world,
          gender: state.identity?.gender,
          race: state.identity?.race,
          model: state.selectedModel,
          disableThinking: state.disableThinking,
        }),
      });
      if (!response.ok) throw new Error('API error');
      const data = await response.json();
      if (data.error) throw new Error(data.error);
      return (data.talents || []).map((t: { name: string; description: string; rarity: string; id?: string }, i: number) => ({
        id: t.id || `ai_talent_${i}`,
        name: t.name,
        description: t.description,
        rarity: t.rarity || 'common',
        effects: [],
        worlds: [],
      }));
    } catch (e: unknown) {
      console.error('Talent draw error:', e instanceof Error ? e.message : String(e));
      return FALLBACK_TALENTS;
    }
  }, [state.world, state.identity, state.selectedModel, state.disableThinking]);

  const handleReveal = async () => {
    setIsLoading(true);
    const talents = await drawTalentsFromAPI();
    setDrawnTalents(talents);
    setRevealed(true);
    setIsLoading(false);
    setTimeout(() => {
      const cardEls = document.querySelectorAll('.talent-card');
      cardEls.forEach((el, i) => {
        setTimeout(() => el.classList.add('flipped'), i * 300);
      });
    }, 200);
  };

  const handleRedraw = async () => {
    if (redrawCount <= 0) return;
    setIsLoading(true);
    setRevealed(false);
    const cardEls = document.querySelectorAll('.talent-card');
    cardEls.forEach((el) => el.classList.remove('flipped'));
    setTimeout(async () => {
      const talents = await drawTalentsFromAPI();
      setDrawnTalents(talents);
      setRevealed(true);
      setRedrawCount(prev => prev - 1);
      setIsLoading(false);
      setTimeout(() => {
        const cardEls = document.querySelectorAll('.talent-card');
        cardEls.forEach((el, i) => {
          setTimeout(() => el.classList.add('flipped'), i * 300);
        });
      }, 200);
    }, 300);
  };

  const handleConfirm = () => {
    drawTalents(drawnTalents);
    dispatch({ type: 'SET_PHASE', payload: 'attribute-alloc' });
  };

  if (!revealed) {
    return (
      <div className="flex flex-col items-center min-h-dvh px-6 py-8">
        <div className="text-center mb-8 mt-16">
          <div className="text-3xl mb-4" style={{ color: '#4a6fa5' }}>✦</div>
          <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-2">天赋抽取</h2>
          <p className="text-text-aux text-sm">命运将为你揭示三张天赋牌</p>
        </div>
        <button
          className={`mt-8 min-h-[46px] px-10 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white bg-[#4a6fa5] btn-press py-4 ${isLoading ? 'opacity-50' : ''}`}
          onClick={handleReveal}
          disabled={isLoading}
        >
          {isLoading ? '命运揭示中...' : '揭示命运'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="text-center mb-6 mt-8">
        <div className="text-2xl mb-2" style={{ color: '#4a6fa5' }}>✦</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-2">你的天赋</h2>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full flex-1">
        {drawnTalents.map((talent) => (
          <div key={talent.id} className="talent-card h-[180px]">
            <div className="talent-card-inner">
              <div className="talent-card-front border border-border bg-bg-card flex items-center justify-center shadow-card">
                <span className="text-3xl">✦</span>
              </div>
              <div
                className="talent-card-back border rounded-card bg-bg-card p-3 flex flex-col justify-between shadow-card"
                style={{ borderColor: RARITY_COLORS[talent.rarity] }}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold" style={{ color: RARITY_COLORS[talent.rarity] }}>
                      {RARITY_LABELS[talent.rarity]}
                    </span>
                  </div>
                  <h4 className="font-serif-sc font-semibold text-sm text-text-title mb-1">{talent.name}</h4>
                  <p className="text-text-aux text-xs leading-relaxed">{talent.description}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="w-full mt-4 space-y-2">
        {redrawCount > 0 && (
          <button
            className={`w-full min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-[#4a6fa5] border border-[#4a6fa5] bg-transparent btn-press ${isLoading ? 'opacity-50' : ''}`}
            onClick={handleRedraw}
            disabled={isLoading}
          >
            {isLoading ? '重抽中...' : `重新抽取（剩余${redrawCount}次）`}
          </button>
        )}
        <button
          className="w-full min-h-[46px] px-10 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white bg-[#4a6fa5] btn-press"
          onClick={handleConfirm}
        >
          开始分配属性
        </button>
      </div>
    </div>
  );
}
