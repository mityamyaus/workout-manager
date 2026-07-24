import type { LucideIcon } from "lucide-react";

export default function StatCard({
  label,
  value,
  unit,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  color: string;
}) {
  return (
    <div className="card p-5 flex flex-col justify-between min-h-[136px]">
      <div className="flex items-start justify-between gap-2">
        <span className="stat-label max-w-[65%]">{label}</span>
        <span className="icon-badge w-11 h-11" style={{ backgroundColor: `${color}1f`, color }}>
          <Icon size={20} strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-3">
        <span className="stat-value">{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  );
}
