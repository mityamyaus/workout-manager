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
    <div className="card p-4 flex flex-col justify-between min-h-[108px]">
      <div className="flex items-start justify-between gap-2">
        <span className="stat-label max-w-[65%]">{label}</span>
        <span className="icon-badge w-9 h-9" style={{ backgroundColor: `${color}1f`, color }}>
          <Icon size={17} strokeWidth={1.75} />
        </span>
      </div>
      <div className="mt-2">
        <span className="stat-value">{value}</span>
        {unit && <span className="stat-unit">{unit}</span>}
      </div>
    </div>
  );
}
