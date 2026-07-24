"use client";

import { useEffect, useState } from "react";
import { X, Check, Play, Pencil, Trash2 } from "lucide-react";
import { CATEGORY_ICON } from "@/lib/category-icons";
import { fetchJson } from "@/lib/fetchJson";
import type { ProgressEntryDTO, TrainingSessionDTO } from "@/lib/types";

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
  const [doneCounts, setDoneCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    fetchJson<ProgressEntryDTO[]>(`/api/progress?studentId=${studentId}`).then((entries) => {
      if (!entries) return;
      const counts: Record<string, number> = {};
      for (const e of entries) {
        if (e.date !== session.date) continue;
        counts[e.exerciseId] = (counts[e.exerciseId] ?? 0) + 1;
      }
      setDoneCounts(counts);
    });
  }, [studentId, session.date]);

  const program = session.program;
  const totalSets = program ? program.exercises.reduce((sum, pe) => sum + pe.sets.length, 0) : 0;
  const doneSets = program
    ? program.exercises.reduce((sum, pe) => sum + Math.min(doneCounts[pe.exerciseId] ?? 0, pe.sets.length), 0)
    : 0;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
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
              <div className="space-y-3">
                {program.exercises.map((pe) => {
                  const done = doneCounts[pe.exerciseId] ?? 0;
                  const Icon = CATEGORY_ICON[pe.exercise.category];
                  return (
                    <div key={pe.id} className="flex items-start gap-3">
                      <span className="icon-badge w-9 h-9 shrink-0 mt-0.5">
                        <Icon size={17} strokeWidth={1.75} />
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{pe.exercise.name}</p>
                        <div className="flex flex-wrap gap-2 mt-1.5">
                          {pe.sets.map((s, i) => (
                            <span
                              key={s.id}
                              className="flex items-center gap-1.5 text-xs bg-gray-50 rounded-full pl-1 pr-2.5 py-1"
                            >
                              <span className={`check-dot ${i < done ? "done" : ""}`}>
                                <Check size={11} strokeWidth={3} />
                              </span>
                              {s.weight ? `${s.weight}кг` : "б/в"}×{s.reps}
                            </span>
                          ))}
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
            <button onClick={onStart} className="btn-primary w-full text-base">
              <Play size={18} fill="currentColor" /> Начать тренировку
            </button>
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
