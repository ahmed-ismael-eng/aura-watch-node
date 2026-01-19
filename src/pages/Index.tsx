import { useState } from 'react';
import { 
  Thermometer, 
  Droplets, 
  Gauge, 
  Mountain,
  Satellite,
  Settings
} from 'lucide-react';
import { useSensorData } from '@/hooks/useSensorData';
import { SensorCard } from '@/components/dashboard/SensorCard';
import { StatusBar } from '@/components/dashboard/StatusBar';
import { HistoryChart } from '@/components/dashboard/HistoryChart';
import { ControlPanel } from '@/components/dashboard/ControlPanel';
import { BatteryGauge } from '@/components/dashboard/BatteryGauge';
import { SystemStatsCard } from '@/components/dashboard/SystemStatsCard';
import { MiniSparkline } from '@/components/dashboard/MiniSparkline';

const Index = () => {
  const [espAddress] = useState('');
  const { 
    data, 
    history, 
    isConnected, 
    isLoading, 
    lastUpdate,
    sendCommand,
    calibrate,
    restart
  } = useSensorData({ espAddress, demoMode: true });

  const getTrendDirection = (trend: number): 'up' | 'down' | 'stable' => {
    if (trend === 1) return 'up';
    if (trend === 2) return 'down';
    return 'stable';
  };

  if (isLoading || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Satellite className="w-16 h-16 text-primary mx-auto mb-4 animate-pulse" />
          <h2 className="text-xl font-semibold mb-2">Connecting to Ground Station</h2>
          <p className="text-muted-foreground">Establishing telemetry link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <Satellite className="w-10 h-10 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
              Environmental Monitor Pro
            </h1>
          </div>
          <p className="text-muted-foreground">
            ESP8266 Ground Station v2.0 • Professional Edition
          </p>
        </header>

        {/* Status Bar */}
        <StatusBar
          health={data.health_text}
          healthClass={data.health_class}
          profile={data.profile_name}
          uptime={data.uptime}
          runtime={data.runtime_text}
          isConnected={isConnected}
        />

        {/* Main Sensor Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <SensorCard
            icon={<Thermometer className="text-red-400" />}
            label="Temperature"
            value={data.temperature.toFixed(1)}
            unit="°C"
            source="BMP180"
            accentColor="red"
            miniChart={
              history && <MiniSparkline data={history.temperature} color="#f87171" />
            }
          />
          
          <SensorCard
            icon={<Droplets className="text-cyan-400" />}
            label="Humidity"
            value={data.humidity.toFixed(0)}
            unit="%"
            source="DHT11"
            accentColor="cyan"
          />
          
          <SensorCard
            icon={<Gauge className="text-green-400" />}
            label="Pressure"
            value={data.pressure.toFixed(1)}
            unit="hPa"
            source="BMP180"
            trend={getTrendDirection(data.trend)}
            trendText={data.trend_text}
            accentColor="green"
            miniChart={
              history && <MiniSparkline data={history.pressure} color="#4ade80" />
            }
          />
          
          <SensorCard
            icon={<Mountain className="text-purple-400" />}
            label="Altitude"
            value={data.altitude.toFixed(0)}
            unit="m"
            source="BMP180"
            accentColor="purple"
          />
        </div>

        {/* Battery and System Stats Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
          <BatteryGauge
            voltage={data.battery}
            percent={data.battery_percent}
            runtime={data.runtime_text}
          />
          
          <div className="lg:col-span-2">
            <SystemStatsCard
              cpuLoad={data.cpu_load}
              freeHeap={data.free_heap}
              heapPercent={data.heap_percent}
              wifiRssi={data.wifi_rssi}
              wifiQuality={data.wifi_quality}
            />
          </div>
        </div>

        {/* History Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          {history && (
            <>
              <HistoryChart
                title="Temperature History"
                data={history.temperature}
                color="#f87171"
                gradientId="tempGradient"
                unit="°C"
              />
              
              <HistoryChart
                title="Pressure History"
                data={history.pressure}
                color="#4ade80"
                gradientId="pressGradient"
                unit=" hPa"
                decimals={1}
              />
            </>
          )}
        </div>

        {/* Battery History Chart */}
        {history && (
          <div className="mb-6">
            <HistoryChart
              title="Battery Voltage History"
              data={history.battery}
              color="#fbbf24"
              gradientId="batteryGradient"
              unit="V"
              decimals={2}
            />
          </div>
        )}

        {/* Control Panel */}
        <ControlPanel
          currentProfile={data.profile}
          onProfileChange={(profile) => sendCommand('profile', profile)}
          onToggleOLED={() => sendCommand('oled_toggle')}
          onCalibrate={calibrate}
          onRestart={restart}
          history={history}
        />

        {/* Footer */}
        <footer className="mt-8 text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Settings className="w-4 h-4" />
            <span>Last updated: {lastUpdate?.toLocaleTimeString() || '--'}</span>
          </div>
          <p className="opacity-60">
            ESP8266 Environmental Monitoring System • Hardware: BMP180 + DHT11 + SSD1306 OLED
          </p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
