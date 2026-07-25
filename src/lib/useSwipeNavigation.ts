"use client";

import { useRef } from "react";
import type { TouchEvent } from "react";

const MIN_DISTANCE = 60;
const MAX_OFF_AXIS_RATIO = 0.6; // насколько вертикальное смещение может быть меньше горизонтального

// Горизонтальный свайп для переключения между вкладками нижней навигации.
// Возвращает обработчики touch-событий для навешивания на контейнер контента вкладок.
export function useSwipeNavigation<T extends string>(
  items: readonly T[],
  active: T,
  onChange: (key: T) => void
) {
  const start = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    const t = e.touches[0];
    start.current = { x: t.clientX, y: t.clientY };
  };

  const onTouchEnd = (e: TouchEvent) => {
    const from = start.current;
    start.current = null;
    if (!from) return;

    const t = e.changedTouches[0];
    const dx = t.clientX - from.x;
    const dy = t.clientY - from.y;

    if (Math.abs(dx) < MIN_DISTANCE) return;
    if (Math.abs(dy) > Math.abs(dx) * MAX_OFF_AXIS_RATIO) return;

    const idx = items.indexOf(active);
    if (idx === -1) return;

    if (dx < 0 && idx < items.length - 1) onChange(items[idx + 1]);
    else if (dx > 0 && idx > 0) onChange(items[idx - 1]);
  };

  return { onTouchStart, onTouchEnd };
}
