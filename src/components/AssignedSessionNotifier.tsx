"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/lib/notifications";
import { fetchJson } from "@/lib/fetchJson";
import type { TrainingSessionDTO } from "@/lib/types";

const CHECK_INTERVAL_MS = 20_000;

type Snapshot = Record<string, { date: string; startTime: string; endTime: string }>;

function snapshotKey(studentId: string) {
  return `train-manager:session-snapshot:${studentId}`;
}

function loadSnapshot(studentId: string): { initialized: boolean; sessions: Snapshot } {
  try {
    const raw = localStorage.getItem(snapshotKey(studentId));
    if (!raw) return { initialized: false, sessions: {} };
    return { initialized: true, sessions: JSON.parse(raw) };
  } catch {
    return { initialized: false, sessions: {} };
  }
}

function saveSnapshot(studentId: string, sessions: Snapshot) {
  localStorage.setItem(snapshotKey(studentId), JSON.stringify(sessions));
}

// Уведомляет ученика, когда тренер назначил, перенёс или отменил тренировку.
// Работает только пока вкладка/приложение открыты (реальный пуш в закрытое
// приложение потребовал бы отдельного push-сервера).
export default function AssignedSessionNotifier({ studentId }: { studentId: string }) {
  const prevRef = useRef<Snapshot>({});
  const initializedRef = useRef(false);

  useEffect(() => {
    const { initialized, sessions } = loadSnapshot(studentId);
    prevRef.current = sessions;
    initializedRef.current = initialized;

    const check = async () => {
      const all = await fetchJson<TrainingSessionDTO[]>(`/api/sessions?studentId=${studentId}`);
      if (!all) return;

      const trainerSessions = all.filter((s) => s.createdBy === "TRAINER");
      const nextSnapshot: Snapshot = {};
      for (const s of trainerSessions) {
        nextSnapshot[s.id] = { date: s.date, startTime: s.startTime, endTime: s.endTime };
      }

      if (!initializedRef.current) {
        // первый запуск - просто запоминаем текущее состояние, не спамим уведомлениями
        // о тренировках, назначенных до открытия приложения
        prevRef.current = nextSnapshot;
        initializedRef.current = true;
        saveSnapshot(studentId, nextSnapshot);
        return;
      }

      const prev = prevRef.current;

      for (const s of trainerSessions) {
        const before = prev[s.id];
        if (!before) {
          notify("Новая тренировка от тренера 🏋️", {
            body: `${s.title || "Тренировка"} на ${s.date} в ${s.startTime}`,
            tag: `assigned-${s.id}`,
          });
        } else if (before.date !== s.date || before.startTime !== s.startTime) {
          notify("Тренировка перенесена 🔁", {
            body: `${s.title || "Тренировка"}: было ${before.date} ${before.startTime}, стало ${s.date} ${s.startTime}`,
            tag: `moved-${s.id}`,
          });
        }
      }

      for (const id of Object.keys(prev)) {
        if (!nextSnapshot[id]) {
          const before = prev[id];
          notify("Тренировка отменена ❌", {
            body: `Тренер отменил тренировку ${before.date} ${before.startTime}`,
            tag: `cancelled-${id}`,
          });
        }
      }

      prevRef.current = nextSnapshot;
      saveSnapshot(studentId, nextSnapshot);
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [studentId]);

  return null;
}
