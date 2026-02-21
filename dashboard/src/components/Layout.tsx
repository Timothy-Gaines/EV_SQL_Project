import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Navigation from './Navigation';
import { Menu, X } from 'lucide-react';

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden bg-base-900 bg-grid-pattern bg-grid">
      <div
        className={`fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity md:hidden ${
          sidebarOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden="true"
      />

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 md:relative md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <Navigation onClose={() => setSidebarOpen(false)} />
      </aside>

      <main className="flex-1 overflow-y-auto scroll-smooth">
        <div className="md:hidden sticky top-0 z-30 flex items-center gap-3 px-4 py-3 bg-base-800/90 backdrop-blur-md border-b border-base-600/40">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg text-txt-secondary hover:text-txt-primary hover:bg-base-700/50 transition-colors cursor-pointer"
            aria-label="Open navigation"
          >
            <Menu size={20} />
          </button>
          <span className="font-display font-semibold text-sm text-accent-lime tracking-wide">
            EV CHARGING ANALYTICS
          </span>
        </div>

        <div className="px-6 py-8 md:px-10 md:py-10 max-w-[1600px] mx-auto">
          <Outlet />
        </div>
      </main>

      {sidebarOpen && (
        <button
          onClick={() => setSidebarOpen(false)}
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-base-700 text-txt-primary md:hidden cursor-pointer"
          aria-label="Close navigation"
        >
          <X size={18} />
        </button>
      )}
    </div>
  );
}
