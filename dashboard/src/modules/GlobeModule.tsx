import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { parseStationsCSV } from '../data/csvParser';
import { getStationsPath } from '../data/manifest';
import LoadingState from '../components/LoadingState';
import ErrorState from '../components/ErrorState';
import { Filter, X, MapPin, Zap, Radio } from 'lucide-react';

interface StationPoint {
  lat: number;
  lng: number;
  name: string;
  city: string;
  state: string;
  network: string;
  dcFast: number;
  level2: number;
  level1: number;
  color: string;
  size: number;
}

interface RawStation {
  latitude: number;
  longitude: number;
  station_name: string;
  city: string;
  state_abbrev: string;
  ev_network: string;
  ev_dc_fast_count: number;
  ev_level2_evse_num: number;
  ev_level1_evse_num: number;
}

const NETWORK_COLORS: Record<string, string> = {
  'Tesla': '#e74c3c',
  'ChargePoint Network': '#00aaff',
  'Blink Network': '#27ae60',
  'Electrify America': '#f1c40f',
  'EV Connect': '#e67e22',
  'Non-Networked': '#95a5a6',
  'SHELL_RECHARGE': '#e8a400',
  'eVgo Network': '#00b4d8',
  'FLO': '#6c5ce7',
};

function getColor(station: RawStation): string {
  if (NETWORK_COLORS[station.ev_network]) return NETWORK_COLORS[station.ev_network];
  if (station.ev_dc_fast_count > 0) return '#ccff00';
  if (station.ev_level2_evse_num > 0) return '#ff3f00';
  return '#b05cff';
}

function getSize(station: RawStation): number {
  const total = (station.ev_dc_fast_count || 0) + (station.ev_level2_evse_num || 0) + (station.ev_level1_evse_num || 0);
  if (total > 20) return 0.35;
  if (total > 10) return 0.25;
  if (total > 4) return 0.18;
  return 0.12;
}

export default function GlobeModule() {
  const [stations, setStations] = useState<StationPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [GlobeComponent, setGlobeComponent] = useState<any>(null);

  const [stateFilter, setStateFilter] = useState('');
  const [networkFilter, setNetworkFilter] = useState('');
  const [dcFastOnly, setDcFastOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<StationPoint | null>(null);
  const globeRef = useRef<any>(null);

  useEffect(() => {
    import('react-globe.gl')
      .then((mod) => setGlobeComponent(() => mod.default))
      .catch(() => setError('Failed to load globe library'));
  }, []);

  useEffect(() => {
    parseStationsCSV<RawStation>(getStationsPath())
      .then((rows) => {
        const points: StationPoint[] = [];
        for (const r of rows) {
          if (!r.latitude || !r.longitude || r.latitude < 17 || r.latitude > 72 || r.longitude < -180 || r.longitude > -60) continue;
          points.push({
            lat: r.latitude,
            lng: r.longitude,
            name: r.station_name || 'Unknown Station',
            city: r.city || '',
            state: r.state_abbrev || '',
            network: r.ev_network || 'Unknown',
            dcFast: r.ev_dc_fast_count || 0,
            level2: r.ev_level2_evse_num || 0,
            level1: r.ev_level1_evse_num || 0,
            color: getColor(r),
            size: getSize(r),
          });
        }
        setStations(points);
        setLoading(false);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : 'Failed to load station data');
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView({ lat: 39.8, lng: -98.5, altitude: 2.2 }, 1000);
    }
  }, [GlobeComponent, loading]);

  const availableStates = useMemo(() =>
    [...new Set(stations.map(s => s.state))].filter(Boolean).sort(),
    [stations],
  );

  const availableNetworks = useMemo(() =>
    [...new Set(stations.map(s => s.network))].filter(Boolean).sort(),
    [stations],
  );

  const filteredStations = useMemo(() => {
    let data = stations;
    if (stateFilter) data = data.filter(s => s.state === stateFilter);
    if (networkFilter) data = data.filter(s => s.network === networkFilter);
    if (dcFastOnly) data = data.filter(s => s.dcFast > 0);
    return data;
  }, [stations, stateFilter, networkFilter, dcFastOnly]);

  const handlePointClick = useCallback((point: any) => {
    setSelected(point as StationPoint);
  }, []);

  const clearFilters = () => {
    setStateFilter('');
    setNetworkFilter('');
    setDcFastOnly(false);
  };

  const hasFilters = stateFilter || networkFilter || dcFastOnly;

  if (loading || !GlobeComponent) return <LoadingState message="Loading 54,000+ stations..." />;
  if (error) return <ErrorState message={error} />;

  const Globe = GlobeComponent;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="section-title text-3xl">3D Station Globe</h2>
          <p className="text-sm text-txt-secondary mt-1">
            {filteredStations.length.toLocaleString()} stations
            {hasFilters ? ' (filtered)' : ''} &middot; Rotate, zoom, and click markers
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${
            showFilters || hasFilters
              ? 'bg-accent-lime/15 text-accent-lime border border-accent-lime/30'
              : 'bg-base-700/50 text-txt-secondary border border-base-600/40 hover:text-txt-primary'
          }`}
        >
          <Filter size={16} />
          Filters{hasFilters ? ' (active)' : ''}
        </button>
      </div>

      {showFilters && (
        <div className="glass-card p-5 flex flex-wrap items-end gap-4">
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-txt-muted mb-1.5">State</label>
            <select
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              className="w-full bg-base-700 border border-base-600/60 rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-accent-lime/50"
            >
              <option value="">All States</option>
              {availableStates.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="flex-1 min-w-[180px]">
            <label className="block text-[10px] font-semibold uppercase tracking-wider text-txt-muted mb-1.5">Network</label>
            <select
              value={networkFilter}
              onChange={(e) => setNetworkFilter(e.target.value)}
              className="w-full bg-base-700 border border-base-600/60 rounded-lg px-3 py-2 text-sm text-txt-primary focus:outline-none focus:border-accent-lime/50"
            >
              <option value="">All Networks</option>
              {availableNetworks.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
          <label className="flex items-center gap-2 cursor-pointer py-2">
            <input
              type="checkbox"
              checked={dcFastOnly}
              onChange={(e) => setDcFastOnly(e.target.checked)}
              className="w-4 h-4 rounded bg-base-700 border-base-600 text-accent-lime focus:ring-accent-lime/30"
            />
            <span className="text-sm text-txt-secondary">DC-Fast only</span>
          </label>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-3 py-2 rounded-lg text-xs text-accent-pink hover:bg-accent-pink/10 transition-colors cursor-pointer"
            >
              <X size={14} /> Clear
            </button>
          )}
        </div>
      )}

      <div className="glass-card overflow-hidden relative" style={{ height: '65vh', minHeight: 500 }}>
        <Globe
          ref={globeRef}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
          backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
          pointsData={filteredStations}
          pointLat="lat"
          pointLng="lng"
          pointColor="color"
          pointRadius="size"
          pointAltitude={0.005}
          pointLabel={(d: any) => {
            const p = d as StationPoint;
            return `<div style="background:#161b22;border:1px solid #30363d;border-radius:8px;padding:8px 12px;font-family:DM Sans;font-size:12px;color:#e6edf3;max-width:250px;">
              <div style="font-weight:600;margin-bottom:4px">${p.name}</div>
              <div style="color:#8b949e">${p.city}, ${p.state}</div>
              <div style="color:#8b949e">${p.network}</div>
              <div style="margin-top:4px;display:flex;gap:8px">
                ${p.dcFast ? `<span style="color:#ccff00">DC: ${p.dcFast}</span>` : ''}
                ${p.level2 ? `<span style="color:#ff3f00">L2: ${p.level2}</span>` : ''}
                ${p.level1 ? `<span style="color:#b05cff">L1: ${p.level1}</span>` : ''}
              </div>
            </div>`;
          }}
          onPointClick={handlePointClick}
          atmosphereColor="#ccff00"
          atmosphereAltitude={0.15}
          animateIn
          width={typeof window !== 'undefined' ? Math.min(window.innerWidth - 320, 1200) : 1000}
          height={Math.max(500, typeof window !== 'undefined' ? window.innerHeight * 0.65 : 600)}
        />

        {selected && (
          <div className="absolute bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-80 glass-card p-4 z-10">
            <div className="flex items-start justify-between mb-2">
              <h4 className="text-sm font-display font-semibold text-txt-primary pr-4">{selected.name}</h4>
              <button onClick={() => setSelected(null)} className="text-txt-muted hover:text-txt-primary cursor-pointer shrink-0">
                <X size={16} />
              </button>
            </div>
            <div className="space-y-1.5 text-xs text-txt-secondary">
              <div className="flex items-center gap-2"><MapPin size={12} />{selected.city}, {selected.state}</div>
              <div className="flex items-center gap-2"><Radio size={12} />{selected.network}</div>
              <div className="flex items-center gap-3 mt-2">
                {selected.dcFast > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent-lime/10 text-accent-lime text-[11px] font-medium">
                    <Zap size={11} /> DC-Fast: {selected.dcFast}
                  </span>
                )}
                {selected.level2 > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent-orange/10 text-accent-orange text-[11px] font-medium">
                    Level 2: {selected.level2}
                  </span>
                )}
                {selected.level1 > 0 && (
                  <span className="flex items-center gap-1 px-2 py-1 rounded bg-accent-purple/10 text-accent-purple text-[11px] font-medium">
                    Level 1: {selected.level1}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="absolute top-4 left-4 flex flex-wrap gap-2 z-10">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-800/80 backdrop-blur-sm text-[10px] text-txt-secondary border border-base-600/30">
            <span className="w-2 h-2 rounded-full bg-[#e74c3c]" /> Tesla
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-800/80 backdrop-blur-sm text-[10px] text-txt-secondary border border-base-600/30">
            <span className="w-2 h-2 rounded-full bg-[#00aaff]" /> ChargePoint
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-800/80 backdrop-blur-sm text-[10px] text-txt-secondary border border-base-600/30">
            <span className="w-2 h-2 rounded-full bg-[#f1c40f]" /> Electrify America
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-800/80 backdrop-blur-sm text-[10px] text-txt-secondary border border-base-600/30">
            <span className="w-2 h-2 rounded-full bg-accent-lime" /> DC-Fast (other)
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-base-800/80 backdrop-blur-sm text-[10px] text-txt-secondary border border-base-600/30">
            <span className="w-2 h-2 rounded-full bg-accent-orange" /> Level 2
          </span>
        </div>
      </div>
    </div>
  );
}
