'use client';

import { useGame } from '@/store/game-context';
import { WORLDS } from '@/data/worlds';

export function WorldSelect() {
  const { state, dispatch, selectWorld } = useGame();
  const selectedWorld = state.world;

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="text-center mb-8">
        <div className="text-2xl mb-2" style={{ color: '#4a6fa5' }}>✦</div>
        <h1 className="font-serif-sc text-2xl font-bold text-text-title mb-2">选择世界</h1>
        <p className="text-text-aux text-sm">选择一个世界开始你的人生</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full flex-1">
        {WORLDS.map((world) => {
          const isSelected = selectedWorld?.id === world.id;
          return (
            <button
              key={world.id}
              onClick={() => selectWorld(world)}
              className={`w-full text-left border rounded-card p-4 shadow-card transition-all duration-fast relative overflow-hidden cursor-pointer ${
                isSelected ? 'border-[#4a6fa5] bg-bg-card shadow-card-hover ring-1 ring-[#4a6fa5]/20' : 'border-border bg-bg-card hover:shadow-card-hover'
              }`}
              tabIndex={0}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#4a6fa5]" />
              )}
              <div className="text-2xl mb-2">{world.icon}</div>
              <h3 className="font-serif-sc font-semibold text-text-title text-base mb-1">{world.name}</h3>
              <p className="text-text-aux text-xs leading-relaxed">{world.description}</p>
            </button>
          );
        })}
      </div>

      <button
        className="w-full mt-4 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white btn-press py-3"
        style={{
          backgroundColor: selectedWorld ? '#4a6fa5' : '#b8b3a8',
        }}
        disabled={!selectedWorld}
        onClick={() => dispatch({ type: 'SET_PHASE', payload: 'identity-setup' })}
      >
        {selectedWorld ? '下一个' : '请选择一个世界'}
      </button>
    </div>
  );
}
