import { useState, useEffect, useCallback, useRef } from "react";

export function usePolling(fetchFn, mockData, intervalMs = 8000) {
  const [data, setData] = useState(mockData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [backendOnline, setBackendOnline] = useState(false);
  const mounted = useRef(true);

  const fetchData = useCallback(async () => {
    try {
      const result = await fetchFn();
      if (mounted.current) {
        setData(result);
        setBackendOnline(true);
        setError(null);
      }
    } catch (err) {
      if (mounted.current) {
        setBackendOnline(false);
        setError(err.message);
        // Keep showing mock/previous data on failure
      }
    } finally {
      if (mounted.current) setLoading(false);
    }
  }, [fetchFn]);

  useEffect(() => {
    mounted.current = true;
    fetchData();
    const id = setInterval(fetchData, intervalMs);
    return () => {
      mounted.current = false;
      clearInterval(id);
    };
  }, [fetchData, intervalMs]);

  return { data, loading, error, backendOnline, refetch: fetchData };
}
