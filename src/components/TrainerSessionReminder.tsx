"use client";

import { useEffect, useRef } from "react";
import { notify, notificationPermission } from "@/lib/notifications";
import { fetchJson } from "@/lib/fetchJson";
import type { TrainingSessionDTO } from "@/lib/types";

const DEFAULT_REMIND_BEFORE_MIN = 15;
const CHECK_INTERVAL_MS = 30_000;
const NOTIFIED_KEY = "train-manager:notified-sessions-trainer";

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

// Напоминает тренеру о предстоящей тренировке с учеником за настроенное для
// неё время, пока вкладка/приложение открыты (аналог SessionReminder для ученика).
export default function TrainerSessionReminder({ trainerId }: { trainerId: string }) {
  const notifiedRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    notifiedRef.current = loadNotified();

    const check = async () => {
      if (notificationPermission() !== "granted") return;

      const sessions = await fetchJson<TrainingSessionDTO[]>(`/api/sessions?trainerId=${trainerId}`);
      if (!sessions) return;

      const now = new Date();

      for (const s of sessions) {
        if (notifiedRef.current.has(s.id)) continue;

        const leadMin = s.reminderMinutesBefore ?? DEFAULT_REMIND_BEFORE_MIN;
        if (leadMin <= 0) continue;

        const start = new Date(`${s.date}T${s.startTime}:00`);
        const diffMin = (start.getTime() - now.getTime()) / 60000;

        if (diffMin > 0 && diffMin <= leadMin) {
          notify("Скоро тренировка 🏋️", {
            body: `${s.title || "Тренировка"} с ${s.student?.name ?? "учеником"} в ${s.startTime}`,
            tag: `session-trainer-${s.id}`,
          });
          notifiedRef.current.add(s.id);
          saveNotified(notifiedRef.current);
        }
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [trainerId]);

  return null;
}
