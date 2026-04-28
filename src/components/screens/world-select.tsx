'use client';

import { useGame } from '@/store/game-context';
import { WORLDS } from '@/data/worlds';
import { useState } from 'react';

const EXTRA_WORLDS = [
  { id: 'transmigration', name: '墨海浮生', icon: '📖' },
  { id: 'wasteland', name: '废土末世', icon: '☢️' },
  { id: 'medieval', name: '铁与火的纪元', icon: '🏰' },
  { id: 'palace', name: '朱门深宫', icon: '👑' },
];

const HOT_THEME_IDS = [
  'medieval_fantasy', 'ww2', 'dnd', 'eastern_fantasy', 'magical_girl',
  'three_body', 'douluo', 'pokemon', 'warhammer40k', 'naruto', 'zombie',
];

const MAIN_WORLD_IDS = ['modern', 'xianxia', 'magic', 'cyberpunk', 'scifi', 'custom', 'more'];

export function WorldSelect() {
  const { state, dispatch, selectWorld } = useGame();
  const selectedWorld = state.world;
  const [showMoreWorlds, setShowMoreWorlds] = useState(false);
  const [customDesc, setCustomDesc] = useState('');

  const mainWorlds = [
    ...WORLDS.filter(w => MAIN_WORLD_IDS.includes(w.id)),
    { id: 'more', name: '更多世界', description: '发现更多世界线', icon: '📚', color: '#8a857b' },
  ];

  return (
    <div className="flex flex-col items-center h-dvh bg-bg-page">
      {/* Header */}
      <div className="w-full text-center pt-8 pb-4">
        <div className="relative inline-block mb-3">
          <div className="text-3xl">⏳</div>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-text-muted" />
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full bg-text-muted ml-1" />
        </div>
        <h1 className="font-serif-sc text-3xl font-bold text-text-title mb-1">AI 人生重开手帐</h1>
        <p className="text-text-aux text-sm">选择你的下一世</p>
        <div className="flex items-center justify-center mt-4 gap-2">
          <div className="h-px flex-1 max-w-[120px] bg-border" />
          <div className="text-sm" style={{ color: '#a85656' }}>✦</div>
          <div className="h-px flex-1 max-w-[120px] bg-border" />
        </div>
      </div>

      {/* World cards grid + overlay wrapper */}
      <div className="relative flex-1 overflow-hidden w-full">
        <div className="grid grid-cols-2 gap-3 w-full px-6 content-start h-full">
          {mainWorlds.map((world) => {
            const isSelected = selectedWorld?.id === world.id;
            const isMore = world.id === 'more';
            return (
              <button
                key={world.id}
                onClick={() => {
                  if (isMore) {
                    setShowMoreWorlds(!showMoreWorlds);
                  } else if (world.id === 'custom') {
                    dispatch({ type: 'SET_PHASE', payload: 'custom-world' });
                  } else {
                    selectWorld(world);
                    setShowMoreWorlds(false);
                  }
                }}
                className={`w-full text-left border rounded-card p-3 transition-colors duration-fast relative overflow-hidden cursor-pointer ${
                  isSelected
                    ? 'border-2 border-[#a85656] bg-bg-card'
                    : isMore
                      ? 'border border-border bg-bg-card hover:bg-bg-card-hover'
                      : 'border border-[rgba(0,0,0,0.08)] bg-bg-card hover:bg-bg-card-hover'
                }`}
                tabIndex={0}
              >
                {isSelected && !isMore && (
                  <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#a85656]" />
                )}
                <div className="text-2xl mb-2">{world.icon}</div>
                <h3 className="font-serif-sc font-semibold text-text-title text-base mb-1">{world.name}</h3>
                <p className="text-text-aux text-xs leading-relaxed">{world.description}</p>
              </button>
            );
          })}
        </div>

        {/* More worlds overlay panel */}
        {showMoreWorlds && (
          <div className="absolute inset-0 z-10">
            <div
              className="absolute inset-0 bg-bg-page/80 cursor-pointer"
              onClick={() => setShowMoreWorlds(false)}
            />
            <div className="relative h-full overflow-y-auto scrollbar-hide px-6 py-4 flex items-start justify-center">
              <div className="w-full max-w-md border border-[rgba(0,0,0,0.08)] rounded-panel bg-bg-card p-4">
                {/* Header */}
                <div className="flex justify-between items-center mb-3">
                  <span className="text-xs text-text-muted">更多世界</span>
                  <button
                    onClick={() => setShowMoreWorlds(false)}
                    className="text-text-muted hover:text-text-title cursor-pointer transition-colors"
                    tabIndex={0}
                  >
                    ✕
                  </button>
                </div>

                {/* Extra worlds */}
                <p className="text-xs text-text-muted mb-2">精选世界线</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {EXTRA_WORLDS.map(w => (
                    <button
                      key={w.id}
                      onClick={() => {
                        const worldData = WORLDS.find(x => x.id === w.id);
                        if (worldData) {
                          selectWorld(worldData);
                          setShowMoreWorlds(false);
                        }
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-bg-page border border-[rgba(0,0,0,0.06)] text-sm text-text-body hover:bg-bg-card-hover cursor-pointer transition-colors"
                    >
                      <span>{w.icon}</span>
                      <span className="text-xs">{w.name}</span>
                    </button>
                  ))}
                </div>

                {/* Hot themes */}
                <p className="text-xs text-text-muted mb-2">热门主题</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {WORLDS.filter(w => HOT_THEME_IDS.includes(w.id)).map(t => (
                    <button
                      key={t.id}
                      onClick={() => {
                        selectWorld(t);
                        setShowMoreWorlds(false);
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-btn bg-bg-page border border-[rgba(0,0,0,0.06)] text-sm text-text-body hover:bg-bg-card-hover cursor-pointer transition-colors"
                    >
                      <span>{t.icon}</span>
                      <span className="text-xs">{t.name}</span>
                    </button>
                  ))}
                </div>

                {/* Custom description */}
                <p className="text-xs text-text-muted mb-2">或自由描述</p>
                <div className="relative">
                  <textarea
                    className="w-full border border-[rgba(0,0,0,0.08)] rounded-btn p-3 text-sm bg-bg-page resize-none focus:outline-none focus:border-[#a85656] focus:ring-1 focus:ring-[#a85656]/20 text-text-body placeholder-text-muted"
                    placeholder="输入你想要的世界设定..."
                    value={customDesc}
                    onChange={(e) => setCustomDesc(e.target.value.slice(0, 200))}
                    rows={2}
                  />
                  <div className="text-xs text-text-muted text-right mt-1">{customDesc.length}/200</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA button */}
      <div className="w-full px-6 pb-6 pt-4">
        <div className="flex items-center justify-center mb-3">
          <div className="h-px flex-1 max-w-[120px] bg-border" />
          <div className="text-sm mx-3" style={{ color: '#a85656' }}>✦</div>
          <div className="h-px flex-1 max-w-[120px] bg-border" />
        </div>
        <button
          className="w-full min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white py-3"
          style={{
            backgroundColor: selectedWorld ? '#a85656' : '#b8b3a8',
          }}
          disabled={!selectedWorld}
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'writing-style-select' })}
        >
          {selectedWorld ? '开始这一世' : '请选择一个世界'}
        </button>
        <div className="text-center mt-3 text-xs text-text-muted">
          <span className="cursor-pointer hover:text-text-aux">用户协议</span>
          <span className="mx-2">·</span>
          <span className="cursor-pointer hover:text-text-aux">隐私政策</span>
        </div>
      </div>
    </div>
  );
}
