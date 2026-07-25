"use client";

import { useRef } from "react";
import type { TouchEvent } from "react";

const MIN_DISTANCE = 80;

// Свайп вниз для закрытия модалки/шторки. Навешивается на "ручку" вверху
// листа, а не на весь скроллируемый контент - иначе случайный скролл вверх
// внутри модалки закрывал бы её.
export function useSwipeToDismiss(onDismiss: () => void) {
  const startY = useRef<number | null>(null);

  const onTouchStart = (e: TouchEvent) => {
    startY.current = e.touches[0].clientY;
  };

  const onTouchEnd = (e: TouchEvent) => {
    const from = startY.current;
    startY.current = null;
    if (from == null) return;

    const dy = e.changedTouches[0].clientY - from;
    if (dy > MIN_DISTANCE) onDismiss();
  };

  return { onTouchStart, onTouchEnd };
}
