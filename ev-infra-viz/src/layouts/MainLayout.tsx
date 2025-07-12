import { Link, Outlet, NavLink } from 'react-router-dom'
import ParticlesBackground from '../components/ParticlesBackground'

export default function MainLayout() {
  const navItem = 'px-4 py-2 hover:text-neonStart transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neonB/70 rounded'
  return (
    <div className="min-h-screen bg-background text-white relative">
      <ParticlesBackground />
      <header className="backdrop-blur-14 bg-white/5 fixed w-full z-10">
        <nav className="max-w-7xl mx-auto flex items-center gap-4 h-14">
          <Link to="/" className="text-lg font-semibold ml-4">EV Infra Viz</Link>
          <div className="flex gap-4 ml-8">
            <NavLink to="/" end className={({ isActive }) => `${navItem} ${isActive ? 'text-neonStart' : ''}`}>Home</NavLink>
            <NavLink to="/map" className={({ isActive }) => `${navItem} ${isActive ? 'text-neonStart' : ''}`}>Map</NavLink>
            <NavLink to="/dashboard" className={navItem}>Dashboard</NavLink>
            <NavLink to="/networks" className={navItem}>Graph</NavLink>
          </div>
        </nav>
      </header>
      <main className="pt-16 relative z-0">
        <Outlet />
      </main>
    </div>
  )
} 