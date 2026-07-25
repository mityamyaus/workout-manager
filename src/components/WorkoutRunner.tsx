"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { format } from "date-fns";
import { X, Check, PartyPopper, Minus, Plus } from "lucide-react";
import { getCategoryIcon } from "@/lib/category-icons";
import { notify, vibrate } from "@/lib/notifications";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import { markAdhocCompleted } from "@/lib/adhocCompletion";
import type { ProgramDTO } from "@/lib/types";

interface WorkoutRunnerProps {
  program: ProgramDTO;
  studentId: string;
  sessionId?: string | null;
  onClose: () => void;
  onLogged?: () => void;
}

const REST_OPTIONS = [15, 30, 45, 60, 90, 120, 180];

type FlatSet = {
  exerciseIndex: number;
  setIndex: number;
  exerciseId: string;
  exerciseName: string;
  category: string;
  targetWeight: number;
  targetReps: number;
  restSeconds: number;
  isLastOverall: boolean;
};

export default function WorkoutRunner({ program, studentId, sessionId, onClose, onLogged }: WorkoutRunnerProps) {
  const flatSets = useMemo<FlatSet[]>(() => {
    const flat: FlatSet[] = [];
    program.exercises.forEach((pe, exerciseIndex) => {
      pe.sets.forEach((s, setIndex) => {
        flat.push({
          exerciseIndex,
          setIndex,
          exerciseId: pe.exerciseId,
          exerciseName: pe.exercise.name,
          category: pe.exercise.category,
          targetWeight: s.weight,
          targetReps: s.reps,
          restSeconds: pe.restSeconds,
          isLastOverall: false,
        });
      });
    });
    if (flat.length > 0) flat[flat.length - 1].isLastOverall = true;
    return flat;
  }, [program]);

  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<"set" | "rest" | "done">(flatSets.length ? "set" : "done");
  const [restDuration, setRestDuration] = useState(flatSets[0]?.restSeconds ?? 90);
  const [remaining, setRemaining] = useState(0);
  const endsAtRef = useRef<number | null>(null);

  const set = flatSets[current];

  useLockBodyScroll();

  useEffect(() => {
    if (phase !== "done" || sessionId) return;
    // ad-hoc запуск (не из календаря) - нет TrainingSession, чтобы посчитать
    // завершённость на сервере, поэтому отмечаем локально для этого дня
    markAdhocCompleted(studentId, program.id, format(new Date(), "yyyy-MM-dd"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(() => {
    if (phase !== "rest") return;
    const tick = () => {
      if (!endsAtRef.current) return;
      const left = Math.max(0, Math.round((endsAtRef.current - Date.now()) / 1000));
      setRemaining(left);
      if (left <= 0) {
        vibrate([200, 100, 200]);
        notify("Отдых закончен! 💪", { body: "Пора продолжать тренировку", tag: "rest-done" });
        goToNextSet();
      }
    };
    tick();
    const interval = setInterval(tick, 250);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  const logSet = async () => {
    await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        studentId,
        exerciseId: set.exerciseId,
        sessionId: sessionId ?? null,
        date: format(new Date(), "yyyy-MM-dd"),
        weight: set.targetWeight,
        reps: set.targetReps,
        sets: 1,
      }),
    });
    onLogged?.();
  };

  const goToNextSet = () => {
    const next = current + 1;
    if (next >= flatSets.length) {
      setPhase("done");
      notify("Тренировка завершена! 🎉", { body: "Отличная работа сегодня", tag: "workout-done" });
      return;
    }
    setCurrent(next);
    setRestDuration(flatSets[next].restSeconds);
    setPhase("set");
  };

  const handleFinishSet = async () => {
    await logSet();
    if (set.isLastOverall) {
      setPhase("done");
      notify("Тренировка завершена! 🎉", { body: "Отличная работа сегодня", tag: "workout-done" });
      return;
    }
    endsAtRef.current = Date.now() + restDuration * 1000;
    setRemaining(restDuration);
    setPhase("rest");
  };

  const adjustRest = (deltaSec: number) => {
    if (!endsAtRef.current) return;
    endsAtRef.current += deltaSec * 1000;
    setRemaining((r) => Math.max(0, r + deltaSec));
  };

  const skipRest = () => {
    goToNextSet();
  };

  if (flatSets.length === 0 || phase === "done") {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
        <div className="bg-white rounded-3xl w-full max-w-sm p-6 text-center space-y-4">
          <span className="icon-badge w-16 h-16 mx-auto" style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}>
            <PartyPopper size={30} strokeWidth={1.75} />
          </span>
          <p className="text-lg font-semibold">Тренировка завершена!</p>
          <p className="text-sm text-gray-500">Результаты сохранены в прогрессе.</p>
          <button onClick={onClose} className="btn-primary w-full">
            Готово
          </button>
        </div>
      </div>
    );
  }

  const totalSets = flatSets.length;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-40 p-4">
      <div className="bg-white rounded-3xl w-full max-w-sm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            Сет {current + 1} из {totalSets}
          </span>
          <button onClick={onClose} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        {phase === "set" && (
          <div className="space-y-4 text-center">
            {(() => {
              const Icon = getCategoryIcon(set.category);
              return (
                <span
                  className="icon-badge w-14 h-14 mx-auto"
                  style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}
                >
                  <Icon size={26} strokeWidth={1.75} />
                </span>
              );
            })()}
            <p className="text-lg font-semibold">{set.exerciseName}</p>
            <p className="text-sm text-gray-400">Задание от тренера — вес и повторения фиксированы</p>

            <div className="flex gap-3 justify-center">
              <div className="text-xs text-gray-500">
                Вес, кг
                <p className="w-20 mt-1 rounded-xl border border-gray-200 px-2 py-2 text-center text-lg font-semibold text-gray-900">
                  {set.targetWeight || "б/в"}
                </p>
              </div>
              <div className="text-xs text-gray-500">
                Повторения
                <p className="w-20 mt-1 rounded-xl border border-gray-200 px-2 py-2 text-center text-lg font-semibold text-gray-900">
                  {set.targetReps}
                </p>
              </div>
            </div>

            <button onClick={handleFinishSet} className="btn-primary w-full text-lg">
              <Check size={20} /> Готово
            </button>
          </div>
        )}

        {phase === "rest" && (
          <div className="space-y-4 text-center">
            <p className="text-sm text-gray-400">Отдых перед следующим сетом</p>
            <p className="text-5xl font-bold tabular-nums">
              {Math.floor(remaining / 60)}:{String(remaining % 60).padStart(2, "0")}
            </p>
            <div className="flex justify-center gap-2">
              <button
                onClick={() => adjustRest(-15)}
                className="flex items-center justify-center gap-0.5 rounded-full border border-gray-200 h-10 px-3 text-gray-500 text-xs font-medium"
              >
                <Minus size={13} /> 15
              </button>
              <button
                onClick={() => adjustRest(15)}
                className="flex items-center justify-center gap-0.5 rounded-full border border-gray-200 h-10 px-3 text-gray-500 text-xs font-medium"
              >
                <Plus size={13} /> 15
              </button>
            </div>
            <select
              value={restDuration}
              onChange={(e) => {
                const val = Number(e.target.value);
                setRestDuration(val);
                endsAtRef.current = Date.now() + val * 1000;
                setRemaining(val);
              }}
              className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
            >
              {REST_OPTIONS.map((sec) => (
                <option key={sec} value={sec}>
                  Отдых {sec < 60 ? `${sec} сек` : `${sec / 60} мин`}
                </option>
              ))}
            </select>
            <button onClick={skipRest} className="btn-secondary w-full">
              Пропустить отдых
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
