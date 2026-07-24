"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/lib/notifications";
import { fetchJson } from "@/lib/fetchJson";
import type { SessionChangeRequestDTO } from "@/lib/types";

const CHECK_INTERVAL_MS = 20_000;
const SEEN_KEY = "train-manager:seen-pending-requests";

function loadSeen(): Set<string> {
  try {
    const raw = localStorage.getItem(SEEN_KEY);
    return new Set(raw ? JSON.parse(raw) : []);
  } catch {
    return new Set();
  }
}

function saveSeen(set: Set<string>) {
  localStorage.setItem(SEEN_KEY, JSON.stringify([...set]));
}

// Уведомляет тренера о новых заявках учеников на перенос тренировки.
export default function TrainerRequestNotifier({ trainerId }: { trainerId: string }) {
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenRef.current = loadSeen();

    const check = async () => {
      const requests = await fetchJson<
        (SessionChangeRequestDTO & { session: { studentId: string; student: { name: string } } })[]
      >(`/api/session-requests?trainerId=${trainerId}&status=PENDING`);
      if (!requests) return;

      for (const r of requests) {
        if (seenRef.current.has(r.id)) continue;

        notify("Заявка на перенос 🔁", {
          body: `${r.session.student.name} предлагает перенести тренировку на ${r.requestedDate} ${r.requestedStartTime}`,
          tag: `pending-${r.id}`,
        });
        seenRef.current.add(r.id);
        saveSeen(seenRef.current);
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [trainerId]);

  return null;
}
