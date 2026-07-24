"use client";

import { addDays, format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import type { LucideIcon } from "lucide-react";

interface HeroHeaderProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  badge?: string;
  selectedDate?: Date;
  onSelectDate?: (d: Date) => void;
}

export default function HeroHeader({
  title,
  subtitle,
  icon: Icon,
  badge,
  selectedDate = new Date(),
  onSelectDate,
}: HeroHeaderProps) {
  const days = [-3, -2, -1, 0, 1, 2, 3].map((offset) => addDays(selectedDate, offset));

  return (
    <div className="card px-5 pt-5 pb-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}
          >
            <Icon size={22} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-bold text-lg leading-tight">{title}</p>
            {subtitle && <p className="text-sm text-gray-400 leading-tight">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="bg-gray-100 text-xs font-medium px-3 py-1.5 rounded-full whitespace-nowrap text-gray-600">
            {badge}
          </span>
        )}
      </div>

      <div className="flex justify-between px-1">
        {days.map((d) => {
          const active = isSameDay(d, selectedDate);
          return (
            <button
              key={d.toISOString()}
              onClick={() => onSelectDate?.(d)}
              className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 transition-colors ${
                active ? "hero-gradient" : "hover:bg-gray-50"
              }`}
            >
              <span className={`text-[10px] uppercase ${active ? "text-gray-800/70" : "text-gray-400"}`}>
                {format(d, "EEEEEE", { locale: ru })}
              </span>
              <span className={`text-sm ${active ? "font-bold text-gray-900" : "font-medium text-gray-700"}`}>
                {format(d, "d")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
