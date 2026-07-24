"use client";

import { useState } from "react";
import { X, Copy } from "lucide-react";

interface CopyDayModalProps {
  sourceDate: string;
  onCancel: () => void;
  onCopy: (targetDate: string) => Promise<void>;
}

export default function CopyDayModal({ sourceDate, onCancel, onCopy }: CopyDayModalProps) {
  const [targetDate, setTargetDate] = useState(sourceDate);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopy = async () => {
    if (!targetDate) return;
    if (targetDate === sourceDate) {
      setError("Выберите другую дату");
      return;
    }
    setError(null);
    setBusy(true);
    try {
      await onCopy(targetDate);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30 p-0 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-sm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Скопировать тренировки</h3>
          <button onClick={onCancel} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        <p className="text-sm text-gray-500">
          Все тренировки за {sourceDate} будут скопированы на выбранную дату.
        </p>

        <label className="block text-sm text-gray-500">
          Куда скопировать
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className="w-full mt-1 rounded-xl border border-gray-300 px-3 py-2"
          />
        </label>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button disabled={busy} onClick={handleCopy} className="btn-primary w-full text-sm py-2.5">
          <Copy size={14} /> Скопировать
        </button>
      </div>
    </div>
  );
}
