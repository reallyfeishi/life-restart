'use client';

import { useGame } from '@/store/game-context';
import { WRITING_STYLES } from '@/data/writing-styles';

export function WritingStyleSelect() {
  const { state, dispatch } = useGame();
  const selectedStyle = state.writingStyle;

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="text-center mb-8">
        <div className="text-2xl mb-2" style={{ color: '#4a6fa5' }}>✦</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-2">选择文风</h2>
        <p className="text-text-aux text-sm">你希望人生故事以怎样的笔调展开？</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full mb-4">
        {WRITING_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              onClick={() => dispatch({ type: 'SET_WRITING_STYLE', payload: style.id })}
              className={`w-full text-left border rounded-card p-4 shadow-card transition-all duration-fast relative overflow-hidden cursor-pointer ${
                isSelected ? 'border-2 shadow-card-hover' : 'border-border bg-bg-card hover:shadow-card-hover'
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

      <button
        className="w-full mt-4 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white btn-press py-3"
        style={{
          backgroundColor: selectedStyle ? '#4a6fa5' : '#b8b3a8',
        }}
        disabled={!selectedStyle}
        onClick={() => dispatch({ type: 'SET_PHASE', payload: 'identity-setup' })}
      >
        {selectedStyle ? '下一个' : '请选择一种文风'}
      </button>
    </div>
  );
}
