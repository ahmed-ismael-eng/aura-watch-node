import { useState } from 'react';
import { 
  Zap, 
  Scale, 
  Battery, 
  Monitor, 
  RefreshCw, 
  Target, 
  Download,
  Power
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { HistoryData } from '@/types/sensor';

interface ControlPanelProps {
  currentProfile: number;
  onProfileChange: (profile: number) => void;
  onToggleOLED: () => void;
  onCalibrate: () => void;
  onRestart: () => void;
  history: HistoryData | null;
}

const profiles = [
  { id: 0, name: 'Performance', icon: Zap, description: 'Max refresh rate' },
  { id: 1, name: 'Balanced', icon: Scale, description: 'Optimal balance' },
  { id: 2, name: 'Ultra Low Power', icon: Battery, description: 'Battery saver' }
];

export function ControlPanel({
  currentProfile,
  onProfileChange,
  onToggleOLED,
  onCalibrate,
  onRestart,
  history
}: ControlPanelProps) {
  const [isRestarting, setIsRestarting] = useState(false);
  const [isCalibrating, setIsCalibrating] = useState(false);

  const handleRestart = async () => {
    if (confirm('Restart ESP8266?')) {
      setIsRestarting(true);
      await onRestart();
      setTimeout(() => setIsRestarting(false), 5000);
    }
  };

  const handleCalibrate = async () => {
    if (confirm('Calibrate altitude to current location?')) {
      setIsCalibrating(true);
      await onCalibrate();
      setTimeout(() => setIsCalibrating(false), 2000);
    }
  };

  const handleDownload = () => {
    if (!history) return;
    
    const csvContent = [
      'Index,Temperature (°C),Pressure (hPa),Battery (V)',
      ...history.temperature.map((temp, i) => 
        `${i},${temp.toFixed(2)},${history.pressure[i]?.toFixed(2) || ''},${history.battery[i]?.toFixed(3) || ''}`
      )
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sensor_history_${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="chart-container">
      <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
        <Power className="w-5 h-5 text-primary" />
        Control Panel
      </h2>

      {/* Power Profiles */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Power Profile
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {profiles.map((profile) => {
            const Icon = profile.icon;
            return (
              <button
                key={profile.id}
                onClick={() => onProfileChange(profile.id)}
                className={cn(
                  'control-button flex flex-col items-center gap-2 py-4',
                  currentProfile === profile.id && 'active'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="font-semibold">{profile.name}</span>
                <span className="text-xs opacity-70">{profile.description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Display Control */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Display Control
        </h3>
        <button onClick={onToggleOLED} className="control-button flex items-center gap-2">
          <Monitor className="w-4 h-4" />
          Toggle OLED
        </button>
      </div>

      {/* Calibration & System */}
      <div className="mb-6">
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Calibration & System
        </h3>
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={handleCalibrate} 
            disabled={isCalibrating}
            className={cn('control-button flex items-center gap-2', isCalibrating && 'opacity-50')}
          >
            <Target className={cn('w-4 h-4', isCalibrating && 'animate-spin')} />
            {isCalibrating ? 'Calibrating...' : 'Calibrate Altitude'}
          </button>
          
          <button 
            onClick={handleRestart}
            disabled={isRestarting}
            className={cn('control-button flex items-center gap-2', isRestarting && 'opacity-50')}
          >
            <RefreshCw className={cn('w-4 h-4', isRestarting && 'animate-spin')} />
            {isRestarting ? 'Restarting...' : 'Restart ESP8266'}
          </button>
        </div>
      </div>

      {/* Data Export */}
      <div>
        <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider mb-3">
          Data Export
        </h3>
        <button 
          onClick={handleDownload}
          disabled={!history}
          className={cn('control-button flex items-center gap-2', !history && 'opacity-50')}
        >
          <Download className="w-4 h-4" />
          Download History (CSV)
        </button>
      </div>
    </div>
  );
}
