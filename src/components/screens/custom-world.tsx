'use client';

import { useGame } from '@/store/game-context';
import { useState } from 'react';
import { World } from '@/types/world';

const EASTER_EGG_KEYWORD = '庭院';

export function CustomWorld() {
  const { dispatch, selectWorld } = useGame();
  const [description, setDescription] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!description.trim()) return;

    setIsSubmitting(true);

    const isTingyuan = description.trim() === EASTER_EGG_KEYWORD;

    if (isTingyuan) {
      try {
        const response = await fetch('/special/tingyuan.txt');
        const content = await response.text();
        const specialWorld: World = {
          id: 'special_tingyuan',
          name: EASTER_EGG_KEYWORD,
          description: content.trim(),
          icon: '🏯',
          color: '#c4883a',
        };
        selectWorld(specialWorld);
        dispatch({ type: 'SET_PHASE', payload: 'writing-style-select' });
        return;
      } catch {
        // Fallback if file not found
      }
    }

    const customWorld: World = {
      id: 'custom',
      name: '自定义世界',
      description: description.trim(),
      icon: '✨',
      color: '#8a857b',
    };
    selectWorld(customWorld);
    dispatch({ type: 'SET_PHASE', payload: 'writing-style-select' });
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col h-dvh bg-bg-page px-6 py-6">
      <div className="text-center pt-4 pb-4 flex-shrink-0">
        <div className="text-3xl mb-3">✨</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-1">自定义世界</h2>
        <p className="text-text-aux text-sm">描述你心中想要的世界</p>
      </div>

      <div className="w-full flex-1 overflow-hidden flex flex-col">
        <textarea
          className="w-full flex-1 min-h-[120px] border border-[rgba(0,0,0,0.08)] rounded-card p-4 text-sm text-text-title placeholder-text-aux/50 outline-none focus:ring-1 focus:ring-[#a85656]/30 resize-none bg-bg-card"
          placeholder="例如：这是一个魔法与科技并存的世界，天空中漂浮着巨大的岛屿..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
        <div className="text-xs text-text-aux mt-2 text-right">{description.length}/500</div>
      </div>

      <div className="w-full space-y-2 pt-4 pb-2 flex-shrink-0">
        <button
          className={`w-full min-h-[46px] px-10 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white ${
            description.trim() ? 'bg-[#a85656]' : 'bg-border/40'
          } ${isSubmitting ? 'opacity-50' : ''}`}
          disabled={!description.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? '世界生成中...' : '确认世界'}
        </button>
        <button
          className="w-full min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-text-aux border border-[rgba(0,0,0,0.08)] bg-transparent"
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'world-select' })}
        >
          返回世界列表
        </button>
      </div>
    </div>
  );
}
