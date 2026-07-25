"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { useCurrentUser } from "@/context/current-user";
import {
  User,
  Clock3,
  LayoutGrid,
  BarChart3,
  Calendar as CalendarIcon,
  CalendarDays,
  Plus,
  ChevronRight,
  Play,
  Pencil,
  Check,
  Dumbbell,
  LogOut,
  CheckCircle2,
} from "lucide-react";
import HeroHeader from "@/components/HeroHeader";
import BottomNav from "@/components/BottomNav";
import StatCard from "@/components/StatCard";
import Calendar from "@/components/Calendar";
import SessionForm from "@/components/SessionForm";
import ProgramBuilder from "@/components/ProgramBuilder";
import ProgramCard from "@/components/ProgramCard";
import ProgressSection from "@/components/ProgressSection";
import WorkoutRunner from "@/components/WorkoutRunner";
import SessionDetailCard from "@/components/SessionDetailCard";
import QuickAddSheet from "@/components/QuickAddSheet";
import NotificationPrompt from "@/components/NotificationPrompt";
import SessionReminder from "@/components/SessionReminder";
import RequestStatusNotifier from "@/components/RequestStatusNotifier";
import AssignedSessionNotifier from "@/components/AssignedSessionNotifier";
import { fetchJson } from "@/lib/fetchJson";
import type { ProgramDTO, TrainingSessionDTO, UserDTO } from "@/lib/types";

type Tab = "calendar" | "programs" | "progress" | "profile";

export default function StudentHome() {
  const { role, studentId, trainerId, loading, reset } = useCurrentUser();
  const router = useRouter();

  const [student, setStudent] = useState<UserDTO | null>(null);
  const [tab, setTab] = useState<Tab>("calendar");
  const [month, setMonth] = useState(new Date());
  const [sessions, setSessions] = useState<TrainingSessionDTO[]>([]);
  const [programs, setPrograms] = useState<ProgramDTO[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editingSession, setEditingSession] = useState<TrainingSessionDTO | null | "new">(null);
  const [showProgramBuilder, setShowProgramBuilder] = useState(false);
  const [editingWeight, setEditingWeight] = useState(false);
  const [weightInput, setWeightInput] = useState("");
  const [runningProgram, setRunningProgram] = useState<ProgramDTO | null>(null);
  const [runningSessionId, setRunningSessionId] = useState<string | null>(null);
  const [editingProgram, setEditingProgram] = useState<ProgramDTO | null>(null);
  const [viewingSession, setViewingSession] = useState<TrainingSessionDTO | null>(null);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  useEffect(() => {
    if (!loading && (role !== "STUDENT" || !studentId)) router.replace("/");
  }, [loading, role, studentId, router]);

  useEffect(() => {
    if (!studentId) return;
    fetchJson<UserDTO>(`/api/students/${studentId}`).then((s) => {
      if (!s) return;
      setStudent(s);
      setWeightInput(s.weight != null ? String(s.weight) : "");
    });
  }, [studentId]);

  const loadSessions = async () => {
    if (!studentId) return;
    const data = await fetchJson<TrainingSessionDTO[]>(
      `/api/sessions?studentId=${studentId}&month=${format(month, "yyyy-MM")}`
    );
    if (data) setSessions(data);
  };

  const loadPrograms = async () => {
    if (!studentId) return;
    const data = await fetchJson<ProgramDTO[]>(`/api/programs?studentId=${studentId}`);
    if (data) setPrograms(data);
  };

  useEffect(() => {
    loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId, month]);
  useEffect(() => {
    loadPrograms();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [studentId]);

  if (loading || role !== "STUDENT" || !student || !studentId || !trainerId) return null;

  const daySessions = sessions.filter((s) => s.date === selectedDate);
  const today = format(new Date(), "yyyy-MM-dd");
  const nextSession = sessions
    .filter((s) => s.date >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))[0];

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
        body: JSON.stringify({ ...data, studentId, trainerId, createdBy: "STUDENT" }),
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

  const handleSaveWeight = async () => {
    const res = await fetch(`/api/students/${studentId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ weight: weightInput ? Number(weightInput) : null }),
    });
    if (res.ok) {
      setStudent(await res.json());
      setEditingWeight(false);
    }
  };

  return (
    <div className="space-y-4 pb-4">
      <SessionReminder studentId={studentId} />
      <RequestStatusNotifier studentId={studentId} />
      <AssignedSessionNotifier studentId={studentId} />
      <HeroHeader
        title={`Привет, ${student.name}!`}
        subtitle="Готов к тренировке?"
        icon={User}
        badge={student.weight ? `${student.weight} кг` : "вес не указан"}
        selectedDate={selectedDate ? parseISO(selectedDate) : month}
        onSelectDate={(d) => {
          setSelectedDate(format(d, "yyyy-MM-dd"));
          setMonth(d);
          setTab("calendar");
        }}
      />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Следующая тренировка"
          value={nextSession ? nextSession.date.slice(5) : "Нет"}
          unit={nextSession ? nextSession.startTime : "тренировок"}
          icon={Clock3}
          color="#16a34a"
        />
        <StatCard label="Активных программ" value={String(programs.length)} icon={LayoutGrid} color="#059669" />
      </div>

      {tab === "calendar" && <NotificationPrompt />}

      {tab === "calendar" && (
        <div className="space-y-3">
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
                <div key={s.id} className="card p-5">
                  <button
                    onClick={() => setViewingSession(s)}
                    className="w-full flex items-center gap-4 text-left"
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
                  {s.program && (
                    s.completed ? (
                      <div className="flex items-center justify-center gap-1.5 rounded-2xl bg-emerald-50 text-emerald-600 text-sm font-medium py-3 mt-4">
                        <CheckCircle2 size={16} /> Тренировка выполнена
                      </div>
                    ) : (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setRunningProgram(s.program);
                          setRunningSessionId(s.id);
                        }}
                        className="btn-primary w-full mt-4 text-sm"
                      >
                        <Play size={16} fill="currentColor" /> Начать тренировку
                      </button>
                    )
                  )}
                </div>
              ))}
              <button
                onClick={() => setEditingSession("new")}
                className="w-full flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 py-3.5 text-gray-500 font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors"
              >
                <Plus size={16} /> Своя тренировка на {selectedDate}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "programs" && (
        <div className="space-y-3">
          {programs.map((p) => (
            <div key={p.id} className="space-y-1.5">
              <ProgramCard
                program={p}
                onEdit={p.isIndividual ? () => setEditingProgram(p) : undefined}
                onDelete={
                  p.isIndividual
                    ? async () => {
                        await fetch(`/api/programs/${p.id}`, { method: "DELETE" });
                        loadPrograms();
                      }
                    : undefined
                }
              />
              <button
                onClick={() => {
                  setRunningProgram(p);
                  setRunningSessionId(null);
                }}
                className="btn-primary w-full text-sm"
              >
                <Play size={16} fill="currentColor" /> Начать тренировку
              </button>
            </div>
          ))}
          {programs.length === 0 && (
            <p className="text-sm text-gray-400">Программ пока нет.</p>
          )}
          <button
            onClick={() => setShowProgramBuilder(true)}
            className="w-full flex items-center justify-center gap-1.5 rounded-2xl border-2 border-dashed border-gray-300 py-3.5 text-gray-500 font-medium hover:bg-gray-100 hover:border-gray-400 transition-colors"
          >
            <Plus size={16} /> Создать индивидуальную программу
          </button>
        </div>
      )}

      {tab === "progress" && <ProgressSection studentId={studentId} />}

      {tab === "profile" && (
        <div className="space-y-3">
          <div className="card p-5 flex items-center gap-4">
            <span className="icon-badge w-14 h-14">
              <User size={24} strokeWidth={1.75} />
            </span>
            <div>
              <p className="font-bold text-lg">{student.name}</p>
              <p className="text-sm text-gray-400">Ученик</p>
            </div>
          </div>
          <div className="card p-5 space-y-3">
            <label className="block text-xs text-gray-500">
              Вес, кг
              {!editingWeight ? (
                <div className="flex items-center justify-between mt-1">
                  <span className="text-2xl font-bold text-gray-900">
                    {student.weight ? `${student.weight} кг` : "не указан"}
                  </span>
                  <button
                    onClick={() => setEditingWeight(true)}
                    className="flex items-center gap-1 text-sm text-gray-400 font-medium"
                  >
                    <Pencil size={13} /> Изменить
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-1">
                  <input
                    type="number"
                    value={weightInput}
                    onChange={(e) => setWeightInput(e.target.value)}
                    className="flex-1 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                  />
                  <button onClick={handleSaveWeight} className="btn-primary text-sm px-5">
                    <Check size={16} />
                  </button>
                </div>
              )}
            </label>
          </div>
          <button
            onClick={() => {
              reset();
              router.push("/");
            }}
            className="btn-secondary w-full text-sm py-2.5"
          >
            <LogOut size={14} /> Выйти
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
          authorId={studentId}
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
          authorId={studentId}
          existingProgram={editingProgram}
          onCancel={() => setEditingProgram(null)}
          onSaved={() => {
            setEditingProgram(null);
            loadPrograms();
          }}
        />
      )}

      {runningProgram && (
        <WorkoutRunner
          program={runningProgram}
          studentId={studentId}
          sessionId={runningSessionId}
          onClose={() => {
            setRunningProgram(null);
            setRunningSessionId(null);
            loadSessions();
          }}
        />
      )}

      {viewingSession && (
        <SessionDetailCard
          session={viewingSession}
          studentId={studentId}
          canStart
          onStart={() => {
            const program = viewingSession.program;
            const sessionId = viewingSession.id;
            setViewingSession(null);
            if (program) {
              setRunningProgram(program);
              setRunningSessionId(sessionId);
            }
          }}
          onEdit={
            viewingSession.createdBy === "STUDENT"
              ? () => {
                  setEditingSession(viewingSession);
                  setViewingSession(null);
                }
              : undefined
          }
          onDelete={
            viewingSession.createdBy === "STUDENT"
              ? async () => {
                  await deleteSession(viewingSession.id);
                  setViewingSession(null);
                }
              : undefined
          }
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
    </div>
  );
}
