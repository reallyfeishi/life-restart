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

    // Easter egg: if description only contains "庭院", use the special world
    const isTingyuan = description.trim() === EASTER_EGG_KEYWORD;

    if (isTingyuan) {
      // Load the special tingyuan world
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
        dispatch({ type: 'SET_PHASE', payload: 'identity-setup' });
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
    dispatch({ type: 'SET_PHASE', payload: 'identity-setup' });
    setIsSubmitting(false);
  };

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="text-center mb-8 mt-16">
        <div className="text-3xl mb-4">✨</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-2">自定义世界</h2>
        <p className="text-text-aux text-sm">描述你心中想要的世界</p>
      </div>

      <div className="w-full flex-1 flex flex-col">
        <textarea
          className="w-full flex-1 min-h-[200px] bg-bg-card border border-border rounded-card p-4 text-sm text-text-title placeholder-text-aux/50 outline-none focus:ring-1 focus:ring-[#4a6fa5]/30 resize-none"
          placeholder="例如：这是一个魔法与科技并存的世界，天空中漂浮着巨大的岛屿..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength={500}
        />
        <div className="text-xs text-text-aux mt-2 text-right">{description.length}/500</div>
      </div>

      <div className="w-full mt-4 space-y-2">
        <button
          className={`w-full min-h-[46px] px-10 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white btn-press ${
            description.trim() ? 'bg-[#4a6fa5]' : 'bg-border/40'
          } ${isSubmitting ? 'opacity-50' : ''}`}
          disabled={!description.trim() || isSubmitting}
          onClick={handleSubmit}
        >
          {isSubmitting ? '世界生成中...' : '确认世界'}
        </button>
        <button
          className="w-full min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-text-aux border border-border bg-transparent btn-press"
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'world-select' })}
        >
          返回世界列表
        </button>
      </div>
    </div>
  );
}
