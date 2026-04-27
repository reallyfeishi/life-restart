'use client';

import { useGame } from '@/store/game-context';
import { WORLDS } from '@/data/worlds';

export function WorldSelect() {
  const { state, dispatch, selectWorld } = useGame();
  const selectedWorld = state.world;

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 py-8">
      {/* Header */}
      <div className="text-center mb-6 mt-4">
        <div className="text-3xl mb-2">⏳</div>
        <h1 className="font-serif-sc text-3xl font-bold text-text-title">AI 人生重开手帐</h1>
        <p className="text-text-aux text-sm mt-2">选择你的下一世</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full flex-1">
        {WORLDS.map((world) => {
          const isSelected = selectedWorld?.id === world.id;
          const isCustom = world.id === 'custom';
          return (
            <button
              key={world.id}
              onClick={() => {
                if (isCustom) {
                  dispatch({ type: 'SET_PHASE', payload: 'custom-world' });
                } else {
                  selectWorld(world);
                }
              }}
              className={`w-full text-left border rounded-card p-3 shadow-card transition-all duration-fast relative overflow-hidden cursor-pointer ${
                isSelected ? 'border-2 border-[#a85656] bg-bg-card shadow-card-hover' : 'border-border bg-bg-card hover:shadow-card-hover'
              }`}
              tabIndex={0}
            >
              {isSelected && !isCustom && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#a85656]" />
              )}
              <div className="text-2xl mb-2">{world.icon}</div>
              <h3 className="font-serif-sc font-semibold text-text-title text-base mb-1">{world.name}</h3>
              <p className="text-text-aux text-xs leading-relaxed">{world.description}</p>
            </button>
          );
        })}
      </div>

      {/* Diamond separator */}
      <div className="text-xl my-4" style={{ color: '#a85656' }}>✦</div>

      <button
        className="w-full min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white btn-press py-3"
        style={{
          backgroundColor: selectedWorld ? '#a85656' : '#b8b3a8',
        }}
        disabled={!selectedWorld}
        onClick={() => dispatch({ type: 'SET_PHASE', payload: 'writing-style-select' })}
      >
        {selectedWorld ? '开始这一世' : '请选择一个世界'}
      </button>

    </div>
  );
}
