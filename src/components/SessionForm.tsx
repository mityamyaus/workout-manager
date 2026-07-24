"use client";

import { useState } from "react";
import { X, Trash2, Check, RefreshCw } from "lucide-react";
import type { ProgramDTO, TrainingSessionDTO } from "@/lib/types";

interface SessionFormProps {
  date: string;
  programs: ProgramDTO[];
  initial?: TrainingSessionDTO | null;
  requiresApproval?: boolean;
  onCancel: () => void;
  onSave: (data: {
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    programId: string | null;
    notes: string;
  }) => Promise<void>;
  onDelete?: () => Promise<void>;
}

export default function SessionForm({
  date,
  programs,
  initial,
  requiresApproval,
  onCancel,
  onSave,
  onDelete,
}: SessionFormProps) {
  const [startTime, setStartTime] = useState(initial?.startTime ?? "18:00");
  const [endTime, setEndTime] = useState(initial?.endTime ?? "19:00");
  const [title, setTitle] = useState(initial?.title ?? "");
  const [programId, setProgramId] = useState<string>(initial?.programId ?? "");
  const [notes, setNotes] = useState(initial?.notes ?? "");
  const [busy, setBusy] = useState(false);

  const pendingRequest = initial?.changeRequest?.status === "PENDING" ? initial.changeRequest : null;

  const handleSave = async () => {
    setBusy(true);
    await onSave({
      date,
      startTime,
      endTime,
      title,
      programId: programId || null,
      notes,
    });
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {initial ? "Тренировка" : "Новая тренировка"} · {date}
          </h3>
          <button onClick={onCancel} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        {requiresApproval && (
          <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
            Эту тренировку назначил тренер. Вы можете предложить другое время — тренер получит уведомление и должен будет подтвердить перенос.
          </p>
        )}

        {pendingRequest && (
          <p className="text-xs text-blue-600 bg-blue-50 rounded-xl px-3 py-2">
            Уже отправлена заявка на перенос: {pendingRequest.requestedDate} {pendingRequest.requestedStartTime}–
            {pendingRequest.requestedEndTime} (ожидает решения тренера)
          </p>
        )}

        <div className="flex gap-3">
          <label className="flex-1 text-sm text-gray-500">
            Начало
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="flex-1 text-sm text-gray-500">
            Конец
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
            />
          </label>
        </div>

        <label className="block text-sm text-gray-500">
          Название (необязательно)
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Например: Верх тела"
            disabled={requiresApproval}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </label>

        <label className="block text-sm text-gray-500">
          Программа тренировки
          <select
            value={programId}
            onChange={(e) => setProgramId(e.target.value)}
            disabled={requiresApproval}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">Без программы</option>
            {programs.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.isIndividual ? "(индивид.)" : ""}
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
            disabled={requiresApproval}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2 disabled:bg-gray-50 disabled:text-gray-400"
          />
        </label>

        <div className="flex gap-2 pt-2">
          {onDelete && (
            <button onClick={onDelete} className="btn-danger flex-1 text-sm">
              <Trash2 size={14} /> Удалить
            </button>
          )}
          <button disabled={busy} onClick={handleSave} className="btn-primary flex-1 text-sm">
            {requiresApproval ? (
              <>
                <RefreshCw size={14} /> Предложить перенос
              </>
            ) : (
              <>
                <Check size={14} /> Сохранить
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
