"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/context/current-user";
import { UserCog, Users, Scale, Dumbbell, ChevronRight, Plus, User, LogOut } from "lucide-react";
import HeroHeader from "@/components/HeroHeader";
import StatCard from "@/components/StatCard";
import PendingRequests from "@/components/PendingRequests";
import TrainerRequestNotifier from "@/components/TrainerRequestNotifier";
import TrainerSessionReminder from "@/components/TrainerSessionReminder";
import NotificationPrompt from "@/components/NotificationPrompt";
import InviteCodeBadge from "@/components/InviteCodeBadge";
import { useTrainerGuard } from "@/lib/useTrainerGuard";
import { fetchJson } from "@/lib/fetchJson";
import type { SessionChangeRequestDTO, UserDTO } from "@/lib/types";

type PendingRequestWithSession = SessionChangeRequestDTO & {
  session: { date: string; startTime: string; endTime: string; title: string | null; student: { name: string } };
};

type Tab = "students" | "profile";

export default function TrainerHome() {
  const { role, trainerId, loading, reset } = useCurrentUser();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("students");
  const [students, setStudents] = useState<UserDTO[]>([]);
  const [requests, setRequests] = useState<PendingRequestWithSession[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [busy, setBusy] = useState(false);
  const [profile, setProfile] = useState<{ name: string; email: string | null } | null>(null);

  useEffect(() => {
    if (!loading && role !== "TRAINER") router.replace("/");
  }, [loading, role, router]);

  useTrainerGuard();

  const loadStudents = async () => {
    const data = await fetchJson<UserDTO[]>("/api/students");
    if (data) setStudents(data);
  };

  const loadRequests = async () => {
    if (!trainerId) return;
    const data = await fetchJson<PendingRequestWithSession[]>(
      `/api/session-requests?trainerId=${trainerId}&status=PENDING`
    );
    if (data) setRequests(data);
  };

  useEffect(() => {
    loadStudents();
  }, []);

  useEffect(() => {
    fetchJson<{ name: string; email: string | null }>("/api/auth/me").then((data) => {
      if (data) setProfile(data);
    });
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    reset();
    router.push("/");
  };

  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trainerId]);

  const handleCreate = async () => {
    if (!name.trim()) return;
    setBusy(true);
    await fetch("/api/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: name.trim(), weight: weight ? Number(weight) : null }),
    });
    setBusy(false);
    setName("");
    setWeight("");
    setShowNew(false);
    loadStudents();
  };

  if (loading || role !== "TRAINER" || !trainerId) return null;

  const withWeight = students.filter((s) => s.weight);
  const avgWeight = withWeight.length
    ? Math.round(withWeight.reduce((sum, s) => sum + (s.weight ?? 0), 0) / withWeight.length)
    : 0;

  return (
    <div className="space-y-3 pb-4">
      <TrainerRequestNotifier trainerId={trainerId} />
      <TrainerSessionReminder trainerId={trainerId} />
      <HeroHeader title="Тренер" subtitle="Панель управления" icon={UserCog} badge={`${students.length} учеников`} />

      <div className="flex gap-1.5">
        <button
          onClick={() => setTab("students")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
            tab === "students" ? "bg-[var(--accent)] text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          <Users size={15} /> Ученики
        </button>
        <button
          onClick={() => setTab("profile")}
          className={`flex-1 flex items-center justify-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors ${
            tab === "profile" ? "bg-[var(--accent)] text-white" : "bg-gray-100 text-gray-500"
          }`}
        >
          <User size={15} /> Профиль
        </button>
      </div>

      {tab === "students" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Всего учеников" value={String(students.length)} icon={Users} color="#16a34a" />
            <StatCard
              label="Средний вес"
              value={avgWeight ? String(avgWeight) : "—"}
              unit={avgWeight ? "кг" : undefined}
              icon={Scale}
              color="#059669"
            />
          </div>

          <NotificationPrompt />

          <PendingRequests requests={requests} onResolved={loadRequests} />

          <h2 className="text-lg font-bold px-1">Мои ученики</h2>

          <div className="space-y-3">
            {students.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(`/trainer/students/${s.id}`)}
                className="card flex items-center gap-4 px-5 py-4 cursor-pointer"
              >
                <span className="icon-badge w-14 h-14" style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}>
                  <Dumbbell size={24} strokeWidth={1.75} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-lg truncate">{s.name}</p>
                  <div className="text-sm text-gray-400 flex items-center gap-1.5 flex-wrap mt-0.5">
                    {s.weight ? <span>{s.weight} кг ·</span> : null}
                    <InviteCodeBadge code={s.inviteCode ?? ""} studentName={s.name} size="sm" />
                  </div>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </div>
            ))}
            {students.length === 0 && (
              <p className="text-sm text-gray-400 px-1">Пока нет учеников — добавьте первого.</p>
            )}
          </div>

          {!showNew ? (
            <button
              onClick={() => setShowNew(true)}
              className="w-full flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 py-4 text-gray-500 font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors"
            >
              <Plus size={16} /> Добавить ученика
            </button>
          ) : (
            <div className="card p-5 space-y-3">
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Имя ученика"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
              />
              <input
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Вес, кг (необязательно)"
                type="number"
                className="w-full rounded-2xl border border-gray-200 px-4 py-3"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={() => setShowNew(false)} className="btn-secondary flex-1">
                  Отмена
                </button>
                <button disabled={!name.trim() || busy} onClick={handleCreate} className="btn-primary flex-1">
                  Добавить
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {tab === "profile" && (
        <div className="space-y-3">
          <div className="card p-5 flex items-center gap-4">
            <span className="icon-badge w-14 h-14">
              <User size={24} strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-bold text-lg">{profile?.name ?? "Тренер"}</p>
              <p className="text-sm text-gray-400">{profile?.email ?? "Тренер"}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-secondary w-full text-sm py-2.5">
            <LogOut size={14} /> Выйти
          </button>
        </div>
      )}
    </div>
  );
}
