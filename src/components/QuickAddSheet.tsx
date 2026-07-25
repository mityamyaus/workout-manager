"use client";

import { Dumbbell, ClipboardList } from "lucide-react";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";

interface QuickAddSheetProps {
  onAddSession: () => void;
  onAddProgram: () => void;
  onClose: () => void;
}

export default function QuickAddSheet({ onAddSession, onAddProgram, onClose }: QuickAddSheetProps) {
  useLockBodyScroll();

  return (
    <div className="fixed inset-0 z-30" onClick={onClose}>
      <div className="fixed inset-0 bg-black/30" />
      <div
        className="fixed bottom-24 left-0 right-0 flex justify-center px-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgba(20,21,26,0.18)] p-2 w-full max-w-xs flex flex-col gap-1">
          <button
            onClick={onAddSession}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-left"
          >
            <span className="icon-badge w-11 h-11" style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}>
              <Dumbbell size={20} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block font-semibold text-sm">Тренировка</span>
              <span className="block text-xs text-gray-400">Запланировать в календарь</span>
            </span>
          </button>
          <button
            onClick={onAddProgram}
            className="flex items-center gap-3 px-4 py-3.5 rounded-2xl hover:bg-gray-50 transition-colors text-left"
          >
            <span className="icon-badge w-11 h-11" style={{ backgroundColor: "#05966922", color: "#059669" }}>
              <ClipboardList size={20} strokeWidth={1.75} />
            </span>
            <span>
              <span className="block font-semibold text-sm">Программа</span>
              <span className="block text-xs text-gray-400">Составить упражнения</span>
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
