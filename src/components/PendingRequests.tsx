"use client";

import { RefreshCw, X, Check } from "lucide-react";
import type { SessionChangeRequestDTO } from "@/lib/types";

interface PendingRequestWithSession extends SessionChangeRequestDTO {
  session: { date: string; startTime: string; endTime: string; title: string | null };
}

export default function PendingRequests({
  requests,
  onResolved,
}: {
  requests: PendingRequestWithSession[];
  onResolved: () => void;
}) {
  if (requests.length === 0) return null;

  const resolve = async (id: string, action: "approve" | "reject") => {
    await fetch(`/api/session-requests/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    onResolved();
  };

  return (
    <div className="space-y-2">
      <p className="flex items-center gap-1.5 text-sm font-semibold px-1">
        <RefreshCw size={14} /> Заявки на перенос
      </p>
      {requests.map((r) => (
        <div key={r.id} className="card p-5 space-y-2">
          <p className="text-sm">
            Было: <span className="text-gray-500">{r.session.date} {r.session.startTime}–{r.session.endTime}</span>
          </p>
          <p className="text-sm">
            Предложено:{" "}
            <span className="font-medium">
              {r.requestedDate} {r.requestedStartTime}–{r.requestedEndTime}
            </span>
          </p>
          <div className="flex gap-2 pt-1">
            <button onClick={() => resolve(r.id, "reject")} className="btn-danger flex-1 text-sm py-2.5">
              <X size={14} /> Отклонить
            </button>
            <button onClick={() => resolve(r.id, "approve")} className="btn-primary flex-1 text-sm py-2.5">
              <Check size={14} /> Одобрить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
