import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoadingState from './components/LoadingState';

const Overview = lazy(() => import('./modules/Overview'));
const SQL1Module = lazy(() => import('./modules/SQL1Module'));
const SQL2Module = lazy(() => import('./modules/SQL2Module'));
const SQL3Module = lazy(() => import('./modules/SQL3Module'));
const SQL4Module = lazy(() => import('./modules/SQL4Module'));
const SQL5Module = lazy(() => import('./modules/SQL5Module'));
const GlobeModule = lazy(() => import('./modules/GlobeModule'));

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route
          index
          element={
            <Suspense fallback={<LoadingState />}>
              <Overview />
            </Suspense>
          }
        />
        <Route
          path="sql/1"
          element={
            <Suspense fallback={<LoadingState />}>
              <SQL1Module />
            </Suspense>
          }
        />
        <Route
          path="sql/2"
          element={
            <Suspense fallback={<LoadingState />}>
              <SQL2Module />
            </Suspense>
          }
        />
        <Route
          path="sql/3"
          element={
            <Suspense fallback={<LoadingState />}>
              <SQL3Module />
            </Suspense>
          }
        />
        <Route
          path="sql/4"
          element={
            <Suspense fallback={<LoadingState />}>
              <SQL4Module />
            </Suspense>
          }
        />
        <Route
          path="sql/5"
          element={
            <Suspense fallback={<LoadingState />}>
              <SQL5Module />
            </Suspense>
          }
        />
        <Route
          path="globe"
          element={
            <Suspense fallback={<LoadingState message="Loading 3D Globe..." />}>
              <GlobeModule />
            </Suspense>
          }
        />
      </Route>
    </Routes>
  );
}
