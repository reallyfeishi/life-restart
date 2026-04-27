'use client';

import { useGame } from '@/store/game-context';

import type { GameState } from '@/types/game';

interface LifeSummaryCardProps {
  onConfirm: () => void;
}

export function LifeSummaryCard({ onConfirm }: LifeSummaryCardProps) {
  const { state } = useGame();
  const score = calculateScore(state);
  const grade = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  const gradeColor = grade === 'S' ? '#e8602a' : grade === 'A' ? '#c4883a' : grade === 'B' ? '#a85656' : '#8a857b';

  const genderIcon = state.identity?.gender === 'male' ? '👦' : '👧';
  const raceLabel = state.identity?.race === 'human' ? '人类' :
    state.identity?.race === 'elf' ? '精灵' :
    state.identity?.race === 'vampire' ? '吸血鬼' :
    state.identity?.race === 'android' ? '仿生人' :
    state.identity?.race === 'dragonborn' ? '龙裔' :
    state.identity?.race || '';

  return (
    <div className="bg-bg-card border-2 border-[#c4883a]/40 rounded-card p-4 shadow-card">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="text-xs font-semibold tracking-widest" style={{ color: '#c4883a' }}>
          — 人生结束 —
        </div>
        <div className="text-[10px] text-text-aux mt-1">点击查看你的人生总结</div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 mb-3">
        <div className="bg-bg-page rounded-card px-3 py-2 text-center">
          <div className="text-[10px] text-text-aux">{genderIcon}{raceLabel}</div>
          <div className="text-sm font-bold font-serif-sc text-text-title">{state.currentAge + 1}岁</div>
        </div>
        <div className="bg-bg-page rounded-card px-3 py-2 text-center">
          <div className="text-[10px] text-text-aux">📖 经历</div>
          <div className="text-sm font-bold font-serif-sc text-text-title">{state.events.length}件</div>
        </div>
        <div className="bg-bg-page rounded-card px-3 py-2 text-center">
          <div className="text-[10px] text-text-aux">🎭 天赋</div>
          <div className="text-sm font-bold font-serif-sc text-text-title">{state.talents.length}个</div>
        </div>
        <div className="bg-bg-page rounded-card px-3 py-2 text-center">
          <div className="text-[10px] text-text-aux">💰 财富</div>
          <div className="text-sm font-bold font-serif-sc text-text-title">{state.resources.money}</div>
        </div>
      </div>

      {/* Score */}
      <div className="text-center mb-3">
        <div className="text-2xl font-bold font-serif-sc" style={{ color: gradeColor }}>{grade}</div>
        <div className="text-sm text-text-title">{score}分</div>
        <div className="text-xs text-text-aux">综合评分 · {state.deathReason || '寿终正寝'}</div>
      </div>

      {/* Confirm button */}
      <button
        className="w-full min-h-[40px] rounded-btn font-semibold text-sm bg-[#a85656] text-white hover:bg-[#8f4a4a] transition-colors cursor-pointer btn-press"
        onClick={onConfirm}
      >
        查看人生总结
      </button>
    </div>
  );
}

function calculateScore(state: GameState): number {
  const { attributes, events, deathAge } = state;
  const attrTotal = (attributes.appearance || 0) + (attributes.intelligence || 0) +
                    (attributes.constitution || 0) + (attributes.wealth || 0);
  const attrScore = Math.min(100, (attrTotal / 80) * 60);
  const eventScore = Math.min(30, events.length * 1.5);
  const longevityBonus = (deathAge || 0) > 80 ? Math.min(10, ((deathAge || 0) - 80) * 0.5) : 0;
  const totalScore = Math.floor(Math.min(100, attrScore + eventScore + longevityBonus));
  return isNaN(totalScore) ? 50 : totalScore;
}
