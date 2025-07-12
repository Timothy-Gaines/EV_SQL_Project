import { StrictMode, Suspense, lazy } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider, Navigate } from 'react-router-dom'
import './index.css'

const MainLayout = lazy(() => import('./layouts/MainLayout.tsx'))
const Landing = lazy(() => import('./pages/Landing.tsx'))
const CoverageMap = lazy(() => import('./pages/CoverageMap.tsx'))
const Dashboard = lazy(() => import('./pages/Dashboard.tsx'))

const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<div className="text-center mt-10">Loading…</div>}>
        <MainLayout />
      </Suspense>
    ),
    children: [
      { index: true, element: (
          <Suspense fallback={<div className="text-center mt-10">Loading…</div>}>
            <Landing />
          </Suspense>
        ) },
      { path: 'map', element: (
          <Suspense fallback={<div className="text-center mt-10">Loading…</div>}>
            <CoverageMap />
          </Suspense>
        ) },
      { path: 'dashboard', element: (
          <Suspense fallback={<div className="text-center mt-10">Loading…</div>}>
            <Dashboard />
          </Suspense>
        ) },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
