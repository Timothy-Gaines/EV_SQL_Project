import { useState, useEffect, useRef } from 'react';
import { parseCSV } from '../data/csvParser';

interface UseCSVDataResult<T> {
  data: T[];
  loading: boolean;
  error: string | null;
}

const cache = new Map<string, unknown[]>();

export function useCSVData<T>(path: string): UseCSVDataResult<T> {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  useEffect(() => {
    abortRef.current = false;
    setLoading(true);
    setError(null);

    if (cache.has(path)) {
      setData(cache.get(path) as T[]);
      setLoading(false);
      return;
    }

    parseCSV<T>(path)
      .then((rows) => {
        if (!abortRef.current) {
          cache.set(path, rows as unknown[]);
          setData(rows);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!abortRef.current) {
          setError(err instanceof Error ? err.message : 'Failed to load data');
          setLoading(false);
        }
      });

    return () => {
      abortRef.current = true;
    };
  }, [path]);

  return { data, loading, error };
}

export function useMultiCSVData<T>(paths: string[]): UseCSVDataResult<T>[] {
  return paths.map((p) => useCSVData<T>(p));
}
