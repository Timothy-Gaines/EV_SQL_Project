import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  ScatterChart, Scatter, ZAxis, Cell,
} from 'recharts';
import { useCSVData } from '../hooks/useCSVData';
import { getCSVPath, SQL_MODULES } from '../data/manifest';
import { SQL_CONTENT } from '../data/sqlContent';
import type { SQL5Q1Row, SQL5Q2Row, SQL5Q3Row, SQL5Q5Row, SQL5Q6Row, SQL5Q7Row } from '../types/data';
import ModuleHeader from '../components/ModuleHeader';
import ChartCard from '../components/ChartCard';
import SqlViewer from '../components/SqlViewer';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { BarChart3, Zap, AlertTriangle } from 'lucide-react';

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

export default function SQL5Module() {
  const mod = SQL_MODULES[4];
  const { data: q1, loading: l1, error: e1 } = useCSVData<SQL5Q1Row>(getCSVPath(mod.csvFiles[0]));
  const { data: q2, loading: l2, error: e2 } = useCSVData<SQL5Q2Row>(getCSVPath(mod.csvFiles[1]));
  const { data: q3, loading: l3, error: e3 } = useCSVData<SQL5Q3Row>(getCSVPath(mod.csvFiles[2]));
  const { data: q5, loading: l5, error: e5 } = useCSVData<SQL5Q5Row>(getCSVPath(mod.csvFiles[4]));
  const { data: q6, loading: l6, error: e6 } = useCSVData<SQL5Q6Row>(getCSVPath(mod.csvFiles[5]));
  const { data: q7, loading: l7, error: e7 } = useCSVData<SQL5Q7Row>(getCSVPath(mod.csvFiles[6]));

  const topStates = useMemo(() => q1.filter(r => r.category?.includes('TOP')), [q1]);
  const bottomStates = useMemo(() => q1.filter(r => r.category?.includes('BOTTOM')), [q1]);
  const topDC = useMemo(() => q2.filter(r => r.category?.includes('TOP')), [q2]);
  const bottomDC = useMemo(() => q2.filter(r => r.category?.includes('BOTTOM')), [q2]);

  const portsPerCapita = useMemo(
    () => [...q6].sort((a, b) => b.ports_per_100k - a.ports_per_100k).slice(0, 25),
    [q6],
  );

  const dcPerCapita = useMemo(
    () => [...q7].sort((a, b) => b.dc_fast_ports_per_100k - a.dc_fast_ports_per_100k).slice(0, 25),
    [q7],
  );

  const loading = l1 || l2 || l3 || l5 || l6 || l7;
  const error = e1 || e2 || e3 || e5 || e6 || e7;
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
          label="Best Served State"
          value={topStates[0]?.state_abbrev ?? '—'}
          sublabel={topStates[0] ? `${topStates[0].ports_per_100k} ports/100K` : ''}
          icon={<BarChart3 size={20} />}
        />
        <StatCard
          label="Least Served State"
          value={bottomStates[bottomStates.length - 1]?.state_abbrev ?? bottomStates[0]?.state_abbrev ?? '—'}
          sublabel={bottomStates[0] ? `${bottomStates[0].ports_per_100k} ports/100K` : ''}
          icon={<AlertTriangle size={20} />}
          accentColor="accent-pink"
        />
        <StatCard
          label="Top DC-Fast ZIP"
          value={q3[0]?.zip ?? '—'}
          sublabel={q3[0] ? `${q3[0].total_stations} DC-fast stations` : ''}
          icon={<Zap size={20} />}
          accentColor="accent-orange"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top 5 States — Ports per 100K" subtitle="Best-served states by total ports per capita">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topStates} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="state_abbrev" tick={{ fontSize: 11 }} stroke="#30363d" />
                <YAxis tick={{ fontSize: 11 }} stroke="#30363d" />
                <Tooltip content={<Tip />} />
                <Bar dataKey="ports_per_100k" name="Ports/100K" fill={COLORS.teal} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Bottom 5 States — Ports per 100K" subtitle="Least-served states — potential infrastructure gaps">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bottomStates} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="state_abbrev" tick={{ fontSize: 11 }} stroke="#30363d" />
                <YAxis tick={{ fontSize: 11 }} stroke="#30363d" />
                <Tooltip content={<Tip />} />
                <Bar dataKey="ports_per_100k" name="Ports/100K" fill={COLORS.rose} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="All States — Ports per 100K Residents" subtitle="Total charging ports normalized by population">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={portsPerCapita} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="state_abbrev" tick={{ fontSize: 9 }} stroke="#30363d" interval={0} angle={-45} textAnchor="end" height={50} />
              <YAxis tick={{ fontSize: 11 }} stroke="#30363d" />
              <Tooltip content={<Tip />} />
              <Bar dataKey="ports_per_100k" name="Ports/100K" radius={[3, 3, 0, 0]}>
                {portsPerCapita.map((r, i) => (
                  <Cell key={i} fill={i < 5 ? COLORS.teal : i >= portsPerCapita.length - 5 ? COLORS.rose : '#30363d'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="DC-Fast ZIP Code Hotspots" subtitle="Top 10 ZIP codes by number of DC-fast equipped stations">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={q3} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="zip" tick={{ fontSize: 11 }} stroke="#30363d" />
              <YAxis tick={{ fontSize: 11 }} stroke="#30363d" />
              <Tooltip content={<Tip />} />
              <Bar dataKey="total_stations" name="Stations" fill={COLORS.amber} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <ChartCard title="Large-City Charging Gaps" subtitle="Cities with 100K+ population and fewer than 5 EV stations">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="pop2024" name="Population" tick={{ fontSize: 11 }} stroke="#30363d" tickFormatter={(v: number) => `${(v / 1000).toFixed(0)}K`} />
              <YAxis dataKey="total_stations" name="Stations" tick={{ fontSize: 11 }} stroke="#30363d" />
              <ZAxis range={[60, 200]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as SQL5Q5Row;
                  return (
                    <div className="glass-card p-3 px-4 shadow-brutal border-accent-lime">
                      <p className="text-xs font-display font-semibold text-txt-primary">{d.city}, {d.state_abbrev}</p>
                      <p className="text-xs text-txt-secondary">Pop: {d.pop2024?.toLocaleString()}</p>
                      <p className="text-xs text-txt-secondary">Stations: <span className="font-semibold text-accent-pink">{d.total_stations}</span></p>
                    </div>
                  );
                }}
              />
              <Scatter data={q5} fill={COLORS.rose} opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-txt-primary mb-4">DC-Fast Ports per 100K by State</h3>
        <DataTable
          data={dcPerCapita}
          columns={[
            { key: 'state_abbrev', label: 'State' },
            { key: 'dc_fast_ports_per_100k', label: 'DC-Fast/100K', format: (v) => Number(v).toFixed(2) },
          ]}
          pageSize={15}
        />
      </div>

      <SqlViewer sql={SQL_CONTENT[5]} title="View SQL 5 — Geographic Coverage & Readiness" />
    </div>
  );
}
