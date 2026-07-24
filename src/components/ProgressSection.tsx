"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { subDays } from "date-fns";
import { CalendarCheck, Dumbbell, TrendingUp } from "lucide-react";
import {
  CATEGORY_COLORS,
  CATEGORY_LABELS,
  EXERCISE_CATEGORIES,
  getCategoryLabel,
  type ExerciseCategoryType,
} from "@/lib/constants";
import { fetchJson } from "@/lib/fetchJson";
import StatCard from "@/components/StatCard";
import type { ExerciseDTO, ProgressEntryDTO } from "@/lib/types";

export default function ProgressSection({ studentId }: { studentId: string }) {
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [entries, setEntries] = useState<ProgressEntryDTO[]>([]);
  const [exerciseId, setExerciseId] = useState<string>("");
  const [category, setCategory] = useState<ExerciseCategoryType | "">("");

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

  const categoryTotals = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const e of entries) {
      const volume = e.weight * e.reps * e.sets;
      byCategory.set(e.exercise.category, (byCategory.get(e.exercise.category) ?? 0) + volume);
    }
    return Object.values(EXERCISE_CATEGORIES)
      .map((cat) => ({
        category: cat,
        label: CATEGORY_LABELS[cat],
        color: CATEGORY_COLORS[cat],
        volume: Math.round(byCategory.get(cat) ?? 0),
      }))
      .filter((c) => c.volume > 0)
      .sort((a, b) => b.volume - a.volume);
  }, [entries]);

  const activeCategory = category || categoryTotals[0]?.category || "";

  const categoryChartData = useMemo(() => {
    if (!activeCategory) return [];
    const byDate = new Map<string, number>();
    for (const e of entries) {
      if (e.exercise.category !== activeCategory) continue;
      const volume = e.weight * e.reps * e.sets;
      byDate.set(e.date, (byDate.get(e.date) ?? 0) + volume);
    }
    return [...byDate.entries()]
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, volume]) => ({ date: date.slice(5), volume: Math.round(volume) }));
  }, [entries, activeCategory]);

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
          <TrendingUp size={16} /> Объём по группам мышц
        </p>
        {categoryTotals.length > 0 ? (
          <div className="h-56 -ml-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryTotals}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis dataKey="label" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis fontSize={11} width={36} tickLine={false} axisLine={false} />
                <Tooltip />
                <Bar dataKey="volume" name="Объём (вес×повт)" radius={[6, 6, 0, 0]}>
                  {categoryTotals.map((c) => (
                    <Cell key={c.category} fill={c.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <p className="text-sm text-gray-400 py-6 text-center">
            Пока нет данных. Пройдите тренировку через «Начать тренировку», чтобы результаты появились здесь автоматически.
          </p>
        )}
      </div>

      {categoryTotals.length > 0 && (
        <div className="card p-4 space-y-3">
          <p className="font-semibold flex items-center gap-1.5">
            <TrendingUp size={16} /> Прогресс по группе мышц
          </p>
          <select
            value={activeCategory}
            onChange={(e) => setCategory(e.target.value as ExerciseCategoryType)}
            className="w-full rounded-xl border border-gray-200 px-3 py-2 text-sm"
          >
            {categoryTotals.map((c) => (
              <option key={c.category} value={c.category}>
                {c.label}
              </option>
            ))}
          </select>

          {categoryChartData.length > 0 ? (
            <div className="h-56 -ml-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={categoryChartData}>
                  <defs>
                    <linearGradient id="categoryFill" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={CATEGORY_COLORS[activeCategory as ExerciseCategoryType] ?? "#16a34a"} stopOpacity={0.5} />
                      <stop offset="100%" stopColor={CATEGORY_COLORS[activeCategory as ExerciseCategoryType] ?? "#16a34a"} stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                  <XAxis dataKey="date" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis fontSize={11} width={36} tickLine={false} axisLine={false} />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="volume"
                    stroke={CATEGORY_COLORS[activeCategory as ExerciseCategoryType] ?? "#16a34a"}
                    strokeWidth={2.5}
                    fill="url(#categoryFill)"
                    dot={{ r: 3, fill: CATEGORY_COLORS[activeCategory as ExerciseCategoryType] ?? "#16a34a", strokeWidth: 0 }}
                    name="Объём (вес×повт)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-gray-400 py-6 text-center">Пока нет записей для этой группы мышц</p>
          )}
        </div>
      )}

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
            <optgroup key={cat} label={getCategoryLabel(cat)}>
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
