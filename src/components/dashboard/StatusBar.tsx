import { cn } from '@/lib/utils';
import { Wifi, Clock, Battery, Activity } from 'lucide-react';

interface StatusBarProps {
  health: string;
  healthClass: string;
  profile: string;
  uptime: number;
  runtime: string;
  ipAddress?: string;
  isConnected: boolean;
}

function formatUptime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m ${secs}s`;
}

export function StatusBar({
  health,
  healthClass,
  profile,
  uptime,
  runtime,
  ipAddress = 'Demo Mode',
  isConnected
}: StatusBarProps) {
  return (
    <div className="glass-card p-4 mb-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Health Status */}
        <div className="flex items-center gap-3">
          <div className={cn(
            'status-indicator',
            healthClass === 'normal' && 'status-normal',
            healthClass === 'degraded' && 'status-degraded',
            healthClass === 'critical' && 'status-critical'
          )} />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Health</span>
            <span className="text-sm font-semibold">{health}</span>
          </div>
        </div>
        
        {/* Profile */}
        <div className="flex items-center gap-3">
          <Activity className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Profile</span>
            <span className="text-sm font-semibold">{profile}</span>
          </div>
        </div>
        
        {/* Uptime */}
        <div className="flex items-center gap-3">
          <Clock className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Uptime</span>
            <span className="text-sm font-semibold font-mono">{formatUptime(uptime)}</span>
          </div>
        </div>
        
        {/* Runtime */}
        <div className="flex items-center gap-3">
          <Battery className="w-4 h-4 text-primary" />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">Runtime</span>
            <span className="text-sm font-semibold">{runtime}</span>
          </div>
        </div>
        
        {/* Connection */}
        <div className="flex items-center gap-3">
          <Wifi className={cn(
            'w-4 h-4',
            isConnected ? 'text-green-500' : 'text-red-500'
          )} />
          <div className="flex flex-col">
            <span className="text-xs text-muted-foreground uppercase tracking-wider">IP</span>
            <span className="text-sm font-semibold font-mono">{ipAddress}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
