"use client";

import { useEffect, useMemo, useState } from "react";
import { X, Plus, Check, Copy, Trash2 } from "lucide-react";
import {
  CATEGORY_LABELS,
  EQUIPMENT_LABELS,
  EQUIPMENT_TYPES,
  EXERCISE_CATEGORIES,
  EquipmentType,
  ExerciseCategoryType,
} from "@/lib/constants";
import { getCategoryIcon } from "@/lib/category-icons";
import { fetchJson } from "@/lib/fetchJson";
import { useLockBodyScroll } from "@/lib/useLockBodyScroll";
import type { ExerciseDTO, ProgramDTO } from "@/lib/types";

interface DraftSet {
  weight: number;
  reps: number;
}

interface DraftExercise {
  exerciseId: string;
  name: string;
  category: ExerciseCategoryType;
  restSeconds: number;
  sets: DraftSet[];
}

interface ProgramBuilderProps {
  studentId: string;
  authorId: string;
  existingProgram?: ProgramDTO | null;
  onCancel: () => void;
  onSaved: (program: ProgramDTO) => void;
}

const REST_OPTIONS = [30, 45, 60, 90, 120, 180];

export default function ProgramBuilder({
  studentId,
  authorId,
  existingProgram,
  onCancel,
  onSaved,
}: ProgramBuilderProps) {
  const isEditing = !!existingProgram;
  const [exercises, setExercises] = useState<ExerciseDTO[]>([]);
  const [category, setCategory] = useState<ExerciseCategoryType | "ALL">("ALL");
  const [equipment, setEquipment] = useState<EquipmentType | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [draft, setDraft] = useState<DraftExercise[]>(
    existingProgram
      ? existingProgram.exercises.map((pe) => ({
          exerciseId: pe.exerciseId,
          name: pe.exercise.name,
          category: pe.exercise.category,
          restSeconds: pe.restSeconds,
          sets: pe.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
        }))
      : []
  );
  const [programName, setProgramName] = useState(existingProgram?.name ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useLockBodyScroll();

  useEffect(() => {
    fetchJson<ExerciseDTO[]>("/api/exercises").then((list) => {
      if (list) setExercises(list);
    });
  }, []);

  const filtered = useMemo(() => {
    return exercises.filter((ex) => {
      if (category !== "ALL" && ex.category !== category) return false;
      if (equipment !== "ALL" && ex.equipment !== equipment) return false;
      if (search && !ex.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [exercises, category, equipment, search]);

  const addExercise = (ex: ExerciseDTO) => {
    if (draft.some((d) => d.exerciseId === ex.id)) return;
    setDraft((prev) => [
      ...prev,
      {
        exerciseId: ex.id,
        name: ex.name,
        category: ex.category,
        restSeconds: 90,
        sets: [{ weight: 0, reps: 10 }],
      },
    ]);
  };

  const removeExercise = (exerciseId: string) => {
    setDraft((prev) => prev.filter((d) => d.exerciseId !== exerciseId));
  };

  const addSet = (exerciseId: string) => {
    setDraft((prev) =>
      prev.map((d) => {
        if (d.exerciseId !== exerciseId) return d;
        const last = d.sets[d.sets.length - 1];
        return { ...d, sets: [...d.sets, { ...last }] };
      })
    );
  };

  const duplicateSet = (exerciseId: string, setIndex: number) => {
    setDraft((prev) =>
      prev.map((d) => {
        if (d.exerciseId !== exerciseId) return d;
        const copy = { ...d.sets[setIndex] };
        const sets = [...d.sets];
        sets.splice(setIndex + 1, 0, copy);
        return { ...d, sets };
      })
    );
  };

  const removeSet = (exerciseId: string, setIndex: number) => {
    setDraft((prev) =>
      prev.map((d) => {
        if (d.exerciseId !== exerciseId) return d;
        if (d.sets.length <= 1) return d;
        return { ...d, sets: d.sets.filter((_, i) => i !== setIndex) };
      })
    );
  };

  const updateSet = (exerciseId: string, setIndex: number, field: "weight" | "reps", value: number) => {
    setDraft((prev) =>
      prev.map((d) => {
        if (d.exerciseId !== exerciseId) return d;
        return {
          ...d,
          sets: d.sets.map((s, i) => (i === setIndex ? { ...s, [field]: value } : s)),
        };
      })
    );
  };

  const updateRest = (exerciseId: string, restSeconds: number) => {
    setDraft((prev) => prev.map((d) => (d.exerciseId === exerciseId ? { ...d, restSeconds } : d)));
  };

  const handleSave = async () => {
    if (!programName.trim()) {
      setError("Укажите название программы");
      return;
    }
    if (draft.length === 0) {
      setError("Добавьте хотя бы одно упражнение");
      return;
    }
    setError(null);
    setBusy(true);

    const exercisesPayload = draft.map((d) => ({
      exerciseId: d.exerciseId,
      restSeconds: d.restSeconds,
      sets: d.sets.map((s) => ({ weight: s.weight, reps: s.reps })),
    }));

    const res = isEditing
      ? await fetch(`/api/programs/${existingProgram!.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: programName.trim(), exercises: exercisesPayload }),
        })
      : await fetch("/api/programs", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: programName.trim(),
            studentId,
            authorId,
            isIndividual: authorId === studentId,
            exercises: exercisesPayload,
          }),
        });

    setBusy(false);
    if (res.ok) {
      onSaved(await res.json());
    } else {
      setError("Не удалось сохранить программу");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-end sm:items-center justify-center z-30">
      <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg max-h-[92vh] overflow-y-auto overscroll-contain p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">
            {isEditing ? "Редактировать программу" : "Новая программа"}
          </h3>
          <button onClick={onCancel} className="text-gray-400">
            <X size={22} />
          </button>
        </div>

        <input
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          placeholder="Название программы (например: Верх тела А)"
          className="w-full rounded-xl border border-gray-300 px-3 py-2"
        />

        {draft.length > 0 && (
          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-500">Выбранные упражнения</p>
            {draft.map((d) => {
              const Icon = getCategoryIcon(d.category);
              return (
              <div key={d.exerciseId} className="bg-gray-50 rounded-2xl p-3 space-y-2">
                <div className="flex items-center gap-2">
                  <Icon size={16} className="text-gray-500" strokeWidth={1.75} />
                  <span className="flex-1 text-sm font-medium">{d.name}</span>
                  <button onClick={() => removeExercise(d.exerciseId)} className="text-red-400 px-1">
                    <X size={16} />
                  </button>
                </div>

                <div className="space-y-2">
                  {d.sets.map((s, i) => (
                    <div key={i} className="flex items-center gap-1.5">
                      <span className="text-xs text-gray-400 w-9 shrink-0">Сет {i + 1}</span>
                      <input
                        type="number"
                        value={s.weight}
                        onChange={(e) => updateSet(d.exerciseId, i, "weight", Number(e.target.value))}
                        className="w-16 rounded-lg border border-gray-300 px-1 py-2 text-center text-sm"
                        title="Вес, кг"
                      />
                      <span className="text-xs text-gray-400">кг ×</span>
                      <input
                        type="number"
                        value={s.reps}
                        onChange={(e) => updateSet(d.exerciseId, i, "reps", Number(e.target.value))}
                        className="w-14 rounded-lg border border-gray-300 px-1 py-2 text-center text-sm"
                        title="Повторения"
                      />
                      <span className="text-xs text-gray-400">повт.</span>
                      <span className="flex-1" />
                      <button
                        onClick={() => duplicateSet(d.exerciseId, i)}
                        title="Скопировать сет"
                        className="icon-badge w-9 h-9 shrink-0 bg-white border border-gray-200 text-gray-500 hover:text-[var(--accent)] hover:border-[var(--accent)] transition-colors"
                      >
                        <Copy size={16} strokeWidth={1.75} />
                      </button>
                      <button
                        onClick={() => removeSet(d.exerciseId, i)}
                        disabled={d.sets.length <= 1}
                        title="Удалить сет"
                        className="icon-badge w-9 h-9 shrink-0 bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-300 transition-colors disabled:opacity-30 disabled:hover:text-gray-500 disabled:hover:border-gray-200"
                      >
                        <Trash2 size={16} strokeWidth={1.75} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => addSet(d.exerciseId)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border-2 border-dashed border-gray-300 py-2.5 text-sm text-gray-500 font-medium hover:bg-white hover:border-gray-400 transition-colors"
                >
                  <span className="icon-badge w-6 h-6 bg-[var(--accent)] text-white">
                    <Plus size={14} strokeWidth={2.5} />
                  </span>
                  Добавить сет
                </button>

                <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                  <span className="text-xs text-gray-400">Отдых после сета:</span>
                  <select
                    value={d.restSeconds}
                    onChange={(e) => updateRest(d.exerciseId, Number(e.target.value))}
                    className="rounded-lg border border-gray-300 px-2 py-1 text-xs"
                  >
                    {REST_OPTIONS.map((sec) => (
                      <option key={sec} value={sec}>
                        {sec < 60 ? `${sec} сек` : `${sec / 60} мин`}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              );
            })}
          </div>
        )}

        <div className="space-y-2 pt-2 border-t border-gray-100">
          <p className="text-sm font-medium text-gray-500">Библиотека упражнений</p>

          <div className="flex gap-2">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExerciseCategoryType | "ALL")}
              className="flex-1 min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="ALL">Все группы мышц</option>
              {Object.values(EXERCISE_CATEGORIES).map((cat) => (
                <option key={cat} value={cat}>
                  {CATEGORY_LABELS[cat]}
                </option>
              ))}
            </select>
            <select
              value={equipment}
              onChange={(e) => setEquipment(e.target.value as EquipmentType | "ALL")}
              className="flex-1 min-w-0 rounded-xl border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="ALL">Всё оборудование</option>
              {Object.values(EQUIPMENT_TYPES).map((eq) => (
                <option key={eq} value={eq}>
                  {EQUIPMENT_LABELS[eq]}
                </option>
              ))}
            </select>
          </div>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск..."
            className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
          />

          <div className="max-h-56 overflow-y-auto overscroll-contain space-y-1 pt-1">
            {filtered.map((ex) => {
              const added = draft.some((d) => d.exerciseId === ex.id);
              const Icon = getCategoryIcon(ex.category);
              return (
                <button
                  key={ex.id}
                  onClick={() => addExercise(ex)}
                  disabled={added}
                  className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-xl text-sm ${
                    added ? "bg-emerald-50 text-emerald-600" : "hover:bg-gray-100"
                  }`}
                >
                  <Icon size={16} strokeWidth={1.75} className={added ? "" : "text-gray-400"} />
                  <span className="flex-1">
                    {ex.name}
                    {ex.equipment && (
                      <span className="block text-xs text-gray-400 font-normal">
                        {EQUIPMENT_LABELS[ex.equipment]}
                      </span>
                    )}
                  </span>
                  {added && <Check size={16} />}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="text-sm text-gray-400 px-3 py-2">Ничего не найдено</p>
            )}
          </div>
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}

        <button
          disabled={busy}
          onClick={handleSave}
          className="btn-primary w-full"
        >
          {isEditing ? "Сохранить изменения" : "Сохранить программу"}
        </button>
      </div>
    </div>
  );
}
