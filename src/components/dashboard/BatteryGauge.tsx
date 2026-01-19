import { cn } from '@/lib/utils';

interface BatteryGaugeProps {
  voltage: number;
  percent: number;
  runtime: string;
}

export function BatteryGauge({ voltage, percent, runtime }: BatteryGaugeProps) {
  const getColor = () => {
    if (percent > 60) return 'text-green-500';
    if (percent > 30) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getGradient = () => {
    if (percent > 60) return 'from-green-500 to-green-400';
    if (percent > 30) return 'from-yellow-500 to-yellow-400';
    return 'from-red-500 to-red-400';
  };

  return (
    <div className="sensor-card">
      <div className="relative z-10">
        <div className="text-3xl mb-3">🔋</div>
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          Battery
        </div>
        
        {/* Battery icon visual */}
        <div className="relative w-full h-8 bg-secondary/50 rounded-lg overflow-hidden mb-3">
          <div 
            className={cn(
              'absolute left-0 top-0 bottom-0 bg-gradient-to-r transition-all duration-500',
              getGradient()
            )}
            style={{ width: `${percent}%` }}
          />
          <div className="absolute inset-0 flex items-center justify-center font-mono font-bold text-sm">
            {percent}%
          </div>
        </div>
        
        <div className="flex items-baseline gap-2 mb-1">
          <span className={cn('font-mono text-3xl font-bold', getColor())}>
            {voltage.toFixed(2)}
          </span>
          <span className="text-lg text-muted-foreground">V</span>
        </div>
        
        <div className="text-xs text-muted-foreground mt-2">
          Est. runtime: <span className="font-semibold">{runtime}</span>
        </div>
      </div>
    </div>
  );
}
