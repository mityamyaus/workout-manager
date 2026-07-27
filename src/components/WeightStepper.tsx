"use client";

import { Minus, Plus } from "lucide-react";

interface WeightStepperProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}

// "Крутилка" веса: +/- шагом 0.5 кг, но поле остаётся обычным числовым
// input'ом - можно и вписать значение вручную (в т.ч. дробное).
export default function WeightStepper({ value, onChange, step = 0.5, min = 0 }: WeightStepperProps) {
  const round = (v: number) => Math.round(v * 2) / 2;
  const clamp = (v: number) => Math.max(min, round(v));

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={() => onChange(clamp(value - step))}
        className="icon-badge w-7 h-7 shrink-0 bg-white border border-gray-200 text-gray-500 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
      >
        <Minus size={13} strokeWidth={2} />
      </button>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-14 rounded-lg border border-gray-300 px-1 py-1.5 text-center text-sm"
        title="Вес, кг"
      />
      <button
        type="button"
        onClick={() => onChange(clamp(value + step))}
        className="icon-badge w-7 h-7 shrink-0 bg-white border border-gray-200 text-gray-500 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
      >
        <Plus size={13} strokeWidth={2} />
      </button>
    </div>
  );
}
