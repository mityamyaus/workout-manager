"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { subDays } from "date-fns";
import { CalendarCheck, Dumbbell, TrendingUp } from "lucide-react";
import { CATEGORY_LABELS } from "@/lib/constants";
import { fetchJson } from "@/lib/fetchJson";
import StatCard from "@/components/StatCard";
import type { ExerciseDTO, ProgressEntryDTO } from "@/lib/types";

export default function ProgressSection({ studentId }: { studentId: string }) {
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [entries, setEntries] = useState<ProgressEntryDTO[]>([]);
  const [exerciseId, setExerciseId] = useState<string>("");

  useEffect(() => {
    fetchJson<ExerciseDTO[]>("/api/exercises").then((list) => {
      if (!list) return;
      setExercises(list);
      if (list.length > 0) setExerciseId(list[0].id);
    });
  }, []);

  useEffect(() => {
    fetchJson<ProgressEntryDTO[]>(`/api/progress?studentId=${studentId}`).then((list) => {
      if (list) setEntries(list);
    });
  }, [studentId]);

  const grouped = useMemo(() => {
    const byCategory = new Map<string, ExerciseDTO[]>();
    for (const ex of exercises) {
      const list = byCategory.get(ex.category) ?? [];
      list.push(ex);
      byCategory.set(ex.category, list);
    }
    return byCategory;
  }, [exercises]);

  const exerciseChartData = entries
    .filter((e) => e.exerciseId === exerciseId)
    .map((e) => ({ date: e.date.slice(5), weight: e.weight, reps: e.reps }));

  const overallChartData = useMemo(() => {
    const byDate = new Map<string, number>();
    for (const e of entries) {
      const volume = e.weight * e.reps * e.sets;
      byDate.set(e.date, (byDate.get(e.date) ?? 0) + volume);
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, volume]) => ({ date: date.slice(5), volume: Math.round(volume) }));
  }, [entries]);

  const workoutsLast30Days = useMemo(() => {
    const cutoff = subDays(new Date(), 30).toISOString().slice(0, 10);
    return new Set(entries.filter((e) => e.date >= cutoff).map((e) => e.date)).size;
  }, [entries]);

  const totalVolume = useMemo(
    () => Math.round(entries.reduce((sum, e) => sum + e.weight * e.reps * e.sets, 0)),
    [entries]
  );

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Тренировок за 30 дней" value={String(workoutsLast30Days)} icon={CalendarCheck} color="#16a34a" />
        <StatCard
          label="Общий объём"
          value={totalVolume.toLocaleString("ru-RU")}
          unit="кг"
          icon={Dumbbell}
          color="#059669"
        />
      </div>

      <div className="card p-4 space-y-3">
        <p className="font-semibold flex items-center gap-1.5">
          <TrendingUp size={16} /> Общий прогресс
        </p>
        {overallChartData.length > 0 ? (
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={overallChartData}>
                <defs>
                  <linearGradient id="overallFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#16a34a" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#16a34a" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} width={36} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#16a34a"
                  strokeWidth={2.5}
                  fill="url(#overallFill)"
                  dot={{ r: 3, fill: "#16a34a", strokeWidth: 0 }}
                  name="Объём (вес×повт)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-6 text-center">
            Пока нет данных. Пройдите тренировку через «Начать тренировку», чтобы результаты появились здесь автоматически.
          </p>
        )}
      </div>

      <div className="card p-4 space-y-3">
        <p className="font-semibold flex items-center gap-1.5">
          <TrendingUp size={16} /> Прогресс по упражнению
        </p>
        <select
          value={exerciseId}
          onChange={(e) => setExerciseId(e.target.value)}
          className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
        >
          {[...grouped.entries()].map(([cat, list]) => (
            <optgroup key={cat} label={CATEGORY_LABELS[cat as keyof typeof CATEGORY_LABELS]}>
              {list.map((ex) => (
                <option key={ex.id} value={ex.id}>
                  {ex.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        {exerciseChartData.length > 0 ? (
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={exerciseChartData}>
                <defs>
                  <linearGradient id="progressFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#65a30d" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#65a30d" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} width={28} tickLine={false} axisLine={false} />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke="#65a30d"
                  strokeWidth={2.5}
                  fill="url(#progressFill)"
                  dot={{ r: 3, fill: "#65a30d", strokeWidth: 0 }}
                  name="Вес, кг"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-6 text-center">Пока нет записей для этого упражнения</p>
        )}
      </div>
    </div>
  );
}
