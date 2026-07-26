"use client";

import { useEffect, useState } from "react";
import { X, Check, Play, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { fetchJson } from "@/lib/fetchJson";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import type { ProgramExerciseDTO, ProgressEntryDTO, TrainingSessionDTO } from "@/lib/types";

interface SessionDetailCardProps {
  session: TrainingSessionDTO;
  studentId: string;
  canStart?: boolean;
  onStart?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose: () => void;
}

export default function SessionDetailCard({
  session,
  studentId,
  canStart,
  onStart,
  onEdit,
  onDelete,
  onClose,
}: SessionDetailCardProps) {
  const [entries, setEntries] = useState<ProgressEntryDTO[]>([]);
  const [busySet, setBusySet] = useState<string | null>(null);

  useLockBodyScroll();

  const loadEntries = async () => {
    const data = await fetchJson<ProgressEntryDTO[]>(
      `/api/progress?studentId=${studentId}&sessionId=${session.id}`
    );
    if (data) setEntries(data);
  };

  useEffect(() => {
    loadEntries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, session.id]);

  const entriesForExercise = (exerciseId: string) =>
    entries
      .filter((e) => e.exerciseId === exerciseId)
      .sort((a, b) => (a.setIndex ?? 999) - (b.setIndex ?? 999) || a.id.localeCompare(b.id));

  const doneCounts: Record<string, number> = {};
  for (const e of entries) doneCounts[e.exerciseId] = (doneCounts[e.exerciseId] ?? 0) + 1;

  const program = session.program;
  const totalSets = program ? program.exercises.reduce((sum, pe) => sum + pe.sets.length, 0) : 0;
  const doneSets = program
    ? program.exercises.reduce((sum, pe) => sum + Math.min(doneCounts[pe.exerciseId] ?? 0, pe.sets.length), 0)
    : 0;
  const completed = totalSets > 0 && doneSets >= totalSets;

  const toggleSet = async (pe: ProgramExerciseDTO, setIndex: number) => {
    const key = `${pe.exerciseId}:${setIndex}`;
    if (busySet) return;
    setBusySet(key);
    try {
      const forExercise = entriesForExercise(pe.exerciseId);
      if (setIndex < forExercise.length) {
        await fetch(`/api/progress/${forExercise[setIndex].id}`, { method: "DELETE" });
      } else {
        const target = pe.sets[setIndex];
        await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentId,
            exerciseId: pe.exerciseId,
            sessionId: session.id,
            setIndex,
            date: session.date,
            weight: target.weight,
            reps: target.reps,
            sets: 1,
          }),
        });
      }
      await loadEntries();
    } finally {
      setBusySet(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto overscroll-contain">
        <div className="px-6 pt-6 pb-4 border-b border-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-2xl font-bold tracking-tight">
                {session.startTime}–{session.endTime}
              </p>
              <p className="text-sm text-gray-400 mt-0.5">
                {session.date} {session.title ? `· ${session.title}` : ""}
              </p>
            </div>
            <button onClick={onClose} className="text-gray-400">
              <X size={22} />
            </button>
          </div>

          {program && totalSets > 0 && (
            <div className="flex items-center gap-2 mt-3">
              <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ backgroundColor: "var(--accent)", width: `${Math.round((doneSets / totalSets) * 100)}%` }}
                />
              </div>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {doneSets}/{totalSets} сетов
              </span>
            </div>
          )}
        </div>

        <div className="px-6 py-4 space-y-4">
          {program ? (
            <div>
              <p className="font-semibold mb-2">{program.name}</p>
              <p className="text-xs text-gray-400 mb-2">Нажмите на кружок, чтобы отметить или снять отметку о выполнении сета</p>
              <div className="space-y-3">
                {program.exercises.map((pe) => {
                  const done = doneCounts[pe.exerciseId] ?? 0;
                  const Icon = getCategoryIcon(pe.exercise.category);
                  return (
                    <div key={pe.id} className="flex items-start gap-3">
                      <span className="icon-badge w-9 h-9 shrink-0 mt-0.5">
                        <Icon size={17} strokeWidth={1.75} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pe.exercise.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {pe.sets.map((s, i) => {
                            const key = `${pe.exerciseId}:${i}`;
                            return (
                              <span
                                key={s.id}
                                className="flex items-center gap-1.5 text-xs bg-gray-50 rounded-full pl-1 pr-2.5 py-1"
                              >
                                <button
                                  type="button"
                                  onClick={() => toggleSet(pe, i)}
                                  disabled={busySet === key}
                                  className={`check-dot ${i < done ? "done" : ""} p-0 leading-none cursor-pointer disabled:opacity-50 disabled:cursor-default`}
                                >
                                  <Check size={11} strokeWidth={3} />
                                </button>
                                {s.weight ? `${s.weight}кг` : "б/в"}×{s.reps}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-400">Без программы</p>
          )}

          {session.notes && (
            <div>
              <p className="text-xs text-gray-400 mb-1">Заметки</p>
              <p className="text-sm">{session.notes}</p>
            </div>
          )}
        </div>

        <div className="px-6 pb-6 pt-2 space-y-2">
          {canStart && program && (
            completed ? (
              <div className="flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 text-emerald-600 text-sm font-medium py-3">
                <CheckCircle2 size={18} /> Тренировка выполнена
              </div>
            ) : (
              <button onClick={onStart} className="btn-primary w-full text-base">
                <Play size={18} fill="currentColor" /> Начать тренировку
              </button>
            )
          )}
          <div className="flex gap-2">
            {onEdit && (
              <button onClick={onEdit} className="btn-secondary flex-1 text-sm py-2.5">
                <Pencil size={14} /> Изменить
              </button>
            )}
            {onDelete && (
              <button onClick={onDelete} className="btn-danger flex-1 text-sm py-2.5">
                <Trash2 size={14} /> Удалить
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
