'use client';

import { useGame } from '@/store/game-context';
import { WorldSelect } from './screens/world-select';
import { IdentitySetup } from './screens/identity-setup';
import { TalentDraw } from './screens/talent-draw';
import { AttributeAlloc } from './screens/attribute-alloc';
import { FatePreview } from './screens/fate-preview';
import { GameMain } from './screens/game-main';
import { DeathScreen } from './screens/death-screen';
import { AI_MODELS, modelSupportsThinking } from '@/lib/ai/client';

export function GameShell() {
  const { state, dispatch } = useGame();

  const showSummary = () => {
    dispatch({ type: 'SET_PHASE', payload: 'dead' });
  };

  return (
    <div className="max-w-[460px] mx-auto flex flex-col h-dvh bg-bg-page page-texture relative">
      <div className="flex-1 min-h-0 overflow-y-auto">
        {state.phase === 'world-select' && <WorldSelect />}
        {state.phase === 'identity-setup' && <IdentitySetup />}
        {state.phase === 'talent-draw' && <TalentDraw />}
        {state.phase === 'attribute-alloc' && <AttributeAlloc />}
        {state.phase === 'fate-preview' && <FatePreview />}
        {state.phase === 'playing' && <GameMain />}
        {state.phase === 'life-summary' && <GameMain summaryMode onConfirmSummary={showSummary} />}
        {state.phase === 'dead' && <DeathScreen />}
      </div>
      <Footer />
    </div>
  );
}

function Footer() {
  const { state, setModel, toggleThinking } = useGame();
  const showThinkingToggle = modelSupportsThinking(state.selectedModel);

  return (
    <div className="flex items-center justify-between py-2 px-4 text-xs text-text-muted border-t border-border bg-bg-page/80 backdrop-blur-sm flex-shrink-0 gap-2">
      <span className="font-sans-sc">AI 驱动的人生模拟</span>
      <div className="flex items-center gap-2">
        {showThinkingToggle && (
          <button
            className={`px-2 py-1 rounded-btn text-xs cursor-pointer transition-colors duration-fast select-none border ${
              state.disableThinking
                ? 'bg-bg-card border-border text-text-aux'
                : 'border-[#4a6fa5] text-[#4a6fa5] bg-[#4a6fa5]/10'
            }`}
            onClick={toggleThinking}
            title={state.disableThinking ? '点击启用深度思考' : '点击关闭深度思考'}
          >
            {state.disableThinking ? '思考: 关' : '思考: 开'}
          </button>
        )}
        <select
          className="bg-bg-card border border-border rounded-btn px-2 py-1 text-xs text-text-aux cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#4a6fa5]/30"
          value={state.selectedModel}
          onChange={(e) => setModel(e.target.value)}
        >
          {AI_MODELS.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name} ({m.speed})
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
