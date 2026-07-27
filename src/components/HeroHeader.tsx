"use client";

import { useEffect, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight, type LucideIcon } from "lucide-react";

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
  // anchor - центр отображаемой недели; отдельно от selectedDate, чтобы можно
  // было пролистать неделю вперёд/назад, не выбирая при этом день
  const [anchor, setAnchor] = useState(selectedDate);

  useEffect(() => {
    setAnchor(selectedDate);
  }, [selectedDate]);

  const days = [-3, -2, -1, 0, 1, 2, 3].map((offset) => addDays(anchor, offset));

  return (
    <div className="card px-4 pt-4 pb-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}
          >
            <Icon size={19} strokeWidth={1.75} />
          </div>
          <div>
            <p className="font-bold text-base leading-tight">{title}</p>
            {subtitle && <p className="text-xs text-gray-400 leading-tight">{subtitle}</p>}
          </div>
        </div>
        {badge && (
          <span className="bg-gray-100 text-xs font-medium px-2.5 py-1 rounded-full whitespace-nowrap text-gray-600">
            {badge}
          </span>
        )}
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => setAnchor((a) => addDays(a, -7))}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <ChevronLeft size={16} />
        </button>
        <div className="flex-1 flex justify-between px-1">
          {days.map((d) => {
            const active = isSameDay(d, selectedDate);
            return (
              <button
                key={d.toISOString()}
                onClick={() => onSelectDate?.(d)}
                className={`flex flex-col items-center gap-0.5 rounded-xl px-2 py-1 transition-colors ${
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
        <button
          onClick={() => setAnchor((a) => addDays(a, 7))}
          className="shrink-0 w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:bg-gray-50 hover:text-gray-600 transition-colors"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
