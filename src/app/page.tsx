"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Dumbbell, UserCog, User, ChevronRight, ArrowLeft, UserPlus } from "lucide-react";
import { useCurrentUser } from "@/context/current-user";
import type { UserDTO } from "@/lib/types";

export default function Home() {
  const { role, loading, chooseStudent } = useCurrentUser();
  const router = useRouter();

  const [mode, setMode] = useState<"choose" | "student-code" | "student-create">("choose");
  const [code, setCode] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!loading && role === "TRAINER") router.replace("/trainer");
    if (!loading && role === "STUDENT") router.replace("/student");
  }, [loading, role, router]);

  if (loading || role) return null;

  const handleFindByCode = async () => {
    if (!code.trim()) return;
    setBusy(true);
    setCodeError(null);
    const res = await fetch(`/api/students/by-code/${code.trim().toUpperCase()}`);
    setBusy(false);
    if (!res.ok) {
      setCodeError("Код не найден. Проверьте и попробуйте снова.");
      return;
    }
    const student: UserDTO = await res.json();
    chooseStudent(student.id, student.trainerId);
    router.push("/student");
  };

  const handleCreateSelf = async () => {
    if (!name.trim()) return;
    setBusy(true);
    setCreateError(null);
    const res = await fetch("/api/students/self", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim() }),
    });
    setBusy(false);
    if (!res.ok) {
      setCreateError("Не удалось создать аккаунт. Попробуйте ещё раз.");
      return;
    }
    const student: UserDTO = await res.json();
    chooseStudent(student.id, null);
    router.push("/student");
  };

  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-1 pt-10 pb-10">
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}
      >
        <Dumbbell size={30} strokeWidth={1.75} />
      </div>
      <div className="text-center space-y-1 mb-8">
        <h1 className="text-2xl font-bold">Тренировки</h1>
        <p className="text-gray-400 text-sm">Кто вы сегодня?</p>
      </div>

      {mode === "choose" && (
        <div className="flex flex-col gap-3 w-full max-w-sm">
          <button
            onClick={() => router.push("/login")}
            className="card p-5 flex items-center gap-4 text-left"
          >
            <span className="icon-badge w-12 h-12" style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}>
              <UserCog size={22} strokeWidth={1.75} />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-base">Я тренер</span>
              <span className="block text-sm text-gray-400">Управлять учениками</span>
            </span>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
          <button
            onClick={() => setMode("student-code")}
            className="card p-5 flex items-center gap-4 text-left"
          >
            <span className="icon-badge w-12 h-12" style={{ backgroundColor: "#05966922", color: "#059669" }}>
              <User size={22} strokeWidth={1.75} />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-base">Я ученик</span>
              <span className="block text-sm text-gray-400">Войти по коду от тренера</span>
            </span>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
          <button
            onClick={() => setMode("student-create")}
            className="card p-5 flex items-center gap-4 text-left"
          >
            <span className="icon-badge w-12 h-12" style={{ backgroundColor: "#eef4ee", color: "#14151a" }}>
              <UserPlus size={22} strokeWidth={1.75} />
            </span>
            <span className="flex-1">
              <span className="block font-semibold text-base">Занимаюсь самостоятельно</span>
              <span className="block text-sm text-gray-400">Без тренера, свой аккаунт</span>
            </span>
            <ChevronRight size={20} className="text-gray-300" />
          </button>
        </div>
      )}

      {mode === "student-code" && (
        <div className="w-full max-w-sm space-y-3">
          <button onClick={() => setMode("choose")} className="flex items-center gap-1 text-sm text-gray-400 font-medium">
            <ArrowLeft size={15} /> назад
          </button>
          <div className="card p-5 space-y-3">
            <p className="text-sm text-gray-500">
              Введите код, который вам дал тренер:
            </p>
            <input
              value={code}
              onChange={(e) => {
                setCode(e.target.value.toUpperCase());
                setCodeError(null);
              }}
              placeholder="Например: 7K3XQ9"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3 tracking-widest text-center font-semibold uppercase"
              maxLength={8}
            />
            {codeError && <p className="text-sm text-red-500">{codeError}</p>}
            <button
              disabled={!code.trim() || busy}
              onClick={handleFindByCode}
              className="btn-primary w-full"
            >
              Войти
            </button>
            <p className="text-xs text-gray-400 text-center">
              Кода нет? Попросите тренера добавить вас в приложении.
            </p>
          </div>
        </div>
      )}

      {mode === "student-create" && (
        <div className="w-full max-w-sm space-y-3">
          <button onClick={() => setMode("choose")} className="flex items-center gap-1 text-sm text-gray-400 font-medium">
            <ArrowLeft size={15} /> назад
          </button>
          <div className="card p-5 space-y-3">
            <p className="text-sm text-gray-500">
              Создайте личный кабинет, чтобы вести тренировки и программы самостоятельно, без тренера.
            </p>
            <input
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setCreateError(null);
              }}
              placeholder="Ваше имя"
              className="w-full rounded-2xl border border-gray-200 px-4 py-3"
            />
            {createError && <p className="text-sm text-red-500">{createError}</p>}
            <button
              disabled={!name.trim() || busy}
              onClick={handleCreateSelf}
              className="btn-primary w-full"
            >
              Создать аккаунт
            </button>
            <p className="text-xs text-gray-400 text-center">
              После создания в профиле появится личный код - сохраните его, чтобы войти снова с этого или другого устройства.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
