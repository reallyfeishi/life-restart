'use client';

import { useGame } from '@/store/game-context';
import { useState, useEffect, useRef } from 'react';
import { API_BASE_URL } from '@/lib/config';

const RARITY_COLORS: Record<string, string> = {
  common: '#8a857b',
  rare: '#4a90d9',
  epic: '#7c5cbf',
  legendary: '#c4883a',
};

const RARITY_LABELS: Record<string, string> = {
  common: '常见',
  rare: '稀有',
  epic: '史诗',
  legendary: '传说',
};

export function FatePreview() {
  const { state, dispatch, setBackstory } = useGame();
  const [loading, setLoading] = useState(true);
  const [displayedBackstory, setDisplayedBackstory] = useState('');
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const isTyping = !loading && !!state.backstory && displayedBackstory.length < state.backstory.length;

  useEffect(() => {
    async function fetchBackstory() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/game/background`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            world: state.world,
            identity: state.identity,
            talents: state.talents,
            attributes: state.attributes,
            model: state.selectedModel,
            disableThinking: state.disableThinking,
            writingStyle: state.writingStyle,
          }),
        });
        const data = await response.json();
        setBackstory(data.backstory);
      } catch {
        const text = state.identity?.gender === 'male' ? '你出生在一个普通的家庭' : '你出生在一个普通的家庭';
        setBackstory(text + '，在这个名为' + state.world?.name + '的世界里，命运的齿轮开始转动。');
      }
      setLoading(false);
    }
    fetchBackstory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (loading || !state.backstory) return;
    let i = 0;
    timerRef.current = setInterval(() => {
      if (i < state.backstory.length) {
        setDisplayedBackstory(state.backstory.slice(0, i + 1));
        i++;
      } else {
        if (timerRef.current) clearInterval(timerRef.current);
      }
    }, 30);
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [loading, state.backstory]);

  const handleStart = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/game/session`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          world: state.world,
          identity: state.identity,
          talents: state.talents,
          attributes: state.attributes,
        }),
      });
    } catch {}
    dispatch({ type: 'SET_PHASE', payload: 'playing' });
  };

  const genderLabel = state.identity?.gender === 'male' ? '男性' : state.identity?.gender === 'female' ? '女性' : '自定义';
  const genderIcon = state.identity?.gender === 'male' ? '👦' : '👧';
  const raceLabel = state.identity?.race === 'human' ? '人类' :
    state.identity?.race === 'elf' ? '精灵' :
    state.identity?.race === 'vampire' ? '吸血鬼' :
    state.identity?.race === 'android' ? '仿生人' :
    state.identity?.race === 'dragonborn' ? '龙裔' : '自定义';

  return (
    <div className="flex flex-col h-dvh bg-bg-page px-6 py-6">
      <div className="w-full text-center pt-4 pb-4 flex-shrink-0">
        <div className="text-2xl mb-2" style={{ color: '#a85656' }}>✦</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-1">命运预览</h2>
        <p className="text-text-aux text-sm">确认你的角色信息，准备开始人生</p>
        <div className="flex items-center justify-center mt-3 gap-2">
          <div className="h-px flex-1 max-w-[120px] bg-border" />
          <div className="text-sm" style={{ color: '#a85656' }}>✦</div>
          <div className="h-px flex-1 max-w-[120px] bg-border" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3">
        {/* Identity summary card */}
        <div className="border border-[rgba(0,0,0,0.08)] rounded-card p-3 bg-bg-card">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{state.world?.icon}</span>
              <span className="text-sm font-semibold text-text-title">{state.world?.name}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-base">{genderIcon}</span>
              <span className="text-sm text-text-title">{genderLabel}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm">👤</span>
              <span className="text-sm text-text-title">{raceLabel}</span>
            </div>
          </div>
        </div>

        {/* Talents card */}
        <div className="border border-[rgba(0,0,0,0.08)] rounded-card p-3 bg-bg-card">
          <h3 className="font-serif-sc font-semibold text-text-title text-sm mb-2">天赋</h3>
          <div className="space-y-2">
            {state.talents.map((talent: { id: string; name: string; description: string; rarity: string }) => (
              <div key={talent.id} className="border border-[rgba(0,0,0,0.08)] rounded-card p-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm text-text-title">{talent.name}</span>
                  <span className="text-xs" style={{ color: RARITY_COLORS[talent.rarity] }}>
                    {RARITY_LABELS[talent.rarity]}
                  </span>
                </div>
                <p className="text-text-aux text-xs mt-1">{talent.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Attributes card */}
        <div className="border border-[rgba(0,0,0,0.08)] rounded-card p-3 bg-bg-card">
          <h3 className="font-serif-sc font-semibold text-text-title text-sm mb-2">属性</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { icon: '✨', name: '颜值', value: state.attributes.appearance },
              { icon: '🧠', name: '智力', value: state.attributes.intelligence },
              { icon: '', name: '体质', value: state.attributes.constitution },
              { icon: '💰', name: '家境', value: state.attributes.wealth },
            ].map((attr) => (
              <div key={attr.name} className="flex items-center justify-between border border-[rgba(0,0,0,0.06)] rounded-card px-3 py-2 bg-bg-page">
                <span className="text-sm text-text-body">{attr.icon} {attr.name}</span>
                <span className="font-bold font-serif-sc text-text-title">{attr.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Backstory card */}
        <div className="border border-[rgba(0,0,0,0.08)] rounded-card p-4 bg-bg-page">
          <h3 className="font-serif-sc font-semibold text-text-title text-sm mb-2">身世</h3>
          {loading ? (
            <div className="flex items-center justify-center h-20">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-text-aux loading-dot-1" />
                <span className="w-2 h-2 rounded-full bg-text-aux loading-dot-2" />
                <span className="w-2 h-2 rounded-full bg-text-aux loading-dot-3" />
              </div>
            </div>
          ) : (
            <p className="text-text-body text-sm leading-relaxed font-sans-sc">
              &ldquo;{displayedBackstory}<span className={isTyping ? 'typewriter' : ''} />&rdquo;
            </p>
          )}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3 mt-4 pb-16 flex-shrink-0">
        <button
          className="flex-1 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-[#a85656] border border-[#a85656] bg-transparent"
          onClick={() => dispatch({ type: 'RESET_GAME' })}
        >
          返回
        </button>
        <button
          className="flex-1 min-h-[46px] px-10 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white bg-[#a85656]"
          onClick={handleStart}
          disabled={loading}
        >
          {loading ? '生成中...' : '开始人生'}
        </button>
      </div>
    </div>
  );
}
