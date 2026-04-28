'use client';

import { useGame } from '@/store/game-context';
import { useState, useEffect } from 'react';

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

function parseTingyuanCharacters(description: string): string[] {
  const match = description.match(/有以下成员[：:](.+?)[。\.]/);
  if (!match) return [];
  return match[1].split(/[，,]/).map(name =>
    name.replace(/（[^）]*）/g, '').replace(/\([^)]*\)/g, '').trim()
  ).filter(name => name.length > 0);
}

function detectPlayingAs(extraInfo: string, characters: string[]): string | null {
  const text = extraInfo.trim();
  if (!text) return null;
  for (const char of characters) {
    if (text.includes(char)) return char;
  }
  return null;
}

export function IdentitySetup() {
  const { state, dispatch, setIdentity } = useGame();
  const [extraInfo, setExtraInfo] = useState(state.identity?.extraInfo || '');
  const [raceCustom, setRaceCustom] = useState(state.identity?.raceCustom || '');
  const [genderCustom, setGenderCustom] = useState(state.identity?.genderCustom || '');
  const [tingyuanCharacters, setTingyuanCharacters] = useState<string[]>([]);
  const [tingyuanShowAll, setTingyuanShowAll] = useState(false);
  const detectedCharacter = tingyuanCharacters.length > 0 && extraInfo.trim()
    ? detectPlayingAs(extraInfo, tingyuanCharacters)
    : null;

  useEffect(() => {
    if (state.world?.id === 'special_tingyuan') {
      fetch('/special/tingyuan.txt')
        .then(r => r.text())
        .then(content => {
          setTingyuanCharacters(parseTingyuanCharacters(content));
        })
        .catch(() => {});
    }
  }, [state.world?.id]);

  const gender = state.identity?.gender;
  const race = state.identity?.race;
  const isCustomRace = race === 'custom';
  const canProceed = !!gender && (!!race && (!isCustomRace || raceCustom.trim()));

  const handleNext = () => {
    setIdentity({
      gender, race,
      genderCustom: gender === 'custom' ? genderCustom : undefined,
      raceCustom: isCustomRace ? raceCustom : undefined,
      extraInfo,
      playingAs: detectedCharacter || undefined,
    });
    dispatch({ type: 'SET_PHASE', payload: 'talent-draw' });
  };

  return (
    <div className="flex flex-col items-center h-dvh bg-bg-page px-6 py-6">
      {/* Header */}
      <div className="w-full text-center pt-4 pb-6">
        <div className="relative inline-block mb-3">
          <div className="text-2xl">⏳</div>
        </div>
        <h2 className="font-serif-sc text-2xl font-bold text-text-title mb-1">身份设定</h2>
        <p className="text-text-aux text-sm">选择你这一世的性别和种族</p>
        <div className="flex items-center justify-center mt-4 gap-2">
          <div className="h-px flex-1 max-w-[120px] bg-border" />
          <div className="text-sm" style={{ color: '#a85656' }}>✦</div>
          <div className="h-px flex-1 max-w-[120px] bg-border" />
        </div>
      </div>

      <div className="w-full space-y-4 flex-1 overflow-y-auto scrollbar-hide px-1">
        {/* Gender */}
        <div>
          <h3 className="font-serif-sc font-semibold text-text-title text-base mb-3">性别</h3>
          <div className="grid grid-cols-3 gap-3">
            {GENDERS.map((g) => (
              <button
                key={g.id}
                onClick={() => setIdentity({ gender: g.id })}
                className={`border rounded-card p-4 flex flex-col items-center gap-2 transition-all duration-fast cursor-pointer ${
                  gender === g.id
                    ? 'border-[#a85656] bg-bg-card'
                    : 'border-[rgba(0,0,0,0.08)] bg-bg-card'
                }`}
              >
                <span className="text-2xl">{g.icon}</span>
                <span className="text-sm text-text-title">{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Race */}
        <div>
          <h3 className="font-serif-sc font-semibold text-text-title text-base mb-3">种族</h3>
          <div className="grid grid-cols-3 gap-3">
            {RACES.map((r) => (
              <button
                key={r.id}
                onClick={() => setIdentity({ race: r.id })}
                className={`border rounded-card p-4 flex flex-col items-center gap-2 transition-all duration-fast cursor-pointer ${
                  race === r.id
                    ? 'border-[#a85656] bg-bg-card'
                    : 'border-[rgba(0,0,0,0.08)] bg-bg-card'
                }`}
              >
                <span className="text-2xl">{r.icon}</span>
                <span className="text-sm text-text-title">{r.label}</span>
              </button>
            ))}
          </div>
          {isCustomRace && (
            <input
              className="w-full mt-3 border border-[rgba(0,0,0,0.08)] rounded-btn p-3 text-sm text-text-body bg-bg-card focus:outline-none focus:ring-1 focus:ring-[#a85656]/30"
              placeholder="请输入自定义种族名称..."
              value={raceCustom}
              onChange={(e) => setRaceCustom(e.target.value)}
              maxLength={20}
            />
          )}
        </div>

        {/* Extra info */}
        <div>
          <h3 className="font-serif-sc font-semibold text-text-title text-base mb-2">额外信息 <span className="text-text-muted font-normal">（可选）</span></h3>
          <textarea
            className="w-full border border-[rgba(0,0,0,0.08)] rounded-card p-3 text-sm text-text-body bg-bg-card resize-none focus:outline-none focus:ring-1 focus:ring-[#a85656]/30"
            rows={3}
            maxLength={300}
            placeholder="告诉命运编织者更多关于你的角色的事... 如：从小失明、有一个宿敌、前世是国王..."
            value={extraInfo}
            onChange={(e) => setExtraInfo(e.target.value)}
          />
          <p className="text-right text-xs text-text-aux mt-1">{extraInfo.length}/300</p>

          {state.world?.id === 'special_tingyuan' && tingyuanCharacters.length > 0 && (
            <div className="mt-3 p-3 border border-[rgba(0,0,0,0.08)] rounded-card bg-bg-card">
              <p className="text-xs text-text-aux mb-2">输入&apos;我是[角色名]&apos;或直接输入角色名即可扮演该角色：</p>
              <div className="flex flex-wrap gap-1">
                {(tingyuanShowAll ? tingyuanCharacters : tingyuanCharacters.slice(0, 10)).map(char => (
                  <button
                    key={char}
                    onClick={() => setExtraInfo(`我是${char}`)}
                    className={`text-xs px-2 py-1 rounded-btn cursor-pointer transition-colors ${
                      detectedCharacter === char
                        ? 'bg-[#a85656] text-white'
                        : 'bg-bg-page text-text-aux hover:text-text-title'
                    }`}
                  >
                    {char}
                  </button>
                ))}
                {tingyuanCharacters.length > 10 && (
                  <button
                    onClick={() => setTingyuanShowAll(!tingyuanShowAll)}
                    className="text-xs text-[#a85656] px-2 py-1 cursor-pointer hover:underline"
                  >
                    {tingyuanShowAll ? '收起' : `+${tingyuanCharacters.length - 10}...`}
                  </button>
                )}
              </div>
              {detectedCharacter && (
                <p className="text-xs text-[#5a8c5a] mt-2">✓ 将扮演「{detectedCharacter}」</p>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Bottom buttons */}
      <div className="w-full flex gap-3 pb-16 pt-4">
        <button
          className="flex-1 min-h-[46px] rounded-btn font-semibold text-[15px] cursor-pointer select-none text-[#a85656] border border-[#a85656] bg-bg-card"
          onClick={() => dispatch({ type: 'SET_PHASE', payload: 'world-select' })}
        >
          返回
        </button>
        <button
          className="flex-1 min-h-[46px] rounded-btn font-semibold text-[15px] cursor-pointer select-none text-white"
          style={{ backgroundColor: canProceed ? '#a85656' : '#b8b3a8' }}
          disabled={!canProceed}
          onClick={handleNext}
        >
          下一步
        </button>
      </div>
    </div>
  );
}
