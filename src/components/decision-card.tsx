'use client';

import { Decision, DecisionOption } from '@/types/event';

interface DecisionCardProps {
  decision: Decision;
  age: number;
  selectedOption: string | null;
  onSelect: (optionId: string | null) => void;
  onConfirm: () => void;
  customInput: string;
  onCustomInput: (value: string) => void;
}

export function DecisionCard({ decision, age, selectedOption, onSelect, onConfirm, customInput, onCustomInput }: DecisionCardProps) {
  const hasCustomInput = customInput.trim().length > 0;
  const canConfirm = selectedOption !== null || hasCustomInput;

  return (
    <div className="bg-bg-card border-2 border-[#c4883a]/40 rounded-card p-4 shadow-card">
      {/* Header */}
      <div className="text-center mb-3">
        <div className="text-xs font-semibold tracking-widest" style={{ color: '#c4883a' }}>
          — 关键时刻 —
        </div>
        <div className="text-[10px] text-text-aux mt-1">你的选择将深刻影响未来走向</div>
      </div>

      {/* Question */}
      <p className="text-sm text-text-title leading-relaxed mb-4 font-medium">
        {decision.prompt}
      </p>

      {/* Options */}
      <div className="space-y-2 mb-3">
        {decision.options.map((option) => (
          <label
            key={option.id}
            className={`flex items-start gap-3 p-3 rounded-card border cursor-pointer transition-colors ${
              selectedOption === option.id
                ? 'border-[#4a6fa5] bg-[#4a6fa5]/5'
                : 'border-border bg-bg-page hover:border-border/80'
            }`}
          >
            <input
              type="radio"
              name="decision-option"
              value={option.id}
              checked={selectedOption === option.id}
              onChange={() => onSelect(option.id)}
              className="mt-0.5 flex-shrink-0 accent-[#4a6fa5]"
            />
            <div className="flex-1 min-w-0">
              <div className="text-sm text-text-title">{option.text}</div>
              <div className="text-xs text-text-aux mt-0.5">{option.hint}</div>
            </div>
          </label>
        ))}

        {/* Custom input */}
        {decision.allowFreeInput && (
          <div
            className={`p-3 rounded-card border transition-colors ${
              selectedOption === null && hasCustomInput
                ? 'border-[#4a6fa5] bg-[#4a6fa5]/5'
                : 'border-border bg-bg-page'
            }`}
          >
            <input
              type="text"
              placeholder="或者你想..."
              value={customInput}
              onChange={(e) => {
                onSelect(null);
                onCustomInput(e.target.value);
              }}
              className="w-full bg-transparent text-sm text-text-title placeholder-text-aux/50 outline-none"
            />
          </div>
        )}
      </div>

      {/* Confirm button */}
      <button
        className={`w-full min-h-[40px] rounded-btn font-semibold text-sm transition-colors cursor-pointer btn-press ${
          canConfirm
            ? 'bg-[#4a6fa5] text-white hover:bg-[#3d5f8a]'
            : 'bg-border/40 text-text-aux/50 cursor-not-allowed'
        }`}
        disabled={!canConfirm}
        onClick={onConfirm}
      >
        确认选择
      </button>
    </div>
  );
}
