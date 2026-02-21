import { ReactNode } from 'react';

interface ChartCardProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, subtitle, children, className = '' }: ChartCardProps) {
  return (
    <div className={`glass-card p-6 ${className}`}>
      <div className="mb-5">
        <h3 className="text-sm font-display font-semibold text-txt-primary">{title}</h3>
        {subtitle && (
          <p className="text-xs text-txt-secondary mt-1">{subtitle}</p>
        )}
      </div>
      <div className="chart-container">{children}</div>
    </div>
  );
}
