"use client";

import { useSwipeToDismiss } from "@/lib/useSwipeToDismiss";

// Маленькая "ручка" вверху нижнего листа - подсказывает, что его можно
// смахнуть вниз, и обрабатывает сам свайп.
export default function DragHandle({ onDismiss }: { onDismiss: () => void }) {
  const handlers = useSwipeToDismiss(onDismiss);
  return (
    <div className="flex justify-center pb-2 -mt-1 touch-none sm:hidden" {...handlers}>
      <div className="w-10 h-1.5 rounded-full bg-gray-200" />
    </div>
  );
}
