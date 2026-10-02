import { useState, useEffect, useCallback } from 'react';

// ✅ Simple in-memory cache
const cache = new Map();

export const useCache = (key, fetchFn, ttl = 300000) => { // 5 minutes default
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async (forceRefresh = false) => {
    // Check cache first
    if (!forceRefresh && cache.has(key)) {
      const cached = cache.get(key);
      if (Date.now() - cached.timestamp < ttl) {
        console.log(`📦 Cache hit: ${key}`);
        setData(cached.data);
        setLoading(false);
        return;
      }
    }

    console.log(`📦 Cache miss: ${key}`);
    setLoading(true);
    try {
      const result = await fetchFn();
      cache.set(key, { data: result, timestamp: Date.now() });
      setData(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [key, fetchFn, ttl]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return { data, loading, error, refetch: () => fetchData(true) };
};

// ✅ Clear cache for specific key or all
export const clearCache = (key) => {
  if (key) {
    cache.delete(key);
  } else {
    cache.clear();
  }
};