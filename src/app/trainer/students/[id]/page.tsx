"use client";

import { useEffect, useState, use as usePromise } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useCurrentUser } from "@/context/current-user";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Calendar as CalendarIcon,
  LayoutGrid,
  BarChart3,
  User,
  Dumbbell,
  CalendarDays,
  Clock3,
  Copy,
} from "lucide-react";
import HeroHeader from "@/components/HeroHeader";
import BottomNav from "@/components/BottomNav";
import Calendar from "@/components/Calendar";
import SessionForm from "@/components/SessionForm";
import ProgramBuilder from "@/components/ProgramBuilder";
import ProgramCard from "@/components/ProgramCard";
import ProgressSection from "@/components/ProgressSection";
import PendingRequests from "@/components/PendingRequests";
import InviteCodeBadge from "@/components/InviteCodeBadge";
import SessionDetailCard from "@/components/SessionDetailCard";
import QuickAddSheet from "@/components/QuickAddSheet";
import CopyDayModal from "@/components/CopyDayModal";
import { useTrainerGuard } from "@/lib/useTrainerGuard";
import { fetchJson } from "@/lib/fetchJson";
import type { ProgramDTO, SessionChangeRequestDTO, TrainingSessionDTO, UserDTO } from "@/lib/types";

type PendingRequestWithSession = SessionChangeRequestDTO & {
  session: { date: string; startTime: string; endTime: string; title: string | null; student: { name: string } };
};

type Tab = "calendar" | "programs" | "progress" | "profile";

export default function StudentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: studentId } = usePromise(params);
  const { role, trainerId, loading } = useCurrentUser();
  const router = useRouter();

  const [student, setStudent] = useState<UserDTO | null>(null);
  const [tab, setTab] = useState<Tab>("calendar");
  const [month, setMonth] = useState(new Date());
  const [sessions, setSessions] = useState<TrainingSessionDTO[]>([]);
  const [programs, setPrograms] = useState<ProgramDTO[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<TrainingSessionDTO | null | "new">(null);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [editingProgram, setEditingProgram] = useState<ProgramDTO | null>(null);
  const [nameInput, setNameInput] = useState("");
  const [weightInput, setWeightInput] = useState("");
  const [deleting, setDeleting] = useState(false);
  const [requests, setRequests] = useState<PendingRequestWithSession[]>([]);
  const [viewingSession, setViewingSession] = useState<TrainingSessionDTO | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [copyingDay, setCopyingDay] = useState(false);

  useEffect(() => {
    if (!loading && role !== "TRAINER") router.replace("/");
  }, [loading, role, router]);

  useTrainerGuard();

  useEffect(() => {
    fetchJson<UserDTO>(`/api/students/${studentId}`).then((s) => {
      if (!s) return;
      setStudent(s);
      setNameInput(s.name);
      setWeightInput(s.weight != null ? String(s.weight) : "");
    });
  }, [studentId]);

  const loadSessions = async () => {
    const data = await fetchJson<TrainingSessionDTO[]>(
      `/api/sessions?studentId=${studentId}&month=${format(month, "yyyy-MM")}`
    );
    if (data) setSessions(data);
  };

  const loadPrograms = async () => {
    const data = await fetchJson<ProgramDTO[]>(`/api/programs?studentId=${studentId}`);
    if (data) setPrograms(data);
  };

  const loadRequests = async () => {
    const data = await fetchJson<PendingRequestWithSession[]>(
      `/api/session-requests?studentId=${studentId}&status=PENDING`
    );
    if (data) setRequests(data);
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, month]);
  useEffect(() => {
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);
  useEffect(() => {
    loadRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  if (loading || role !== "TRAINER" || !student || !trainerId) return null;

  const daySessions = sessions.filter((s) => s.date === selectedDate);

  const handleSaveSession = async (data: {
    date: string;
    startTime: string;
    endTime: string;
    title: string;
    programId: string | null;
    notes: string;
    reminderMinutesBefore: number;
  }) => {
    if (editingSession && editingSession !== "new") {
      await fetch(`/api/sessions/${editingSession.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
    } else {
      await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, studentId, trainerId, createdBy: "TRAINER" }),
      });
    }
    setEditingSession(null);
    loadSessions();
  };

  const deleteSession = async (id: string) => {
    await fetch(`/api/sessions/${id}`, { method: "DELETE" });
    loadSessions();
  };

  const handleDeleteSession = async () => {
    if (editingSession && editingSession !== "new") {
      await deleteSession(editingSession.id);
      setEditingSession(null);
    }
  };

  const handleCopyDay = async (targetDate: string) => {
    if (!selectedDate) return;
    await fetch("/api/sessions/copy", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ studentId, sourceDate: selectedDate, targetDate }),
    });
    setCopyingDay(false);
    loadSessions();
  };

  const handleSaveProfile = async () => {
    if (!nameInput.trim()) return;
    const res = await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.trim(),
        weight: weightInput ? Number(weightInput) : null,
      }),
    });
    if (res.ok) {
      setStudent(await res.json());
    }
  };

  const handleDeleteStudent = async () => {
    if (!confirm(`Удалить ${student.name} и все его тренировки/программы? Это действие необратимо.`)) {
      return;
    }
    setDeleting(true);
    await fetch(`/api/students/${studentId}`, { method: "DELETE" });
    router.push("/trainer");
  };

  return (
    <div className="space-y-4 pb-4">
      <button onClick={() => router.push("/trainer")} className="flex items-center gap-1 text-sm text-gray-500">
        <ArrowLeft size={15} /> Все ученики
      </button>

      <HeroHeader
        title={student.name}
        subtitle="Ученик"
        icon={Dumbbell}
        badge={student.weight ? `${student.weight} кг` : "вес не указан"}
        selectedDate={selectedDate ? parseISO(selectedDate) : month}
        onSelectDate={(d) => {
          setSelectedDate(format(d, "yyyy-MM-dd"));
          setMonth(d);
          setTab("calendar");
        }}
      />

      {tab !== "profile" && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-400">Код ученика</span>
          <InviteCodeBadge code={student.inviteCode ?? ""} studentName={student.name} size="sm" />
        </div>
      )}

      {tab === "calendar" && (
        <div className="space-y-3">
          <PendingRequests
            requests={requests}
            onResolved={() => {
              loadRequests();
              loadSessions();
            }}
          />
          <Calendar
            month={month}
            onMonthChange={setMonth}
            sessions={sessions}
            selectedDate={selectedDate}
            onDayClick={(d) => setSelectedDate(d === selectedDate ? null : d)}
          />

          {selectedDate && (
            <div className="space-y-2.5">
              {daySessions.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setViewingSession(s)}
                  className="w-full flex items-center gap-4 card p-5 text-left"
                >
                  <span className="icon-badge w-14 h-14">
                    {s.program ? <Dumbbell size={24} strokeWidth={1.75} /> : <CalendarIcon size={24} strokeWidth={1.75} />}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-lg font-bold">
                      {s.startTime}–{s.endTime}
                    </p>
                    <p className="text-sm text-gray-400 truncate">
                      {s.title || s.program?.name || "Тренировка"}
                    </p>
                    {s.changeRequest?.status === "PENDING" && (
                      <p className="flex items-center gap-1 text-xs text-amber-600 mt-1">
                        <Clock3 size={12} /> Заявка на перенос: {s.changeRequest.requestedDate} {s.changeRequest.requestedStartTime}
                      </p>
                    )}
                  </div>
                  <ChevronRight size={20} className="text-gray-300" />
                </button>
              ))}
              <button
                onClick={() => setEditingSession("new")}
                className="w-full flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 py-3.5 text-gray-500 font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors"
              >
                <Plus size={16} /> Тренировка на {selectedDate}
              </button>
              {daySessions.length > 0 && (
                <button
                  onClick={() => setCopyingDay(true)}
                  className="w-full flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 py-3.5 text-gray-500 font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors"
                >
                  <Copy size={16} /> Скопировать этот день
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {tab === "programs" && (
        <div className="space-y-3">
          {programs.map((p) => (
            <ProgramCard
              key={p.id}
              program={p}
              onEdit={() => setEditingProgram(p)}
              onDelete={async () => {
                await fetch(`/api/programs/${p.id}`, { method: "DELETE" });
                loadPrograms();
              }}
            />
          ))}
          {programs.length === 0 && (
            <p className="text-sm text-gray-400">Программ пока нет.</p>
          )}
          <button
            onClick={() => setShowProgramBuilder(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 py-3.5 text-gray-500 font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            <Plus size={16} /> Составить программу
          </button>
        </div>
      )}

      {tab === "progress" && <ProgressSection studentId={studentId} />}

      {tab === "profile" && (
        <div className="card p-5 space-y-3">
          <label className="block text-xs text-gray-500">
            Имя
            <input
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              className="w-full mt-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm"
            />
          </label>
          <label className="block text-xs text-gray-500">
            Вес, кг
            <input
              type="number"
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              className="w-full mt-1 rounded-2xl border border-gray-200 px-4 py-2.5 text-sm"
            />
          </label>
          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-gray-400">Код для входа</span>
            <InviteCodeBadge code={student.inviteCode ?? ""} studentName={student.name} size="sm" />
          </div>
          <button onClick={handleSaveProfile} className="btn-primary w-full text-sm py-2.5">
            Сохранить
          </button>
          <button
            disabled={deleting}
            onClick={handleDeleteStudent}
            className="btn-danger w-full text-sm py-2.5"
          >
            Удалить ученика
          </button>
        </div>
      )}

      <BottomNav
        items={[
          { key: "calendar", label: "Календарь", icon: CalendarDays },
          { key: "programs", label: "Программы", icon: LayoutGrid },
          { key: "progress", label: "Статистика", icon: BarChart3 },
          { key: "profile", label: "Профиль", icon: User },
        ]}
        active={tab}
        onChange={setTab}
        onCenterAction={() => setQuickAddOpen(true)}
      />

      {editingSession && (
        <SessionForm
          date={editingSession === "new" ? selectedDate! : editingSession.date}
          programs={programs}
          initial={editingSession === "new" ? null : editingSession}
          onCancel={() => setEditingSession(null)}
          onSave={handleSaveSession}
          onDelete={editingSession !== "new" ? handleDeleteSession : undefined}
        />
      )}

      {showProgramBuilder && (
        <ProgramBuilder
          studentId={studentId}
          authorId={trainerId}
          onCancel={() => setShowProgramBuilder(false)}
          onSaved={() => {
            setShowProgramBuilder(false);
            loadPrograms();
          }}
        />
      )}

      {editingProgram && (
        <ProgramBuilder
          studentId={studentId}
          authorId={editingProgram.authorId}
          existingProgram={editingProgram}
          onCancel={() => setEditingProgram(null)}
          onSaved={() => {
            setEditingProgram(null);
            loadPrograms();
          }}
        />
      )}

      {viewingSession && (
        <SessionDetailCard
          session={viewingSession}
          studentId={studentId}
          onEdit={() => {
            setEditingSession(viewingSession);
            setViewingSession(null);
          }}
          onDelete={async () => {
            await deleteSession(viewingSession.id);
            setViewingSession(null);
          }}
          onClose={() => setViewingSession(null)}
        />
      )}

      {quickAddOpen && (
        <QuickAddSheet
          onClose={() => setQuickAddOpen(false)}
          onAddSession={() => {
            setQuickAddOpen(false);
            setTab("calendar");
            if (!selectedDate) setSelectedDate(format(new Date(), "yyyy-MM-dd"));
            setEditingSession("new");
          }}
          onAddProgram={() => {
            setQuickAddOpen(false);
            setShowProgramBuilder(true);
          }}
        />
      )}

      {copyingDay && selectedDate && (
        <CopyDayModal
          sourceDate={selectedDate}
          onCancel={() => setCopyingDay(false)}
          onCopy={handleCopyDay}
        />
      )}
    </div>
  );
}
