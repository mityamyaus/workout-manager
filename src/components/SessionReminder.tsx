"use client";

import { useEffect, useRef } from "react";
import { format } from "date-fns";
import { notify, notificationPermission } from "@/lib/notifications";
import { fetchJson } from "@/lib/fetchJson";
import type { TrainingSessionDTO } from "@/lib/types";

const REMIND_BEFORE_MIN = 15;
const CHECK_INTERVAL_MS = 30_000;
const NOTIFIED_KEY = "train-manager:notified-sessions";

function loadNotified(): Set<string> {
  try {
    const raw = localStorage.getItem(NOTIFIED_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveNotified(set: Set<string>) {
  localStorage.setItem(NOTIFIED_KEY, JSON.stringify([...set]));
}

// Напоминает о ближайшей тренировке, пока вкладка/приложение открыты.
// Это не настоящий пуш в закрытое приложение - для него нужен отдельный push-сервер.
export default function SessionReminder({ studentId }: { studentId: string }) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    notifiedRef.current = loadNotified();

    const check = async () => {
      if (notificationPermission() !== "granted") return;

      const month = format(new Date(), "yyyy-MM");
      const sessions = await fetchJson<TrainingSessionDTO[]>(
        `/api/sessions?studentId=${studentId}&month=${month}`
      );
      if (!sessions) return;

      const now = new Date();
      const today = format(now, "yyyy-MM-dd");

      for (const s of sessions) {
        if (s.date !== today) continue;
        if (notifiedRef.current.has(s.id)) continue;

        const [h, m] = s.startTime.split(":").map(Number);
        const start = new Date(now);
        start.setHours(h, m, 0, 0);
        const diffMin = (start.getTime() - now.getTime()) / 60000;

        if (diffMin > 0 && diffMin <= REMIND_BEFORE_MIN) {
          notify("Скоро тренировка 🏋️", {
            body: `${s.title || "Тренировка"} в ${s.startTime}`,
            tag: `session-${s.id}`,
          });
          notifiedRef.current.add(s.id);
          saveNotified(notifiedRef.current);
        }
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [studentId]);

  return null;
}
