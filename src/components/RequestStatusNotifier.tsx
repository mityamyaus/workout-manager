"use client";

import { useEffect, useRef } from "react";
import { notify } from "@/lib/notifications";
import { fetchJson } from "@/lib/fetchJson";
import type { SessionChangeRequestDTO } from "@/lib/types";

const CHECK_INTERVAL_MS = 20_000;
const SEEN_KEY = "train-manager:seen-resolved-requests";

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

// Уведомляет ученика, когда тренер одобрил или отклонил заявку на перенос.
export default function RequestStatusNotifier({ studentId }: { studentId: string }) {
  const seenRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    seenRef.current = loadSeen();

    const check = async () => {
      const requests = await fetchJson<
        (SessionChangeRequestDTO & { session: { date: string; startTime: string; title: string | null } })[]
      >(`/api/session-requests?studentId=${studentId}`);
      if (!requests) return;

      for (const r of requests) {
        if (r.status === "PENDING") continue;
        if (seenRef.current.has(r.id)) continue;

        notify(r.status === "APPROVED" ? "Перенос подтверждён ✅" : "Перенос отклонён ❌", {
          body:
            r.status === "APPROVED"
              ? `Тренер подтвердил перенос на ${r.requestedDate} ${r.requestedStartTime}`
              : `Тренер отклонил предложенный перенос на ${r.requestedDate} ${r.requestedStartTime}`,
          tag: `request-${r.id}`,
        });
        seenRef.current.add(r.id);
        saveSeen(seenRef.current);
      }
    };

    check();
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [studentId]);

  return null;
}
