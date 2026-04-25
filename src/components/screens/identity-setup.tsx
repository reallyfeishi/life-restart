'use client';

import { useGame } from '@/store/game-context';
import { useState } from 'react';

const GENDERS = [
  { id: 'male' as const, icon: '👦', label: '男性' },
  { id: 'female' as const, icon: '👧', label: '女性' },
  { id: 'custom' as const, icon: '✨', label: '自定义' },
];

const RACES = [
  { id: 'human' as const, icon: '👤', label: '人类' },
  { id: 'elf' as const, icon: '🧝', label: '精灵' },
  { id: 'vampire' as const, icon: '🦇', label: '吸血鬼' },
  { id: 'android' as const, icon: '🤖', label: '仿生人' },
  { id: 'dragonborn' as const, icon: '🐉', label: '龙裔' },
  { id: 'custom' as const, icon: '✨', label: '自定义' },
];

export function IdentitySetup() {
  const { state, dispatch, setIdentity } = useGame();
  const [genderCustom, setGenderCustom] = useState('');
  const [raceCustom, setRaceCustom] = useState('');
  const [extraInfo, setExtraInfo] = useState(state.identity?.extraInfo || '');

  const gender = state.identity?.gender;
  const race = state.identity?.race;

  const canProceed = !!gender && !!race;

  const handleNext = () => {
    setIdentity({ gender, race, genderCustom, raceCustom, extraInfo });
    dispatch({ type: 'SET_PHASE', payload: 'talent-draw' });
  };

  return (
    <div className="flex flex-col items-center min-h-dvh px-6 py-8">
      <div className="text-center mb-8">
        <div className="text-2xl mb-2" style={{ color: '#4a6fa5' }}>✦</div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-2">身份设定</h2>
        <p className="text-text-aux text-sm">选择你这一世的性别和种族</p>
      </div>

      <div className="w-full space-y-6 flex-1">
        <div>
          <h3 className="font-serif-sc font-semibold text-text-title text-base mb-3">性别</h3>
          <div className="grid grid-cols-3 gap-3">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setIdentity({ gender: g.id })}
                className={`border rounded-card p-4 flex flex-col items-center gap-2 transition-all duration-fast cursor-pointer ${
                  gender === g.id
                    ? 'border-[#4a6fa5] bg-bg-card shadow-card'
                    : 'border-border bg-bg-card hover:shadow-card'
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <span className="text-sm text-text-title">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif-sc font-semibold text-text-title text-base mb-3">种族</h3>
          <div className="grid grid-cols-3 gap-3">
            {RACES.map((r) => (
              <button
                key={r.id}
                onClick={() => setIdentity({ race: r.id })}
                className={`border rounded-card p-4 flex flex-col items-center gap-2 transition-all duration-fast cursor-pointer ${
                  race === r.id
                    ? 'border-[#4a6fa5] bg-bg-card shadow-card'
                    : 'border-border bg-bg-card hover:shadow-card'
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="text-sm text-text-title">{r.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-serif-sc font-semibold text-text-title text-base mb-2">额外信息（可选）</h3>
          <textarea
            className="w-full border border-border rounded-card p-3 text-sm text-text-body bg-bg-card resize-none focus:outline-none focus:ring-1 focus:ring-[#4a6fa5]/30 transition-all"
            rows={3}
            maxLength={100}
            placeholder="告诉命运编织者更多关于你的角色的事... 如：从小失明、有一个宿敌、前世是国王..."
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
          />
          <p className="text-right text-xs text-text-aux mt-1">{extraInfo.length}/100</p>
        </div>
      </div>

      <button
        className="w-full mt-4 min-h-[46px] px-6 rounded-btn font-semibold text-[15px] transition-colors duration-fast cursor-pointer select-none text-white btn-press py-3"
        style={{ backgroundColor: canProceed ? '#4a6fa5' : '#b8b3a8' }}
        disabled={!canProceed}
        onClick={handleNext}
      >
        下一步
      </button>
    </div>
  );
}
