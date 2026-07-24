"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/context/current-user";

// Проверяет, что серверная сессия тренера ещё жива (cookie не истёк/не был очищен).
// Если нет - сбрасывает локальный контекст и уводит на /login.
export function useTrainerGuard() {
  const { role, loading, reset } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (loading || role !== "TRAINER") return;
    fetch("/api/auth/me").then((res) => {
      if (!res.ok) {
        reset();
        router.replace("/login");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, role]);
}
