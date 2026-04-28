'use client';

import { useGame } from '@/store/game-context';
import { WorldSelect } from './screens/world-select';
import { CustomWorld } from './screens/custom-world';
import { WritingStyleSelect } from './screens/writing-style-select';
import { IdentitySetup } from './screens/identity-setup';
import { TalentDraw } from './screens/talent-draw';
import { AttributeAlloc } from './screens/attribute-alloc';
import { FatePreview } from './screens/fate-preview';
import { GameMain } from './screens/game-main';
import { DeathScreen } from './screens/death-screen';
import { AI_MODELS, modelSupportsThinking } from '@/lib/ai/client';

function PhaseTransition({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex-1 min-h-0 overflow-hidden animate-page-in">
      {children}
    </div>
  );
}

function PhaseContent({ phase }: { phase: string }) {
  const { dispatch } = useGame();
  const showSummary = () => {
    dispatch({ type: 'SET_PHASE', payload: 'dead' });
  };

  switch (phase) {
    case 'world-select': return <WorldSelect />;
    case 'custom-world': return <CustomWorld />;
    case 'writing-style-select': return <WritingStyleSelect />;
    case 'identity-setup': return <IdentitySetup />;
    case 'talent-draw': return <TalentDraw />;
    case 'attribute-alloc': return <AttributeAlloc />;
    case 'fate-preview': return <FatePreview />;
    case 'playing': return <GameMain />;
    case 'life-summary': return <GameMain summaryMode onConfirmSummary={showSummary} />;
    case 'dead': return <DeathScreen />;
    default: return null;
  }
}

export function GameShell() {
  const { state } = useGame();

  return (
    <div className="max-w-[640px] w-full mx-auto flex flex-col h-dvh bg-bg-page relative">
      <PhaseTransition key={state.phase}>
        <PhaseContent phase={state.phase} />
      </PhaseTransition>
      <Footer />
    </div>
  );
}

function Footer() {
  const { state, setModel, toggleThinking } = useGame();
  const showThinkingToggle = modelSupportsThinking(state.selectedModel);

  return (
    <div className="flex items-center justify-between py-2 px-4 text-xs text-text-muted border-t border-[rgba(0,0,0,0.08)] bg-bg-page/80 backdrop-blur-sm flex-shrink-0 gap-2">
      <span className="font-sans-sc">AI 驱动的人生模拟</span>
      <div className="flex items-center gap-2">
        {showThinkingToggle && (
          <button
            className={`px-2 py-1 rounded-btn text-xs cursor-pointer transition-colors duration-fast select-none border ${
              state.disableThinking
                ? 'bg-bg-card border-border text-text-aux'
                : 'border-[#a85656] text-[#a85656] bg-[#a85656]/10'
            }`}
            onClick={toggleThinking}
            title={state.disableThinking ? '点击启用深度思考' : '点击关闭深度思考'}
          >
            {state.disableThinking ? '思考: 关' : '思考: 开'}
          </button>
        )}
        <select
          className="bg-bg-card border border-[rgba(0,0,0,0.08)] rounded-btn px-2 py-1 text-xs text-text-aux cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#a85656]/30"
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
