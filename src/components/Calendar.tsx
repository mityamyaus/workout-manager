"use client";

import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { ru } from "date-fns/locale";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { TrainingSessionDTO } from "@/lib/types";

interface CalendarProps {
  month: Date;
  onMonthChange: (d: Date) => void;
  sessions: TrainingSessionDTO[];
  onDayClick?: (dateStr: string) => void;
  selectedDate?: string | null;
}

export default function Calendar({
  month,
  onMonthChange,
  sessions,
  onDayClick,
  selectedDate,
}: CalendarProps) {
  const start = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const end = endOfWeek(endOfMonth(month), { weekStartsOn: 1 });
  const days = eachDayOfInterval({ start, end });

  const sessionsByDate = new Map<string, TrainingSessionDTO[]>();
  for (const s of sessions) {
    const list = sessionsByDate.get(s.date) ?? [];
    list.push(s);
    sessionsByDate.set(s.date, list);
  }

  return (
    <div className="card p-3.5">
      <div className="flex items-center justify-between mb-2.5 px-0.5">
        <button
          onClick={() => onMonthChange(subMonths(month, 1))}
          className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center"
        >
          <ChevronLeft size={16} />
        </button>
        <span className="font-semibold text-sm capitalize">
          {format(month, "LLLL yyyy", { locale: ru })}
        </span>
        <button
          onClick={() => onMonthChange(addMonths(month, 1))}
          className="w-7 h-7 rounded-full hover:bg-gray-100 text-gray-400 flex items-center justify-center"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="grid grid-cols-7 text-center text-[10px] text-gray-400 mb-1">
        {["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"].map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-0.5">
        {days.map((day) => {
          const dateStr = format(day, "yyyy-MM-dd");
          const daySessions = sessionsByDate.get(dateStr) ?? [];
          const inMonth = isSameMonth(day, month);
          const selected = selectedDate === dateStr;

          return (
            <button
              key={dateStr}
              onClick={() => onDayClick?.(dateStr)}
              className={`h-9 rounded-full flex flex-col items-center justify-center text-xs transition-colors relative
                ${inMonth ? "text-gray-700" : "text-gray-300"}
                ${selected ? "hero-gradient font-bold text-gray-900" : "hover:bg-gray-100"}
                ${isToday(day) && !selected ? "ring-1 ring-gray-300" : ""}
              `}
            >
              <span>{format(day, "d")}</span>
              {daySessions.length > 0 && (
                <span
                  className={`absolute bottom-0.5 w-1 h-1 rounded-full ${
                    selected ? "bg-gray-900" : "bg-emerald-500"
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
