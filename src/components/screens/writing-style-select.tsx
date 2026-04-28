'use client';

import { useGame } from '@/store/game-context';
import { WRITING_STYLES } from '@/data/writing-styles';

export function WritingStyleSelect() {
  const { state, dispatch } = useGame();
  const selectedStyle = state.writingStyle;

  return (
    <div className="flex flex-col h-dvh bg-bg-page px-6 py-6">
      <div className="flex items-center gap-3 mb-2 flex-shrink-0">
        <button
          className="text-text-aux text-xl cursor-pointer hover:text-text-title transition-colors"
          onClick={() => {
            const prevPhase = state.world?.id === 'custom' || state.world?.id === 'special_tingyuan'
              ? 'custom-world'
              : 'world-select';
            dispatch({ type: 'SET_PHASE', payload: prevPhase });
          }}
        >
          ←
        </button>
      </div>
      <div className="w-full text-center pt-2 pb-4 flex-shrink-0">
        <div className="text-2xl mb-2" style={{ color: '#a85656' }}>✦</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-1">选择文风</h2>
        <p className="text-text-aux text-sm">你希望人生故事以怎样的笔调展开？</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full flex-1 overflow-hidden content-start">
        {WRITING_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => dispatch({ type: 'SET_WRITING_STYLE', payload: style.id })}
              className={`w-full text-left border rounded-card p-4 transition-colors duration-fast relative overflow-hidden cursor-pointer ${
                isSelected ? 'border-2 shadow-card-hover' : 'border-[rgba(0,0,0,0.08)] hover:bg-bg-card-hover'
              }`}
              style={isSelected ? { borderColor: style.color } : undefined}
              tabIndex={0}
            >
              {isSelected && (
                <div className="absolute top-2 right-2 w-2 h-2 rounded-full" style={{ backgroundColor: style.color }} />
              )}
              <div className="text-2xl mb-2">{style.icon}</div>
              <h3 className="font-serif-sc font-semibold text-text-title text-base mb-1">{style.name}</h3>
              <p className="text-text-aux text-xs leading-relaxed line-clamp-2">{style.description}</p>
            </button>
          );
        })}
      </div>

      <div className="w-full pt-4 pb-16 flex-shrink-0">
        <button
          className="w-full mt-4 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white py-3"
          style={{
            backgroundColor: selectedStyle ? '#a85656' : '#b8b3a8',
          }}
          disabled={!selectedStyle}
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'identity-setup' })}
        >
          {selectedStyle ? '下一个' : '请选择一种文风'}
        </button>
      </div>
    </div>
  );
}
