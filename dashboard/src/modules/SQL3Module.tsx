import { useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell,
} from 'recharts';
import { useCSVData } from '../hooks/useCSVData';
import { getCSVPath, SQL_MODULES } from '../data/manifest';
import { SQL_CONTENT } from '../data/sqlContent';
import type { SQL3Q1Row, SQL3Q2Row, SQL3Q4Row } from '../types/data';
import ModuleHeader from '../components/ModuleHeader';
import ChartCard from '../components/ChartCard';
import SqlViewer from '../components/SqlViewer';
import StatCard from '../components/StatCard';
import DataTable from '../components/DataTable';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Crown, Zap, Gift } from 'lucide-react';

const COLORS = { teal: '#ccff00', amber: '#ff3f00', violet: '#b05cff', cyan: '#00e5ff', rose: '#ff0077' };

const NETWORK_COLORS: Record<string, string> = {
  'Tesla': '#e74c3c',
  'ChargePoint Network': '#00aaff',
  'Blink Network': '#00cc66',
  'Electrify America': '#ffcc00',
  'EV Connect': '#ff6600',
  'Non-Networked': '#888888',
};

const Tip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 px-4 shadow-brutal border-accent-lime">
      <p className="text-xs font-display font-semibold text-txt-primary mb-1">{label}</p>
      {payload.map((e: any, i: number) => (
        <p key={i} className="text-xs text-txt-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ background: e.color }} />
          {e.name}: <span className="font-semibold text-txt-primary">{typeof e.value === 'number' ? e.value.toLocaleString() : e.value}{typeof e.value === 'number' && e.name?.includes('%') ? '%' : ''}</span>
        </p>
      ))}
    </div>
  );
};

export default function SQL3Module() {
  const mod = SQL_MODULES[2];
  const { data: q1, loading: l1, error: e1 } = useCSVData<SQL3Q1Row>(getCSVPath(mod.csvFiles[0]));
  const { data: q2, loading: l2, error: e2 } = useCSVData<SQL3Q2Row>(getCSVPath(mod.csvFiles[1]));
  const { data: q3, loading: l3, error: e3 } = useCSVData<SQL3Q2Row>(getCSVPath(mod.csvFiles[2]));
  const { data: q4, loading: l4, error: e4 } = useCSVData<SQL3Q4Row>(getCSVPath(mod.csvFiles[3]));

  const marketShareChart = useMemo(() =>
    [...q1].sort((a, b) => b.market_share_pct - a.market_share_pct).slice(0, 20),
    [q1],
  );

  const topNetworksByState = useMemo(() => {
    const counts: Record<string, number> = {};
    q1.forEach(r => { counts[r.top_network] = (counts[r.top_network] || 0) + 1; });
    return Object.entries(counts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 8)
      .map(([network, stateCount]) => ({ network, stateCount }));
  }, [q1]);

  const freeChart = useMemo(() =>
    q4.filter(r => r.pct_share_of_free >= 30).slice(0, 15),
    [q4],
  );

  const loading = l1 || l2 || l3 || l4;
  const error = e1 || e2 || e3 || e4;
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
          label="Top Builder (All)"
          value={q2[0]?.ev_network ?? '—'}
          sublabel={q2[0] ? `${q2[0].new_stations.toLocaleString()} stations in 12 months` : ''}
          icon={<Crown size={20} />}
        />
        <StatCard
          label="Top Builder (DC-Fast)"
          value={q3[0]?.ev_network ?? '—'}
          sublabel={q3[0] ? `${q3[0].new_stations.toLocaleString()} DC-fast stations` : ''}
          icon={<Zap size={20} />}
          accentColor="accent-orange"
        />
        <StatCard
          label="States w/ Free >5%"
          value={new Set(q4.map(r => r.state_abbrev)).size}
          sublabel="States where free charging >5% of sites"
          icon={<Gift size={20} />}
          accentColor="accent-purple"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="DC-Fast Market Leader by State" subtitle="Top 20 states by dominant network market share">
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={marketShareChart} layout="vertical" margin={{ top: 0, right: 20, left: 5, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" domain={[0, 100]} unit="%" />
                <YAxis dataKey="state_abbrev" type="category" width={40} tick={{ fontSize: 10 }} stroke="#30363d" />
                <Tooltip content={<Tip />} />
                <Bar dataKey="market_share_pct" name="Market Share %" radius={[0, 4, 4, 0]}>
                  {marketShareChart.map((r, i) => (
                    <Cell key={i} fill={NETWORK_COLORS[r.top_network] || COLORS.teal} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Network Dominance" subtitle="How many states each network leads in DC-fast">
          <div className="h-[420px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topNetworksByState} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" />
                <YAxis dataKey="network" type="category" width={130} tick={{ fontSize: 10 }} stroke="#30363d" />
                <Tooltip content={<Tip />} />
                <Bar dataKey="stateCount" name="States Led" fill={COLORS.violet} radius={[0, 4, 4, 0]}>
                  {topNetworksByState.map((r, i) => (
                    <Cell key={i} fill={NETWORK_COLORS[r.network] || COLORS.violet} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-sm font-display font-semibold text-txt-primary mb-4">Free Charging Strongholds</h3>
        <p className="text-xs text-txt-secondary mb-4">States where free stations account for &gt;5% of all sites — dominant free-charging networks</p>
        <DataTable
          data={q4}
          columns={[
            { key: 'state_abbrev', label: 'State' },
            { key: 'dominating_network', label: 'Network' },
            { key: 'network_free_count', label: 'Free Stations', format: (v) => Number(v).toLocaleString() },
            { key: 'total_free_stations', label: 'Total Free', format: (v) => Number(v).toLocaleString() },
            { key: 'pct_share_of_free', label: 'Share %', format: (v) => `${Number(v).toFixed(1)}%` },
          ]}
          pageSize={12}
        />
      </div>

      <SqlViewer sql={SQL_CONTENT[3]} title="View SQL 3 — Market & Network Landscape" />
    </div>
  );
}
