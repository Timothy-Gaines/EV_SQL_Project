import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area,
} from 'recharts';
import { ArrowRight, Zap, MapPin, TrendingUp, Building2, Network, Plug, Globe2 } from 'lucide-react';
import { useCSVData } from '../hooks/useCSVData';
import { getCSVPath } from '../data/manifest';
import { SQL_MODULES } from '../data/manifest';
import type { SQL1Q1Row, SQL1Q3Row } from '../types/data';
import StatCard from '../components/StatCard';
import ChartCard from '../components/ChartCard';
import LoadingState from '../components/LoadingState';

const CHART_COLORS = {
  teal: '#ccff00',
  tealDim: '#00b880',
  amber: '#ff3f00',
  violet: '#b05cff',
  cyan: '#00e5ff',
  rose: '#ff0077',
};

const NAV_ICONS = [TrendingUp, Building2, Network, Plug, MapPin];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card p-3 px-4 shadow-brutal border-accent-lime">
      <p className="text-xs font-display font-semibold text-txt-primary mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-txt-secondary">
          <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: entry.color }} />
          {entry.name}: <span className="font-semibold text-txt-primary">{Number(entry.value).toLocaleString()}</span>
        </p>
      ))}
    </div>
  );
};

export default function Overview() {
  const { data: annualData, loading: l1 } = useCSVData<SQL1Q1Row>(
    getCSVPath('1.Infrastructure_Growth_&_market_Momentum_q1.csv'),
  );
  const { data: networkData, loading: l3 } = useCSVData<SQL1Q3Row>(
    getCSVPath('1.Infrastructure_Growth_&_market_Momentum_q3.csv'),
  );

  const chartData = useMemo(
    () =>
      [...annualData]
        .filter((r) => r.year && r.year >= 2010 && r.year < 2025)
        .sort((a, b) => a.year - b.year),
    [annualData],
  );

  const topNetworks = useMemo(
    () => networkData.slice(0, 8),
    [networkData],
  );

  const totalStations = useMemo(
    () => annualData.reduce((sum, r) => sum + (r.total_stations || 0), 0),
    [annualData],
  );

  const latestYear = useMemo(
    () => chartData.length ? chartData[chartData.length - 1] : null,
    [chartData],
  );

  if (l1 || l3) return <LoadingState />;

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h2 className="text-4xl font-display font-bold tracking-tight mb-2">
          EV Charging Infrastructure
        </h2>
        <p className="text-txt-secondary text-sm max-w-2xl leading-relaxed">
          Comprehensive analysis of {totalStations.toLocaleString()} EV charging stations across the United States.
          Powered by 5 SQL query modules analyzing growth, markets, technology, and geographic coverage.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Stations"
          value={totalStations.toLocaleString()}
          sublabel="All-time cumulative"
          icon={<Zap size={20} />}
        />
        <StatCard
          label="Latest Year"
          value={latestYear?.total_stations.toLocaleString() ?? '—'}
          sublabel={`Added in ${latestYear?.year ?? '—'}`}
          icon={<TrendingUp size={20} />}
          accentColor="accent-orange"
        />
        <StatCard
          label="Top Network"
          value={topNetworks[0]?.ev_network ?? '—'}
          sublabel={`${topNetworks[0]?.total_stations_added.toLocaleString() ?? 0} stations since 2020`}
          icon={<Network size={20} />}
          accentColor="accent-purple"
        />
        <StatCard
          label="Networks Active"
          value={networkData.length}
          sublabel="Distinct operators since 2020"
          icon={<Building2 size={20} />}
          accentColor="accent-cyan"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Annual Station Growth" subtitle="New stations opened per year (2010–2024)">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={CHART_COLORS.teal} stopOpacity={0.3} />
                    <stop offset="100%" stopColor={CHART_COLORS.teal} stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="year" tick={{ fontSize: 11 }} stroke="#30363d" />
                <YAxis tick={{ fontSize: 11 }} stroke="#30363d" />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="total_stations"
                  name="Stations"
                  stroke={CHART_COLORS.teal}
                  strokeWidth={2}
                  fill="url(#tealGrad)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        <ChartCard title="Top Networks Since 2020" subtitle="Stations added by charging network">
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={topNetworks}
                layout="vertical"
                margin={{ top: 0, right: 20, left: 10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} stroke="#30363d" />
                <YAxis
                  dataKey="ev_network"
                  type="category"
                  width={120}
                  tick={{ fontSize: 10 }}
                  stroke="#30363d"
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="total_stations_added" name="Total" fill={CHART_COLORS.teal} radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </div>

      <div>
        <h3 className="text-lg font-display font-semibold mb-4">SQL Analysis Modules</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {SQL_MODULES.map((mod, i) => {
            const Icon = NAV_ICONS[i];
            const colorValues = ['#ccff00', '#ff3f00', '#b05cff', '#00e5ff', '#ff0077'];
            const cv = colorValues[i];
            return (
              <Link
                key={mod.id}
                to={`/sql/${mod.id}`}
                className="glass-card-hover p-5 group cursor-pointer block"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${cv}15` }}>
                    <Icon size={16} style={{ color: cv }} />
                  </div>
                  <span className="text-[10px] font-display font-bold tracking-widest" style={{ color: cv }}>
                    SQL {mod.id}
                  </span>
                </div>
                <h4 className="text-sm font-display font-semibold text-txt-primary mb-2">
                  {mod.title}
                </h4>
                <p className="text-xs text-txt-secondary leading-relaxed line-clamp-2 mb-3">
                  {mod.description}
                </p>
                <span className="inline-flex items-center gap-1 text-xs text-accent-lime/80 group-hover:text-accent-lime transition-colors">
                  Explore <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            );
          })}
          <Link
            to="/globe"
            className="glass-card-hover p-5 group cursor-pointer block border-accent-lime/10"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-8 h-8 rounded-lg bg-accent-lime/10 flex items-center justify-center">
                <Globe2 size={16} className="text-accent-lime" />
              </div>
              <span className="text-[10px] font-display font-bold tracking-widest text-accent-lime">
                3D GLOBE
              </span>
            </div>
            <h4 className="text-sm font-display font-semibold text-txt-primary mb-2">
              Interactive Station Map
            </h4>
            <p className="text-xs text-txt-secondary leading-relaxed line-clamp-2 mb-3">
              Explore 54,000+ stations on an interactive 3D globe with filters for network, charger type, and state.
            </p>
            <span className="inline-flex items-center gap-1 text-xs text-accent-lime/80 group-hover:text-accent-lime transition-colors">
              Launch Globe <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
