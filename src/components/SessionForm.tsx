"use client";

import { useEffect, useState } from "react";
import { X, Trash2, Check } from "lucide-react";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import WeightStepper from "@/components/WeightStepper";
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

type ProgramSets = Record<string, { weight: number; reps: number }[]>;

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
  canEditProgram?: (program: ProgramDTO) => boolean;
}

export default function SessionForm({
  date,
  programs,
  initial,
  onCancel,
  onSave,
  onDelete,
  canEditProgram,
}: SessionFormProps) {
  const [sessionDate, setSessionDate] = useState(initial?.date ?? date);
  const [startTime, setStartTime] = useState(initial?.startTime ?? "18:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "19:00");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [programId, setProgramId] = useState<string>(initial?.programId ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [reminderMinutesBefore, setReminderMinutesBefore] = useState(
    initial?.reminderMinutesBefore ?? 15
  );
  const [programSets, setProgramSets] = useState<ProgramSets>({});
  const [busy, setBusy] = useState(false);

  useLockBodyScroll();

  const selectedProgram = programs.find((p) => p.id === programId) ?? null;
  const editableProgram = selectedProgram
    ? !canEditProgram || canEditProgram(selectedProgram)
    : false;

  useEffect(() => {
    if (!selectedProgram) {
      setProgramSets({});
      return;
    }
    const map: ProgramSets = {};
    for (const pe of selectedProgram.exercises) {
      map[pe.exerciseId] = pe.sets.map((s) => ({ weight: s.weight, reps: s.reps }));
    }
    setProgramSets(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [programId]);

  const updateProgramSet = (exerciseId: string, setIndex: number, field: "weight" | "reps", value: number) => {
    setProgramSets((prev) => ({
      ...prev,
      [exerciseId]: (prev[exerciseId] ?? []).map((s, i) => (i === setIndex ? { ...s, [field]: value } : s)),
    }));
  };

  const handleSave = async () => {
    setBusy(true);

    if (selectedProgram && editableProgram) {
      const exercisesPayload = selectedProgram.exercises.map((pe) => ({
        exerciseId: pe.exerciseId,
        restSeconds: pe.restSeconds,
        notes: pe.notes ?? undefined,
        sets: programSets[pe.exerciseId] ?? pe.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
      }));
      await fetch(`/api/programs/${selectedProgram.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: selectedProgram.name, exercises: exercisesPayload }),
      });
    }

    await onSave({
      date: sessionDate,
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
          <h3 className="text-lg font-semibold">{initial ? "Тренировка" : "Новая тренировка"}</h3>
          <button onClick={onCancel} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        <label className="block text-sm text-gray-500">
          Дата
          <input
            type="date"
            value={sessionDate}
            onChange={(e) => setSessionDate(e.target.value)}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>

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

        {selectedProgram && (
          <div className="bg-gray-50 rounded-2xl p-3 space-y-3">
            <p className="text-xs font-medium text-gray-500">
              {editableProgram ? "Веса и повторения на эту тренировку" : "Веса и повторения"}
            </p>
            {selectedProgram.exercises.map((pe) => (
              <div key={pe.id} className="space-y-1.5">
                <p className="text-sm font-medium">{pe.exercise.name}</p>
                <div className="space-y-1.5">
                  {(programSets[pe.exerciseId] ?? pe.sets).map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 w-9 shrink-0">Сет {i + 1}</span>
                      {editableProgram ? (
                        <>
                          <WeightStepper
                            value={s.weight}
                            onChange={(v) => updateProgramSet(pe.exerciseId, i, "weight", v)}
                          />
                          <span className="text-xs text-gray-400">кг ×</span>
                          <input
                            type="number"
                            value={s.reps}
                            onChange={(e) => updateProgramSet(pe.exerciseId, i, "reps", Number(e.target.value))}
                            className="w-14 rounded-lg border border-gray-300 px-1 py-1.5 text-center text-sm"
                            title="Повторения"
                          />
                          <span className="text-xs text-gray-400">повт.</span>
                        </>
                      ) : (
                        <span className="text-sm text-gray-600">
                          {s.weight ? `${s.weight} кг` : "б/в"} × {s.reps} повт.
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

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
