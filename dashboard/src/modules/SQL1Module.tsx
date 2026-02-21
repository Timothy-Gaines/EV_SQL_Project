import { useMemo, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  AreaChart, Area, Cell,
} from 'recharts';
import { useCSVData } from '../hooks/useCSVData';
import { getCSVPath, SQL_MODULES } from '../data/manifest';
import { SQL_CONTENT } from '../data/sqlContent';
import type { SQL1Q1Row, SQL1Q2Row, SQL1Q3Row } from '../types/data';
import ModuleHeader from '../components/ModuleHeader';
import ChartCard from '../components/ChartCard';
import SqlViewer from '../components/SqlViewer';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';

const COLORS = {
  teal: '#ccff00', amber: '#ff3f00', violet: '#b05cff', cyan: '#00e5ff', rose: '#ff0077',
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 px-4 shadow-brutal border-accent-lime">
      <p className="text-xs font-display font-semibold text-txt-primary mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="text-xs text-txt-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: e.color }} />
          {e.name}: <span className="font-semibold text-txt-primary">{Number(e.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function SQL1Module() {
  const mod = SQL_MODULES[0];
  const { data: q1, loading: l1, error: e1 } = useCSVData<SQL1Q1Row>(getCSVPath(mod.csvFiles[0]));
  const { data: q2, loading: l2, error: e2 } = useCSVData<SQL1Q2Row>(getCSVPath(mod.csvFiles[1]));
  const { data: q3, loading: l3, error: e3 } = useCSVData<SQL1Q3Row>(getCSVPath(mod.csvFiles[2]));

  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const annualChart = useMemo(
    () => [...q1].filter(r => r.year >= 2010 && r.year < 2025).sort((a, b) => a.year - b.year),
    [q1],
  );

  const stateYoY = useMemo(() => {
    const year = selectedYear ?? (q2.length ? Math.max(...q2.map(r => r.year).filter(Boolean)) : 2024);
    return q2
      .filter(r => r.year === year && r.yoy_increase != null)
      .sort((a, b) => (b.yoy_increase ?? 0) - (a.yoy_increase ?? 0))
      .slice(0, 15);
  }, [q2, selectedYear]);

  const availableYears = useMemo(
    () => [...new Set(q2.map(r => r.year).filter(Boolean))].sort((a, b) => b - a),
    [q2],
  );

  const networkChart = useMemo(
    () => q3.slice(0, 10),
    [q3],
  );

  if (l1 || l2 || l3) return <LoadingState />;
  if (e1 || e2 || e3) return <ErrorState message={e1 || e2 || e3 || 'Failed to load data'} />;

  return (
    <div className="space-y-8 animate-fade-in">
      <ModuleHeader
        sqlNumber={mod.id}
        title={mod.title}
        description={mod.description}
        questions={mod.questions}
      />

      <ChartCard title="Annual EV Station Additions" subtitle="Stations opened per calendar year">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={annualChart} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="s1TealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={COLORS.teal} stopOpacity={0.3} />
                  <stop offset="100%" stopColor={COLORS.teal} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#30363d" />
              <YAxis tick={{ fontSize: 11 }} stroke="#30363d" />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="total_stations" name="Stations" stroke={COLORS.teal} strokeWidth={2} fill="url(#s1TealGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard
        title="State Year-over-Year Growth"
        subtitle={`Top 15 states by YoY station increase${selectedYear ? ` (${selectedYear})` : ''}`}
      >
        <div className="flex gap-2 flex-wrap mb-4">
          {availableYears.slice(0, 8).map(y => (
            <button
              key={y}
              onClick={() => setSelectedYear(y)}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                (selectedYear ?? availableYears[0]) === y
                  ? 'bg-accent-lime/15 text-accent-lime border border-accent-lime/30'
                  : 'bg-base-700/50 text-txt-muted border border-base-600/30 hover:text-txt-secondary'
              }`}
            >
              {y}
            </button>
          ))}
        </div>
        <div className="h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={stateYoY} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" />
              <YAxis dataKey="state" type="category" width={45} tick={{ fontSize: 11 }} stroke="#30363d" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="yoy_increase" name="YoY Increase" radius={[0, 4, 4, 0]}>
                {stateYoY.map((_, i) => (
                  <Cell key={i} fill={i < 3 ? COLORS.teal : i < 6 ? COLORS.cyan : '#30363d'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Network Growth Since 2020" subtitle="By charger type: DC-Fast, Level 2, Level 1">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={networkChart} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" />
              <YAxis dataKey="ev_network" type="category" width={120} tick={{ fontSize: 10 }} stroke="#30363d" />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="dc_station" name="DC-Fast" stackId="a" fill={COLORS.teal} />
              <Bar dataKey="level_2_station" name="Level 2" stackId="a" fill={COLORS.amber} />
              <Bar dataKey="level_1_station" name="Level 1" stackId="a" fill={COLORS.violet} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-txt-primary mb-4">Full Network Data</h3>
        <DataTable
          data={q3}
          columns={[
            { key: 'ev_network', label: 'Network' },
            { key: 'dc_station', label: 'DC-Fast', format: (v) => Number(v).toLocaleString() },
            { key: 'level_2_station', label: 'Level 2', format: (v) => Number(v).toLocaleString() },
            { key: 'level_1_station', label: 'Level 1', format: (v) => Number(v).toLocaleString() },
            { key: 'total_stations_added', label: 'Total', format: (v) => Number(v).toLocaleString() },
          ]}
        />
      </div>

      <SqlViewer sql={SQL_CONTENT[1]} title="View SQL 1 — Infrastructure Growth & Market Momentum" />
    </div>
  );
}
