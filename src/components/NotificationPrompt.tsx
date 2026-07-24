"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  notificationPermission,
  requestNotificationPermission,
} from "@/lib/notifications";

export default function NotificationPrompt() {
  const [permission, setPermission] = useState<NotificationPermission | "unsupported">("default");

  useEffect(() => {
    setPermission(notificationPermission());
  }, []);

  if (permission !== "default") return null;

  return (
    <button
      onClick={async () => {
        const result = await requestNotificationPermission();
        setPermission(result);
      }}
      className="w-full card px-4 py-3 flex items-center gap-3 text-left hover:bg-gray-50 transition-colors"
    >
      <span className="icon-badge w-9 h-9" style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}>
        <Bell size={17} strokeWidth={1.75} />
      </span>
      <div className="flex-1">
        <p className="text-sm font-medium">Включить уведомления</p>
        <p className="text-xs text-gray-400">О тренировках и окончании отдыха</p>
      </div>
    </button>
  );
}
