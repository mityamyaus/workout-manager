"use client";

import { useState } from "react";
import { X, Trash2, Check, Dumbbell } from "lucide-react";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import type { ProgramDTO, TrainingSessionDTO } from "@/lib/types";

const REMINDER_OPTIONS = [
  { value: 0, label: "Без напоминания" },
  { value: 5, label: "За 5 минут" },
  { value: 10, label: "За 10 минут" },
  { value: 15, label: "За 15 минут" },
  { value: 30, label: "За 30 минут" },
  { value: 60, label: "За 1 час" },
  { value: 120, label: "За 2 часа" },
  { value: 1440, label: "За 1 день" },
];

interface SessionFormProps {
  date: string;
  programs: ProgramDTO[];
  initial?: TrainingSessionDTO | null;
  onCancel: () => void;
  onSave: (data: {
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    programId: string | null;
    notes: string;
    reminderMinutesBefore: number;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
  onEditProgram?: (program: ProgramDTO) => void;
  canEditProgram?: (program: ProgramDTO) => boolean;
}

export default function SessionForm({
  date,
  programs,
  initial,
  onCancel,
  onSave,
  onDelete,
  onEditProgram,
  canEditProgram,
}: SessionFormProps) {
  const [startTime, setStartTime] = useState(initial?.startTime ?? "18:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "19:00");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [programId, setProgramId] = useState<string>(initial?.programId ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    initial?.reminderMinutesBefore ?? 15
  );
  const [busy, setBusy] = useState(false);

  useLockBodyScroll();

  const handleSave = async () => {
    setBusy(true);
    await onSave({
      date,
      startTime,
      endTime,
      title,
      programId: programId || null,
      notes,
      reminderMinutesBefore,
    });
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {initial ? "Тренировка" : "Новая тренировка"} · {date}
          </h3>
          <button onClick={onCancel} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <label className="min-w-0 text-sm text-gray-500">
            Начало
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full min-w-0 mt-1 rounded-xl border border-gray-300 px-2 py-2 box-border"
            />
          </label>
          <label className="min-w-0 text-sm text-gray-500">
            Конец
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full min-w-0 mt-1 rounded-xl border border-gray-300 px-2 py-2 box-border"
            />
          </label>
        </div>

        <label className="block text-sm text-gray-500">
          Название (необязательно)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Верх тела"
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>

        <label className="block text-sm text-gray-500">
          Программа тренировки
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
          >
            <option value="">Без программы</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isIndividual ? "(индивид.)" : ""}
              </option>
            ))}
          </select>
        </label>

        {programId && onEditProgram && (() => {
          const program = programs.find((p) => p.id === programId);
          if (!program) return null;
          if (canEditProgram && !canEditProgram(program)) return null;
          return (
            <button
              type="button"
              onClick={() => onEditProgram(program)}
              className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-gray-300 py-2 text-sm text-gray-500 font-medium hover:bg-gray-50 hover:border-gray-400 transition-colors"
            >
              <Dumbbell size={14} /> Настроить веса программы
            </button>
          );
        })()}

        <label className="block text-sm text-gray-500">
          Напоминание
          <select
            value={reminderMinutesBefore}
            onChange={(e) => setReminderMinutesBefore(Number(e.target.value))}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
          >
            {REMINDER_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block text-sm text-gray-500">
          Заметки
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>

        <div className="flex gap-2 pt-2">
          {onDelete && (
            <button onClick={onDelete} className="btn-danger flex-1 text-sm">
              <Trash2 size={14} /> Удалить
            </button>
          )}
          <button disabled={busy} onClick={handleSave} className="btn-primary flex-1 text-sm">
            <Check size={14} /> Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
