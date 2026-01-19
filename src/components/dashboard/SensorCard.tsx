import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SensorCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  unit: string;
  source?: string;
  trend?: 'up' | 'down' | 'stable';
  trendText?: string;
  className?: string;
  accentColor?: 'cyan' | 'purple' | 'green' | 'orange' | 'red' | 'blue';
  miniChart?: ReactNode;
}

const accentStyles = {
  cyan: 'from-cyan-500/20 to-transparent border-t-cyan-500',
  purple: 'from-purple-500/20 to-transparent border-t-purple-500',
  green: 'from-green-500/20 to-transparent border-t-green-500',
  orange: 'from-orange-500/20 to-transparent border-t-orange-500',
  red: 'from-red-500/20 to-transparent border-t-red-500',
  blue: 'from-blue-500/20 to-transparent border-t-blue-500',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  stable: '→'
};

export function SensorCard({
  icon,
  label,
  value,
  unit,
  source,
  trend,
  trendText,
  className,
  accentColor = 'cyan',
  miniChart
}: SensorCardProps) {
  return (
    <div 
      className={cn(
        'sensor-card group relative overflow-hidden',
        className
      )}
    >
      {/* Gradient overlay */}
      <div className={cn(
        'absolute inset-0 bg-gradient-to-b opacity-50',
        accentStyles[accentColor]
      )} />
      
      {/* Top accent line */}
      <div className={cn(
        'absolute top-0 left-0 right-0 h-0.5',
        `bg-${accentColor}-500`
      )} 
      style={{ 
        background: `linear-gradient(90deg, transparent, hsl(var(--primary)), transparent)` 
      }}
      />
      
      <div className="relative z-10">
        {/* Icon */}
        <div className="text-3xl mb-3 transform group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        
        {/* Label */}
        <div className="text-xs uppercase tracking-wider text-muted-foreground font-medium mb-2">
          {label}
        </div>
        
        {/* Value */}
        <div className="flex items-baseline gap-2 mb-1">
          <span className="value-display">{value}</span>
          {trend && (
            <span className={cn(
              'text-xl font-bold',
              trend === 'up' && 'text-green-400',
              trend === 'down' && 'text-red-400',
              trend === 'stable' && 'text-muted-foreground'
            )}>
              {trendIcons[trend]}
            </span>
          )}
        </div>
        
        {/* Unit */}
        <div className="text-sm text-muted-foreground">
          {unit}
        </div>
        
        {/* Trend text */}
        {trendText && (
          <div className="text-xs text-muted-foreground mt-1">
            {trendText}
          </div>
        )}
        
        {/* Source */}
        {source && (
          <div className="text-[10px] text-muted-foreground/60 mt-2 font-mono">
            from {source}
          </div>
        )}
        
        {/* Mini chart */}
        {miniChart && (
          <div className="mt-3 -mx-2">
            {miniChart}
          </div>
        )}
      </div>
    </div>
  );
}
