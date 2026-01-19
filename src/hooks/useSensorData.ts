import { useState, useEffect, useCallback, useRef } from 'react';
import { SensorData, HistoryData } from '@/types/sensor';

// Demo mode - simulates ESP8266 data when not connected
const generateDemoData = (prevData?: SensorData): SensorData => {
  const baseTemp = 23.5;
  const baseHumidity = 45;
  const basePressure = 1013.25;
  
  return {
    temperature: baseTemp + (Math.random() - 0.5) * 2 + (prevData?.temperature ? (prevData.temperature - baseTemp) * 0.9 : 0),
    humidity: Math.min(100, Math.max(0, baseHumidity + (Math.random() - 0.5) * 5)),
    pressure: basePressure + (Math.random() - 0.5) * 2,
    altitude: 20 + (Math.random() - 0.5) * 2,
    battery: 3.8 + (Math.random() - 0.5) * 0.2,
    battery_percent: Math.round(75 + (Math.random() - 0.5) * 10),
    free_heap: Math.round(35000 + Math.random() * 5000),
    heap_percent: Math.round(55 + Math.random() * 10),
    cpu_load: Math.round(15 + Math.random() * 20),
    wifi_rssi: Math.round(-55 + Math.random() * 20),
    wifi_quality: Math.round(75 + Math.random() * 20),
    uptime: prevData ? prevData.uptime + 2 : 3600,
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
  
  let temp = 23;
  let press = 1013;
  let bat = 4.0;
  
  for (let i = 0; i < 60; i++) {
    temp += (Math.random() - 0.5) * 0.5;
    press += (Math.random() - 0.5) * 0.3;
    bat -= Math.random() * 0.005;
    
    temperature.push(temp);
    pressure.push(press);
    battery.push(bat);
  }
  
  return { temperature, pressure, battery };
};

interface UseSensorDataOptions {
  espAddress?: string;
  refreshInterval?: number;
  demoMode?: boolean;
}

export function useSensorData(options: UseSensorDataOptions = {}) {
  const { 
    espAddress = '', 
    refreshInterval = 2000,
    demoMode = true 
  } = options;
  
  const [data, setData] = useState<SensorData | null>(null);
  const [history, setHistory] = useState<HistoryData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  
  const historyRef = useRef<HistoryData>(generateDemoHistory());

  const fetchData = useCallback(async () => {
    if (demoMode || !espAddress) {
      // Demo mode
      setData(prev => generateDemoData(prev ?? undefined));
      
      // Update history with new data point
      if (historyRef.current) {
        const newHistory = { ...historyRef.current };
        newHistory.temperature = [...newHistory.temperature.slice(1), data?.temperature ?? 23];
        newHistory.pressure = [...newHistory.pressure.slice(1), data?.pressure ?? 1013];
        newHistory.battery = [...newHistory.battery.slice(1), data?.battery ?? 3.8];
        historyRef.current = newHistory;
        setHistory(newHistory);
      }
      
      setIsConnected(true);
      setIsLoading(false);
      setLastUpdate(new Date());
      return;
    }

    try {
      const [dataResponse, historyResponse] = await Promise.all([
        fetch(`${espAddress}/data`),
        fetch(`${espAddress}/history`)
      ]);

      if (!dataResponse.ok || !historyResponse.ok) {
        throw new Error('Failed to fetch data');
      }

      const sensorData = await dataResponse.json();
      const historyData = await historyResponse.json();

      setData(sensorData);
      setHistory(historyData);
      setIsConnected(true);
      setError(null);
      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Connection failed');
      setIsConnected(false);
    } finally {
      setIsLoading(false);
    }
  }, [espAddress, demoMode, data?.temperature, data?.pressure, data?.battery]);

  const sendCommand = useCallback(async (action: string, value?: number) => {
    if (demoMode || !espAddress) {
      console.log('Demo mode: Command', action, value);
      return { success: true };
    }

    try {
      const response = await fetch(`${espAddress}/control`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, value })
      });
      return { success: response.ok };
    } catch {
      return { success: false, error: 'Command failed' };
    }
  }, [espAddress, demoMode]);

  const calibrate = useCallback(async () => {
    if (demoMode || !espAddress) {
      return { success: true, message: 'Calibration simulated' };
    }

    try {
      const response = await fetch(`${espAddress}/calibrate`, { method: 'POST' });
      const message = await response.text();
      return { success: response.ok, message };
    } catch {
      return { success: false, message: 'Calibration failed' };
    }
  }, [espAddress, demoMode]);

  const restart = useCallback(async () => {
    if (demoMode || !espAddress) {
      return { success: true };
    }

    try {
      await fetch(`${espAddress}/restart`, { method: 'POST' });
      return { success: true };
    } catch {
      return { success: false };
    }
  }, [espAddress, demoMode]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, refreshInterval);
    return () => clearInterval(interval);
  }, [fetchData, refreshInterval]);

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
    refetch: fetchData
  };
}
