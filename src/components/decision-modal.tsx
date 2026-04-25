'use client';

import { Decision } from '@/types/event';

interface DecisionModalProps {
  decision: Decision;
  age: number;
  onSelect: (optionId: string) => void;
}

export function DecisionModal({ decision, age, onSelect }: DecisionModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-md mx-4 mb-4 sm:mb-0 bg-bg-page border border-border rounded-card shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-[#4a6fa5] px-4 py-3">
          <h3 className="font-serif-sc text-base font-bold text-white">
            {age}岁 — 人生岔路口
          </h3>
        </div>

        {/* Prompt */}
        <div className="px-4 py-3 border-b border-border">
          <p className="text-sm text-text-title leading-relaxed">{decision.prompt}</p>
        </div>

        {/* Options */}
        <div className="p-4 space-y-2">
          {decision.options.map((option) => (
            <button
              key={option.id}
              className="w-full text-left bg-bg-card border border-border rounded-card p-3 hover:border-[#4a6fa5] transition-colors cursor-pointer"
              onClick={() => onSelect(option.id)}
            >
              <div className="font-semibold text-sm text-text-title mb-1">
                {option.text}
              </div>
              <div className="text-xs text-text-aux">{option.hint}</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
