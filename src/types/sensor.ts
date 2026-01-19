export interface SensorData {
  temperature: number;
  humidity: number;
  pressure: number;
  altitude: number;
  battery: number;
  battery_percent: number;
  free_heap: number;
  heap_percent: number;
  cpu_load: number;
  wifi_rssi: number;
  wifi_quality: number;
  uptime: number;
  health: number;
  health_text: string;
  health_class: string;
  trend: number;
  trend_text: string;
  pressure_rate: number;
  profile: number;
  profile_name: string;
  runtime_text: string;
  dht_valid: boolean;
  bmp_valid: boolean;
}

export interface HistoryData {
  temperature: number[];
  pressure: number[];
  battery: number[];
}

export interface ChartDataPoint {
  index: number;
  value: number;
  timestamp?: string;
}

export type HealthState = 'normal' | 'degraded' | 'critical';
export type PowerProfile = 'Performance' | 'Balanced' | 'Ultra Low Power';
export type WeatherTrend = 'stable' | 'rising' | 'falling';
