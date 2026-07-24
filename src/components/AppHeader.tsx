"use client";

import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/context/current-user";

export default function AppHeader() {
  const { role, reset, loading } = useCurrentUser();
  const router = useRouter();

  if (loading || !role) return null;

  const handleSwitch = async () => {
    if (role === "TRAINER") {
      await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    }
    reset();
    router.push("/");
  };

  return (
    <button
      onClick={handleSwitch}
      title="Выйти и сменить профиль"
      className="fixed top-3 right-3 z-30 text-xs font-medium bg-white/80 backdrop-blur text-gray-700 px-3 py-1.5 rounded-full shadow-sm hover:bg-white transition-colors flex items-center gap-1"
    >
      <span>{role === "TRAINER" ? "Тренер" : "Ученик"}</span>
      <span className="text-gray-400">·</span>
      <span>Выйти</span>
    </button>
  );
}
