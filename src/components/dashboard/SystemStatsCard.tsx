import { cn } from '@/lib/utils';
import { Cpu, HardDrive, Wifi, Signal } from 'lucide-react';

interface SystemStatsCardProps {
  cpuLoad: number;
  freeHeap: number;
  heapPercent: number;
  wifiRssi: number;
  wifiQuality: number;
}

interface GaugeProps {
  value: number;
  max: number;
  label: string;
  icon: React.ReactNode;
  suffix?: string;
  colorClass?: string;
}

function CircularGauge({ value, max, label, icon, suffix = '%', colorClass }: GaugeProps) {
  const percentage = Math.min((value / max) * 100, 100);
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (colorClass) return colorClass;
    if (percentage < 50) return 'text-green-500';
    if (percentage < 80) return 'text-yellow-500';
    return 'text-red-500';
  };

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-24 h-24">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="text-secondary"
          />
          <circle
            cx="48"
            cy="48"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className={cn('transition-all duration-500', getColor())}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-muted-foreground mb-1">{icon}</span>
          <span className="font-mono font-bold text-lg">{value}{suffix}</span>
        </div>
      </div>
      <span className="text-xs text-muted-foreground mt-2 uppercase tracking-wider">{label}</span>
    </div>
  );
}

export function SystemStatsCard({
  cpuLoad,
  freeHeap,
  heapPercent,
  wifiRssi,
  wifiQuality
}: SystemStatsCardProps) {
  return (
    <div className="chart-container">
      <h3 className="text-lg font-semibold mb-6">System Statistics</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <CircularGauge
          value={Math.round(cpuLoad)}
          max={100}
          label="CPU Load"
          icon={<Cpu className="w-4 h-4" />}
        />
        
        <CircularGauge
          value={heapPercent}
          max={100}
          label="Memory"
          icon={<HardDrive className="w-4 h-4" />}
        />
        
        <CircularGauge
          value={wifiQuality}
          max={100}
          label="WiFi"
          icon={<Wifi className="w-4 h-4" />}
          colorClass={wifiQuality > 60 ? 'text-green-500' : wifiQuality > 30 ? 'text-yellow-500' : 'text-red-500'}
        />
        
        <div className="flex flex-col items-center justify-center">
          <Signal className="w-6 h-6 text-muted-foreground mb-2" />
          <span className="font-mono font-bold text-lg">{wifiRssi}</span>
          <span className="text-xs text-muted-foreground">dBm</span>
          <span className="text-xs text-muted-foreground mt-1 uppercase tracking-wider">RSSI</span>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-secondary/30 rounded-lg">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Free Heap:</span>
          <span className="font-mono font-semibold">{(freeHeap / 1024).toFixed(1)} KB</span>
        </div>
      </div>
    </div>
  );
}
