import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  LineChart, Line, Cell, ScatterChart, Scatter, ZAxis,
} from 'recharts';
import { useCSVData } from '../hooks/useCSVData';
import { getCSVPath, SQL_MODULES } from '../data/manifest';
import { SQL_CONTENT } from '../data/sqlContent';
import type { SQL2Q1Row, SQL2Q3Row, SQL2Q4Row, SQL2Q5Row, SQL2Q6Row } from '../types/data';
import ModuleHeader from '../components/ModuleHeader';
import ChartCard from '../components/ChartCard';
import SqlViewer from '../components/SqlViewer';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { TrendingUp, AlertTriangle, MapPin } from 'lucide-react';

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

export default function SQL2Module() {
  const mod = SQL_MODULES[1];
  const { data: q1, loading: l1, error: e1 } = useCSVData<SQL2Q1Row>(getCSVPath(mod.csvFiles[0]));
  const { data: q3, loading: l3, error: e3 } = useCSVData<SQL2Q3Row>(getCSVPath(mod.csvFiles[1]));
  const { data: q4, loading: l4, error: e4 } = useCSVData<SQL2Q4Row>(getCSVPath(mod.csvFiles[2]));
  const { data: q5, loading: l5, error: e5 } = useCSVData<SQL2Q5Row>(getCSVPath(mod.csvFiles[3]));
  const { data: q6, loading: l6, error: e6 } = useCSVData<SQL2Q6Row>(getCSVPath(mod.csvFiles[4]));

  const growthChart = useMemo(() =>
    q1.filter((r) => {
      const label = String(r.label ?? '');
      return label.length > 0 && !label.startsWith('Average') && r.stations_opened != null;
    })
      .sort((a, b) => Number(a.label) - Number(b.label))
      .slice(-15),
    [q1],
  );

  const avgGrowth = useMemo(() => {
    const row = q1.find((r) => String(r.label ?? '').startsWith('Average'));
    return row?.yoy_pct_change ?? null;
  }, [q1]);

  const ageChart = useMemo(() =>
    [...q6].sort((a, b) => b.avg_age - a.avg_age).slice(0, 20),
    [q6],
  );

  const loading = l1 || l3 || l4 || l5 || l6;
  const error = e1 || e3 || e4 || e5 || e6;
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
          label="Avg YoY Growth Rate"
          value={avgGrowth != null ? `${avgGrowth.toFixed(1)}%` : '—'}
          sublabel="Since 2013"
          icon={<TrendingUp size={20} />}
        />
        <StatCard
          label="Top State Gain"
          value={q3[0]?.state_abbrev ?? '—'}
          sublabel={q3[0] ? `+${q3[0].station_gain} stations` : ''}
          icon={<MapPin size={20} />}
          accentColor="accent-orange"
        />
        <StatCard
          label="Oldest Avg Fleet"
          value={ageChart[0]?.state_abbrev ?? '—'}
          sublabel={ageChart[0] ? `${ageChart[0].avg_age} yrs avg, ${ageChart[0].older_than_5_years} >5yr` : ''}
          icon={<AlertTriangle size={20} />}
          accentColor="accent-pink"
        />
      </div>

      <ChartCard title="Annual Growth Trajectory" subtitle="Stations opened per year with YoY % change trend">
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={growthChart} margin={{ top: 10, right: 40, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="label" tick={{ fontSize: 11 }} stroke="#30363d" />
              <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#30363d" />
              <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#30363d" unit="%" />
              <Tooltip content={<Tip />} />
              <Bar yAxisId="left" dataKey="stations_opened" name="Stations" fill={COLORS.teal} opacity={0.5} radius={[3, 3, 0, 0]} />
              <Line yAxisId="right" type="monotone" dataKey="yoy_pct_change" name="YoY %" stroke={COLORS.amber} strokeWidth={2} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Top States by Station Gain" subtitle="Largest absolute YoY gain (latest year)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={q3} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" />
                <YAxis dataKey="state_abbrev" type="category" width={40} tick={{ fontSize: 11 }} stroke="#30363d" />
                <Tooltip content={<Tip />} />
                <Bar dataKey="station_gain" name="Gain" fill={COLORS.amber} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top Cities by Station Gain" subtitle="Largest absolute YoY gain (latest year)">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={q4} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" />
                <YAxis dataKey="city_label" type="category" width={110} tick={{ fontSize: 10 }} stroke="#30363d" />
                <Tooltip content={<Tip />} />
                <Bar dataKey="station_gain" name="Gain" fill={COLORS.cyan} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <ChartCard title="Station Age & Maintenance Risk" subtitle="Average age (years) and count of stations >5 years old — DC-fast sites only">
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
              <XAxis dataKey="avg_age" name="Avg Age (yrs)" tick={{ fontSize: 11 }} stroke="#30363d" unit=" yr" />
              <YAxis dataKey="older_than_5_years" name=">5yr Count" tick={{ fontSize: 11 }} stroke="#30363d" />
              <ZAxis range={[40, 200]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload as SQL2Q6Row;
                  return (
                    <div className="glass-card p-3 px-4 shadow-brutal border-accent-lime">
                      <p className="text-xs font-display font-semibold text-txt-primary mb-1">{d.state_abbrev}</p>
                      <p className="text-xs text-txt-secondary">Avg Age: <span className="font-semibold text-txt-primary">{d.avg_age} yrs</span></p>
                      <p className="text-xs text-txt-secondary">Older than 5yr: <span className="font-semibold text-txt-primary">{d.older_than_5_years}</span></p>
                    </div>
                  );
                }}
              />
              <Scatter data={ageChart} fill={COLORS.rose} opacity={0.7} />
            </ScatterChart>
          </ResponsiveContainer>
        </div>
      </ChartCard>

      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-txt-primary mb-4">Top Network Site Concentration</h3>
        <DataTable
          data={q5}
          columns={[
            { key: 'state_abbrev', label: 'State' },
            { key: 'new_sites', label: 'New Sites', format: (v) => Number(v).toLocaleString() },
          ]}
        />
      </div>

      <SqlViewer sql={SQL_CONTENT[2]} title="View SQL 2 — Infrastructure Growth" />
    </div>
  );
}
