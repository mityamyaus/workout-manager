"use client";

import { Plus, type LucideIcon } from "lucide-react";

interface BottomNavItem<T extends string> {
  key: T;
  label: string;
  icon: LucideIcon;
}

interface BottomNavProps<T extends string> {
  items: [BottomNavItem<T>, BottomNavItem<T>, BottomNavItem<T>, BottomNavItem<T>];
  active: T;
  onChange: (key: T) => void;
  onCenterAction: () => void;
}

export default function BottomNav<T extends string>({
  items,
  active,
  onChange,
  onCenterAction,
}: BottomNavProps<T>) {
  const [left1, left2, right1, right2] = items;

  const renderItem = (item: BottomNavItem<T>) => {
    const isActive = item.key === active;
    const Icon = item.icon;
    return (
      <button
        key={item.key}
        onClick={() => onChange(item.key)}
        className="flex flex-col items-center justify-center gap-1 w-14 h-14 rounded-2xl transition-all duration-200 active:scale-90"
      >
        <Icon
          size={22}
          strokeWidth={isActive ? 2 : 1.75}
          className={`transition-all duration-200 ${isActive ? "text-gray-900 scale-110" : "text-gray-300"}`}
        />
        <span
          className={`w-1 h-1 rounded-full transition-colors duration-200 ${
            isActive ? "bg-[var(--accent)]" : "bg-transparent"
          }`}
        />
      </button>
    );
  };

  return (
    <div className="fixed bottom-4 left-0 right-0 flex justify-center px-4 z-20">
      <div className="relative flex items-center">
        <div className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgba(20,21,26,0.12)] flex items-center gap-1 px-3 py-1.5">
          {renderItem(left1)}
          {renderItem(left2)}
          <span className="w-14" />
          {renderItem(right1)}
          {renderItem(right2)}
        </div>
        <button
          onClick={onCenterAction}
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-14 h-14 rounded-[1.4rem] hero-gradient shadow-[0_10px_24px_-8px_rgba(74,222,128,0.6)] flex items-center justify-center text-gray-900 transition-transform duration-200 active:scale-90 hover:scale-105"
        >
          <Plus size={26} strokeWidth={2} />
        </button>
      </div>
    </div>
  );
}
