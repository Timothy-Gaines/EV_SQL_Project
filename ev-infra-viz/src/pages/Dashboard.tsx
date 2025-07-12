import { useInfraStats } from '../hooks/useInfraStats'

export default function Dashboard() {
  const { data } = useInfraStats()

  return (
    <section className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-semibold mb-6">Infrastructure Dashboard</h1>
      {!data ? (
        <p className="text-neonA">Loading data…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white/5 p-6 backdrop-blur-14 ring-1 ring-white/10">
            <p className="text-sm uppercase tracking-wide text-neonB mb-2">Total Stations</p>
            <p className="text-2xl font-bold">{data.totalStations.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-6 backdrop-blur-14 ring-1 ring-white/10">
            <p className="text-sm uppercase tracking-wide text-neonB mb-2">DC Fast</p>
            <p className="text-2xl font-bold">{data.dcFastStations.toLocaleString()}</p>
          </div>
          <div className="rounded-xl bg-white/5 p-6 backdrop-blur-14 ring-1 ring-white/10">
            <p className="text-sm uppercase tracking-wide text-neonB mb-2">States Covered</p>
            <p className="text-2xl font-bold">{data.statesCovered}</p>
          </div>
        </div>
      )}
    </section>
  )
} 