"use client";

import { useState } from "react";
import { ClipboardList, ChevronDown, ChevronUp, Pencil, Trash2 } from "lucide-react";
import { getCategoryColor } from "@/lib/constants";
import { getCategoryIcon } from "@/lib/category-icons";
import type { ProgramDTO } from "@/lib/types";

export default function ProgramCard({
  program,
  onEdit,
  onDelete,
}: {
  program: ProgramDTO;
  onEdit?: () => void;
  onDelete?: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="card overflow-hidden">
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center gap-4 px-5 py-4 text-left"
      >
        <span className="icon-badge w-12 h-12" style={{ backgroundColor: "#16a34a1f", color: "#16a34a" }}>
          <ClipboardList size={22} strokeWidth={1.75} />
        </span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-base truncate">{program.name}</p>
          <p className="text-xs text-gray-400 mt-0.5">
            {program.isIndividual ? "Индивидуальная программа" : "От тренера"} ·{" "}
            {program.exercises.length} упражнений
          </p>
        </div>
        <span className="text-gray-300">
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </span>
      </button>

      {open && (
        <div className="border-t border-gray-50 divide-y divide-gray-50">
          {program.exercises.map((pe) => {
            const Icon = getCategoryIcon(pe.exercise.category);
            const color = getCategoryColor(pe.exercise.category);
            return (
              <div key={pe.id} className="flex items-start gap-3 px-5 py-3 text-sm">
                <span
                  className="icon-badge w-9 h-9 shrink-0 mt-0.5"
                  style={{ backgroundColor: `${color}1f`, color }}
                >
                  <Icon size={18} strokeWidth={1.75} />
                </span>
                <div className="flex-1">
                  <p className="font-medium">{pe.exercise.name}</p>
                  <p className="text-gray-500 text-xs mt-0.5">
                    {pe.sets.map((s, i) => (
                      <span key={s.id}>
                        {i > 0 && " · "}
                        {s.weight ? `${s.weight}кг` : "б/в"}×{s.reps}
                      </span>
                    ))}
                  </p>
                  <p className="text-gray-400 text-xs">Отдых: {pe.restSeconds}с</p>
                </div>
              </div>
            );
          })}
          {(onEdit || onDelete) && (
            <div className="px-5 py-3 flex gap-2">
              {onEdit && (
                <button
                  onClick={onEdit}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-gray-700 hover:text-gray-900"
                >
                  <Pencil size={14} /> Изменить
                </button>
              )}
              {onDelete && (
                <button
                  onClick={onDelete}
                  className="flex-1 flex items-center justify-center gap-1.5 text-sm font-medium text-red-500 hover:text-red-600"
                >
                  <Trash2 size={14} /> Удалить
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
