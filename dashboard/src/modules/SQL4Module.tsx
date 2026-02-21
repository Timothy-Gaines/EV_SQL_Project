import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell,
} from 'recharts';
import { useCSVData } from '../hooks/useCSVData';
import { getCSVPath, SQL_MODULES } from '../data/manifest';
import { SQL_CONTENT } from '../data/sqlContent';
import type { SQL4Q1Row, SQL4Q2Row, SQL4Q3Row } from '../types/data';
import ModuleHeader from '../components/ModuleHeader';
import ChartCard from '../components/ChartCard';
import SqlViewer from '../components/SqlViewer';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Plug, Clock, Cpu } from 'lucide-react';

const COLORS = { teal: '#ccff00', amber: '#ff3f00', violet: '#b05cff', cyan: '#00e5ff', rose: '#ff0077' };

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 px-4 shadow-brutal border-accent-lime">
      <p className="text-xs font-display font-semibold text-txt-primary mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="text-xs text-txt-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: e.color }} />
          {e.name}: <span className="font-semibold text-txt-primary">{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}</span>
        </p>
      ))}
    </div>
  );
};

export default function SQL4Module() {
  const mod = SQL_MODULES[3];
  const { data: q1, loading: l1, error: e1 } = useCSVData<SQL4Q1Row>(getCSVPath(mod.csvFiles[0]));
  const { data: q2, loading: l2, error: e2 } = useCSVData<SQL4Q2Row>(getCSVPath(mod.csvFiles[1]));
  const { data: q3, loading: l3, error: e3 } = useCSVData<SQL4Q3Row>(getCSVPath(mod.csvFiles[2]));

  const portMixTop = useMemo(() =>
    [...q1].sort((a, b) => b.pct_dc_fast - a.pct_dc_fast).slice(0, 20),
    [q1],
  );

  const availChart = useMemo(() =>
    [...q2].sort((a, b) => b.pct_open_24 - a.pct_open_24).slice(0, 15),
    [q2],
  );

  const avgDcFast = useMemo(() => {
    if (!q1.length) return 0;
    return Math.round(q1.reduce((s, r) => s + (r.pct_dc_fast || 0), 0) / q1.length);
  }, [q1]);

  const states24hr = useMemo(
    () => q2.filter(r => r.pct_open_24 >= 80).length,
    [q2],
  );

  const loading = l1 || l2 || l3;
  const error = e1 || e2 || e3;
  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-8 animate-fade-in">
      <ModuleHeader
        sqlNumber={mod.id}
        title={mod.title}
        description={mod.description}
        questions={mod.questions}
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          label="Avg DC-Fast Share"
          value={`${avgDcFast}%`}
          sublabel="Across all states"
          icon={<Plug size={20} />}
        />
        <StatCard
          label="States ≥80% 24/7"
          value={states24hr}
          sublabel="Of all reporting states"
          icon={<Clock size={20} />}
          accentColor="accent-orange"
        />
        <StatCard
          label="Dominant Connector"
          value={q3[0]?.top_dc_fast_connector ?? '—'}
          sublabel="Most common DC-fast since 2023"
          icon={<Cpu size={20} />}
          accentColor="accent-purple"
        />
      </div>

      <ChartCard title="DC-Fast vs Level-2 Port Mix" subtitle="States with highest DC-fast proportion">
        <div className="h-[450px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portMixTop} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" domain={[0, 100]} unit="%" />
              <YAxis dataKey="state_abbrev" type="category" width={40} tick={{ fontSize: 10 }} stroke="#30363d" />
              <Tooltip content={<Tip />} />
              <Bar dataKey="pct_dc_fast" name="DC-Fast %" stackId="a" fill={COLORS.teal} />
              <Bar dataKey="pct_level2" name="Level-2 %" stackId="a" fill={COLORS.amber} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="24/7 Station Availability" subtitle="States by percentage of stations open 24 hours daily">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={availChart} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="state_abbrev" tick={{ fontSize: 10 }} stroke="#30363d" />
              <YAxis tick={{ fontSize: 11 }} stroke="#30363d" domain={[0, 100]} unit="%" />
              <Tooltip content={<Tip />} />
              <Bar dataKey="pct_open_24" name="Open 24/7 %" radius={[4, 4, 0, 0]}>
                {availChart.map((r, i) => (
                  <Cell key={i} fill={r.pct_open_24 >= 80 ? COLORS.teal : r.pct_open_24 >= 60 ? COLORS.amber : COLORS.rose} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="DC-Fast Connector by Region" subtitle="Leading connector type per US Census region (since 2023)">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={q3} outerRadius="70%">
              <PolarGrid stroke="#21262d" />
              <PolarAngleAxis dataKey="region" tick={{ fontSize: 11, fill: '#8b949e' }} />
              <PolarRadiusAxis tick={{ fontSize: 10, fill: '#484f58' }} />
              <Radar name="DC-Fast Ports" dataKey="total_dc_fast_ports" stroke={COLORS.cyan} fill={COLORS.cyan} fillOpacity={0.2} strokeWidth={2} />
              <Tooltip content={<Tip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {q3.map((r, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-base-700/40 border border-base-600/30">
              <span className="text-xs font-display font-semibold text-txt-primary">{r.region}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan font-medium">
                {r.top_dc_fast_connector}
              </span>
              <span className="text-xs text-txt-muted">{r.total_dc_fast_ports.toLocaleString()} ports</span>
            </div>
          ))}
        </div>
      </ChartCard>

      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-txt-primary mb-4">Full Port Mix by State</h3>
        <DataTable
          data={q1}
          columns={[
            { key: 'state_abbrev', label: 'State' },
            { key: 'total_dc_fast_count', label: 'DC-Fast Ports', format: (v) => Number(v).toLocaleString() },
            { key: 'total_level_2_count', label: 'Level-2 Ports', format: (v) => Number(v).toLocaleString() },
            { key: 'pct_dc_fast', label: 'DC-Fast %', format: (v) => `${v}%` },
            { key: 'pct_level2', label: 'Level-2 %', format: (v) => `${v}%` },
          ]}
        />
      </div>

      <SqlViewer sql={SQL_CONTENT[4]} title="View SQL 4 — Charger Technology & Accessibility" />
    </div>
  );
}
