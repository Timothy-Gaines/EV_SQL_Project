import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  TrendingUp,
  Building2,
  Network,
  Plug,
  MapPin,
  Globe2,
} from 'lucide-react';
import { SQL_MODULES } from '../data/manifest';

const NAV_ICONS = [TrendingUp, Building2, Network, Plug, MapPin];

interface NavigationProps {
  onClose?: () => void;
}

export default function Navigation({ onClose }: NavigationProps) {
  return (
    <nav className="h-full flex flex-col bg-base-800 border-r border-base-600/40">
      <div className="px-6 py-6 border-b border-base-600/30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-accent-lime/10 flex items-center justify-center">
            <Plug size={18} className="text-accent-lime" />
          </div>
          <div>
            <h1 className="font-display font-bold text-sm tracking-wide text-txt-primary">
              EV CHARGING
            </h1>
            <p className="text-[10px] font-medium tracking-widest text-accent-lime/70 uppercase">
              Analytics Dashboard
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <LayoutDashboard size={18} />
          <span>Overview</span>
        </NavLink>

        <div className="pt-4 pb-2 px-4">
          <p className="text-[10px] font-semibold tracking-widest text-txt-muted uppercase">
            SQL Modules
          </p>
        </div>

        {SQL_MODULES.map((mod, i) => {
          const Icon = NAV_ICONS[i];
          return (
            <NavLink
              key={mod.id}
              to={`/sql/${mod.id}`}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={18} />
              <div className="min-w-0">
                <span className="block text-[10px] font-semibold text-accent-lime/60 tracking-wider">
                  SQL {mod.id}
                </span>
                <span className="block truncate text-xs">{mod.title}</span>
              </div>
            </NavLink>
          );
        })}

        <div className="pt-4 pb-2 px-4">
          <p className="text-[10px] font-semibold tracking-widest text-txt-muted uppercase">
            Visualization
          </p>
        </div>

        <NavLink
          to="/globe"
          className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          onClick={onClose}
        >
          <Globe2 size={18} />
          <span>3D Station Globe</span>
        </NavLink>
      </div>

      <div className="px-5 py-4 border-t border-base-600/30">
        <p className="text-[10px] text-txt-muted leading-relaxed">
          Data: US DOE AFDC &middot; Jun 2025
          <br />
          54,000+ stations analyzed
        </p>
      </div>
    </nav>
  );
}
