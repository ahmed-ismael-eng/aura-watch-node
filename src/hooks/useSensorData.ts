import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, HistoryData } from '@/types/sensor';

/* =========================================================
   DEMO DATA GENERATORS
   ========================================================= */

const generateDemoData = (prev?: SensorData): SensorData => {
  const baseTemp = 23.5;
  const baseHumidity = 45;
  const basePressure = 1013.25;

  return {
    temperature:
      baseTemp +
      (Math.random() - 0.5) * 2 +
      (prev ? (prev.temperature - baseTemp) * 0.9 : 0),

    humidity: Math.min(
      100,
      Math.max(0, baseHumidity + (Math.random() - 0.5) * 5)
    ),

    pressure: basePressure + (Math.random() - 0.5) * 2,
    altitude: 20 + (Math.random() - 0.5) * 2,

    battery: 3.8 + (Math.random() - 0.5) * 0.2,
    battery_percent: Math.round(75 + (Math.random() - 0.5) * 10),

    free_heap: Math.round(35000 + Math.random() * 5000),
    heap_percent: Math.round(55 + Math.random() * 10),

    cpu_load: Math.round(15 + Math.random() * 20),

    wifi_rssi: Math.round(-55 + Math.random() * 20),
    wifi_quality: Math.round(75 + Math.random() * 20),

    uptime: prev ? prev.uptime + 2 : 3600,

    health: Math.random() > 0.9 ? 1 : 0,
    health_text: Math.random() > 0.9 ? 'Degraded' : 'Normal',
    health_class: Math.random() > 0.9 ? 'degraded' : 'normal',

    trend: Math.floor(Math.random() * 3),
    trend_text: ['Stable', 'Rising', 'Falling'][Math.floor(Math.random() * 3)],
    pressure_rate: (Math.random() - 0.5) * 2,

    profile: 1,
    profile_name: 'Balanced',
    runtime_text: '180 min',

    dht_valid: true,
    bmp_valid: true,
  };
};

const generateDemoHistory = (): HistoryData => {
  const temperature: number[] = [];
  const pressure: number[] = [];
  const battery: number[] = [];

  let t = 23;
  let p = 1013;
  let b = 4.0;

  for (let i = 0; i < 60; i++) {
    t += (Math.random() - 0.5) * 0.4;
    p += (Math.random() - 0.5) * 0.3;
    b -= Math.random() * 0.003;

    temperature.push(t);
    pressure.push(p);
    battery.push(b);
  }

  return { temperature, pressure, battery };
};

/* =========================================================
   OPTIONS
   ========================================================= */

interface UseSensorDataOptions {
  espAddress?: string;      // مثال: http://192.168.1.103
  refreshInterval?: number;
  demoMode?: boolean;
}

/* =========================================================
   MAIN HOOK
   ========================================================= */

export function useSensorData(options: UseSensorDataOptions = {}) {
  const {
    espAddress = 'http://192.168.1.103',
    refreshInterval = 2000,
    demoMode = false,
  } = options;

  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  const historyRef = useRef<HistoryData>(generateDemoHistory());

  /* =========================================================
     FETCH DATA
     ========================================================= */

  const fetchData = useCallback(async () => {
    /* ---------- DEMO MODE ---------- */
    if (demoMode) {
      setData(prev => {
        const newData = generateDemoData(prev ?? undefined);

        const h = historyRef.current;
        const newHistory: HistoryData = {
          temperature: [...h.temperature.slice(1), newData.temperature],
          pressure: [...h.pressure.slice(1), newData.pressure],
          battery: [...h.battery.slice(1), newData.battery],
        };

        historyRef.current = newHistory;
        setHistory(newHistory);

        return newData;
      });

      setIsConnected(true);
      setIsLoading(false);
      setLastUpdate(new Date());
      return;
    }

    /* ---------- REAL ESP ---------- */
    try {
      const [dataRes, historyRes] = await Promise.all([
        fetch(`${espAddress}/data`),
        fetch(`${espAddress}/history`),
      ]);

      if (!dataRes.ok || !historyRes.ok) {
        throw new Error('ESP not responding');
      }

      const sensorData: SensorData = await dataRes.json();
      const historyData: HistoryData = await historyRes.json();

      setData(sensorData);
      setHistory(historyData);
      historyRef.current = historyData;

      setIsConnected(true);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setIsConnected(false);
      setError(err instanceof Error ? err.message : 'Connection failed');
    } finally {
      setIsLoading(false);
    }
  }, [espAddress, demoMode]);

  /* =========================================================
     CONTROL COMMANDS
     ========================================================= */

  const sendCommand = useCallback(
    async (action: string, value?: number) => {
      if (demoMode) return { success: true };

      try {
        const res = await fetch(`${espAddress}/control`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action, value }),
        });
        return { success: res.ok };
      } catch {
        return { success: false };
      }
    },
    [espAddress, demoMode]
  );

  const calibrate = useCallback(async () => {
    if (demoMode) return { success: true, message: 'Demo calibration' };

    try {
      const res = await fetch(`${espAddress}/calibrate`, { method: 'POST' });
      const msg = await res.text();
      return { success: res.ok, message: msg };
    } catch {
      return { success: false, message: 'Calibration failed' };
    }
  }, [espAddress, demoMode]);

  const restart = useCallback(async () => {
    if (demoMode) return { success: true };

    try {
      await fetch(`${espAddress}/restart`, { method: 'POST' });
      return { success: true };
    } catch {
      return { success: false };
    }
  }, [espAddress, demoMode]);

  /* =========================================================
     AUTO REFRESH
     ========================================================= */

  useEffect(() => {
    fetchData();
    const id = setInterval(fetchData, refreshInterval);
    return () => clearInterval(id);
  }, [fetchData, refreshInterval]);

  /* =========================================================
     RETURN API
     ========================================================= */

  return {
    data,
    history,
    isConnected,
    isLoading,
    error,
    lastUpdate,
    sendCommand,
    calibrate,
    restart,
    refetch: fetchData,
  };
}
