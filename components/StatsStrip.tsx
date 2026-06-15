import { BadgeCheck, Globe2, Layers3, UsersRound } from "lucide-react";

const stats = [
  { value: "120+", label: "Projects completed", icon: Layers3 },
  { value: "38", label: "Happy clients", icon: UsersRound },
  { value: "14", label: "Industries served", icon: BadgeCheck },
  { value: "8+", label: "Years of craft", icon: Globe2 },
];

export function StatsStrip() {
  return (
    <div className="stats-strip">
      {stats.map(({ value, label, icon: Icon }) => (
        <div className="stat-item" key={label}>
          <span className="stat-icon">
            <Icon size={25} strokeWidth={1.7} />
          </span>
          <span>
            <strong>{value}</strong>
            <small>{label}</small>
          </span>
        </div>
      ))}
    </div>
  );
}
