import { ReactNode } from 'react';

const COLOR_MAP: Record<string, { bg: string; text: string }> = {
  'accent-lime': { bg: 'rgba(204,255,0,0.1)', text: '#ccff00' },
  'accent-orange': { bg: 'rgba(255,63,0,0.1)', text: '#ff3f00' },
  'accent-purple': { bg: 'rgba(176,92,255,0.1)', text: '#b05cff' },
  'accent-cyan': { bg: 'rgba(0,229,255,0.1)', text: '#00e5ff' },
  'accent-pink': { bg: 'rgba(255,0,119,0.1)', text: '#ff0077' },
};

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel?: string;
  icon?: ReactNode;
  accentColor?: string;
}

export default function StatCard({
  label,
  value,
  sublabel,
  icon,
  accentColor = 'accent-lime',
}: StatCardProps) {
  const colors = COLOR_MAP[accentColor] ?? COLOR_MAP['accent-lime'];

  return (
    <div className="glass-card-hover p-5 flex items-start gap-4">
      {icon && (
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: colors.bg }}
        >
          <span style={{ color: colors.text }}>{icon}</span>
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs font-medium text-txt-secondary mb-1 uppercase tracking-wider">
          {label}
        </p>
        <p className="stat-value text-2xl">{value}</p>
        {sublabel && (
          <p className="text-xs text-txt-muted mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
