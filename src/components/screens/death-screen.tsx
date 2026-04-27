'use client';

import { useGame } from '@/store/game-context';

import { GameState } from '@/types/game';

export function DeathScreen() {
  const { state, resetGame } = useGame();

  const score = calculateScore(state);
  const grade = score >= 90 ? 'S' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : 'D';
  const gradeColor = grade === 'S' ? '#e8602a' : grade === 'A' ? '#c4883a' : grade === 'B' ? '#a85656' : '#8a857b';

  return (
    <div className="flex flex-col min-h-dvh px-6 py-8">
      <div className="text-center mb-8 mt-4">
        <div className="text-3xl mb-4">🕯️</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-2">人生结束</h2>
      </div>

      <div className="bg-bg-card border border-border rounded-card p-6 text-center mb-4 shadow-card">
        <div className="text-4xl font-bold font-serif-sc mb-2" style={{ color: gradeColor }}>
          {grade}
        </div>
        <div className="text-lg text-text-title mb-1">享年 {state.currentAge + 1} 岁</div>
        <div className="text-sm text-text-aux mb-4">{state.deathReason}</div>
        <div className="text-3xl font-bold font-serif-sc text-text-title mb-1">{score}分</div>
        <div className="text-xs text-text-aux">综合评分</div>
      </div>

      <div className="bg-bg-card border border-border rounded-card p-4 mb-4">
        <h3 className="font-serif-sc font-semibold text-text-title text-sm mb-3">人生回顾</h3>
        <div className="grid grid-cols-2 gap-2 mb-3">
          {[
            { icon: '✨', name: '颜值', value: state.attributes.appearance },
            { icon: '🧠', name: '智力', value: state.attributes.intelligence },
            { icon: '💪', name: '体质', value: state.attributes.constitution },
            { icon: '💰', name: '家境', value: state.attributes.wealth },
          ].map((attr) => (
            <div key={attr.name} className="flex items-center justify-between bg-bg-page rounded-card px-3 py-2">
              <span className="text-xs text-text-body">{attr.icon} {attr.name}</span>
              <span className="font-bold font-serif-sc text-text-title">{attr.value}</span>
            </div>
          ))}
        </div>
        <div className="text-xs text-text-aux space-y-1">
          <div>💰 金钱: {state.resources.money}</div>
          <div>📈 职业: {state.resources.career}</div>
          <div>👥 社交: {state.resources.social}</div>
          <div>📖 事件: {state.events.length} 个</div>
        </div>
      </div>

      {state.unlockedAchievements.length > 0 && (
        <div className="bg-bg-card border border-border rounded-card p-4 mb-4">
          <h3 className="font-serif-sc font-semibold text-text-title text-sm mb-3">解锁成就</h3>
          <div className="flex flex-wrap gap-2">
            {state.unlockedAchievements.map((id: string) => (
              <span key={id} className="text-xs px-2 py-1 rounded-tag bg-[#f6f3ed] text-text-body border border-border">
                {getAchievementEmoji(id)} {getAchievementName(id)}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-3 mt-4">
        <button
          className="flex-1 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white bg-[#a85656] btn-press"
          onClick={resetGame}
        >
          再来一局
        </button>
      </div>
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

function getAchievementName(id: string): string {
  const names: Record<string, string> = {
    centenarian: '百年长寿',
    billionaire: '亿万富翁',
    serial_marrier: '情场浪子',
    first_life: '初来乍到',
    veteran: '轮回老手',
    genius: '天才少年',
    immortal: '长生不老',
    unlucky: '天煞孤星',
    collector: '全收集',
    combo_master: '组合大师',
  };
  return names[id] || id;
}

function getAchievementEmoji(id: string): string {
  const emojis: Record<string, string> = {
    centenarian: '🎂',
    billionaire: '💰',
    serial_marrier: '💍',
    first_life: '🌱',
    veteran: '🔄',
    genius: '🧠',
    immortal: '♾️',
    unlucky: '🌑',
    collector: '🎭',
    combo_master: '🎯',
  };
  return emojis[id] || '🏆';
}
